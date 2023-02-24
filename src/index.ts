import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import prisma from './lib/prisma';
import cors from 'cors';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
app.use(cors())
app.get("/", async (req, res) => {
  const messages = await prisma.message.findMany({});

  res.send({ message: `Bievenue sur l'API de Chat Now, il y a actuellement ${messages.length} messages - reworked abcdefgh` })
})

io.on('connection', async (socket: Socket) => {
  console.log('a user connected');

  const messages = await prisma.message.findMany({
    orderBy: {
      dateCreated: "desc"
    }
  });

  socket.emit('init-data', messages)

  socket.on('message', async (data: string) => {
    const dataParsed: {
      img: string;
      pseudo: string;
      message: string;
    } = JSON.parse(data);

    // Add message to the database
    await prisma.message.create({
      data: {
        img: dataParsed.img,
        pseudo: dataParsed.pseudo,
        message: dataParsed.message
      }
    })
    // Emit messages to the sockets
    io.emit('message', dataParsed);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(3001, () => {
  console.log('listening on *:3001');
});
