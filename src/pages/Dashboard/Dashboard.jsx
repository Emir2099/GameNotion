import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaskStore, useBugStore, useAssetStore, useAppStore } from '../../store';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ArrowRight, Kanban, Bug, Package, Users, Activity, CheckCircle2, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  RadialBarChart, RadialBar, PieChart, Pie, Cell, Legend
} from 'recharts';
import styles from './Dashboard.module.css';

// ── Animated Counter ──────────────────────────────────────────────────────────
function AnimatedNum({ value, suffix = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    if (isNaN(end)) return;
    const step = Math.max(1, Math.ceil(end / 40));
    const timer = setInterval(() => {
      start = Math.min(start + step, end);
      if (ref.current) ref.current.textContent = start.toLocaleString() + suffix;
      if (start >= end) clearInterval(timer);
    }, 25);
    return () => clearInterval(timer);
  }, [value, suffix]);
  return <span ref={ref}>0{suffix}</span>;
}

// ── Sparkline data ────────────────────────────────────────────────────────────
const sprintHistory = [
  { week: 'W1', done: 8 }, { week: 'W2', done: 14 }, { week: 'W3', done: 11 },
  { week: 'W4', done: 19 }, { week: 'W5', done: 22 }, { week: 'W6', done: 25 },
];

const bugTrend = [
  { day: 'Mon', open: 12 }, { day: 'Tue', open: 10 }, { day: 'Wed', open: 11 },
  { day: 'Thu', open: 9 }, { day: 'Fri', open: 7 }, { day: 'Sat', open: 8 }, { day: 'Sun', open: 8 },
];

const ACTIVITY = [
  { actor: 'C', color: '#7c3aed', name: 'You', action: 'updated GDD — Combat System v2.4', time: '3 min ago', type: 'GDD' },
  { actor: 'M', color: '#2563eb', name: 'Maya', action: 'moved "Lumen GI Optimisation" to In Progress', time: '28 min ago', type: 'TASK' },
  { actor: 'A', color: '#0891b2', name: 'Alex', action: 'updated asset SM_Rock_Desert_Cluster_01 → Integrated', time: '1 hr ago', type: 'ASSET' },
  { actor: 'N', color: '#dc2626', name: 'Nina', action: 'filed bug B-051 — Player ragdoll lock in water', time: '2 hr ago', type: 'BUG' },
  { actor: 'J', color: '#059669', name: 'Jake', action: 'resolved bug B-042 — Collision failure Zone 1', time: '3 hr ago', type: 'BUG' },
  { actor: 'L', color: '#d97706', name: 'Layla', action: 'added lore entry — The AI Silence Event Log', time: 'Yesterday', type: 'WORLD' },
];

const TYPE_COLORS = { GDD: '#7c3aed', TASK: '#2563eb', ASSET: '#0891b2', BUG: '#dc2626', WORLD: '#059669' };

