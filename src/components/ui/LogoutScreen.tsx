import React from 'react';
import { motion } from 'motion/react';
import { LogOut, ShieldAlert, Cpu, Power, Scale } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LogoutScreen: React.FC = () => {
  const { profile } = useAuth();
  
  // Capture theme on mount to prevent flickering during auth state changes
  const [theme] = React.useState(() => {
    const isSK = profile?.department === 'Youth' && profile?.role === 'SKOfficial';
    const isAdmin = profile?.department === 'Administration' && (profile?.role === 'Captain' || profile?.role === 'Secretary');
    const isJustice = profile?.department === 'Justice';
    return { isSK, isAdmin, isJustice };
  });

  const { isSK, isAdmin, isJustice } = theme;
  const showBranding = isSK || isAdmin;
  
  const logoUrl = isSK 
    ? "https://lh3.googleusercontent.com/d/1x8riK__Rn53iKzwbvEUapuNuQmNUwC33=s1000"
    : "https://lh3.googleusercontent.com/d/15qEeMZnaeEI052MdJrFujHjkxcKJMHku=s1000";

  return (
    <div className={`fixed inset-0 z-[200] ${isSK ? 'bg-[#000d1a]' : isJustice ? 'bg-[#0a1a0a]' : 'bg-brand-bg'} flex flex-col items-center justify-center p-8 overflow-hidden font-sans border-none`}>
      {/* Background depth and glow */}
      <div className={`absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,${isSK ? 'rgba(0,120,255,0.1)' : isJustice ? 'rgba(34,197,94,0.1)' : showBranding ? 'rgba(239,68,68,0.05)' : 'rgba(88,166,255,0.05)'}_0%,transparent_70%)] animate-pulse`} />
      
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ type: "spring", damping: 15 }}
           className="relative"
        >
          <motion.div 
            style={{ perspective: 1000 }}
            animate={{ 
              rotateY: [0, -360],
              y: [0, 5, 0]
            }}
            transition={{ 
              rotateY: { duration: 5, repeat: Infinity, ease: "linear" },
              y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
            className={`w-32 h-32 bg-gradient-to-br ${isSK ? 'from-blue-500/10' : isJustice ? 'from-green-500/10' : 'from-white/10'} to-transparent backdrop-blur-2xl rounded-full flex items-center justify-center p-3 shadow-[0_0_50px_${isSK ? 'rgba(0,120,255,0.3)' : isJustice ? 'rgba(34,197,94,0.3)' : showBranding ? 'rgba(239,68,68,0.2)' : 'rgba(88,166,255,0.2)'}] border border-white/10`}
          >
            {showBranding ? (
              <img 
                src={logoUrl} 
                alt="Baluarte Logo" 
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover rounded-full ${isSK ? '' : 'grayscale opacity-70'} transition-all`}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = isSK 
                    ? "https://placehold.co/100/000d1a/58a6ff?text=SK"
                    : "https://placehold.co/100/1e1e1e/58a6ff?text=B";
                }}
              />
            ) : (
              <div className="w-12 h-12 flex items-center justify-center">
                {isJustice ? (
                  <Scale className="w-12 h-12 text-green-500" />
                ) : (
                  <LogOut className="w-12 h-12 text-brand-primary" />
                )}
              </div>
            )}
          </motion.div>
          
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 3, repeat: Infinity }}
            className={`absolute -inset-4 ${isSK ? 'bg-blue-500/10' : isJustice ? 'bg-green-500/10' : showBranding ? 'bg-brand-danger/10' : 'bg-brand-primary/10'} rounded-full blur-[20px] -z-10`}
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <h2 className={`text-xl font-black ${isSK ? 'text-blue-200' : isJustice ? 'text-green-200' : 'text-brand-text'} tracking-[0.4em] uppercase mb-1`}>
            {isSK ? 'SK_SESSION_END' : isJustice ? 'JUSTICE_PORTAL_EXIT' : 'Terminating Session'}
          </h2>
          <p className="text-brand-muted text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
            {isSK ? 'Youth Council Protocol' : isJustice ? 'Justice Commission Secure Exit' : 'Secure Logout Protocol Active'}
          </p>
          
          <div className={`inline-flex items-center gap-3 px-4 py-2 ${isSK ? 'bg-blue-900/40 border-blue-500/20 text-blue-400' : isJustice ? 'bg-green-900/40 border-green-500/20 text-green-400' : 'bg-brand-danger/5 border-brand-danger/10 text-brand-danger'} rounded-full`}>
            <Power className="w-3 h-3 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest leading-none">Flushing Cache & Logs</span>
          </div>
        </motion.div>

        <div className="mt-20 grid grid-cols-3 gap-8 opacity-30">
          <div className="flex flex-col items-center gap-2">
            <Cpu className={`w-4 h-4 ${isSK ? 'text-blue-500' : isJustice ? 'text-green-500' : 'text-brand-danger'}`} />
            <span className="text-[7px] font-black uppercase tracking-widest">MEM_CLEAR</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ShieldAlert className={`w-4 h-4 ${isSK ? 'text-blue-500' : isJustice ? 'text-green-500' : 'text-brand-danger'}`} />
            <span className="text-[7px] font-black uppercase tracking-widest">DEAUTH</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <LogOut className={`w-4 h-4 ${isSK ? 'text-blue-500' : isJustice ? 'text-green-500' : 'text-brand-danger'}`} />
            <span className="text-[7px] font-black uppercase tracking-widest">EXIT_STABLE</span>
          </div>
        </div>
      </div>

      {/* Terminal log snippet */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-64 text-center">
         <p className={`font-mono text-[8px] ${isSK ? 'text-blue-400/40' : 'text-brand-muted/40'} uppercase leading-none truncate`}>
           LOG: DISCONNECT_SIGNAL_RECEIVED ... SIGTERM_INIT ... BYE
         </p>
      </div>
    </div>
  );
};
