'use client';

import { useState } from 'react';
import { Bell, Users, Settings, Info, X, ChevronRight, Sparkles, Database, Shield, HelpCircle, Book, ExternalLink, UserPlus, Mail, Crown, Activity, Menu } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OnboardingFlow } from './OnboardingFlow';
import { PaywallModal } from './PaywallModal';
import { useSidebar } from '@/contexts/sidebar-context';

export function TopBar() {
  const { setIsMobileOpen, isMobileOpen } = useSidebar();
  const [showInfo, setShowInfo] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  
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
      {/* First-time onboarding flow */}
      <OnboardingFlow 
        onInfoClick={() => setShowInfo(true)}
        onStartTrialClick={() => setShowPaywall(true)}
      />
      
      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        reason="Start your 7-day free trial to unlock all features"
      />
      
      <div className="fixed top-0 right-0 left-0 z-40 bg-card border-b border-border h-16 flex items-center justify-between px-4 md:px-6">
        {/* Left side - Mobile menu button + Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5 text-muted-foreground" />
          </button>
          <span className="text-foreground font-bold text-2xl md:text-4xl">
            <span className="text-foreground">Creator</span>
            <span className="text-primary">IQ</span>
          </span>
        </div>
        
        {/* Right side - Icons */}
        <div className="flex items-center gap-2 md:gap-3">
          <button 
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 rounded-lg hover:bg-muted transition-colors relative" 
            title="Information"
          >
            <Info className="h-4 w-4 text-muted-foreground hover:text-primary" />
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

              <Card className="border border-[#1a1a1a] bg-gradient-to-br from-[#0a0a0a] to-[#0f0f0f] relative overflow-hidden">
                {/* Subtle sheen overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent pointer-events-none"></div>
                
                <CardHeader className="relative">
                  <CardTitle className="text-[#F8FAFC] text-lg font-bold">
                    What is CreatorIQ?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-[#E5E7EB] text-sm relative">
                  <p className="leading-relaxed text-[#F8FAFC]">
                    This is an <span className="bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] bg-clip-text text-transparent font-semibold">all-in-one tool</span>, which utilises real-time student activity & student's raw feedback to generate actionable insights that:
                  </p>
                  
                  <div className="space-y-2.5 pl-1">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] shadow-lg shadow-[#8B5CF6]/50"></div>
                      <span className="text-[#E5E7EB]">Kills Churn</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] shadow-lg shadow-[#F59E0B]/50"></div>
                      <span className="text-[#E5E7EB]">Improves Student Experience</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] shadow-lg shadow-[#3B82F6]/50"></div>
                      <span className="text-[#E5E7EB]">Creates More Success Cases</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-lg shadow-[#10B981]/50"></div>
                      <span className="text-[#E5E7EB]">Generates & saves <span className="text-[#10B981] font-semibold">YOU</span> Money</span>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-[#1a1a1a]">
                    <p className="leading-relaxed text-[#D1D5DB] italic">
                      Our goal is not only to save a handful of students from churning, but to find bottle necks flying under the radar which can create success in your course that <span className="bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] bg-clip-text text-transparent font-semibold not-italic">students brag about paying for.</span>
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-[#1a1a1a] bg-[#0a0a0a]">
                <CardHeader>
                  <CardTitle className="text-[#F8FAFC] text-sm flex items-center gap-2">
                    📊 How It Works
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="bg-[#8B5CF6]/5 border border-[#8B5CF6]/20 rounded-lg p-3 border-l-2 border-l-[#8B5CF6]">
                    <div className="text-[#8B5CF6] font-semibold mb-1.5 flex items-center gap-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#8B5CF6] text-white text-xs font-bold">1</span>
                      Collect Feedback
                    </div>
                    <p className="text-[#D1D5DB] text-xs leading-relaxed">Use the Forms page to create surveys with 10+ niche templates (Trading, Fitness, E-commerce, etc.). Students see them in their dashboard.</p>
                  </div>
                  <div className="bg-[#F59E0B]/5 border border-[#F59E0B]/20 rounded-lg p-3 border-l-2 border-l-[#F59E0B]">
                    <div className="text-[#F59E0B] font-semibold mb-1.5 flex items-center gap-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#F59E0B] text-white text-xs font-bold">2</span>
                      AI Generates Insights
                    </div>
                    <p className="text-[#D1D5DB] text-xs leading-relaxed">Our AI analyzes responses and generates actionable recommendations - no fake data, only real patterns from your students.</p>
                  </div>
                  <div className="bg-[#3B82F6]/5 border border-[#3B82F6]/20 rounded-lg p-3 border-l-2 border-l-[#3B82F6]">
                    <div className="text-[#3B82F6] font-semibold mb-1.5 flex items-center gap-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#3B82F6] text-white text-xs font-bold">3</span>
                      Take Action
                    </div>
                    <p className="text-[#D1D5DB] text-xs leading-relaxed">Mark insights as "Actioned" to track improvements. See what content performs best and which students need support.</p>
                  </div>
                  <div className="bg-[#10B981]/5 border border-[#10B981]/20 rounded-lg p-3 border-l-2 border-l-[#10B981]">
                    <div className="text-[#10B981] font-semibold mb-1.5 flex items-center gap-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#10B981] text-white text-xs font-bold">4</span>
                      Track Results
                    </div>
                    <p className="text-[#D1D5DB] text-xs leading-relaxed">Dashboard shows student engagement, completion rates, sentiment analysis, and content performance - all in real-time.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#1a1a1a] bg-[#0a0a0a]">
                <CardHeader>
                  <CardTitle className="text-[#F8FAFC] text-sm">🎯 Quick Start Guide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-[#8B5CF6] font-bold">→</span>
                    <div>
                      <span className="text-[#F8FAFC] font-medium">Forms:</span>
                      <span className="text-[#A1A1AA]"> Create a survey and publish it to start collecting student feedback</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#F59E0B] font-bold">→</span>
                    <div>
                      <span className="text-[#F8FAFC] font-medium">AI Insights:</span>
                      <span className="text-[#A1A1AA]"> Click "Generate Insights" after collecting 3+ responses</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#3B82F6] font-bold">→</span>
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
