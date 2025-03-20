import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3001",
  withCredentials: true, // Ensures cookies are sent
});

// Interceptor to retry failed requests with refresh token
axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        //Attempt to refresh token
        await axios.post(
          "http://localhost:3001/auth/refresh",
          {},
          { withCredentials: true }
        );

        //Retry the original requests
        return axios(error.config);
      } catch (err) {
        console.err("Refresh token failed:", err);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;