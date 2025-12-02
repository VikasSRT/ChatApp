import axios from "axios";

const axiosInstance = axios.create({ baseURL: "/api" });

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },

  (error) => Promise.reject(error)
);

// axiosInstance.interceptors.response.use((response) => {
//     if(response.data.statusCode === 200){

//     }
// })

export default axiosInstance;
