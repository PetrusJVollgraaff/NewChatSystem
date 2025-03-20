const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../database/model");
const { createToken } = require("./auth");

const profilerouter = express.Router();

profilerouter.post("/update", async (req, res) => {
  const { username, password, userId } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const updateUser = db.prepare(
      `UPDATE users SET username=?, password=? WHERE id=? RETURNING id, username`
    );
    const user = updateUser.get(username, hashedPassword, userId);

    const useId = user.id;
    const newUsename = user.username;

    const accessToken = createToken({
      res,
      id: useId,
      username: newUsename,
    });

    res.json({
      id: useId,
      username: newUsename,
      token: accessToken,
    });
  } catch (err) {
    console.error("Update user profile error", err);
    return res.status(400).json({ message: "Your could not be updated" });
  }
});

module.exports = { profilerouter };
