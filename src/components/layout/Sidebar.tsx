import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  ShieldCheck, 
  Stethoscope, 
  Compass, 
  Settings, 
  LogOut,
  Bell,
  Scale,
  Activity,
  Heart,
  TrendingUp,
  History,
  Map,
  MessageSquare,
  AlertTriangle,
  Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../lib/firebase';
import { cn } from '../../lib/utils';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  department?: string[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  // Administration
  { label: 'Residents', icon: Users, path: '/residents', department: ['Administration', 'Health', 'Justice', 'Youth'] },
  { label: 'Households', icon: Building2, path: '/households', department: ['Administration'] },
  { label: 'Treasury', icon: TrendingUp, path: '/treasury', department: ['Administration'] },
  { label: 'DRRM', icon: AlertTriangle, path: '/drrm', department: ['Administration'] },
  // Justice
  { label: 'Blotter', icon: FileText, path: '/blotter', department: ['Justice', 'Administration'] },
  { label: 'Cases', icon: Scale, path: '/cases', department: ['Justice', 'Administration'] },
  { label: 'Case History', icon: History, path: '/case-history', department: ['Justice', 'Administration'] },
  { label: 'Tanod Logs', icon: ShieldCheck, path: '/security', department: ['Justice', 'Administration'] },
  // Health
  { label: 'Medical Records', icon: Stethoscope, path: '/health', department: ['Health', 'Administration'] },
  { label: 'Social Welfare', icon: Heart, path: '/welfare', department: ['Health', 'Administration'] },
  // Youth
  { label: 'Youth Programs', icon: Compass, path: '/youth', department: ['Youth', 'Administration'] },
  // Resident
  { label: 'My Requests', icon: MessageSquare, path: '/requests', department: ['Resident', 'Administration'] },
  { label: 'Profile', icon: Settings, path: '/profile' },
];

export const Sidebar: React.FC = () => {
  const { profile, logout } = useAuth();
  const location = useLocation();
  
  const filteredNav = navItems.filter(item => 
    !item.department || (profile && item.department.includes(profile.department))
  );

  const isSK = profile?.department === 'Youth' && profile?.role === 'SKOfficial';
  const isAdmin = profile?.department === 'Administration' && (profile?.role === 'Captain' || profile?.role === 'Secretary');
  const logoUrl = isSK 
    ? "https://lh3.googleusercontent.com/d/1x8riK__Rn53iKzwbvEUapuNuQmNUwC33=s1000"
    : "https://lh3.googleusercontent.com/d/15qEeMZnaeEI052MdJrFujHjkxcKJMHku=s1000";

  return (
    <aside id="sidebar" className="fixed left-0 top-0 h-screen w-64 bg-brand-surface text-brand-text flex flex-col z-50 border-r border-brand-border lg:translate-x-0 -translate-x-full lg:static transition-shadow duration-300">
      <div className="p-6 flex items-center gap-3 shrink-0">
        <div className="w-12 h-12 flex items-center justify-center shrink-0">
          {(isSK || isAdmin) ? (
            <img 
              src={logoUrl} 
              alt="Barangay Logo" 
              referrerPolicy="no-referrer"
              className="w-12 h-12 object-contain rounded-full drop-shadow-md" 
              onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/100/1e1e1e/58a6ff?text=B" }} 
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-brand-bg flex items-center justify-center border border-brand-border">
              {profile?.department === 'Justice' ? (
                <Scale className="w-6 h-6 text-brand-primary" />
              ) : (
                <Building2 className="w-6 h-6 text-brand-primary" />
              )}
            </div>
          )}
        </div>
        <div className="overflow-hidden">
          <h1 className="font-bold text-sm leading-tight text-brand-primary truncate">Barangay Baluarte</h1>
          <p className="text-[10px] text-brand-muted uppercase tracking-widest font-semibold font-mono truncate">Governance System</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto scrollbar-hide">
        <div className="px-4 py-3 text-[10px] uppercase tracking-widest text-brand-muted/70 font-black">Core Modules</div>
        {filteredNav.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all group border",
              location.pathname === item.path 
                ? "bg-brand-bg text-brand-primary border-brand-border font-bold shadow-sm" 
                : "text-brand-muted hover:bg-brand-card hover:text-brand-text border-transparent"
            )}
          >
            <item.icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", location.pathname === item.path ? "text-brand-primary" : "text-brand-muted group-hover:text-brand-text")} />
            <span className="text-xs truncate">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-brand-border bg-brand-bg/30">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-brand-border flex items-center justify-center text-xs font-bold border border-brand-primary/30">
            {profile?.displayName?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold truncate text-brand-text">{profile?.displayName || 'User'}</p>
            <p className="text-[10px] text-brand-muted truncate uppercase tracking-tighter uppercase">{profile?.role || 'Guest'}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-brand-muted hover:bg-brand-danger/10 hover:text-brand-danger transition-all mt-2"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-xs font-bold">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
