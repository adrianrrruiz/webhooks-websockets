const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios"); // Para enviar el webhook

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("../public"));
// Configura Express para manejar JSON
app.use(express.json());

// Almacena mensajes en un array para hacer pruebas
let messages = [];

// Ruta Webhook para recibir notificaciones de nuevos mensajes
app.post("/webhook", (req, res) => {
  const { message } = req.body;
  console.log("Webhook recibido:", message);
  messages.push(message); // Guarda el mensaje recibido
  res.status(200).send("Webhook recibido");
});

// Configuración de Socket.IO
io.on("connection", (socket) => {
  console.log("Usuario conectado");

  // Envía los mensajes existentes al nuevo usuario
  socket.emit("loadMessages", messages);

  // Escucha nuevos mensajes
  socket.on("newMessage", async (msg) => {
    messages.push(msg);
    io.emit("newMessage", msg); // Envía el mensaje a todos los usuarios conectados

    // Enviar el webhook cada vez que hay un nuevo mensaje
    try {
      await axios.post("http://localhost:3000/webhook", { message: msg });
    } catch (error) {
      console.error("Error al enviar el webhook:", error.message);
    }
  });

  // Desconexión del usuario
  socket.on("disconnect", () => {
    console.log("Usuario desconectado");
  });
});

// Iniciar el servidor en el puerto 3000
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
