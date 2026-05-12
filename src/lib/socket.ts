import type { Server } from "socket.io";

type RealtimeServer = Server | undefined;

declare global {
  var __taekwondoIO: RealtimeServer;
}

export function setSocketServer(io: Server) {
  globalThis.__taekwondoIO = io;
}

export function getSocketServer() {
  return globalThis.__taekwondoIO;
}

export function emitToConversation(conversationId: number, event: string, payload: unknown) {
  globalThis.__taekwondoIO?.to(`conversation:${conversationId}`).emit(event, payload);
}
