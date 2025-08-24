import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, File, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Array<{ role: string; content: string; timestamp: string }>;
  conversationTitle: string;
}

type ExportFormat = 'txt' | 'json' | 'md' | 'html';

export default function ExportModal({ isOpen, onClose, messages, conversationTitle }: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>('txt');
  const { toast } = useToast();

  const formatOptions = [
    { value: 'txt', label: 'Plain Text (.txt)', icon: <FileText className="h-4 w-4" /> },
    { value: 'md', label: 'Markdown (.md)', icon: <File className="h-4 w-4" /> },
    { value: 'json', label: 'JSON (.json)', icon: <Code className="h-4 w-4" /> },
    { value: 'html', label: 'HTML (.html)', icon: <File className="h-4 w-4" /> },
  ];

  const exportConversation = () => {
    let content = '';
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${conversationTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${timestamp}`;

    switch (format) {
      case 'txt':
        content = `# ${conversationTitle}\n\nExported on: ${new Date().toLocaleString()}\n\n`;
        messages.forEach(message => {
          content += `**${message.role.toUpperCase()}**: ${message.content}\n\n`;
        });
        break;

      case 'md':
        content = `# ${conversationTitle}\n\n*Exported on: ${new Date().toLocaleString()}*\n\n`;
        messages.forEach(message => {
          content += `## ${message.role === 'user' ? 'User' : 'Assistant'}\n\n${message.content}\n\n---\n\n`;
        });
        break;

      case 'json':
        content = JSON.stringify({
          title: conversationTitle,
          exportedAt: new Date().toISOString(),
          messages: messages
        }, null, 2);
        break;

      case 'html':
        content = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${conversationTitle}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .message { margin-bottom: 20px; padding: 15px; border-radius: 8px; }
        .user { background-color: #f0f9ff; border-left: 4px solid #0ea5e9; }
        .assistant { background-color: #f9fafb; border-left: 4px solid #6b7280; }
        .role { font-weight: bold; margin-bottom: 8px; color: #374151; }
        .content { white-space: pre-wrap; }
        .header { text-align: center; margin-bottom: 30px; }
        .timestamp { color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${conversationTitle}</h1>
        <p class="timestamp">Exported on: ${new Date().toLocaleString()}</p>
    </div>
    ${messages.map(message => `
        <div class="message ${message.role}">
            <div class="role">${message.role === 'user' ? 'User' : 'Assistant'}</div>
            <div class="content">${message.content}</div>
        </div>
    `).join('')}
</body>
</html>`;
        break;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete!",
      description: `Conversation exported as ${format.toUpperCase()} file`,
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="dialog-export">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Conversation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Export Format
            </label>
            <Select value={format} onValueChange={(value: ExportFormat) => setFormat(value)}>
              <SelectTrigger className="mt-2" data-testid="select-export-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {formatOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      {option.icon}
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-slate-600 dark:text-slate-400">
            <p><strong>Title:</strong> {conversationTitle}</p>
            <p><strong>Messages:</strong> {messages.length}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose} data-testid="button-cancel-export">
            Cancel
          </Button>
          <Button onClick={exportConversation} data-testid="button-export-download">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}