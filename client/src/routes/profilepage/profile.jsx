import { useRef, useState } from "react";
import { checkConfirmPassword, checkEmptyString } from "../../utils/util";
import axiosInstance from "../../api/axios";
import "./profile.css";

export const ProfilePage = ({ user, setAuth }) => {
  const [username, setUsername] = useState(user.username);
  const [password, setPassword] = useState("");
  const [confirmpass, setConfirmPass] = useState("");
  const inputFileRef = useRef([]);
  const [profileImg , setProfileImg] = useState(null)

  const handleProfile = async (e) => {
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
      const res = await axiosInstance.post("/profile/update", {
        username,
        password,
        userId: user.id,
      });

      if (res.status === 200) {
        sessionStorage.setItem("userId", res.data.userId);
        sessionStorage.setItem("username", res.data.username);
        setAuth({ id: res.data.id, username: res.data.username });
      } else {
        alert(res.data.message);
      }
    } catch (e) {
      alert(e.response?.data.message || e.message);
    }
  };

  const handleProfileImage = async(e)=>{
    e.preventDefault()
    inputFileRef.current[1].click()
  }

  const handleProfilPic = async(e)=>{
    e.preventDefault()

    const file = inputFileRef.current[1].files[0]
      
    if (file instanceof File) {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (evt) => {
          var media = [
            {
              name: file.name,
              url: evt.target.result,
              type: file.type,
            },
          ];
          //inputFileRef.current[0].style.backgroundImage =  
          setProfileImg(evt.target.result);
        };
    }

    inputFileRef.current[0].value = ""
  }

  console.log(user);
  return (
    <div className="profile_ctn">
      <form onSubmit={handleProfile}>
        <div className="profile_header">
          <button 
            className="profile_image" 
            onClick={(e)=>handleProfileImage(e)}  
            ref={(el)=> inputFileRef.current[0] = el}
            title="profile_image" 
            style={{
              backgroundImage : "url('" +profileImg+"')"
            }}>
            
          </button>
          <input
            id="profile_uploader"
            type="file"
            ref={(el)=> inputFileRef.current[1] = el}
            hidden
            onChange={handleProfilPic}
            accept="image/*"
          />
          <h1>{username}</h1>
        </div> 
        <div className="profile_main">
        <label for="username">Username:</label>
        <input 
          id="username"
          type="text"
          placeholder="Username"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <label for="pass1">Password:</label>
        
        <input
          id="pass1"
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label for="pass2">Confirm Password:</label>
        <input
          id="pass2"
          type="password"
          name="confirm_password"
          placeholder="Confirm Password"
          value={confirmpass}
          onChange={(e) => setConfirmPass(e.target.value)}
          required
        />

        <button type="submit">Edit</button>
        </div>     
      </form>
    </div>
  );
};