export default function Dashboard() {
  const navigate = useNavigate();
  const projectName = useAppStore(s => s.projectName);
  const projectGenre = useAppStore(s => s.projectGenre);
  const projectEngine = useAppStore(s => s.projectEngine);
  const projectPhase = useAppStore(s => s.projectPhase);

  const tasks = useTaskStore(s => s.tasks);
  const bugs = useBugStore(s => s.bugs);
  const assets = useAssetStore(s => s.assets);

  const bugCounts = React.useMemo(() => {
    return {
      critical: bugs.filter(b => b.severity === 'critical' && b.status !== 'resolved' && b.status !== 'closed').length,
      high: bugs.filter(b => b.severity === 'high' && b.status !== 'resolved' && b.status !== 'closed').length,
      medium: bugs.filter(b => b.severity === 'medium' && b.status !== 'resolved' && b.status !== 'closed').length,
      low: bugs.filter(b => b.severity === 'low' && b.status !== 'resolved' && b.status !== 'closed').length,
      resolved: bugs.filter(b => b.status === 'resolved' || b.status === 'closed').length,
    };
  }, [bugs]);

  const taskStats = {
    total: tasks.length,
    done: tasks.filter(t => t.column === 'done').length,
    inProgress: tasks.filter(t => t.column === 'inprogress').length,
    review: tasks.filter(t => t.column === 'review').length,
    backlog: tasks.filter(t => t.column === 'backlog').length,
  };
  const sprintPct = taskStats.total ? Math.round((taskStats.done / taskStats.total) * 100) : 0;

  const sprintDonutData = [
    { name: 'Done', value: taskStats.done, color: '#059669' },
    { name: 'In Progress', value: taskStats.inProgress, color: '#7c3aed' },
    { name: 'Review', value: taskStats.review, color: '#2563eb' },
    { name: 'Backlog', value: taskStats.backlog, color: '#374151' },
  ];

  return (
    <div className={styles.page}>
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <div className={styles.hero}>
        <img src="/banner.png" alt="Project banner" className={styles.heroBg} />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <div className={styles.heroPill}>
            <Activity size={11} />
            {projectEngine} · {projectPhase} Phase
          </div>
          <h1 className={styles.heroTitle}>{projectName}</h1>
          <p className={styles.heroSub}>{projectGenre}</p>
          <div className={styles.heroActions}>
            <Button variant="gradient" size="lg" onClick={() => navigate('/gdd')}>
              Open GDD
            </Button>
            <Button variant="ghost" size="lg" onClick={() => navigate('/sprints')}>
              Sprint Board <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        {/* ── Stat Cards ─────────────────────────────────────────────────── */}
        <div className={styles.statsGrid}>
          <StatCard
            label="Total Tasks"
            value={taskStats.total}
            icon={<Kanban size={16} />}
            color="#7c3aed"
            sub={`${taskStats.done} done · ${taskStats.inProgress} in progress`}
            onClick={() => navigate('/sprints')}
          />
          <StatCard
            label="Critical Bugs"
            value={bugCounts.critical}
            icon={<AlertCircle size={16} />}
            color="#dc2626"
            sub={`${bugCounts.high} high · ${bugCounts.resolved} resolved total`}
            onClick={() => navigate('/bugs')}
          />
          <StatCard
            label="Sprint Progress"
            value={sprintPct}
            suffix="%"
            icon={<TrendingUp size={16} />}
            color="#059669"
            sub={`${taskStats.done} of ${taskStats.total} tasks complete`}
            onClick={() => navigate('/sprints')}
          />
          <StatCard
            label="Assets Tracked"
            value={assets.length}
            icon={<Package size={16} />}
            color="#0891b2"
            sub={`${assets.filter(a => a.status === 'integrated').length} integrated`}
            onClick={() => navigate('/assets')}
          />
        </div>

        {/* ── Content Grid ───────────────────────────────────────────────── */}
        <div className={styles.grid}>
          {/* Activity Feed */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.cardTitle}>Recent Activity</span>
              <Button variant="ghost" size="sm">View all</Button>
            </div>
            <ul className={styles.activityList}>
              {ACTIVITY.map((a, i) => (
                <li key={i} className={styles.activityItem}>
                  <div className={styles.actorAvatar} style={{ background: a.color }}>{a.actor}</div>
                  <div className={styles.activityContent}>
                    <p><strong>{a.name}</strong> {a.action}</p>
                    <time>{a.time}</time>
                  </div>
                  <span className={styles.activityType} style={{ background: TYPE_COLORS[a.type] + '22', color: TYPE_COLORS[a.type], borderColor: TYPE_COLORS[a.type] + '44' }}>
                    {a.type}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Sprint Donut */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.cardTitle}>Sprint Overview</span>
              <Button variant="ghost" size="sm" onClick={() => navigate('/sprints')}>
                Board <ArrowRight size={12} />
              </Button>
            </div>
            <div className={styles.donutWrap}>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={sprintDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={54}
                    outerRadius={78}
                    dataKey="value"
                    strokeWidth={2}
                    stroke="var(--bg-elevated)"
                  >
                    {sprintDonutData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 8 }}
                    labelStyle={{ color: 'var(--text-primary)' }}
                    itemStyle={{ color: 'var(--text-secondary)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className={styles.donutCenter}>
                <span className={styles.donutPct}>{sprintPct}%</span>
                <span className={styles.donutLabel}>Complete</span>
              </div>
            </div>
            <div className={styles.donutLegend}>
              {sprintDonutData.map((d) => (
                <div key={d.name} className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: d.color }} />
                  <span>{d.name}</span>
                  <span className={styles.legendVal}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sprint History Chart */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.cardTitle}>Sprint Velocity</span>
              <span className={styles.cardSub}>Tasks completed per week</span>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={sprintHistory} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="velGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" tick={{ fill: 'var(--text-disabled)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-disabled)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 8 }}
                  itemStyle={{ color: 'var(--text-secondary)' }}
                  labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="done" stroke="#7c3aed" strokeWidth={2.5} fill="url(#velGrad)" dot={false} activeDot={{ r: 5, fill: '#7c3aed' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bug Trend */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.cardTitle}>Bug Trend (7 days)</span>
              <Button variant="ghost" size="sm" onClick={() => navigate('/bugs')}>
                Tracker <ArrowRight size={12} />
              </Button>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={bugTrend} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="bugGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: 'var(--text-disabled)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-disabled)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 8 }}
                  itemStyle={{ color: 'var(--text-secondary)' }}
                  labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="open" stroke="#dc2626" strokeWidth={2.5} fill="url(#bugGrad)" dot={false} activeDot={{ r: 5, fill: '#dc2626' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, suffix = '', icon, color, sub, onClick }) {
  return (
    <div className={styles.statCard} onClick={onClick} style={{ '--card-color': color }} tabIndex={0} role="button">
      <div className={styles.statHeader}>
        <span className={styles.statLabel}>{label}</span>
        <div className={styles.statIcon} style={{ color }}>{icon}</div>
      </div>
      <div className={styles.statValue}>
        <AnimatedNum value={value} suffix={suffix} />
      </div>
      <div className={styles.statSub}>{sub}</div>
    </div>
  );
}
