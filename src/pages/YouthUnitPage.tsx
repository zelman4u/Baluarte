import React from 'react';
import { motion } from 'motion/react';
import { Compass, Trophy, ArrowLeft, Target, Trees, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';

export const YouthUnitPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#000d1a] text-brand-text font-sans overflow-x-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,120,255,0.08)_0%,transparent_70%)] pointer-events-none" />
      
      <nav className="relative z-10 px-8 py-6 flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2 group">
          <ArrowLeft className="w-4 h-4 text-brand-muted group-hover:text-blue-400 transition-colors" />
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted group-hover:text-brand-text transition-colors">Main Portal</span>
        </Link>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-500" />
              <span className="font-black uppercase tracking-[0.2em] text-sm">Youth_Unit</span>
           </div>
           <div className="hidden sm:block">
              <img 
                src="https://lh3.googleusercontent.com/d/1x8riK__Rn53iKzwbvEUapuNuQmNUwC33=s1000" 
                alt="SK Logo" 
                className="w-10 h-10 object-contain rounded-full border border-white/10"
              />
           </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
             initial={{ opacity: 0, x: -30 }}
             animate={{ opacity: 1, x: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-8">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">Community & SK Synergy</span>
            </div>
            
            <h1 className="text-6xl lg:text-9xl font-black uppercase tracking-tighter leading-[0.8] mb-8 italic">
              Future <br /> Driven <span className="text-blue-500">Vision</span>
            </h1>
            
            <p className="text-brand-muted text-lg font-medium leading-relaxed max-w-lg mb-12">
              Empowering the youth of Barangay Baluarte through digitalization, sports excellence coordination, and environmental sustainability monitoring.
            </p>
          </motion.div>

          <div className="relative group">
             <div className="absolute inset-0 bg-blue-500/20 blur-[100px] -z-10 group-hover:bg-blue-500/30 transition-all" />
             <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Scholarship Sync', icon: Target, val: '842', unit: 'Beneficiaries' },
                  { label: 'Sports Programs', icon: Trophy, val: '12', unit: 'Active Events' },
                  { label: 'Green Initiatives', icon: Trees, val: '4', unit: 'Zones Monitored' },
                  { label: 'Youth Profiling', icon: Compass, val: '2.5k', unit: 'Mapped Profiles' }
                ].map((stat, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-8 bg-blue-900/10 border border-blue-500/10 backdrop-blur-md rounded-3xl"
                  >
                    <stat.icon className="w-5 h-5 text-blue-500 mb-6" />
                    <div className="mb-2 flex items-baseline gap-1">
                       <span className="text-3xl font-black">{stat.val}</span>
                       <span className="text-[10px] uppercase font-bold text-brand-muted">{stat.unit}</span>
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-brand-primary">{stat.label}</p>
                  </motion.div>
                ))}
             </div>
          </div>
        </div>
      </main>

      <section className="py-24 px-8 border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-blue-500/5 blur-[100px] -z-10" />
        <div className="max-w-7xl mx-auto">
           <div className="grid md:grid-cols-3 gap-16">
              <div className="md:col-span-1">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-6">SK_STRATEGY_2026</h4>
                 <h2 className="text-4xl font-black uppercase tracking-tighter leading-none mb-8">Digitizing Local Youth Development</h2>
                 <p className="text-brand-muted text-xs font-bold leading-relaxed uppercase tracking-tight">
                   Breaking silos between youth voices and governance through accessible technology and data-backed policy making.
                 </p>
              </div>
              <div className="md:col-span-2 space-y-12">
                 <div className="flex gap-8 group">
                    <div className="shrink-0 w-12 h-12 rounded-2xl bg-blue-900/30 flex items-center justify-center border border-blue-500/20 group-hover:border-blue-500 transition-colors">
                       <span className="text-sm font-black italic">01</span>
                    </div>
                    <div>
                       <h5 className="font-black uppercase tracking-widest text-sm mb-2">Centralized Scholarship Database</h5>
                       <p className="text-[11px] text-brand-muted leading-relaxed uppercase font-bold">Automated qualification screening and real-time distribution tracking for SK beneficiaries.</p>
                    </div>
                 </div>
                 <div className="flex gap-8 group">
                    <div className="shrink-0 w-12 h-12 rounded-2xl bg-blue-900/30 flex items-center justify-center border border-blue-500/20 group-hover:border-blue-500 transition-colors">
                       <span className="text-sm font-black italic">02</span>
                    </div>
                    <div>
                       <h5 className="font-black uppercase tracking-widest text-sm mb-2">Sports Facility Analytics</h5>
                       <p className="text-[11px] text-brand-muted leading-relaxed uppercase font-bold">Booking system for barangay courts and equipment monitoring to maximize youth engagement.</p>
                    </div>
                 </div>
                 <div className="flex gap-8 group">
                    <div className="shrink-0 w-12 h-12 rounded-2xl bg-blue-900/30 flex items-center justify-center border border-blue-500/20 group-hover:border-blue-500 transition-colors">
                       <span className="text-sm font-black italic">03</span>
                    </div>
                    <div>
                       <h5 className="font-black uppercase tracking-widest text-sm mb-2">Environmental Shield</h5>
                       <p className="text-[11px] text-brand-muted leading-relaxed uppercase font-bold">Community-led reporting and satellite monitoring of Baluarte's green zones and waste management.</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
};
