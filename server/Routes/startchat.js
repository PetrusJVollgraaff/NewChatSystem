const express = require("express");
const db = require("../database/model");
const { authenticate } = require("./auth");
const { CheckOne_One } = require("../database/queries");

const startchatRouter = express.Router();

startchatRouter.post("/user", authenticate, async (req, res) => {
  const { id } = req.body;

  try {
    const checkPrivateChat = db.prepare(
      `SELECT id FROM one_one WHERE (receiver_id = ? AND sender_id = ?) or (receiver_id = ? AND sender_id = ?)`
    );
    const foundPrivateChat = checkPrivateChat.get(
      id,
      req.user.id,
      req.user.id,
      id
    );

    if (!foundPrivateChat) {
      const startPrivateChat = db.prepare(
        `INSERT INTO one_one (receiver_id, sender_id) VALUES (?, ?) RETURNING id`
      );
      const createPrivateChat = startPrivateChat.get(id, req.user.id);

      res.json({ id: createPrivateChat.id });
    } else {
      res.json({ id: foundPrivateChat.id });
    }
  } catch (err) {
    console.error("Private chat connection error:", err);
    return res.status(400).json({ message: `Private chat was no made` });
  }
});

startchatRouter.post("/checkuser", authenticate, async (req, res) => {
  const { id } = req.body;
  await CheckOne_One({ userid: req.user.id, id }, (chat) => {
    if (!chat) {
      res.json({ status: "return" });
      return;
    } else {
      res.json({ status: "proceed" });
      return;
    }
  });
});

module.exports = { startchatRouter };
