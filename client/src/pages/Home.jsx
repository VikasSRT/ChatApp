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
import { connectWS } from "@/lib/wsConnect";

const Home = () => {
  const { tokenSetter } = useAuth();
  const socket = useRef(null)
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    tokenSetter(null);
  };

  const toggleAnonymousMode = () => {
    setIsAnonymous(!isAnonymous);
  };

  useEffect(() => {
    socket.current = connectWS();
  }, [])
  

  // NOTE: You need to wrap your application or the area using Tooltips with TooltipProvider.
  // I've added a TooltipProvider wrapper around the return statement.

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen bg-background text-foreground">
        {/* Navbar */}
        <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <div className="hidden md:block max-w-xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search chats, contacts, or messages..."
                    className="pl-10 pr-4 py-2 bg-muted/50 border-muted focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
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
                {[...Array(8)].map((_, i) => (
                  <Card
                    key={i}
                    className={`border-l-4 ${
                      i === 0
                        ? "border-primary bg-primary/5"
                        : "border-transparent hover:border-primary/50"
                    } cursor-pointer transition-all duration-200`}
                  >
                    <CardContent className="p-3 flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={`/avatars/${i + 1}.png`}
                          alt={`User ${i + 1}`}
                        />
                        <AvatarFallback>{`U${i + 1}`}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium truncate">
                            Conversation with User {i + 1}
                          </h3>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {i === 0 ? "2m ago" : `${i * 5}m ago`}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {i === 0
                            ? "Hey there! How can I help you today?"
                            : "This is a preview of the last message in this conversation"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="p-4 border-t">
              <Button className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-700 text-white">
                <span className="mr-2">+</span> New Chat
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
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="font-bold text-lg">John Doe</h1>
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
              <div className="flex justify-center">
                <div className="bg-primary/5 text-primary px-4 py-1 rounded-full text-sm font-medium">
                  Today
                </div>
              </div>

              {/* Received Message */}
              <div className="flex items-end">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src="/avatars/02.png" alt="Sarah" />
                  <AvatarFallback>S</AvatarFallback>
                </Avatar>
                <div className="bg-card border rounded-xl rounded-tr-none p-3 max-w-[80%] shadow-sm">
                  <p className="text-muted-foreground">
                    Hey! How's your project coming along?
                  </p>
                  <span className="text-xs text-muted-foreground mt-1 block">
                    10:24 AM
                  </span>
                </div>
              </div>

              {/* Sent Message */}
              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground rounded-xl rounded-tl-none p-3 max-w-[80%] shadow-md">
                  <p>
                    It's going great! I just finished the design phase and
                    moving to development.
                  </p>
                  <span className="text-xs opacity-90 mt-1 block">
                    10:26 AM
                  </span>
                </div>
              </div>

              {/* Received Message with Image */}
              <div className="flex items-end">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src="/avatars/02.png" alt="Sarah" />
                  <AvatarFallback>S</AvatarFallback>
                </Avatar>
                <div className="bg-card border rounded-xl rounded-tr-none p-3 max-w-[80%] shadow-sm">
                  <p className="text-muted-foreground mb-2">
                    Check out this design I made for you:
                  </p>
                  <div className="rounded-lg overflow-hidden border border-dashed border-primary/30">
                    <img
                      src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
                      alt="Design preview"
                      className="w-48 h-32 object-cover"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 block">
                    10:30 AM
                  </span>
                </div>
              </div>

              {/* Sent Message */}
              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground rounded-xl rounded-tl-none p-3 max-w-[80%] shadow-md">
                  <p>
                    Wow! This looks amazing. Exactly what I was looking for.
                    Thank you!
                  </p>
                  <span className="text-xs opacity-90 mt-1 block">
                    10:32 AM
                  </span>
                </div>
              </div>

              {/* Received Message */}
              <div className="flex items-end mb-12">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src="/avatars/02.png" alt="Sarah" />
                  <AvatarFallback>S</AvatarFallback>
                </Avatar>
                <div className="bg-card border rounded-xl rounded-tr-none p-3 max-w-[80%] shadow-sm">
                  <p className="text-muted-foreground">
                    You're welcome! Let me know when you need the next part.
                  </p>
                  <span className="text-xs text-muted-foreground mt-1 block">
                    10:35 AM
                  </span>
                </div>
              </div>
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
                  className="bg-primary hover:bg-primary/90 text-white rounded-full w-11 h-11 shadow-lg hover:shadow-primary/50 transition-all duration-200 transform hover:scale-105"
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
