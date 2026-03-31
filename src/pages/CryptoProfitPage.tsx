import React, { useState } from 'react';
import { Bitcoin, Zap, CheckCircle, Clock, AlertTriangle, ExternalLink, Wallet, RefreshCw, Shield, Star, TrendingUp, Plus } from 'lucide-react';
import StatCard from '@/components/features/StatCard';
import StatusBadge from '@/components/features/StatusBadge';
import { getCryptoTasks, saveCryptoTasks, getWalletAddresses, formatCurrency, timeAgo } from '@/lib/mockData';
import type { CryptoTask, CryptoTaskType } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const TYPE_COLORS: Record<CryptoTaskType, string> = {
  airdrop: 'bg-[hsl(265_80%_55%/0.12)] text-[hsl(265,80%,70%)] border-[hsl(265_80%_55%/0.3)]',
  testnet: 'bg-[hsl(185_100%_50%/0.12)] text-[hsl(185,100%,55%)] border-[hsl(185_100%_50%/0.3)]',
  free_mint: 'bg-[hsl(50_100%_50%/0.12)] text-[hsl(50,100%,60%)] border-[hsl(50_100%_50%/0.3)]',
  bounty: 'bg-[hsl(145_100%_50%/0.12)] text-[hsl(145,100%,55%)] border-[hsl(145_100%_50%/0.3)]',
  quest: 'bg-[hsl(30_100%_55%/0.12)] text-[hsl(30,100%,60%)] border-[hsl(30_100%_55%/0.3)]',
};

const ELIGIBILITY_MAP: Record<string, { cls: string; label: string }> = {
  eligible: { cls: 'text-[hsl(145,100%,55%)]', label: '✓ ELIGIBLE' },
  ineligible: { cls: 'text-[hsl(0,85%,65%)]', label: '✗ NOT ELIGIBLE' },
  checking: { cls: 'text-[hsl(30,100%,60%)] animate-pulse', label: '⟳ CHECKING...' },
  unknown: { cls: 'text-muted-foreground', label: '? UNKNOWN' },
};

const ALL_TYPES: (CryptoTaskType | 'all')[] = ['all', 'airdrop', 'testnet', 'free_mint', 'bounty', 'quest'];

const NETWORK_ICONS: Record<string, string> = {
  'Arbitrum One': '🔵',
  'zkSync Era': '⚡',
  'Starknet': '⭐',
  'Polygon': '🟣',
  'Optimism': '🔴',
  'Multi-chain': '🔗',
  'Ethereum': '⬡',
};

