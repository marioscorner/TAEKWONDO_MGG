import API from "./api";
import type { Conversation, Message, MessagesPage } from "@/types/chat";

// Conversaciones
export async function listConversations() {
  const res = await API.get("/chat/conversations");
  return res.data as Conversation[];
}

export async function createOneToOne(otherUserId: number) {
  const res = await API.post("/chat/conversations", {
    is_group: false,
    users: [otherUserId],
  });
  return res.data as Conversation;
}

export async function getConversation(id: number): Promise<Conversation> {
  const res = await API.get(`/chat/conversations/${id}`);
  return res.data as Conversation;
}

// Mensajes (con paginación simple)
export async function listMessages(conversationId: number, page: number = 1): Promise<Message[]> {
  const res = await API.get(`/chat/conversations/${conversationId}/messages`, {
    params: { page, page_size: 50 }
  });
  const data = res.data;
  if (data && Array.isArray(data.results)) {
    return data.results as Message[];
  }
  return [];
}

// Paginación mejorada (compatible con el backend)
export async function listMessagesPage(
  conversationId: number,
  params?: { page?: number; page_size?: number }
): Promise<MessagesPage> {
  const res = await API.get(`/chat/conversations/${conversationId}/messages`, {
    params: { 
      page: params?.page ?? 1, 
      page_size: params?.page_size ?? 50 
    },
  });
  
  // Nuestro backend devuelve { results, count, page, page_size }
  // Lo adaptamos al formato esperado
  return {
    results: res.data?.results ?? [],
    next: null, // Por ahora no usamos cursor, sino paginación simple
    previous: null,
  };
}

export async function sendMessage(conversationId: number, content: string) {
  const res = await API.post(`/chat/conversations/${conversationId}/messages`, { content });
  return res.data as Message;
}

export async function markConversationRead(conversationId: number) {
  const res = await API.post(`/chat/conversations/${conversationId}/read`);
  return res.data;
}

export async function markConversationUnread(conversationId: number) {
  const res = await API.delete(`/chat/conversations/${conversationId}/read`);
  return res.data;
}
