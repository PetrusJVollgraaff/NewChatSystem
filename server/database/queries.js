const db = require("./model");

async function CheckOne_One({ userid, id }, callback) {
  try {
    const checkPrivateChat = db.prepare(
      `SELECT 
       OO.id,
       (SELECT U.username FROM users U WHERE U.id = OO.sender_id) AS sender,
       (SELECT U.username FROM users U WHERE U.id = OO.receiver_id) AS receiver
      FROM one_one OO
      WHERE (OO.receiver_id = ? OR OO.sender_id = ?) AND OO.id = ?`
    );

    const foundPrivateChat = checkPrivateChat.get(userid, userid, id);

    callback(foundPrivateChat);
  } catch (err) {
    console.error("Check Private chat error:", err);
    callback(null);
  }
  /*db.get(
    "SELECT " +
      " OO.id," +
      " (SELECT U.username FROM users U WHERE U.id = OO.sender_id) AS sender, " +
      " (SELECT U.username FROM users U WHERE U.id = OO.receiver_id) AS receiver " +
      "FROM one_one OO " +
      "WHERE (OO.receiver_id = ? OR OO.sender_id = ?) AND OO.id = ?",
    [userid, userid, id],
    (err, chat) => {
      callback(err, chat);
    }
  );*/
}

const insertImageData = db.transaction(
  async ({ userid, item, thumbnail, key }) => {
    try {
      const insertMedia = await db
        .prepare(
          `INSERT INTO medias (user_id, name, type, path, thumbnail)
      VALUES (?, ?, ?, ?, ?)
      RETURNING id AS 'key', name, type, path AS 'url', thumbnail`
        )
        .get(userid, item.name, item.type, item.url, thumbnail);

      // Second INSERT using the first ID and get the returning ID
      const insertUsedMedia = await db
        .prepare(
          `INSERT INTO mediaused (modules_id, media_id, assigned_id)
    VALUES (2, ?, ?) RETURNING id`
        )
        .get(insertMedia.key, key);

      if (insertUsedMedia) {
        return {
          key: insertUsedMedia.id,
          id: insertMedia.key,
          name: insertMedia.name,
          type: insertMedia.type,
          url: insertMedia.url,
          thumbnail: insertMedia.thumbnail,
          userid,
        };
      } else {
        return null;
      }
    } catch (err) {
      console.error("Fail to attach media:", err);
      return null;
    }
  }
);

module.exports = { CheckOne_One, insertImageData };
