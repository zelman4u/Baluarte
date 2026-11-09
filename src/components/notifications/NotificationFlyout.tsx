import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Clock, AlertTriangle, Shield, HeartHandshake, Calendar, X, ArrowRight } from 'lucide-react';
import { notificationService, AppNotification } from '../../services/notificationService';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';

export const NotificationFlyout: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'case' | 'welfare' | 'deadline'>('all');
  const flyoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = notificationService.subscribe(setNotifications);
    return () => unsub();
  }, []);

  // Close flyout on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (flyoutRef.current && !flyoutRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' || n.category === filter
  );

  return (
    <div className="relative" ref={flyoutRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open notifications"
        className="relative min-w-[44px] min-h-[44px] flex items-center justify-center text-brand-muted hover:text-brand-text transition-colors rounded-xl hover:bg-brand-card interactive-click active:scale-95"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-danger opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-danger"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-brand-surface border border-brand-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-4 border-b border-brand-border bg-brand-card/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-brand-text">
                Live Administrative Alerts
              </span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-brand-danger text-white">
                  {unreadCount} NEW
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => notificationService.markAllAsRead()}
                  className="text-[10px] font-bold text-brand-primary hover:underline uppercase tracking-tight interactive-click"
                >
                  Mark all read
                </button>
              )}
              <button 
                onClick={() => setIsOpen(false)}
                className="text-brand-muted hover:text-brand-text p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="px-3 py-2 bg-brand-bg/60 border-b border-brand-border flex items-center gap-1 overflow-x-auto">
            {(['all', 'case', 'welfare', 'deadline'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={cn(
                  "px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded transition-all interactive-click active:scale-95 whitespace-nowrap",
                  filter === cat
                    ? "bg-brand-primary text-brand-bg shadow-sm"
                    : "text-brand-muted hover:text-brand-text hover:bg-brand-surface"
                )}
              >
                {cat === 'all' ? 'All Alerts' : cat === 'case' ? 'KP Cases' : cat === 'welfare' ? 'Welfare' : 'Deadlines'}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-brand-border/40">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-brand-muted text-xs italic">
                No active notifications in this category.
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const Icon = 
                  notif.category === 'case' ? Shield :
                  notif.category === 'welfare' ? HeartHandshake :
                  notif.category === 'deadline' ? Calendar : AlertTriangle;

                return (
                  <div
                    key={notif.id}
                    onClick={() => notificationService.markAsRead(notif.id)}
                    className={cn(
                      "p-3.5 hover:bg-brand-card/40 transition-colors flex items-start gap-3 cursor-pointer group",
                      !notif.read && "bg-brand-primary/5"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-xl border shrink-0 mt-0.5",
                      notif.severity === 'urgent' ? "bg-brand-danger/10 text-brand-danger border-brand-danger/30" :
                      notif.severity === 'warning' ? "bg-amber-400/10 text-amber-400 border-amber-400/30" :
                      "bg-brand-primary/10 text-brand-primary border-brand-primary/30"
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <p className="text-xs font-bold text-brand-text truncate group-hover:text-brand-primary transition-colors">
                          {notif.title}
                        </p>
                        <span className="text-[9px] font-mono text-brand-muted shrink-0">
                          {notif.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-brand-muted leading-relaxed line-clamp-2">
                        {notif.message}
                      </p>

                      {notif.actionUrl && (
                        <Link
                          to={notif.actionUrl}
                          onClick={() => setIsOpen(false)}
                          className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-brand-primary hover:underline uppercase tracking-tight"
                        >
                          <span>Review Report</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>

                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-brand-primary shrink-0 self-center"></span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
