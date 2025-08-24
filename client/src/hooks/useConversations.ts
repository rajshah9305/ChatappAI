//client/src/hooks/useConversations.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';

export function useConversations() {
  const queryClient = useQueryClient();

  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => apiRequest('GET', '/api/conversations'),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const createConversation = useMutation({
    mutationFn: (data) => apiRequest('POST', '/api/conversations', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  return { conversations, createConversation };
}
