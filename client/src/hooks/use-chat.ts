import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Conversation, Message } from '@shared/schema';

export function useChat(conversationId: string | null) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isTyping, setIsTyping] = useState(false);

  const { data: conversation } = useQuery({
    queryKey: ['/api/conversations', conversationId],
    enabled: !!conversationId,
  });

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['/api/conversations', conversationId, 'messages'],
    enabled: !!conversationId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, images }: { content: string; images?: string[] }) => {
      if (!conversationId) throw new Error('No conversation selected');
      
      setIsTyping(true);
      return apiRequest('POST', `/api/conversations/${conversationId}/messages`, {
        content,
        images
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/conversations', conversationId, 'messages'] });
      setIsTyping(false);
    },
    onError: (error: any) => {
      setIsTyping(false);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive"
      });
    }
  });

  const sendMessage = useCallback((content: string, images?: string[]) => {
    sendMessageMutation.mutate({ content, images });
  }, [sendMessageMutation]);

  return {
    conversation: conversation as Conversation | undefined,
    messages: messages as Message[],
    isLoading,
    isTyping,
    sendMessage,
    isSending: sendMessageMutation.isPending
  };
}
