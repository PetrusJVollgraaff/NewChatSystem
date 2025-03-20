const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../database/model");
const authRouter = express.Router();

const SECRET = process.env.SECRET || "your_secret_key";

authRouter.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const registerUser = db.prepare(
      `INSERT INTO users (username, password) VALUES (?, ?) RETURNING id, username`
    );
    const result = registerUser.get(username, hashedPassword);
    const useId = result.id;
    const newUsename = result.username;

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
    console.error("Register user error", err);
    return res.status(400).json({ message: "Username already taken" });
  }
});

authRouter.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const users = db.prepare(
      `SELECT id, username, password FROM users WHERE username = ?`
    );
    const user = users.get(username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

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
    console.error("Login user error", err);
    return res.status(400).json({ message: "Invalid username/password" });
  }
});

authRouter.post("/logout", (req, res) => {
  res.clearCookie("accessToken");
  res.json({ message: "Logged out successfully" });
});

authRouter.post("/refresh", (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken)
    return res.status(401).json({ message: "No refresh token" });

  jwt.verify(refreshToken, SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid refresh token" });

    const newAccessToken = jwt.sign(
      { id: user.id, username: user.username },
      SECRET,
      {
        expiresIn: "15m",
      }
    );

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.json({ message: "Access token refreshed" });
  });
});

// Middleware to Check Auth
const authenticate = (req, res, next) => {
  //const token = req.headers["authorization"];
  const token = req.cookies.accessToken;
  if (!token)
    return res
      .status(401)
      .json({ message: "Access token expired, please refresh" });

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid access token" });
    req.user = user;
    next();
  });
};

const createToken = ({ res, id, username }) => {
  // Generate Access Token (Short-lived, 15 mins)
  const accessToken = jwt.sign({ id: id, username: username }, SECRET, {
    expiresIn: "15m",
  });

  // Generate Refresh Token (Longer, 7 days)
  const refreshToken = jwt.sign({ id: id, username: username }, SECRET, {
    expiresIn: "7d",
  });

  // Store both tokens in HTTP-only cookies
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return accessToken;
};

module.exports = { authRouter, authenticate, createToken };
