import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ConversationSidebar = ({
  chats,
  isChatsLoading,
  isChatLoadingError,
  sidebarOpen,
  setSidebarOpen,
  activeChatUser,
  setActiveChatUser,
  getMessagesForUser,
  showGroupModal,
  setShowGroupModal,
}) => {
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
                className={`border-1 hover:border-primary/50 cursor-pointer transition-all duration-200 rounded-none`}
                onClick={() => handleInitializeChat(chatObj)}
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
                      <h3 className="font-medium truncate">{chatObj?.name}</h3>
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
          }}
        >
          <span className="mr-2">+</span> Start Group Chat
        </Button>
      </div>
    </aside>
  );
};

export default ConversationSidebar;
