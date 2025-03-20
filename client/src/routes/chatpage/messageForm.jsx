import React, { useState, useRef } from "react";
import { checkEmptyString } from "../../utils/util";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCirclePlus, faSpinner } from '@fortawesome/free-solid-svg-icons'

export const MessageForm = ({ chatid, formsElmRef, sendBtn, setSendBtn, chatSocket }) => {
  const id = chatid;

  const inputFileRef = useRef(null);
  const [msg, setMsg] = useState("");
  const [msgMediaList, setMsgMediaList] = useState([]);

  const handleOpenInputFile = (e) => {
    e.preventDefault();

    inputFileRef.current.click();
  };

  const checkIDinArray = ({ num = 0 }) => {
    let newNum = Number(num);
    while (msgMediaList.some((item) => item.id === newNum)) {
      newNum++;
    }
    return newNum;
  };

  const handleMediaInputFile = async (e) => {
    e.preventDefault();

    for (const file of inputFileRef.current.files) {
      if (file instanceof File) {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (evt) => {
          var media = [
            {
              id: checkIDinArray({ num: 0 }),
              name: file.name,
              url: evt.target.result,
              type: file.type,
            },
          ];

          setMsgMediaList((prev) => [...prev, ...media]);
        };
      }
    }
  };

  const handleRemoveMediaInputFile = (e, id) => {
    e.preventDefault();

    setMsgMediaList((prev) => [...prev.filter((media) => media.id !== id)]);
  };

  const BuildUploadMedia = ({ media, idx }) => {
    return (
      <div className="media_ctn" data-id={idx}>
        {media.type.includes("video") ? (
          <video src={media.url}></video>
        ) : (
          <img
            src={media.url}
            alt="Uploaded"
            className="w-full h-auto rounded-lg"
          />
        )}
        <button
          type="button"
          onClick={(e) => handleRemoveMediaInputFile(e, media.key)}
        >
          remove
        </button>
      </div>
    );
  };

  const handleMsg = (e) => {
    e.preventDefault();

    if (checkEmptyString(msg) && msgMediaList.length === 0) {
      alert("Please provide a valid a message.");
      return;
    }

    setSendBtn(<FontAwesomeIcon icon={faSpinner} spin />)

    const msgdata = {
      content: msg,
      type: "text",
      id,
      attachments: msgMediaList,
    };
   
    chatSocket.send({ opt: "one_send_message", data: msgdata })
   
    setMsg("");
    setMsgMediaList([]);
    var form = document.getElementById("chat-form");
    form.reset();
  };

  return (
    <div className="chat-form-container">
      <form id="chat-form" onSubmit={handleMsg}>
        <div className="media_previewer">
          {msgMediaList.map((media, idx) => {
            return <BuildUploadMedia media={media} idx={idx} />;
          })}
        </div>
        <div className="file_div">
          <button
            type="button"
            className="btn"
            onClick={handleOpenInputFile}
            ref={(el) => (formsElmRef.current[0] = el)}
          >
            <FontAwesomeIcon icon={faCirclePlus} /> <span>Add Media</span>
          </button>
          <input
            id="file_uploader"
            type="file"
            ref={inputFileRef}
            hidden
            onChange={handleMediaInputFile}
            multiple
          />
        </div>
        <input
          id="msg"
          type="text"
          ref={(el) => (formsElmRef.current[2] = el)}
          placeholder="Enter Message"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          required
        />
        <button className="btn" ref={(el) => (formsElmRef.current[3] = el)}>
        {sendBtn}
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
