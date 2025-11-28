// src/app/(private)/dashboard/chats/[id]/page.tsx  (REEMPLAZA)
// Añade: cursor pagination (Cargar más), typing indicator y soporte a seen_by_other si viene del backend.
"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useChatSocket } from "@/hooks/useChatSocket";
import { listMessages, listMessagesPage, markConversationRead, getConversation } from "@/lib/chat";
import type { Message, Conversation, MessagesPage } from "@/types/chat";
import Link from "next/link";

type PageProps = { params: Promise<{ id: string }> };

export default function ChatDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const conversationId = Number(resolvedParams.id);
  const { user } = useAuth();

  const [conv, setConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [typingIds, setTypingIds] = useState<number[]>([]);
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [text, setText] = useState("");

  // WS
  const { connected, sendMessage, sendRead, setOnMessage, sendTypingStart, sendTypingStop } =
    useChatSocket(Number.isFinite(conversationId) ? conversationId : null);

  // Cargar conversación
  useEffect(() => {
    if (!Number.isFinite(conversationId)) return;
    let mounted = true;
    (async () => {
      try {
        const c = await getConversation(conversationId);
        if (mounted) setConv(c);
      } catch {
        if (mounted) setError("No se pudo cargar la conversación.");
      } finally {
        if (mounted) setLoadingConv(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [conversationId]);

  // Cargar mensajes (primer bloque)
  useEffect(() => {
    if (!Number.isFinite(conversationId)) return;
    let mounted = true;
    (async () => {
      try {
        // Intento con cursor
        const page: MessagesPage = await listMessagesPage(conversationId, { page_size: 30 });
        // Los mensajes vienen ordenados DESC (más recientes primero), los invertimos para mostrar más antiguos arriba
        const sorted = [...page.results].reverse();
        if (mounted) {
          setMessages(sorted);
          setNextCursor(page.next);
          
          // Actualizar último ID conocido
          if (asc.length > 0) {
            const lastMsg = asc[asc.length - 1];
            if (lastMsg.id) {
              (useChatSocket as any).lastMessageIdRef = lastMsg.id;
            }
          }
        }
        await markConversationRead(conversationId);
        
        // Scroll al final después de cargar
        setTimeout(() => {
          if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
          }
        }, 100);
      } catch {
        // Compat: si falla por cursor, usa la lista simple existente
        try {
          const data: Message[] = await listMessages(conversationId);
          // Ordenar por fecha ascendente (más antiguos primero)
          const sorted = [...data].sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
          if (mounted) {
            setMessages(sorted);
            
            // Scroll al final
            setTimeout(() => {
              if (listRef.current) {
                listRef.current.scrollTop = listRef.current.scrollHeight;
              }
            }, 100);
          }
          await markConversationRead(conversationId);
        } catch {
          if (mounted) setError("No se pudieron cargar los mensajes.");
        }
      } finally {
        if (mounted) setLoadingMsgs(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [conversationId]);

  // Cargar más (cursor)
  async function handleLoadMore() {
    if (!nextCursor) return;
    try {
      const res = await fetch(nextCursor, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access") || ""}` },
      });
      const page = (await res.json()) as MessagesPage;
      // Los mensajes antiguos van al principio
      const sorted = [...page.results].reverse();
      setMessages((prev) => [...sorted, ...prev]);
      setNextCursor(page.next);
    } catch {
      // noop
    }
  }

  // Polling: escuchar eventos en tiempo real
  useEffect(() => {
    setOnMessage((evt) => {
      if (evt.event === "message.new") {
        const newMessage = evt.message as Message;
        
        // Evitar duplicados
        setMessages((prev) => {
          const exists = prev.some(m => m.id === newMessage.id);
          if (exists) return prev;
          return [...prev, newMessage];
        });
        
        // Marcar como leído si no es tu mensaje
        if (newMessage.sender.id !== user?.id) {
          sendRead();
        }
        
        // Scroll al final
        setTimeout(() => {
          if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
          }
        }, 100);
      } else if (evt.event === "typing.start") {
        setTypingIds((prev) => (prev.includes(evt.by) ? prev : [...prev, evt.by]));
      } else if (evt.event === "typing.stop") {
        setTypingIds((prev) => prev.filter((id) => id !== evt.by));
      } else if (evt.event === "error") {
        setError(evt.detail || "Error en el chat.");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setOnMessage, user?.id]);

  // Título de cabecera
  const title = useMemo(() => {
    if (!conv) return "Cargando…";
    if (conv.is_group) return conv.name || `Grupo #${conv.id}`;
    const me = user?.username;
    return conv.participants
      .map((p) => p.user.username)
      .filter((u) => u !== me)
      .join(", ");
  }, [conv, user?.username]);

  // Enviar
  const handleSend = async () => {
    const v = text.trim();
    if (!v) return;
    setText("");
    if (user?.id) {
      sendTypingStop(user.id);
    }
    await sendMessage(v);
    
    // Scroll al final después de enviar
    setTimeout(() => {
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    }, 100);
  };

  if (!Number.isFinite(conversationId)) {
    return (
      <div className="rounded border border-red-200 bg-red-50 p-3 text-red-700">
        Conversación inválida.
      </div>
    );
  }

  if (loadingConv || loadingMsgs) {
    return <div className="p-6">Cargando…</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <Link href="/dashboard/chats" className="text-sm text-blue-600 underline">
          ← Volver
        </Link>
        <div className="mt-3 rounded border border-red-200 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-160px)] flex-col rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/chats" className="text-sm text-blue-600 dark:text-blue-400 underline">
            ← Volver
          </Link>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h1>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{connected ? "Conectado" : "Reconectando..."}</div>
      </div>

      {/* Mensajes */}
      <div ref={listRef} className="flex-1 space-y-2 overflow-auto p-4 bg-white dark:bg-gray-800">
        {/* Cargar más */}
        {nextCursor && (
          <div className="mb-2 flex justify-center">
            <button
              className="rounded bg-gray-100 dark:bg-gray-700 px-3 py-1.5 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100"
              onClick={handleLoadMore}
            >
              Cargar mensajes anteriores
            </button>
          </div>
        )}

        {messages.map((m) => {
          const mine = m.sender?.id === user?.id;
          return (
            <div
              key={m.id}
              className={`max-w-[80%] rounded px-3 py-2 ${
                mine 
                  ? "ml-auto bg-blue-50 dark:bg-blue-900/30 text-gray-900 dark:text-gray-100" 
                  : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              }`}
            >
              {!mine && <div className="text-xs text-gray-500 dark:text-gray-400">{m.sender?.username}</div>}
              <div>{m.content}</div>
              {/* ✓✓ en 1:1 si el backend devuelve seen_by_other */}
              {typeof m.seen_by_other === "boolean" && mine && (
                <div className="mt-1 text-[10px] text-gray-400 dark:text-gray-500">{m.seen_by_other ? "Visto ✓✓" : "Enviado"}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Typing indicator - solo mostrar si NO es el usuario actual escribiendo */}
      {typingIds.filter(id => id !== user?.id && id !== 0).length > 0 && (
        <div className="px-4 pb-2 text-xs text-gray-500 dark:text-gray-400">Escribiendo…</div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900">
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (e.target.value.trim() && user?.id) {
              sendTypingStart(user.id);
            } else if (user?.id) {
              sendTypingStop(user.id);
            }
          }}
          onFocus={() => sendRead()}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          rows={1}
          placeholder="Escribe un mensaje…"
          className="flex-1 resize-none rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
        />
        <button
          onClick={handleSend}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
