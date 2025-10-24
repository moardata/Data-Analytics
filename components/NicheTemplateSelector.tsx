'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Check } from 'lucide-react';

interface NicheTemplate {
  id: string;
  niche: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  fields: any[];
}

interface NicheTemplateSelectorProps {
  onSelectTemplate: (template: NicheTemplate) => void;
  companyId: string;
}

export default function NicheTemplateSelector({ onSelectTemplate, companyId }: NicheTemplateSelectorProps) {
  const [templates, setTemplates] = useState<NicheTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/forms/templates/niche');
      const data = await response.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (template: NicheTemplate) => {
    setSelectedId(template.id);
    onSelectTemplate(template);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-[#10B981]" />
          <h2 className="text-2xl font-bold text-[#F8FAFC]">Choose Your Niche Template</h2>
        </div>
        <p className="text-[#A1A1AA]">
          Select a pre-built survey template tailored to your community's niche
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card 
            key={template.id}
            className={`
              cursor-pointer transition-all duration-200 hover:scale-[1.02]
              ${selectedId === template.id 
                ? 'border-[#10B981] bg-[#10B981]/10 shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                : 'border-[#1a1a1a] bg-[#0f0f0f] hover:border-[#2a2a2a]'
              }
            `}
            onClick={() => handleSelectTemplate(template)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ 
                      backgroundColor: `${template.color}20`,
                      border: `2px solid ${template.color}40`
                    }}
                  >
                    {template.icon}
                  </div>
                  <div>
                    <CardTitle className="text-[#F8FAFC] text-base">
                      {template.niche}
                    </CardTitle>
                    <Badge 
                      className="mt-1 text-xs"
                      style={{
                        backgroundColor: `${template.color}20`,
                        color: template.color,
                        border: `1px solid ${template.color}40`
                      }}
                    >
                      {template.fields.length} questions
                    </Badge>
                  </div>
                </div>
                {selectedId === template.id && (
                  <div className="w-6 h-6 rounded-full bg-[#10B981] flex items-center justify-center flex-shrink-0">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-[#A1A1AA] text-sm">
                {template.description}
              </CardDescription>
              <div className="mt-3 pt-3 border-t border-[#1a1a1a]">
                <p className="text-xs text-[#71717A] font-medium mb-2">Includes:</p>
                <div className="flex flex-wrap gap-1">
                  {template.fields.slice(0, 3).map((field, idx) => (
                    <Badge 
                      key={idx}
                      variant="outline"
                      className="text-xs border-[#2a2a2a] text-[#A1A1AA]"
                    >
                      {field.label.length > 25 ? field.label.slice(0, 25) + '...' : field.label}
                    </Badge>
                  ))}
                  {template.fields.length > 3 && (
                    <Badge 
                      variant="outline"
                      className="text-xs border-[#2a2a2a] text-[#A1A1AA]"
                    >
                      +{template.fields.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedId && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <Button
            onClick={() => {
              const template = templates.find(t => t.id === selectedId);
              if (template) handleSelectTemplate(template);
            }}
            className="bg-[#10B981] hover:bg-[#0E9F71] text-white px-8 py-3 rounded-xl font-medium"
          >
            Use This Template
          </Button>
          <Button
            onClick={() => setSelectedId(null)}
            variant="outline"
            className="border-[#1a1a1a] text-[#A1A1AA] hover:bg-[#1a1a1a] px-8 py-3 rounded-xl"
          >
            Clear Selection
          </Button>
        </div>
      )}

      <div className="text-center pt-6 border-t border-[#1a1a1a]">
        <p className="text-sm text-[#71717A] mb-2">
          Don't see your niche?
        </p>
        <Button
          variant="outline"
          className="border-[#1a1a1a] text-[#A1A1AA] hover:bg-[#1a1a1a]"
          onClick={() => onSelectTemplate({
            id: 'custom',
            niche: 'Custom',
            name: 'Custom Survey',
            description: 'Build from scratch',
            icon: '✨',
            color: '#6366F1',
            fields: []
          })}
        >
          Build Custom Survey
        </Button>
      </div>
    </div>
  );
}

