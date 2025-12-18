// stores/useChatStore.js
import { create } from "zustand";
import { connectWS } from "@/lib/connectWS";
import {
  fetchChats,
  fetchMessages,
  sendMessage as sendMsgApi,
  createRoom,
  createGroupChat,
} from "@/services/chatService";

const useChatStore = create((set, get) => {
  // Initialize WebSocket
  const socket = connectWS();

  return {
    // State
    chats: [],
    activeChatUser: null,
    messages: [],
    isTyping: false,
    typingUsers: [],
    message: "",
    socket,

    // Loading states
    isChatsLoading: false,
    isChatLoadingError: null,
    loadingMessages: false,
    messagesLoadingError: null,

    // Actions
    setActiveChatUser: (chatUser) => set({ activeChatUser: chatUser }),
    setMessage: (text) => set({ message: text }),

    getMessagesForUser: async (chatObj) => {
      if (!chatObj?.id) return;

      // Set loading state before API call
      set({ loadingMessages: true, messagesLoadingError: null });

      try {
        const response = await fetchMessages(chatObj.id);
        const data = response.data;

        get().socket.emit("joinRoom", chatObj.id);
        set({
          messages: data?.messages || [],
          activeChatUser: chatObj,
          loadingMessages: false,
        });

        return data;
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        set({
          messages: [],
          loadingMessages: false,
          messagesLoadingError: error.message || "Failed to load messages",
        });
        throw error;
      }
    },

    sendMessageHandler: async (userData) => {
      const { activeChatUser, message, socket } = get();

      if (!message.trim() || !activeChatUser?.id) return;

      const { exp, iat, ...user } = userData;
      socket.emit("stop-typing", user);

      const payload = {
        roomId: activeChatUser.id,
        content: message,
      };

      try {
        const response = await sendMsgApi(payload);
        const data = response.data;

        set({ message: "" });
        socket.emit("newMessage", data);
        return data;
      } catch (error) {
        console.error("Failed to send message:", error);
        throw error;
      }
    },

    startChatHandler: async (userData, user) => {
      try {
        const response = await createRoom({ userId: user._id });
        const data = response.data;

        const chatObj = {
          id: data.room._id,
          isGroup: false,
          name: user?.username,
          type: data.room.type,
        };

        await get().getMessagesForUser(chatObj);
        return data;
      } catch (error) {
        console.error("Failed to start chat:", error);
        throw error;
      }
    },

    createGroupChatHandler: async (groupData) => {
      try {
        const response = await createGroupChat(groupData);
        const data = response.data;

        socket.emit("joinRoom", data.room._id);

        set((state) => ({
          chats: [...state.chats, data.room],
          activeChatUser: {
            id: data.room._id,
            name: data.room.name,
            isGroup: true,
            type: "group",
          },
        }));

        await get().getMessagesForUser({ id: data.room._id });
        return data;
      } catch (error) {
        console.error("Failed to start chat:", error);
        throw error;
      }
    },
    // WebSocket event handlers
    setupSocketListeners: () => {
      const { socket } = get();

      socket.on("message received", (newMessage) => {
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      });

      socket.on("user-typing", (user) => {
        set((state) => ({
          typingUsers: state.typingUsers.some((u) => u.userId === user.userId)
            ? state.typingUsers
            : [...state.typingUsers, user],
          isTyping: true,
        }));
      });

      socket.on("user-stop-typing", (user) => {
        setTimeout(() => {
          set((state) => {
            const updatedTypingUsers = state.typingUsers.filter(
              (u) => u.userId !== user.userId
            );

            return {
              typingUsers: updatedTypingUsers,
              isTyping: updatedTypingUsers.length > 0,
            };
          });
        }, 1000);
      });
    },

    cleanupSocket: () => {
      const { socket } = get();
      socket.off("message received");
      socket.off("user-typing");
      socket.off("user-stop-typing");
    },

    // Initialize chats
    initializeChats: async () => {
      set({ isChatsLoading: true, isChatLoadingError: null });

      try {
        const response = await fetchChats();
        const data = response.data;
        set({ chats: data, isChatsLoading: false });
        return data;
      } catch (error) {
        console.error("Failed to fetch chats:", error);
        set({
          isChatLoadingError: error.message || "Failed to load chats",
          isChatsLoading: false,
        });
        throw error;
      }
    },
  };
});

export default useChatStore;
