import React, { useState } from 'react';
import { TrendingUp, BarChart3, DollarSign, Target, Bitcoin, ShoppingBag } from 'lucide-react';
import StatCard from '@/components/features/StatCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { formatCurrency } from '@/lib/mockData';

const EARNINGS_DATA = [
  { date: 'Jan 1', earnings: 120, crypto: 20, dropship: 0, tasks: 8 },
  { date: 'Jan 8', earnings: 285, crypto: 65, dropship: 30, tasks: 14 },
  { date: 'Jan 15', earnings: 190, crypto: 45, dropship: 50, tasks: 11 },
  { date: 'Jan 22', earnings: 420, crypto: 120, dropship: 80, tasks: 19 },
  { date: 'Jan 29', earnings: 380, crypto: 90, dropship: 110, tasks: 16 },
  { date: 'Feb 5', earnings: 550, crypto: 200, dropship: 140, tasks: 23 },
  { date: 'Feb 12', earnings: 480, crypto: 150, dropship: 160, tasks: 21 },
  { date: 'Feb 19', earnings: 620, crypto: 220, dropship: 190, tasks: 27 },
  { date: 'Feb 26', earnings: 710, crypto: 280, dropship: 220, tasks: 31 },
  { date: 'Mar 5', earnings: 890, crypto: 350, dropship: 280, tasks: 38 },
  { date: 'Mar 12', earnings: 760, crypto: 290, dropship: 240, tasks: 34 },
  { date: 'Mar 19', earnings: 1050, crypto: 400, dropship: 310, tasks: 45 },
];

const CATEGORY_DATA = [
  { name: 'Freelance', value: 1247, fill: 'hsl(185,100%,50%)' },
  { name: 'Crypto', value: 892, fill: 'hsl(265,80%,60%)' },
  { name: 'Gig Tasks', value: 456, fill: 'hsl(30,100%,55%)' },
  { name: 'Dropshipping', value: 744, fill: 'hsl(50,100%,50%)' },
  { name: 'Bounties', value: 180, fill: 'hsl(145,100%,50%)' },
];

const PLATFORM_DATA = [
  { platform: 'Upwork', earnings: 780 },
  { platform: 'Fiverr', earnings: 467 },
  { platform: 'Arbitrum', earnings: 450 },
  { platform: 'Shopify', earnings: 380 },
  { platform: 'ClickWorker', earnings: 290 },
  { platform: 'LayerZero', earnings: 120 },
];

