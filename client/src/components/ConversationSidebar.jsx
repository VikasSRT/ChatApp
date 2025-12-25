import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useUIStore from "@/stores/useUIStore";
import useChatStore from "@/stores/useChatStore";

const ConversationSidebar = () => {
  const { setShowGroupModal, sidebarOpen } = useUIStore();
  const {
    chats,
    isChatsLoading,
    isChatLoadingError,
    setActiveChatUser,
    getMessagesForUser,
  } = useChatStore();

  const handleInitializeChat = (chatObj) => {
    setActiveChatUser(chatObj);
    getMessagesForUser(chatObj);
  };

  return (
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
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 cursor-pointer transition-colors duration-150 rounded-none"
                onClick={() => handleInitializeChat(chatObj)}
              >
                <CardContent className="p-3 flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-800 dark:text-gray-200 font-medium">
                      {chatObj?.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    {chatObj?.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-500 border border-white dark:border-gray-800"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-medium truncate max-w-[180px] text-gray-900 dark:text-gray-100">
                        {chatObj?.name}
                      </h3>
                      <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap ml-2">
                        {i === 0 ? "2m ago" : `${i * 5}m ago`}
                      </span>
                    </div>

                    <div className="flex items-center mt-1">
                      {chatObj?.hasUnread && (
                        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2 flex-shrink-0"></span>
                      )}
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {chatObj?.lastMessage?.content}
                      </p>
                    </div>
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
          }}
        >
          <span className="mr-2">+</span> Start Group Chat
        </Button>
      </div>
    </aside>
  );
};

export default ConversationSidebar;