export default function CryptoProfitPage() {
  const [tasks, setTasks] = useState<CryptoTask[]>(getCryptoTasks);
  const [filterType, setFilterType] = useState<CryptoTaskType | 'all'>('all');
  const wallets = getWalletAddresses();
  const [checkingAll, setCheckingAll] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = filterType === 'all' ? tasks : tasks.filter(t => t.type === filterType);
  const totalEst = tasks.reduce((a, t) => a + t.estimatedValue, 0);
  const eligible = tasks.filter(t => t.eligibility === 'eligible').length;
  const active = tasks.filter(t => t.status === 'active' || t.status === 'in_progress').length;

  const checkEligibility = (id: string) => {
    const updated = tasks.map(t => t.id === id ? { ...t, eligibility: 'checking' as const } : t);
    setTasks(updated);
    setTimeout(() => {
      const done = tasks.map(t => t.id === id ? { ...t, eligibility: 'eligible' as const } : t);
      setTasks(done);
      saveCryptoTasks(done);
      toast.success('Eligibility confirmed');
    }, 2000);
  };

  const startTask = (id: string) => {
    const updated = tasks.map(t => t.id === id ? { ...t, status: 'in_progress' as const } : t);
    setTasks(updated);
    saveCryptoTasks(updated);
    toast.success('CRYPTO-X autopilot assigned. Task initiated.');
  };

  const claimReward = (id: string) => {
    const updated = tasks.map(t => t.id === id ? { ...t, status: 'claimed' as const, claimedAt: new Date().toISOString() } : t);
    setTasks(updated);
    saveCryptoTasks(updated);
    toast.success('Reward claimed and added to wallet!');
  };

  const checkAll = () => {
    setCheckingAll(true);
    const updated = tasks.map(t => ({ ...t, eligibility: 'checking' as const }));
    setTasks(updated);
    setTimeout(() => {
      const done = tasks.map(t => ({ ...t, eligibility: t.walletRequired && wallets.length > 0 ? 'eligible' as const : 'ineligible' as const }));
      setTasks(done);
      saveCryptoTasks(done);
      setCheckingAll(false);
      toast.success(`Eligibility check complete. ${done.filter(t => t.eligibility === 'eligible').length} opportunities eligible.`);
    }, 3500);
  };

  return (
    <div className="space-y-6 slide-in-up">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Opportunities" value={`${tasks.length}`} sub="crypto tasks available" icon={<Bitcoin size={16} />} accent="violet" />
        <StatCard label="Eligible" value={`${eligible}`} sub="wallet-qualified tasks" accent="green" />
        <StatCard label="Active" value={`${active}`} sub="in progress" accent="orange" />
        <StatCard label="Est. Value" value={`~${formatCurrency(totalEst)}`} sub="total potential earnings" accent="cyan" />
      </div>

      {/* Wallets strip */}
      <div className="glass-panel rounded-xl border border-[hsl(265_80%_55%/0.2)] p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wallet size={15} className="text-[hsl(265,80%,70%)]" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: 'Orbitron' }}>Linked Wallets</span>
          </div>
          <button onClick={checkAll} disabled={checkingAll} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-violet-500 to-cyan-500 text-black hover:opacity-90 disabled:opacity-50 transition-all">
            <Shield size={12} className={checkingAll ? 'animate-spin' : ''} />
            {checkingAll ? 'Checking...' : 'Check All Eligibility'}
          </button>
        </div>
        <div className="flex gap-3 flex-wrap">
          {wallets.map(w => (
            <div key={w.id} className={cn('flex items-center gap-2 px-3 py-2 rounded-lg border text-xs', w.isDefault ? 'border-[hsl(185_100%_50%/0.3)] bg-[hsl(185_100%_50%/0.06)]' : 'border-[hsl(var(--border))] bg-[hsl(228_25%_10%)]')}>
              <div className="w-1.5 h-1.5 rounded-full bg-[hsl(145,100%,55%)]" />
              <span className="font-semibold">{w.label}</span>
              <span className="text-muted-foreground font-mono">{w.address}</span>
              {w.balance && <span className="text-[hsl(145,100%,55%)] font-bold">{w.balance}</span>}
              {w.isDefault && <span className="text-[10px] text-[hsl(185,100%,55%)]">DEFAULT</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {ALL_TYPES.map(t => (
          <button key={t} onClick={() => setFilterType(t)} className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors uppercase tracking-wider',
            filterType === t
              ? 'bg-[hsl(265_80%_55%/0.15)] text-[hsl(265,80%,70%)] border-[hsl(265_80%_55%/0.3)]'
              : 'bg-[hsl(228_25%_10%)] text-muted-foreground border-[hsl(var(--border))] hover:text-foreground'
          )}>{t}</button>
        ))}
      </div>

      {/* Task cards */}
      <div className="grid gap-4">
        {filtered.map(task => {
          const elig = ELIGIBILITY_MAP[task.eligibility];
          const isExpanded = expanded === task.id;
          return (
            <div key={task.id} className={cn(
              'glass-panel rounded-xl border transition-all',
              task.status === 'claimed' ? 'border-[hsl(145_100%_50%/0.25)] opacity-60' : 'border-[hsl(var(--border))] hover:border-[hsl(265_80%_55%/0.2)]'
            )}>
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="text-2xl flex-shrink-0 mt-0.5">{NETWORK_ICONS[task.network] ?? '🔷'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-sm">{task.title}</h3>
                        <StatusBadge status={task.status} />
                        <span className={cn('text-[10px] px-2 py-0.5 rounded border', TYPE_COLORS[task.type])}>{task.type.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-3 mb-2 text-xs text-muted-foreground flex-wrap">
                        <span>{task.protocol}</span>
                        <span>·</span>
                        <span>{task.network}</span>
                        {task.gasRequired && <><span>·</span><span>Gas: {task.gasRequired}</span></>}
                        {task.deadline && <><span>·</span><span>Expires: {timeAgo(task.deadline)}</span></>}
                      </div>
                      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{task.description}</p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {task.requirements.map(r => (
                          <span key={r} className="text-[10px] px-2 py-0.5 rounded bg-[hsl(228_25%_12%)] border border-[hsl(var(--border))] text-muted-foreground">{r}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={task.confidence} />
                        <span className={cn('text-[11px] font-bold', elig.cls)}>{elig.label}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <div className="text-2xl font-black text-[hsl(265,80%,70%)]" style={{ fontFamily: 'Orbitron' }}>
                      ~{task.estimatedValue}
                      <span className="text-sm ml-1">{task.currency}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mb-3">est. value</div>
                    <div className="flex flex-col gap-2">
                      {task.status === 'upcoming' || task.status === 'active' ? (
                        <>
                          {task.eligibility === 'unknown' || task.eligibility === 'ineligible' ? (
                            <button onClick={() => checkEligibility(task.id)} className="text-xs px-3 py-1.5 rounded border border-[hsl(185_100%_50%/0.3)] bg-[hsl(185_100%_50%/0.08)] text-[hsl(185,100%,55%)] hover:bg-[hsl(185_100%_50%/0.15)] transition-colors">
                              Check Eligibility
                            </button>
                          ) : task.eligibility === 'eligible' ? (
                            <button onClick={() => startTask(task.id)} className="text-xs px-3 py-1.5 rounded bg-gradient-to-r from-violet-500 to-cyan-500 text-black font-semibold hover:opacity-90 transition-opacity flex items-center gap-1 justify-center">
                              <Zap size={12} /> Start Task
                            </button>
                          ) : null}
                        </>
                      ) : task.status === 'in_progress' ? (
                        <button onClick={() => claimReward(task.id)} className="text-xs px-3 py-1.5 rounded bg-gradient-to-r from-cyan-500 to-violet-500 text-black font-semibold hover:opacity-90 transition-opacity flex items-center gap-1">
                          <CheckCircle size={12} /> Claim Reward
                        </button>
                      ) : task.status === 'claimed' ? (
                        <span className="text-xs text-[hsl(145,100%,55%)] font-semibold">✓ Claimed</span>
                      ) : null}
                      <button
                        onClick={() => setExpanded(e => e === task.id ? null : task.id)}
                        className="text-xs px-3 py-1.5 rounded border border-[hsl(var(--border))] bg-[hsl(228_25%_10%)] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {isExpanded ? 'Hide Steps' : 'View Steps'}
                      </button>
                      <a href={task.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <ExternalLink size={11} /> Protocol
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Steps drawer */}
              {isExpanded && (
                <div className="border-t border-[hsl(var(--border))] px-5 py-4 bg-[hsl(228_35%_5%/0.5)]">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3" style={{ fontFamily: 'Orbitron' }}>Autopilot Workflow Steps</div>
                  <div className="space-y-2">
                    {task.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className={cn(
                          'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5',
                          task.status === 'claimed' ? 'bg-[hsl(145_100%_50%/0.2)] text-[hsl(145,100%,55%)]' :
                          task.status === 'in_progress' && i < 2 ? 'bg-[hsl(185_100%_50%/0.2)] text-[hsl(185,100%,55%)]' :
                          'bg-[hsl(228_25%_15%)] text-muted-foreground'
                        )}>
                          {task.status === 'claimed' ? '✓' : i + 1}
                        </div>
                        <span className={cn('text-xs leading-relaxed', task.status === 'claimed' ? 'text-muted-foreground line-through' : 'text-foreground')}>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
