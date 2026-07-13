const { createServer } = require("node:http");
const next = require("next");
const { loadEnvConfig } = require("@next/env");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
loadEnvConfig(process.cwd(), dev);

const hostname = process.env.BIND_HOST || "0.0.0.0";
const port = Number(process.env.PORT || 3000);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

async function verifyAccessToken(token) {
  const { jwtVerify } = await import("jose");
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret-change-me");
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

app.prepare().then(() => {
  const server = createServer((req, res) => handle(req, res));
  const io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${port}`,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  global.__taekwondoIO = io;

  io.use(async (socket, nextMiddleware) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return nextMiddleware(new Error("Authentication required"));
      socket.data.user = await verifyAccessToken(token);
      return nextMiddleware();
    } catch {
      return nextMiddleware(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("conversation:join", (conversationId) => {
      if (Number.isFinite(Number(conversationId))) {
        socket.join(`conversation:${Number(conversationId)}`);
      }
    });

    socket.on("conversation:leave", (conversationId) => {
      if (Number.isFinite(Number(conversationId))) {
        socket.leave(`conversation:${Number(conversationId)}`);
      }
    });

    socket.on("typing:start", ({ conversationId }) => {
      const id = Number(conversationId);
      if (!Number.isFinite(id)) return;
      socket.to(`conversation:${id}`).emit("typing.start", {
        by: socket.data.user?.userId,
        at: new Date().toISOString(),
      });
    });

    socket.on("typing:stop", ({ conversationId }) => {
      const id = Number(conversationId);
      if (!Number.isFinite(id)) return;
      socket.to(`conversation:${id}`).emit("typing.stop", {
        by: socket.data.user?.userId,
        at: new Date().toISOString(),
      });
    });

    socket.on("conversation:read", ({ conversationId }) => {
      const id = Number(conversationId);
      if (!Number.isFinite(id)) return;
      socket.to(`conversation:${id}`).emit("conversation.read", {
        by: socket.data.user?.userId,
        at: new Date().toISOString(),
      });
    });
  });

  server.listen(port, hostname, () => {
    const displayHost = hostname === "0.0.0.0" ? "localhost" : hostname;
    console.log(`> Ready on http://${displayHost}:${port}`);
  });
});
