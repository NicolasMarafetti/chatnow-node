import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import prisma from './lib/prisma';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', async (socket: Socket) => {
  console.log('a user connected');

  const messages = await prisma.message.findMany({});

  socket.data.messages = JSON.stringify(messages);

  socket.on('message', async (message: string) => {
    console.log(`received message: ${message}`);

    // Emit messages to the sockets
    io.emit('message', message);

    // Add message to the database
    await prisma.message.create({
      data: {
        message: message
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