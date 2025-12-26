import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    console.log("chatObj", chatObj);
    console.log("activeChatUser", activeChatUser);
    setActiveChatUser(chatObj);
    getMessagesForUser(chatObj);
  };

  return (
    <aside
      className={`${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 transition-transform duration-300 ease-in-out border-r bg-card/50 backdrop-blur-sm w-full md:w-80 lg:w-96 flex flex-col h-full fixed md:static z-40`}
    >
      <div className="p-[21px] border-b bg-gray-50">
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
                className={cn(
                  "border-b border-gray-100 cursor-pointer transition-colors duration-200 rounded-none shadow-none",
                  activeChatUser?.id === chatObj?.id
                    ? "bg-gray-100"
                    : "bg-transparent hover:bg-gray-50"
                )}
                onClick={() => handleInitializeChat(chatObj)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="relative shrink-0">
                    <Avatar className="w-12 h-12 border border-gray-400">
                      <AvatarImage src={chatObj?.avatar} alt={chatObj?.name} />
                      <AvatarFallback className="font-semibold bg-gray-100 text-gray-700">
                        {chatObj?.name?.[0]?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    {chatObj?.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-semibold text-base truncate text-gray-900">
                        {chatObj?.name}
                      </h3>
                      <span className="text-xs text-gray-500 shrink-0 ml-2">
                        {i === 0 ? "2m ago" : `${i * 5}m ago`}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <p className="text-sm text-gray-600 truncate">
                        {chatObj?.lastMessage?.content || "No messages yet"}
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
