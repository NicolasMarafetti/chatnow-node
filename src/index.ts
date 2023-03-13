import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import prisma from './lib/prisma';
import cors from 'cors';
import { askGpt } from './utils/chatgpt';

import https from 'https';
import fs from "fs";

const app = express();

let listenPort: number = 3001;
let server;
let protocol = process.env.NODE_ENV === "development" ? "http" : "https";
if (process.env.NODE_ENV === "development") {
  server = http.createServer(app);
} else {
  server = https.createServer({
    key: fs.readFileSync('/etc/letsencrypt/live/chattyroom.ovh/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/chattyroom.ovh/fullchain.pem')
  }, app);
}

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
app.use(cors())
app.get("/api/", async (req, res) => {
  const messages = await prisma.message.findMany({});

  res.send({ message: `Bievenue sur l'API de Chat Now, il y a actuellement ${messages.length} messages.` })
})

// Test GPT
app.get("/api/gpt", async (req, res) => {
  const message = await askGpt("crée moi un template nextjs13 avec tailwind pour un espace membre");

  res.send({ message: `<pre>${message}</pre>` })
})

// Get Messages
app.get("/api/messages", async (req, res) => {
  const take = parseInt(req.query.take as string, 10);
  const skip = parseInt(req.query.skip as string, 10);

  const messages = await prisma.message.findMany({
    orderBy: {
      dateCreated: "desc"
    },
    take,
    skip
  })
  messages.reverse();

  const messageQuantity = await prisma.message.count();

  return res.status(200).json({
    messageQuantity,
    messages
  })
})

io.on('connection', async (socket: Socket) => {
  console.log('a user connected');

  let messages = await prisma.message.findMany({
    orderBy: {
      dateCreated: "desc"
    },
    take: 10
  });
  messages.reverse();

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

    // If the message begin with /gpt, we ask ChatGPT for an answer
    if (/^\/gpt/.test(dataParsed.message)) {
      const messageWithoutCommand = dataParsed.message.replace("/gpt ", "");

      const gptResponse = await askGpt(messageWithoutCommand);

      if (gptResponse) {
        const gptMessage = {
          img: "ChatGPT_logo.webp",
          pseudo: "ChatGPT",
          message: gptResponse
        }

        // Create the message in database
        await prisma.message.create({
          data: gptMessage
        })

        // Send message to users
        io.emit('message', gptMessage);
      }
    };
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(listenPort, () => {
  console.log(`listening on *:${listenPort}`);
  console.log(`protocol used is ${protocol}`)
});
