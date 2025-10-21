'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Users, 
  Settings, 
  Play, 
  Pause, 
  Calendar,
  Bell,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface FormDeliverySettingsProps {
  formId: string;
  companyId: string;
  onSettingsChange?: (settings: DeliverySettings) => void;
}

interface DeliverySettings {
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  autoShow: boolean;
  delay: number;
  allowSkip: boolean;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  targetCourses?: string[];
}

export default function FormDeliverySettings({
  formId,
  companyId,
  onSettingsChange
}: FormDeliverySettingsProps) {
  const [settings, setSettings] = useState<DeliverySettings>({
    frequency: 'once',
    autoShow: true,
    delay: 3000,
    allowSkip: true,
    isActive: false,
    startDate: new Date().toISOString().split('T')[0],
    endDate: undefined,
    targetCourses: []
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSettingChange = (key: keyof DeliverySettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const toggleActive = () => {
    handleSettingChange('isActive', !settings.isActive);
  };

  const frequencyOptions = [
    { value: 'once', label: 'Once Only', description: 'Show form once per student' },
    { value: 'daily', label: 'Daily', description: 'Show form every day' },
    { value: 'weekly', label: 'Weekly', description: 'Show form every week' },
    { value: 'monthly', label: 'Monthly', description: 'Show form every month' }
  ];

  return (
    <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg">
      <CardHeader>
        <CardTitle className="text-[#E1E4EA] flex items-center gap-2">
          <Settings className="h-5 w-5 text-[#10B981]" />
          Form Delivery Settings
        </CardTitle>
        <p className="text-sm text-[#9AA4B2]">
          Configure how and when forms are delivered to students
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Active Status */}
        <div className="flex items-center justify-between p-4 bg-[#0B2C24] border border-[#17493A] rounded-lg">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${settings.isActive ? 'bg-[#10B981]' : 'bg-[#9AA4B2]'}`} />
            <div>
              <h4 className="text-sm font-semibold text-[#E1E4EA]">
                Delivery Status
              </h4>
              <p className="text-xs text-[#9AA4B2]">
                {settings.isActive ? 'Forms are being delivered to students' : 'Delivery is paused'}
              </p>
            </div>
          </div>
          <Button
            onClick={toggleActive}
            className={`gap-2 ${
              settings.isActive 
                ? 'bg-[#0B2C24] hover:bg-[#0E3A2F] text-white border border-[#17493A]' 
                : 'bg-[#10B981] hover:bg-[#0E9F71] text-white'
            }`}
            size="sm"
          >
            {settings.isActive ? (
              <>
                <Pause className="h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Start
              </>
            )}
          </Button>
        </div>

        {/* Frequency Settings */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-[#E1E4EA] flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#10B981]" />
            Delivery Frequency
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {frequencyOptions.map((option) => (
              <label
                key={option.value}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  settings.frequency === option.value
                    ? 'border-[#10B981] bg-[#0B2C24]'
                    : 'border-[#2A2F36] hover:border-[#10B981]/50'
                }`}
              >
                <input
                  type="radio"
                  name="frequency"
                  value={option.value}
                  checked={settings.frequency === option.value}
                  onChange={(e) => handleSettingChange('frequency', e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${
                    settings.frequency === option.value ? 'bg-[#10B981]' : 'bg-[#9AA4B2]'
                  }`} />
                  <span className="text-sm font-medium text-[#E1E4EA]">
                    {option.label}
                  </span>
                </div>
                <p className="text-xs text-[#9AA4B2]">
                  {option.description}
                </p>
              </label>
            ))}
          </div>
        </div>

        {/* Display Settings */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-[#E1E4EA] flex items-center gap-2">
            <Bell className="h-4 w-4 text-[#10B981]" />
            Display Settings
          </h4>
          
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-[#0B2C24] border border-[#17493A] rounded-lg">
              <div>
                <span className="text-sm font-medium text-[#E1E4EA]">Auto-show form</span>
                <p className="text-xs text-[#9AA4B2]">Automatically display form when students enter course</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoShow}
                onChange={(e) => handleSettingChange('autoShow', e.target.checked)}
                className="w-4 h-4 text-[#10B981] bg-[#0B2C24] border-[#17493A] rounded focus:ring-[#10B981]"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-[#0B2C24] border border-[#17493A] rounded-lg">
              <div>
                <span className="text-sm font-medium text-[#E1E4EA]">Allow students to skip</span>
                <p className="text-xs text-[#9AA4B2]">Students can choose not to fill out the form</p>
              </div>
              <input
                type="checkbox"
                checked={settings.allowSkip}
                onChange={(e) => handleSettingChange('allowSkip', e.target.checked)}
                className="w-4 h-4 text-[#10B981] bg-[#0B2C24] border-[#17493A] rounded focus:ring-[#10B981]"
              />
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#E1E4EA]">
              Display delay (seconds)
            </label>
            <input
              type="number"
              min="0"
              max="60"
              value={settings.delay / 1000}
              onChange={(e) => handleSettingChange('delay', parseInt(e.target.value) * 1000)}
              className="w-full px-3 py-2 bg-[#0B2C24] border border-[#17493A] rounded-lg text-[#E1E4EA] focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981]"
            />
            <p className="text-xs text-[#9AA4B2]">
              How long to wait before showing the form (0 = immediate)
            </p>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="space-y-4">
          <Button
            onClick={() => setShowAdvanced(!showAdvanced)}
            variant="ghost"
            className="w-full text-[#9AA4B2] hover:text-[#E1E4EA] justify-start"
          >
            <Settings className="h-4 w-4 mr-2" />
            {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
          </Button>

          {showAdvanced && (
            <div className="space-y-4 p-4 bg-[#0B2C24] border border-[#17493A] rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#E1E4EA] block mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={settings.startDate || ''}
                    onChange={(e) => handleSettingChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B2C24] border border-[#17493A] rounded-lg text-[#E1E4EA] focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#E1E4EA] block mb-2">
                    End Date (optional)
                  </label>
                  <input
                    type="date"
                    value={settings.endDate || ''}
                    onChange={(e) => handleSettingChange('endDate', e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B2C24] border border-[#17493A] rounded-lg text-[#E1E4EA] focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="p-4 bg-[#0B2C24] border border-[#17493A] rounded-lg">
          <h4 className="text-sm font-semibold text-[#E1E4EA] mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-[#10B981]" />
            Delivery Summary
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Badge className="bg-[#10B981] text-white">
                {settings.frequency}
              </Badge>
              <span className="text-[#9AA4B2]">frequency</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={settings.autoShow ? 'bg-[#10B981]' : 'bg-[#9AA4B2]'} text="white">
                {settings.autoShow ? 'auto-show' : 'manual'}
              </Badge>
              <span className="text-[#9AA4B2]">display</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={settings.allowSkip ? 'bg-[#10B981]' : 'bg-[#9AA4B2]'} text="white">
                {settings.allowSkip ? 'optional' : 'required'}
              </Badge>
              <span className="text-[#9AA4B2]">participation</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
