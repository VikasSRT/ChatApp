import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageCircle,
  Video,
  MoreVertical,
  Smile,
  Paperclip,
  SendHorizontal,
  Menu,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/context/AuthContext";
import useUIStore from "@/stores/useUIStore";
import useChatStore from "@/stores/useChatStore";

const ChatArea = () => {
  const { userData } = useAuth();
  const { isAnonymous } = useUIStore();
  const {
    activeChatUser,
    messages,
    loadingMessages,
    isTyping,
    typingUsers,
    message,
    setMessage,
    sendMessageHandler,
  } = useChatStore();

  useEffect(() => {
    if (!message.trim() || !activeChatUser?.id) {
      const { socket } = useChatStore.getState();
      const { exp, iat, ...user } = userData;
      socket.emit("stop-typing", user);
      return;
    }

    const { socket } = useChatStore.getState();
    const { exp, iat, ...user } = userData;

    socket.emit("typing", user);

    const typingTimer = setTimeout(() => {
      socket.emit("stop-typing", user);
    }, 2000);

    return () => clearTimeout(typingTimer);
  }, [message, activeChatUser?.id, userData]);

  const handleWriteMessage = (e) => {
    setMessage(e.target.value);
  };

  const handleSend = () => {
    if (message.trim()) {
      sendMessageHandler(userData);
    }
  };

  return (
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

        {isTyping && (
          <div className="bg-gray-200 p-3 w-fit rounded-md text-lg font-bold flex items-center mb-4 transition-all duration-300 ease-in-out">
            <span className="text-black pr-2 text-sm">
              {typingUsers?.map((c) => c.username).join(", ")} is Typing
            </span>
            <span className="flex items-center space-x-1 h-6">
              <span className="inline-block w-1.5 h-1.5 bg-black rounded-full animate-bounce"></span>
              <span className="inline-block w-1.5 h-1.5 bg-black rounded-full animate-bounce delay-150"></span>
              <span className="inline-block w-1.5 h-1.5 bg-black rounded-full animate-bounce delay-300"></span>
            </span>
          </div>
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
              onChange={handleWriteMessage}
              onKeyDown={(e) => e.keyCode === 13 && handleSend()}
            />
          </div>

          <Button
            size="icon"
            className="bg-black hover:bg-primary/90 text-white rounded-full w-11 h-11 shadow-lg hover:cursor-pointer"
            onClick={handleSend}
          >
            <SendHorizontal className="h-5 w-5" />
          </Button>
        </div>

        {isAnonymous && (
          <p className="text-xs text-purple-400/90 mt-2 text-center max-w-md mx-auto">
            <span className="font-medium">Anonymous Mode:</span> Your identity
            is hidden. Messages cannot be traced back to your account.
          </p>
        )}
      </div>
    </main>
  );
};

export default ChatArea;
