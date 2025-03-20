import { useEffect, useRef, useState } from "react";
import socket from "./socket";
import SimplePeer from "simple-peer";

const VideoChat = ({ user, room }) => {
  const [stream, setStream] = useState(null);
  //const [peer, setPeer] = useState(null);
  const myVideoRef = useRef();
  const otherVideoRef = useRef();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        setStream(stream);
        myVideoRef.current.srcObject = stream;

        socket.emit("joinRoom", room);

        socket.on("videoOffer", ({ signal, from }) => {
          const newPeer = new SimplePeer({
            initiator: false,
            trickle: false,
            stream: stream,
          });

          newPeer.signal(signal);

          newPeer.on("stream", (removeStream) => {
            otherVideoRef.current.srcObject = removeStream;
          });

          newPeer.on("signal", (signal) => {
            socket.emit("videoAnswer", { to: from, signal });
          });

          setPeer(newPeer);
        });
      });
  }, [room]);

  const startCall = () => {
    const newPeer = new SimplePeer({
      initiator: false,
      trickle: false,
      stream: stream,
    });

    newPeer.on("signal", (signal) => {
      socket.emit("videoOffer", { to: room, signal, from: socket.id });
    });

    newPeer.on("stream", (remoteStream) => {
      otherVideoRef.current.srcObject = remoteStream;
    });

    setPeer(newPeer);
  };

  return (
    <div>
      <video ref={myVideoRef} autoPlay playsInline muted />
      <video ref={otherVideoRef} autoPlay playsInline muted />
      <button onClick={startCall}>Start Video Call</button>
    </div>
  );
};

export default VideoChat;
