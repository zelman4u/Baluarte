import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { auth } from './lib/firebase';
import { Shield } from 'lucide-react';
import { LoginPage } from './pages/LoginPage';
import { LandingPage } from './pages/LandingPage';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { LogoutScreen } from './components/ui/LogoutScreen';
import { PortalLayout } from './components/layout/PortalLayout';
import { Dashboard } from './pages/Dashboard';
import { ResidentsPage } from './pages/ResidentsPage';
import { HouseholdsPage } from './pages/HouseholdsPage';
import { TreasuryPage } from './pages/TreasuryPage';
import { BlotterPage } from './pages/BlotterPage';
import { HealthPage } from './pages/HealthPage';
import { YouthPage } from './pages/YouthPage';
import { RequestsPage } from './pages/RequestsPage';
import { CaseHistoryPage } from './pages/CaseHistoryPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { JusticeUnitPage } from './pages/JusticeUnitPage';
import { HealthUnitPage } from './pages/HealthUnitPage';
import { YouthUnitPage } from './pages/YouthUnitPage';

// Placeholder Components
const DRRMPlaceholder = () => <PlaceholderPage title="Disaster Risk Management" module="DRRM" description="Emergency response logistics and hazard mapping system integration." />;
const CasesPlaceholder = () => <PlaceholderPage title="Katarungang Pambarangay" module="JUSTICE" description="Mediation schedule and settlement agreement registry." />;
const YouthPlaceholder = () => <PlaceholderPage title="Youth & SK Programs" module="COMMUNITY" description="SK Project management, scholarship tracking, and youth profiling." logoPath="/assets/sk_logo.png" />;
const ProfilePlaceholder = () => <PlaceholderPage title="Authorized Identity" module="USER_CONFIG" description="Biometric credential management and portal accessibility settings." />;
const SettingsPlaceholder = () => <PlaceholderPage title="Global Configuration" module="SYSTEM" description="Baluarte Governance Portal core infrastructure settings." />;
const SecurityPlaceholder = () => <PlaceholderPage title="Public Safety Patrol" module="TANOD" description="Baluarte Security Force (Tanod) patrol logs and incident response." />;
const WelfarePlaceholder = () => <PlaceholderPage title="Social Welfare" module="SOCIAL" description="PWD, Senior Citizen, and Indigency social program tracking." />;

// App shell component for authenticated routes
const AuthenticatedShell: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);
  
  React.useEffect(() => {
    if (user && profile && !loading && isInitialLoad) {
      const timer = setTimeout(() => setIsInitialLoad(false), 2400);
      return () => clearTimeout(timer);
    }
  }, [user, profile, loading, isInitialLoad]);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-brand-bg">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" />;
  
  if (user && !profile) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-brand-bg p-6 text-center">
        <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mb-6 animate-pulse">
          <Shield className="w-8 h-8 text-brand-primary" />
        </div>
        <h2 className="text-xl font-black text-brand-text uppercase tracking-tight mb-2">Syncing Security Credentials</h2>
        <p className="text-brand-muted text-xs max-w-xs leading-relaxed uppercase tracking-widest font-bold">
          Verifying authorization token and synchronizing departmental access.
        </p>
        <div className="mt-8 flex gap-2">
           <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
           <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
           <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce"></div>
        </div>
        <button 
          onClick={() => auth.signOut()}
          className="mt-12 text-[10px] font-black text-brand-muted hover:text-brand-primary uppercase tracking-[0.2em] border-b border-brand-border pb-1"
        >
          Cancel Authentication Session
        </button>
      </div>
    );
  }

  if (!profile.isApproved) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-brand-bg p-6 text-center">
        <div className="w-16 h-16 bg-brand-warning/10 rounded-2xl flex items-center justify-center mb-6">
          <Shield className="w-8 h-8 text-brand-warning" />
        </div>
        <h2 className="text-xl font-black text-brand-text uppercase tracking-tight mb-2">Access Restricted</h2>
        <p className="text-brand-muted text-xs max-w-sm leading-relaxed uppercase tracking-widest font-bold">
          Your account for <span className="text-brand-primary">{profile.displayName}</span> is currently pending administrative verification.
        </p>
        <div className="mt-8 p-4 bg-brand-surface border border-brand-border rounded-lg max-w-xs transition-all hover:border-brand-warning/30">
          <p className="text-[9px] text-brand-muted uppercase tracking-[0.1em] font-medium leading-relaxed">
            SYSTEM_ID: {profile.uid.substring(0, 12)}...<br/>
            DEPT: {profile.department}<br/>
            STATUS: PENDING_REVIEW
          </p>
        </div>
        <button 
          onClick={() => auth.signOut()}
          className="mt-12 text-[10px] font-black text-brand-muted hover:text-brand-primary uppercase tracking-[0.2em] border-b border-brand-border pb-1"
        >
          Sign Out of Terminal
        </button>
      </div>
    );
  }

  if (isInitialLoad) {
    return <LoadingScreen role={profile?.role || 'Authorized Personnel'} />;
  }
  
  return <PortalLayout><Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/residents" element={<ResidentsPage />} />
    <Route path="/households" element={<HouseholdsPage />} />
    <Route path="/treasury" element={<TreasuryPage />} />
    <Route path="/drrm" element={<DRRMPlaceholder />} />
    <Route path="/blotter" element={<BlotterPage />} />
    <Route path="/cases" element={<CasesPlaceholder />} />
    <Route path="/case-history" element={<CaseHistoryPage />} />
    <Route path="/security" element={<SecurityPlaceholder />} />
    <Route path="/health" element={<HealthPage />} />
    <Route path="/welfare" element={<WelfarePlaceholder />} />
    <Route path="/youth" element={<YouthPage />} />
    <Route path="/requests" element={<RequestsPage />} />
    <Route path="/profile" element={<ProfilePlaceholder />} />
    <Route path="/settings" element={<SettingsPlaceholder />} />
  </Routes></PortalLayout>;
};

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-brand-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Publicly accessible landing and info pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/info/justice" element={<JusticeUnitPage />} />
      <Route path="/info/health" element={<HealthUnitPage />} />
      <Route path="/info/youth" element={<YouthUnitPage />} />
      
      {/* Specific Auth Route */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected Routes - only accessible if logged in, otherwise back to home */}
      <Route 
        path="*" 
        element={user ? <AuthenticatedShell /> : <Navigate to="/" replace />} 
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LogoutHandler />
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

const LogoutHandler: React.FC = () => {
  const { loggingOut } = useAuth();
  if (!loggingOut) return null;
  return <LogoutScreen />;
};
