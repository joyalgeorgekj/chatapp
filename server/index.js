const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);

// Socket.IO server
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

// HTTP health check
app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

// Socket logic (GLOBAL CHAT)
io.on("connection", (socket) => {
  // Receive message from any client
  socket.on("chat:message", (message) => {
    const payload = {
      id: crypto.randomUUID(),
      text: message.text,
      sender: message.from,
      time: Date.now(),
    };

    // Broadcast to everyone INCLUDING sender
    io.emit("chat:message", payload);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});



httpServer.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
