import React, { useState } from "react";
import { createPortal } from "react-dom";
import { ModalPopup } from "../../utils/modal";

const InnerMessageAttachs = ({ attachments, func, msg }) => {
  return (
    <div className="attach_image_ctn">
      {attachments.map((attach) => {
        return (
          <div
            data-id={attach.key}
            className="attach_image"
            onClick={(e) => func(e, msg, attach.key)}
          >
            <img src={attach.thumbnail} alt={attach.name} />
          </div>
        );
      })}
    </div>
  );
};

const InnerMessage = ({ msg, dir, attachments, func }) => {
  return (
    <div className="message" data-id={msg.key} dir={dir} key={msg.key}>
      <p className="meta">
        {msg.username} <span>{msg.timestamp}</span>
      </p>
      <p className="text" key={msg.key}>
        {msg.content}
      </p>
      {attachments.length >= 1 ? (
        <div className="attach_image_ctn">
          {attachments.length >= 1 ? (
            <InnerMessageAttachs
              key={msg.key}
              attachments={attachments}
              func={func}
              msg={msg}
            />
          ) : (
            ""
          )}
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export const Message = ({ msgList, user }) => {
  const [modalElm, setModalElm] = useState(null);

  const BuildModal = () => {
    return modalElm;
  };

  const handleModal = (e, msg, attach_key) => {
    e.preventDefault();
    const attachments =
      typeof msg.attachments === "string"
        ? JSON.parse(msg.attachments)
        : msg.attachments;

    const media = attachments.filter((m) => m.key === attach_key)[0];

    const options = {
      onClose: handleCloseModal,
      onBefore: (func) => handleInnerModal(func, media),
      buttons: [
        {
          title: "Download",
          type: "button",
          func: (e) => {
            e.preventDefault();
            var a = document.createElement("a");
            a.href = media.url;
            a.download = media.name;
            a.click();
          },
        },
        {
          title: "Close",
          type: "button",
          func: (e, closefunc) => {
            e.preventDefault();
            closefunc(e);
          },
        },
      ],
    };

    setModalElm(<ModalPopup key={msg.key} options={options} />);
  };

  const handleInnerModal = (func, media) => {
    switch (true) {
      case media.type.includes("image"):
        func(
          <div className="image_ctn">
            <img src={media.url} alt={media.name} />
          </div>
        );
        return;
      case media.type.includes("video"):
        func(
          <div className="image_ctn">
            <video loop muted autoPlay controls>
              <source src={media.url} type={media.type}></source>
            </video>
          </div>
        );
        return;
      default:
        func(<></>);
        return;
    }
  };

  const handleCloseModal = (e) => {
    e.preventDefault();
    setModalElm(null);
  };

  return (
    <>
      {msgList.map((msg) => {
        const attachments =
          typeof msg.attachments === "string"
            ? JSON.parse(msg.attachments)
            : msg.attachments;
        const dir = Number(msg.user_id) === Number(user.id) ? "right" : "left";
        return (
          <InnerMessage
            key={msg.key}
            msg={msg}
            attachments={attachments}
            func={handleModal}
            dir={dir}
          />
        );
      })}
      {createPortal(<BuildModal />, document.body)}
    </>
  );
};
