const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors")
const axios = require("axios");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:4200", // Permite solicitudes desde el puerto 4200
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  },
});

app.use(cors()); // Habilita CORS para todas las rutas
app.use(express.json());

// URL del webhook en server2.js
const webhookUrl = "http://localhost:3001/webhook";

// Almacena mensajes
let messages = [];
let connectedUsers = {};

// Configuración de Socket.IO
io.on("connection", (socket) => {
  console.log("Usuario conectado");

  // Envía los mensajes existentes al usuario conectado
  socket.emit("loadMessages", messages);

  // Escucha el evento de 'userConnected' con el nombre del usuario
  socket.on('userConnected', async (username) => {
    connectedUsers[socket.id] = username; // Asocia el nombre de usuario al socket ID
    // Emite a todos los clientes que el usuario se ha conectado
    socket.broadcast.emit('userConnected', `${username} se ha conectado`);

     // Envía un webhook a server2.js
     try {
      await axios.post(webhookUrl, { event: "userConnected", username });
    } catch (error) {
      console.error("Error al enviar el webhook de conexión:", error.message);
    }
  });

  // Escucha y difunde nuevos mensajes
  socket.on("newMessage", async (msg) => {
    messages.push(msg);
    socket.broadcast.emit("newMessage", msg);

    // Envía un webhook a server2.js para el nuevo mensaje
    try {
      await axios.post(webhookUrl, { event: "newMessage", message: msg });
    } catch (error) {
      console.error("Error al enviar el webhook de mensaje:", error.message);
    }
  });

  // Escucha el evento de 'disconnect' para manejar la desconexión
  socket.on("disconnect", async () => {
    const username = connectedUsers[socket.id]; // Obtiene el nombre del usuario desconectado
    delete connectedUsers[socket.id]; // Elimina al usuario de la lista de conectados

    if (username) {
      console.log(`Usuario desconectado: ${username}`);
      try {
        await axios.post(webhookUrl, { event: "userDisconnected", username });
      } catch (error) {
        console.error("Error al enviar el webhook de desconexión:", error.message);
      }
    }
  });
});

// Inicia el servidor en el puerto 3000
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

