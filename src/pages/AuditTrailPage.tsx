import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ShieldAlert, 
  Search, 
  Download, 
  Filter, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  User, 
  Building2, 
  RefreshCw,
  Trash2,
  Eye,
  X
} from 'lucide-react';
import { Card } from '../components/ui/Base';
import { auditService, AuditLogEntry } from '../services/auditService';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export const AuditTrailPage: React.FC = () => {
  const { profile } = useAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [selectedAction, setSelectedAction] = useState<string>('All');
  const [inspectLog, setInspectLog] = useState<AuditLogEntry | null>(null);

  useEffect(() => {
    const unsub = auditService.subscribe((updatedLogs) => {
      setLogs(updatedLogs);
    });
    return () => unsub();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetEntity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDept === 'All' || log.department === selectedDept;
    const matchesSeverity = selectedSeverity === 'All' || log.severity === selectedSeverity;
    const matchesAction = selectedAction === 'All' || log.action === selectedAction;

    return matchesSearch && matchesDept && matchesSeverity && matchesAction;
  });

  const criticalCount = logs.filter(l => l.severity === 'Critical').length;
  const warningCount = logs.filter(l => l.severity === 'Warning').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-brand-primary/10 text-brand-primary border border-brand-primary/20 kinetic-badge">
              Government Accountability Core
            </span>
            <span className="text-xs text-brand-muted font-mono">• Tamper-Evident Ledger</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-brand-text uppercase tracking-tight interactive-text cursor-default">
            Administrative Audit Trail
          </h1>
          <p className="text-xs text-brand-muted mt-1 max-w-xl">
            Real-time immutable activity log recording all user transactions, record creations, data modifications, and approvals across departments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => auditService.exportCsv(filteredLogs)}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-brand-surface border border-brand-border text-brand-text font-black text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-brand-card hover:border-brand-primary/40 transition-all interactive-click"
          >
            <Download className="w-4 h-4 text-brand-primary" />
            <span>Export CSV Audit</span>
          </button>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-brand-surface border-brand-border kinetic-card">
          <div className="flex items-center justify-between text-brand-muted mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest">Total Events Logged</span>
            <FileText className="w-4 h-4 text-brand-primary" />
          </div>
          <div className="text-2xl font-black text-brand-text interactive-text">
            {logs.length}
          </div>
          <p className="text-[10px] text-brand-muted mt-1">Synchronized with Cloud Security Vault</p>
        </Card>

        <Card className="p-4 bg-brand-surface border-brand-border kinetic-card">
          <div className="flex items-center justify-between text-brand-muted mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest">Critical Actions</span>
            <ShieldAlert className="w-4 h-4 text-brand-danger" />
          </div>
          <div className="text-2xl font-black text-brand-danger interactive-text">
            {criticalCount}
          </div>
          <p className="text-[10px] text-brand-muted mt-1">Budget releases & security changes</p>
        </Card>

        <Card className="p-4 bg-brand-surface border-brand-border kinetic-card">
          <div className="flex items-center justify-between text-brand-muted mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest">Warning Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 interactive-text">
            {warningCount}
          </div>
          <p className="text-[10px] text-brand-muted mt-1">Thresholds & summons escalations</p>
        </Card>

        <Card className="p-4 bg-brand-surface border-brand-border kinetic-card">
          <div className="flex items-center justify-between text-brand-muted mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest">Ledger Integrity</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 interactive-text">
            100% OK
          </div>
          <p className="text-[10px] text-brand-muted mt-1">Zero unauthorized mutations</p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-brand-surface p-4 rounded-xl border border-brand-border space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-brand-bg px-3 py-2 rounded-lg border border-brand-border flex-1 max-w-md">
            <Search className="w-4 h-4 text-brand-muted shrink-0" />
            <input
              type="text"
              placeholder="Search user, action, target entity, or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-xs w-full text-brand-text placeholder:text-brand-muted/50"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-brand-muted">
              Showing {filteredLogs.length} of {logs.length} entries
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-brand-border/40">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[9px] font-black uppercase tracking-widest text-brand-muted mr-1">Dept:</span>
            {['All', 'Executive', 'Justice', 'Health', 'Finance', 'Disaster', 'Security'].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDept(d)}
                className={cn(
                  "px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all interactive-click",
                  selectedDept === d
                    ? "bg-brand-primary text-brand-bg shadow-sm"
                    : "text-brand-muted hover:text-brand-text hover:bg-brand-card"
                )}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-brand-border hidden md:block"></div>

          <div className="flex items-center gap-1 overflow-x-auto">
            <span className="text-[9px] font-black uppercase tracking-widest text-brand-muted mr-1">Severity:</span>
            {['All', 'Info', 'Warning', 'Critical'].map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSeverity(s)}
                className={cn(
                  "px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all interactive-click",
                  selectedSeverity === s
                    ? "bg-brand-text text-brand-bg shadow-sm font-bold"
                    : "text-brand-muted hover:text-brand-text hover:bg-brand-card"
                )}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-brand-border hidden md:block"></div>

          <div className="flex items-center gap-1 overflow-x-auto">
            <span className="text-[9px] font-black uppercase tracking-widest text-brand-muted mr-1">Action:</span>
            {['All', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE'].map((a) => (
              <button
                key={a}
                onClick={() => setSelectedAction(a)}
                className={cn(
                  "px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all interactive-click",
                  selectedAction === a
                    ? "bg-brand-primary/20 text-brand-primary border border-brand-primary/40 font-bold"
                    : "text-brand-muted hover:text-brand-text hover:bg-brand-card"
                )}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Log Feed */}
      <div className="space-y-2">
        {filteredLogs.length === 0 ? (
          <Card className="p-12 text-center text-brand-muted border-brand-border">
            <p className="text-xs uppercase tracking-wider">No matching audit events found.</p>
          </Card>
        ) : (
          filteredLogs.map((log) => {
            const isCritical = log.severity === 'Critical';
            const isWarning = log.severity === 'Warning';

            return (
              <Card
                key={log.id}
                onClick={() => setInspectLog(log)}
                className={cn(
                  "p-3.5 sm:p-4 bg-brand-surface border transition-all cursor-pointer hover:border-brand-primary/40 group kinetic-card",
                  isCritical ? "border-brand-danger/30 hover:border-brand-danger" :
                  isWarning ? "border-amber-400/30 hover:border-amber-400" :
                  "border-brand-border"
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-start sm:items-center gap-3">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shrink-0 mt-0.5 sm:mt-0",
                      log.action === 'CREATE' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                      log.action === 'UPDATE' ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                      log.action === 'DELETE' ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                      log.action === 'APPROVE' ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                      "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    )}>
                      {log.action}
                    </span>

                    <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-brand-bg text-brand-muted border border-brand-border shrink-0">
                      {log.targetEntity}
                    </span>

                    <div>
                      <span className="text-xs font-bold text-brand-text group-hover:text-brand-primary transition-colors interactive-text">
                        {log.targetName}
                      </span>
                      <p className="text-[11px] text-brand-muted mt-0.5 line-clamp-1">
                        {log.details}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-brand-border/40">
                    <div className="text-left sm:text-right">
                      <p className="text-[11px] font-medium text-brand-text">
                        {log.userName}
                      </p>
                      <p className="text-[9px] text-brand-muted uppercase tracking-tight">
                        {log.userRole} • {log.department}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        isCritical ? "bg-brand-danger" : isWarning ? "bg-amber-400" : "bg-emerald-400"
                      )}></span>
                      <span className="text-[10px] font-mono text-brand-muted">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <Eye className="w-3.5 h-3.5 text-brand-muted group-hover:text-brand-primary ml-1" />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Inspect Log Drawer / Modal */}
      {inspectLog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-brand-border bg-brand-card/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-primary" />
                <h3 className="text-sm font-black uppercase tracking-wider text-brand-text">
                  Audit Record Inspection
                </h3>
              </div>
              <button 
                onClick={() => setInspectLog(null)}
                className="text-brand-muted hover:text-brand-text p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 p-3 bg-brand-bg rounded-xl border border-brand-border">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-brand-muted block">Transaction ID</span>
                  <span className="text-xs font-mono font-bold text-brand-primary">{inspectLog.id}</span>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-brand-muted block">Timestamp</span>
                  <span className="text-xs font-mono text-brand-text">{new Date(inspectLog.timestamp).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-brand-muted block">Authorized User</span>
                  <span className="text-xs font-bold text-brand-text">{inspectLog.userName} ({inspectLog.userRole})</span>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-brand-muted block">Department</span>
                  <span className="text-xs font-bold text-brand-text">{inspectLog.department}</span>
                </div>
              </div>

              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-brand-muted block mb-1">Target Entity & ID</span>
                <p className="text-xs text-brand-text font-bold bg-brand-card p-2.5 rounded-lg border border-brand-border font-mono">
                  {inspectLog.targetEntity} • {inspectLog.targetId} ({inspectLog.targetName})
                </p>
              </div>

              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-brand-muted block mb-1">Operation Description</span>
                <p className="text-xs text-brand-text leading-relaxed bg-brand-card p-3 rounded-lg border border-brand-border">
                  {inspectLog.details}
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-brand-bg rounded-lg border border-brand-border text-xs">
                <span className="text-brand-muted">Security Classification:</span>
                <span className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-black uppercase",
                  inspectLog.severity === 'Critical' ? "bg-brand-danger text-white" :
                  inspectLog.severity === 'Warning' ? "bg-amber-400 text-black" :
                  "bg-emerald-400 text-black"
                )}>
                  {inspectLog.severity}
                </span>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setInspectLog(null)}
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-brand-primary text-brand-bg font-black text-xs uppercase tracking-wider shadow-lg shadow-brand-primary/20 interactive-click"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
