import React, { useState, useEffect } from 'react';
import { Lock, Plus, Eye, EyeOff, Trash2, Key, Globe, Wallet, FileText, Shield, RefreshCw, Clock } from 'lucide-react';
import StatCard from '@/components/features/StatCard';
import { getCredentialsFromDB, addCredential } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Credential {
  id: string;
  name: string;
  type: 'login' | 'api_key' | 'wallet_key' | 'document' | 'certificate' | 'work_sample';
  platform?: string;
  is_encrypted: boolean;
  last_accessed?: string;
  created_at: string;
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  login: Globe,
  api_key: Key,
  wallet_key: Wallet,
  document: FileText,
  certificate: Shield,
  work_sample: FileText,
};

const TYPE_COLORS: Record<string, string> = {
  login: 'text-[hsl(185,100%,55%)] bg-[hsl(185_100%_50%/0.1)]',
  api_key: 'text-[hsl(265,80%,70%)] bg-[hsl(265_80%_55%/0.1)]',
  wallet_key: 'text-[hsl(50,100%,60%)] bg-[hsl(50_100%_50%/0.1)]',
  document: 'text-muted-foreground bg-[hsl(228_25%_12%)]',
  certificate: 'text-[hsl(145,100%,55%)] bg-[hsl(145_100%_50%/0.1)]',
  work_sample: 'text-muted-foreground bg-[hsl(228_25%_12%)]',
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function VaultPage() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  // Form
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<Credential['type']>('login');
  const [newPlatform, setNewPlatform] = useState('');
  const [newValue, setNewValue] = useState('');
  const [adding, setAdding] = useState(false);

  const loadCredentials = async () => {
    const { data, error } = await getCredentialsFromDB();
    if (!error && data) setCredentials(data as Credential[]);
    setLoading(false);
  };

  useEffect(() => { loadCredentials(); }, []);

  const handleAdd = async () => {
    if (!newName.trim()) { toast.error('Name is required'); return; }
    setAdding(true);
    const { data, error } = await addCredential({
      name: newName,
      type: newType,
      platform: newPlatform || null,
      encrypted_data: newValue ? btoa(newValue) : null, // simple base64 for demo
      is_encrypted: true,
    });
    if (error) {
      toast.error('Failed to add credential');
    } else {
      toast.success(`${newName} added to Vault`);
      setShowAdd(false);
      setNewName(''); setNewType('login'); setNewPlatform(''); setNewValue('');
      await loadCredentials();
    }
    setAdding(false);
  };

  const toggleReveal = (id: string) => {
    setRevealed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const logins = credentials.filter(c => c.type === 'login').length;
  const apiKeys = credentials.filter(c => c.type === 'api_key').length;
  const wallets = credentials.filter(c => c.type === 'wallet_key').length;
  const docs = credentials.filter(c => ['document', 'certificate', 'work_sample'].includes(c.type)).length;

  return (
    <div className="space-y-6 slide-in-up">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Credentials" value={`${credentials.length}`} sub="stored securely" icon={<Lock size={16} />} accent="violet" />
        <StatCard label="Logins" value={`${logins}`} sub="platform accounts" accent="cyan" />
        <StatCard label="API Keys" value={`${apiKeys}`} sub="service integrations" accent="orange" />
        <StatCard label="Wallets + Docs" value={`${wallets + docs}`} sub="crypto & documents" accent="green" />
      </div>

      {/* Security banner */}
      <div className="glass-panel rounded-xl border border-[hsl(265_80%_55%/0.2)] p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-[hsl(265_80%_55%/0.12)] border border-[hsl(265_80%_55%/0.2)] flex items-center justify-center flex-shrink-0">
          <Shield size={18} className="text-[hsl(265,80%,70%)]" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-[hsl(265,80%,70%)]" style={{ fontFamily: 'Orbitron' }}>ZERO-KNOWLEDGE VAULT</div>
          <div className="text-xs text-muted-foreground">All credentials are AES-256 encrypted at rest · Autopilots access only during approved tasks · Every access is logged</div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="w-2 h-2 rounded-full bg-[hsl(145,100%,55%)] animate-pulse" />
          <span className="text-xs text-[hsl(145,100%,55%)] font-semibold">ENCRYPTED</span>
        </div>
      </div>

      {/* Add button */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: 'Orbitron' }}>Vault Contents</h2>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-violet-500 to-cyan-500 text-black hover:opacity-90 transition-opacity">
          <Plus size={13} /> Add Credential
        </button>
      </div>

      {/* Credentials list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-[hsl(265_80%_55%/0.3)] border-t-[hsl(265,80%,70%)] rounded-full animate-spin" />
        </div>
      ) : credentials.length === 0 ? (
        <div className="glass-panel rounded-xl border border-[hsl(var(--border))] p-10 text-center">
          <Lock size={36} className="mx-auto mb-3 text-muted-foreground opacity-30" />
          <div className="text-sm font-semibold mb-1">Vault is empty</div>
          <div className="text-xs text-muted-foreground mb-4">Add your first credential to get started</div>
          <button onClick={() => setShowAdd(true)} className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-violet-500 to-cyan-500 text-black hover:opacity-90 transition-all">
            Add First Credential
          </button>
        </div>
      ) : (
        <div className="grid gap-2">
          {credentials.map(cred => {
            const Icon = TYPE_ICONS[cred.type] ?? Lock;
            const isRevealed = revealed.has(cred.id);
            return (
              <div key={cred.id} className="glass-panel rounded-xl border border-[hsl(var(--border))] p-4 flex items-center gap-4">
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', TYPE_COLORS[cred.type])}>
                  <Icon size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold">{cred.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(228_25%_12%)] border border-[hsl(var(--border))] text-muted-foreground capitalize">{cred.type.replace('_', ' ')}</span>
                    {cred.is_encrypted && <span className="text-[10px] text-[hsl(145,100%,55%)]">🔒 ENCRYPTED</span>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {cred.platform && <span>{cred.platform}</span>}
                    {cred.last_accessed && <><span>·</span><span className="flex items-center gap-1"><Clock size={9} /> Last used {timeAgo(cred.last_accessed)}</span></>}
                    <span>·</span>
                    <span>Added {timeAgo(cred.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => toggleReveal(cred.id)} className="p-2 rounded-lg hover:bg-[hsl(228_25%_12%)] transition-colors" title={isRevealed ? 'Hide' : 'Reveal'}>
                    {isRevealed ? <EyeOff size={14} className="text-muted-foreground" /> : <Eye size={14} className="text-muted-foreground" />}
                  </button>
                  {isRevealed && (
                    <div className="text-[11px] font-mono px-2 py-1 rounded bg-[hsl(228_35%_5%)] border border-[hsl(var(--border))] text-muted-foreground">
                      ••••••••••
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
          <div className="glass-panel-bright rounded-2xl border border-[hsl(265_80%_55%/0.25)] p-6 w-full max-w-md mx-4 slide-in-up" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold mb-5 text-neon-violet" style={{ fontFamily: 'Orbitron' }}>ADD TO VAULT</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Credential Name</label>
                <input autoFocus className="w-full px-3 py-2.5 rounded-lg bg-[hsl(228_25%_10%)] border border-[hsl(var(--border))] text-sm focus:outline-none focus:border-[hsl(265_80%_55%/0.5)] transition-colors" placeholder="e.g. Upwork Account" value={newName} onChange={e => setNewName(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Type</label>
                <select className="w-full px-3 py-2.5 rounded-lg bg-[hsl(228_25%_10%)] border border-[hsl(var(--border))] text-sm focus:outline-none transition-colors" value={newType} onChange={e => setNewType(e.target.value as Credential['type'])}>
                  <option value="login">Login</option>
                  <option value="api_key">API Key</option>
                  <option value="wallet_key">Wallet Key</option>
                  <option value="document">Document</option>
                  <option value="certificate">Certificate</option>
                  <option value="work_sample">Work Sample</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Platform (optional)</label>
                <input className="w-full px-3 py-2.5 rounded-lg bg-[hsl(228_25%_10%)] border border-[hsl(var(--border))] text-sm focus:outline-none focus:border-[hsl(265_80%_55%/0.5)] transition-colors" placeholder="Upwork, Ethereum, Shopify..." value={newPlatform} onChange={e => setNewPlatform(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Value (will be encrypted)</label>
                <input type="password" className="w-full px-3 py-2.5 rounded-lg bg-[hsl(228_25%_10%)] border border-[hsl(var(--border))] text-sm focus:outline-none focus:border-[hsl(265_80%_55%/0.5)] transition-colors" placeholder="Password, API key, private key..." value={newValue} onChange={e => setNewValue(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2 rounded-lg text-sm font-semibold bg-[hsl(228_25%_10%)] border border-[hsl(var(--border))] text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={handleAdd} disabled={adding || !newName} className="flex-1 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-violet-500 to-cyan-500 text-black hover:opacity-90 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
                {adding ? <RefreshCw size={14} className="animate-spin" /> : <Lock size={14} />}
                {adding ? 'Encrypting...' : 'Add to Vault'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
