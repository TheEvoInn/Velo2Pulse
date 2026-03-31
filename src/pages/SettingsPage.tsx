import React, { useState } from 'react';
import { Settings, User, Globe, Bell, Key, Shield, Save } from 'lucide-react';
import { getStoredAuth, storeAuth } from '@/lib/mockData';
import { toast } from 'sonner';

export default function SettingsPage() {
  const user = getStoredAuth();
  const [profile, setProfile] = useState({ name: user?.name ?? '', email: user?.email ?? '', timezone: 'UTC-5 (EST)' });
  const [notifications, setNotifications] = useState({ earnings: true, opportunities: true, errors: true, weekly: false });
  const [workspace, setWorkspace] = useState({ name: 'VELO Alpha Workspace', maxAutopilots: 10, autoAssign: true, autoApply: false });

  const saveProfile = () => {
    if (user) { storeAuth({ ...user, name: profile.name, email: profile.email }); }
    toast.success('Profile saved');
  };

  return (
    <div className="space-y-6 slide-in-up max-w-3xl">
      {/* Profile */}
      <div className="glass-panel rounded-xl border border-[hsl(var(--border))] p-5">
        <div className="flex items-center gap-2 mb-4">
          <User size={16} className="text-[hsl(var(--cyan))]" />
          <h2 className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: 'Orbitron' }}>Commander Profile</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Display Name</label>
            <input className="w-full px-3 py-2.5 rounded-lg bg-[hsl(228_25%_10%)] border border-[hsl(var(--border))] text-sm focus:outline-none focus:border-[hsl(185_100%_50%/0.5)] transition-colors" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Email Address</label>
            <input type="email" className="w-full px-3 py-2.5 rounded-lg bg-[hsl(228_25%_10%)] border border-[hsl(var(--border))] text-sm focus:outline-none focus:border-[hsl(185_100%_50%/0.5)] transition-colors" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Timezone</label>
            <select className="w-full px-3 py-2.5 rounded-lg bg-[hsl(228_25%_10%)] border border-[hsl(var(--border))] text-sm focus:outline-none focus:border-[hsl(185_100%_50%/0.5)] transition-colors" value={profile.timezone} onChange={e => setProfile(p => ({ ...p, timezone: e.target.value }))}>
              <option>UTC-8 (PST)</option>
              <option>UTC-5 (EST)</option>
              <option>UTC+0 (GMT)</option>
              <option>UTC+1 (CET)</option>
              <option>UTC+8 (CST)</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="px-3 py-2 rounded-lg bg-[hsl(265_80%_55%/0.1)] border border-[hsl(265_80%_55%/0.2)] text-xs text-[hsl(265,80%,70%)] w-full">
              Role: <span className="font-bold">OWNER</span> · Invite Code: <span className="font-mono">{user?.inviteCode ?? '—'}</span>
            </div>
          </div>
        </div>
        <button onClick={saveProfile} className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-cyan-500 to-violet-500 text-black hover:opacity-90 transition-opacity">
          <Save size={14} /> Save Profile
        </button>
      </div>

      {/* Workspace */}
      <div className="glass-panel rounded-xl border border-[hsl(var(--border))] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Globe size={16} className="text-[hsl(265,80%,70%)]" />
          <h2 className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: 'Orbitron' }}>Workspace Settings</h2>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Workspace Name</label>
              <input className="w-full px-3 py-2.5 rounded-lg bg-[hsl(228_25%_10%)] border border-[hsl(var(--border))] text-sm focus:outline-none focus:border-[hsl(185_100%_50%/0.5)] transition-colors" value={workspace.name} onChange={e => setWorkspace(w => ({ ...w, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Max Autopilots</label>
              <input type="number" className="w-full px-3 py-2.5 rounded-lg bg-[hsl(228_25%_10%)] border border-[hsl(var(--border))] text-sm focus:outline-none focus:border-[hsl(185_100%_50%/0.5)] transition-colors" value={workspace.maxAutopilots} onChange={e => setWorkspace(w => ({ ...w, maxAutopilots: Number(e.target.value) }))} />
            </div>
          </div>
          {[
            { label: 'Auto-Assign Opportunities', sub: 'Automatically match new opportunities to available autopilots', val: workspace.autoAssign, key: 'autoAssign' },
            { label: 'Auto-Apply to Matched', sub: 'Automatically apply to opportunities after matching (use with caution)', val: workspace.autoApply, key: 'autoApply' },
          ].map(ctrl => (
            <div key={ctrl.key} className="flex items-center justify-between p-3 rounded-lg bg-[hsl(228_25%_10%)] border border-[hsl(var(--border))]">
              <div>
                <div className="text-sm font-medium">{ctrl.label}</div>
                <div className="text-xs text-muted-foreground">{ctrl.sub}</div>
              </div>
              <button onClick={() => setWorkspace(w => ({ ...w, [ctrl.key]: !w[ctrl.key as keyof typeof w] }))} className={`relative w-10 h-5 rounded-full transition-colors ${ctrl.val ? 'bg-[hsl(185,100%,45%)]' : 'bg-[hsl(228,25%,20%)]'}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${ctrl.val ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-panel rounded-xl border border-[hsl(var(--border))] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell size={16} className="text-[hsl(30,100%,60%)]" />
          <h2 className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: 'Orbitron' }}>Notifications</h2>
        </div>
        <div className="space-y-3">
          {[
            { key: 'earnings', label: 'Earnings Confirmed', sub: 'Notify when profits are credited' },
            { key: 'opportunities', label: 'New Opportunities', sub: 'Alert when high-confidence opportunities are discovered' },
            { key: 'errors', label: 'System Errors', sub: 'Critical alerts for failed tasks or system issues' },
            { key: 'weekly', label: 'Weekly Summary', sub: 'Weekly performance digest every Monday' },
          ].map(n => (
            <div key={n.key} className="flex items-center justify-between p-3 rounded-lg bg-[hsl(228_25%_10%)] border border-[hsl(var(--border))]">
              <div>
                <div className="text-sm font-medium">{n.label}</div>
                <div className="text-xs text-muted-foreground">{n.sub}</div>
              </div>
              <button onClick={() => setNotifications(v => ({ ...v, [n.key]: !v[n.key as keyof typeof v] }))} className={`relative w-10 h-5 rounded-full transition-colors ${notifications[n.key as keyof typeof notifications] ? 'bg-[hsl(185,100%,45%)]' : 'bg-[hsl(228,25%,20%)]'}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${notifications[n.key as keyof typeof notifications] ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* About */}
      <div className="glass-panel rounded-xl border border-[hsl(265_80%_55%/0.15)] p-5">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={16} className="text-[hsl(265,80%,70%)]" />
          <h2 className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: 'Orbitron' }}>About VELO 2.0</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {[
            { label: 'Version', val: '2.0.0' },
            { label: 'Build', val: 'ALPHA-2026' },
            { label: 'Access', val: 'Invite-Only' },
            { label: 'Automation', val: 'Playwright OSS' },
            { label: 'AI Engine', val: 'Open-Weight LLMs' },
            { label: 'Backend', val: 'Self-Hosted' },
          ].map(item => (
            <div key={item.label} className="p-2 rounded-lg bg-[hsl(228_25%_10%)] border border-[hsl(var(--border))]">
              <div className="text-muted-foreground">{item.label}</div>
              <div className="font-semibold text-[hsl(265,80%,70%)]">{item.val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
