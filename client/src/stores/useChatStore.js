// stores/useChatStore.js
import { create } from "zustand";
import { connectWS } from "@/lib/connectWS";
import {
  fetchChats,
  fetchMessages,
  sendMessage as sendMsgApi,
  createRoom,
  createGroupChat,
  deleteMessage,
  editMessage,
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

        console.log("data?.messages", data?.messages);

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

    editMessageHandler: async (messageId, newContent) => {
      const { socket, activeChatUser } = get();
      console.log("newContent", newContent);
      try {
        // Call API
        const response = await editMessage(newContent, messageId);
        const data = await response.data;

        // If API success, emit socket event
        socket.emit("edit-message", {
          roomId: activeChatUser.id,
          messageId,
          newContent: data?.data,
        });

        return true;
      } catch (error) {
        console.error("Failed to edit message:", error);
        throw error;
      }
    },

    deleteMessageHandler: async (messageId) => {
      try {
        const response = await deleteMessage(messageId);
        const data = response.data;

        socket.emit("delete-message", {
          messageId,
          roomId: get().activeChatUser.id,
        });

        return data;
      } catch (error) {
        console.error("Failed to delete messages:", error);
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

    connectSocket: () => {
      const { socket } = get();
      if (!socket.connected) {
        socket.connect();
      }
    },

    disconnectSocket: () => {
      const { socket } = get();
      if (socket.connected) {
        socket.disconnect();
      }
    },

    // WebSocket event handlers
    setupSocketListeners: () => {
      const { socket } = get();

      socket.on("message received", (newMessage) => {
        set((state) => {
          const isActiveChat = state.activeChatUser?.id === newMessage.roomId;

          const updatedMessages = isActiveChat
            ? [...state.messages, newMessage]
            : state.messages;

          const updatedChats = state.chats
            .map((chat) => {
              if (chat.id === newMessage.roomId) {
                return {
                  ...chat,
                  lastMessage: newMessage,
                  updatedAt: newMessage.createdAt,
                };
              }
              return chat;
            })
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

          return {
            messages: updatedMessages,
            chats: updatedChats,
          };
        });
      });

      socket.on("message-deleted", (deletedMessageId) => {
        set((state) => ({
          messages: state.messages.filter(
            (msg) => msg._id !== deletedMessageId
          ),
        }));
      });

      socket.on("message-updated", ({ messageId, newContent }) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg._id === messageId
              ? { ...msg, content: newContent?.content, isEdited: true }
              : msg
          ),
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
        set((state) => ({
          typingUsers: state.typingUsers.filter(
            (u) => u.userId !== user.userId
          ),
          isTyping: state.typingUsers.length > 1,
        }));
      });
    },

    cleanupSocket: () => {
      const { socket } = get();
      socket.off("message received");
      socket.off("message-deleted");
      socket.off("message-updated");
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
