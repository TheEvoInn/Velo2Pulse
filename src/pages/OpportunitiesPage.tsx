import React, { useState, useEffect, useCallback } from 'react';
import { Radar, RefreshCw, Filter, ExternalLink, Zap, Star, Clock, TrendingUp, Wifi, Rocket } from 'lucide-react';
import StatCard from '@/components/features/StatCard';
import StatusBadge from '@/components/features/StatusBadge';
import ApplicationWorkflow from '@/components/features/ApplicationWorkflow';
import { checkPlatformCompliance } from '@/components/features/PlatformTermsChecker';
import { fetchOpportunityFeed, getOpportunitiesFromDB, runMatchingEngine } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { formatCurrency, timeAgo } from '@/lib/mockData';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CATEGORIES = ['all', 'freelance', 'crypto', 'gig', 'remote_job', 'dropshipping'];
const CONFIDENCE_COLORS = {
  high: 'text-[hsl(145,100%,55%)] border-[hsl(145_100%_50%/0.3)] bg-[hsl(145_100%_50%/0.08)]',
  medium: 'text-[hsl(30,100%,60%)] border-[hsl(30_100%_55%/0.3)] bg-[hsl(30_100%_55%/0.08)]',
  low: 'text-muted-foreground border-[hsl(var(--border))] bg-[hsl(228_25%_10%)]',
};

