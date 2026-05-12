"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, type Socket } from "socket.io-client";
import { sendMessage as sendMessageAPI, markConversationRead } from "@/lib/chat";

type BaseMessage = {
  id: number;
  content: string;
  created_at: string;
  sender: { id: number; username: string };
};

type ChatEvent =
  | { event: "message.new"; message: BaseMessage }
  | { event: "conversation.read"; by: number; at: string }
  | { event: "typing.start"; by: number; at?: string }
  | { event: "typing.stop"; by: number; at?: string }
  | { event: "error"; detail?: string };

/**
 * Hook para chat en tiempo real usando Socket.IO con fallback de polling.
 */
export function useChatSocket(conversationId: number | null) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageIdRef = useRef<number>(0);
  const messageHandlerRef = useRef<((evt: ChatEvent) => void) | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Polling para nuevos mensajes
  const pollMessages = useCallback(async () => {
    if (!conversationId || !messageHandlerRef.current) return;

    try {
      const response = await fetch(`/api/chat/conversations/${conversationId}/messages?page=1&page_size=50`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });

      if (!response.ok) return;

      const data = await response.json();
      const messages = data.results || [];

      // Detectar nuevos mensajes
      if (messages.length > 0) {
        const latestMessage = messages[messages.length - 1];
        
        if (latestMessage.id > lastMessageIdRef.current) {
          // Hay mensajes nuevos
          const newMessages = messages.filter((m: BaseMessage) => m.id > lastMessageIdRef.current);
          
          newMessages.forEach((msg: BaseMessage) => {
            messageHandlerRef.current?.({
              event: "message.new",
              message: msg,
            });
          });

          lastMessageIdRef.current = latestMessage.id;
        }
      }
    } catch (error) {
      console.error("Error al hacer fallback polling:", error);
    }
  }, [conversationId]);

  // Conectar socket cuando hay conversación activa. Si falla, se mantiene polling.
  useEffect(() => {
    if (!conversationId) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const token = localStorage.getItem("access");
    const socket = io(undefined, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;
    socket.emit("conversation:join", conversationId);

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", () => setConnected(false));
    socket.on("message.new", (message: BaseMessage) => {
      if (message.id > lastMessageIdRef.current) {
        lastMessageIdRef.current = message.id;
      }
      messageHandlerRef.current?.({ event: "message.new", message });
    });
    socket.on("conversation.read", (evt: { by: number; at: string }) => {
      messageHandlerRef.current?.({ event: "conversation.read", by: evt.by, at: evt.at });
    });
    socket.on("typing.start", (evt: { by: number; at?: string }) => {
      messageHandlerRef.current?.({ event: "typing.start", by: evt.by, at: evt.at });
    });
    socket.on("typing.stop", (evt: { by: number; at?: string }) => {
      messageHandlerRef.current?.({ event: "typing.stop", by: evt.by, at: evt.at });
    });

    intervalRef.current = setInterval(() => {
      if (!socket.connected) {
        pollMessages();
      }
    }, 5000);

    return () => {
      socket.emit("conversation:leave", conversationId);
      socket.disconnect();
      socketRef.current = null;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [conversationId, pollMessages]);

  const sendMessage = async (content: string) => {
    if (!conversationId) return;

    try {
      const message = await sendMessageAPI(conversationId, content);
      
      // Actualizar el último ID conocido
      if (message.id > lastMessageIdRef.current) {
        lastMessageIdRef.current = message.id;
      }

      if (!socketRef.current?.connected) {
        messageHandlerRef.current?.({
          event: "message.new",
          message: message as BaseMessage,
        });
      }
    } catch {
      messageHandlerRef.current?.({
        event: "error",
        detail: "Error al enviar mensaje",
      });
    }
  };

  const sendRead = async () => {
    if (!conversationId) return;
    try {
      await markConversationRead(conversationId);
      socketRef.current?.emit("conversation:read", { conversationId });
    } catch (error) {
      console.error("Error al marcar como leído:", error);
    }
  };

  const sendTypingStart = (userId: number) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    socketRef.current?.emit("typing:start", { conversationId, userId });

    // Auto-stop después de 3 segundos
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStop(userId);
    }, 3000);
  };

  const sendTypingStop = (userId: number) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    socketRef.current?.emit("typing:stop", { conversationId, userId });
  };

  const setOnMessage = (handler: (evt: ChatEvent) => void) => {
    messageHandlerRef.current = handler;
  };

  return { 
    connected, 
    sendMessage, 
    sendRead, 
    setOnMessage, 
    sendTypingStart: (userId: number) => sendTypingStart(userId), 
    sendTypingStop: (userId: number) => sendTypingStop(userId)
  };
}
