const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Ruta para recibir el webhook de server.js
app.post("/webhook", (req, res) => {
  const { event, username, message } = req.body;

  // Maneja los eventos según el tipo de evento recibido
  switch (event) {
    case "userConnected":
      console.log(`¡${username} se ha conectado!`);
      // Aquí puedes agregar lógica adicional para cuando un usuario se conecta
      break;
    case "newMessage":
      console.log(`Nuevo mensaje de ${message.sender}: ${message.content}`);
      // Aquí puedes agregar lógica adicional para cuando llega un nuevo mensaje
      break;
    case "userDisconnected":
      console.log(`${username} se ha desconectado :(`);
      // Aquí puedes agregar lógica adicional para cuando un usuario se desconecta
      break;
    default:
      console.log("Evento desconocido recibido");
  }

  // Responde a server.js confirmando la recepción del webhook
  res.status(200).send("Evento de webhook recibido");
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server2 corriendo en http://localhost:${PORT}`);
});
