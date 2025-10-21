'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code, Copy, Check, Eye, ExternalLink } from 'lucide-react';

interface EmbedCodeGeneratorProps {
  formId: string;
  companyId: string;
  formName?: string;
}

export default function EmbedCodeGenerator({ formId, companyId, formName }: EmbedCodeGeneratorProps) {
  const [copied, setCopied] = useState(false);
  const [embedType, setEmbedType] = useState<'iframe' | 'script'>('iframe');

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-app.vercel.app';
  const embedUrl = `${baseUrl}/embed/survey/${formId}?companyId=${companyId}`;

  const iframeCode = `<iframe 
  src="${embedUrl}"
  style="width: 100%; min-height: 600px; border: 2px solid #10B981; border-radius: 12px; margin: 20px 0;"
  frameborder="0"
  scrolling="auto"
  title="${formName || 'Survey'}"
></iframe>`;

  const scriptCode = `<script>
(function() {
  var iframe = document.createElement('iframe');
  iframe.src = '${embedUrl}';
  iframe.style.width = '100%';
  iframe.style.minHeight = '600px';
  iframe.style.border = '2px solid #10B981';
  iframe.style.borderRadius = '12px';
  iframe.style.margin = '20px 0';
  iframe.frameBorder = '0';
  iframe.scrolling = 'auto';
  document.getElementById('survey-container').appendChild(iframe);
})();
</script>
<div id="survey-container"></div>`;

  const currentCode = embedType === 'iframe' ? iframeCode : scriptCode;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handlePreview = () => {
    window.open(embedUrl, '_blank');
  };

  return (
    <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg">
      <CardHeader>
        <CardTitle className="text-[#E1E4EA] flex items-center gap-2">
          <Code className="h-5 w-5 text-[#10B981]" />
          Embed Code
        </CardTitle>
        <p className="text-sm text-[#9AA4B2] mt-2">
          Copy this code and paste it into your Whop course lesson content
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Embed Type Selector */}
        <div className="flex gap-2">
          <Button
            onClick={() => setEmbedType('iframe')}
            variant={embedType === 'iframe' ? 'default' : 'outline'}
            className={embedType === 'iframe' 
              ? 'bg-[#10B981] hover:bg-[#0E9F71] text-white' 
              : 'bg-[#0B2C24] hover:bg-[#0E3A2F] text-white border border-[#17493A]'
            }
            size="sm"
          >
            Iframe Code
          </Button>
          <Button
            onClick={() => setEmbedType('script')}
            variant={embedType === 'script' ? 'default' : 'outline'}
            className={embedType === 'script' 
              ? 'bg-[#10B981] hover:bg-[#0E9F71] text-white' 
              : 'bg-[#0B2C24] hover:bg-[#0E3A2F] text-white border border-[#17493A]'
            }
            size="sm"
          >
            Script Code
          </Button>
        </div>

        {/* Code Display */}
        <div className="relative">
          <pre className="bg-[#0d0f12] border border-[#2A2F36] rounded-lg p-4 overflow-x-auto">
            <code className="text-[#10B981] text-sm font-mono whitespace-pre">
              {currentCode}
            </code>
          </pre>
          <Button
            onClick={handleCopy}
            size="sm"
            className="absolute top-2 right-2 bg-[#0B2C24] hover:bg-[#0E3A2F] text-white border border-[#17493A]"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </>
            )}
          </Button>
        </div>

        {/* Direct Link */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#E1E4EA]">
            Direct Link (for testing):
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={embedUrl}
              readOnly
              className="flex-1 bg-[#0d0f12] border border-[#2A2F36] rounded-lg px-3 py-2 text-[#9AA4B2] text-sm font-mono"
            />
            <Button
              onClick={handlePreview}
              size="sm"
              className="bg-[#0B2C24] hover:bg-[#0E3A2F] text-white border border-[#17493A]"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Preview
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-[#0B2C24] border border-[#17493A] rounded-lg p-4 space-y-2">
          <h4 className="text-sm font-semibold text-[#10B981] flex items-center gap-2">
            <Eye className="h-4 w-4" />
            How to Embed in Whop:
          </h4>
          <ol className="text-sm text-[#9AA4B2] space-y-1 list-decimal list-inside">
            <li>Go to your Whop company dashboard</li>
            <li>Navigate to your course/experience</li>
            <li>Edit the lesson where you want the survey</li>
            <li>Switch to HTML/code editor mode</li>
            <li>Paste the embed code above</li>
            <li>Save the lesson</li>
            <li>Students will now see the survey in that lesson!</li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleCopy}
            className="flex-1 bg-[#10B981] hover:bg-[#0E9F71] text-white"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Embed Code
              </>
            )}
          </Button>
          <Button
            onClick={handlePreview}
            className="bg-[#0B2C24] hover:bg-[#0E3A2F] text-white border border-[#17493A]"
          >
            <Eye className="h-4 w-4 mr-2" />
            Test Survey
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
