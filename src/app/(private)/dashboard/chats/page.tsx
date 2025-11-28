"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { listConversations } from "@/lib/chat";
import { Friends } from "@/lib/friends";
import API from "@/lib/api";
import type { Conversation } from "@/types/chat";

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
    } catch (e) {
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
    } catch (error) {
      alert('Error al crear chat');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Conversaciones</h1>
        <button
          onClick={loadConversations}
          disabled={loading}
          className="px-3 py-1 text-sm rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 text-gray-900 dark:text-white"
        >
          {loading ? "Cargando..." : "Actualizar"}
        </button>
      </div>

      {/* Barra superior: Buscador y botón crear grupo */}
      <div className="mb-6 flex gap-3">
        <div className="relative flex-1">
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
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          {showFriendResults && filteredFriends.length > 0 && (
            <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
              {filteredFriends.map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    startChatWithFriend(f.friend.id);
                    setFriendSearch("");
                    setShowFriendResults(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 last:border-b-0 text-gray-900 dark:text-white"
                >
                  <span className="font-medium">{f.friend.username}</span>
                  <span className="text-sm text-blue-600 dark:text-blue-400">💬 Abrir chat</span>
                </button>
              ))}
            </div>
          )}
          {showFriendResults && filteredFriends.length === 0 && friendSearch.length >= 2 && (
            <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 text-center text-gray-500 dark:text-gray-400">
              No se encontraron amigos
            </div>
          )}
        </div>
        <Link
          href="/dashboard/chats/create-group"
          className="px-4 py-3 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-lg font-medium whitespace-nowrap transition-colors"
        >
          👥 Crear Grupo
        </Link>
      </div>

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded bg-gray-100 dark:bg-gray-700" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {!loading && !error && convs.length === 0 && (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <p className="mb-2">Aún no tienes conversaciones.</p>
          <p className="text-sm">Añade amigos para comenzar a chatear.</p>
        </div>
      )}

      {!loading && !error && convs.length > 0 && (
        <div className="space-y-2">
          {convs.map((c) => {
            const title = c.is_group
              ? c.name || `Grupo #${c.id}`
              : c.participants
                  .map((p) => p.user.username)
                  .filter((u) => u !== user?.username)
                  .join(", ");

            return (
              <Link
                key={c.id}
                href={`/dashboard/chats/${c.id}`}
                className="flex items-center justify-between gap-4 rounded border border-gray-200 dark:border-gray-700 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 bg-white dark:bg-gray-800 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-gray-900 dark:text-white">{title}</div>
                  {c.last_message && (
                    <div className="truncate text-sm text-gray-500 dark:text-gray-400">
                      {c.last_message.sender.username}: {c.last_message.content}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {c.unread_count > 0 && (
                    <span className="rounded-full bg-blue-600 dark:bg-blue-500 px-2 py-0.5 text-xs font-semibold text-white">
                      {c.unread_count}
                    </span>
                  )}
                  <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                    {c.last_message
                      ? formatTimeAgo(new Date(c.last_message.created_at))
                      : ""}
                  </span>
                </div>
              </Link>
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
