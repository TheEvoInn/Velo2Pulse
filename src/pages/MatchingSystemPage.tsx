import React, { useState } from 'react';
import { Target, Zap, CheckCircle, TrendingUp, Bot, RefreshCw, ArrowRight } from 'lucide-react';
import StatCard from '@/components/features/StatCard';
import StatusBadge from '@/components/features/StatusBadge';
import { getOpportunities, getAutopilots, getMatchScores, saveOpportunities, saveTasks, getTasks, formatCurrency, randomId } from '@/lib/mockData';
import type { Opportunity, Autopilot, MatchScore } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

function ScoreBar({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-1 rounded-full bg-[hsl(228_25%_15%)] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function MatchingSystemPage() {
  const [opportunities] = useState<Opportunity[]>(getOpportunities);
  const [autopilots] = useState<Autopilot[]>(getAutopilots);
  const [scores] = useState<MatchScore[]>(getMatchScores);
  const [running, setRunning] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState<string | null>(null);
  const [autoAssigned, setAutoAssigned] = useState(0);

  const topMatches = scores.filter(s => s.recommendation === 'top');
  const avgScore = scores.length ? Math.round(scores.reduce((a, s) => a + s.totalScore, 0) / scores.length) : 0;

  const runMatching = () => {
    setRunning(true);
    toast.info('Matching engine processing all opportunities...');
    setTimeout(() => {
      setRunning(false);
      toast.success(`Matching complete — ${scores.length} opportunity-autopilot pairs scored`);
    }, 2500);
  };

  const assignMatch = (score: MatchScore) => {
    const opp = opportunities.find(o => o.id === score.opportunityId);
    const ap = autopilots.find(a => a.id === score.autopilotId);
    if (!opp || !ap) return;
    toast.success(`${ap.name} assigned to "${opp.title}"`);
    setAutoAssigned(n => n + 1);
  };

  const batchAssignAll = () => {
    topMatches.forEach(s => {
      const tasks = getTasks();
      const newTask = {
        id: `task_${randomId()}`,
        name: `Apply: ${opportunities.find(o => o.id === s.opportunityId)?.title ?? 'Unknown'}`,
        type: 'application',
        status: 'queued' as const,
        autopilotId: s.autopilotId,
        opportunityId: s.opportunityId,
        priority: 1,
        progress: 0,
        logs: [{ timestamp: new Date().toISOString(), level: 'info' as const, message: 'Auto-assigned by Matching Engine' }],
        createdAt: new Date().toISOString(),
        retries: 0,
      };
      saveTasks([newTask, ...tasks]);
    });
    setAutoAssigned(topMatches.length);
    toast.success(`${topMatches.length} top matches auto-assigned and queued in Mission Control`);
  };

  const getOpportunity = (id: string) => opportunities.find(o => o.id === id);
  const getAutopilot = (id: string) => autopilots.find(a => a.id === id);

  return (
    <div className="space-y-6 slide-in-up">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pairs Scored" value={`${scores.length}`} sub="opportunity-autopilot pairs" icon={<Target size={16} />} accent="cyan" />
        <StatCard label="Top Matches" value={`${topMatches.length}`} sub="high-confidence pairs" accent="green" />
        <StatCard label="Avg Score" value={`${avgScore}%`} sub="match quality" accent="violet" />
        <StatCard label="Auto-Assigned" value={`${autoAssigned}`} sub="this session" accent="orange" />
      </div>

      {/* Controls */}
      <div className="glass-panel rounded-xl border border-[hsl(185_100%_50%/0.15)] p-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-base font-bold" style={{ fontFamily: 'Orbitron' }}>MATCHING ENGINE</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Scores all opportunity-autopilot pairs using skill alignment, category, effort, deadline, and constraints</p>
          </div>
          <div className="flex gap-3">
            <button onClick={batchAssignAll} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-[hsl(145_100%_50%/0.3)] bg-[hsl(145_100%_50%/0.1)] text-[hsl(145,100%,55%)] hover:bg-[hsl(145_100%_50%/0.2)] transition-colors">
              <CheckCircle size={14} /> Assign All Top Matches
            </button>
            <button onClick={runMatching} disabled={running} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-cyan-500 to-violet-500 text-black hover:opacity-90 disabled:opacity-50 transition-all">
              <RefreshCw size={14} className={running ? 'animate-spin' : ''} />
              {running ? 'Matching...' : 'Run Matching'}
            </button>
          </div>
        </div>
      </div>

      {/* Algorithm info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Skill Alignment', desc: 'Autopilot skills vs opportunity requirements', color: 'hsl(185,100%,55%)' },
          { label: 'Category Match', desc: 'Autopilot allowed categories vs opportunity type', color: 'hsl(265,80%,70%)' },
          { label: 'Effort Score', desc: 'Workload capacity vs task effort level', color: 'hsl(145,100%,55%)' },
          { label: 'Deadline Score', desc: 'Time urgency and autopilot availability', color: 'hsl(30,100%,60%)' },
        ].map(f => (
          <div key={f.label} className="glass-panel rounded-xl border border-[hsl(var(--border))] p-3">
            <div className="text-xs font-bold mb-1" style={{ color: f.color }}>{f.label}</div>
            <div className="text-[11px] text-muted-foreground">{f.desc}</div>
          </div>
        ))}
      </div>

      {/* Match Scores */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3" style={{ fontFamily: 'Orbitron' }}>Match Scores</h2>
        <div className="grid gap-4">
          {scores.map(score => {
            const opp = getOpportunity(score.opportunityId);
            const ap = getAutopilot(score.autopilotId);
            if (!opp || !ap) return null;
            const recColor = score.recommendation === 'top' ? 'hsl(145,100%,55%)' : score.recommendation === 'secondary' ? 'hsl(185,100%,55%)' : 'hsl(215,25%,55%)';
            const recBg = score.recommendation === 'top' ? 'border-[hsl(145_100%_50%/0.25)] bg-[hsl(145_100%_50%/0.04)]' : 'border-[hsl(var(--border))]';
            return (
              <div key={`${score.opportunityId}-${score.autopilotId}`} className={cn('glass-panel rounded-xl border p-5', recBg)}>
                <div className="flex items-start gap-5 flex-wrap">
                  {/* Left: Opportunity + Autopilot */}
                  <div className="flex-1 min-w-48">
                    <div className="flex items-center gap-2 mb-3">
                      <ArrowRight size={12} className="text-muted-foreground" />
                      <div>
                        <div className="text-sm font-semibold">{opp.title}</div>
                        <div className="text-[11px] text-muted-foreground">{opp.platform} · {opp.category} · {formatCurrency(opp.estimatedValue)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">{ap.avatar}</span>
                      <div>
                        <div className="text-sm font-semibold">{ap.name}</div>
                        <div className="text-[11px] text-muted-foreground">{ap.skills.slice(0, 3).join(', ')}</div>
                      </div>
                    </div>
                    {/* Reasons */}
                    <div className="space-y-1">
                      {score.reasons.map((r, i) => (
                        <div key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                          <CheckCircle size={10} className="text-[hsl(145,100%,55%)] mt-0.5 flex-shrink-0" />
                          {r}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Center: Score bars */}
                  <div className="w-48 space-y-2">
                    <ScoreBar value={score.skillScore} label="Skills" color="hsl(185,100%,55%)" />
                    <ScoreBar value={score.categoryScore} label="Category" color="hsl(265,80%,70%)" />
                    <ScoreBar value={score.effortScore} label="Effort" color="hsl(145,100%,55%)" />
                    <ScoreBar value={score.deadlineScore} label="Deadline" color="hsl(30,100%,60%)" />
                  </div>

                  {/* Right: Total score + actions */}
                  <div className="text-center flex-shrink-0">
                    <div className="relative w-20 h-20 mx-auto mb-2">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(228,25%,15%)" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke={recColor} strokeWidth="3"
                          strokeDasharray={`${score.totalScore} 100`} strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-black" style={{ color: recColor, fontFamily: 'Orbitron' }}>{score.totalScore}</span>
                      </div>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: recColor }}>
                      {score.recommendation}
                    </div>
                    <div className="mt-3 flex flex-col gap-2">
                      <StatusBadge status={score.confidence} />
                      <button
                        onClick={() => assignMatch(score)}
                        className={cn(
                          'px-3 py-1.5 rounded text-xs font-semibold transition-colors',
                          score.recommendation === 'top'
                            ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-black hover:opacity-90'
                            : 'bg-[hsl(228_25%_10%)] border border-[hsl(var(--border))] text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {score.recommendation === 'top' ? '⚡ Assign' : 'Assign'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Unmatched opportunities */}
      <div className="glass-panel rounded-xl border border-[hsl(var(--border))] p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3" style={{ fontFamily: 'Orbitron' }}>Unmatched Opportunities</h2>
        <div className="space-y-2">
          {opportunities.filter(o => o.status === 'new' && !scores.find(s => s.opportunityId === o.id)).map(opp => (
            <div key={opp.id} className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(228_25%_10%)] border border-[hsl(var(--border))]">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{opp.title}</div>
                <div className="text-xs text-muted-foreground">{opp.platform} · {opp.category} · {formatCurrency(opp.estimatedValue)}</div>
              </div>
              <StatusBadge status="new" />
              <button
                onClick={() => {
                  toast.info('Running matching algorithm for this opportunity...');
                  setTimeout(() => toast.success('Match found! ARIA-7 recommended (87% score)'), 1500);
                }}
                className="text-xs px-3 py-1.5 rounded border border-[hsl(185_100%_50%/0.3)] bg-[hsl(185_100%_50%/0.08)] text-[hsl(185,100%,55%)] hover:bg-[hsl(185_100%_50%/0.15)] transition-colors flex items-center gap-1"
              >
                <Target size={11} /> Find Match
              </button>
            </div>
          ))}
          {opportunities.filter(o => o.status === 'new' && !scores.find(s => s.opportunityId === o.id)).length === 0 && (
            <div className="text-center py-6 text-muted-foreground text-sm">All new opportunities have been scored</div>
          )}
        </div>
      </div>
    </div>
  );
}
