import { Server } from "socket.io";

let io;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req, res) {
  if (!io) {
    io = new Server(res.socket.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    const emailToSocketIdMap = new Map();
    const socketidToEmailMap = new Map();

    io.on("connection", (socket) => {
      console.log("Socket connected", socket.id);

      socket.on("room:join", (data) => {
        console.log(data);
        const { email, roomId } = data;
        emailToSocketIdMap.set(email, socket.id);
        socketidToEmailMap.set(socket.id, email);
        io.to(roomId).emit("user:joined", { email, id: socket.id });
        socket.join(roomId);
        io.to(socket.id).emit("room:join", data);
      });

      socket.on("user:call", ({ to, offer }) => {
        io.to(to).emit("incoming:call", { from: socket.id, offer });
      });

      socket.on("call:accepted", ({ to, answer }) => {
        io.to(to).emit("call:accepted", { from: socket.id, answer });
      });

      socket.on("peer:nego:needed", ({ to, offer }) => {
        io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
      });

      socket.on("peer:nego:done", ({ to, answer }) => {
        io.to(to).emit("peer:nego:final", { from: socket.id, answer });
      });
    });
  }

  res.end();
}
