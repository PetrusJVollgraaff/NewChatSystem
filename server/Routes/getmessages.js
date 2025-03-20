const express = require("express");
const db = require("../database/model");
const { authenticate } = require("./auth");
const getmsgRouter = express.Router();

getmsgRouter.post("/user", authenticate, async (req, res) => {
  const { id } = req.body;

  try {
    const getPrivateMsgs = db.prepare(
      `SELECT 
       MS.id AS 'key', 
       MS.user_id, 
       (SELECT U.username FROM users U WHERE U.id = MS.user_id) AS 'username',
       MS.content, MS.timestamp,
       COALESCE( 
       (SELECT 
         json_group_array( 
           json_object( 'key', MU.id, 'id', MD.id, 'name',MD.name, 'type', MD.type, 'url', MD.path, 'userid', MD.user_id, 'thumbnail', MD.thumbnail)
         )
       FROM mediaused MU
       JOIN medias MD ON MU.media_id = MD.id
       WHERE MU.assigned_id=MS.id AND MU.modules_id=2)
       ,'[]'
       ) AS attachments
      FROM messages AS MS
      JOIN one_one AS O ON MS.chat_id = O.id
      WHERE O.id = ? AND MS.deletedYN='no'
      ORDER BY MS.timestamp DESC LIMIT 50`
    );

    const foundPrivateMsgs = getPrivateMsgs.all(id);

    if (typeof foundPrivateMsgs === "undefined") {
      foundPrivateMsgs = [];
    }

    res.json({ msgs: foundPrivateMsgs });
  } catch (err) {
    console.error("Private message error:", err);
    return res.status(400).json({ message: `Could not find message` });
  }
});

module.exports = { getmsgRouter };
