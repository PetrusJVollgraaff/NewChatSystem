const db = require("../database/model");
const { CheckOne_One, insertImageData } = require("../database/queries");
const { thumbnailImage } = require("./thumbconvertor");

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

function roomChat(io) {
  io.on("connection", (socket) => {
    appendClient(socket.handshake.auth);
    console.log(`User '${socket.handshake.auth.username}' connect to room`);

    socket.on("one_one", async (data) => {
      const userid = socket.handshake.auth.id;
      const id = data.id;
      await CheckOne_One({ userid, id }, async (chat) => {
        if (chat) {
          clientArry[userid][
            "rooms"
          ] = `${chat.sender}+${chat.receiver}+${chat.id}`;
          socket.join(`${chat.sender}+${chat.receiver}+${chat.id}`);
        }
      });
    });

    socket.on("one_send_message", (data) => {
      const userid = socket.handshake.auth.id;
      const content = data.content;
      const attchments = data.attachments || [];
      const chatid = Number(data.id);
      const roomname = clientArry[userid]["rooms"]
        ? clientArry[userid]["rooms"]
        : null;

      if (chatid > 0 && roomname) {
        CheckOne_One({ userid, id: chatid }, (chat) => {
          if (!chat) {
            return;
          } else if (roomname != `${chat.sender}+${chat.receiver}+${chat.id}`) {
            return;
          }

          try {
            const insertPrivateMsg = db.prepare(
              `INSERT INTO messages (user_id, chat_id, content )
                  VALUES (?, ?, ?) 
                  RETURNING id AS 'key', timestamp, content, user_id, chat_id,
                   (SELECT U.username FROM users U WHERE U.id = ?) AS 'username'`
            );
            const createdPrivateMsg = insertPrivateMsg.all(
              userid,
              chatid,
              content,
              userid
            );

            if (createdPrivateMsg) {
              const msg = createdPrivateMsg;
              msg[0]["attachments"] = [];

              if (attchments.length > 0) {
                attchments.forEach(async (item, idx) => {
                  var thumbnail = null;

                  if (item.type.includes("image")) {
                    thumbnail = await thumbnailImage(item.url);
                  } else if (item.type.includes("video")) {
                    //thumbnail = await createVideoThumbnail(item.url);
                  }

                  const attachDetail = await insertImageData({
                    userid,
                    item,
                    thumbnail,
                    key: msg[0].key,
                  });

                  if (attachDetail) {
                    msg[0].attachments.push(attachDetail);
                  }

                  if (idx === attchments.length - 1) {
                    io.in(roomname).emit("one_receive_message", msg);
                  }
                });
              } else {
                io.in(roomname).emit("one_receive_message", msg);
              }
            }
          } catch (err) {
            console.error("Private message send error", err);
            return res.status(401).json({ message: "Invalid message" });
          }
        });
      }
    });

    socket.on("disconnect", () => {
      const auth = socket.handshake.auth;
      const userid = auth.id;
      if (clientArry[userid]["privateroom"]) {
        socket.leave(clientArry[userid]["privateroom"]);
      }
      removeClient(auth);
      console.log(`User '${auth.username}' disconnect from room`);
    });
  });
}

module.exports = { roomChat };
