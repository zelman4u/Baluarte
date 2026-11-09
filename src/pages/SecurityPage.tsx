import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Radio, 
  Users, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Search, 
  MapPin, 
  PhoneCall,
  Calendar,
  Shield,
  FileText
} from 'lucide-react';
import { Card } from '../components/ui/Base';
import { auditService } from '../services/auditService';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

interface PatrolLog {
  id: string;
  callsign: string;
  leadOfficer: string;
  zone: string;
  shift: 'Morning (0600-1400)' | 'Afternoon (1400-2200)' | 'Night Watch (2200-0600)';
  status: 'Active Patrol' | 'Completed' | 'Incident Handled';
  observations: string;
  equipmentChecked: string[];
  timestamp: string;
}

const INITIAL_LOGS: PatrolLog[] = [
  {
    id: 'PAT-2026-081',
    callsign: 'Baluarte-Alpha-1',
    leadOfficer: 'Officer Ramon D. Valderama',
    zone: 'Zone 1 Riverside & Spillway dike',
    shift: 'Night Watch (2200-0600)',
    status: 'Active Patrol',
    observations: 'River water level normal. Perimeter gate locked at 2300 hrs. Zero youth curfew violations noted.',
    equipmentChecked: ['Handheld Radio Ch-4', 'Heavy Duty Flashlight', 'First Aid Kit', 'Reflective Vest'],
    timestamp: '23:45 Today'
  },
  {
    id: 'PAT-2026-080',
    callsign: 'Baluarte-Bravo-2',
    leadOfficer: 'Officer Danilo Cruz',
    zone: 'Zone 3 Commercial Corridor & Market',
    shift: 'Afternoon (1400-2200)',
    status: 'Completed',
    observations: 'Monitored traffic congestion along National Highway corner. Assisted elderly pedestrian across crossing.',
    equipmentChecked: ['Handheld Radio Ch-2', 'Traffic Whistle', 'Baton'],
    timestamp: '21:30 Today'
  },
  {
    id: 'PAT-2026-079',
    callsign: 'Baluarte-Charlie-3',
    leadOfficer: 'Officer Joselito Reyes',
    zone: 'Zone 4 School District & Coastal Road',
    shift: 'Morning (0600-1400)',
    status: 'Incident Handled',
    observations: 'Minor neighbor noise dispute resolved peacefully with informal reminder. No formal blotter requested.',
    equipmentChecked: ['Handheld Radio Ch-1', 'Logbook', 'Body Camera'],
    timestamp: '11:15 Today'
  }
];