interface DBOpportunity {
  id: string;
  title: string;
  platform: string;
  category: string;
  estimated_value: number;
  currency: string;
  effort: string;
  deadline?: string;
  requirements: string[];
  confidence: 'high' | 'medium' | 'low';
  url?: string;
  status: string;
  description?: string;
  scanned_at: string;
  matched_autopilot_id?: string;
}

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<DBOpportunity[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [matchingId, setMatchingId] = useState<string | null>(null);
  const [applyingOpp, setApplyingOpp] = useState<DBOpportunity | null>(null);

  const loadOpportunities = useCallback(async () => {
    const { data, error } = await getOpportunitiesFromDB();
    if (!error && data) {
      setOpportunities(data as DBOpportunity[]);
      if (data.length > 0) setLastScan((data[0] as DBOpportunity).scanned_at);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadOpportunities();
    // Poll every 30 seconds for new opportunities
    const interval = setInterval(loadOpportunities, 30000);
    return () => clearInterval(interval);
  }, [loadOpportunities]);

  const runScan = async () => {
    setScanning(true);
    toast.info('Star Scanner initiated — fetching live opportunities...');
    const cats = filter === 'all' ? ['freelance', 'crypto', 'gig', 'remote_job'] : [filter];
    const { data, error } = await fetchOpportunityFeed(cats, 20);
    if (error) {
      toast.error('Scan failed: ' + error);
    } else {
      toast.success(`Discovered ${data?.count || 0} new opportunities from ${data?.sources?.length || 0} sources!`);
      setLastScan(new Date().toISOString());
      await loadOpportunities();
    }
    setScanning(false);
  };

  const matchOpportunity = async (id: string) => {
    setMatchingId(id);
    const { data, error } = await runMatchingEngine(id, true);
    if (error) {
      toast.error('Matching failed: ' + error);
    } else {
      const matches = (data as { matches: { autopilot_name: string; total_score: number }[] })?.matches || [];
      if (matches.length > 0) {
        toast.success(`Matched to ${matches[0].autopilot_name} (Score: ${matches[0].total_score}%)`);
      } else {
        toast.info('No suitable autopilots available');
      }
      await loadOpportunities();
    }
    setMatchingId(null);
  };

  const filtered = filter === 'all' ? opportunities : opportunities.filter(o => o.category === filter);
  const high = opportunities.filter(o => o.confidence === 'high').length;
  const totalValue = opportunities.reduce((s, o) => s + (o.estimated_value || 0), 0);

  return (
    <div className="space-y-6 slide-in-up">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Discovered" value={`${opportunities.length}`} sub="in live feed" icon={<Radar size={16} />} accent="cyan" />
        <StatCard label="High Confidence" value={`${high}`} sub="ready to apply" accent="green" />
        <StatCard label="Est. Total Value" value={`~${formatCurrency(totalValue)}`} sub="across all opps" accent="violet" />
        <StatCard label="Live Sources" value="4+" sub="platforms scanning" accent="orange" />
      </div>

      {/* Live scan bar */}
      <div className="glass-panel rounded-xl border border-[hsl(185_100%_50%/0.15)] p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className={cn('w-2 h-2 rounded-full', scanning ? 'bg-[hsl(30,100%,60%)] animate-pulse' : 'bg-[hsl(145,100%,55%)]')} />
          <div>
            <div className="text-xs font-bold text-[hsl(185,100%,55%)]" style={{ fontFamily: 'Orbitron' }}>
              {scanning ? 'SCANNING LIVE...' : 'STAR SCANNER — ONLINE'}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {lastScan ? `Last scan: ${timeAgo(lastScan)}` : 'No scans yet'} · Sources: Remotive, Crypto Protocols, Freelance Boards, Scale AI
            </div>
          </div>
        </div>
        <button
          onClick={runScan}
          disabled={scanning}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-500 to-violet-500 text-black hover:opacity-90 disabled:opacity-60 transition-all"
        >
          <RefreshCw size={14} className={scanning ? 'animate-spin' : ''} />
          {scanning ? 'Scanning...' : 'Run Live Scan'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-semibold border capitalize transition-colors',
              filter === cat
                ? 'bg-[hsl(185_100%_50%/0.15)] text-[hsl(185,100%,55%)] border-[hsl(185_100%_50%/0.3)]'
                : 'bg-[hsl(228_25%_10%)] text-muted-foreground border-[hsl(var(--border))] hover:text-foreground'
            )}
          >{cat.replace('_', ' ')}</button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">{filtered.length} opportunities</span>
      </div>

      {/* Opportunities list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[hsl(185_100%_50%/0.3)] border-t-[hsl(185,100%,55%)] rounded-full animate-spin mx-auto mb-3" />
            <div className="text-xs text-muted-foreground">Loading opportunities...</div>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel rounded-xl border border-[hsl(var(--border))] p-12 text-center">
          <Radar size={40} className="text-muted-foreground mx-auto mb-4 opacity-30" />
          <div className="text-sm font-semibold mb-2">No opportunities found</div>
          <div className="text-xs text-muted-foreground mb-4">Run a live scan to discover real opportunities from 4+ platforms</div>
          <button onClick={runScan} disabled={scanning} className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-500 to-violet-500 text-black hover:opacity-90 disabled:opacity-60 transition-all">
            Run First Scan
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(opp => (
            <div key={opp.id} className={cn(
              'glass-panel rounded-xl border transition-all hover:border-[hsl(185_100%_50%/0.2)]',
              opp.confidence === 'high' ? 'border-[hsl(145_100%_50%/0.15)]' : 'border-[hsl(var(--border))]'
            )}>
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3 className="font-bold text-sm">{opp.title}</h3>
                      <StatusBadge status={opp.status} />
                      <span className={cn('text-[10px] px-2 py-0.5 rounded border', CONFIDENCE_COLORS[opp.confidence])}>
                        {opp.confidence} confidence
                      </span>
                      {opp.matched_autopilot_id && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[hsl(265_80%_55%/0.1)] border border-[hsl(265_80%_55%/0.2)] text-[hsl(265,80%,70%)]">
                          Assigned
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2 flex-wrap">
                      <span className="font-medium text-foreground">{opp.platform}</span>
                      <span>·</span>
                      <span className="capitalize">{opp.category?.replace('_', ' ')}</span>
                      <span>·</span>
                      <span className="capitalize">{opp.effort} effort</span>
                      {opp.deadline && <><span>·</span><span>Deadline: {timeAgo(opp.deadline)}</span></>}
                      <span>·</span>
                      <span className="opacity-60">Scanned {timeAgo(opp.scanned_at)}</span>
                    </div>
                    {opp.description && (
                      <p className="text-xs text-muted-foreground mb-3 leading-relaxed line-clamp-2">{opp.description}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {(opp.requirements || []).slice(0, 4).map(r => (
                        <span key={r} className="text-[10px] px-2 py-0.5 rounded bg-[hsl(228_25%_12%)] border border-[hsl(var(--border))] text-muted-foreground">{r}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-xl font-black text-[hsl(185,100%,55%)]" style={{ fontFamily: 'Orbitron' }}>
                      {opp.estimated_value > 0 ? formatCurrency(opp.estimated_value) : 'TBD'}
                    </div>
                    <div className="text-[10px] text-muted-foreground mb-3">{opp.currency}</div>
                    {/* Compliance badge */}
                    {(() => {
                      const c = checkPlatformCompliance(opp.platform);
                      return (
                        <div className={cn(
                          'text-[9px] px-1.5 py-0.5 rounded border text-center mb-2 font-semibold',
                          c.automation === 'allowed' ? 'bg-[hsl(145_100%_50%/0.08)] border-[hsl(145_100%_50%/0.2)] text-[hsl(145,100%,55%)]' :
                          c.automation === 'restricted' ? 'bg-[hsl(30_100%_55%/0.08)] border-[hsl(30_100%_55%/0.2)] text-[hsl(30,100%,60%)]' :
                          c.automation === 'prohibited' ? 'bg-[hsl(0_85%_60%/0.08)] border-[hsl(0_85%_60%/0.2)] text-[hsl(0,85%,65%)]' :
                          'bg-[hsl(228_25%_12%)] border-[hsl(var(--border))] text-muted-foreground'
                        )}>
                          {c.automation === 'allowed' ? '✓ Auto OK' : c.automation === 'restricted' ? '⚠ Restricted' : c.automation === 'prohibited' ? '✗ No Auto' : '? Unknown'}
                        </div>
                      );
                    })()}
                    <div className="flex flex-col gap-1.5">
                      {['new', 'matched'].includes(opp.status) && (
                        <button
                          onClick={() => setApplyingOpp(opp)}
                          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 text-black font-semibold hover:opacity-90 transition-all"
                        >
                          <Rocket size={11} /> Apply
                        </button>
                      )}
                      {opp.status === 'new' && !opp.matched_autopilot_id && (
                        <button
                          onClick={() => matchOpportunity(opp.id)}
                          disabled={matchingId === opp.id}
                          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {matchingId === opp.id ? <RefreshCw size={11} className="animate-spin" /> : <Zap size={11} />}
                          {matchingId === opp.id ? 'Matching...' : 'Match'}
                        </button>
                      )}
                      {opp.url && (
                        <a href={opp.url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                          <ExternalLink size={11} /> View
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Application Workflow Modal */}
      {applyingOpp && (
        <ApplicationWorkflow
          opportunity={applyingOpp}
          isOpen={!!applyingOpp}
          onClose={() => setApplyingOpp(null)}
          onSuccess={() => { setApplyingOpp(null); loadOpportunities(); }}
        />
      )}
    </div>
  );
}
