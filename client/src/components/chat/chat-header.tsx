import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Download } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Conversation } from "@shared/schema";

interface ChatHeaderProps {
  conversation: Conversation | undefined;
  onSettingsClick: () => void;
}

export default function ChatHeader({ conversation, onSettingsClick }: ChatHeaderProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: availableModels = [] } = useQuery({
    queryKey: ['/api/providers', conversation?.provider, 'models'],
    enabled: !!conversation?.provider,
  });

  const updateConversationMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Conversation> }) =>
      apiRequest('PATCH', `/api/conversations/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update conversation",
        variant: "destructive"
      });
    }
  });

  const handleProviderChange = (provider: string) => {
    if (!conversation) return;
    updateConversationMutation.mutate({
      id: conversation.id,
      updates: { provider: provider as any }
    });
  };

  const handleModelChange = (model: string) => {
    if (!conversation) return;
    updateConversationMutation.mutate({
      id: conversation.id,
      updates: { model }
    });
  };

  if (!conversation) {
    return (
      <div className="bg-white border-b border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Welcome to ChatNova</h2>
          <Button variant="ghost" size="sm" onClick={onSettingsClick} data-testid="button-header-settings">
            <Settings className="h-4 w-4 text-slate-600" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-b border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-slate-800" data-testid="text-conversation-title">
            {conversation.title}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Provider:</span>
            <Select value={conversation.provider} onValueChange={handleProviderChange} data-testid="select-provider">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="google">Google AI</SelectItem>
                <SelectItem value="huggingface">🤗 Hugging Face</SelectItem>
                <SelectItem value="cerebras">🧠 Cerebras</SelectItem>
                <SelectItem value="sambanova">🔥 SambaNova</SelectItem>
                <SelectItem value="mistral">🌪️ Mistral</SelectItem>
                <SelectItem value="cohere">💫 Cohere</SelectItem>
                <SelectItem value="xai">🦾 xAI (Grok)</SelectItem>
                <SelectItem value="perplexity">🔍 Perplexity</SelectItem>
                <SelectItem value="together">🤝 Together AI</SelectItem>
                <SelectItem value="fireworks">🎆 Fireworks</SelectItem>
              </SelectContent>
            </Select>

            <Select value={conversation.model} onValueChange={handleModelChange} data-testid="select-model">
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(availableModels as any)?.models?.map((model: string) => (
                  <SelectItem key={model} value={model}>{model}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-slate-600" data-testid="text-connection-status">Connected</span>
          </div>
          
          <Button variant="ghost" size="sm" data-testid="button-export-chat">
            <Download className="h-4 w-4 text-slate-600" />
          </Button>
          
          <Button variant="ghost" size="sm" onClick={onSettingsClick} data-testid="button-header-settings">
            <Settings className="h-4 w-4 text-slate-600" />
          </Button>
        </div>
      </div>
    </div>
  );
}
