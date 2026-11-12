import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  Scale, 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  AlertCircle, 
  ShieldCheck, 
  Clock,
  ArrowRight,
  Shield,
  FileText,
  X,
  ArrowUpRight
} from 'lucide-react';
import { collection, query, onSnapshot, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Card, Button, Input } from '../components/ui/Base';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { auditService } from '../services/auditService';
import { notificationService } from '../services/notificationService';

interface BlotterRecord {
  id: string;
  incidentType: string;
  complainantName: string;
  respondentName: string;
  incidentDate: any;
  status: 'Active' | 'Settled' | 'Referred' | 'Closed';
  caseNumber: string;
  narrative: string;
  reportedAt: any;
}

export const BlotterPage: React.FC = () => {
  const [records, setRecords] = useState<BlotterRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    caseNumber: `2026-${Math.floor(1000 + Math.random() * 9000)}`,
    incidentType: 'Criminal',
    complainantName: '',
    respondentName: '',
    incidentDate: new Date().toISOString().split('T')[0],
    narrative: '',
    status: 'Active' as const
  });
  const { profile } = useAuth();

  useEffect(() => {
    if (!profile) return;
    
    const q = query(collection(db, 'blotter'), orderBy('reportedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BlotterRecord[];
      setRecords(data);
      setLoading(false);
    }, (error) => {
      console.error("Blotter sync failure:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    try {
      const docRef = await addDoc(collection(db, 'blotter'), {
        ...formData,
        reportedAt: serverTimestamp(),
        recordedBy: profile.displayName || profile.email
      });

      await auditService.logAction({
        userId: profile.uid || 'peace-officer',
        userName: profile.displayName || profile.email || 'Tanod / Lupon',
        userEmail: profile.email || 'tanod@baluarte.gov.ph',
        userRole: profile.role || 'Tanod',
        department: 'Security',
        action: 'CREATE',
        targetEntity: 'Blotter',
        targetId: docRef.id,
        targetName: `Case #${formData.caseNumber}`,
        details: `Logged official blotter entry: Case #${formData.caseNumber} (${formData.incidentType}) - ${formData.complainantName} vs ${formData.respondentName}`,
        severity: 'Warning'
      });

      notificationService.addNotification({
        title: 'New Blotter Incident Logged',
        message: `Case #${formData.caseNumber}: ${formData.incidentType} incident recorded by ${profile.displayName || 'Officer'}.`,
        category: 'case',
        severity: 'warning',
        department: 'Security',
        actionUrl: '/blotter'
      });

      setShowAddModal(false);
      setFormData({
        caseNumber: `2026-${Math.floor(1000 + Math.random() * 9000)}`,
        incidentType: 'Criminal',
        complainantName: '',
        respondentName: '',
        incidentDate: new Date().toISOString().split('T')[0],
        narrative: '',
        status: 'Active'
      });
    } catch (error) {
      console.error("Error adding blotter record:", error);
    }
  };

  const filteredRecords = records.filter(r => 
    r.complainantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.incidentType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Add Case Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="p-4 sm:p-6 border-b border-brand-border bg-brand-card/50 flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-brand-text uppercase tracking-tight">Official Blotter Deposition</h3>
                  <p className="text-[10px] text-brand-muted font-bold mt-1 uppercase tracking-widest leading-none">Baluarte Peace & Order Desk</p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 text-brand-muted hover:text-brand-text rounded-lg hover:bg-brand-bg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Case Reference #</label>
                    <Input 
                      required
                      value={formData.caseNumber}
                      onChange={(e) => setFormData({...formData, caseNumber: e.target.value})}
                      className="bg-brand-bg font-mono min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Incident Classification</label>
                    <select 
                      className="w-full bg-brand-bg border border-brand-border rounded-lg p-2.5 text-xs text-brand-text focus:outline-none focus:border-brand-primary font-bold uppercase min-h-[44px]"
                      value={formData.incidentType}
                      onChange={(e) => setFormData({...formData, incidentType: e.target.value})}
                    >
                      <option>Criminal</option>
                      <option>Civil</option>
                      <option>Traffic</option>
                      <option>Domestic</option>
                      <option>Others</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Complainant Integrity Name</label>
                    <Input 
                      required
                      placeholder="Full Name of Complainant..."
                      value={formData.complainantName}
                      onChange={(e) => setFormData({...formData, complainantName: e.target.value})}
                      className="bg-brand-bg min-h-[44px]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Respondent / Subject</label>
                    <Input 
                      required
                      placeholder="Full Name of Respondent..."
                      value={formData.respondentName}
                      onChange={(e) => setFormData({...formData, respondentName: e.target.value})}
                      className="bg-brand-bg uppercase min-h-[44px]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Date of Incident</label>
                    <Input 
                      type="date"
                      required
                      value={formData.incidentDate}
                      onChange={(e) => setFormData({...formData, incidentDate: e.target.value})}
                      className="bg-brand-bg min-h-[44px]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Incident Narrative / Details</label>
                    <textarea 
                      className="w-full bg-brand-bg border border-brand-border rounded-lg p-3 text-xs text-brand-text h-24 focus:outline-none focus:border-brand-primary"
                      required
                      placeholder="Provide precise details of the occurrence..."
                      value={formData.narrative}
                      onChange={(e) => setFormData({...formData, narrative: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 pt-3 border-t border-brand-border">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 uppercase font-bold text-xs min-h-[44px] interactive-click"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-brand-primary text-brand-bg uppercase font-black text-xs tracking-wider min-h-[44px] interactive-click shadow-lg shadow-brand-primary/20"
                  >
                    Seal Entry
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-brand-muted text-xs font-bold uppercase tracking-widest">Justice /</span>
            <span className="text-brand-text text-xs font-bold uppercase tracking-widest">Peace & Order</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-brand-text tracking-tight uppercase tracking-[-0.05em] leading-none mb-1 interactive-text cursor-default">
            Blotter Registry
          </h1>
          <p className="text-brand-muted text-xs sm:text-sm font-medium">Baluarte Official Incident Logging & Case Management</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button variant="outline" className="hidden lg:flex min-h-[44px] interactive-click">
            Audit Export
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="bg-brand-primary text-brand-bg uppercase font-black text-xs tracking-wider min-h-[44px] interactive-click shadow-lg shadow-brand-primary/20">
            <Plus className="w-4 h-4 mr-2" />
            New Entry
          </Button>
        </div>
      </div>

      {/* Dashboard-Style Staggered Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'Active Incidents', value: '12', icon: Clock, color: 'text-brand-warning', bg: 'bg-brand-warning/10', change: 'Live Desk' },
          { label: 'Settled Through Lupon', value: '48', icon: ShieldCheck, color: 'text-brand-success', bg: 'bg-brand-success/10', change: '80% Rate' },
          { label: 'Escalated / CFA', value: '03', icon: AlertCircle, color: 'text-brand-danger', bg: 'bg-brand-danger/10', change: 'Court' },
          { label: 'Total Blotter Logs', value: records.length.toString(), icon: FileText, color: 'text-brand-primary', bg: 'bg-brand-primary/10', change: 'Archive' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.35 }}
          >
            <Card className="p-5 sm:p-6 kinetic-card interactive-click">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2.5 rounded-lg border border-brand-border", stat.bg)}>
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
                <div className="flex items-center gap-1 text-brand-success text-[10px] font-bold bg-brand-success/10 px-2 py-0.5 rounded-full border border-brand-success/20 kinetic-badge">
                  <ArrowUpRight className="w-2.5 h-2.5" />
                  {stat.change}
                </div>
              </div>
              <p className="text-brand-muted text-[10px] font-bold uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-brand-text mt-1 interactive-text">{stat.value}</h3>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="overflow-hidden bg-brand-surface border-brand-border">
        <div className="p-6 border-b border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-card/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted font-bold" />
            <Input 
              placeholder="Search case #, complainant, or type..." 
              className="pl-10 bg-brand-bg border-brand-border focus:border-brand-primary" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-[10px] font-bold">
               ALL_TYPES
            </Button>
            <Button variant="outline" size="sm" className="text-[10px] font-bold">
               SETTLED_ONLY
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-bg text-brand-muted text-[10px] uppercase tracking-widest font-black">
                <th className="px-6 py-4 border-b border-brand-border">Case Entry</th>
                <th className="px-6 py-4 border-b border-brand-border">Complainant / Respondent</th>
                <th className="px-6 py-4 border-b border-brand-border">Classification</th>
                <th className="px-6 py-4 border-b border-brand-border">Incident Date</th>
                <th className="px-6 py-4 border-b border-brand-border">Status</th>
                <th className="px-6 py-4 border-b border-brand-border text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center text-brand-muted italic font-medium">
                    No active blotter records in the current session.
                  </td>
                </tr>
              ) : filteredRecords.map((r) => (
                <tr key={r.id} className="hover:bg-brand-card/30 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-black text-brand-text">#{r.caseNumber || 'NO_NUM'}</p>
                      <p className="text-[9px] text-brand-muted font-bold uppercase tracking-tighter mt-0.5">UID: {r.id.slice(0, 8)}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <div>
                        <p className="text-brand-text font-bold uppercase tracking-tight">{r.complainantName}</p>
                        <p className="text-[10px] text-brand-muted mt-0.5">vs. {r.respondentName}</p>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black bg-brand-bg border border-brand-border px-2 py-1 rounded text-brand-primary uppercase">
                      {r.incidentType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-brand-muted font-bold">
                       <Clock className="w-3 h-3" />
                       <span className="text-[10px]">{format(new Date(r.incidentDate?.seconds * 1000 || r.incidentDate), 'MMM dd, yyyy')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border",
                      r.status === 'Settled' ? "bg-brand-success/10 text-brand-success border-brand-success/20" : 
                      r.status === 'Active' ? "bg-brand-danger/10 text-brand-danger border-brand-danger/20" :
                      "bg-brand-muted/10 text-brand-muted border-brand-border"
                    )}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-brand-muted hover:text-brand-primary hover:bg-brand-bg rounded-lg transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
