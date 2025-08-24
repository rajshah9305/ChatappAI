import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Send, X, Image, Sparkles, FileText } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import TemplatesModal from "./templates-modal";

interface ChatInputProps {
  conversationId: string | null;
  onConversationCreated?: (id: string) => void;
}

export default function ChatInput({ conversationId, onConversationCreated }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [attachedDocuments, setAttachedDocuments] = useState<Array<{type: string, name: string, content: string}>>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content, images }: { 
      conversationId: string; 
      content: string; 
      images?: string[];
    }) => {
      return apiRequest('POST', `/api/conversations/${conversationId}/messages`, {
        content,
        images
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/conversations', conversationId, 'messages'] });
      setMessage("");
      setAttachedImages([]);
      setAttachedDocuments([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive"
      });
    }
  });

  const createConversationMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/conversations', {
      title: message.slice(0, 50) || 'New Chat',
      provider: 'openai',
      model: 'gpt-4o'
    }),
    onSuccess: async (response) => {
      const conversation = await response.json();
      onConversationCreated?.(conversation.id);
      // Send the message to the new conversation
      sendMessageMutation.mutate({
        conversationId: conversation.id,
        content: message,
        images: attachedImages.length > 0 ? attachedImages : undefined,
        attachments: attachedDocuments.length > 0 ? attachedDocuments : undefined
      } as any);
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive"
      });
    }
  });

  const handleSend = () => {
    if (!message.trim() || sendMessageMutation.isPending) return;

    if (!conversationId) {
      createConversationMutation.mutate();
    } else {
      sendMessageMutation.mutate({
        conversationId,
        content: message,
        images: attachedImages.length > 0 ? attachedImages : undefined,
        attachments: attachedDocuments.length > 0 ? attachedDocuments : undefined
      } as any);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = useCallback((files: FileList) => {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          const base64Data = base64.split(',')[1]; // Remove data:image/...;base64, prefix
          setAttachedImages(prev => [...prev, base64Data]);
        };
        reader.readAsDataURL(file);
      } else if (file.type === 'text/plain' || file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setAttachedDocuments(prev => [...prev, {
            type: file.type === 'application/pdf' ? 'pdf' : 'txt',
            name: file.name,
            content: content
          }]);
        };
        reader.readAsText(file);
      }
    });
  }, []);

  const handleDocumentUpload = useCallback((files: FileList) => {
    handleFileUpload(files);
  }, [handleFileUpload]);

  const removeDocument = (index: number) => {
    setAttachedDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleTemplateSelect = (templatePrompt: string) => {
    setMessage(templatePrompt);
    if (textareaRef.current) {
      textareaRef.current.focus();
      adjustTextareaHeight();
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeImage = (index: number) => {
    setAttachedImages(prev => prev.filter((_, i) => i !== index));
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 128) + 'px';
    }
  };

  const isLoading = sendMessageMutation.isPending || createConversationMutation.isPending;

  return (
    <div className="bg-white border-t border-slate-200 p-4">
      <div className="max-w-4xl mx-auto">
        <div
          className={`relative border rounded-xl bg-white shadow-sm transition-colors ${
            isDragging ? 'border-primary bg-blue-50' : 'border-slate-300 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {/* File Upload Preview */}
          {(attachedImages.length > 0 || attachedDocuments.length > 0) && (
            <div className="p-3 border-b border-slate-200">
              <div className="flex items-center gap-2 flex-wrap">
                {attachedImages.map((image, index) => (
                  <div key={`img-${index}`} className="relative">
                    <img
                      src={`data:image/jpeg;base64,${image}`}
                      alt={`Attachment ${index + 1}`}
                      className="w-16 h-16 object-cover rounded-lg"
                      data-testid={`image-preview-${index}`}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white hover:bg-red-600 p-0"
                      onClick={() => removeImage(index)}
                      data-testid={`button-remove-image-${index}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {attachedDocuments.map((doc, index) => (
                  <div key={`doc-${index}`} className="relative bg-slate-100 rounded-lg p-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-600" />
                    <span className="text-xs text-slate-700 max-w-20 truncate">{doc.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 rounded-full bg-red-500 text-white hover:bg-red-600 p-0"
                      onClick={() => removeDocument(index)}
                      data-testid={`button-remove-document-${index}`}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-end gap-2 p-3">
            {/* Templates Button */}
            <Button
              variant="ghost"
              size="sm"
              className="flex-shrink-0"
              onClick={() => setIsTemplatesOpen(true)}
              disabled={isLoading}
              data-testid="button-templates"
              title="Chat Templates"
            >
              <Sparkles className="h-4 w-4 text-purple-600" />
            </Button>

            {/* Image Attachment Button */}
            <Button
              variant="ghost"
              size="sm"
              className="flex-shrink-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              data-testid="button-attach-image"
              title="Attach Image"
            >
              <Image className="h-4 w-4 text-blue-600" />
            </Button>

            {/* Document Attachment Button */}
            <Button
              variant="ghost"
              size="sm"
              className="flex-shrink-0"
              onClick={() => documentInputRef.current?.click()}
              disabled={isLoading}
              data-testid="button-attach-document"
              title="Attach Document"
            >
              <FileText className="h-4 w-4 text-green-600" />
            </Button>

            {/* Text Input */}
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                adjustTextareaHeight();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Shift + Enter for new line)"
              className="flex-1 resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[40px] max-h-32"
              disabled={isLoading}
              data-testid="textarea-message-input"
            />

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={!message.trim() || isLoading}
              className="flex-shrink-0 bg-primary hover:bg-blue-700"
              data-testid="button-send-message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Input Footer */}
        <div className="flex items-center justify-between mt-2 px-1">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>Press Shift + Enter for new line</span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Encrypted
            </span>
          </div>
          <div className="text-xs text-slate-500" data-testid="text-character-count">
            {message.length}/4000 characters
          </div>
        </div>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          className="hidden"
          data-testid="input-file-upload"
        />
        <input
          ref={documentInputRef}
          type="file"
          multiple
          accept=".txt,.pdf,.doc,.docx"
          onChange={(e) => e.target.files && handleDocumentUpload(e.target.files)}
          className="hidden"
          data-testid="input-document-upload"
        />
      </div>

      {/* Templates Modal */}
      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={handleTemplateSelect}
      />
    </div>
  );
}
