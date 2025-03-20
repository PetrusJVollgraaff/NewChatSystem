const express = require("express");
const db = require("../database/model");
const { authenticate } = require("./auth");

const searchRouter = express.Router();

searchRouter.post("/user", authenticate, async (req, res) => {
  const { username } = req.body;

  try {
    const users = db.prepare(
      `SELECT id, username FROM users WHERE LOWER(username) LIKE '%' || LOWER(?) || '%' AND NOT id = ? `
    );
    const results = users.all(username, req.user.id);

    res.json({ users: results });
  } catch (err) {
    console.error("Search user error:", err);
    return res.status(400).json({ message: `No user exists '${username}'` });
  }
});

module.exports = { searchRouter };
