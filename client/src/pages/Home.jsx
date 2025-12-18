import React, { useEffect, useRef, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/context/AuthContext";
import { connectWS } from "@/lib/connectWS";
import { useApi } from "@/hooks/useApi";
import Navbar from "@/components/Navbar";
import GroupCreationModal from "@/components/GroupCreationModal";
import ConversationSidebar from "@/components/ConversationSidebar";
import ChatArea from "@/components/ChatArea";

const Home = () => {
  const { userData } = useAuth();
  const socket = useRef(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [message, setMessage] = useState("");
  const debounceRef = useRef(null);
  const {
    loading: isChatsLoading,
    error: isChatLoadingError,
    fetchData: fetchChats,
  } = useApi("/chats");
  const {
    loading: loadingMessages,
    error: messagesLoadingError,
    fetchData: fetchMessages,
  } = useApi("/messages/", "GET");
  const {
    loading: sendingMesssage,
    error: errorInSending,
    fetchData: sendMessage,
  } = useApi("/messages", "POST");
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);

  // Fetch Chats on component mount
  const getChats = async () => {
    const response = await fetchChats();
    const data = response?.data;
    setChats(data);
    console.log("Chats data:", data);
  };

  // Get Messages for selected user
  const getMessagesForUser = async (chatObj) => {
    const response = await fetchMessages(null, {}, `${chatObj.id}`);
    const data = response?.data;
    socket.current.emit("joinRoom", chatObj.id);
    setMessages(data?.messages);
    console.log("Messages data:", data);
  };

  // Send Message functionality
  const sendMessageHandler = async () => {
    console.log("does it run here");
    console.log("activeChatUser", activeChatUser);
    if (!message.trim() && activeChatUser?._id) return;

    const { exp, iat, ...user } = userData;

    socket.current.emit("stop-typing", user);

    const payload = {
      roomId: activeChatUser.id,
      content: message,
    };

    const response = await sendMessage(payload);
    const data = response?.data;
    console.log("Sent message response:", data);
    setMessage("");
    socket.current.emit("newMessage", data);
  };

  useEffect(() => {
    socket.current = connectWS();
    getChats();

    return () => clearTimeout(debounceRef.current);
  }, []);

  useEffect(() => {
    socket.current.on("message received", (newMessageRecieved) => {
      setMessages((prevMessages) => [...prevMessages, newMessageRecieved]);
    });

    socket.current.on("user-typing", (user) => {
      setTypingUsers((prev) => {
        if (prev.some((u) => u.userId === user.userId)) {
          return prev;
        }
        return [...prev, user];
      });
      setIsTyping(true);
    });

    socket.current.on("user-stop-typing", (user) => {
      console.log("stopped typing user", user);
      setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u.userId !== user.userId));
        if (typingUsers.length < 1) {
          setIsTyping(false);
        } else {
          setIsTyping(true);
        }
      }, 1000);
    });

    return () => {
      socket.current.off("message received");
      socket.current.off("user-typing");
      socket.current.off("user-stopped-typing");
    };
  }, []);

  console.log("messages", messages);
  console.log("isTyping", isTyping);
  console.log("typingUsers", typingUsers);

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen bg-background text-foreground">
        {/* Navbar */}
        <Navbar
          // Sidebar/mobile menu state
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          setActiveChatUser={setActiveChatUser}
          getMessagesForUser={getMessagesForUser}
          // Anonymous mode toggle
          isAnonymous={isAnonymous}
          setIsAnonymous={setIsAnonymous}
        />
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Chat List */}
          <ConversationSidebar
            chats={chats}
            isChatsLoading={isChatsLoading}
            isChatLoadingError={isChatLoadingError}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            activeChatUser={activeChatUser}
            setActiveChatUser={setActiveChatUser}
            getMessagesForUser={getMessagesForUser}
            showGroupModal={showGroupModal}
            setShowGroupModal={setShowGroupModal}
          />

          {/* Main Chat Area */}
          <ChatArea
            activeChatUser={activeChatUser}
            isAnonymous={isAnonymous}
            messages={messages}
            loadingMessages={loadingMessages}
            isTyping={isTyping}
            typingUsers={typingUsers}
            message={message}
            setMessage={setMessage}
            sendMessageHandler={sendMessageHandler}
          />
        </div>

        <GroupCreationModal
          showGroupModal={showGroupModal}
          setShowGroupModal={setShowGroupModal}
          chats={chats}
        />
      </div>
    </TooltipProvider>
  );
};

export default Home;
