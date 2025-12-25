import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, X } from "lucide-react";
import {
  MessageCircle,
  Video,
  MoreVertical,
  Smile,
  Paperclip,
  SendHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import useUIStore from "@/stores/useUIStore";
import useChatStore from "@/stores/useChatStore";
import EmojiPicker from "emoji-picker-react";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";

const ChatArea = () => {
  const { userData } = useAuth();
  const isAnonymous = useUIStore((state) => state.isAnonymous);
  const {
    activeChatUser,
    messages,
    loadingMessages,
    isTyping,
    typingUsers,
    message,
    setMessage,
    sendMessageHandler,
    deleteMessageHandler,
    editMessageHandler,
  } = useChatStore();

  // NEW: Local state for editing
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiRef = useRef(null);

  // Function to start editing
  const handleEditClick = (msg) => {
    setEditingMessageId(msg._id);
    setEditText(msg.content);
  };

  // Function to cancel editing
  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditText("");
  };

  // Function to submit edit
  const handleUpdate = async (messageId) => {
    if (!editText.trim()) return;
    try {
      await editMessageHandler(messageId, { content: editText });
      setEditingMessageId(null);
      setEditText("");
    } catch (error) {
      console.error("Failed to update message");
    }
  };

  const onEmojiClick = (emojiObject) => {
    setMessage(message + emojiObject.emoji);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleDelete = (messageId) => {
    try {
      deleteMessageHandler(messageId);
    } catch (error) {
      console.log("error: failed to delete message");
    }
  };

  return (
    <main className="flex-1 flex flex-col min-h-0 overflow-hidden bg-card/30 backdrop-blur-sm">
      {/* Chat Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-3 bg-white backdrop-blur-sm">
        <div className="flex items-center justify-between">
          {/* Left Section - User Info */}
          <div className="flex items-center space-x-3 min-w-0">
            {/* Avatar - Improved with consistent sizing */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-medium">
                {activeChatUser?.name
                  ?.split(" ")
                  .map((word) => word[0])
                  .join("")
                  .substring(0, 3)
                  .toUpperCase() || "U"}
              </div>
            </div>

            {/* User Details */}
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-lg truncate max-w-[180px]">
                  {activeChatUser?.name || "User"}
                </h1>

                {activeChatUser?.type.includes("group") && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                    Group
                  </span>
                )}
              </div>

              <div className="flex items-center mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                <span
                  className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                    isAnonymous ? "bg-purple-500" : "bg-green-500"
                  }`}
                ></span>
                {isAnonymous ? "Anonymous" : "Online"}
              </div>
            </div>
          </div>

          {/* Right Section - Action Buttons */}
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <MessageCircle className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </button>

            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <Video className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </button>

            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
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
          </div>
        ) : (
          messages?.map((msg, index) => {
            const isCurrentUser = msg?.sender?._id === userData?.userId;
            const isEditing = editingMessageId === msg._id;

            return (
              <div
                key={msg._id || index}
                className={`flex w-full group ${
                  isCurrentUser ? "justify-end" : "items-end"
                }`}
              >
                {!isCurrentUser && (
                  <div className="h-8 w-8 min-w-[32px] rounded-full bg-purple-100 flex items-center justify-center mr-2">
                    <span className="text-purple-600 font-medium text-xs">
                      {msg?.sender?.username?.charAt(0)}
                    </span>
                  </div>
                )}

                <div
                  className={`flex items-center gap-2 max-w-[80%] ${
                    isCurrentUser ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`rounded-xl p-3 ${
                      isCurrentUser
                        ? "bg-green-300 text-primary-foreground rounded-tl-none"
                        : "bg-card bg-blue-300 rounded-tr-none"
                    }`}
                  >
                    <span
                      className={`text-xs mb-1.5 font-bold block ${
                        isCurrentUser
                          ? "text-right opacity-90"
                          : "text-muted-foreground"
                      }`}
                    >
                      {msg?.sender?.username}
                    </span>

                    {/* Conditional Rendering: Edit Input vs Text */}
                    {isEditing ? (
                      <div className="flex flex-col space-y-2 min-w-[200px]">
                        <Input
                          multiline
                          className="h-8 bg-white/50 text-black border-none 
                          [&:focus-visible]:ring-0 
                          [&:focus-visible]:ring-offset-0
                          [&:focus-visible]:border-[1px] 
                          [&:focus-visible]:border-ring/50"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleUpdate(msg._id);
                            if (e.key === "Escape") handleCancelEdit();
                          }}
                          autoFocus
                        />
                        <div className="flex justify-end space-x-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-red-500"
                            onClick={handleCancelEdit}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-green-700"
                            onClick={() => handleUpdate(msg._id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p
                        className={
                          isCurrentUser ? "text-black" : "text-muted-foreground"
                        }
                      >
                        {typeof msg?.content === "object"
                          ? msg.content
                          : msg?.content}
                        {msg.isEdited && (
                          <span className="text-[10px] ml-1 opacity-50 italic">
                            (edited)
                          </span>
                        )}
                      </p>
                    )}

                    <span
                      className={`text-xs mt-1 block ${
                        isCurrentUser
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

                  {/* Options Menu */}
                  {isCurrentUser && !isEditing && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align={isCurrentUser ? "end" : "start"}
                      >
                        <DropdownMenuItem
                          onClick={() => handleEditClick(msg)}
                          className="cursor-pointer"
                        >
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(msg._id)}
                          className="text-red-600 cursor-pointer"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            );
          })
        )}

        {isTyping && (
          <div className="bg-gray-200 p-3 w-fit rounded-md text-sm font-bold flex items-center mb-4 animate-in fade-in">
            <span className="text-black pr-2">
              {typingUsers?.map((c) => c.username).join(", ")} is Typing
            </span>
            <span className="flex space-x-1">
              <span className="w-1 h-1 bg-black rounded-full animate-bounce" />
              <span className="w-1 h-1 bg-black rounded-full animate-bounce delay-75" />
              <span className="w-1 h-1 bg-black rounded-full animate-bounce delay-150" />
            </span>
          </div>
        )}
      </div>

      {/* Message Input Area */}
      <div className="border-t p-4 bg-card/70 relative">
        {showEmojiPicker && (
          <div
            ref={emojiRef}
            className="absolute bottom-20 left-4 z-50 shadow-xl rounded-xl"
          >
            <EmojiPicker
              onEmojiClick={onEmojiClick}
              theme="auto" // Adapts to your light/dark mode
              searchDisabled={false}
              width={300}
              height={400}
            />
          </div>
        )}
        <div className="flex items-end space-x-2 max-w-3xl mx-auto">
          <Button
            variant="ghost"
            className={`text-muted-foreground hover:text-yellow-400 hover:bg-yellow-50 rounded-full h-12 w-12 cursor-pointer ${
              showEmojiPicker ? "text-yellow-500 bg-yellow-100" : ""
            }`}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile className="h-8 w-8" />
          </Button>
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-blue-500 hover:bg-blue-50 h-12 w-12 rounded-full cursor-pointer"
          >
            <Paperclip className="h-6 w-6" />
          </Button>

          <div className="flex-1 min-w-0">
            <Textarea
              placeholder={
                isAnonymous
                  ? "Send anonymous message..."
                  : "Type your message..."
              }
              className="min-h-[44px] bg-background/80 max-h-[200px]"
              value={message}
              onChange={handleWriteMessage}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (!e.shiftKey) {
                    handleSend(e);
                  }
                }
              }}
            />
          </div>

          <Button
            size="icon"
            className="bg-black text-white rounded-full w-11 h-11 cursor-pointer"
            onClick={handleSend}
          >
            <SendHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </main>
  );
};

export default ChatArea;
