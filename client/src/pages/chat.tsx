import { useState } from "react";
import { useParams } from "wouter";
import Sidebar from "@/components/chat/sidebar";
import ChatHeader from "@/components/chat/chat-header";
import ChatMessages from "@/components/chat/chat-messages";
import ChatInput from "@/components/chat/chat-input";
import SettingsModal from "@/components/chat/settings-modal";
import { useQuery } from "@tanstack/react-query";

export default function ChatPage() {
  const { id } = useParams<{ id?: string }>();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(id || null);

  const { data: conversations = [] } = useQuery({
    queryKey: ['/api/conversations'],
  });

  const currentConversation = (conversations as any[]).find((conv: any) => conv.id === currentConversationId);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar 
        conversations={conversations as any[]}
        currentConversationId={currentConversationId}
        onConversationSelect={setCurrentConversationId}
        onSettingsClick={() => setIsSettingsOpen(true)}
        data-testid="sidebar-main"
      />
      
      <div className="flex-1 flex flex-col">
        <ChatHeader 
          conversation={currentConversation}
          onSettingsClick={() => setIsSettingsOpen(true)}
          data-testid="chat-header"
        />
        
        <ChatMessages 
          conversationId={currentConversationId}
          data-testid="chat-messages"
        />
        
        <ChatInput 
          conversationId={currentConversationId}
          onConversationCreated={setCurrentConversationId}
          data-testid="chat-input"
        />
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        data-testid="settings-modal"
      />
    </div>
  );
}
