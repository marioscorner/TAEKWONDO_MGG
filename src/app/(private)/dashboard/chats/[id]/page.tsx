// src/app/(private)/dashboard/chats/[id]/page.tsx  (REEMPLAZA)
// Añade: cursor pagination (Cargar más), typing indicator y soporte a seen_by_other si viene del backend.
"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useChatSocket } from "@/hooks/useChatSocket";
import { listMessages, listMessagesPage, markConversationRead, getConversation } from "@/lib/chat";
import type { Message, Conversation, MessagesPage } from "@/types/chat";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";

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
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">Cargando…</div>;
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
    <div className="flex h-[calc(100vh-7rem)] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-950 to-red-900 px-4 py-3 text-white dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/chats" className="grid size-10 place-items-center rounded-full bg-white/10 transition hover:bg-white/20" aria-label="Volver a conversaciones">
            <ArrowLeft className="size-5" />
          </Link>
          <h1 className="text-lg font-bold">{title}</h1>
        </div>
        <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-red-50">{connected ? "Conectado" : "Reconectando..."}</div>
      </div>

      {/* Mensajes */}
      <div ref={listRef} className="flex-1 space-y-3 overflow-auto bg-slate-50 p-4 dark:bg-slate-950/60">
        {/* Cargar más */}
        {nextCursor && (
          <div className="mb-2 flex justify-center">
            <button
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-red-50 hover:text-red-700 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800 dark:hover:bg-red-950/30"
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
              className={`max-w-[82%] rounded-2xl px-4 py-2.5 shadow-sm ${
                mine 
                  ? "ml-auto rounded-br-md bg-red-700 text-white dark:bg-red-600" 
                  : "rounded-bl-md bg-white text-slate-950 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800"
              }`}
            >
              {!mine && <div className="mb-1 text-xs font-semibold text-red-700 dark:text-red-300">{m.sender?.username}</div>}
              <div className="text-sm leading-6">{m.content}</div>
              
              {/* ✓✓ en 1:1 si el backend devuelve seen_by_other */}
              {typeof m.seen_by_other === "boolean" && mine && (
                <div className="mt-1 text-[10px] text-red-100">{m.seen_by_other ? "Visto ✓✓" : "Enviado"}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Typing indicator - solo mostrar si NO es el usuario actual escribiendo */}
      {typingIds.filter(id => id !== user?.id && id !== 0).length > 0 && (
        <div className="bg-slate-50 px-4 pb-2 text-xs text-slate-500 dark:bg-slate-950/60 dark:text-slate-400">Escribiendo…</div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
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
          className="min-h-11 flex-1 resize-none rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-slate-950 outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-red-500 dark:focus:ring-red-950/40"
        />
        <button
          onClick={handleSend}
          className="grid size-11 place-items-center rounded-xl bg-red-700 text-white transition hover:bg-red-900 dark:bg-red-600 dark:hover:bg-red-500"
          aria-label="Enviar mensaje"
        >
          <Send className="size-5" />
        </button>
      </div>
    </div>
  );
}