export const SecurityPage: React.FC = () => {
  const { profile } = useAuth();
  const [logs, setLogs] = useState<PatrolLog[]>(INITIAL_LOGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShift, setSelectedShift] = useState<string>('All');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newLog, setNewLog] = useState({
    callsign: 'Baluarte-Delta-4',
    leadOfficer: '',
    zone: 'Zone 2 Central Poblacion',
    shift: 'Morning (0600-1400)' as PatrolLog['shift'],
    observations: '',
    equipment: 'Handheld Radio, Flashlight, Medical Kit'
  });

  const handleCreateLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLog.leadOfficer || !newLog.observations) return;

    const created: PatrolLog = {
      id: `PAT-2026-${String(logs.length + 82).padStart(3, '0')}`,
      callsign: newLog.callsign,
      leadOfficer: newLog.leadOfficer,
      zone: newLog.zone,
      shift: newLog.shift,
      status: 'Active Patrol',
      observations: newLog.observations,
      equipmentChecked: newLog.equipment.split(',').map(s => s.trim()),
      timestamp: 'Just now'
    };

    setLogs([created, ...logs]);
    setShowNewModal(false);

    // Audit log
    auditService.logAction({
      userId: profile?.uid || 'security-officer',
      userName: profile?.displayName || 'Tanod Dispatcher',
      userEmail: profile?.email || 'security@baluarte.gov.ph',
      userRole: profile?.role || 'Security Force',
      department: 'Security',
      action: 'CREATE',
      targetEntity: 'Security',
      targetId: created.id,
      targetName: `${created.callsign} - ${created.zone}`,
      details: `Dispatched patrol unit led by ${created.leadOfficer}.`,
      severity: 'Info'
    });

    notificationService.addNotification({
      title: 'New Tanod Patrol Dispatched',
      message: `${created.callsign} deployed to ${created.zone} (${created.shift}).`,
      category: 'system',
      severity: 'info',
      department: 'Security',
      actionUrl: '/security'
    });

    setNewLog({
      callsign: 'Baluarte-Echo-5',
      leadOfficer: '',
      zone: 'Zone 1 Riverside & Spillway dike',
      shift: 'Afternoon (1400-2200)',
      observations: '',
      equipment: 'Handheld Radio, Flashlight, First Aid'
    });
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.callsign.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.leadOfficer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.observations.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesShift = selectedShift === 'All' || log.shift.includes(selectedShift);
    return matchesSearch && matchesShift;
  });

  return (
    <div className="space-y-6">
      {/* Header with kinetic text */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-brand-primary/10 text-brand-primary border border-brand-primary/20 kinetic-badge">
              Public Safety Command
            </span>
            <span className="text-xs text-brand-muted font-mono">• 24/7 Tanod Watch</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-brand-text uppercase tracking-tight interactive-text cursor-default">
            Baluarte Security & Patrol Logs
          </h1>
          <p className="text-xs text-brand-muted mt-1 max-w-xl">
            Real-time deployment roster, surveillance checkpoint sweeps, and peacekeeping field dispatches.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewModal(true)}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-brand-primary text-brand-bg font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90 interactive-click"
          >
            <Plus className="w-4 h-4" />
            <span>Dispatch Patrol Unit</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-brand-surface border-brand-border kinetic-card">
          <div className="flex items-center justify-between text-brand-muted mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest">Active Units</span>
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-brand-text interactive-text">
            {logs.filter(l => l.status === 'Active Patrol').length} On Beat
          </div>
          <p className="text-[10px] text-brand-muted mt-1">Zone 1 & Zone 3 patrol sweeps</p>
        </Card>

        <Card className="p-4 bg-brand-surface border-brand-border kinetic-card">
          <div className="flex items-center justify-between text-brand-muted mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest">Total Tanod Force</span>
            <Users className="w-4 h-4 text-brand-primary" />
          </div>
          <div className="text-2xl font-black text-brand-text interactive-text">
            24 Officers
          </div>
          <p className="text-[10px] text-brand-muted mt-1">3 rotating 8-hour shifts</p>
        </Card>

        <Card className="p-4 bg-brand-surface border-brand-border kinetic-card">
          <div className="flex items-center justify-between text-brand-muted mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest">Dispatches Today</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-brand-text interactive-text">
            {logs.length} Runs
          </div>
          <p className="text-[10px] text-brand-muted mt-1">100% equipment checked</p>
        </Card>

        <Card className="p-4 bg-brand-surface border-brand-border kinetic-card">
          <div className="flex items-center justify-between text-brand-muted mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest">Emergency Hotline</span>
            <PhoneCall className="w-4 h-4 text-brand-primary" />
          </div>
          <div className="text-2xl font-black text-brand-text interactive-text">
            0917-882-5827
          </div>
          <p className="text-[10px] text-brand-muted mt-1">Baluarte Tanod Base Radio VHF 145.850</p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-brand-surface p-3 rounded-xl border border-brand-border">
        <div className="flex items-center gap-2 bg-brand-bg px-3 py-2 rounded-lg border border-brand-border flex-1 max-w-md">
          <Search className="w-4 h-4 text-brand-muted shrink-0" />
          <input
            type="text"
            placeholder="Search by callsign, officer, zone, or incident..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-xs w-full text-brand-text placeholder:text-brand-muted/50"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Morning', 'Afternoon', 'Night'].map((shift) => (
            <button
              key={shift}
              onClick={() => setSelectedShift(shift)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all min-h-[36px] interactive-click",
                selectedShift === shift
                  ? "bg-brand-primary text-brand-bg shadow-sm"
                  : "text-brand-muted hover:text-brand-text hover:bg-brand-card"
              )}
            >
              {shift}
            </button>
          ))}
        </div>
      </div>

      {/* Patrol Log Entries */}
      <div className="space-y-3">
        {filteredLogs.map((log) => (
          <Card key={log.id} className="p-4 md:p-5 bg-brand-surface border-brand-border hover:border-brand-primary/30 transition-all kinetic-card">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-primary">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-brand-primary interactive-text">
                      {log.callsign}
                    </span>
                    <span className="text-[10px] font-mono text-brand-muted">
                      ({log.id})
                    </span>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider",
                      log.status === 'Active Patrol' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                      log.status === 'Incident Handled' ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                      "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    )}>
                      {log.status}
                    </span>
                  </div>
                  <p className="text-xs text-brand-text font-bold mt-0.5">
                    Lead: {log.leadOfficer} • <span className="text-brand-muted">{log.shift}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-brand-muted">
                <MapPin className="w-3.5 h-3.5 text-brand-primary" />
                <span className="font-medium text-brand-text">{log.zone}</span>
                <span className="text-brand-muted font-mono">• {log.timestamp}</span>
              </div>
            </div>

            <p className="text-xs text-brand-muted leading-relaxed bg-brand-bg/60 p-3 rounded-lg border border-brand-border/50 mb-3">
              {log.observations}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-brand-border/40 text-[10px]">
              <div className="flex flex-wrap items-center gap-1.5 text-brand-muted">
                <span className="font-black uppercase tracking-widest text-[9px]">Verified Equipment:</span>
                {log.equipmentChecked.map((item, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-brand-card text-brand-text border border-brand-border">
                    {item}
                  </span>
                ))}
              </div>

              <button
                onClick={() => {
                  auditService.logAction({
                    userId: profile?.uid || 'security-officer',
                    userName: profile?.displayName || 'Officer',
                    userEmail: profile?.email || 'security@baluarte.gov.ph',
                    userRole: profile?.role || 'Security Force',
                    department: 'Security',
                    action: 'UPDATE',
                    targetEntity: 'Security',
                    targetId: log.id,
                    targetName: log.callsign,
                    details: `Turnover signoff completed for ${log.callsign} (${log.zone}).`,
                    severity: 'Info'
                  });
                  setLogs(logs.map(l => l.id === log.id ? { ...l, status: 'Completed' } : l));
                }}
                disabled={log.status === 'Completed'}
                className={cn(
                  "min-h-[36px] px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all interactive-click",
                  log.status === 'Completed'
                    ? "opacity-50 text-brand-muted cursor-not-allowed"
                    : "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30"
                )}
              >
                {log.status === 'Completed' ? 'Logged & Completed' : 'Acknowledge Shift Signoff'}
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* New Dispatch Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-brand-border bg-brand-card/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-primary" />
                <h3 className="text-sm font-black uppercase tracking-wider text-brand-text">
                  Dispatch Field Patrol Unit
                </h3>
              </div>
              <button 
                onClick={() => setShowNewModal(false)}
                className="text-brand-muted hover:text-brand-text p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLog} className="p-5 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block mb-1">
                  Patrol Callsign
                </label>
                <input
                  type="text"
                  required
                  value={newLog.callsign}
                  onChange={(e) => setNewLog({ ...newLog, callsign: e.target.value })}
                  className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-text focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block mb-1">
                  Lead Tanod Officer
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Officer Carlos Mendoza"
                  value={newLog.leadOfficer}
                  onChange={(e) => setNewLog({ ...newLog, leadOfficer: e.target.value })}
                  className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-text focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block mb-1">
                    Designated Zone
                  </label>
                  <select
                    value={newLog.zone}
                    onChange={(e) => setNewLog({ ...newLog, zone: e.target.value })}
                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-text focus:outline-none focus:border-brand-primary"
                  >
                    <option value="Zone 1 Riverside & Spillway dike">Zone 1 Riverside</option>
                    <option value="Zone 2 Central Poblacion">Zone 2 Central Poblacion</option>
                    <option value="Zone 3 Commercial Corridor & Market">Zone 3 Commercial Corridor</option>
                    <option value="Zone 4 School District & Coastal Road">Zone 4 School District</option>
                    <option value="Zone 5 Upper Baluarte Foothills">Zone 5 Upper Baluarte</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block mb-1">
                    Shift Assignment
                  </label>
                  <select
                    value={newLog.shift}
                    onChange={(e) => setNewLog({ ...newLog, shift: e.target.value as PatrolLog['shift'] })}
                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-text focus:outline-none focus:border-brand-primary"
                  >
                    <option value="Morning (0600-1400)">Morning (0600-1400)</option>
                    <option value="Afternoon (1400-2200)">Afternoon (1400-2200)</option>
                    <option value="Night Watch (2200-0600)">Night Watch (2200-0600)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block mb-1">
                  Patrol Mission / Field Observations
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Details of deployment, focus areas, curfew checkpoints..."
                  value={newLog.observations}
                  onChange={(e) => setNewLog({ ...newLog, observations: e.target.value })}
                  className="w-full bg-brand-bg border border-brand-border rounded-lg p-3 text-xs text-brand-text focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block mb-1">
                  Issued Equipment (comma separated)
                </label>
                <input
                  type="text"
                  value={newLog.equipment}
                  onChange={(e) => setNewLog({ ...newLog, equipment: e.target.value })}
                  className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-text focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-brand-muted hover:text-brand-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-brand-primary text-brand-bg font-black text-xs uppercase tracking-wider shadow-lg shadow-brand-primary/20 interactive-click"
                >
                  Confirm Deployment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
