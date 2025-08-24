import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Bot, Brain, CheckCircle, XCircle } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ApiKey } from "@shared/schema";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ApiKeyFormData {
  provider: 'openai' | 'anthropic' | 'google' | 'huggingface' | 'cerebras' | 'sambanova' | 'mistral' | 'cohere' | 'xai' | 'perplexity' | 'together' | 'fireworks';
  keyValue: string;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [apiKeyForms, setApiKeyForms] = useState<Record<string, string>>({
    openai: "",
    anthropic: "",
    google: "",
    huggingface: "",
    cerebras: "",
    sambanova: "",
    mistral: "",
    cohere: "",
    xai: "",
    perplexity: "",
    together: "",
    fireworks: ""
  });
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState(2048);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: apiKeys = [] } = useQuery({
    queryKey: ['/api/api-keys'],
    enabled: isOpen,
  });

  const saveApiKeyMutation = useMutation({
    mutationFn: (data: ApiKeyFormData) => apiRequest('POST', '/api/api-keys', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/api-keys'] });
      toast({
        title: "Success",
        description: "API key saved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save API key",
        variant: "destructive"
      });
    }
  });

  const deleteApiKeyMutation = useMutation({
    mutationFn: (provider: string) => apiRequest('DELETE', `/api/api-keys/${provider}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/api-keys'] });
      toast({
        title: "Success",
        description: "API key deleted",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    if ((apiKeys as any[]).length > 0) {
      const forms: Record<string, string> = {};
      (apiKeys as any[]).forEach((key: any) => {
        forms[key.provider] = key.keyValue; // This will be masked from the API
      });
      setApiKeyForms(forms);
    }
  }, [apiKeys]);

  const handleSaveApiKey = (provider: 'openai' | 'anthropic' | 'google' | 'huggingface' | 'cerebras' | 'sambanova' | 'mistral' | 'cohere' | 'xai' | 'perplexity' | 'together' | 'fireworks') => {
    const keyValue = apiKeyForms[provider];
    if (!keyValue || keyValue.includes('••••••••')) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive"
      });
      return;
    }

    saveApiKeyMutation.mutate({ provider, keyValue });
  };

  const handleDeleteApiKey = (provider: string) => {
    deleteApiKeyMutation.mutate(provider);
    setApiKeyForms(prev => ({ ...prev, [provider]: "" }));
  };

  const isConnected = (provider: string) => {
    return (apiKeys as any[]).some((key: any) => key.provider === provider && key.isActive);
  };

  const providerConfig = [
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'GPT-4o, GPT-4o Mini, GPT-3.5 Turbo',
      icon: <Bot className="text-green-600" />,
      placeholder: 'sk-...',
      link: 'https://platform.openai.com/api-keys'
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      description: 'Claude Sonnet 4, Claude 3.7 Sonnet, Claude 3 Haiku',
      icon: <Brain className="text-orange-600" />,
      placeholder: 'sk-ant-...',
      link: 'https://console.anthropic.com/'
    },
    {
      id: 'google',
      name: 'Google AI',
      description: 'Gemini 2.5 Flash, Gemini 2.5 Pro, Gemini 1.5 Flash',
      icon: <SiGoogle className="text-blue-600" />,
      placeholder: 'AI...',
      link: 'https://makersuite.google.com/app/apikey'
    },
    {
      id: 'huggingface',
      name: 'Hugging Face',
      description: 'Llama 3.2, Llama 3.1, DialoGPT models',
      icon: <Bot className="text-yellow-600" />,
      placeholder: 'hf_...',
      link: 'https://huggingface.co/settings/tokens'
    },
    {
      id: 'cerebras',
      name: 'Cerebras',
      description: 'Llama 3.1 8B, Llama 3.1 70B',
      icon: <Brain className="text-red-600" />,
      placeholder: 'csk_...',
      link: 'https://cloud.cerebras.ai/'
    },
    {
      id: 'sambanova',
      name: 'SambaNova',
      description: 'Meta Llama 3.1 8B, Meta Llama 3.1 70B',
      icon: <Brain className="text-indigo-600" />,
      placeholder: 'sk_...',
      link: 'https://cloud.sambanova.ai/'
    },
    {
      id: 'mistral',
      name: 'Mistral AI',
      description: 'Mistral Large, Medium, Small, Codestral',
      icon: <Bot className="text-orange-600" />,
      placeholder: 'sk_...',
      link: 'https://console.mistral.ai/'
    },
    {
      id: 'cohere',
      name: 'Cohere',
      description: 'Command R+, Command R, Command Light',
      icon: <Brain className="text-pink-600" />,
      placeholder: 'co_...',
      link: 'https://dashboard.cohere.ai/api-keys'
    },
    {
      id: 'xai',
      name: 'xAI (Grok)',
      description: 'Grok Beta, Grok Vision Beta',
      icon: <Bot className="text-gray-600" />,
      placeholder: 'xai-...',
      link: 'https://console.x.ai/'
    },
    {
      id: 'perplexity',
      name: 'Perplexity',
      description: 'Llama 3.1 Sonar models with web search',
      icon: <Brain className="text-cyan-600" />,
      placeholder: 'pplx-...',
      link: 'https://www.perplexity.ai/settings/api'
    },
    {
      id: 'together',
      name: 'Together AI',
      description: 'Llama 3.1, WizardLM, and open-source models',
      icon: <Bot className="text-emerald-600" />,
      placeholder: 'sk_...',
      link: 'https://api.together.xyz/settings/api-keys'
    },
    {
      id: 'fireworks',
      name: 'Fireworks AI',
      description: 'Llama, Mixtral, Yi models with fast inference',
      icon: <Brain className="text-violet-600" />,
      placeholder: 'fw_...',
      link: 'https://fireworks.ai/account/api-keys'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden" data-testid="dialog-settings">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="api-keys" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="api-keys" data-testid="tab-api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="models" data-testid="tab-models">Models</TabsTrigger>
            <TabsTrigger value="preferences" data-testid="tab-preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="api-keys" className="space-y-6 max-h-[60vh] overflow-y-auto">
            <div>
              <h3 className="text-lg font-medium text-slate-800 mb-4">API Key Configuration</h3>
              <p className="text-sm text-slate-600 mb-6">
                Configure your API keys for different AI providers. Keys are stored securely and never shared.
              </p>
            </div>

            {providerConfig.map((provider) => (
              <div key={provider.id} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                    {provider.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800">{provider.name}</h4>
                    <p className="text-sm text-slate-600">{provider.description}</p>
                  </div>
                  <div className="ml-auto">
                    {isConnected(provider.id) ? (
                      <div className="flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        <CheckCircle className="h-3 w-3" />
                        Connected
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        <XCircle className="h-3 w-3" />
                        Not Connected
                      </div>
                    )}
                  </div>
                </div>
                <div className="ml-11 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      placeholder={provider.placeholder}
                      value={apiKeyForms[provider.id] || ""}
                      onChange={(e) => setApiKeyForms(prev => ({ ...prev, [provider.id]: e.target.value }))}
                      className="flex-1"
                      data-testid={`input-api-key-${provider.id}`}
                    />
                    <Button
                      onClick={() => handleSaveApiKey(provider.id as any)}
                      disabled={saveApiKeyMutation.isPending}
                      data-testid={`button-save-api-key-${provider.id}`}
                    >
                      Save
                    </Button>
                    {isConnected(provider.id) && (
                      <Button
                        variant="outline"
                        onClick={() => handleDeleteApiKey(provider.id)}
                        disabled={deleteApiKeyMutation.isPending}
                        data-testid={`button-delete-api-key-${provider.id}`}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Get your API key from{" "}
                    <a href={provider.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {provider.name} Console
                    </a>
                  </p>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="models" className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-slate-800 mb-4">Model Configuration</h3>
              <p className="text-sm text-slate-600 mb-6">
                Configure default models and parameters for each provider.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium text-slate-700 mb-2">
                  Default Temperature: {temperature[0]}
                </Label>
                <Slider
                  value={temperature}
                  onValueChange={setTemperature}
                  max={2}
                  min={0}
                  step={0.1}
                  className="w-full"
                  data-testid="slider-temperature"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Conservative (0)</span>
                  <span>Balanced (0.7)</span>
                  <span>Creative (2)</span>
                </div>
              </div>

              <div>
                <Label htmlFor="maxTokens" className="block text-sm font-medium text-slate-700 mb-2">
                  Max Tokens
                </Label>
                <Input
                  id="maxTokens"
                  type="number"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  className="w-full"
                  data-testid="input-max-tokens"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-slate-800 mb-4">Chat Preferences</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-800">Dark Mode</h4>
                  <p className="text-sm text-slate-600">Switch to dark theme</p>
                </div>
                <Switch data-testid="switch-dark-mode" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-800">Auto-save Conversations</h4>
                  <p className="text-sm text-slate-600">Automatically save chat history</p>
                </div>
                <Switch defaultChecked data-testid="switch-auto-save" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-800">Sound Notifications</h4>
                  <p className="text-sm text-slate-600">Play sound when messages arrive</p>
                </div>
                <Switch data-testid="switch-sound-notifications" />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Button variant="outline" onClick={onClose} data-testid="button-cancel-settings">
            Cancel
          </Button>
          <Button onClick={onClose} data-testid="button-save-settings">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
