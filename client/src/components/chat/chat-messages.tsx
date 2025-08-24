import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Copy, RotateCcw, Check, Bot, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Message } from "@shared/schema";

interface ChatMessagesProps {
  conversationId: string | null;
}

export default function ChatMessages({ conversationId }: ChatMessagesProps) {
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['/api/conversations', conversationId, 'messages'],
    enabled: !!conversationId,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Message copied to clipboard",
    });
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Bot className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">Welcome to ChatNova</h3>
          <p className="text-slate-500">Create a new chat or select an existing one to start.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-slate-500">Loading messages...</div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {(messages as any[]).map((message: any) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            data-testid={`message-${message.id}`}
          >
            <div className="max-w-3xl">
              {message.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <Bot className="h-3 w-3 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-800">AI Assistant</span>
                </div>
              )}
              
              <div
                className={`rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-white rounded-br-md'
                    : 'bg-white border border-slate-200 rounded-bl-md'
                }`}
              >
                {(message.metadata as any)?.images && (
                  <div className="mb-3 space-y-2">
                    {(message.metadata as any).images.map((image: string, index: number) => (
                      <img
                        key={index}
                        src={`data:image/jpeg;base64,${image}`}
                        alt="Uploaded image"
                        className="rounded-lg max-w-full h-auto"
                        data-testid={`image-attachment-${index}`}
                      />
                    ))}
                  </div>
                )}
                
                <div className={`prose prose-sm max-w-none ${message.role === 'user' ? 'prose-invert' : ''}`}>
                  <p className="whitespace-pre-wrap" data-testid={`text-message-content-${message.id}`}>
                    {message.content}
                  </p>
                </div>
              </div>
              
              <div className={`flex items-center gap-4 mt-2 ${message.role === 'user' ? 'justify-end' : ''}`}>
                <span className="text-xs text-slate-500" data-testid={`text-message-time-${message.id}`}>
                  {formatTime(message.createdAt!)}
                </span>
                
                {message.role === 'user' && (
                  <Check className="h-3 w-3 text-slate-400" />
                )}
                
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-slate-500 hover:text-slate-700 h-auto p-0"
                      onClick={() => copyToClipboard(message.content)}
                      data-testid={`button-copy-message-${message.id}`}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-slate-500 hover:text-slate-700 h-auto p-0"
                      data-testid={`button-regenerate-${message.id}`}
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Regenerate
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}
