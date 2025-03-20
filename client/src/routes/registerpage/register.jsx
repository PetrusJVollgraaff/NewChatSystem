import React, { useState } from "react";
import "./register.css";
import { useNavigate } from "react-router-dom";
import { checkConfirmPassword, checkEmptyString } from "../../utils/util";
import axiosInstance from "../../api/axios";

export const Register = ({ setAuth }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpass, setConfirmPass] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (checkEmptyString(username)) {
      alert("Please provide a valid username.");
      return;
    }

    if (checkEmptyString(password)) {
      alert("Please provide a valid password.");
      return;
    }

    if (!checkConfirmPassword(password, confirmpass)) {
      alert("Confirm password does not match.");
      return;
    }

    try {
      const res = await axiosInstance.post("/auth/register", {
        username,
        password,
      });

      if (res.status === 200) {
        sessionStorage.setItem("userId", res.data.userId);
        sessionStorage.setItem("username", res.data.username);
        setAuth({ id: res.data.id, username: res.data.username });
        navigate("/main");
      } else {
        alert(res.data.message);
      }
    } catch (e) {
      alert(e.response?.data.message || e.message);
    }
  };

  return (
    <div className="register_modal">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <div>
          <input
            type="text"
            placeholder="Username"
            name="username"
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
          <input
            type="password"
            name="confirm_password"
            placeholder="Confirm Password"
            value={confirmpass}
            onChange={(e) => setConfirmPass(e.target.value)}
            required
          />
          <button type="submit">Register</button>
        </div>
      </form>
    </div>
  );
};
