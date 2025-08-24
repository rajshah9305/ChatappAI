import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Settings, User, LogOut, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Conversation } from "@shared/schema";

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onConversationSelect: (id: string) => void;
  onSettingsClick: () => void;
}

const providerColors: Record<string, string> = {
  openai: "bg-blue-100 text-blue-800",
  anthropic: "bg-green-100 text-green-800", 
  google: "bg-purple-100 text-purple-800",
  huggingface: "bg-yellow-100 text-yellow-800",
  cerebras: "bg-red-100 text-red-800",
  sambanova: "bg-indigo-100 text-indigo-800",
  mistral: "bg-orange-100 text-orange-800",
  cohere: "bg-pink-100 text-pink-800",
  xai: "bg-gray-100 text-gray-800",
  perplexity: "bg-cyan-100 text-cyan-800",
  together: "bg-emerald-100 text-emerald-800",
  fireworks: "bg-violet-100 text-violet-800"
};

export default function Sidebar({ 
  conversations, 
  currentConversationId, 
  onConversationSelect, 
  onSettingsClick 
}: SidebarProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createConversationMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/conversations', {
      title: 'New Chat',
      provider: 'openai',
      model: 'gpt-4o'
    }),
    onSuccess: async (response) => {
      const conversation = await response.json();
      onConversationSelect(conversation.id);
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create new conversation",
        variant: "destructive"
      });
    }
  });

  const deleteConversationMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/conversations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      if (currentConversationId && conversations.find(c => c.id === currentConversationId)) {
        onConversationSelect(conversations[0]?.id || '');
      }
      toast({
        title: "Success",
        description: "Conversation deleted",
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to delete conversation",
        variant: "destructive"
      });
    }
  });

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHrs < 1) return "Just now";
    if (diffHrs < 24) return `${diffHrs} hours ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays} days ago`;
  };

  return (
    <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-slate-800" data-testid="app-title">ChatNova</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSettingsClick}
            data-testid="button-settings"
          >
            <Settings className="h-4 w-4 text-slate-600" />
          </Button>
        </div>
        
        <Button 
          className="w-full bg-primary text-white hover:bg-blue-700"
          onClick={() => createConversationMutation.mutate()}
          disabled={createConversationMutation.isPending}
          data-testid="button-new-chat"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Conversations */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`group p-3 rounded-lg cursor-pointer transition-colors ${
                conversation.id === currentConversationId
                  ? 'bg-slate-50 border-l-2 border-primary'
                  : 'hover:bg-slate-50'
              }`}
              onClick={() => onConversationSelect(conversation.id)}
              data-testid={`conversation-${conversation.id}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-slate-800 truncate" data-testid={`text-conversation-title-${conversation.id}`}>
                    {conversation.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${providerColors[conversation.provider] || 'bg-gray-100 text-gray-800'}`}>
                      {conversation.provider.charAt(0).toUpperCase() + conversation.provider.slice(1)}
                    </span>
                    <span className="text-xs text-slate-400" data-testid={`text-conversation-time-${conversation.id}`}>
                      {formatTimeAgo(conversation.updatedAt!)}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversationMutation.mutate(conversation.id);
                  }}
                  disabled={deleteConversationMutation.isPending}
                  data-testid={`button-delete-conversation-${conversation.id}`}
                >
                  <Trash2 className="h-3 w-3 text-slate-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-800" data-testid="text-username">Demo User</p>
            <p className="text-xs text-slate-500">Free Plan</p>
          </div>
          <Button variant="ghost" size="sm" data-testid="button-logout">
            <LogOut className="h-4 w-4 text-slate-600" />
          </Button>
        </div>
      </div>
    </div>
  );
}
