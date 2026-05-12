import React from 'react';
import { motion } from 'motion/react';
import { Heart, Activity, ArrowLeft, Stethoscope, Baby, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HealthUnitPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#051111] text-brand-text font-sans overflow-x-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.05)_0%,transparent_70%)] pointer-events-none" />
      
      <nav className="relative z-10 px-8 py-6 flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2 group">
          <ArrowLeft className="w-4 h-4 text-brand-muted group-hover:text-cyan-400 transition-colors" />
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted group-hover:text-brand-text transition-colors">Main Portal</span>
        </Link>
        <div className="flex items-center gap-2">
           <Heart className="w-5 h-5 text-cyan-500 underline" />
           <span className="font-black uppercase tracking-[0.2em] text-sm">Health_Unit</span>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-8 py-20 lg:py-32 grid lg:grid-cols-2 gap-20 items-center">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-8">
            <Activity className="w-3 h-3 text-cyan-400" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400">Public Health & Social Welfare</span>
          </div>
          
          <h1 className="text-6xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-8">
            Compassion <br /> In <span className="text-cyan-500">Service</span>
          </h1>
          
          <p className="text-brand-muted text-lg font-medium leading-relaxed max-w-lg mb-12">
            The Baluarte Health Unit streamlines medical record keeping, vaccination tracking, and maternal care coordination to ensure the well-being of every resident.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          {[
            { label: 'Vaccination History', icon: Activity, desc: 'Community immunization logs.' },
            { label: 'Maternal Care', icon: Baby, desc: 'Pregnancy tracking & vitamins.' },
            { label: 'Senior Records', icon: Users, desc: 'Elderly assistance monitoring.' },
            { label: 'Public Health', icon: Heart, desc: 'Disease surveillance metrics.' }
          ].map((item, idx) => (
            <div key={idx} className="p-8 bg-cyan-950/20 border border-cyan-900/30 rounded-2xl group hover:border-cyan-500/40 transition-colors">
              <item.icon className="w-8 h-8 text-cyan-500 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="font-black uppercase text-sm tracking-widest mb-3 leading-tight">{item.label}</h3>
              <p className="text-[10px] text-brand-muted uppercase font-bold leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>

      <section className="bg-white/5 border-y border-white/5 py-20 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
           <div className="max-w-md">
              <h4 className="text-cyan-500 text-[10px] font-black uppercase tracking-widest mb-4">Welfare Focus</h4>
              <h5 className="text-3xl font-black uppercase tracking-tighter mb-4">Building a Healthy <br /> Baluarte Community</h5>
              <p className="text-xs text-brand-muted font-bold uppercase tracking-tight">
                Our social welfare programs are designed to reach the marginalized, providing indigency certificates and nutritional support for children.
              </p>
           </div>
           <div className="w-full md:w-auto flex flex-col gap-4">
              <div className="bg-brand-surface p-4 rounded-xl border border-brand-border flex items-center gap-4">
                 <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-cyan-500" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase">Active Cases Tracking</p>
                    <p className="text-[8px] text-brand-muted font-bold">REAL-TIME SURVEILLANCE ACTIVE</p>
                 </div>
              </div>
              <div className="bg-brand-surface p-4 rounded-xl border border-brand-border flex items-center gap-4">
                 <div className="w-10 h-10 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-brand-primary" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase">Resident Wellness Index</p>
                    <p className="text-[8px] text-brand-muted font-bold">HEALTH DATA CONSOLIDATION_98%</p>
                 </div>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
};
