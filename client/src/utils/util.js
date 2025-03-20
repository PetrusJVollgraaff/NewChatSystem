import axiosInstance from "../api/axios";

export const checkEmptyString = (value) => {
  const regex = /^\s*$/g;
  return regex.test(value);
};

export const checkConfirmPassword = (pass1, pass2) => {
  return pass1 === pass2;
};

export const openSidebar = (boxesRef) => {
  boxesRef.current.forEach((box, index) => {
    if (box) {
      if (box.getAttribute("id") === "nav_bar") {
        box.classList.add("show");
        box.removeAttribute("inert");
      } else if (box.getAttribute("id") === "open-side-button") {
        box.setAttribute("aria-expanded", "true");
      }
    }
  });
};

export const closeSidebar = (boxesRef) => {
  boxesRef.current.forEach((box, index) => {
    if (box) {
      if (box.getAttribute("id") === "nav_bar") {
        box.classList.remove("show");
        box.setAttribute("inert", "");
      } else if (box.getAttribute("id") === "open-side-button") {
        box.setAttribute("aria-expanded", "false");
      }
    }
  });
};

export const updateNavbar = (e, boxesRef) => {
  const isMobile = e.matches;
  boxesRef.current.forEach((box, index) => {
    if (box) {
      if (box.getAttribute("id") === "nav_bar" && isMobile) {
        box.setAttribute("inert", "");
      } else if (box.getAttribute("id") === "nav_bar" && !isMobile) {
        box.removeAttribute("inert");
      }
    }
  });
};

export const CheckChatConnection = async ({
  path1,
  path2,
  func1,
  func2,
  nav,
  data,
}) => {
  try {
    const res = await axiosInstance.post(path1, data);

    if (res.status === 200) {
      console.log(res);
      if (res.data.status === "return") {
        nav("/main");
      } else {
        func1(true);
        GetFirstMessages({ path: path2, func: func2, data });
      }
    } else {
      alert(res.data.message);
    }
  } catch (e) {
    alert(e.response?.data.message || e.message);
  }
};

const GetFirstMessages = async ({ path, data, func }) => {
  try {
    const res = await axiosInstance.post(path, data);
    if (res.status === 200) {
      func(res.data.msgs);
    } else {
      alert(res.data.message);
    }
  } catch (e) {
    alert(e.response?.data.message || e.message);
  }
};
