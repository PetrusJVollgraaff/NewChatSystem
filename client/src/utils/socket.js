import { Manager } from "socket.io-client";

class SocketBuilder {
  #socket = null;
  #socketManager = new Manager("http://localhost:3001");
  constructor() {}

  connect({ path, data }) {
    this.path = path;
    this.data = data;

    this.#init();
  }

  #init() {
    if (!this.#socket) {
      this.#socket = this.#socketManager.socket(this.path, { auth: this.data });

      this.#socket.on("error", (error) => {
        console.error("Sockect error:", error);
      });
    }
  }

  disconnect() {
    if (this.#socket) {
      this.#socket.disconnect();
      this.#socket = null;
    }
  }

  send({ opt, data }) {
    console.log(opt, data);
    if (this.#socket) {
      console.log(this.#socket);
      this.#socket.emit(opt, data, (mgs) => {
        console.log("hello", mgs);
      });
    }
  }

  receive({ opt }, callback) {
    if (this.#socket) {
      this.#socket.on(opt, (msg) => {
        callback(msg);
      });
    }
  }

  open({ opt, data }) {
    if (this.#socket) {
      this.#socket.emit(opt, data);
    }
  }
}

const mainSocket = new SocketBuilder();

export const socketConnect = (data) => {
  mainSocket.connect({ path: "/main", data: data });
};

export const socketDisconnect = () => {
  mainSocket.disconnect();
};

export { SocketBuilder };
