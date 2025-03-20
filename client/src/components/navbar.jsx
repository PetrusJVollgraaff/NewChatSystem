
import React from 'react'
import { isMobile } from "react-device-detect";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";
import { closeSidebar } from "../utils/util";

export const Navbar = ({boxesRef, setAuth, user})=>{
    const navigate = useNavigate()

    const handldeLogout = async()=>{
        
        try{
            const res = await axiosInstance.post("/auth/logout", {
                id: user.id,
                username: user.username,
              });

            if (res.status === 200) {
                setAuth(null);
                sessionStorage.clear();
                navigate("/login");
                SocketDisconnect();
              }
        }catch(err){
            console.error("Logout error: ", err.response?.data || err.message )
        }
    }

    return(<nav id="nav_bar" ref={(el)=>boxesRef.current[1] = el} data-m={isMobile}>
        <ul>
            <li>
                <button id="close-sidebar-button" onClick={()=>{ closeSidebar(boxesRef) }} aria-label="close sidebar" type="button">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="40px"
                        width="40px"
                        fill="#c9c9c9"
                        viewBox="0 -960 960 960"    
                    >
                        <path d="m480-444.62-209.69 209.7q-7.23 7.23-17.5 7.42-10.27.19-17.89-7.42-7.61-7.62-7.61-17.7 0-10.07 7.61-17.69L444.62-480l-209.7-209.69q-7.23-7.23-7.42-17.5-.19-10.27 7.42-17.89 7.62-7.61 17.7-7.61 10.07 0 17.69 7.61L480-515.38l209.69-209.7q7.23-7.23 17.5-7.42 10.27-.19 17.89 7.42 7.61 7.62 7.61 17.7 0 10.07-7.61 17.69L515.38-480l209.7 209.69q7.23 7.23 7.42 17.5.19 10.27-7.42 17.89-7.62 7.61-17.7 7.61-10.07 0-17.69-7.61L480-444.62Z" />
                    </svg>
                </button>
            </li>
            <li>
                <Link to="/">Home</Link>
            </li>
            {user ? (
            <>
            <li>
                <Link to="/main">Main</Link>
            </li>
            <li>
                <Link to="/profile">Profile</Link>
            </li>
            <li>
                <button onClick={handldeLogout}>Logout</button>
            </li>
            </>
            ):(
                <>
                <li>
                <Link to="/login">Login</Link>
            </li>
            <li>
                <Link to="/register">Register</Link>
            </li>
                </>
            )}

        </ul>
    </nav>);
};