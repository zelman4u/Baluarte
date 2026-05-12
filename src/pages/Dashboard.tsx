import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Base';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  Activity,
  Heart,
  Calendar,
  AlertCircle,
  Map as MapIcon,
  CheckCircle2,
  ArrowUpRight,
  Bell,
  Scale,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion } from 'motion/react';

const data = [
  { name: 'Jan', requests: 400, cases: 24, revenue: 2400 },
  { name: 'Feb', requests: 300, cases: 18, revenue: 1398 },
  { name: 'Mar', requests: 200, cases: 32, revenue: 9800 },
  { name: 'Apr', requests: 278, cases: 21, revenue: 3908 },
  { name: 'May', requests: 189, cases: 15, revenue: 4800 },
  { name: 'Jun', requests: 239, cases: 28, revenue: 3800 },
];

export const Dashboard: React.FC = () => {
  const { profile } = useAuth();

  const getStats = () => {
    switch(profile?.department) {
      case 'Administration':
        return [
          { label: 'Total Registered Residents', value: '12,482', icon: Users, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
          { label: 'Pending Documentation', value: '18', icon: FileText, color: 'text-brand-warning', bg: 'bg-brand-warning/10' },
          { label: 'Treasury Balance', value: '₱1.24M', icon: TrendingUp, color: 'text-brand-success', bg: 'bg-brand-success/10' },
          { label: 'Active Personnel', value: '24', icon: Activity, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        ];
      case 'Justice':
        return [
          { label: 'Active Blotter Cases', value: '08', icon: Scale, color: 'text-brand-danger', bg: 'bg-brand-danger/10' },
          { label: 'Settled this Month', value: '8', icon: CheckCircle2, color: 'text-brand-success', bg: 'bg-brand-success/10' },
          { label: 'Tanod Patrols', value: 'Live', icon: ShieldCheck, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
          { label: 'Pending Summons', value: '5', icon: AlertCircle, color: 'text-brand-warning', bg: 'bg-brand-warning/10' },
        ];
      default:
        return [
          { label: 'Global Population', value: '12,482', icon: Users, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
          { label: 'Announcements', value: '4', icon: Bell, color: 'text-brand-danger', bg: 'bg-brand-danger/10' },
          { label: 'System Secure', value: 'AES-256', icon: ShieldCheck, color: 'text-brand-success', bg: 'bg-brand-success/10' },
          { label: 'Next Session', value: 'May 15', icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        ];
    }
  };

  const getDashboardManifest = () => {
    const dept = profile?.department || 'Global';
    switch(dept) {
      case 'Administration':
        return {
          title: 'Executive Oversight',
          subtitle: 'Barangay Administrative Command & Control',
          statLabel: 'Admin Stats',
          chartTitle: 'Revenue vs Operating Expenses'
        };
      case 'Justice':
        return {
          title: 'Lupon Tagapamayapa',
          subtitle: 'Public Safety & Legal Mediation Monitoring',
          statLabel: 'Safety Metrics',
          chartTitle: 'Case Settlement Velocity'
        };
      case 'Health':
        return {
          title: 'Welfare Operations',
          subtitle: 'Health Center & Social Program Monitoring',
          statLabel: 'Welfare Metrics',
          chartTitle: 'Patient & Program Reach'
        };
      case 'Youth':
        return {
          title: 'Community Development',
          subtitle: 'Youth Projects & SK Program Oversight',
          statLabel: 'Youth Metrics',
          chartTitle: 'Project Lifecycle Trends'
        };
      default:
        return {
          title: 'Global Oversight',
          subtitle: 'Central Governance Monitoring System',
          statLabel: 'General Stats',
          chartTitle: 'Operational Analytics'
        };
    }
  };

  const manifest = getDashboardManifest();
  const stats = getStats();

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-brand-muted text-xs font-bold uppercase tracking-widest">Portal /</span>
            <span className="text-brand-text text-xs font-bold uppercase tracking-widest">{profile?.department} Registry</span>
          </div>
          <h1 className="text-3xl font-bold text-brand-text tracking-tight uppercase tracking-[-0.05em]">{manifest.title}</h1>
          <p className="text-brand-muted mt-1 font-medium">{manifest.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 text-brand-success bg-brand-success/5 border border-brand-success/20 px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 bg-brand-success rounded-full animate-pulse shadow-[0_0_8px_rgba(63,185,80,0.5)]"></div>
          <span className="text-[10px] font-bold uppercase tracking-widest leading-none">System Secure & Operational</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2.5 rounded-lg border border-brand-border", stat.bg)}>
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
                <div className="flex items-center gap-1 text-brand-success text-[10px] font-bold bg-brand-success/10 px-2 py-0.5 rounded-full border border-brand-success/20">
                  <ArrowUpRight className="w-2.5 h-2.5" />
                  Live
                </div>
              </div>
              <p className="text-brand-muted text-[10px] font-bold uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-bold text-brand-text mt-1">{stat.value}</h3>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="p-8 lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-bold text-brand-text uppercase tracking-widest">{manifest.chartTitle}</h3>
              <p className="text-xs text-brand-muted mt-0.5">Real-time synchronized data telemetry</p>
            </div>
            <div className="flex border border-brand-border rounded-lg overflow-hidden">
               <button className="px-3 py-1.5 text-[10px] font-bold bg-brand-bg text-brand-primary border-r border-brand-border">30D_CYCLE</button>
               <button className="px-3 py-1.5 text-[10px] font-bold text-brand-muted hover:bg-brand-bg">ANNUAL</button>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#58A6FF" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#58A6FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#30363D" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#8B949E', fontWeight: 'bold'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#8B949E', fontWeight: 'bold'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#161B22', borderRadius: '8px', border: '1px solid #30363D', color: '#E6EDF3', fontSize: '12px' }}
                  itemStyle={{ color: '#58A6FF' }}
                />
                <Area type="monotone" dataKey="requests" stroke="#58A6FF" strokeWidth={2} fillOpacity={1} fill="url(#colorRequests)" />
                <Area type="monotone" dataKey="cases" stroke="#D29922" strokeWidth={2} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-8">
          <h3 className="text-sm font-bold text-brand-text uppercase tracking-widest mb-6">Recent Public Activity</h3>
          <div className="space-y-4">
            {[
              { label: 'Resident ID #2941', status: '3m ago', icon: FileText, color: 'text-brand-primary' },
              { label: 'Indigency Request', status: '14m ago', icon: FileText, color: 'text-brand-warning' },
              { label: 'Tanod Patrol Start', status: 'LIVE', icon: ShieldCheck, color: 'text-brand-success' },
              { label: 'New SK Project', status: '1h ago', icon: Bell, color: 'text-purple-400' },
              { label: 'Blotter #022-A', status: 'Escalated', icon: FileText, color: 'text-brand-danger' },
              { label: 'Disaster Alert Test', status: '2h ago', icon: AlertCircle, color: 'text-brand-muted' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between pb-3 border-b border-brand-border last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <activity.icon className={cn("w-4 h-4", activity.color)} />
                  <span className="text-xs font-bold text-brand-text">{activity.label}</span>
                </div>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-tight",
                  activity.status === 'LIVE' ? "text-brand-success" : "text-brand-muted"
                )}>{activity.status}</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2.5 bg-brand-surface border border-brand-border rounded-lg text-[10px] font-bold text-brand-muted hover:text-brand-text transition-colors uppercase tracking-widest">
            View All Terminal Logs
          </button>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-8">
           <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-brand-text uppercase tracking-widest">Demographic Overview</h3>
            <span className="text-[10px] font-bold text-brand-muted">GLOBAL REACH</span>
          </div>
          <div className="flex gap-12 items-center">
            <div className="relative w-24 h-24">
               <div className="absolute inset-0 rounded-full border-[6px] border-brand-surface"></div>
               <div className="absolute inset-0 rounded-full border-[6px] border-brand-primary border-r-transparent border-b-transparent -rotate-45 shadow-[0_0_15px_rgba(88,166,255,0.2)]"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                 <span className="text-sm font-bold text-brand-text">72%</span>
               </div>
            </div>
            <div className="flex-1 space-y-4">
               <div>
                  <div className="flex justify-between text-[10px] font-bold text-brand-muted mb-1.5 uppercase">
                    <span>Youth (SK)</span>
                    <span className="text-brand-text">3,241</span>
                  </div>
                  <div className="h-1.5 bg-brand-surface rounded-full overflow-hidden">
                    <div className="h-full bg-brand-primary w-[35%] rounded-full shadow-[0_0_8px_#58A6FF]"></div>
                  </div>
               </div>
               <div>
                  <div className="flex justify-between text-[10px] font-bold text-brand-muted mb-1.5 uppercase">
                    <span>Senior Citizens</span>
                    <span className="text-brand-text">1,892</span>
                  </div>
                  <div className="h-1.5 bg-brand-surface rounded-full overflow-hidden">
                    <div className="h-full bg-brand-warning w-[22%] rounded-full shadow-[0_0_8px_#D29922]"></div>
                  </div>
               </div>
            </div>
          </div>
        </Card>

        <Card className="p-8">
          <h3 className="text-sm font-bold text-brand-text uppercase tracking-widest mb-6 px-1">Subdomain Portals</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: 'ADMIN', url: 'admin.baluarte.gov.ph' },
              { id: 'JUSTICE', url: 'justice.baluarte.gov.ph' },
              { id: 'HEALTH', url: 'health.baluarte.gov.ph' },
              { id: 'SK', url: 'sk.baluarte.gov.ph' },
              { id: 'TANOD', url: 'tanod.baluarte.gov.ph' },
              { id: 'DRRM', url: 'drrm.baluarte.gov.ph' },
            ].map(portal => (
              <div key={portal.id} className="bg-brand-surface border border-brand-border p-3 rounded-lg hover:border-brand-primary/50 transition-colors cursor-pointer group">
                  <span className="block text-[8px] font-black text-brand-muted group-hover:text-brand-primary transition-colors tracking-tighter">{portal.id}</span>
                  <span className="block text-[10px] text-brand-text font-medium truncate mt-0.5">{portal.url}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
