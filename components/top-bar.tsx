'use client';

import { useState } from 'react';
import { Bell, Users, Settings, Info, X, ChevronRight, Sparkles, Database, Shield, HelpCircle, Book, ExternalLink, UserPlus, Mail, Crown, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function TopBar() {
  const [showInfo, setShowInfo] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Settings state with localStorage persistence
  const [autoInsights, setAutoInsights] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('auto_insights');
    return saved === null ? true : saved === 'true';
  });
  
  const [notifSurveys, setNotifSurveys] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('notif_surveys');
    return saved === null ? true : saved === 'true';
  });
  
  const [notifInsights, setNotifInsights] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('notif_insights');
    return saved === null ? true : saved === 'true';
  });
  
  const [notifWeekly, setNotifWeekly] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('notif_weekly');
    return saved === null ? false : saved === 'true';
  });

  // Mock notifications (replace with real API call)
  const notifications = [
    { id: 1, type: 'survey', title: 'New survey response', message: '3 new responses to "Course Feedback"', time: '5 min ago', unread: true },
    { id: 2, type: 'insight', title: 'AI Insight generated', message: 'New insights available in Analytics', time: '2 hours ago', unread: true },
    { id: 3, type: 'user', title: 'New student enrolled', message: '5 students joined today', time: '4 hours ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleToggle = (setting: string, value: boolean) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(setting, String(value));
    }
    
    switch(setting) {
      case 'auto_insights': setAutoInsights(value); break;
      case 'notif_surveys': setNotifSurveys(value); break;
      case 'notif_insights': setNotifInsights(value); break;
      case 'notif_weekly': setNotifWeekly(value); break;
    }
  };

  return (
    <>
      <div className="fixed top-0 right-0 left-0 z-40 bg-[#0a0a0a] border-b border-[#1a1a1a] h-16 flex items-center justify-between px-6">
        {/* Left side - CreatorIQ Logo */}
        <div className="flex items-center">
          <span className="text-white font-bold text-4xl">
            <span className="text-white">Creator</span>
            <span className="text-[#10B981]">IQ</span>
          </span>
        </div>
        
        {/* Right side - Icons */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors relative" 
            title="Information"
          >
            <Info className="h-4 w-4 text-[#A1A1AA] hover:text-[#10B981]" />
          </button>
        </div>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end pt-16">
          <div className="bg-[#0f0f0f] border-l border-[#1a1a1a] w-full max-w-md h-full overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
                  <Info className="h-5 w-5 text-[#10B981]" />
                  About CreatorIQ
                </h2>
                <button onClick={() => setShowInfo(false)} className="p-2 hover:bg-[#1a1a1a] rounded-lg">
                  <X className="h-4 w-4 text-[#A1A1AA]" />
                </button>
              </div>

              <Card className="border-[#1a1a1a] bg-[#0a0a0a]">
                <CardHeader>
                  <CardTitle className="text-[#F8FAFC] flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#10B981]" />
                    What is CreatorIQ?
                  </CardTitle>
                  <CardDescription className="text-[#A1A1AA]">
                    AI-powered analytics platform for Whop creators
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-[#A1A1AA] text-sm">
                  <p className="leading-relaxed">
                    CreatorIQ helps you grow your Whop community by understanding what your students need, what's working, and where to improve.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-[#1a1a1a] bg-[#0a0a0a]">
                <CardHeader>
                  <CardTitle className="text-[#F8FAFC] text-sm">📊 How It Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <div className="text-[#10B981] font-semibold mb-1">1. Collect Feedback</div>
                    <p className="text-[#A1A1AA]">Use the Forms page to create surveys with 10+ niche templates (Trading, Fitness, E-commerce, etc.). Students see them in their dashboard.</p>
                  </div>
                  <div>
                    <div className="text-[#10B981] font-semibold mb-1">2. AI Generates Insights</div>
                    <p className="text-[#A1A1AA]">Our AI analyzes responses and generates actionable recommendations - no fake data, only real patterns from your students.</p>
                  </div>
                  <div>
                    <div className="text-[#10B981] font-semibold mb-1">3. Take Action</div>
                    <p className="text-[#A1A1AA]">Mark insights as "Actioned" to track improvements. See what content performs best and which students need support.</p>
                  </div>
                  <div>
                    <div className="text-[#10B981] font-semibold mb-1">4. Track Results</div>
                    <p className="text-[#A1A1AA]">Dashboard shows student engagement, completion rates, sentiment analysis, and content performance - all in real-time.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#1a1a1a] bg-[#0a0a0a]">
                <CardHeader>
                  <CardTitle className="text-[#F8FAFC] text-sm">🎯 Quick Start Guide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-[#10B981] font-bold">→</span>
                    <div>
                      <span className="text-[#F8FAFC] font-medium">Forms:</span>
                      <span className="text-[#A1A1AA]"> Click "Niche Templates" to create your first survey in seconds</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#10B981] font-bold">→</span>
                    <div>
                      <span className="text-[#F8FAFC] font-medium">AI Insights:</span>
                      <span className="text-[#A1A1AA]"> Click "Generate Insights" after collecting 3+ responses</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#10B981] font-bold">→</span>
                    <div>
                      <span className="text-[#F8FAFC] font-medium">Dashboard:</span>
                      <span className="text-[#A1A1AA]"> View student engagement and content performance metrics</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#10B981] font-bold">→</span>
                    <div>
                      <span className="text-[#F8FAFC] font-medium">Revenue:</span>
                      <span className="text-[#A1A1AA]"> Track subscriptions, churn, and revenue trends</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#1a1a1a] bg-[#0a0a0a]">
                <CardHeader>
                  <CardTitle className="text-[#F8FAFC] text-sm">💡 Pro Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-[#A1A1AA]">
                  <p>• Use niche-specific templates to get better, targeted feedback</p>
                  <p>• Generate insights weekly to track improvement trends</p>
                  <p>• Mark insights as "Actioned" to build your improvement history</p>
                  <p>• Export data regularly to share with your team</p>
                  <p>• Check Dashboard daily to spot issues early</p>
                </CardContent>
              </Card>

              <div className="text-xs text-[#71717A] text-center pt-4 border-t border-[#1a1a1a]">
                Version 1.0.0 • Built with Next.js & Supabase
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Panel */}
      {showUsers && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end pt-16">
          <div className="bg-[#0f0f0f] border-l border-[#1a1a1a] w-full max-w-md h-full overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#10B981]" />
                  Team Members
                </h2>
                <button onClick={() => setShowUsers(false)} className="p-2 hover:bg-[#1a1a1a] rounded-lg">
                  <X className="h-4 w-4 text-[#A1A1AA]" />
                </button>
              </div>

              <Button className="w-full bg-[#10B981] hover:bg-[#0E9F71] text-white gap-2">
                <UserPlus className="h-4 w-4" />
                Invite Team Member
              </Button>

              <div className="space-y-3">
                {/* Current user */}
                <Card className="border-[#1a1a1a] bg-[#0a0a0a]">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#10B981] flex items-center justify-center text-white font-bold">
                        <Crown className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[#F8FAFC] font-medium">You (Owner)</div>
                        <div className="text-xs text-[#A1A1AA]">Full access</div>
                      </div>
                      <Badge className="bg-[#10B981] text-white border-0">Owner</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Example team members */}
                <div className="text-xs text-[#71717A] uppercase tracking-wider font-semibold mb-2">
                  Team Members (Coming Soon)
                </div>
                <Card className="border-[#1a1a1a] bg-[#0a0a0a] opacity-50">
                  <CardContent className="p-4 text-center text-[#A1A1AA] text-sm">
                    Team collaboration features coming soon
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end pt-16">
          <div className="bg-[#0f0f0f] border-l border-[#1a1a1a] w-full max-w-md h-full overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
                  <Bell className="h-5 w-5 text-[#10B981]" />
                  Notifications
                  {unreadCount > 0 && (
                    <Badge className="bg-[#EF4444] text-white border-0 ml-2">{unreadCount}</Badge>
                  )}
                </h2>
                <button onClick={() => setShowNotifications(false)} className="p-2 hover:bg-[#1a1a1a] rounded-lg">
                  <X className="h-4 w-4 text-[#A1A1AA]" />
                </button>
              </div>

              <div className="space-y-3">
                {notifications.map((notif) => (
                  <Card key={notif.id} className={`border-[#1a1a1a] ${notif.unread ? 'bg-[#10B981]/5' : 'bg-[#0a0a0a]'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          notif.type === 'survey' ? 'bg-[#10B981]/20 text-[#10B981]' :
                          notif.type === 'insight' ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]' :
                          'bg-[#3B82F6]/20 text-[#3B82F6]'
                        }`}>
                          {notif.type === 'survey' ? <Activity className="h-4 w-4" /> :
                           notif.type === 'insight' ? <Sparkles className="h-4 w-4" /> :
                           <Users className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-[#F8FAFC] font-medium text-sm">{notif.title}</div>
                            {notif.unread && <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>}
                          </div>
                          <p className="text-[#A1A1AA] text-xs mb-1">{notif.message}</p>
                          <p className="text-[#71717A] text-xs">{notif.time}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button variant="outline" className="w-full border-[#1a1a1a] text-[#A1A1AA] hover:bg-[#1a1a1a]">
                Mark All as Read
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end pt-16">
          <div className="bg-[#0f0f0f] border-l border-[#1a1a1a] w-full max-w-md h-full overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
                  <Settings className="h-5 w-5 text-[#10B981]" />
                  Settings
                </h2>
                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-[#1a1a1a] rounded-lg">
                  <X className="h-4 w-4 text-[#A1A1AA]" />
                </button>
              </div>

              <div className="space-y-4">
                <Card className="border-[#1a1a1a] bg-[#0a0a0a]">
                  <CardHeader>
                    <CardTitle className="text-[#F8FAFC] text-sm flex items-center gap-2">
                      <Database className="h-4 w-4 text-[#10B981]" />
                      Data & Privacy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#A1A1AA]">PII Scrubbing</span>
                      <Badge className="bg-[#10B981] text-white border-0">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#A1A1AA]">Multi-tenant Isolation</span>
                      <Badge className="bg-[#10B981] text-white border-0">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#A1A1AA]">Data Encryption</span>
                      <Badge className="bg-[#10B981] text-white border-0">Enabled</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#1a1a1a] bg-[#0a0a0a]">
                  <CardHeader>
                    <CardTitle className="text-[#F8FAFC] text-sm flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#10B981]" />
                      AI Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#A1A1AA]">OpenAI Integration</span>
                      <Badge className="bg-[#10B981] text-white border-0">Connected</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#A1A1AA]">Model</span>
                      <span className="text-sm text-[#F8FAFC]">GPT-4o-mini</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#A1A1AA]">Auto-generate Insights</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={autoInsights}
                          onChange={(e) => handleToggle('auto_insights', e.target.checked)}
                        />
                        <div className="w-9 h-5 bg-[#1a1a1a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#10B981]"></div>
                      </label>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#1a1a1a] bg-[#0a0a0a]">
                  <CardHeader>
                    <CardTitle className="text-[#F8FAFC] text-sm flex items-center gap-2">
                      <Mail className="h-4 w-4 text-[#10B981]" />
                      Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#A1A1AA]">New Survey Responses</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={notifSurveys}
                          onChange={(e) => handleToggle('notif_surveys', e.target.checked)}
                        />
                        <div className="w-9 h-5 bg-[#1a1a1a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#10B981]"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#A1A1AA]">AI Insights Generated</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={notifInsights}
                          onChange={(e) => handleToggle('notif_insights', e.target.checked)}
                        />
                        <div className="w-9 h-5 bg-[#1a1a1a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#10B981]"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#A1A1AA]">Weekly Summary</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={notifWeekly}
                          onChange={(e) => handleToggle('notif_weekly', e.target.checked)}
                        />
                        <div className="w-9 h-5 bg-[#1a1a1a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#10B981]"></div>
                      </label>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
