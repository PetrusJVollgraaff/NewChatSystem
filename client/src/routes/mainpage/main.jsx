import React, { useEffect, useState } from "react";
import "./main.css";
import { useNavigate } from "react-router-dom";
import { SocketBuilder, socketConnect } from "../../utils/socket";
import axiosInstance from "../../api/axios";
import { checkEmptyString } from "../../utils/util";

export const MainPage = (data) => {
  const loginuser = `${data.user.username}`;
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [roomname, setRoomname] = useState("");

  const [usersList, setFoundUsers] = useState([]);
  //const [roomsList, setFoundRooms] = useState([]);

  useEffect(() => {
    //new SocketBuilder({path:'/main', data: data.user})
    socketConnect(data.user);
  }, [data.user]);

  const handleStartChatUse = async (e, id) => {
    e.preventDefault();

    try {
      const res = await axiosInstance.post("/start/user", {
        id,
      });
      if (res.status === 200) {
        navigate("/chat?id=" + res.data.id);
      } else {
        alert(res.data.message);
      }
    } catch (e) {
      alert(e.response?.data.message || e.message);
    }
  };

  const handleSearchUser = async (e) => {
    e.preventDefault();

    if (checkEmptyString(username)) {
      alert("Please provide a valid username.");
      return;
    }

    try {
      const res = await axiosInstance.post("/search/user", {
        username,
      });

      if (res.status === 200) {
        const users = res.data.users;
        const Elm = document.querySelector(".found_users_ctn");
        Elm.innerHTML = "";

        if (users.length > 0) {
          setFoundUsers(users);
        } else {
          Elm.innerHTML = "No users was found.";
        }
      } else {
        alert(res.data.message);
      }
    } catch (e) {
      alert(e.response?.data.message || e.message);
    }
  };

  const handleSearchRooms = async (e) => {
    e.preventDefault();

    if (checkEmptyString(roomname)) {
      alert("Please provide a valid room name.");
      return;
    }

    try {
      const res = await axiosInstance.post("/search/room", {
        roomname,
      });

      if (res.status === 200) {
        const rooms = res.data.rooms;
        const Elm = document.querySelector(".found_rooms_ctn");
        Elm.innerHTML = "";

        if (rooms.length > 0) {
          rooms.forEach((item) => {
            Elm.innerHTML += `<div><a href="/chat?id=${item.id}">${item.name}</a></div>`;
          });
        } else {
          Elm.innerHTML = "No rooms was found.";
        }
      } else {
        alert(res.data.message);
      }
    } catch (e) {
      alert(e.response?.data.message || e.message);
    }
  };

  let usersListEmpty = usersList.length === 0;

  return (
    <div className="join-container">
      <header className="join-header">
        <h1>ChatCord</h1>
        <h3>{loginuser}</h3>
      </header>
      <main className="join-main">
        <form onSubmit={handleSearchUser}>
          <div className="form-control">
            <div className="search_div">
              <label>Search Username</label>
              <input
                type="text"
                name="chat_username"
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username..."
                required
              />
              <button type="submit" className="">
                search
              </button>
            </div>
          </div>
          <div className="found_users_ctn">
            {!usersListEmpty
              ? usersList.map((user) => {
                  return (
                    <div>
                      <span>{user.username}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          handleStartChatUse(e, user.id);
                        }}
                      >
                        Start Chatting
                      </button>
                    </div>
                  );
                })
              : ""}
          </div>
        </form>
        <form onSubmit={handleSearchRooms}>
          <div className="form-control">
            <div className="search_div">
              <label>Search Room</label>
              <input
                type="text"
                name="room_name"
                onChange={(e) => setRoomname(e.target.value)}
                placeholder="Enter room..."
                required
              />
              <button type="submit" className="">
                search
              </button>
            </div>
          </div>
          <div className="found_rooms_ctn"></div>
        </form>
      </main>
    </div>
  );
};
