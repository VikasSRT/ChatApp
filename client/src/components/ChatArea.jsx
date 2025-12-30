import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, Info, MoreVerticalIcon, User, Users, X } from "lucide-react";
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

  // NEW: Auto-scroll ref
  const messagesEndRef = useRef(null);

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
      console.error("Failed to update message", error);
    }
  };

  const onEmojiClick = (emojiObject) => {
    setMessage(message + emojiObject.emoji);
  };

  // Scroll to bottom whenever messages change or someone starts typing
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

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
      console.log("error: failed to delete message", error);
    }
  };

  return (
    <main className="flex-1 flex flex-col min-h-0 overflow-hidden bg-card/30 backdrop-blur-sm">
      {/* Chat Header */}
      {activeChatUser?.id && (
        <div className="border-b border-gray-200 dark:border-gray-700 p-3 bg-white backdrop-blur-sm">
          <div className="flex items-center justify-between">
            {/* Left Section - User Info */}
            <div className="flex items-center space-x-3 min-w-0">
              {/* Avatar */}
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

              {/* NEW: Group Options Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <MoreVerticalIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 rounded-xl border border-gray-100 bg-white/90 backdrop-blur-sm shadow-lg p-2"
                >
                  {activeChatUser?.type.includes("group") ? (
                    <>
                      {/* Group Members Option */}
                      <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
                          <Users className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          View Group Members
                        </span>
                      </div>

                      {/* Divider */}
                      <div className="my-1 h-px bg-gray-100" />

                      {/* Group ID */}
                      <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-default">
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mr-3">
                          <Info className="h-4 w-4" />
                        </div>
                        <span className="text-xs text-gray-500">
                          Group ID: {activeChatUser?.id}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Profile Option */}
                      <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
                          <User className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          View Profile
                        </span>
                      </div>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area - UPDATED DESIGN */}
      <div className="flex-1 overflow-y-auto p-4 bg-amber-50/60 custom-scrollbar">
        {loadingMessages ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-60">
            <div className="bg-amber-100 p-4 rounded-full mb-3">
              <MessageCircle className="h-8 w-8 text-amber-600" />
            </div>
            <p className="text-sm font-medium">
              No messages yet. Say hello! 👋
            </p>
          </div>
        ) : (
          messages?.map((msg, index) => {
            const isCurrentUser = msg?.sender?._id === userData?.userId;
            const isEditing = editingMessageId === msg._id;

            // Check if previous message was from same user to group them visually
            const isSequence =
              index > 0 &&
              messages[index - 1]?.sender?._id === msg?.sender?._id;

            return (
              <div
                key={msg._id || index}
                className={`flex w-full group ${
                  isCurrentUser ? "justify-end" : "justify-start"
                } ${isSequence ? "mt-1" : "mt-4"}`}
              >
                {/* Avatar: Only show for others, and only if it's the start of a sequence or standalone */}
                {!isCurrentUser && (
                  <div
                    className={`flex flex-col justify-end mr-2 w-8 ${
                      isSequence ? "invisible" : ""
                    }`}
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-100 to-purple-200 border border-white shadow-sm flex items-center justify-center">
                      <span className="text-violet-700 font-bold text-xs uppercase">
                        {msg?.sender?.username?.charAt(0)}
                      </span>
                    </div>
                  </div>
                )}

                <div
                  className={`flex items-end gap-2 max-w-[75%] ${
                    isCurrentUser ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`relative px-4 py-2 shadow-sm transition-all ${
                      isCurrentUser
                        ? "bg-violet-600 text-white rounded-2xl rounded-tr-sm"
                        : "bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-sm"
                    }`}
                  >
                    {/* Username: Only show for others in group chats */}
                    {!isCurrentUser && !isSequence && (
                      <span className="text-[11px] font-bold text-violet-600 block mb-1">
                        {msg?.sender?.username}
                      </span>
                    )}

                    {/* Conditional Rendering: Edit Input vs Text */}
                    {isEditing ? (
                      <div className="flex flex-col space-y-2 min-w-[220px]">
                        <Input
                          multiline="true"
                          className={`min-h-[2.5rem] text-sm border-none focus-visible:ring-1 focus-visible:ring-offset-0 ${
                            isCurrentUser
                              ? "bg-white/10 text-white placeholder:text-white/50 focus-visible:ring-white/30"
                              : "bg-gray-50 text-black focus-visible:ring-violet-400"
                          }`}
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleUpdate(msg._id);
                            if (e.key === "Escape") handleCancelEdit();
                          }}
                          autoFocus
                        />
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className={`h-6 w-6 hover:bg-black/10 ${
                              isCurrentUser
                                ? "text-red-200 hover:text-red-100"
                                : "text-red-500 hover:text-red-600"
                            }`}
                            onClick={handleCancelEdit}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className={`h-6 w-6 hover:bg-black/10 ${
                              isCurrentUser
                                ? "text-green-200 hover:text-green-100"
                                : "text-green-600 hover:text-green-700"
                            }`}
                            onClick={() => handleUpdate(msg._id)}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-end gap-2">
                        <p
                          className={`text-sm leading-relaxed whitespace-pre-wrap ${
                            isCurrentUser ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {typeof msg?.content === "object"
                            ? msg.content
                            : msg?.content}
                          {msg.isEdited && (
                            <span className="text-[10px] ml-1 opacity-60 italic">
                              (edited)
                            </span>
                          )}
                        </p>
                        <span
                          className={`text-[10px] min-w-fit ${
                            isCurrentUser ? "text-violet-200" : "text-gray-400"
                          }`}
                        >
                          {new Date(msg?.createdAt)?.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Options Menu (Three Dots) */}
                  {isCurrentUser && !isEditing && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full hover:bg-gray-200/50"
                        >
                          <MoreVertical className="h-3.5 w-3.5 text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-32 rounded-xl border border-gray-200 bg-white/95 backdrop-blur-sm shadow-lg p-1"
                      >
                        <DropdownMenuItem
                          onClick={() => handleEditClick(msg)}
                          className="cursor-pointer text-xs rounded-lg py-2 px-3 hover:bg-gray-50"
                        >
                          <span className="flex items-center">
                            <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                          </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(msg._id)}
                          className="cursor-pointer text-xs rounded-lg py-2 px-3 hover:bg-red-50 text-red-600"
                        >
                          <span className="flex items-center">
                            <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                          </span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Improved Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 mt-4 ml-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-3">
              <span className="text-xs font-medium text-gray-500">
                {typingUsers?.length > 2
                  ? "Several people are typing"
                  : `${typingUsers
                      ?.map((c) => c.username)
                      .join(", ")} is typing`}
              </span>
              <div className="flex space-x-1">
                <span
                  className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Area */}
      {activeChatUser?.id && (
        <div className="border-t p-4 bg-card/70 relative">
          {showEmojiPicker && (
            <div
              ref={emojiRef}
              className="absolute bottom-20 left-4 z-50 shadow-xl rounded-xl"
            >
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                theme="auto"
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
      )}
    </main>
  );
};

export default ChatArea;
