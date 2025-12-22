import React, { useEffect, useState } from "react";
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
      <div className="border-b p-4 flex items-center justify-between bg-card/70">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 ring-2 ring-primary/20">
            <AvatarImage src="/avatars/01.png" alt="User" />
            <AvatarFallback>
              {activeChatUser?.name
                ?.split(" ")
                .map((c) => `${c?.charAt(0)?.toUpperCase()}`)}
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
          <Button variant="ghost" size="icon">
            <MessageCircle className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
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
      <div className="border-t p-4 bg-card/70">
        <div className="flex items-end space-x-2 max-w-3xl mx-auto">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Smile className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Paperclip className="h-5 w-5" />
          </Button>

          <div className="flex-1 min-w-0">
            <Input
              placeholder={
                isAnonymous
                  ? "Send anonymous message..."
                  : "Type your message..."
              }
              className="min-h-[44px] bg-background/80"
              value={message}
              onChange={handleWriteMessage}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
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
