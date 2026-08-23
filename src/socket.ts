import { Server } from "socket.io";
import { Server as HttpServer } from "http";

let io: Server;

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: { origin: "*" }, // tighten to your real frontend origin once it exists
  });

  io.on("connection", (socket) => {
    socket.on("join_match", (matchId: string) => {
      socket.join(`match:${matchId}`);
    });
    socket.on("leave_match", (matchId: string) => {
      socket.leave(`match:${matchId}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized — initSocket() must run before any emit.");
  return io;
};