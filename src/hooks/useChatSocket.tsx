"use client";

import { useEffect, useRef, useState } from "react";

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

export function useChatSocket(conversationId: number | null) {
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!conversationId) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
    if (!token) return;

    // TODO: Implementar WebSocket real cuando se necesite
    // Por ahora, el chat funciona con polling/HTTP requests
    // const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // const wsUrl = `${wsProtocol}//${window.location.host}/ws/chat/${conversationId}/?token=${token}`;
    // const ws = new WebSocket(wsUrl);
    // wsRef.current = ws;

    // ws.onopen = () => setConnected(true);
    // ws.onclose = () => setConnected(false);
    // ws.onerror = () => setConnected(false);

    // return () => {
    //   ws.close();
    //   wsRef.current = null;
    // };
  }, [conversationId]);

  const sendMessage = (content: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ action: "message", content }));
  };

  const sendRead = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ action: "read" }));
  };

  const sendTypingStart = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ action: "typing.start" }));
  };

  const sendTypingStop = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ action: "typing.stop" }));
  };

  const setOnMessage = (handler: (evt: ChatEvent) => void) => {
    if (!wsRef.current) return;
    wsRef.current.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data?.event) handler(data as ChatEvent);
      } catch {}
    };
  };

  return { connected, sendMessage, sendRead, setOnMessage, sendTypingStart, sendTypingStop };
}
