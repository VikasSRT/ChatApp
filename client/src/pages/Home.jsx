// pages/Home.js
import React, { useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import useChatStore from "@/stores/useChatStore";
import Navbar from "@/components/Navbar";
import ConversationSidebar from "@/components/ConversationSidebar";
import ChatArea from "@/components/ChatArea";
import GroupCreationModal from "@/components/GroupCreationModal";

const Home = () => {
  const {
    connectSocket,
    disconnectSocket,
    initializeChats,
    setupSocketListeners,
    cleanupSocket,
  } = useChatStore();

  useEffect(() => {
    connectSocket();
    setupSocketListeners();

    initializeChats();

    return () => {
      cleanupSocket();
      disconnectSocket();
    };
  }, []);

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen bg-background text-foreground">
        <Navbar />

        <div className="flex flex-1 overflow-hidden">
          <ConversationSidebar />
          <ChatArea />
        </div>
        <GroupCreationModal />
      </div>
    </TooltipProvider>
  );
};

export default Home;
