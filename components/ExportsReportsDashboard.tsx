'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  FileText, 
  BarChart3, 
  Mail, 
  Calendar,
  CheckCircle,
  Clock,
  RefreshCw,
  Eye,
  Share2
} from 'lucide-react';

interface ExportsReportsDashboardProps {
  companyId: string;
}

interface ExportOption {
  id: string;
  name: string;
  description: string;
  type: 'pdf' | 'csv';
  icon: React.ReactNode;
  color: string;
  features: string[];
}

export default function ExportsReportsDashboard({ companyId }: ExportsReportsDashboardProps) {
  const [exporting, setExporting] = useState<string | null>(null);
  const [recentExports, setRecentExports] = useState<any[]>([]);

  const exportOptions: ExportOption[] = [
    {
      id: 'comprehensive_pdf',
      name: 'Comprehensive Analytics Report',
      description: 'Complete PDF report with insights, stats, and sentiment analysis',
      type: 'pdf',
      icon: <FileText className="h-6 w-6" />,
      color: 'bg-[#10B981]',
      features: [
        'Key insights and recommendations',
        'Engagement metrics and trends',
        'Sentiment analysis charts',
        'Revenue and subscription data',
        'AI-generated insights summary'
      ]
    },
    {
      id: 'events_csv',
      name: 'Events Data Export',
      description: 'All user events and interactions in CSV format',
      type: 'csv',
      icon: <BarChart3 className="h-6 w-6" />,
      color: 'bg-[#3B82F6]',
      features: [
        'Complete event history',
        'Event types and timestamps',
        'User interaction data',
        'Webhook event details'
      ]
    },
    {
      id: 'insights_csv',
      name: 'AI Insights Export',
      description: 'All AI-generated insights and recommendations',
      type: 'csv',
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'bg-[#8B5CF6]',
      features: [
        'AI-generated insights',
        'Recommendations and actions',
        'Confidence scores',
        'Insight categories'
      ]
    },
    {
      id: 'students_csv',
      name: 'Student Data Export',
      description: 'Complete student and subscription information',
      type: 'csv',
      icon: <Calendar className="h-6 w-6" />,
      color: 'bg-[#F59E0B]',
      features: [
        'Student profiles and metadata',
        'Subscription status and history',
        'Enrollment data',
        'Contact information'
      ]
    }
  ];

  const handleExport = async (option: ExportOption) => {
    try {
      setExporting(option.id);
      
      let url = '';
      if (option.type === 'pdf') {
        url = '/api/export/pdf';
      } else {
        url = `/api/export/csv?type=${option.id.replace('_csv', '')}`;
      }

      // Open download in new tab
      window.open(url, '_blank');
      
      // Add to recent exports
      const newExport = {
        id: Date.now().toString(),
        name: option.name,
        type: option.type,
        timestamp: new Date().toISOString(),
        status: 'completed'
      };
      
      setRecentExports(prev => [newExport, ...prev.slice(0, 4)]);
      
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setExporting(null);
    }
  };

  const handleEmailReport = async (option: ExportOption) => {
    // Future feature - auto-email functionality
    alert('Auto-email feature coming soon! This will automatically send reports to your email.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-[#F8FAFC]">Exports & Reports</h3>
          <p className="text-sm text-[#A1A1AA]">Download comprehensive analytics and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-[#1a1a1a] text-[#A1A1AA]">
            <Clock className="h-3 w-3 mr-1" />
            Auto-email coming soon
          </Badge>
        </div>
      </div>

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exportOptions.map((option) => (
          <Card key={option.id} className="p-6 bg-[#0f0f0f] border-[#1a1a1a] hover:border-[#1a1a1a]/50 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg ${option.color} flex items-center justify-center text-white`}>
                  {option.icon}
                </div>
                <div>
                  <h4 className="font-medium text-[#F8FAFC]">{option.name}</h4>
                  <p className="text-sm text-[#A1A1AA]">{option.description}</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-[#1a1a1a] text-[#A1A1AA]">
                {option.type.toUpperCase()}
              </Badge>
            </div>

            <div className="mb-4">
              <h5 className="text-sm font-medium text-[#F8FAFC] mb-2">Includes:</h5>
              <ul className="space-y-1">
                {option.features.map((feature, index) => (
                  <li key={index} className="text-xs text-[#A1A1AA] flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-[#10B981]" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleExport(option)}
                disabled={exporting === option.id}
                className="flex-1 bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white border border-[#1a1a1a]"
              >
                {exporting === option.id ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {exporting === option.id ? 'Generating...' : 'Download'}
              </Button>
              
              <Button
                onClick={() => handleEmailReport(option)}
                variant="outline"
                className="border-[#1a1a1a] text-[#A1A1AA] hover:bg-[#1a1a1a]"
              >
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Exports */}
      {recentExports.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-md font-medium text-[#F8FAFC]">Recent Exports</h4>
          <div className="space-y-2">
            {recentExports.map((exportItem) => (
              <Card key={exportItem.id} className="p-4 bg-[#0f0f0f] border-[#1a1a1a]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#10B981]/20 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-[#10B981]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#F8FAFC]">{exportItem.name}</p>
                      <p className="text-xs text-[#A1A1AA]">
                        {new Date(exportItem.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-[#1a1a1a] text-[#A1A1AA]">
                      {exportItem.type.toUpperCase()}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#1a1a1a] text-[#A1A1AA] hover:bg-[#1a1a1a]"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Future Features */}
      <Card className="p-6 bg-[#0f0f0f] border-[#1a1a1a]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#8B5CF6]/20 flex items-center justify-center">
            <Share2 className="h-5 w-5 text-[#8B5CF6]" />
          </div>
          <div>
            <h4 className="font-medium text-[#F8FAFC]">Coming Soon</h4>
            <p className="text-sm text-[#A1A1AA]">Enhanced reporting features</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-[#F8FAFC]">Auto-Email Reports</h5>
            <p className="text-xs text-[#A1A1AA]">
              Automatically send reports to your email on a schedule
            </p>
          </div>
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-[#F8FAFC]">Custom Dashboards</h5>
            <p className="text-xs text-[#A1A1AA]">
              Create personalized analytics dashboards for stakeholders
            </p>
          </div>
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-[#F8FAFC]">API Integration</h5>
            <p className="text-xs text-[#A1A1AA]">
              Export data directly to your favorite analytics tools
            </p>
          </div>
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-[#F8FAFC]">Real-time Alerts</h5>
            <p className="text-xs text-[#A1A1AA]">
              Get notified when important metrics change
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
