import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  department: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'APPROVE' | 'EXPORT' | 'LOGIN';
  targetEntity: 'Resident' | 'Household' | 'Case' | 'Blotter' | 'Welfare' | 'Treasury' | 'Youth' | 'DRRM' | 'Security' | 'System';
  targetId: string;
  targetName: string;
  details: string;
  severity: 'Info' | 'Warning' | 'Critical';
  diff?: Record<string, any>;
  timestamp: string;
}

const STORAGE_KEY = 'baluarte_audit_trail_v2';

const DEFAULT_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-001',
    userId: 'usr-admin-1',
    userName: 'Hon. Roberto Gomez',
    userEmail: 'pb.gomez@baluarte.gov.ph',
    userRole: 'Punong Barangay',
    department: 'Executive',
    action: 'CREATE',
    targetEntity: 'Case',
    targetId: 'KP-2026-0012',
    targetName: 'Boundary Line & Encroachment',
    details: 'Docketed initial complaint for mediation under Katarungang Pambarangay.',
    severity: 'Info',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'aud-002',
    userId: 'usr-tres-1',
    userName: 'Hon. Elena Morales',
    userEmail: 'treasury@baluarte.gov.ph',
    userRole: 'Treasurer',
    department: 'Finance',
    action: 'CREATE',
    targetEntity: 'Treasury',
    targetId: 'TX-8821',
    targetName: 'Permit Fees Collection (₱45,000)',
    details: 'Logged collection voucher for Q4 commercial regulatory compliance.',
    severity: 'Info',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'aud-003',
    userId: 'usr-drrm-1',
    userName: 'Officer Dan Garcia',
    userEmail: 'drrm@baluarte.gov.ph',
    userRole: 'DRRM Coordinator',
    department: 'Disaster',
    action: 'STATUS_CHANGE',
    targetEntity: 'DRRM',
    targetId: 'EVAC-01',
    targetName: 'Baluarte Central Multi-Purpose Evacuation Gym',
    details: 'Escalated facility readiness to White Alert Standby for monsoon surge.',
    severity: 'Warning',
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString()
  }
];

class AuditService {
  private localLogs: AuditLogEntry[] = [];
  private listeners: ((logs: AuditLogEntry[]) => void)[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.localLogs = JSON.parse(stored);
      } else {
        this.localLogs = [...DEFAULT_AUDIT_LOGS];
        this.saveToStorage();
      }
    } catch {
      this.localLogs = [...DEFAULT_AUDIT_LOGS];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.localLogs.slice(0, 500)));
    } catch (e) {
      console.warn('Audit storage quota reached:', e);
    }
    this.notify();
  }

  private notify() {
    this.listeners.forEach(cb => cb([...this.localLogs]));
  }

  public subscribe(callback: (logs: AuditLogEntry[]) => void): () => void {
    callback([...this.localLogs]);
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  public async logAction(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<string> {
    const id = `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const fullEntry: AuditLogEntry = {
      ...entry,
      id,
      timestamp: new Date().toISOString()
    };

    // Prepend to local reactive memory
    this.localLogs = [fullEntry, ...this.localLogs];
    this.saveToStorage();

    // Best-effort sync to Firestore
    try {
      await addDoc(collection(db, 'audit_trail'), {
        ...fullEntry,
        createdAt: serverTimestamp()
      });
    } catch (cloudErr) {
      // Cloud sync deferred, persisted locally
    }

    return id;
  }

  public getLogs(): AuditLogEntry[] {
    return [...this.localLogs];
  }

  public clearLogs() {
    this.localLogs = [];
    this.saveToStorage();
  }

  public exportCsv(logsToExport?: AuditLogEntry[]): void {
    const logs = logsToExport || this.localLogs;
    const headers = ["Timestamp", "Action", "Department", "User", "Role", "Entity", "Target", "Details", "Severity"];
    const rows = logs.map(l => [
      `"${l.timestamp}"`,
      `"${l.action}"`,
      `"${l.department}"`,
      `"${l.userName}"`,
      `"${l.userRole}"`,
      `"${l.targetEntity}"`,
      `"${l.targetName.replace(/"/g, '""')}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${l.severity}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Baluarte_Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const auditService = new AuditService();
