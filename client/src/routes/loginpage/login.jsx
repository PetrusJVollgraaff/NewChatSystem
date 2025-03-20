import React, { useState } from "react";
import "./login.css";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axios";

export const Login = ({ setAuth }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axiosInstance.post("/auth/login", {
        username,
        password,
      });

      if (res.status === 200) {
        sessionStorage.setItem("userId", res.data.id);
        sessionStorage.setItem("username", res.data.username);
        setAuth(res.data);
        navigate("/main");
      } else {
        alert(res.data.message);
      }
    } catch (e) {
      alert(e.response?.data.message || e.message);
    }
  };

  return (
    <div className="login_modal">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </div>
      </form>
    </div>
  );
};
