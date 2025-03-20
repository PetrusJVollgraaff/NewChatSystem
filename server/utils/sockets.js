const socketIo = require("socket.io");
const db = require("./database");
const { CheckOne_One } = require("./databasequeries");
const { createImageThumbnail } = require("./thumbconvertor");
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

function setupSocket(server) {
  const io = socketIo(server, {
    cors: { origin: "http://localhost:3000" },
    maxHttpBufferSize: 10e6, // 10MB (adjust as needed)
  });

  io.on("connection", (socket) => {
    appendClient(socket.handshake.auth);
    console.log(`User '${socket.handshake.auth.username}' connected`);

    // Handle one on one chat
    socket.on("one_one", async (data) => {
      const userid = socket.handshake.auth.id;
      const id = data.id;
      await CheckOne_One({ userid, id }, async (err, chat) => {
        if (err) {
          return;
        }
        socket.join(`${chat.sender}+${chat.receiver}+${chat.id}`);
      });
    });

    socket.on("one_send_message", (data) => {
      const userid = socket.handshake.auth.id;
      const content = data.content;
      const attchments = data.attachments || [];
      const id = data.id;

      //console.log(data);
      if (data.id) {
        CheckOne_One({ userid, id }, (err, chat) => {
          if (err) {
            return;
          }

          const roomname = `${chat.sender}+${chat.receiver}+${chat.id}`;
          console.log(roomname);
          db.all(
            `INSERT INTO messages (user_id, chat_id, content )
              VALUES (?, ?, ?) 
              RETURNING id AS 'key', timestamp, content, user_id, chat_id,
               (SELECT U.username FROM users U WHERE U.id = ?) AS 'username'`,
            [userid, data.id, content, userid],
            function (err, msg) {
              console.log(err);
              if (err) {
                return;
                //res
                //  .status(400)
                //  .json({ message: "Username already taken" });
              }

              msg[0]["attachments"] = [];
              if (attchments.length > 0) {
                attchments.forEach(async (item, idx) => {
                  var thumbnail = null;
                  if (item.type.includes("image")) {
                    thumbnail = await createImageThumbnail(item.url);
                  } else if (item.type.includes("video")) {
                    //thumbnail = await createVideoThumbnail(item.url);
                  }

                  // use with better-sqlite3
                  //const imageData = await insertImageData({
                  //  userid,
                  //  item,
                  //  thumbnail,
                  //  key: msg[0].key,
                  //});
                  //console.log(imageData);

                  console.log("last", imageData);

                  await db.all(
                    `INSERT INTO medias (user_id, name, type, path, thumbnail)
                      VALUES (?, ?, ?, ?, ?)
                      RETURNING id AS 'key', name, type, path AS 'url', thumbnail`,
                    [userid, item.name, item.type, item.url, thumbnail],
                    async function a(err, attach) {
                      if (err) {
                        return;
                        //res
                        //    .status(400)
                        //    .json({ message: "Username already taken" });
                      } else {
                        const attachData = attach[0];
                        await db.all(
                          `INSERT INTO mediaused (modules_id, media_id, assigned_id)
                          VALUES (2, ?, ?) RETURNING id`,
                          [attachData.key, msg[0].key],
                          async function (err, mediaused) {
                            console.log(err, mediaused);
                            if (err) {
                              return;
                              //res
                              //    .status(400)
                              //    .json({ message: "Username already taken" });
                            } else {
                              msg[0].attachments.push({
                                key: mediaused[0].id,
                                id: attachData.key,
                                name: attachData.name,
                                type: attachData.type,
                                url: attachData.url,
                                thumbnail: attachData.thumbnail,
                                userid,
                              });

                              if (idx === attchments.length - 1) {
                                console.log("send ", msg);
                                io.in(roomname).emit(
                                  "one_receive_message",
                                  msg
                                );
                              }
                            }
                          }
                        );
                      }
                    }
                  );
                });
              } else {
                io.in(roomname).emit("one_receive_message", msg);
              }
            }
          );
        });
      }
    });

    // Handle WebRTC signaling
    socket.on("videoOffer", ({ to, signal, from }) => {
      io.to(to).emit("videoOffer", { signal, from });
    });

    socket.on("videoAnswer", ({ to, signal }) => {
      io.to(to).emit("videoAnswer", { signal });
    });

    /*socket.on("roomInvite", (data) => {
      console.log("request invite");
    });

    socket.on("sendMessage", (data) => {
      const { userId, roomId, type, content } = data;

      db.run(
        "INSERT INTO message (user_id, room_id, type, content) VALUES(?, ?, ?, ?)",
        [userId, roomId, type, content],
        function (err) {
          if (err) return console.error(err.message);
          io.to(roomId).emit("receiveMessage", {
            id: this.lastID,
            userId,
            roomId,
            type,
            content,
          });
        }
      );
    });*/

    socket.on("disconnect", () => {
      removeClient(socket.handshake.auth);
      console.log(`User '${socket.handshake.auth.username}' disconnect`);
    });
  });

  return io;
}

module.exports = setupSocket;
