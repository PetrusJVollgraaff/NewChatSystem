import "./RootColors.css";
import "./App.css";
import { useEffect, useRef, useState } from 'react'
import { socketConnect, socketDisconnect } from "./utils/socket";
import { closeSidebar, openSidebar, updateNavbar } from "./utils/util";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Navbar } from "./components/navbar";
import { Home } from "./routes/homepage/home";
import { Login } from "./routes/loginpage/login";
import { Register } from "./routes/registerpage/register";
import { ProfilePage } from "./routes/profilepage/profile";
import { MainPage } from "./routes/mainpage/main";
import { ChatPrivate } from "./routes/chatpage/chat/chat";


function App() {
  const [user, setAuth] = useState(null);
  const boxesRef = useRef([]);

  useEffect(()=>{
    const userId = sessionStorage.getItem("userId")
    const username = sessionStorage.getItem("username")

    if(userId && username){
      setAuth({id: userId, username})
      socketConnect({id: userId, username})
    }else{
      socketDisconnect()
    }

    const handleResize =(e)=>{
      updateNavbar(e, boxesRef)
    }

    const media = window.matchMedia("(width < 700px)")

    media.addEventListener("change", (e)=>{handleResize(e)})

    return()=>{
      media.removeEventListener("resize", (e)=>{handleResize(e)})
    }
  }, [])

  return (
    <Router>
      <button
        ref={(el) => (boxesRef.current[0] = el)}
        id="open-sidebar-button"
        onClick={() => {
          openSidebar(boxesRef);
        }}
        aria-label="open sidebar"
        aria-expanded="false"
        aria-controls="navbar"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="40px"
          viewBox="0 -960 960 960"
          width="40px"
          fill="#c9c9c9"
        >
          <path d="M165.13-254.62q-10.68 0-17.9-7.26-7.23-7.26-7.23-18t7.23-17.86q7.22-7.13 17.9-7.13h629.74q10.68 0 17.9 7.26 7.23 7.26 7.23 18t-7.23 17.87q-7.22 7.12-17.9 7.12H165.13Zm0-200.25q-10.68 0-17.9-7.27-7.23-7.26-7.23-17.99 0-10.74 7.23-17.87 7.22-7.13 17.9-7.13h629.74q10.68 0 17.9 7.27 7.23 7.26 7.23 17.99 0 10.74-7.23 17.87-7.22 7.13-17.9 7.13H165.13Zm0-200.26q-10.68 0-17.9-7.26-7.23-7.26-7.23-18t7.23-17.87q7.22-7.12 17.9-7.12h629.74q10.68 0 17.9 7.26 7.23 7.26 7.23 18t-7.23 17.86q-7.22 7.13-17.9 7.13H165.13Z" />
        </svg>
      </button>
      <Navbar boxesRef={boxesRef} setAuth={setAuth} user={user} />
      <div
        id="overlay"
        aria-hidden="true"
        onClick={() => {
          closeSidebar(boxesRef);
        }}
      ></div>
      <Routes>
        <Route path="/" element={<Home />} />

        {user ? (
          <>
            <Route path="/chat" element={<ChatPrivate user={user} />} />
            <Route path="/main" element={<MainPage user={user} />} />
            <Route
              path="/profile"
              element={<ProfilePage user={user} setAuth={setAuth} />}
            />
          </>
        ) : (
          <>
            <Route path="/login" element={<Login setAuth={setAuth} />} />
            <Route path="/register" element={<Register setAuth={setAuth} />} />
          </>
        )}

        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </Router>
  )
}

export default App
