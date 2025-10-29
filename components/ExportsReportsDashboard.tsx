'use client';

import { useState, useEffect } from 'react';
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
  Share2,
  Lock
} from 'lucide-react';
import { canPerformAction, type TierName } from '@/lib/pricing/tiers';

interface ExportsReportsDashboardProps {
  companyId: string;
}

type TimeRange = 'daily' | 'weekly' | 'monthly' | '6months' | 'yearly';

interface ExportOption {
  id: string;
  name: string;
  description: string;
  type: 'pdf' | 'csv';
  icon: React.ReactNode;
  color: string;
  requiresTier?: TierName;
}

export default function ExportsReportsDashboard({ companyId }: ExportsReportsDashboardProps) {
  const [exporting, setExporting] = useState<string | null>(null);
  const [recentExports, setRecentExports] = useState<any[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('weekly');
  const [userTier, setUserTier] = useState<TierName | null>(null);

  // Fetch user tier on mount
  useEffect(() => {
    const fetchTier = async () => {
      try {
        const res = await fetch(`/api/usage/check?companyId=${companyId}`);
        const data = await res.json();
        setUserTier(data.tier || null);
      } catch (err) {
        console.error('Error fetching tier:', err);
      }
    };
    fetchTier();
  }, [companyId]);

  const timeRangeOptions: { value: TimeRange; label: string; requiresPremium: boolean }[] = [
    { value: 'daily', label: 'Daily', requiresPremium: false },
    { value: 'weekly', label: 'Weekly', requiresPremium: false },
    { value: 'monthly', label: 'Monthly', requiresPremium: true },
    { value: '6months', label: '6 Months', requiresPremium: true },
    { value: 'yearly', label: 'Yearly', requiresPremium: true },
  ];

  const exportOptions: ExportOption[] = [
    {
      id: 'comprehensive_pdf',
      name: 'Analytics Report',
      description: 'Complete PDF report with insights and analytics',
      type: 'pdf',
      icon: <FileText className="h-5 w-5" />,
      color: 'bg-[#10B981]',
      requiresTier: 'pulse', // Pro plan
    },
    {
      id: 'students_csv',
      name: 'Data Export',
      description: 'Export student data and metrics in CSV format',
      type: 'csv',
      icon: <BarChart3 className="h-5 w-5" />,
      color: 'bg-[#3B82F6]',
      requiresTier: 'core', // Growth plan
    }
  ];

  const isPremium = userTier === 'pulse' || userTier === 'surge';
  const canExportPDF = userTier ? canPerformAction(userTier, 'pdfExport', companyId) : false;
  const canExportCSV = userTier ? canPerformAction(userTier, 'csvExport', companyId) : false;

  const handleExport = async (option: ExportOption) => {
    // Check if user has permission
    if (option.type === 'pdf' && !canExportPDF) {
      alert('PDF exports require the Pro plan or higher. Please upgrade to continue.');
      return;
    }
    if (option.type === 'csv' && !canExportCSV) {
      alert('CSV exports require the Growth plan or higher. Please upgrade to continue.');
      return;
    }

    try {
      setExporting(option.id);
      
      let url = '';
      if (option.type === 'pdf') {
        url = `/api/export/pdf?companyId=${companyId}&timeRange=${selectedTimeRange}`;
      } else {
        url = `/api/export/csv?type=${option.id.replace('_csv', '')}&companyId=${companyId}&timeRange=${selectedTimeRange}`;
      }

      // Open download in new tab
      window.open(url, '_blank');
      
      // Add to recent exports
      const newExport = {
        id: Date.now().toString(),
        name: option.name,
        type: option.type,
        timeRange: selectedTimeRange,
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

  const canUseTimeRange = (timeRange: TimeRange): boolean => {
    const option = timeRangeOptions.find(t => t.value === timeRange);
    if (!option) return false;
    return !option.requiresPremium || isPremium;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-[#F8FAFC]">Exports & Reports</h3>
          <p className="text-sm text-[#A1A1AA]">Download analytics for different time ranges</p>
        </div>
        <Badge variant="outline" className="border-[#1a1a1a] text-[#A1A1AA]">
          {userTier.toUpperCase()}
        </Badge>
      </div>

      {/* Time Range Selector */}
      <Card className="p-4 bg-[#0f0f0f] border-[#1a1a1a]">
        <h4 className="text-sm font-medium text-[#F8FAFC] mb-3">Select Time Range</h4>
        <div className="flex flex-wrap gap-2">
          {timeRangeOptions.map((timeRange) => {
            const isLocked = !canUseTimeRange(timeRange.value);
            const isSelected = selectedTimeRange === timeRange.value;
            
            return (
              <button
                key={timeRange.value}
                onClick={() => {
                  if (isLocked) {
                    alert('This time range requires a premium plan. Please upgrade to access monthly, 6-month, and yearly reports.');
                  } else {
                    setSelectedTimeRange(timeRange.value);
                  }
                }}
                disabled={isLocked}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-[#10B981] text-white'
                    : isLocked
                    ? 'bg-[#0a0a0a] text-[#4A4A4A] border border-[#1a1a1a] cursor-not-allowed'
                    : 'bg-[#0a0a0a] text-[#A1A1AA] border border-[#1a1a1a] hover:bg-[#1a1a1a]'
                }`}
              >
                {timeRange.label}
                {isLocked && <Lock className="inline-block h-3 w-3 ml-1" />}
              </button>
            );
          })}
        </div>
        {!isPremium && (
          <p className="mt-3 text-xs text-[#A1A1AA]">
            ⚡ Upgrade to Pro or Scale to unlock monthly, 6-month, and yearly reports
          </p>
        )}
      </Card>

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exportOptions.map((option) => {
          const isLocked = (option.type === 'pdf' && !canExportPDF) || (option.type === 'csv' && !canExportCSV);
          
          return (
            <Card key={option.id} className={`p-6 bg-[#0f0f0f] border-[#1a1a1a] transition-all ${isLocked ? 'opacity-60' : 'hover:border-[#1a1a1a]/50'}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${option.color} flex items-center justify-center text-white`}>
                    {option.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-[#F8FAFC]">{option.name}</h4>
                      {isLocked && <Lock className="h-4 w-4 text-[#A1A1AA]" />}
                    </div>
                    <p className="text-sm text-[#A1A1AA]">{option.description}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-[#1a1a1a] text-[#A1A1AA]">
                  {option.type.toUpperCase()}
                </Badge>
              </div>

              <Button
                onClick={() => handleExport(option)}
                disabled={exporting === option.id || isLocked}
                className="w-full bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white border border-[#1a1a1a] disabled:opacity-50"
              >
                {isLocked ? (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    {option.requiresTier ? `Requires ${
                      option.requiresTier === 'atom' ? 'Starter' :
                      option.requiresTier === 'core' ? 'Growth' :
                      option.requiresTier === 'pulse' ? 'Pro' :
                      option.requiresTier === 'surge' ? 'Scale' : 
                      option.requiresTier
                    } Plan` : 'Upgrade to Unlock'}
                  </>
                ) : exporting === option.id ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download {selectedTimeRange.charAt(0).toUpperCase() + selectedTimeRange.slice(1)} Report
                  </>
                )}
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Recent Exports */}
      {recentExports.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-[#F8FAFC]">Recent Exports</h4>
          <div className="space-y-2">
            {recentExports.map((exportItem) => (
              <Card key={exportItem.id} className="p-3 bg-[#0f0f0f] border-[#1a1a1a]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[#10B981]" />
                    <div>
                      <p className="text-sm font-medium text-[#F8FAFC]">{exportItem.name}</p>
                      <p className="text-xs text-[#A1A1AA]">
                        {exportItem.timeRange} • {new Date(exportItem.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-[#1a1a1a] text-[#A1A1AA] text-xs">
                    {exportItem.type.toUpperCase()}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
