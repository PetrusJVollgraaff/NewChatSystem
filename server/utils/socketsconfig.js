const socketIo = require("socket.io");
const { CheckOne_One, insertImageData } = require("../database/queries");
const db = require("../database/model");
const { thumbnailImage } = require("./thumbconvertor");
const { privateChat } = require("./privatechatsocket");
const { roomChat } = require("./roomchatsocket");

const clientArry = {};

function appendClient(data) {
  if (!clientArry[data.id]) {
    clientArry[data.id] = { username: data.username };
  }
}

function removeClient(data) {
  if (clientArry[data.id]) {
    delete clientArry[data.id];
  }
}

function setupSocket(server, allowedOrigin) {
  const io = socketIo(server, {
    cors: { origin: allowedOrigin },
    maxHttpBufferSize: 10e6, // 10MB (adjust as needed)
  });

  const mainIO = io.of("/main");
  const privateChatIO = io.of("/main/chat");
  const roomChatIO = io.of("/main/room");

  mainIO.on("connection", (socket) => {
    console.log(`User '${socket.handshake.auth.username}' connect main`);

    socket.on("disconnect", () => {
      const auth = socket.handshake.auth;
      console.log(`User '${auth.username}' disconnect main`);
    });
  });

  privateChat(privateChatIO);
  roomChat(roomChatIO);

  return io;
}

module.exports = setupSocket;
