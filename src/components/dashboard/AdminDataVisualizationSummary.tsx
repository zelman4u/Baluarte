import React, { useState } from 'react';
import { Card } from '../ui/Base';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Scale, Heart, TrendingUp, ShieldAlert, BarChart3, PieChart as PieIcon, Layers } from 'lucide-react';
import { cn } from '../../lib/utils';

// Case Status Distribution Data
const CASE_STATUS_DATA = [
  { name: 'Amicably Settled', count: 42, color: '#3FB950' },
  { name: 'PB Mediation Ongoing', count: 18, color: '#58A6FF' },
  { name: 'Pangkat Conciliation', count: 12, color: '#D29922' },
  { name: 'Issued CFA (Escalated)', count: 6, color: '#F85149' },
  { name: 'Repudiated / Repudiation', count: 3, color: '#A371F7' }
];

// Health Service Utilization Data
const HEALTH_UTILIZATION_DATA = [
  { month: 'Jan', maternal: 45, immunization: 80, seniorCare: 110, aicsClaims: 32 },
  { month: 'Feb', maternal: 52, immunization: 95, seniorCare: 130, aicsClaims: 28 },
  { month: 'Mar', maternal: 58, immunization: 110, seniorCare: 145, aicsClaims: 40 },
  { month: 'Apr', maternal: 64, immunization: 125, seniorCare: 160, aicsClaims: 35 },
  { month: 'May', maternal: 70, immunization: 140, seniorCare: 175, aicsClaims: 48 },
  { month: 'Jun', maternal: 75, immunization: 155, seniorCare: 190, aicsClaims: 52 }
];

// Treasury Fund Allocation Data
const TREASURY_ALLOCATION_DATA = [
  { name: 'General Services & Personnel', amount: 480000, color: '#58A6FF' },
  { name: 'DRRM Calamity Reserve (5%)', amount: 160000, color: '#D29922' },
  { name: 'Social Welfare & AICS Grants', amount: 240000, color: '#3FB950' },
  { name: 'SK Youth Fund Statutory (10%)', amount: 180000, color: '#BC8CFF' },
  { name: 'Infrastructure & Spills Dike', amount: 320000, color: '#388BFD' },
  { name: 'Peace & Order / Tanod Force', amount: 120000, color: '#F0883E' }
];

