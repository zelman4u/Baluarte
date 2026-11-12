import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { Bell, Search, Menu } from 'lucide-react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

import { NotificationFlyout } from '../notifications/NotificationFlyout';
import { GeminiChatFloatingButton } from '../ai/GeminiCivicAssistantModal';

export const PortalLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-brand-bg">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
    </div>
  );

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="flex min-h-screen bg-brand-bg font-sans">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <header className="h-16 bg-brand-surface border-b border-brand-border px-3 sm:px-6 md:px-8 flex items-center justify-between z-40 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-1 text-brand-muted hover:text-brand-text lg:hidden transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center interactive-click"
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3 bg-brand-bg px-3.5 py-2 rounded-lg border border-brand-border w-44 md:w-80 lg:w-96 max-w-full hidden sm:flex">
              <Search className="w-4 h-4 text-brand-muted shrink-0" />
              <input type="text" placeholder="Search operations, citizens, logs..." className="bg-transparent border-none focus:ring-0 text-xs sm:text-sm w-full text-brand-text placeholder:text-brand-muted/50" />
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-6">
            {/* Live Administrative Notifications Flyout */}
            <NotificationFlyout />
            <div className="h-8 w-[1px] bg-brand-border hidden xs:block"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold leading-none text-brand-text">{profile?.displayName}</p>
                <p className="text-[10px] text-brand-muted font-medium uppercase tracking-tight mt-1">{profile?.department} Portal</p>
              </div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-brand-primary/20 to-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-brand-primary font-bold text-sm shadow-lg shadow-brand-primary/5 shrink-0 interactive-click">
                {profile?.displayName?.charAt(0)}
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 md:p-8 relative scrollbar-hide min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-7xl mx-auto space-y-6 md:space-y-8 min-w-0"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Floating Gemini Civic Assistant */}
      <GeminiChatFloatingButton />
    </div>
  );
};
