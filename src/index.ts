import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import prisma from './lib/prisma';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get("/", async (req, res) => {
  const messages = await prisma.message.findMany({});

  res.send({ message: `Bievenue sur l'API de Chat Now, il y a actuellement ${messages.length} messages` })
})

io.on('connection', async (socket: Socket) => {
  console.log('a user connected');

  const messages = await prisma.message.findMany({});

  socket.data.messages = JSON.stringify(messages);

  socket.on('message', async (data: string) => {
    const dataParsed: {
      img: string;
      pseudo: string;
      message: string;
    } = JSON.parse(data);

    console.log(`received message: ${dataParsed.message}`);

    // Emit messages to the sockets
    io.emit('message', data);

    // Add message to the database
    await prisma.message.create({
      data: {
        img: dataParsed.img,
        pseudo: dataParsed.pseudo,
        message: dataParsed.message
      }
    })
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(3001, () => {
  console.log('listening on *:3001');
});