const AUTOPILOT_DATA = [
  { name: 'ARIA-7', earned: 847, tasks: 23 },
  { name: 'CRYPTO-X', earned: 892, tasks: 21 },
  { name: 'MERCH-BOT', earned: 744, tasks: 17 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel-bright rounded-lg border border-[hsl(185_100%_50%/0.2)] px-3 py-2 text-xs">
        <div className="text-muted-foreground mb-1">{label}</div>
        {payload.map((p: any, i: number) => (
          <div key={i} className="font-semibold" style={{ color: p.color }}>
            {p.name}: {typeof p.value === 'number' && (p.name === 'earnings' || p.name === 'earned' || p.name === 'crypto' || p.name === 'dropship') ? formatCurrency(p.value) : p.value}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');

  return (
    <div className="space-y-6 slide-in-up">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={formatCurrency(3339.55)} sub="+34% vs last month" icon={<DollarSign size={16} />} accent="cyan" />
        <StatCard label="Avg / Task" value={formatCurrency(22.8)} sub="earnings per task" accent="green" />
        <StatCard label="Tasks Completed" value="127" sub="fully automated" accent="violet" />
        <StatCard label="Success Rate" value="94%" sub="tasks completed OK" accent="orange" />
      </div>

      {/* Module revenue */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-panel rounded-xl border border-[hsl(185_100%_50%/0.15)] p-4">
          <div className="flex items-center gap-2 mb-2"><TrendingUp size={14} className="text-[hsl(185,100%,55%)]" /><span className="text-xs text-muted-foreground">Freelance + Gig</span></div>
          <div className="text-xl font-bold text-[hsl(185,100%,55%)]" style={{ fontFamily: 'Orbitron' }}>{formatCurrency(1703)}</div>
          <div className="text-[10px] text-muted-foreground mt-1">51% of total</div>
        </div>
        <div className="glass-panel rounded-xl border border-[hsl(265_80%_55%/0.15)] p-4">
          <div className="flex items-center gap-2 mb-2"><Bitcoin size={14} className="text-[hsl(265,80%,70%)]" /><span className="text-xs text-muted-foreground">Crypto Module</span></div>
          <div className="text-xl font-bold text-[hsl(265,80%,70%)]" style={{ fontFamily: 'Orbitron' }}>{formatCurrency(892)}</div>
          <div className="text-[10px] text-muted-foreground mt-1">27% of total</div>
        </div>
        <div className="glass-panel rounded-xl border border-[hsl(50_100%_50%/0.15)] p-4">
          <div className="flex items-center gap-2 mb-2"><ShoppingBag size={14} className="text-[hsl(50,100%,60%)]" /><span className="text-xs text-muted-foreground">Dropshipping</span></div>
          <div className="text-xl font-bold text-[hsl(50,100%,60%)]" style={{ fontFamily: 'Orbitron' }}>{formatCurrency(744)}</div>
          <div className="text-[10px] text-muted-foreground mt-1">22% of total</div>
        </div>
      </div>

      {/* Time range selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Time Range:</span>
        {(['week', 'month', 'all'] as const).map(r => (
          <button key={r} onClick={() => setTimeRange(r)} className={`px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${timeRange === r ? 'bg-[hsl(185_100%_50%/0.15)] text-[hsl(185,100%,55%)] border border-[hsl(185_100%_50%/0.3)]' : 'text-muted-foreground hover:text-foreground'}`}>{r}</button>
        ))}
      </div>

      {/* Earnings + Module stacked chart */}
      <div className="glass-panel rounded-xl border border-[hsl(var(--border))] p-5">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp size={16} className="text-[hsl(var(--cyan))]" />
          <h2 className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: 'Orbitron' }}>Earnings by Module Over Time</h2>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={EARNINGS_DATA} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(185,100%,50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(185,100%,50%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="cryptoGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(265,80%,55%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(265,80%,55%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="dropGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(50,100%,50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(50,100%,50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(228,25%,14%)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(215,25%,55%)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(215,25%,55%)' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="earnings" name="earnings" stroke="hsl(185,100%,50%)" strokeWidth={2} fill="url(#earnGrad)" />
            <Area type="monotone" dataKey="crypto" name="crypto" stroke="hsl(265,80%,55%)" strokeWidth={1.5} fill="url(#cryptoGrad)" />
            <Area type="monotone" dataKey="dropship" name="dropship" stroke="hsl(50,100%,50%)" strokeWidth={1.5} fill="url(#dropGrad)" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex gap-4 justify-center mt-2">
          {[['Total', 'hsl(185,100%,50%)'], ['Crypto', 'hsl(265,80%,55%)'], ['Dropship', 'hsl(50,100%,50%)']].map(([label, color]) => (
            <div key={label} className="flex items-center gap-1.5 text-xs">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform breakdown */}
        <div className="glass-panel rounded-xl border border-[hsl(var(--border))] p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-[hsl(265,80%,70%)]" />
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: 'Orbitron' }}>By Platform</h2>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={PLATFORM_DATA} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(228,25%,14%)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 9, fill: 'hsl(215,25%,55%)' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <YAxis type="category" dataKey="platform" tick={{ fontSize: 9, fill: 'hsl(215,25%,55%)' }} axisLine={false} tickLine={false} width={60} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="earnings" name="earnings" fill="hsl(265,80%,55%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category donut */}
        <div className="glass-panel rounded-xl border border-[hsl(var(--border))] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target size={16} className="text-[hsl(145,100%,55%)]" />
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: 'Orbitron' }}>By Category</h2>
          </div>
          <div className="flex items-center gap-3">
            <ResponsiveContainer width="55%" height={160}>
              <PieChart>
                <Pie data={CATEGORY_DATA} cx="50%" cy="50%" innerRadius={38} outerRadius={65} paddingAngle={3} dataKey="value">
                  {CATEGORY_DATA.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {CATEGORY_DATA.map(cat => (
                <div key={cat.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.fill }} />
                  <span className="text-[11px] text-muted-foreground flex-1">{cat.name}</span>
                  <span className="text-[11px] font-semibold">{formatCurrency(cat.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Autopilot performance */}
        <div className="glass-panel rounded-xl border border-[hsl(var(--border))] p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-[hsl(185,100%,55%)]" />
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: 'Orbitron' }}>Autopilots</h2>
          </div>
          <div className="space-y-4">
            {AUTOPILOT_DATA.map(ap => (
              <div key={ap.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold">{ap.name}</span>
                  <span className="text-sm font-bold text-[hsl(145,100%,55%)]">{formatCurrency(ap.earned)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-[hsl(228_25%_15%)] overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500" style={{ width: `${(ap.earned / 1000) * 100}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{ap.tasks} tasks</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
