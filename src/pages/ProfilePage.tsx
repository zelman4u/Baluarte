import React, { useState } from 'react';
import { 
  User, 
  Shield, 
  Key, 
  Clock, 
  CheckCircle, 
  FileText, 
  LogOut, 
  Award,
  Building2,
  Mail,
  Fingerprint
} from 'lucide-react';
import { Card } from '../components/ui/Base';
import { useAuth } from '../context/AuthContext';
import { auditService } from '../services/auditService';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { profile, user, logout } = useAuth();
  const [copied, setCopied] = useState(false);

  const copySessionToken = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(`AUTH-BALUARTE-${user.uid}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-brand-primary/10 text-brand-primary border border-brand-primary/20 kinetic-badge">
              Personnel Credentials
            </span>
            <span className="text-xs text-brand-muted font-mono">• Cryptographic ID</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-brand-text uppercase tracking-tight interactive-text cursor-default">
            Authorized Personnel Identity
          </h1>
          <p className="text-xs text-brand-muted mt-1 max-w-xl">
            Verified municipal governance credentials, departmental privilege clearance, and security session controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={logout}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-brand-danger/10 border border-brand-danger/20 text-brand-danger font-black text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-brand-danger/20 transition-all interactive-click"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </div>

      {/* Main Profile Identity Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 bg-brand-surface border-brand-border text-center flex flex-col items-center justify-center kinetic-card">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-brand-primary/20 to-brand-primary/5 border-2 border-brand-primary/40 flex items-center justify-center text-3xl font-black text-brand-primary shadow-xl shadow-brand-primary/10">
              {profile?.displayName?.charAt(0) || 'U'}
            </div>
            <div className="absolute -bottom-2 -right-2 p-1.5 bg-emerald-500 rounded-full border-2 border-brand-surface text-black">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>

          <h2 className="text-lg font-black text-brand-text interactive-text">
            {profile?.displayName || 'Authorized User'}
          </h2>
          <p className="text-xs font-mono text-brand-primary font-bold mt-0.5 uppercase tracking-wide">
            {profile?.role || 'Staff'} • {profile?.department || 'Administration'}
          </p>
          <p className="text-[11px] text-brand-muted mt-1">
            {user?.email || profile?.email || 'officer@baluarte.gov.ph'}
          </p>

          <div className="mt-6 w-full pt-6 border-t border-brand-border space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-brand-muted">Account Status:</span>
              <span className="text-emerald-400 font-bold uppercase text-[10px]">Verified & Active</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-brand-muted">Authority Level:</span>
              <span className="text-brand-primary font-bold font-mono text-[10px]">
                {profile?.role === 'Captain' ? 'LEVEL 5 (PB EXECUTIVE)' : 'LEVEL 3 (DEPT OFFICER)'}
              </span>
            </div>
          </div>

          <button
            onClick={copySessionToken}
            className="mt-5 w-full py-2 px-3 rounded-lg bg-brand-card hover:bg-brand-bg text-brand-muted hover:text-brand-text text-[10px] font-mono border border-brand-border flex items-center justify-center gap-2 interactive-click"
          >
            <Key className="w-3.5 h-3.5 text-brand-primary" />
            <span>{copied ? 'Copied Security Token!' : 'Copy Terminal Token'}</span>
          </button>
        </Card>

        {/* Security Permissions and Department Clearance */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6 bg-brand-surface border-brand-border kinetic-card">
            <h3 className="text-xs font-black uppercase tracking-wider text-brand-text mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-primary" />
              <span>Departmental Security Clearance Matrix</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-brand-bg rounded-lg border border-brand-border">
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted block mb-1">
                  Katarungang Pambarangay
                </span>
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Mediation Summons & Hearing Dockets
                </span>
              </div>

              <div className="p-3 bg-brand-bg rounded-lg border border-brand-border">
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted block mb-1">
                  Treasury & Disbursements
                </span>
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Fee Assessment & Ledger Access
                </span>
              </div>

              <div className="p-3 bg-brand-bg rounded-lg border border-brand-border">
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted block mb-1">
                  DRRM & Evacuation Dispatch
                </span>
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Logistics & Command Center
                </span>
              </div>

              <div className="p-3 bg-brand-bg rounded-lg border border-brand-border">
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted block mb-1">
                  Social Welfare (AICS)
                </span>
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Indigent Voucher Authorization
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-brand-surface border-brand-border kinetic-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-brand-text flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-brand-primary" />
                <span>Session Audit Trail History</span>
              </h3>
              <Link
                to="/audit-trail"
                className="text-[10px] font-bold text-brand-primary hover:underline uppercase"
              >
                View Full Audit
              </Link>
            </div>

            <p className="text-xs text-brand-muted leading-relaxed mb-4">
              All transactions executed under this identity token are cryptographically stamped with client IP, timestamp, and action diffs to ensure full DILG compliance.
            </p>

            <div className="p-3 bg-brand-bg rounded-lg border border-brand-border text-xs flex items-center justify-between">
              <div>
                <span className="text-brand-text font-bold">Terminal Session ID:</span>
                <span className="text-brand-muted font-mono ml-2">BALUARTE-NODE-01</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                ACTIVE
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
