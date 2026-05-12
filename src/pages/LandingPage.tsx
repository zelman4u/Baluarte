import React from 'react';
import { motion } from 'motion/react';
import { Shield, ArrowRight, Building2, Scale, Heart, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Base';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans selection:bg-brand-primary selection:text-brand-bg">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-brand-bg/80 backdrop-blur-md border-b border-brand-border px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-primary rounded flex items-center justify-center font-black text-brand-bg">B</div>
          <span className="font-black uppercase tracking-widest text-sm">Baluarte</span>
        </div>
        <div className="flex items-center gap-8">
          <a href="#services" className="text-[10px] font-black uppercase text-brand-muted hover:text-brand-primary transition-colors tracking-widest">Services</a>
          <a href="#announcements" className="text-[10px] font-black uppercase text-brand-muted hover:text-brand-primary transition-colors tracking-widest">Announcements</a>
          <Link to="/login">
            <Button variant="outline" size="sm" className="text-[10px] font-black uppercase border-brand-primary/30 text-brand-primary">
              Personnel Portal
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4"></div>
        
        <div className="max-w-5xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-brand-surface border border-brand-border rounded-full mb-8"
          >
            <Shield className="w-3 h-3 text-brand-primary" />
            <span className="text-[9px] font-black uppercase tracking-widest text-brand-muted">Official Governance System</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-6 leading-[0.9]"
          >
            Empowering <span className="text-brand-primary">Baluarte</span> <br /> Through Digitalization
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-brand-muted max-w-2xl mx-auto text-sm md:text-base font-medium leading-relaxed mb-10"
          >
            The centralized management information system for Barangay Baluarte, streamlining administration, justice, health center operations, and community development.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/login">
              <button className="bg-brand-primary text-brand-bg px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:shadow-[0_0_40px_rgba(88,166,255,0.3)] transition-all active:scale-95">
                Staff Entry <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Core Departments */}
      <section id="services" className="py-20 px-8 bg-brand-surface/30 border-y border-brand-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
             <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary mb-2">Our Framework</h2>
             <h3 className="text-3xl font-black uppercase tracking-tighter">Unified Governance Architecture</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { id: 'ADMIN', title: 'Governance & Admin', desc: 'Centralized resident records, certificate issuing, and fiscal transparency.', icon: Building2 },
              { id: 'JUSTICE', title: 'Justice & Safety', desc: 'Peace and order monitoring, blotter records, and mediation management.', icon: Scale },
              { id: 'HEALTH', title: 'Social Welfare', desc: 'Vaccination tracking, maternal care, and elderly assistance programs.', icon: Heart },
              { id: 'YOUTH', title: 'Community & SK', desc: 'Youth development, sports programs, and environmental monitoring.', icon: Compass },
            ].map(dept => (
              <div key={dept.id} className="p-8 bg-brand-card border border-brand-border rounded-2xl hover:border-brand-primary/50 transition-all group">
                <div className="w-12 h-12 bg-brand-bg border border-brand-border rounded-xl flex items-center justify-center text-brand-primary mb-6 group-hover:scale-110 transition-transform">
                  <dept.icon className="w-6 h-6" />
                </div>
                <span className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-2 block">{dept.id}_UNIT</span>
                <h4 className="text-lg font-black uppercase tracking-tight mb-4">{dept.title}</h4>
                <p className="text-xs text-brand-muted leading-relaxed">{dept.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-8 border-t border-brand-border bg-brand-bg">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-32">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-brand-primary rounded flex items-center justify-center font-black text-brand-bg text-sm">B</div>
              <span className="font-black uppercase tracking-widest text-xs">Baluarte</span>
            </div>
            <p className="text-xs text-brand-muted leading-relaxed font-medium">
              The official Digital Governance Portal of Barangay Baluarte. Built for transparency, speed, and reliable public service through modern technology.
            </p>
          </div>
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h5 className="text-[10px] font-black uppercase tracking-widest text-brand-text mb-6">Contact</h5>
              <ul className="space-y-4 text-xs text-brand-muted font-medium">
                <li>Hotline: 911-BALUARTE</li>
                <li>Email: info@baluarte.gov.ph</li>
                <li>Hall: Poblacion Area, Baluarte</li>
              </ul>
            </div>
            <div>
              <h5 className="text-[10px] font-black uppercase tracking-widest text-brand-text mb-6">Resource</h5>
              <ul className="space-y-4 text-xs text-brand-muted font-bold">
                <li className="hover:text-brand-primary transition-colors cursor-pointer uppercase tracking-tighter">Citizen Handbook</li>
                <li className="hover:text-brand-primary transition-colors cursor-pointer uppercase tracking-tighter">Ordinances</li>
                <li className="hover:text-brand-primary transition-colors cursor-pointer uppercase tracking-tighter">Transparency</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-brand-border flex flex-col sm:flex-row justify-between gap-4">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">© 2026 BALUARTE. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
             <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Privacy Policy</span>
             <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Data Sovereignty</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
