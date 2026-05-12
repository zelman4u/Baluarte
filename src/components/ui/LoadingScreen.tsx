import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Activity, Database, Lock } from 'lucide-react';

interface LoadingScreenProps {
  role: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ role }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-brand-bg flex items-center justify-center p-8 overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-brand-primary/20 rounded-full animate-ping"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-brand-primary/10 rounded-full animate-pulse"></div>
      </div>

      <div className="relative text-center max-w-sm w-full">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="w-24 h-24 border-4 border-t-brand-primary border-r-transparent border-b-transparent border-l-transparent rounded-full mx-auto mb-10 shadow-[0_0_20px_rgba(88,166,255,0.2)]"
        />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-black text-brand-text tracking-tighter uppercase mb-2">Authenticating Profile</h2>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 rounded-full text-brand-primary mb-6">
            <Activity className="w-3 h-3 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest leading-none shrink-0">Establishing Secure Session</span>
          </div>
          <p className="text-brand-muted text-xs font-bold uppercase tracking-[0.2em] animate-pulse">
            Logging in as {role}...
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-3 gap-6 opacity-40">
           <div className="flex flex-col items-center gap-2">
             <Database className="w-5 h-5 text-brand-primary" />
             <span className="text-[8px] font-black uppercase tracking-widest">DB_SYNC</span>
           </div>
           <div className="flex flex-col items-center gap-2">
             <Lock className="w-5 h-5 text-brand-primary" />
             <span className="text-[8px] font-black uppercase tracking-widest">AES-256</span>
           </div>
           <div className="flex flex-col items-center gap-2">
             <ShieldCheck className="w-5 h-5 text-brand-primary" />
             <span className="text-[8px] font-black uppercase tracking-widest">VERIFIED</span>
           </div>
        </div>
      </div>
    </div>
  );
};
