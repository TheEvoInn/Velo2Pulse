import React, { useState, useEffect, useRef } from 'react';
import { Monitor, Play, Pause, RefreshCw, CheckCircle, AlertTriangle, Camera, Globe, MousePointer, Type, Upload, Clock, ChevronDown, ChevronUp, Plus, Shield } from 'lucide-react';
import StatCard from '@/components/features/StatCard';
import StatusBadge from '@/components/features/StatusBadge';
import { getAutomationSessions, saveAutomationSessions, timeAgo, randomId } from '@/lib/mockData';
import type { AutomationSession, AutomationStep } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const ACTION_ICONS: Record<string, React.ElementType> = {
  navigate: Globe,
  click: MousePointer,
  fill: Type,
  upload: Upload,
  submit: Play,
  extract: RefreshCw,
  wait: Clock,
  screenshot: Camera,
};

const PLATFORM_PRESETS = [
  { name: 'Upwork Application', platform: 'Upwork', steps: ['Navigate to job URL', 'Click Apply button', 'Fill cover letter', 'Set bid amount', 'Submit proposal'] },
  { name: 'Fiverr Gig Apply', platform: 'Fiverr', steps: ['Navigate to gig URL', 'Click Order button', 'Fill requirements form', 'Upload work samples', 'Complete checkout'] },
  { name: 'AliExpress Scraper', platform: 'AliExpress', steps: ['Navigate category page', 'Sort by orders', 'Extract product data', 'Filter by margin', 'Export to inventory'] },
  { name: 'Arbitrum Bridge', platform: 'Arbitrum', steps: ['Navigate to bridge', 'Connect wallet', 'Enter amount', 'Confirm transaction', 'Wait for confirmation'] },
  { name: 'ClickWorker Tasks', platform: 'ClickWorker', steps: ['Login to ClickWorker', 'Browse available tasks', 'Accept highest-paying task', 'Complete task steps', 'Submit for review'] },
  { name: 'zkSync Protocol', platform: 'zkSync Era', steps: ['Navigate to SyncSwap', 'Connect wallet', 'Execute token swap', 'Confirm transaction', 'Screenshot receipt'] },
];

