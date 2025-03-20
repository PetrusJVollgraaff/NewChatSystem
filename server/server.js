const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { authRouter } = require("./Routes/auth");
const { searchRouter } = require("./Routes/search");
const { profilerouter } = require("./Routes/profile");
const setupSocket = require("./utils/socketsconfig");
const { startchatRouter } = require("./Routes/startchat");
const { getmsgRouter } = require("./Routes/getmessages");

const PORT = process.env.PORT || 3001;
const allowedOrigin = "http://localhost:3000";
const app = express();
const server = http.createServer(app);
setupSocket(server, allowedOrigin);

app.use(
  cors({ origin: allowedOrigin, credentials: true, methods: ["GET", "POST"] })
);
app.use(cookieParser());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/search", searchRouter);
app.use("/profile", profilerouter);
app.use("/start", startchatRouter);
app.use("/get", getmsgRouter);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
