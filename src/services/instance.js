import axios from "axios";

/*
const baseurl =
    process.env.NODE_ENV === "production"
        ? "https://lms-backend-817b.onrender.com"
        : "http://localhost:3001"; 
*/

const instance = axios.create({
    baseURL: "http://localhost:3001",
    //timeout: 60000,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

export default instance;