import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../chat.css";
import { Message } from "../messages";
import { MessageForm } from "../messageForm";
import { CheckChatConnection } from "../../../utils/util";
import { SocketBuilder } from "../../../utils/socket";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'

export const ChatPrivate = ({ user }) => {
  const formsElmRef = useRef([]);
  const loginuser = `${user.username}`;
  const [checkdone, setDoneCheck] = useState(false);
  const [msgList, setMsgList] = useState([]);
  const [sendBtn, setSendBtn] = useState(<FontAwesomeIcon icon={faPaperPlane} />)
  const [chatSocket, setChatSocket] = useState(new SocketBuilder());

  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const chatid = Number(queryParams.get("id"));

  useEffect(() => {
    if (chatid === 0) {
      navigate("/main");
      return;
    }

    if (!checkdone) {
      CheckChatConnection({
        path1: "/start/checkuser",
        path2: "/get/user",
        func1: setDoneCheck,
        func2: setMsgList,
        nav: navigate,
        data: { id: chatid },
      });
      const auth = {...user}
      auth["chatid"] = chatid
      chatSocket.connect({path:`/main/chat`, data: auth})

      setTimeout(() => {
        chatSocket.open({ opt: "one_one", data: { id: chatid } })
      }, 500);

            
      chatSocket.receive({ opt: "one_receive_message" }, (msg) => {
        console.log(msg);
        setMsgList((prev) => [...msg, ...prev]);
        scrollDown();
        setTimeout(() => {
          setSendBtn(<FontAwesomeIcon icon={faPaperPlane} />)
          //formsElmRef.current.forEach((elem, index) => {
         // if (elem) {
         //   elem.removeAttribute("disabled");
         // }
        //});
        },800)
      })
    }
  }, [navigate, checkdone, chatid, user]);

  const scrollDown = () => {
    const chatMessage = document.querySelector(".chat-messages");
    chatMessage.scrollTop = chatMessage.scrollHeight;
  };

  let msgListEmpty = msgList.length === 0;

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1>
          <i className="fas fa-smile"></i> ChatCord
        </h1>
        <a href="/main" className="btn">
          Leave Chat
        </a>
      </header>
      <main className="chat-main">
      <div className="chat-sidebar">
          <h3>
            <i className="fas fa-comments"></i> User Name:
          </h3>
          <h2 id="room-name">{loginuser}</h2>
        </div>
        <div className="chat-messages">
          {!msgListEmpty ? <Message msgList={msgList} user={user} /> : ""}
        </div>
        <MessageForm chatid={chatid} formsElmRef={formsElmRef} sendBtn={sendBtn} setSendBtn={setSendBtn} chatSocket={chatSocket}/>
        
      </main>
    </div>
  );
};
