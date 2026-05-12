import React from 'react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { Bell, Search } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export const PortalLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, loading } = useAuth();

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="flex min-h-screen bg-brand-bg font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-brand-surface border-b border-brand-border px-8 flex items-center justify-between z-40 shrink-0">
          <div className="flex items-center gap-4 bg-brand-bg px-4 py-2 rounded-lg border border-brand-border w-96 max-w-full">
            <Search className="w-4 h-4 text-brand-muted" />
            <input type="text" placeholder="Search operations, files, sessions..." className="bg-transparent border-none focus:ring-0 text-sm w-full text-brand-text placeholder:text-brand-muted/50" />
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-brand-muted hover:text-brand-text transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-brand-danger rounded-full border-2 border-brand-surface"></span>
            </button>
            <div className="h-8 w-[1px] bg-brand-border"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold leading-none text-brand-text">{profile?.displayName}</p>
                <p className="text-[10px] text-brand-muted font-medium uppercase tracking-tight mt-1">{profile?.department} Portal</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary/20 to-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-brand-primary font-bold text-sm shadow-lg shadow-brand-primary/5">
                {profile?.displayName?.charAt(0)}
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-8 relative scrollbar-hide">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