export default function BrowserAutomationPage() {
  const [sessions, setSessions] = useState<AutomationSession[]>(getAutomationSessions);
  const [expanded, setExpanded] = useState<string | null>('as_002');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(PLATFORM_PRESETS[0]);
  const [liveLog, setLiveLog] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  const running = sessions.filter(s => s.status === 'running').length;
  const completed = sessions.filter(s => s.status === 'completed').length;
  const failed = sessions.filter(s => s.status === 'failed').length;

  useEffect(() => {
    const LIVE_MESSAGES = [
      '› Playwright browser instance initialized',
      '› Navigating to https://bridge.arbitrum.io...',
      '› Page loaded successfully (1.2s)',
      '› Locating wallet connect button...',
      '› Found element: [data-test="wallet-connect"]',
      '› Injecting MetaMask credentials from Vault...',
      '› Wallet connected: 0x1a2b...7890',
      '› Filling amount field: 0.01 ETH',
      '› Clicking bridge button...',
      '› MetaMask popup detected — confirming...',
      '› Transaction submitted: TX 0xabc...def',
      '⚠ Waiting for block confirmation...',
    ];
    let i = 0;
    const iv = setInterval(() => {
      if (i < LIVE_MESSAGES.length) {
        setLiveLog(prev => [...prev.slice(-20), LIVE_MESSAGES[i]]);
        i++;
      }
    }, 1200);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [liveLog]);

  const startSession = () => {
    const steps: AutomationStep[] = selectedPreset.steps.map((desc, i) => ({
      id: `step_${i}`,
      description: desc,
      status: 'pending' as const,
      action: i === 0 ? 'navigate' : i === selectedPreset.steps.length - 1 ? 'submit' : 'click',
    }));
    const newSession: AutomationSession = {
      id: `as_${randomId()}`,
      name: selectedPreset.name,
      platform: selectedPreset.platform,
      status: 'running',
      steps,
      currentStep: 0,
      startedAt: new Date().toISOString(),
      retries: 0,
    };
    const updated = [newSession, ...sessions];
    setSessions(updated);
    saveAutomationSessions(updated);
    setShowCreate(false);
    toast.success(`Automation session started: ${selectedPreset.name}`);
    // Simulate progress
    let step = 0;
    const advance = setInterval(() => {
      step++;
      if (step >= steps.length) {
        clearInterval(advance);
        setSessions(prev => prev.map(s => s.id === newSession.id ? {
          ...s,
          status: 'completed',
          currentStep: steps.length,
          completedAt: new Date().toISOString(),
          steps: steps.map(st => ({ ...st, status: 'completed' })),
        } : s));
        toast.success(`Session "${selectedPreset.name}" completed`);
      } else {
        setSessions(prev => prev.map(s => s.id === newSession.id ? {
          ...s,
          currentStep: step,
          steps: steps.map((st, i) => ({
            ...st,
            status: i < step ? 'completed' : i === step ? 'running' : 'pending',
            completedAt: i < step ? new Date().toISOString() : undefined,
          })),
        } : s));
      }
    }, 2000);
  };

  const pauseSession = (id: string) => {
    const updated = sessions.map(s => s.id === id ? { ...s, status: 'idle' as const } : s);
    setSessions(updated);
    saveAutomationSessions(updated);
    toast.info('Session paused');
  };

  const retrySession = (id: string) => {
    const updated = sessions.map(s => s.id === id ? { ...s, status: 'running' as const, retries: s.retries + 1 } : s);
    setSessions(updated);
    saveAutomationSessions(updated);
    toast.info('Session retrying...');
  };

  return (
    <div className="space-y-6 slide-in-up">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Sessions" value={`${sessions.length}`} sub="automation workflows" icon={<Monitor size={16} />} accent="cyan" />
        <StatCard label="Running" value={`${running}`} sub="active now" accent="orange" />
        <StatCard label="Completed" value={`${completed}`} sub="successful runs" accent="green" />
        <StatCard label="Failed" value={`${failed}`} sub="need retry" accent="red" />
      </div>

      {/* Tech stack info */}
      <div className="glass-panel rounded-xl border border-[hsl(185_100%_50%/0.15)] p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[hsl(145,100%,55%)] animate-pulse" />
            <span className="text-xs font-bold text-[hsl(185,100%,55%)]" style={{ fontFamily: 'Orbitron' }}>PLAYWRIGHT ENGINE</span>
          </div>
          <span className="text-xs text-muted-foreground">Self-hosted · Chromium + Firefox + WebKit · No paid services</span>
          <div className="flex gap-2 ml-auto">
            <span className="text-[10px] px-2 py-1 rounded bg-[hsl(145_100%_50%/0.1)] border border-[hsl(145_100%_50%/0.2)] text-[hsl(145,100%,55%)]">Fallback Selectors ✓</span>
            <span className="text-[10px] px-2 py-1 rounded bg-[hsl(185_100%_50%/0.1)] border border-[hsl(185_100%_50%/0.2)] text-[hsl(185,100%,55%)]">Auto-Retry ✓</span>
            <span className="text-[10px] px-2 py-1 rounded bg-[hsl(265_80%_55%/0.1)] border border-[hsl(265_80%_55%/0.2)] text-[hsl(265,80%,70%)]">CAPTCHA Detection ✓</span>
            <span className="text-[10px] px-2 py-1 rounded bg-[hsl(30_100%_55%/0.1)] border border-[hsl(30_100%_55%/0.2)] text-[hsl(30,100%,60%)]">Rate Limiting ✓</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sessions list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: 'Orbitron' }}>Automation Sessions</h2>
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-violet-500 text-black hover:opacity-90 transition-opacity">
              <Plus size={13} /> New Session
            </button>
          </div>
          {sessions.map(session => {
            const isExpanded = expanded === session.id;
            return (
              <div key={session.id} className="glass-panel rounded-xl border border-[hsl(var(--border))] overflow-hidden">
                <div
                  className="p-4 cursor-pointer hover:bg-[hsl(228_25%_10%/0.5)] transition-colors"
                  onClick={() => setExpanded(e => e === session.id ? null : session.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{session.name}</span>
                        <StatusBadge status={session.status} />
                      </div>
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        <span>{session.platform}</span>
                        {session.startedAt && <span>Started {timeAgo(session.startedAt)}</span>}
                        {session.retries > 0 && <span className="text-[hsl(30,100%,60%)]">Retry #{session.retries}</span>}
                      </div>
                      {/* Progress */}
                      {session.steps.length > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1 rounded-full bg-[hsl(228_25%_15%)] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all duration-500"
                              style={{ width: `${(session.currentStep / session.steps.length) * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground">{session.currentStep}/{session.steps.length}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {session.status === 'running' && (
                        <button onClick={e => { e.stopPropagation(); pauseSession(session.id); }} className="p-1.5 rounded hover:bg-[hsl(228_25%_15%)] transition-colors">
                          <Pause size={12} className="text-muted-foreground" />
                        </button>
                      )}
                      {session.status === 'failed' && (
                        <button onClick={e => { e.stopPropagation(); retrySession(session.id); }} className="p-1.5 rounded hover:bg-[hsl(228_25%_15%)] transition-colors">
                          <RefreshCw size={12} className="text-muted-foreground" />
                        </button>
                      )}
                      {isExpanded ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                    </div>
                  </div>
                </div>
                {isExpanded && (
                  <div className="border-t border-[hsl(var(--border))] px-4 py-3 bg-[hsl(228_35%_5%/0.5)] space-y-2">
                    {session.steps.map((step, i) => {
                      const Icon = ACTION_ICONS[step.action] ?? Globe;
                      return (
                        <div key={step.id} className={cn('flex items-start gap-3 text-xs', step.status === 'completed' ? 'opacity-60' : '')}>
                          <div className={cn('w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5', {
                            'bg-[hsl(145_100%_50%/0.2)]': step.status === 'completed',
                            'bg-[hsl(185_100%_50%/0.2)] animate-pulse': step.status === 'running',
                            'bg-[hsl(228_25%_15%)]': step.status === 'pending',
                            'bg-[hsl(0_85%_60%/0.2)]': step.status === 'failed',
                          })}>
                            {step.status === 'completed' ? <CheckCircle size={11} className="text-[hsl(145,100%,55%)]" /> :
                             step.status === 'failed' ? <AlertTriangle size={11} className="text-[hsl(0,85%,65%)]" /> :
                             <Icon size={11} className="text-muted-foreground" />}
                          </div>
                          <div className="flex-1">
                            <div className={cn('font-medium', step.status === 'running' ? 'text-[hsl(185,100%,55%)]' : 'text-foreground')}>{step.description}</div>
                            {step.target && <div className="text-[10px] text-muted-foreground font-mono">{step.target}</div>}
                            {step.completedAt && <div className="text-[10px] text-muted-foreground">{timeAgo(step.completedAt)}</div>}
                            {step.error && <div className="text-[10px] text-[hsl(0,85%,65%)]">{step.error}</div>}
                          </div>
                          <div className="text-[10px] uppercase text-muted-foreground">{step.action}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Live console */}
        <div className="glass-panel rounded-xl border border-[hsl(var(--border))] p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-[hsl(145,100%,55%)] animate-pulse" />
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: 'Orbitron' }}>Live Automation Console</h2>
            <span className="ml-auto text-[10px] font-mono text-muted-foreground">Playwright v1.42</span>
          </div>
          <div
            ref={logRef}
            className="flex-1 bg-[hsl(230_35%_3%)] rounded-lg p-4 font-mono text-[11px] overflow-y-auto space-y-1.5 min-h-64"
          >
            <div className="text-[hsl(145,100%,55%)]">VELO 2.0 Browser Automation Engine v1.0</div>
            <div className="text-muted-foreground">Using Playwright OSS (self-hosted Chromium)</div>
            <div className="text-muted-foreground">Vault: credentials loaded ✓</div>
            <div className="text-muted-foreground border-b border-[hsl(228,25%,14%)] pb-2 mb-2">Safety shield: ACTIVE ✓</div>
            {liveLog.filter(Boolean).map((line, i) => (
              <div key={i} className={cn('slide-in-up', line.startsWith('⚠') ? 'text-[hsl(30,100%,60%)]' : line.startsWith('✓') ? 'text-[hsl(145,100%,55%)]' : 'text-muted-foreground')}>{line}</div>
            ))}
            <div className="text-[hsl(185,100%,55%)] animate-pulse">_</div>
          </div>

          {/* CAPTCHA handling */}
          <div className="mt-4 p-3 rounded-lg border border-[hsl(30_100%_55%/0.2)] bg-[hsl(30_100%_55%/0.04)]">
            <div className="flex items-center gap-2 text-xs font-semibold text-[hsl(30,100%,60%)] mb-1">
              <Shield size={12} /> CAPTCHA Handling
            </div>
            <div className="text-[11px] text-muted-foreground">
              CAPTCHA detected → pause automation → flag for human review → resume after manual solve
            </div>
          </div>
        </div>
      </div>

      {/* Create session modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <div className="glass-panel-bright rounded-2xl border border-[hsl(185_100%_50%/0.2)] p-6 w-full max-w-lg mx-4 slide-in-up" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold mb-4 text-neon-cyan" style={{ fontFamily: 'Orbitron' }}>NEW AUTOMATION SESSION</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-2 block uppercase tracking-wider">Select Platform Preset</label>
                <div className="grid grid-cols-2 gap-2">
                  {PLATFORM_PRESETS.map(preset => (
                    <button
                      key={preset.name}
                      onClick={() => setSelectedPreset(preset)}
                      className={cn('p-3 rounded-lg border text-left transition-colors text-xs', selectedPreset.name === preset.name ? 'border-[hsl(185_100%_50%/0.5)] bg-[hsl(185_100%_50%/0.1)] text-[hsl(185,100%,55%)]' : 'border-[hsl(var(--border))] text-muted-foreground hover:text-foreground hover:border-[hsl(185_100%_50%/0.3)]')}
                    >
                      <div className="font-semibold mb-0.5">{preset.platform}</div>
                      <div className="text-[10px] opacity-70">{preset.name}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[hsl(228_35%_5%)] border border-[hsl(var(--border))]">
                <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Workflow Steps</div>
                {selectedPreset.steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground py-1">
                    <span className="w-4 h-4 rounded-full bg-[hsl(228_25%_15%)] text-[10px] flex items-center justify-center flex-shrink-0">{i + 1}</span>
                    {step}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2 rounded-lg text-sm font-semibold bg-[hsl(228_25%_10%)] border border-[hsl(var(--border))] text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={startSession} className="flex-1 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-cyan-500 to-violet-500 text-black hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                <Play size={14} /> Launch Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
