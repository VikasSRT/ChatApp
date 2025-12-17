import React, { use, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Menu,
  MessageCircle,
  Users,
  Settings,
  LogOut,
  Smile, // Added for input area
  Paperclip, // Added for input area
  SendHorizontal, // Added for input area
  MoreVertical, // Added for chat header
  Video, // Added for chat header
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider, // NOTE: Added provider wrapper for Tooltips
} from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { connectWS } from "@/lib/connectWS";
import { useApi } from "@/hooks/useApi";
import Navbar from "@/components/Navbar";
import GroupCreationModal from "@/components/GroupCreationModal";
import ConversationSidebar from "@/components/ConversationSidebar";
import ChatArea from "@/components/ChatArea";

const Home = () => {
  const { tokenSetter, userData } = useAuth();
  const socket = useRef(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupCreating, setGroupCreating] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [message, setMessage] = useState("");
  const debounceRef = useRef(null);
  const {
    loading: isChatsLoading,
    error: isChatLoadingError,
    fetchData: fetchChats,
  } = useApi("/chats");
  const {
    loading: isUsersLoading,
    error: isUserLoadingError,
    fetchData: fetchUsers,
  } = useApi("/users/search");
  const { loading, error, fetchData } = useApi("/rooms/direct", "POST");
  const { fetchData: createGroupChat } = useApi("/rooms/group", "POST");
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
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);

  const handleLogout = () => {
    tokenSetter(null);
  };

  const toggleAnonymousMode = () => {
    setIsAnonymous(!isAnonymous);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length < 2) return;

    setGroupCreating(true);

    const response = await createGroupChat({
      name: groupName,
      members: selectedUsers,
    });
    const data = response?.data;

    // 2. Join the new group room
    socket.current.emit("joinRoom", data.room._id);

    // 3. Add to chats list
    setChats((prev) => [data.room, ...prev]);

    // 4. Open the new group chat
    setActiveChatUser({
      id: data.room._id,
      name: data.room.name,
      isGroup: true,
      type: "group",
    });

    // 5. Get initial messages
    getMessagesForUser({ id: data.room._id });

    // 6. Close modal and reset
    setShowGroupModal(false);
    setGroupName("");
    setSelectedUsers([]);
    setSearchText("");
    setUserSearchResults([]);

    setGroupCreating(false);
  };

  // Fetch Chats on component mount
  const getChats = async () => {
    const response = await fetchChats();
    const data = response?.data;
    setChats(data);
    console.log("Chats data:", data);
  };

  // Search users with debounce
  const searchHandler = async (text) => {
    console.log("Does it run");
    setSearchText(text);
    clearTimeout(debounceRef.current);

    if (!text.trim()) {
      setUserSearchResults([]);
      setHasSearched(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const response = await fetchUsers(null, {
          params: { q: text },
        });
        const data = response?.data;
        console.log("Search results:", data);
        setUserSearchResults(data);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Search error:", error);
        }
      }
      setHasSearched(true);
    }, 500);
  };

  // Start chat with selected user from search results
  const startChatHandler = async (user) => {
    setSearchText("");
    setUserSearchResults([]);
    const response = await fetchData({ userId: user._id });
    const data = response?.data;
    setHasSearched(false);
    setActiveChatUser({
      id: data.room.id,
      isGroup: false,
      name: user?.username,
      type: data.room.type,
    });
    console.log("user", user);
    console.log("data", data);
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

  const handleWriteMessage = (e) => {
    setMessage(e.target.value);

    const { exp, iat, ...user } = userData;

    console.log("user", user);

    if (e.target.value) {
      socket.current.emit("typing", user);
    } else {
      socket.current.emit("stop-typing", user);
    }
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
          // Search functionality
          searchText={searchText}
          isUsersLoading={isUsersLoading}
          isUserLoadingError={isUserLoadingError}
          userSearchResults={userSearchResults}
          hasSearched={hasSearched}
          searchHandler={searchHandler}
          startChatHandler={startChatHandler}
          // Authentication & user state
          userData={userData}
          handleLogout={handleLogout}
          // Anonymous mode toggle
          isAnonymous={isAnonymous}
          toggleAnonymousMode={toggleAnonymousMode}
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
            userData={userData}
            activeChatUser={activeChatUser}
            isAnonymous={isAnonymous}
            messages={messages}
            loadingMessages={loadingMessages}
            isTyping={isTyping}
            typingUsers={typingUsers}
            message={message}
            setMessage={setMessage}
            sendMessageHandler={sendMessageHandler}
            handleWriteMessage={handleWriteMessage}
          />
        </div>

        <GroupCreationModal
          showGroupModal={showGroupModal}
          setShowGroupModal={setShowGroupModal}
          groupName={groupName}
          setGroupName={setGroupName}
          selectedUsers={selectedUsers}
          setSelectedUsers={setSelectedUsers}
          groupCreating={groupCreating}
          searchText={searchText}
          isUsersLoading={isUsersLoading}
          userSearchResults={userSearchResults}
          hasSearched={hasSearched}
          searchHandler={searchHandler}
          startChatHandler={startChatHandler}
          handleCreateGroup={handleCreateGroup}
          chats={chats}
        />
      </div>
    </TooltipProvider>
  );
};

export default Home;
