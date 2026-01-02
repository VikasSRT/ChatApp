import { io } from "socket.io-client";

export const connectWS = () => {
    return io("https://chatapp-backend-y1p9.onrender.com");
}
