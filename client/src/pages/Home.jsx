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
  }, []);

  console.log("messages", messages);

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen bg-background text-foreground">
        {/* Navbar */}
        <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo Section */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <Menu className="h-6 w-6" />
                </Button>
                <div className="flex items-center space-x-2">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                    Mehfil
                  </span>
                </div>
              </div>

              {/* Search Bar - Centered on desktop, hidden on mobile */}
              <div className="hidden md:block max-w-xl mx-auto relative">
                {" "}
                {/* Added relative positioning */}
                <div className="relative md:w-80 lg:w-96">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    name="search"
                    value={searchText}
                    onChange={(e) => searchHandler(e.target.value)}
                    placeholder="Search users..."
                    className="pl-10 pr-4 py-2 bg-muted/50 border-muted focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all"
                    autoComplete="off"
                  />

                  {/* Loading indicator inside input */}
                  {isUsersLoading && searchText && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                {/* Search Results Dropdown */}
                {searchText && (
                  <div className="absolute z-50 w-full mt-1 bg-card border border-muted rounded-lg shadow-lg max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-1">
                    <div className={`${isUsersLoading ? "p-2" : ""} bg-white`}>
                      {isUsersLoading ? (
                        <div className="py-8 text-center text-muted-foreground">
                          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                          Searching users...
                        </div>
                      ) : isUserLoadingError ? (
                        <div className="py-4 text-center text-destructive text-sm">
                          Failed to search users. Please try again.
                        </div>
                      ) : userSearchResults?.length === 0 && hasSearched ? (
                        <div className="py-4 text-center text-muted-foreground text-sm">
                          No users found matching "{searchText}"
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {userSearchResults?.map((user, index) => (
                            <div
                              key={user?._id || index}
                              className="flex items-center p-2 rounded-md hover:bg-accent/50 cursor-pointer transition-colors group"
                              onClick={() => {
                                setSearchText("");
                                // setUserSearchResults([]);
                                // Handle user selection here
                                console.log("Selected user:", user);
                              }}
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={
                                    user?.avatar ||
                                    `/avatars/${(index % 5) + 1}.png`
                                  }
                                  alt={user?.username}
                                />
                                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                  {user?.name?.charAt(0) ||
                                    user?.username?.charAt(0) ||
                                    "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="ml-3 flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {user?.username || `User ${index + 1}`}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {user?.email || "user@example.com"}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 text-xs px-2 bg-primary/10 hover:bg-primary/20 text-primary cursor-pointer"
                                onClick={() => startChatHandler(user)}
                              >
                                Chat
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side Controls */}
              <div className="flex items-center space-x-3">
                {/* Theme Toggle (REMOVED) */}

                {/* Anonymous Mode Button */}
                <Button
                  onClick={toggleAnonymousMode}
                  className={`${
                    isAnonymous
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/30"
                      : "bg-background hover:bg-accent border border-dashed border-purple-400/50 text-purple-400 hover:text-purple-500"
                  } transition-all duration-300 group`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">
                      {isAnonymous
                        ? "Anonymous Mode: ON"
                        : "Anonymous Chat Mode"}
                    </span>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isAnonymous ? "bg-white" : "bg-purple-400"
                      } transition-all duration-300 group-hover:scale-125`}
                    />
                  </div>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-9 w-9 rounded-full"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage src="/avatars/01.png" alt="User" />
                        <AvatarFallback>
                          <span className="font-medium text-primary">JD</span>
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56 mr-4"
                    align="end"
                    forceMount
                  >
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {userData?.username}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {userData?.email || ""}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Users className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-500 focus:text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden px-4 py-2 border-t">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search chats..."
                className="pl-10 pr-4 py-2 bg-muted/50 border-muted focus:bg-background focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </nav>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Chat List */}
          <aside
            className={`${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } md:translate-x-0 transition-transform duration-300 ease-in-out border-r bg-card/50 backdrop-blur-sm w-full md:w-80 lg:w-96 flex flex-col h-full fixed md:static z-40`}
          >
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold flex items-center">
                <MessageCircle className="mr-2 h-5 w-5 text-primary" />
                Your Conversations
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="">
                {isChatsLoading ? (
                  <p className="text-center text-muted-foreground mt-10">
                    Loading chats...
                  </p>
                ) : isChatLoadingError ? (
                  <p className="text-center text-destructive mt-10">
                    Error loading chats.
                  </p>
                ) : chats?.length === 0 && !isChatsLoading ? (
                  <p className="text-center text-muted-foreground mt-10">
                    No conversations yet. Start a new chat!
                  </p>
                ) : (
                  chats?.map((chatObj, i) => (
                    <Card
                      key={i}
                      className={`border-1 hover:border-primary/50 cursor-pointer transition-all duration-200 rounded-none`}
                      onClick={() => {
                        setActiveChatUser(chatObj);
                        console.log("chatObj", chatObj);
                        getMessagesForUser(chatObj);
                      }}
                    >
                      <CardContent className="p-3 flex items-center space-x-3">
                        <Avatar className="h-10 w-10 border-1 ring-1 ring-primary/20">
                          <AvatarImage
                            src={`/avatars/${i + 1}.png`}
                            alt={`User ${i + 1}`}
                          />
                          <AvatarFallback>{chatObj?.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium truncate">
                              {chatObj?.name}
                            </h3>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {i === 0 ? "2m ago" : `${i * 5}m ago`}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {chatObj?.lastMessage?.content}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            <div className="p-4 border-t">
              <Button
                className="w-full bg-indigo-500 text-white cursor-pointer hover:bg-indigo-600 transition-all duration-300"
                onClick={() => {
                  setShowGroupModal(true);
                  setSearchText("");
                  setUserSearchResults([]);
                }}
              >
                <span className="mr-2">+</span> Start Group Chat
              </Button>
            </div>
          </aside>

          {/* Main Chat Area */}
          <main className="flex-1 flex flex-col min-h-0 overflow-hidden bg-card/30 backdrop-blur-sm">
            {/* Chat Header */}
            <div className="border-b p-4 flex items-center justify-between bg-card/70">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-6 w-6" />
                </Button>
                <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                  <AvatarImage src="/avatars/01.png" alt="John Doe" />
                  <AvatarFallback>
                    {activeChatUser?.name
                      ?.split(" ")
                      .map((c) => `${c?.charAt(0)?.toUpperCase()} `)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="font-bold text-lg">{activeChatUser?.name}</h1>
                  <div className="flex items-center space-x-1">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isAnonymous ? "bg-purple-500" : "bg-green-500"
                      }`}
                    />
                    <span className="text-sm text-muted-foreground">
                      {isAnonymous ? "Anonymous User" : "Online"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MessageCircle className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Start voice call</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Video className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Start video call</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>More options</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-amber-50/60">
              {loadingMessages ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages?.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No messages yet</p>
                  <p className="text-sm mt-1">Start the conversation!</p>
                </div>
              ) : (
                messages?.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg?.sender?._id === userData?.userId
                        ? "justify-end"
                        : "items-end"
                    }`}
                  >
                    {!msg?.sender?._id && (
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                        <span className="text-purple-600 font-medium text-xs">
                          {msg?.sender?.username?.charAt(0)}
                        </span>
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] rounded-xl p-3 ${
                        msg?.sender?._id === userData?.userId
                          ? "bg-primary bg-green-300 text-primary-foreground rounded-tl-none"
                          : "bg-card bg-blue-300 rounded-tr-none"
                      }`}
                    >
                      <span
                        className={`text-xs mb-1.5 font-bold block ${
                          msg?.sender?._id === userData?.userId
                            ? "text-right opacity-90"
                            : "text-muted-foreground"
                        }`}
                      >
                        {msg?.sender?.username}
                      </span>
                      <p
                        className={
                          msg?.sender?._id === userData?.userId
                            ? ""
                            : "text-muted-foreground"
                        }
                      >
                        {msg.content}
                      </p>
                      <span
                        className={`text-xs mt-1 block ${
                          msg?.sender?._id === userData?.userId
                            ? "text-right opacity-90"
                            : "text-muted-foreground"
                        }`}
                      >
                        {new Date(msg?.createdAt)?.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input Area */}
            <div className="border-t p-4 bg-card/70">
              <div className="flex items-end space-x-2 max-w-3xl mx-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Smile className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Paperclip className="h-5 w-5" />
                </Button>

                <div className="flex-1 min-w-0">
                  <Input
                    placeholder={
                      isAnonymous
                        ? "Send anonymous message..."
                        : "Type your message..."
                    }
                    className="min-h-[44px] bg-background/80 border border-muted"
                    name="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.keyCode === 13 && sendMessageHandler()}
                  />
                </div>

                <Button
                  size="icon"
                  className="bg-black hover:bg-primary/90 text-white rounded-full w-11 h-11 shadow-lg hover:cursor-pointer"
                  onClick={sendMessageHandler}
                >
                  <SendHorizontal className="h-5 w-5" />
                </Button>
              </div>

              {isAnonymous && (
                <p className="text-xs text-purple-400/90 mt-2 text-center max-w-md mx-auto">
                  <span className="font-medium">Anonymous Mode:</span> Your
                  identity is hidden. Messages cannot be traced back to your
                  account.
                </p>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Group Creation Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                   {" "}
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom duration-300">
                        {/* Header */}           {" "}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                           {" "}
              <div className="flex items-center space-x-3">
                               {" "}
                {/* Icon for Users - Use a lighter primary color */}           
                   {" "}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                                   {" "}
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2a3 3 0 015.356-1.857M7 20h10m0-2a3.003 3.003 0 00-5.356-1.857M5 9v-2m5.77 1.43l-3.374-3.375M13.89 17.51a3.001 3.001 0 005.11 0M12 18a6 6 0 00-6-6h-2a2 2 0 00-2 2v2a2 2 0 002 2h2a6 6 0 006-6m0 0a6 6 0 006-6h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2a6 6 0 00-6 6"
                  />
                                 {" "}
                </svg>
                               {" "}
                <h2 className="font-extrabold text-xl text-gray-800">
                  Create New Group
                </h2>
                             {" "}
              </div>
                            {/* Close Button */}             {" "}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowGroupModal(false);
                  setSearchText("");
                  setUserSearchResults([]);
                  setSelectedUsers([]);
                  setGroupName("");
                }}
                className="hover:bg-gray-100 rounded-full"
              >
                               {" "}
                <span className="text-gray-500 hover:text-gray-900 text-xl font-light">
                                    ×                {" "}
                </span>
                             {" "}
              </Button>
                         {" "}
            </div>
                        {/* Group Name Input - Cleaner, better contrast */}     
                 {" "}
            <div className="px-5 pt-5 pb-3 border-b border-gray-100">
                           {" "}
              <Input
                placeholder="Choose a group name..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full py-2 px-3 border border-gray-300 rounded-lg text-lg font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                autoFocus
              />
                         {" "}
            </div>
                        {/* Search & User Selection */}           {" "}
            <div className="p-5">
                            {/* Search Bar */}             {" "}
              <div className="relative mb-4">
                                {/* Search Icon */}               {" "}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                                   {" "}
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                                 {" "}
                </svg>
                               {" "}
                <Input
                  placeholder="Search members to add..."
                  value={searchText}
                  onChange={(e) => searchHandler(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                />
                                {/* Loading indicator - Smoother look */}       
                       {" "}
                {isUsersLoading && searchText && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                       {" "}
                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                     {" "}
                  </div>
                )}
                             {" "}
              </div>
                           {" "}
              {/* Selected Users Preview - Lighter and more prominent */}       
                   {" "}
              {selectedUsers.length > 0 && (
                <div className="mb-4 pt-2 border-t border-dashed border-gray-200">
                                   {" "}
                  <h3 className="text-sm font-semibold mb-3 flex items-center text-gray-600">
                                       {" "}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1 text-indigo-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                                           {" "}
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19l-7-7 7-7"
                      />
                                         {" "}
                    </svg>
                                        Members Added ({selectedUsers.length})  
                                   {" "}
                  </h3>
                                   {" "}
                  <div className="flex flex-wrap gap-2">
                                       {" "}
                    {selectedUsers.map((userId) => {
                      const user =
                        userSearchResults.find((u) => u._id === userId) ||
                        chats
                          .find((c) => c._id === userId)
                          ?.participants?.find((p) => p._id === userId);
                      return (
                        <div
                          key={userId} // Subtle light blue pill style
                          className="flex items-center bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full pl-3 pr-1 py-1 text-sm font-medium"
                        >
                                                   {" "}
                          <span className="mr-1">
                                                       {" "}
                            {user?.username || user?.name || "User"}           
                                         {" "}
                          </span>
                                                   {" "}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 ml-1 hover:bg-indigo-200 rounded-full transition-colors"
                            onClick={() =>
                              setSelectedUsers((prev) =>
                                prev.filter((id) => id !== userId)
                              )
                            }
                          >
                                                       {" "}
                            <span className="text-xs">✕</span>                 
                                   {" "}
                          </Button>
                                                 {" "}
                        </div>
                      );
                    })}
                                     {" "}
                  </div>
                                 {" "}
                </div>
              )}
                            {/* User List */}             {" "}
              <div className="max-h-64 overflow-y-auto pr-1">
                               {" "}
                {searchText && (
                  <div className="space-y-1">
                                       {" "}
                    {isUsersLoading ? (
                      <div className="py-8 text-center text-gray-500">
                                               {" "}
                        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                                Searching members...            
                                 {" "}
                      </div>
                    ) : isUserLoadingError ? (
                      <div className="py-4 text-center text-red-500 text-sm">
                                                Failed to search users. Please
                        try again.                      {" "}
                      </div>
                    ) : userSearchResults.length === 0 && hasSearched ? (
                      <div className="py-4 text-center text-gray-500 text-sm">
                                                No users found matching "
                        <span className="font-semibold">{searchText}</span>"    
                                         {" "}
                      </div>
                    ) : (
                      userSearchResults.map((user) => {
                        const isSelected = selectedUsers.includes(user._id);
                        return (
                          <div
                            key={user._id}
                            className={`flex items-center p-3 rounded-xl cursor-pointer transition-all ${
                              isSelected
                                ? "bg-indigo-50 border border-indigo-200"
                                : "hover:bg-gray-50"
                            }`}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedUsers((prev) =>
                                  prev.filter((id) => id !== user._id)
                                );
                              } else {
                                setSelectedUsers((prev) => [...prev, user._id]);
                              }
                            }}
                          >
                                                        {/* Avatar component */}
                                                       {" "}
                            <Avatar className="h-10 w-10">
                                                           {" "}
                              <AvatarImage
                                src={
                                  user.avatar ||
                                  `/avatars/${
                                    Math.floor(Math.random() * 5) + 1
                                  }.png`
                                }
                                alt={user.username}
                              />
                                                           {" "}
                              <AvatarFallback className="bg-indigo-100 text-indigo-600 font-bold">
                                                               {" "}
                                {user.username?.charAt(0) ||
                                  user.name?.charAt(0) ||
                                  "U"}
                                                             {" "}
                              </AvatarFallback>
                                                         {" "}
                            </Avatar>
                                                       {" "}
                            <div className="ml-3 flex-1 min-w-0">
                                                           {" "}
                              <p className="font-semibold truncate text-gray-900">
                                                               {" "}
                                {user.username || user.name}                   
                                         {" "}
                              </p>
                                                           {" "}
                              <p className="text-xs text-gray-500 truncate">
                                                                {user.email}   
                                                         {" "}
                              </p>
                                                         {" "}
                            </div>
                                                       {" "}
                            {/* Selection Checkmark */}                         
                             {" "}
                            {isSelected && (
                              <div className="h-5 w-5 rounded-full bg-indigo-500 flex items-center justify-center border-2 border-white shadow-md">
                                                               {" "}
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 text-white"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                                                   {" "}
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 13.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                                                 {" "}
                                </svg>
                                                             {" "}
                              </div>
                            )}
                                                     {" "}
                          </div>
                        );
                      })
                    )}
                                     {" "}
                  </div>
                )}
                             {" "}
              </div>
                         {" "}
            </div>
                        {/* Footer Buttons */}           {" "}
            <div className="p-4 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50">
                           {" "}
              <Button
                variant="outline"
                onClick={() => {
                  setShowGroupModal(false);
                  setSearchText("");
                  setUserSearchResults([]);
                  setSelectedUsers([]);
                  setGroupName("");
                }}
                disabled={groupCreating} // Button style updated for clean look
                className="px-4 py-2 text-sm font-semibold rounded-lg text-gray-600 border border-gray-300 hover:bg-gray-200 transition-colors"
              >
                                Cancel              {" "}
              </Button>
                           {" "}
              <Button
                onClick={handleCreateGroup}
                disabled={
                  !groupName.trim() || selectedUsers.length < 2 || groupCreating
                } // Primary Button: Matches the 'Start Group Chat' button from the main app
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:bg-indigo-300"
              >
                               {" "}
                {groupCreating ? (
                  <>
                                       {" "}
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                        Creating...                  {" "}
                  </>
                ) : (
                  "Create Group"
                )}
                             {" "}
              </Button>
                         {" "}
            </div>
                     {" "}
          </div>
                 {" "}
        </div>
      )}
    </TooltipProvider>
  );
};

export default Home;
