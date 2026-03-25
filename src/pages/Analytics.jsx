import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  BarChart2, TrendingUp, Target, Clock, Zap,
  Brain, Star, AlertTriangle, ChevronUp, ChevronDown,
  Activity, Award, Layers, ArrowUpRight, ArrowDownRight,
  Calendar, RefreshCw, Cpu, BrainCircuit,
  Sparkles, Minus, Circle
} from 'lucide-react';
import { getAnalytics, getPerformanceTrends, getSkillAnalysis } from '../services/interviewService';

/* ─────────────────────────────────────────────
   ANIMATION VARIANTS (matching app style)
───────────────────────────────────────────── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
};

const floatingAnimation = {
  animate: { y: [0, -10, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }
};

/* ─────────────────────────────────────────────
   MICRO COMPONENTS
───────────────────────────────────────────── */

function CountUp({ value, suffix = '', decimals = 0 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const end = parseFloat(value) || 0;
    if (end === 0) return;
    let start = 0;
    const duration = 1000;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(start);
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display.toFixed(decimals)}{suffix}</>;
}

function ScorePill({ score }) {
  const num = parseFloat(score) || 0;
  const config = num >= 80
    ? { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Excellent' }
    : num >= 60
    ? { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'Good' }
    : { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Needs Work' };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      <Circle size={5} className="fill-current" />
      {config.label}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, suffix = '', sub, trend, color, delay = 0 }) {
  const isUp = trend > 0;
  const colorMap = {
    cyan:    { bg: 'bg-cyan-100',    icon: 'text-cyan-600',    value: 'text-cyan-700',    glow: 'from-cyan-100/40'    },
    blue:    { bg: 'bg-blue-100',    icon: 'text-blue-600',    value: 'text-blue-700',    glow: 'from-blue-100/40'    },
    emerald: { bg: 'bg-emerald-100', icon: 'text-emerald-600', value: 'text-emerald-700', glow: 'from-emerald-100/40' },
    violet:  { bg: 'bg-violet-100',  icon: 'text-violet-600',  value: 'text-violet-700',  glow: 'from-violet-100/40'  },
  };
  const c = colorMap[color] || colorMap.cyan;
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-cyan-200/40 shadow-xs relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${c.glow} to-transparent rounded-full -translate-y-8 translate-x-8`} />
      <div className="relative z-10">
        <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center mb-4`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
        <p className={`text-3xl font-bold ${c.value} tabular-nums`}>
          <CountUp value={value} suffix={suffix} />
        </p>
        {(trend != null || sub) && (
          <div className="flex items-center gap-2 mt-2">
            {trend != null && (
              <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${isUp ? 'text-emerald-600' : 'text-rose-500'}`}>
                {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {Math.abs(trend)}%
              </span>
            )}
            {sub && <span className="text-slate-400 text-xs">{sub}</span>}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function SkillBar({ name, score, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const pct = Math.min(100, Math.max(0, parseFloat(score) || 0));
  const colorClass = pct >= 80 ? 'from-emerald-400 to-teal-400' : pct >= 60 ? 'from-cyan-400 to-blue-400' : pct >= 40 ? 'from-amber-400 to-orange-400' : 'from-rose-400 to-red-400';
  const textClass  = pct >= 80 ? 'text-emerald-700' : pct >= 60 ? 'text-cyan-700' : pct >= 40 ? 'text-amber-700' : 'text-rose-600';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -12 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: index * 0.07, duration: 0.45 }}
      className="mb-4"
    >
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-slate-700 text-sm font-medium">{name}</span>
        <span className={`text-sm font-bold ${textClass}`}>{pct.toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : {}}
          transition={{ delay: index * 0.07 + 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={`h-full rounded-full bg-gradient-to-r ${colorClass}`}
        />
      </div>
    </motion.div>
  );
}

function ActivityRow({ item, index }) {
  const score = parseFloat(item.score) || 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-slate-50/80 transition-colors border border-transparent hover:border-slate-100"
    >
      <div className="w-9 h-9 bg-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0">
        <Activity className="w-4 h-4 text-cyan-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-800 text-sm font-semibold truncate">{item.role || 'Interview Session'}</p>
        <p className="text-slate-400 text-xs mt-0.5">
          {item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
          {item.duration ? ` · ${item.duration} min` : ''}
        </p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <ScorePill score={score} />
        <span className="text-slate-800 text-sm font-bold w-10 text-right">{score}%</span>
      </div>
    </motion.div>
  );
}

function EmptyState({ icon: Icon = Activity, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
      <div className="w-16 h-16 bg-cyan-50 rounded-2xl flex items-center justify-center border border-cyan-100">
        <Icon className="w-7 h-7 text-cyan-300" />
      </div>
      <p className="text-slate-500 text-sm max-w-xs leading-relaxed">{message}</p>
    </div>
  );
}

function SectionCard({ children, className = '' }) {
  return (
    <motion.div
      variants={itemVariants}
      className={`bg-white/70 backdrop-blur-sm rounded-2xl border border-cyan-200/40 shadow-xs overflow-hidden relative ${className}`}
    >
      {children}
    </motion.div>
  );
}

function SectionHeader({ icon: Icon, iconBg = 'bg-cyan-100', iconColor = 'text-cyan-600', title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <div>
          <h3 className="text-slate-900 font-semibold text-base">{title}</h3>
          {subtitle && <p className="text-slate-400 text-xs mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

/* ─────────────────────────────────────────────
   TAB SECTIONS
───────────────────────────────────────────── */

function OverviewSection({ data }) {
  const ov = data?.overview;
  const activity = data?.recentActivity || [];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BarChart2} label="Total Sessions" value={ov?.totalSessions ?? 0}           sub="all time"    trend={ov?.sessionTrend ?? null} color="cyan"    delay={0}    />
        <StatCard icon={Target}    label="Avg Score"       value={ov?.averageScore ?? 0} suffix="%" sub="overall"    trend={ov?.scoreTrend ?? null}   color="blue"    delay={0.08} />
        <StatCard icon={Clock}     label="Practice Time"   value={ov?.totalPracticeTime ?? 0} suffix=" min" sub="invested" color="violet"  delay={0.16} />
        <StatCard icon={Zap}       label="Current Streak"  value={ov?.currentStreak ?? 0} suffix=" days" sub="keep going!" color="emerald" delay={0.24} />
      </div>

      {/* Recent Activity */}
      <SectionCard>
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-100/20 rounded-full -translate-y-16 translate-x-16" />
        <div className="p-6 relative z-10">
          <SectionHeader
            icon={Activity}
            title="Recent Activity"
            subtitle="Your latest interview sessions"
            action={activity.length > 0 && (
              <span className="text-xs text-slate-400 font-medium">{activity.length} sessions</span>
            )}
          />
          {activity.length > 0 ? (
            <>
              <div className="flex items-center gap-4 px-3.5 pb-2 mb-1 border-b border-slate-100">
                <div className="w-9 flex-shrink-0" />
                <span className="flex-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">Role & Date</span>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</span>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide w-10 text-right">Score</span>
              </div>
              <div className="space-y-0.5">
                {activity.map((item, i) => <ActivityRow key={i} item={item} index={i} />)}
              </div>
            </>
          ) : (
            <EmptyState icon={Calendar} message="No recent activity yet. Start an interview session to see your history here." />
          )}
        </div>
      </SectionCard>
    </motion.div>
  );
}

function TrendsSection({ data }) {
  const weekly = data?.weeklyProgress || [];
  const trends = data?.performanceTrends || {};
  const trendEntries = Object.entries(trends);

  const dirMap = {
    improving: { Icon: ChevronUp,   bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' },
    declining:  { Icon: ChevronDown, bg: 'bg-rose-50 border-rose-200',       text: 'text-rose-600',    badge: 'bg-rose-100 text-rose-600'       },
    stable:     { Icon: Minus,       bg: 'bg-amber-50 border-amber-200',     text: 'text-amber-700',   badge: 'bg-amber-100 text-amber-700'     },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Bar chart */}
      <SectionCard>
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/20 rounded-full -translate-y-16 translate-x-16" />
        <div className="p-6 relative z-10">
          <SectionHeader
            icon={TrendingUp}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            title="Performance Over Time"
            subtitle="Score progression across sessions"
          />
          {weekly.length > 0 ? (
            <div className="flex items-end gap-1.5 h-44 pt-4">
              {weekly.map((item, i) => {
                const val = typeof item === 'object' ? item.score ?? item.value ?? 0 : item;
                const pct = Math.min(100, Math.max(2, val));
                const colorClass = pct >= 80 ? 'from-emerald-400 to-teal-400' : pct >= 60 ? 'from-cyan-400 to-blue-500' : 'from-amber-400 to-orange-400';
                const label = typeof item === 'object' && item.label ? item.label : `S${i + 1}`;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group/bar">
                    <motion.div
                      title={`Score: ${val}`}
                      initial={{ height: 0 }}
                      animate={{ height: `${pct}%` }}
                      transition={{ delay: i * 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      className={`w-full rounded-t-lg bg-gradient-to-t ${colorClass} cursor-pointer group-hover/bar:opacity-80 transition-opacity min-w-[12px]`}
                    />
                    <span className="text-slate-400 text-xs hidden sm:block">{label}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState icon={TrendingUp} message="Complete more sessions to visualize your score progression." />
          )}
        </div>
      </SectionCard>

      {/* Trend insight cards */}
      <SectionCard>
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-100/20 rounded-full -translate-y-16 translate-x-16" />
        <div className="p-6 relative z-10">
          <SectionHeader
            icon={Brain}
            iconBg="bg-violet-100"
            iconColor="text-violet-600"
            title="Performance Insights"
            subtitle="AI-driven analysis of your progress"
          />
          {trendEntries.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {trendEntries.map(([key, value], i) => {
                const dir = dirMap[value] || dirMap.stable;
                const { Icon: DirIcon } = dir;
                return (
                  <motion.div
                    key={key}
                    variants={itemVariants}
                    className={`flex items-start gap-3 p-4 rounded-xl border ${dir.bg}`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${dir.badge}`}>
                      <DirIcon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-slate-600 text-xs font-semibold capitalize leading-snug">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className={`text-sm font-bold mt-0.5 capitalize ${dir.text}`}>
                        {typeof value === 'string' ? value : JSON.stringify(value)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <EmptyState icon={Brain} message="Trends will appear as you complete more interview sessions." />
          )}
        </div>
      </SectionCard>
    </motion.div>
  );
}

function SkillRadar({ skills }) {
  const size = 260;
  const cx = size / 2, cy = size / 2, r = 90;
  const n = skills.length;
  if (n < 3) return <EmptyState icon={Target} message="Need at least 3 skills for radar view." />;

  const angleStep = (2 * Math.PI) / n;
  const getPoint = (i, radius) => ({
    x: cx + radius * Math.sin(i * angleStep),
    y: cy - radius * Math.cos(i * angleStep),
  });

  const rings = [0.25, 0.5, 0.75, 1];
  const dataPoints = skills.map((s, i) => {
    const val = Math.min(100, Math.max(0, parseFloat(s.score ?? s.value ?? 0)));
    return getPoint(i, (val / 100) * r);
  });
  const polyPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ') + ' Z';

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-10 py-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {rings.map((ring, ri) => {
          const pts = Array.from({ length: n }, (_, i) => getPoint(i, ring * r));
          const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ') + ' Z';
          return <path key={ri} d={path} fill="none" stroke="#e2e8f0" strokeWidth={1} />;
        })}
        {Array.from({ length: n }, (_, i) => {
          const outer = getPoint(i, r);
          return <line key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="#e2e8f0" strokeWidth={1} />;
        })}
        <motion.path
          d={polyPath}
          fill="rgba(6,182,212,0.12)"
          stroke="#06b6d4"
          strokeWidth={2}
          strokeLinejoin="round"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />
        {dataPoints.map((p, i) => (
          <motion.circle key={i} cx={p.x} cy={p.y} r={4} fill="#06b6d4" stroke="#fff" strokeWidth={2}
            initial={{ r: 0 }} animate={{ r: 4 }} transition={{ delay: i * 0.07 + 0.6, duration: 0.3 }} />
        ))}
        {skills.map((s, i) => {
          const pos = getPoint(i, r + 20);
          return (
            <text key={i} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle"
              fill="#64748b" fontSize="10" fontWeight="600">
              {(s.skill || s.name || `S${i + 1}`).slice(0, 10)}
            </text>
          );
        })}
      </svg>
      <div className="flex flex-col gap-3 min-w-40">
        {skills.map((s, i) => {
          const val = parseFloat(s.score ?? s.value ?? 0);
          const dotClass  = val >= 80 ? 'bg-emerald-400' : val >= 60 ? 'bg-cyan-400' : val >= 40 ? 'bg-amber-400' : 'bg-rose-400';
          const textClass = val >= 80 ? 'text-emerald-700' : val >= 60 ? 'text-cyan-700' : val >= 40 ? 'text-amber-700' : 'text-rose-600';
          return (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotClass}`} />
              <span className="text-slate-600 text-sm flex-1">{s.skill || s.name || `Skill ${i + 1}`}</span>
              <span className={`text-sm font-bold ${textClass}`}>{val.toFixed(0)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SkillsSection({ data }) {
  const skills = data?.skillBreakdown || [];
  const recs   = data?.recommendations || [];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill bars */}
        <SectionCard>
          <div className="absolute top-0 right-0 w-28 h-28 bg-cyan-100/20 rounded-full -translate-y-12 translate-x-12" />
          <div className="p-6 relative z-10">
            <SectionHeader
              icon={Layers}
              iconBg="bg-cyan-100"
              iconColor="text-cyan-600"
              title="Skill Breakdown"
              subtitle="Proficiency across key areas"
            />
            {skills.length > 0 ? (
              skills.map((s, i) => (
                <SkillBar
                  key={i}
                  name={s.skill || s.name || `Skill ${i + 1}`}
                  score={s.score ?? s.value ?? 0}
                  index={i}
                />
              ))
            ) : (
              <EmptyState icon={Layers} message="Complete more interviews to see your skill breakdown." />
            )}
          </div>
        </SectionCard>

        {/* Recommendations */}
        <SectionCard>
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-100/20 rounded-full -translate-y-12 translate-x-12" />
          <div className="p-6 relative z-10">
            <SectionHeader
              icon={Award}
              iconBg="bg-emerald-100"
              iconColor="text-emerald-600"
              title="Recommendations"
              subtitle="Personalized improvement actions"
            />
            {recs.length > 0 ? (
              <div className="space-y-3">
                {recs.map((rec, i) => {
                  const isHigh = rec.priority === 'High';
                  return (
                    <motion.div
                      key={i}
                      variants={itemVariants}
                      className={`p-4 rounded-xl border-l-2 ${isHigh ? 'bg-rose-50 border-rose-400' : 'bg-amber-50 border-amber-400'}`}
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-slate-800 text-sm font-semibold">{rec.skill || `Skill ${i + 1}`}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isHigh ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                          {rec.priority ?? 'Medium'}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        {rec.action || rec.description || 'Focus on improving this skill area.'}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <EmptyState icon={Star} message="Finish more sessions to get personalized recommendations." />
            )}
          </div>
        </SectionCard>
      </div>

      {/* Radar chart */}
      {skills.length >= 3 && (
        <SectionCard>
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/20 rounded-full -translate-y-16 translate-x-16" />
          <div className="p-6 relative z-10">
            <SectionHeader
              icon={Target}
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
              title="Skill Radar"
              subtitle="Visual overview of your strengths and gaps"
            />
            <SkillRadar skills={skills} />
          </div>
        </SectionCard>
      )}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart2 },
  { id: 'trends',   label: 'Trends',   icon: TrendingUp },
  { id: 'skills',   label: 'Skills',   icon: Layers },
];

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [trendsData, setTrendsData]       = useState(null);
  const [skillData, setSkillData]         = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [activeTab, setActiveTab]         = useState('overview');
  const [refreshing, setRefreshing]       = useState(false);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      setLoading(true); setError(null);
      const [analytics, trends, skills] = await Promise.all([
        getAnalytics(), getPerformanceTrends(), getSkillAnalysis()
      ]);
      setAnalyticsData(analytics);
      setTrendsData(trends);
      setSkillData(skills);
    } catch (e) {
      console.error('Analytics load error:', e);
      setError('Failed to load analytics. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50/30 to-blue-50/20 flex items-center justify-center">
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-[3px] border-cyan-200 border-t-cyan-500 rounded-full mx-auto mb-4"
        />
        <p className="text-slate-600 font-medium">Loading your analytics...</p>
      </motion.div>
    </div>
  );

  /* ── Error ── */
  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50/30 to-blue-50/20 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 max-w-sm w-full border border-cyan-200/40 shadow-md text-center"
      >
        <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-rose-500" />
        </div>
        <p className="text-slate-700 font-medium mb-6 leading-relaxed">{error}</p>
        <button
          onClick={handleRefresh}
          className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          Try Again
        </button>
      </motion.div>
    </div>
  );

  /* ── Main ── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50/30 to-blue-50/20 relative overflow-hidden">

      {/* Background blobs — identical pattern to IntervuAI */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div variants={floatingAnimation} animate="animate"
          className="absolute top-1/4 -left-10 w-72 h-72 bg-cyan-200/20 rounded-full blur-3xl" />
        <motion.div variants={floatingAnimation} animate="animate" transition={{ delay: 1 }}
          className="absolute bottom-1/4 right-0 w-96 h-96 bg-blue-200/15 rounded-full blur-3xl" />
        <motion.div variants={floatingAnimation} animate="animate" transition={{ delay: 2 }}
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-sky-200/10 rounded-full blur-3xl" />
        <div className="absolute top-20 right-20 opacity-[0.04]">
          <BrainCircuit className="w-40 h-40 text-cyan-500" />
        </div>
        <div className="absolute bottom-20 left-20 opacity-[0.04]">
          <Cpu className="w-40 h-40 text-blue-500" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-4 sm:py-6 px-2 sm:px-4 md:px-6 lg:px-8 relative z-10">

        {/* ── Header ── */}
        <motion.header variants={containerVariants} initial="hidden" animate="visible" className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <motion.div variants={itemVariants}
                className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 border border-cyan-200/50 shadow-xs mb-3 sm:mb-4"
              >
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                <span className="text-cyan-700 text-xs sm:text-sm font-medium">Real-time Analytics Dashboard</span>
              </motion.div>
              <motion.h1 variants={itemVariants}
                className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2 sm:mb-3"
              >
                Performance Analytics
              </motion.h1>
              <motion.p variants={itemVariants} className="text-slate-600 text-sm sm:text-base md:text-lg max-w-xl">
                Track your interview performance, identify strengths, and discover areas for improvement.
              </motion.p>
            </div>

            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleRefresh}
              className="self-start flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-cyan-200/50 text-slate-600 px-4 py-2.5 rounded-xl font-medium text-sm shadow-xs hover:shadow-sm hover:border-cyan-300 transition-all"
            >
              <motion.div
                animate={{ rotate: refreshing ? 360 : 0 }}
                transition={{ duration: 0.8, repeat: refreshing ? Infinity : 0, ease: 'linear' }}
              >
                <RefreshCw className="w-4 h-4" />
              </motion.div>
              Refresh
            </motion.button>
          </div>
        </motion.header>

        {/* ── Tabs ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-1.5 sm:gap-2 mb-6 bg-white/50 backdrop-blur-sm w-fit p-1.5 rounded-2xl border border-cyan-200/40 shadow-xs"
        >
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            const TIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-white/60'
                }`}
              >
                <TIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {tab.label}
              </button>
            );
          })}
        </motion.div>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {activeTab === 'overview' && <OverviewSection data={analyticsData} />}
            {activeTab === 'trends'   && <TrendsSection data={trendsData} />}
            {activeTab === 'skills'   && <SkillsSection data={skillData} />}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}