import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer(handle);

    const io = new Server(httpServer, {
        cors: { origin: "*" },
        path: "/api/socketio",
    });

    // Store globally so server actions can access it
    globalThis.__io = io;

    io.on("connection", (socket) => {
        console.log(`[Socket.IO] Client connected: ${socket.id}`);

        // Join user notification room: "user:student:5" or "user:faculty:3"
        socket.on("join:user", ({ userId, userRole }) => {
            const room = `user:${userRole}:${userId}`;
            socket.join(room);
            console.log(`[Socket.IO] ${socket.id} joined room ${room}`);
        });

        // Join group discussion room: "group:12"
        socket.on("join:group", ({ groupId }) => {
            const room = `group:${groupId}`;
            socket.join(room);
            console.log(`[Socket.IO] ${socket.id} joined room ${room}`);
        });

        // Leave group room (when switching groups in faculty view)
        socket.on("leave:group", ({ groupId }) => {
            const room = `group:${groupId}`;
            socket.leave(room);
        });

        socket.on("disconnect", () => {
            console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
        });
    });

    httpServer.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
    });
});
