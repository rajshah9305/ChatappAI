import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Edit3, RotateCcw, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface MessageActionsProps {
  messageId: string;
  conversationId: string;
  content: string;
  isUser: boolean;
}

export default function MessageActions({ messageId, conversationId, content, isUser }: MessageActionsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const editMessageMutation = useMutation({
    mutationFn: (newContent: string) => 
      apiRequest('PATCH', `/api/conversations/${conversationId}/messages/${messageId}`, { content: newContent }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations', conversationId, 'messages'] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Message updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update message",
        variant: "destructive"
      });
    }
  });

  const regenerateMessageMutation = useMutation({
    mutationFn: () => 
      apiRequest('POST', `/api/conversations/${conversationId}/messages/${messageId}/regenerate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations', conversationId, 'messages'] });
      toast({
        title: "Success",
        description: "Message regenerated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to regenerate message",
        variant: "destructive"
      });
    }
  });

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied!",
        description: "Message copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy message",
        variant: "destructive"
      });
    }
  };

  const handleEdit = () => {
    if (isEditing) {
      editMessageMutation.mutate(editedContent);
    } else {
      setEditedContent(content);
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="ghost"
        size="sm"
        onClick={copyToClipboard}
        className="h-8 w-8 p-0"
        data-testid="button-copy-message"
        title="Copy message"
      >
        <Copy className="h-3 w-3" />
      </Button>

      {isUser && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEdit}
          disabled={editMessageMutation.isPending}
          className="h-8 w-8 p-0"
          data-testid="button-edit-message"
          title="Edit message"
        >
          {isEditing ? <Check className="h-3 w-3" /> : <Edit3 className="h-3 w-3" />}
        </Button>
      )}

      {isEditing && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="h-8 w-8 p-0"
          data-testid="button-cancel-edit"
          title="Cancel edit"
        >
          <X className="h-3 w-3" />
        </Button>
      )}

      {!isUser && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => regenerateMessageMutation.mutate()}
          disabled={regenerateMessageMutation.isPending}
          className="h-8 w-8 p-0"
          data-testid="button-regenerate-message"
          title="Regenerate response"
        >
          <RotateCcw className="h-3 w-3" />
        </Button>
      )}

      {isEditing && (
        <div className="absolute top-8 left-0 right-0 z-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-lg">
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="min-h-[80px] mb-2"
            data-testid="textarea-edit-message"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleEdit} disabled={editMessageMutation.isPending}>
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}