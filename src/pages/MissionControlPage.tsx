import React, { useState, useEffect } from 'react';
import { Terminal, Play, Pause, StopCircle, RefreshCw, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import StatusBadge from '@/components/features/StatusBadge';
import StatCard from '@/components/features/StatCard';
import { getTasksFromDB, updateTask } from '@/lib/api';
import { getTasks } from '@/lib/mockData';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface TaskLog { timestamp: string; level: string; message: string; }
interface Task {
  id: string;
  name: string;
  type: string;
  status: string;
  priority: number;
  progress: number;
  logs: TaskLog[];
  retries: number;
  created_at?: string;
}

export default function MissionControlPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [emergencyStop, setEmergencyStop] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data, error } = await getTasksFromDB();
    if (!error && data?.length) setTasks(data as Task[]);
    else setTasks(getTasks() as unknown as Task[]);
    setLoading(false);
  };

  useEffect(() => { load(); const iv = setInterval(load, 15000); return () => clearInterval(iv); }, []);

  const running = tasks.filter(t => t.status === 'running').length;
  const queued = tasks.filter(t => t.status === 'queued').length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const failed = tasks.filter(t => t.status === 'failed').length;

  const pauseTask = async (id: string) => {
    await updateTask(id, { status: 'paused' });
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'paused' } : t));
    toast.info('Task paused');
  };

  const resumeTask = async (id: string) => {
    await updateTask(id, { status: 'running' });
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'running' } : t));
    toast.success('Task resumed');
  };

  const retryTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    await updateTask(id, { status: 'running', retries: (task.retries || 0) + 1, progress: 0 });
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'running', retries: t.retries + 1, progress: 0 } : t));
    toast.info('Task retrying...');
  };

  const handleEmergencyStop = async () => {
    setEmergencyStop(true);
    const activeIds = tasks.filter(t => ['running', 'queued'].includes(t.status)).map(t => t.id);
    await Promise.all(activeIds.map(id => updateTask(id, { status: 'paused' })));
    setTasks(prev => prev.map(t => ['running', 'queued'].includes(t.status) ? { ...t, status: 'paused' } : t));
    toast.error('EMERGENCY STOP — All active tasks paused');
  };

  return (
    <div className="space-y-6 slide-in-up">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Running" value={`${running}`} sub="tasks executing" accent="orange" />
        <StatCard label="Queued" value={`${queued}`} sub="waiting" accent="violet" />
        <StatCard label="Completed" value={`${completed}`} sub="done" accent="green" />
        <StatCard label="Failed" value={`${failed}`} sub="need attention" accent="red" />
      </div>

      <div className={cn('rounded-xl border p-4 flex items-center justify-between', emergencyStop ? 'bg-[hsl(0_85%_60%/0.1)] border-[hsl(0_85%_60%/0.4)]' : 'glass-panel border-[hsl(var(--border))]')}>
        <div className="flex items-center gap-3">
          <AlertTriangle size={18} className={emergencyStop ? 'text-[hsl(0,85%,65%)]' : 'text-muted-foreground'} />
          <div>
            <div className={cn('text-sm font-bold', emergencyStop ? 'text-[hsl(0,85%,65%)]' : 'text-foreground')} style={{ fontFamily: 'Orbitron' }}>
              {emergencyStop ? 'EMERGENCY STOP ACTIVE' : 'SAFETY CONTROLS'}
            </div>
            <div className="text-xs text-muted-foreground">{emergencyStop ? 'All tasks paused — manual review required' : 'All systems nominal'}</div>
          </div>
        </div>
        {emergencyStop ? (
          <button onClick={() => setEmergencyStop(false)} className="px-4 py-2 rounded-lg text-sm font-semibold bg-[hsl(145_100%_50%/0.15)] border border-[hsl(145_100%_50%/0.3)] text-[hsl(145,100%,55%)]">
            Resume Systems
          </button>
        ) : (
          <button onClick={handleEmergencyStop} className="px-4 py-2 rounded-lg text-sm font-semibold bg-[hsl(0_85%_60%/0.1)] border border-[hsl(0_85%_60%/0.3)] text-[hsl(0,85%,65%)] hover:bg-[hsl(0_85%_60%/0.2)] flex items-center gap-2">
            <StopCircle size={14} /> Emergency Stop
          </button>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: 'Orbitron' }}>Task Queue</h2>
          <button onClick={load} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-[hsl(185_100%_50%/0.3)] border-t-[hsl(185,100%,55%)] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map(task => (
              <div key={task.id} className="glass-panel rounded-xl border border-[hsl(var(--border))] overflow-hidden">
                <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-[hsl(228_25%_10%/0.5)] transition-colors" onClick={() => setExpanded(e => e === task.id ? null : task.id)}>
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[hsl(228_25%_12%)] border border-[hsl(var(--border))] flex items-center justify-center text-xs font-bold text-muted-foreground">
                    {task.priority}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold">{task.name}</span>
                      <StatusBadge status={task.status} />
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[hsl(228_25%_12%)] text-muted-foreground border border-[hsl(var(--border))]">{task.type}</span>
                    </div>
                    {(task.status === 'running' || task.progress > 0) && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 rounded-full bg-[hsl(228_25%_15%)] overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all" style={{ width: `${task.progress}%` }} />
                        </div>
                        <span className="text-[10px] text-muted-foreground">{task.progress}%</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {task.status === 'running' && <button onClick={e => { e.stopPropagation(); pauseTask(task.id); }} className="p-1.5 rounded hover:bg-[hsl(228_25%_15%)]"><Pause size={13} className="text-muted-foreground" /></button>}
                    {task.status === 'paused' && <button onClick={e => { e.stopPropagation(); resumeTask(task.id); }} className="p-1.5 rounded hover:bg-[hsl(228_25%_15%)]"><Play size={13} className="text-muted-foreground" /></button>}
                    {task.status === 'failed' && <button onClick={e => { e.stopPropagation(); retryTask(task.id); }} className="p-1.5 rounded hover:bg-[hsl(228_25%_15%)]"><RefreshCw size={13} className="text-muted-foreground" /></button>}
                    {expanded === task.id ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                  </div>
                </div>
                {expanded === task.id && (task.logs || []).length > 0 && (
                  <div className="border-t border-[hsl(var(--border))] bg-[hsl(228_35%_5%)] p-4 font-mono text-[11px] space-y-1 max-h-48 overflow-y-auto">
                    {(task.logs as TaskLog[]).map((log, i) => (
                      <div key={i} className={cn('flex gap-2', log.level === 'success' ? 'text-[hsl(145,100%,55%)]' : log.level === 'error' ? 'text-[hsl(0,85%,65%)]' : log.level === 'warn' ? 'text-[hsl(30,100%,60%)]' : 'text-muted-foreground')}>
                        <span className="opacity-50 flex-shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                        <span>{log.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="glass-panel rounded-xl border border-[hsl(var(--border))] p-10 text-center">
                <Terminal size={32} className="mx-auto mb-3 text-muted-foreground opacity-30" />
                <div className="text-sm text-muted-foreground">No tasks yet. Tasks will appear here as Autopilots work.</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
