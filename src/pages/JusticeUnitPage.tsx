import React from 'react';
import { motion } from 'motion/react';
import { Scale, Shield, ArrowLeft, FileText, History, Gavel } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Base';

export const JusticeUnitPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a1a0a] text-brand-text font-sans overflow-x-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,197,94,0.05)_0%,transparent_70%)] pointer-events-none" />
      
      <nav className="relative z-10 px-8 py-6 flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2 group">
          <ArrowLeft className="w-4 h-4 text-brand-muted group-hover:text-green-400 transition-colors" />
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted group-hover:text-brand-text transition-colors">Main Portal</span>
        </Link>
        <div className="flex items-center gap-2">
           <Scale className="w-5 h-5 text-green-500" />
           <span className="font-black uppercase tracking-[0.2em] text-sm">Justice_Unit</span>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-8 py-20 lg:py-32 grid lg:grid-cols-2 gap-20 items-center">
        <motion.div
           initial={{ opacity: 0, x: -30 }}
           animate={{ opacity: 1, x: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full mb-8">
            <Shield className="w-3 h-3 text-green-400" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-green-400">Public Safety & Peace Order</span>
          </div>
          
          <h1 className="text-6xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-8">
            Fairness <br /> Through <span className="text-green-500">Law</span>
          </h1>
          
          <p className="text-brand-muted text-lg font-medium leading-relaxed max-w-lg mb-12">
            The Baluarte Justice Unit manages peace and order through standardized blotter records, fair mediation processes, and historical case tracking to ensure community safety.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-2 gap-4"
        >
          {[
            { label: 'Blotter Records', icon: FileText, desc: 'Official incident reports.' },
            { label: 'Mediation', icon: Gavel, desc: 'Conflict resolution logs.' },
            { label: 'Case History', icon: History, desc: 'Archived settlements.' },
            { label: 'Tanod Logistics', icon: Shield, desc: 'Patrol coordination.' }
          ].map((item, idx) => (
            <div key={idx} className="p-6 bg-green-950/20 border border-green-900/30 rounded-2xl backdrop-blur-sm">
              <item.icon className="w-6 h-6 text-green-500 mb-4" />
              <h3 className="font-black uppercase text-xs tracking-widest mb-2 leading-tight">{item.label}</h3>
              <p className="text-[10px] text-brand-muted uppercase font-bold">{item.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>

      <section className="bg-black/20 border-y border-white/5 py-20 px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
           <div className="space-y-4">
              <h4 className="text-green-500 text-[10px] font-black uppercase tracking-widest">Core Function</h4>
              <h5 className="text-xl font-black uppercase tracking-tight italic">"Justice Delayed is Justice Denied"</h5>
              <p className="text-xs text-brand-muted leading-relaxed uppercase font-bold tracking-tighter">
                Our system ensures every blotter entry is timestamped, verified, and processed with absolute transparency.
              </p>
           </div>
           <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="p-8 border border-white/5 rounded-2xl bg-white/5">
                 <h6 className="font-black uppercase text-xs mb-4 text-brand-primary">Mediation Framework</h6>
                 <p className="text-[11px] text-brand-muted leading-relaxed">
                   The Lupon Tagapamayapa transition system for Barangay Baluarte, digitizing the settlement of disputes at the local level.
                 </p>
              </div>
              <div className="p-8 border border-white/5 rounded-2xl bg-white/5">
                 <h6 className="font-black uppercase text-xs mb-4 text-brand-primary">Safety Protocols</h6>
                 <p className="text-[11px] text-brand-muted leading-relaxed">
                   Integration with Tanod patrol logs ensures that incident hotspots are identified and addressed in real-time.
                 </p>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
};
