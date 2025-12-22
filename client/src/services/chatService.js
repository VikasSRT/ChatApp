// services/chatService.js
import axiosInstance from "@/lib/axiosInstance";

export const fetchChats = async () => {
  const response = await axiosInstance.get("/chats");
  return response;
};

export const fetchMessages = async (roomId) => {
  const response = await axiosInstance.get(`/messages/${roomId}`);
  return response;
};

export const sendMessage = async (payload) => {
  const response = await axiosInstance.post("/messages", payload);
  return response;
};

export const createRoom = async (payload) => {
  const response = await axiosInstance.post("/rooms/direct", payload);
  return response;
};

export const createGroupChat = async (payload) => {
  const response = await axiosInstance.post("/rooms/group", payload);
  return response;
};

export const editMessage = async (payload, messageId) => {
  const response = await axiosInstance.put(`/messages/${messageId}`, payload);
  return response;
};

export const deleteMessage = async (messageId) => {
  const response = await axiosInstance.delete(`/messages/${messageId}`);
  return response;
};
