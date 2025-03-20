import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../chat.css";
import {
  CheckChatConnection,
  CheckEmptyString,
} from "../../../utils/util-func";

export const RoomChat = () => {
  const [msg, setMsg] = useState("");
  //const [roomName, setRoomName] = useState("");
  const [checkdone, setDoneCheck] = useState(false);
  const [msgList, setMsgList] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const id1 = Number(queryParams.get("id1"));
  const id2 = Number(queryParams.get("id2"));

  useEffect(
    (data) => {
      console.log(data);
      if (id1 === 0 || id2 === 0) {
        navigate("/main");
        return;
      }

      if (!checkdone) {
        CheckChatConnection({
          path1: "/start/checkroom",
          path2: "/get/room",
          func1: setDoneCheck,
          func2: setMsgList,
          nav: navigate,
          data: {
            id1,
            id2,
          },
        });
      }
    },
    [navigate, checkdone, id1, id2]
  );

  const handleMsg = (e) => {
    e.preventDefault();

    if (CheckEmptyString(msg)) {
      alert("Please provide a valid a message.");
      return;
    }
  };

  let msgListEmpty = msgList.length === 0;

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1>
          <i className="fas fa-smile"></i> ChatCord
        </h1>
        <a href="/main" className="btn">
          Leave Room
        </a>
      </header>
      <main className="chat-main">
        <div className="chat-sidebar">
          <h3>
            <i className="fas fa-comments"></i> Room Name:
          </h3>
          <h2 id="room-name">Test Room</h2>
          <h3>
            <i className="fas fa-users"></i> Users
          </h3>
          <ul id="users"></ul>
        </div>
        <div className="chat-messages">
          {!msgListEmpty
            ? msgList.map((msg) => {
                return (
                  <div className="message">
                    <p className="meta">
                      Brad <span>9:12pm</span>
                    </p>
                    <p className="text">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Eligendi, repudiandae.
                    </p>
                  </div>
                );
              })
            : ""}
        </div>
      </main>
      <div className="chat-form-container">
        <form id="chat-form" onSubmit={handleMsg}>
          <input
            id="msg"
            type="text"
            placeholder="Enter Message"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            required
          />
          <button className="btn">
            <i className="fas fa-paper-plane"></i> Send
          </button>
        </form>
      </div>
    </div>
  );
};
