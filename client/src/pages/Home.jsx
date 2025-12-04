import React, { useEffect, useRef, useState } from "react";
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
  const { tokenSetter } = useAuth();
  const socket = useRef(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState(null);
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
  const {
    loading: loadingMessages,
    error: messagesLoadingError,
    fetchData: fetchMessages,
  } = useApi("/messages/", "GET");
  const [chats, setChats] = useState([]);
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [messages, setMessages] = useState([]);

  const handleLogout = () => {
    tokenSetter(null);
  };

  const toggleAnonymousMode = () => {
    setIsAnonymous(!isAnonymous);
  };

  const getChats = async () => {
    const response = await fetchChats();
    const data = response?.data;
    setChats(data);
    console.log("Chats data:", data);
  };

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

  const startChatHandler = async (user) => {
    setSearchText("");
    setUserSearchResults([]);
    setHasSearched(false);
    setActiveChatUser(user);
    console.log("user", user);
    const response = await fetchData({ userId: user._id });
    const data = response?.data;
    console.log("data", data);
  };

  const getMessagesForUser = async (userObj) => {
    const response = await fetchMessages(null, {}, `${userObj.id}`);
    const data = response?.data;
    setMessages(data?.messages);
    console.log("Messages data:", data);
  };

  useEffect(() => {
    socket.current = connectWS();
    getChats();

    return () => clearTimeout(debounceRef.current);
  }, []);

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
                                setUserSearchResults([]);
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
                          John Doe
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          john.doe@example.com
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
            <div className="flex-1 overflow-y-auto p-2">
              <div className="space-y-1">
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
                      className={`border-l-4 ${
                        i === 0
                          ? "border-primary bg-primary/5"
                          : "border-transparent hover:border-primary/50"
                      } cursor-pointer transition-all duration-200`}
                      onClick={() => getMessagesForUser(chatObj)}
                    >
                      <CardContent className="p-3 flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
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

            {/* <div className="p-4 border-t">
              <Button className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-700 text-white">
                <span className="mr-2">+</span> New Chat
              </Button>
            </div> */}
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
                    {activeChatUser?.username
                      ?.split(" ")
                      .map((c) => `${c?.charAt(0)?.toUpperCase()} `)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="font-bold text-lg">
                    {activeChatUser?.username}
                  </h1>
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                    key={msg?._id || index}
                    className={`flex ${
                      msg?.sender?._id === msg?.currentUserId
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
                        msg?.sender?._id === msg?.currentUserId
                          ? "bg-primary text-primary-foreground rounded-tl-none"
                          : "bg-card border rounded-tr-none"
                      }`}
                    >
                      <p
                        className={
                          msg?.sender?._id === msg?.currentUserId
                            ? ""
                            : "text-muted-foreground"
                        }
                      >
                        {msg.content}
                      </p>
                      <span
                        className={`text-xs mt-1 block ${
                          msg?.sender?._id === msg?.currentUserId
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
                  />
                </div>

                <Button
                  size="icon"
                  className="bg-black hover:bg-primary/90 text-white rounded-full w-11 h-11 shadow-lg hover:cursor-pointer"
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
    </TooltipProvider>
  );
};

export default Home;
