import React from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useUIStore from "@/stores/useUIStore";
import useChatStore from "@/stores/useChatStore";
import { cn } from "@/lib/utils";

const ConversationSidebar = () => {
  const { setShowGroupModal, sidebarOpen } = useUIStore();
  const {
    chats,
    isChatsLoading,
    isChatLoadingError,
    activeChatUser,
    setActiveChatUser,
    getMessagesForUser,
  } = useChatStore();

  const handleInitializeChat = (chatObj) => {
    if (chatObj?.id === activeChatUser?.id) return;
    setActiveChatUser(chatObj);
    getMessagesForUser(chatObj);
  };

  return (
    <aside
      className={`${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 transition-transform duration-300 ease-in-out border-r bg-white w-full md:w-80 lg:w-96 flex flex-col h-full fixed md:static z-40`}
    >
      {/* Header Section */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold flex items-center text-gray-800">
          <MessageCircle className="mr-2 h-5 w-5 text-primary" />
          Your Conversations
        </h2>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isChatsLoading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-sm text-gray-500">Loading conversations...</p>
          </div>
        ) : isChatLoadingError ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-10 h-10 mb-2 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <p className="text-sm text-red-500">Error loading conversations</p>
          </div>
        ) : chats?.length === 0 && !isChatsLoading ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="w-16 h-16 mb-3 rounded-full bg-gray-100 flex items-center justify-center">
              <MessageCircle className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-800 mb-1">
              No conversations yet
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Start a new chat to begin
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {chats?.map((chatObj, i) => (
              <div
                key={i}
                className={cn(
                  "cursor-pointer transition-colors duration-200",
                  activeChatUser?.id === chatObj?.id
                    ? "bg-gray-50 border-l-4 border-primary"
                    : "hover:bg-gray-50"
                )}
                onClick={() => handleInitializeChat(chatObj)}
              >
                <div className="p-4 flex items-center gap-4">
                  <div className="relative shrink-0">
                    <Avatar className="w-12 h-12 border border-gray-200">
                      <AvatarImage src={chatObj?.avatar} alt={chatObj?.name} />
                      <AvatarFallback className="font-medium bg-gray-100 text-gray-700">
                        {chatObj?.name?.[0]?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    {chatObj?.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-medium text-gray-800 truncate">
                        {chatObj?.name}
                      </h3>
                      <span className="text-xs text-gray-500 shrink-0 ml-2">
                        {i === 0 ? "2m ago" : `${i * 5}m ago`}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 truncate">
                      {chatObj?.lastMessage?.content || "No messages yet"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Start Group Chat Button */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <Button
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 transition-all duration-200"
          onClick={() => setShowGroupModal(true)}
        >
          <span className="mr-2">+</span> Start Group Chat
        </Button>
      </div>
    </aside>
  );
};

export default ConversationSidebar;
