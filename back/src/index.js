import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";

// inicializar servidor express
const app = express();

// inicializar servidor de sockets
const sv = createServer(app);
const io = new Server(sv, {
  cors: {
    origin: "*",
  },
});

const port = process.env.PORT || 3001;

// middlewares
app.use(express.json());
app.use(cors());

// endpoint de chequeo de salud del servidor
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ message: "ok" });
});

// SERVIDOR DE SOCKETS
// escucha nuevas conexiones
io.on("connection", (socket) => {
  console.log("user connected: " + socket.id);

  // escuchar evento join - el front lo usa para unirse a una sala
  socket.on("join", (room) => {
    socket.join(room);

    // escuchar evento message - el front lo usa para enviar un mensaje
    socket.on("message", (msg) => {
      // emitir evento newMessage a todos los sockets conectados a la sala
      io.to(room).emit("newMessage", { msg, room, id: socket.id });
    });
  });

  // escuchar evento de desconexion
  socket.on("disconnect", () => {});
});

sv.listen(port, () => console.log("Server is running on port: " + port));
