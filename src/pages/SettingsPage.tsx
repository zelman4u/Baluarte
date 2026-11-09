import React, { useState } from 'react';
import { 
  Settings, 
  Building2, 
  Shield, 
  Coins, 
  Bell, 
  Save, 
  CheckCircle, 
  AlertTriangle, 
  Radio, 
  FileText,
  Sliders,
  Database
} from 'lucide-react';
import { Card } from '../components/ui/Base';
import { auditService } from '../services/auditService';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export const SettingsPage: React.FC = () => {
  const { profile } = useAuth();
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [settings, setSettings] = useState({
    barangayName: 'Barangay Baluarte',
    municipality: 'Municipality of Tagoloan',
    province: 'Misamis Oriental',
    punongBarangay: 'Hon. Roberto V. Gomez',
    clearanceFee: 50,
    residencyCertFee: 40,
    indigencyCertFee: 0,
    businessPermitBaseFee: 500,
    curfewStart: '22:00',
    curfewEnd: '04:00',
    drrmAlertStage: 'Stage 1 (Normal Preparedness)',
    enableSmsAlerts: true,
    enableAutomaticAudit: true,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);

    auditService.logAction({
      userId: profile?.uid || 'admin',
      userName: profile?.displayName || 'Administrator',
      userEmail: profile?.email || 'admin@baluarte.gov.ph',
      userRole: profile?.role || 'Captain',
      department: 'Administration',
      action: 'UPDATE',
      targetEntity: 'System',
      targetId: 'CONFIG-GLOBAL',
      targetName: 'Barangay Governance Parameters',
      details: `Updated clearance fees (₱${settings.clearanceFee}) and curfew hours (${settings.curfewStart}-${settings.curfewEnd}).`,
      severity: 'Critical'
    });

    notificationService.addNotification({
      title: 'Governance Parameters Updated',
      message: 'Global regulatory fee schedules and curfew timings synchronized across all terminals.',
      category: 'system',
      severity: 'info',
      department: 'Administration',
      actionUrl: '/settings'
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-brand-primary/10 text-brand-primary border border-brand-primary/20 kinetic-badge">
              Master Configuration
            </span>
            <span className="text-xs text-brand-muted font-mono">• Baluarte Operating Matrix</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-brand-text uppercase tracking-tight interactive-text cursor-default">
            Global Governance Settings
          </h1>
          <p className="text-xs text-brand-muted mt-1 max-w-xl">
            Configure jurisdiction legal identity, statutory fee tariffs, DRRM disaster escalation thresholds, and audit parameters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/audit-trail"
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-brand-surface border border-brand-border text-brand-text font-black text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-brand-card hover:border-brand-primary/40 transition-all interactive-click"
          >
            <FileText className="w-4 h-4 text-brand-primary" />
            <span>View Audit Trail</span>
          </Link>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4" />
          <span>System configuration parameters committed and active across all departments.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Jurisdiction Identity */}
        <Card className="p-5 md:p-6 bg-brand-surface border-brand-border kinetic-card">
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-brand-border">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-brand-text interactive-text">
                Barangay Legal Jurisdiction & Officials
              </h3>
              <p className="text-[11px] text-brand-muted">
                Official headers shown on generated clearances, indigent certificates, and blotter dockets.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block mb-1">
                Barangay Name
              </label>
              <input
                type="text"
                value={settings.barangayName}
                onChange={(e) => setSettings({ ...settings, barangayName: e.target.value })}
                className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-text font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block mb-1">
                Municipality / City
              </label>
              <input
                type="text"
                value={settings.municipality}
                onChange={(e) => setSettings({ ...settings, municipality: e.target.value })}
                className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-text font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block mb-1">
                Province
              </label>
              <input
                type="text"
                value={settings.province}
                onChange={(e) => setSettings({ ...settings, province: e.target.value })}
                className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-text font-bold"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block mb-1">
              Incumbent Punong Barangay (Barangay Captain)
            </label>
            <input
              type="text"
              value={settings.punongBarangay}
              onChange={(e) => setSettings({ ...settings, punongBarangay: e.target.value })}
              className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-text font-bold"
            />
          </div>
        </Card>

        {/* Treasury Fee Schedule */}
        <Card className="p-5 md:p-6 bg-brand-surface border-brand-border kinetic-card">
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-brand-border">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-brand-text interactive-text">
                Statutory Revenue & Fee Schedule
              </h3>
              <p className="text-[11px] text-brand-muted">
                Standard fees collected and recorded by the Barangay Treasury.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block mb-1">
                Barangay Clearance (₱)
              </label>
              <input
                type="number"
                value={settings.clearanceFee}
                onChange={(e) => setSettings({ ...settings, clearanceFee: Number(e.target.value) })}
                className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-text font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block mb-1">
                Residency Cert (₱)
              </label>
              <input
                type="number"
                value={settings.residencyCertFee}
                onChange={(e) => setSettings({ ...settings, residencyCertFee: Number(e.target.value) })}
                className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-text font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block mb-1">
                Indigency Certificate (₱)
              </label>
              <input
                type="number"
                value={settings.indigencyCertFee}
                onChange={(e) => setSettings({ ...settings, indigencyCertFee: Number(e.target.value) })}
                className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-text font-mono font-bold"
              />
              <span className="text-[9px] text-emerald-400 mt-0.5 block">Statutory Free for Indigents</span>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block mb-1">
                Commercial Permit Base (₱)
              </label>
              <input
                type="number"
                value={settings.businessPermitBaseFee}
                onChange={(e) => setSettings({ ...settings, businessPermitBaseFee: Number(e.target.value) })}
                className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-text font-mono font-bold"
              />
            </div>
          </div>
        </Card>

        {/* Public Safety & DRRM Parameters */}
        <Card className="p-5 md:p-6 bg-brand-surface border-brand-border kinetic-card">
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-brand-border">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-brand-text interactive-text">
                Public Order & Disaster Protocols
              </h3>
              <p className="text-[11px] text-brand-muted">
                Curfew hours enforced by Tanod units and baseline DRRM preparedness stages.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block mb-1">
                Curfew Start Time
              </label>
              <input
                type="time"
                value={settings.curfewStart}
                onChange={(e) => setSettings({ ...settings, curfewStart: e.target.value })}
                className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-text font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block mb-1">
                Curfew End Time
              </label>
              <input
                type="time"
                value={settings.curfewEnd}
                onChange={(e) => setSettings({ ...settings, curfewEnd: e.target.value })}
                className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-text font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block mb-1">
                Active DRRM Alert Stage
              </label>
              <select
                value={settings.drrmAlertStage}
                onChange={(e) => setSettings({ ...settings, drrmAlertStage: e.target.value })}
                className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-text font-bold"
              >
                <option value="Stage 1 (Normal Preparedness)">Stage 1 (Normal Preparedness)</option>
                <option value="Stage 2 (White Alert - Pre-Disaster)">Stage 2 (White Alert - Pre-Disaster)</option>
                <option value="Stage 3 (Blue Alert - Readiness)">Stage 3 (Blue Alert - Readiness)</option>
                <option value="Stage 4 (Red Alert - Forced Evacuation)">Stage 4 (Red Alert - Forced Evacuation)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-brand-primary text-brand-bg font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90 transition-all interactive-click"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};
