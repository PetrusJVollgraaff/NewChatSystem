/*class Modal {
  constructor(options, elem) {
    this.settings = Object.assign(
      {
        title: "Modal Popup",
        content: undefined,
        buttons: undefined,
        customClass: undefined,
        closeButton: true,
        autoOpen: true,
        outsideClose: true,
        onClose: undefined,
        height: undefined,
        width: undefined,
        openAnimation: undefined,
        closeAnimation: undefined,
        onOpen: undefined,
        onBefore: undefined,
      },
      options
    );

    this.loadingContent = false;
    this.popupEl = null;
    this.elem = elem;
    //this.$elem = $(elem);

    this.id = 0; //Modal.#randomID();

    this.#init();
  }

  static #randomID() {
    var num = Math.floor(Math.random() * 20);
    var elem = document.querySelector(".ModalPopup[data-id='" + num + "']");
    console.log(elem);

    while (!elem) {
      num = Math.floor(Math.random() * 20);
      elem = document.querySelector(".ModalPopup[data-id='" + num + "']");
    }
    return num;
  }
  #init() {
    var _ = this;
    var body = document.querySelector("body");
    console.log(this.#build());
    body.appendChild(this.#build());
    this.popupEl = document.querySelector(
      ".ModalPopup[data-id='" + this.id + "']"
    );

    this.popupEl.style.zIndex =
      50 + document.querySelectorAll(".ModalPopup").length;

    if (typeof this.settings.onBefore == "function") {
      this.settings.onBefore(this);
    }

    this.#loadContent(() => {
      _.#eventListener();

      if (typeof _.settings.onOpen == "function") _.settings.onOpen(_);
    });
  }

  #build() {
    var _ = this;
    return (
      <div className="ModalPopup {_.settings.customClass}'" data-id="{_.id ">
        <div className="ModalPopupHead">
          <div className="header" title="{_.settings.title}">
            {_.settings.title}
          </div>
          <div className="ModalPopupClose" title="Close popup">
            <i className="fas fa-times-circle"></i>
          </div>
        </div>
        <div className="ModalPopupBody">
          <div className="ModalPopupLoader"></div>
        </div>
      </div>
    );
  }

  #loadContent(fallback) {
    var _ = this;

    if (this.popupEl !== null) {
      this.loadingContent = true;
      if (typeof this.settings.content !== "undefined") {
        this.popupEl.find(".ModalPopupLoader").fadeOut(function () {
          _.popupEl.find(".ModalPopupBody").html(_.settings.content);
          _.loadingContent = false;
          if (typeof fallback === "function") fallback();
        });
      } else if (this.popupEl.find(".ModalPopupLoader").length > 0) {
        this.popupEl.find(".ModalPopupLoader").fadeOut(function () {
          this.remove();
          _.loadingContent = false;
          if (typeof fallback === "function") fallback();
        });
      } else {
        _.loadingContent = false;
        if (typeof fallback === "function") fallback();
      }
    }
  }

  #eventListener() {
    var _ = this;

    document.addEventListener("click", (e) => {
      console.log(e.target);
      //if (
      //!$(e.target).hasClass("ModalPopup") &&
      //!$(e.target).parents("div").hasClass("ModalPopup")
      //) {
      //_.close();
      //}
    });

    this.popupEl
      .querySelector(".ModalPopupClose")
      .addEventListener("click", () => {
        _.close();
      });
  }

  close() {
    if (
      this.settings.onClose !== undefined &&
      typeof this.settings.onClose === "function"
    ) {
      this.settings.onClose();
    }

    this.popupEl.fadeOut(function () {
      this.remove();
    });
  }
}

export { Modal };
*/

import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import "../modal.css";

export const ModalPopup = ({ options }) => {
  const dialogRef = useRef(null);

  const [mainClass, setMainClass] = useState("");
  const [mainBtn, setMainBtn] = useState([]);
  const [mainBody, setMainBody] = useState(
    <div className="ModalPopupLoader"></div>
  );
  const [dialogid, setDialogID] = useState(1);
  const [settings, setSettings] = useState({
    title: "Modal Popup",
    content: undefined,
    buttons: [],
    customClass: undefined,
    closeButton: true,
    autoOpen: true,
    outsideClose: true,
    onClose: undefined,
    height: undefined,
    width: undefined,
    openAnimation: undefined,
    closeAnimation: undefined,
    onOpen: undefined,
    onBefore: undefined,
  });

  useEffect(() => {
    setSettings((prev) => ({ ...prev, ...options }));
    setDialogID(randomID());
  }, [options]);

  useEffect(() => {
    setMainClass(`ModalPopup ${settings.customClass || ""}`);
    setMainBtn(settings.buttons || []);

    if (typeof settings.onBefore === "function") {
      settings.onBefore(setMainBody);
    }

    if (dialogRef.current) {
      dialogRef.current.showModal();
    }
  }, [settings]);

  const randomID = () => {
    let num = Math.floor(Math.random() * 20);
    let elem = document.querySelectorAll(".ModalPopup[data-id='" + num + "']");

    while (elem.length === 1) {
      num = Math.floor(Math.random() * 20);
      elem = document.querySelectorAll(".ModalPopup[data-id='" + num + "']");
    }
    return num;
  };

  const BuildBody = () => {
    return mainBody;
  };

  const BuildButton = ({ btn }) => {
    return (
      <button onClick={(e) => btn.func(e, handleCloseModal)} type={btn.type}>
        {btn.title}
      </button>
    );
  };

  const handleCloseModal = (e) => {
    console.log("hello");
    e.preventDefault();
    if (dialogRef.current) {
      dialogRef.current.close();

      if (typeof settings.onClose === "function") {
        settings.onClose(e);
      }
    }
  };

  return (
    <dialog className={mainClass} data-id={dialogid} ref={dialogRef}>
      <div className="ModalPopupHead">
        <div className="header" title={settings.title}>
          {settings.title}
        </div>
        <div
          className="ModalPopupClose"
          title="Close popup"
          onClick={(e) => handleCloseModal(e)}
        >
          <FontAwesomeIcon icon={faXmark} />
        </div>
      </div>
      <div className="ModalPopupBody">
        <BuildBody />
      </div>
      <div className="ModalPopupFooter">
        {mainBtn.length > 0
          ? mainBtn.map((btn, idx) => {
              return <BuildButton btn={btn} />;
            })
          : ""}
      </div>
    </dialog>
  );
};
