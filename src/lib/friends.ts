import API from "@/lib/api";

export const Friends = {
  // Lista de amigos (paginado)
  list: (params?: Record<string, unknown>) => API.get("/friends", { params }),
  unfriend: (userId: number) => API.post(`/friends/unfriend/${userId}`),

  // Solicitudes
  send: (to_user: number, message?: string) =>
    API.post("/friends/requests", { to_user, message }),
  mine: (box: "incoming" | "outgoing" | "all" = "incoming", params?: Record<string, unknown>) =>
    API.get("/friends/requests/mine", { params: { box, ...params } }),
  accept: (id: number) => API.post(`/friends/requests/${id}/accept`),
  reject: (id: number) => API.post(`/friends/requests/${id}/reject`),
  cancel: (id: number) => API.post(`/friends/requests/${id}/cancel`),

  // Bloqueos
  block: (userId: number) => API.post("/friends/block", { user_id: userId }),
  unblock: (userId: number) => API.delete(`/friends/block/${userId}`),
  blocked: (params?: Record<string, unknown>) => API.get("/friends/blocked", { params }),
};