export const AdminDataVisualizationSummary: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'cases' | 'health' | 'treasury'>('all');

  return (
    <Card className="p-6 md:p-8 bg-brand-surface border-brand-border kinetic-card">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-brand-primary/10 text-brand-primary border border-brand-primary/20 kinetic-badge">
              Executive Analytics
            </span>
            <span className="text-xs text-brand-muted font-mono">• Cross-Departmental Intelligence</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-brand-text uppercase tracking-tight interactive-text cursor-default">
            Departmental Decision-Support Visualization
          </h2>
          <p className="text-xs text-brand-muted mt-0.5">
            Breakdown of Katarungang Pambarangay cases, healthcare service outreach, and statutory municipal fund disbursements.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 bg-brand-bg p-1 rounded-xl border border-brand-border overflow-x-auto">
          {[
            { id: 'all', label: 'Consolidated', icon: Layers },
            { id: 'cases', label: 'KP Justice', icon: Scale },
            { id: 'health', label: 'Health & AICS', icon: Heart },
            { id: 'treasury', label: 'Treasury Funds', icon: TrendingUp },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all interactive-click whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-brand-primary text-brand-bg shadow-sm"
                  : "text-brand-muted hover:text-brand-text hover:bg-brand-surface"
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module 1: Katarungang Pambarangay Breakdown */}
        {(activeTab === 'all' || activeTab === 'cases') && (
          <div className={cn(
            "p-5 rounded-2xl bg-brand-card/50 border border-brand-border flex flex-col",
            activeTab === 'cases' ? "lg:col-span-3" : ""
          )}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-brand-primary/10 text-brand-primary">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-brand-text interactive-text">
                    Case Status Distributions
                  </h3>
                  <span className="text-[10px] text-brand-muted">81 Total Mediated Disputes</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">52% Settled</span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CASE_STATUS_DATA} layout="vertical" margin={{ left: 10, right: 20, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#30363D" />
                  <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: '#8B949E' }} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fontSize: 9, fill: '#E6EDF3', fontWeight: 'bold' }} 
                    width={110} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#161B22', borderRadius: '8px', border: '1px solid #30363D', color: '#E6EDF3', fontSize: '11px' }}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {CASE_STATUS_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-3 border-t border-brand-border/40 grid grid-cols-2 gap-2 text-[10px]">
              <div className="p-2 bg-brand-bg rounded-lg border border-brand-border">
                <span className="text-brand-muted block">Direct PB Mediation:</span>
                <span className="font-bold text-brand-primary">42 Resolved</span>
              </div>
              <div className="p-2 bg-brand-bg rounded-lg border border-brand-border">
                <span className="text-brand-muted block">Escalated CFA Rate:</span>
                <span className="font-bold text-brand-danger">7.4% Low</span>
              </div>
            </div>
          </div>
        )}

        {/* Module 2: Health Service Utilization */}
        {(activeTab === 'all' || activeTab === 'health') && (
          <div className={cn(
            "p-5 rounded-2xl bg-brand-card/50 border border-brand-border flex flex-col",
            activeTab === 'health' ? "lg:col-span-3" : ""
          )}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-brand-text interactive-text">
                    Health Service Utilization
                  </h3>
                  <span className="text-[10px] text-brand-muted">Monthly Beneficiary Consultations</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-pink-400 font-bold">+18% Outreach</span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={HEALTH_UTILIZATION_DATA} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#30363D" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#8B949E' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#8B949E' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#161B22', borderRadius: '8px', border: '1px solid #30363D', color: '#E6EDF3', fontSize: '11px' }}
                  />
                  <Bar dataKey="seniorCare" fill="#58A6FF" name="Senior Checkups" stackId="a" />
                  <Bar dataKey="immunization" fill="#3FB950" name="Childhood Vaccines" stackId="a" />
                  <Bar dataKey="maternal" fill="#F778BA" name="Maternal Care" stackId="a" />
                  <Bar dataKey="aicsClaims" fill="#D29922" name="AICS Indigent Aid" stackId="a" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-3 border-t border-brand-border/40 grid grid-cols-2 gap-2 text-[10px]">
              <div className="p-2 bg-brand-bg rounded-lg border border-brand-border">
                <span className="text-brand-muted block">Senior Citizen Coverage:</span>
                <span className="font-bold text-brand-primary">190 Consults/mo</span>
              </div>
              <div className="p-2 bg-brand-bg rounded-lg border border-brand-border">
                <span className="text-brand-muted block">Vaccine Adherence:</span>
                <span className="font-bold text-emerald-400">96.4% Compliance</span>
              </div>
            </div>
          </div>
        )}

        {/* Module 3: Treasury Fund Allocation */}
        {(activeTab === 'all' || activeTab === 'treasury') && (
          <div className={cn(
            "p-5 rounded-2xl bg-brand-card/50 border border-brand-border flex flex-col",
            activeTab === 'treasury' ? "lg:col-span-3" : ""
          )}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-brand-text interactive-text">
                    Treasury Fund Allocation
                  </h3>
                  <span className="text-[10px] text-brand-muted">₱1.50M Annual Statutory Budget</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">Audited</span>
            </div>

            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={TREASURY_ALLOCATION_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="amount"
                  >
                    {TREASURY_ALLOCATION_DATA.map((entry, index) => (
                      <Cell key={`cell-alloc-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: any) => [`₱${Number(val).toLocaleString()}`, 'Allocated']}
                    contentStyle={{ backgroundColor: '#161B22', borderRadius: '8px', border: '1px solid #30363D', color: '#E6EDF3', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-3 border-t border-brand-border/40 grid grid-cols-2 gap-2 text-[10px]">
              <div className="p-2 bg-brand-bg rounded-lg border border-brand-border">
                <span className="text-brand-muted block">DRRM Disaster Share:</span>
                <span className="font-bold text-amber-400">₱160,000 (5%)</span>
              </div>
              <div className="p-2 bg-brand-bg rounded-lg border border-brand-border">
                <span className="text-brand-muted block">Welfare & Indigent:</span>
                <span className="font-bold text-emerald-400">₱240,000 (16%)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
