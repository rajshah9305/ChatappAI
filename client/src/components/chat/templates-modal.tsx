import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles, Code, Briefcase, GraduationCap, Microscope, Lightbulb } from "lucide-react";
import { chatTemplates } from "@shared/schema";

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (prompt: string) => void;
}

const categoryIcons = {
  Writing: <Sparkles className="h-4 w-4" />,
  Programming: <Code className="h-4 w-4" />,
  Business: <Briefcase className="h-4 w-4" />,
  Education: <GraduationCap className="h-4 w-4" />,
  Research: <Microscope className="h-4 w-4" />,
  Innovation: <Lightbulb className="h-4 w-4" />
};

const categoryColors = {
  Writing: "bg-purple-100 text-purple-800",
  Programming: "bg-blue-100 text-blue-800",
  Business: "bg-green-100 text-green-800",
  Education: "bg-orange-100 text-orange-800",
  Research: "bg-cyan-100 text-cyan-800",
  Innovation: "bg-yellow-100 text-yellow-800"
};

export default function TemplatesModal({ isOpen, onClose, onSelectTemplate }: TemplatesModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredTemplates = chatTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(chatTemplates.map(t => t.category))];

  const handleSelectTemplate = (template: typeof chatTemplates[0]) => {
    onSelectTemplate(template.prompt);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden" data-testid="dialog-templates">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Chat Templates
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-template-search"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={!selectedCategory ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                data-testid="button-category-all"
              >
                All
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  data-testid={`button-category-${category.toLowerCase()}`}
                >
                  {categoryIcons[category as keyof typeof categoryIcons]}
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => handleSelectTemplate(template)}
                data-testid={`template-${template.id}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-slate-800 group-hover:text-primary">
                    {template.name}
                  </h3>
                  <Badge 
                    className={`${categoryColors[template.category as keyof typeof categoryColors]} flex items-center gap-1`}
                  >
                    {categoryIcons[template.category as keyof typeof categoryIcons]}
                    {template.category}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 mb-3">
                  {template.description}
                </p>
                <p className="text-xs text-slate-500 line-clamp-2">
                  {template.prompt}
                </p>
              </div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No templates found matching your search.</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Button variant="outline" onClick={onClose} data-testid="button-cancel-templates">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}