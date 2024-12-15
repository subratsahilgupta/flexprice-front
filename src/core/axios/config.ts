import axios from "axios";
import { getTokens } from "../utils/auth/save_tokens";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.example.com",
  timeout: 10000, // Optional: set a timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    if (process.env.NODE_ENV === "development") {
      console.log("Request:", config);
    }

    // // Add additional headers (e.g., auth token)
    // const token = process.env.SERVER_AUTH_TOKEN; // Load token from environment variables
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

    const tokens = localstorage.get("acessToken");
    console.log("got tokens", tokens);

    if (tokens) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }


    return config;
  },
  (error) => {
    // Handle request error
    if (process.env.NODE_ENV === "development") {
      console.error("Request Error:", error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Handle or log the response here if needed
    if (process.env.NODE_ENV === "development") {
      console.log("Response:", response.data);
    }
    return response.data; // Return only the data from the response
  },
  (error) => {
    // Handle response errors
    if (process.env.NODE_ENV === "development") {
      console.error("Response Error:", error.response || error.message);
    }
    return Promise.reject(
      error.response?.data || { message: "An error occurred" }
    );
  }
);

export default axiosInstance;