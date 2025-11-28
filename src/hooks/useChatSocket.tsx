"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
 * Hook para chat en tiempo real usando polling inteligente
 * Más confiable que WebSocket para MVP y funciona sin servidor custom
 */
export function useChatSocket(conversationId: number | null) {
  const [connected, setConnected] = useState(true); // Siempre "conectado" con polling
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
      console.error("Error al hacer polling:", error);
    }
  }, [conversationId]);

  // Iniciar polling cuando hay conversación activa
  useEffect(() => {
    if (!conversationId) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    setConnected(true);
    
    // Poll cada 2 segundos cuando el chat está abierto
    intervalRef.current = setInterval(pollMessages, 2000);

    return () => {
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

      // Disparar evento inmediatamente para el mensaje propio
      messageHandlerRef.current?.({
        event: "message.new",
        message: message as BaseMessage,
      });

      // Forzar un poll inmediato
      setTimeout(pollMessages, 100);
    } catch (error) {
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
    } catch (error) {
      console.error("Error al marcar como leído:", error);
    }
  };

  const sendTypingStart = () => {
    // Simular typing indicator localmente
    // En producción, esto se enviaría al servidor
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    messageHandlerRef.current?.({
      event: "typing.start",
      by: 0, // ID del usuario actual
    });

    // Auto-stop después de 3 segundos
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStop();
    }, 3000);
  };

  const sendTypingStop = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    messageHandlerRef.current?.({
      event: "typing.stop",
      by: 0,
    });
  };

  const setOnMessage = (handler: (evt: ChatEvent) => void) => {
    messageHandlerRef.current = handler;
  };

  return { 
    connected, 
    sendMessage, 
    sendRead, 
    setOnMessage, 
    sendTypingStart, 
    sendTypingStop 
  };
}
