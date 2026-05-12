"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { listConversations, markConversationUnread } from "@/lib/chat";
import { Friends } from "@/lib/friends";
import API from "@/lib/api";
import type { Conversation } from "@/types/chat";
import { MessageCircle, RefreshCw, Search, Users } from "lucide-react";

type Friend = {
  id: number;
  friend: {
    id: number;
    username: string;
    email: string;
  };
};

export default function ChatsPage() {
  const { user } = useAuth();
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Buscador de amigos para iniciar chat
  const [friendSearch, setFriendSearch] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [showFriendResults, setShowFriendResults] = useState(false);

  // Cargar conversaciones
  const loadConversations = useCallback(async () => {
    try {
      const data: Conversation[] = await listConversations();
      
      // Ordenar por más reciente (última actividad)
      const sorted = data.sort((a, b) => {
        const dateA = a.last_message?.created_at || a.created_at;
        const dateB = b.last_message?.created_at || b.created_at;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
      
      setConvs(sorted);
      setError(null);
    } catch {
      setError("No se pudieron cargar las conversaciones.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar conversaciones al montar
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Cargar amigos al montar
  useEffect(() => {
    const loadFriends = async () => {
      try {
        const res = await Friends.list({ page_size: 100 });
        const friendsList = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        setFriends(friendsList);
      } catch (error) {
        console.error("Error al cargar amigos:", error);
      }
    };
    loadFriends();
  }, []);

  // Auto-refresh cada 5 segundos
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      loadConversations();
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loadConversations]);


  // Filtrar amigos según búsqueda
  const filteredFriends = useMemo(() => {
    if (!friendSearch || friendSearch.length < 2) return [];
    return friends
      .filter(f => f.friend.username.toLowerCase().includes(friendSearch.toLowerCase()))
      .slice(0, 5);
  }, [friendSearch, friends]);

  // Iniciar chat con amigo
  const startChatWithFriend = async (friendId: number) => {
    try {
      const res = await API.post('/chat/conversations', {
        is_group: false,
        users: [friendId]
      });
      window.location.href = `/dashboard/chats/${res.data.id}`;
    } catch {
      alert('Error al crear chat');
    }
  };

  // Marcar conversación como no leída
  const handleMarkUnread = async (e: React.MouseEvent, conversationId: number) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await markConversationUnread(conversationId);
      await loadConversations(); // Recargar lista
    } catch (error) {
      console.error('Error al marcar como no leído:', error);
      alert('Error al marcar como no leído');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-slate-950 to-red-900 p-6 text-white shadow-martial sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <div className="mb-3 inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-red-100">Chat</div>
          <h1 className="text-3xl font-bold tracking-tight">Conversaciones</h1>
          <p className="mt-2 text-sm text-red-50">Mensajes actualizados por polling cada 5 segundos.</p>
        </div>
        <button
          onClick={loadConversations}
          disabled={loading}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-50 disabled:opacity-50"
        >
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Cargando..." : "Actualizar"}
        </button>
      </div>

      {/* Barra superior: Buscador y botón crear grupo */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={friendSearch}
            onChange={(e) => {
              setFriendSearch(e.target.value);
              setShowFriendResults(e.target.value.length >= 2);
            }}
            onFocus={() => setShowFriendResults(friendSearch.length >= 2)}
            onBlur={() => setTimeout(() => setShowFriendResults(false), 200)}
            placeholder="Buscar amigo para chatear..."
            className="min-h-12 w-full rounded-xl border-2 border-slate-200 bg-white px-11 py-3 text-slate-950 outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-red-500 dark:focus:ring-red-950/40"
          />
          {showFriendResults && filteredFriends.length > 0 && (
              <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
              {filteredFriends.map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    startChatWithFriend(f.friend.id);
                    setFriendSearch("");
                    setShowFriendResults(false);
                  }}
                  className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left text-slate-950 last:border-b-0 hover:bg-red-50 dark:border-slate-800 dark:text-white dark:hover:bg-red-950/30"
                >
                  <span className="font-medium">{f.friend.username}</span>
                  <span className="text-sm font-semibold text-red-700 dark:text-red-300">Abrir chat</span>
                </button>
              ))}
            </div>
          )}
          {showFriendResults && filteredFriends.length === 0 && friendSearch.length >= 2 && (
            <div className="absolute z-10 mt-2 w-full rounded-xl border border-slate-200 bg-white p-4 text-center text-slate-500 shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              No se encontraron amigos
            </div>
          )}
        </div>
        <Link
          href="/dashboard/chats/create-group"
          className="inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
        >
          <Users className="size-4" /> Crear grupo
        </Link>
      </div>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {!loading && !error && convs.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          <p className="mb-2">Aún no tienes conversaciones.</p>
          <p className="text-sm">Añade amigos para comenzar a chatear.</p>
        </div>
      )}

      {!loading && !error && convs.length > 0 && (
        <div className="space-y-3">
          {convs.map((c) => {
            const title = c.is_group
              ? c.name || `Grupo #${c.id}`
              : c.participants
                  .map((p) => p.user.username)
                  .filter((u) => u !== user?.username)
                  .join(", ");

            return (
              <div
                key={c.id}
                className="group relative flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-red-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-red-900"
              >
                <Link
                  href={`/dashboard/chats/${c.id}`}
                  className="flex items-center justify-between gap-4 min-w-0 flex-1"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="grid size-11 shrink-0 place-items-center rounded-full bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300">
                        <MessageCircle className="size-5" />
                      </div>
                      <div className="min-w-0">
                    <div className="truncate font-bold text-slate-950 dark:text-white">{title}</div>
                    {c.last_message && (
                      <div className="truncate text-sm text-slate-500 dark:text-slate-400">
                        {c.last_message.sender.username}: {c.last_message.content}
                      </div>
                    )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {c.unread_count > 0 && (
                      <span className="rounded-full bg-red-700 px-2.5 py-1 text-xs font-bold text-white dark:bg-red-600">
                        {c.unread_count}
                      </span>
                    )}
                    <span className="whitespace-nowrap text-xs text-slate-400 dark:text-slate-500">
                      {c.last_message
                        ? formatTimeAgo(new Date(c.last_message.created_at))
                        : ""}
                    </span>
                  </div>
                </Link>
                
                {/* Botón para marcar como no leído */}
                <button
                  onClick={(e) => handleMarkUnread(e, c.id)}
                  className="hidden rounded-lg px-2 py-1 text-xs text-slate-500 transition-all hover:bg-red-50 hover:text-red-700 dark:text-slate-400 dark:hover:bg-red-950/30 dark:hover:text-red-300 sm:block sm:opacity-0 sm:group-hover:opacity-100"
                  title="Marcar como no leído"
                >
                  🔖
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Helper para formatear "hace X minutos"
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Ahora";
  if (diffMins < 60) return `Hace ${diffMins}m`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}
