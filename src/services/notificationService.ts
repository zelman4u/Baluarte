import { auditService } from './auditService';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: 'case' | 'welfare' | 'deadline' | 'drrm' | 'system';
  severity: 'info' | 'warning' | 'urgent';
  department: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

const STORAGE_KEY = 'baluarte_notifications_v2';

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Pending KP Mediation Hearing',
    message: 'Case KP-2026-0012 requires 2nd mediation notice summons issuance.',
    category: 'case',
    severity: 'warning',
    department: 'Justice',
    timestamp: '15 mins ago',
    read: false,
    actionUrl: '/cases'
  },
  {
    id: 'notif-2',
    title: 'Urgent AICS Welfare Application',
    message: 'Resident Rosalina Mendoza submitted medical emergency indigent aid request.',
    category: 'welfare',
    severity: 'urgent',
    department: 'Health',
    timestamp: '42 mins ago',
    read: false,
    actionUrl: '/welfare'
  },
  {
    id: 'notif-3',
    title: 'Upcoming Statutory Deadline',
    message: 'Q4 Barangay Financial Transparency Report submission to DILG due in 3 days.',
    category: 'deadline',
    severity: 'warning',
    department: 'Finance',
    timestamp: '2 hours ago',
    read: false,
    actionUrl: '/treasury'
  },
  {
    id: 'notif-4',
    title: 'Disaster Weather Advisory',
    message: 'PAGASA Yellow Rainfall Advisory active over Northern Mindanao coastal sectors.',
    category: 'drrm',
    severity: 'info',
    department: 'Disaster',
    timestamp: '4 hours ago',
    read: true,
    actionUrl: '/drrm'
  }
];

class NotificationService {
  private notifications: AppNotification[] = [];
  private listeners: ((notifs: AppNotification[]) => void)[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.notifications = JSON.parse(stored);
      } else {
        this.notifications = [...DEFAULT_NOTIFICATIONS];
        this.saveToStorage();
      }
    } catch {
      this.notifications = [...DEFAULT_NOTIFICATIONS];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.notifications));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
    this.notify();
  }

  private notify() {
    this.listeners.forEach(cb => cb([...this.notifications]));
  }

  public subscribe(callback: (notifs: AppNotification[]) => void): () => void {
    callback([...this.notifications]);
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  public addNotification(notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      read: false
    };
    this.notifications = [newNotif, ...this.notifications];
    this.saveToStorage();
  }

  public markAsRead(id: string) {
    this.notifications = this.notifications.map(n => n.id === id ? { ...n, read: true } : n);
    this.saveToStorage();
  }

  public markAllAsRead() {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    this.saveToStorage();
  }

  public clearAll() {
    this.notifications = [];
    this.saveToStorage();
  }
}

export const notificationService = new NotificationService();
