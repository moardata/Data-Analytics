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

  // Mock notifications (replace with real API call)
  const notifications = [
    { id: 1, type: 'survey', title: 'New survey response', message: '3 new responses to "Course Feedback"', time: '5 min ago', unread: true },
    { id: 2, type: 'insight', title: 'AI Insight generated', message: 'New insights available in Analytics', time: '2 hours ago', unread: true },
    { id: 3, type: 'user', title: 'New student enrolled', message: '5 students joined today', time: '4 hours ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

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
                <CardContent className="space-y-3 text-[#A1A1AA] text-sm">
                  <p>CreatorIQ helps you understand your community better through:</p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-[#10B981] mt-0.5" />
                      <span>AI-powered insights from student feedback</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-[#10B981] mt-0.5" />
                      <span>Custom survey builder with 10+ niche templates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-[#10B981] mt-0.5" />
                      <span>Real-time analytics and engagement tracking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-[#10B981] mt-0.5" />
                      <span>Data export and comprehensive reporting</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-[#1a1a1a] bg-[#0a0a0a]">
                <CardHeader>
                  <CardTitle className="text-[#F8FAFC] text-sm">Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start text-[#A1A1AA] hover:text-[#10B981]">
                    <Book className="h-4 w-4 mr-2" />
                    Documentation
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-[#A1A1AA] hover:text-[#10B981]">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Help & Support
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </Button>
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
                        <input type="checkbox" className="sr-only peer" defaultChecked />
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
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-9 h-5 bg-[#1a1a1a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#10B981]"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#A1A1AA]">AI Insights Generated</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-9 h-5 bg-[#1a1a1a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#10B981]"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#A1A1AA]">Weekly Summary</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
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
