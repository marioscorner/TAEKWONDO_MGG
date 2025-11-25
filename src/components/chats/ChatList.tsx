// src/components/chats/ChatList.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listConversations } from "@/lib/chat";
import type { Conversation } from "@/types/chat";
import { useAuth } from "@/hooks/useAuth";

export default function ChatList() {
  const router = useRouter();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  async function loadConversations() {
    try {
      const data = await listConversations();
      setConversations(data);
    } catch (error) {
      console.error("Error al cargar conversaciones:", error);
    } finally {
      setLoading(false);
    }
  }

  function getConversationName(conv: Conversation): string {
    if (conv.is_group) {
      return conv.name || `Grupo #${conv.id}`;
    }
    
    // Para conversaciones 1:1, mostrar el nombre del otro usuario
    const otherUser = conv.participants.find((p) => p.user.username !== user?.username);
    return otherUser?.user.username || "Chat";
  }

  function getLastMessagePreview(conv: Conversation): string {
    if (!conv.last_message) return "Sin mensajes";
    const content = conv.last_message.content;
    return content.length > 50 ? `${content.substring(0, 50)}...` : content;
  }

  if (loading) {
    return <div className="p-6 text-center">Cargando conversaciones...</div>;
  }

  if (conversations.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        No tienes conversaciones aún. Envía una solicitud de amistad para comenzar a chatear.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conv) => (
        <button
          key={conv.id}
          onClick={() => router.push(`/dashboard/chats/${conv.id}`)}
          className="w-full text-left p-4 rounded-lg border hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold">{getConversationName(conv)}</h3>
            {conv.unread_count > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {conv.unread_count}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">{getLastMessagePreview(conv)}</p>
          {conv.last_message && (
            <p className="text-xs text-gray-400 mt-1">
              {new Date(conv.last_message.created_at).toLocaleString('es-ES', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          )}
        </button>
      ))}
    </div>
  );
}

