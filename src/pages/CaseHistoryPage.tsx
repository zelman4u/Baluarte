import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, 
  FileText,
  Scale,
  Search, 
  Plus, 
  Clock, 
  User, 
  ChevronRight, 
  Calendar,
  MessageCircle,
  Shield,
  Gavel,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Card, Button, Input } from '../components/ui/Base';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

interface CaseHistoryEntry {
  id: string;
  caseId: string;
  caseNumber: string;
  eventType: 'Initial Report' | 'Hearing' | 'Mediation' | 'Conciliation' | 'Settlement' | 'Escalation' | 'Resolution';
  description: string;
  date: any;
  recordedBy: string;
  participants?: string[];
}

interface BlotterCase {
  id: string;
  caseNumber: string;
  complainantName: string;
  respondentName: string;
  status: string;
}

export const CaseHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<CaseHistoryEntry[]>([]);
  const [cases, setCases] = useState<BlotterCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    caseId: '',
    caseNumber: '',
    eventType: 'Hearing' as const,
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const { profile } = useAuth();

  useEffect(() => {
    if (!profile) return;

    // Fetch history entries
    const q = query(collection(db, 'case_history'), orderBy('date', 'desc'));
    const unsubscribeHistory = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CaseHistoryEntry[];
      setHistory(data);
      setLoading(false);
    });

    // Fetch cases for the dropdown
    const fetchCases = async () => {
      const casesQ = query(collection(db, 'blotter'));
      const snapshot = await getDocs(casesQ);
      const casesData = snapshot.docs.map(doc => ({
        id: doc.id,
        caseNumber: doc.data().caseNumber,
        complainantName: doc.data().complainantName,
        respondentName: doc.data().respondentName,
        status: doc.data().status
      })) as BlotterCase[];
      setCases(casesData);
    };

    fetchCases();

    return () => unsubscribeHistory();
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    const selectedCase = cases.find(c => c.id === formData.caseId);
    if (!selectedCase) return;

    try {
      await addDoc(collection(db, 'case_history'), {
        ...formData,
        caseNumber: selectedCase.caseNumber,
        recordedBy: profile.displayName || profile.email,
        createdAt: serverTimestamp(),
        date: new Date(formData.date)
      });
      setShowAddModal(false);
      setFormData({
        caseId: '',
        caseNumber: '',
        eventType: 'Hearing',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error("Error adding history entry:", error);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'Initial Report': return FileText;
      case 'Hearing': return Gavel;
      case 'Mediation': return MessageCircle;
      case 'Conciliation': return Shield;
      case 'Settlement': return CheckCircle2;
      case 'Escalation': return AlertCircle;
      case 'Resolution': return CheckCircle2;
      default: return Clock;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'Settlement':
      case 'Resolution': return 'text-brand-success bg-brand-success/10 border-brand-success/20';
      case 'Escalation': return 'text-brand-danger bg-brand-danger/10 border-brand-danger/20';
      case 'Hearing': return 'text-brand-primary bg-brand-primary/10 border-brand-primary/20';
      default: return 'text-brand-muted bg-brand-bg border-brand-border';
    }
  };

  const filteredHistory = history.filter(h => 
    h.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.eventType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group history by Case
  const groupedHistory = filteredHistory.reduce((acc, entry) => {
    if (!acc[entry.caseId]) acc[entry.caseId] = [];
    acc[entry.caseId].push(entry);
    return acc;
  }, {} as Record<string, CaseHistoryEntry[]>);

  return (
    <div className="space-y-6 pb-12">
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-brand-surface border border-brand-border rounded-xl w-full max-w-lg shadow-2xl"
          >
            <div className="p-6 border-b border-brand-border bg-brand-card/50">
              <h3 className="text-lg font-black text-brand-text uppercase tracking-tight">Log Case Progression</h3>
              <p className="text-xs text-brand-muted font-bold mt-1 uppercase tracking-widest leading-none">Judicial Timeline Update</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Select Case Registry</label>
                  <select 
                    className="w-full bg-brand-bg border border-brand-border rounded-lg p-2.5 text-xs text-brand-text focus:outline-none focus:border-brand-primary font-bold uppercase"
                    value={formData.caseId}
                    onChange={(e) => setFormData({...formData, caseId: e.target.value})}
                    required
                  >
                    <option value="">Choose Case...</option>
                    {cases.map(c => (
                      <option key={c.id} value={c.id}>
                        #{c.caseNumber} - {c.complainantName} vs {c.respondentName}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Event Classification</label>
                    <select 
                      className="w-full bg-brand-bg border border-brand-border rounded-lg p-2.5 text-xs text-brand-text focus:outline-none focus:border-brand-primary font-bold uppercase"
                      value={formData.eventType}
                      onChange={(e) => setFormData({...formData, eventType: e.target.value as any})}
                    >
                      <option>Hearing</option>
                      <option>Mediation</option>
                      <option>Conciliation</option>
                      <option>Settlement</option>
                      <option>Resolution</option>
                      <option>Escalation</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Event Date</label>
                    <Input 
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="bg-brand-bg"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Event Narrative / Minutes of Meeting</label>
                  <textarea 
                    className="w-full bg-brand-bg border border-brand-border rounded-lg p-3 text-xs text-brand-text h-32 focus:outline-none focus:border-brand-primary"
                    required
                    placeholder="Describe what occurred during this progression step..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 uppercase font-bold text-[10px]"
                >
                  Discard
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-brand-primary text-brand-bg uppercase font-black text-[10px] tracking-widest"
                >
                  Log Progression
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-brand-muted text-xs font-bold uppercase tracking-widest">Justice /</span>
            <span className="text-brand-text text-xs font-bold uppercase tracking-widest">Case Progression</span>
          </div>
          <h1 className="text-4xl font-bold text-brand-text tracking-tight uppercase tracking-[-0.05em] leading-none mb-1">Historical Tracking</h1>
          <p className="text-brand-muted text-sm font-medium">Baluarte Official Judicial Progression & Resolution Logs</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
            <Input 
              placeholder="Case # or Keywords..."
              className="pl-10 text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setShowAddModal(true)} className="bg-brand-primary text-brand-bg uppercase font-black text-[10px] tracking-widest shrink-0">
            <Plus className="w-4 h-4 mr-2" />
            Log Evolution
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {loading ? (
          <div className="py-24 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
          </div>
        ) : Object.keys(groupedHistory).length === 0 ? (
          <Card className="p-24 text-center border-dashed border-2 border-brand-border bg-brand-bg/50">
             <History className="w-12 h-12 text-brand-muted mx-auto mb-4 opacity-20" />
             <p className="text-brand-muted font-bold uppercase tracking-widest text-xs">No historical cycles detected in the registry.</p>
          </Card>
        ) : (
          Object.entries(groupedHistory).map(([caseId, entries]) => {
            const caseInfo = cases.find(c => c.id === caseId);
            const sortedEntries = [...(entries as CaseHistoryEntry[])].sort((a, b) => {
              const dateA = a.date?.seconds ? a.date.seconds : new Date(a.date).getTime();
              const dateB = b.date?.seconds ? b.date.seconds : new Date(b.date).getTime();
              return dateB - dateA;
            });
            return (
              <div key={caseId} className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-10 h-10 bg-brand-surface border border-brand-border rounded-lg flex items-center justify-center">
                    <Scale className="w-5 h-5 text-brand-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-brand-text uppercase tracking-tight">
                       Case #{caseInfo?.caseNumber || 'UNKNOWN'}
                    </h3>
                    <p className="text-[10px] text-brand-muted font-bold uppercase tracking-widest">
                       {caseInfo?.complainantName || 'Unknown'} vs {caseInfo?.respondentName || 'Unknown'}
                    </p>
                  </div>
                </div>

                <div className="relative pl-8 space-y-4 before:absolute before:left-[1.375rem] before:top-4 before:bottom-4 before:w-px before:bg-brand-border">
                  {sortedEntries.map((entry, idx) => {
                    const Icon = getEventIcon(entry.eventType);
                    return (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={entry.id} 
                        className="relative"
                      >
                        <div className={cn(
                          "absolute -left-[1.875rem] w-6 h-6 rounded-full border-4 border-brand-bg flex items-center justify-center z-10",
                          getEventColor(entry.eventType)
                        )}>
                          <Icon className="w-3 h-3" />
                        </div>
                        <Card className="p-4 bg-brand-surface border-brand-border hover:border-brand-primary/30 transition-colors group">
                           <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                             <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={cn(
                                    "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border",
                                    getEventColor(entry.eventType)
                                  )}>
                                    {entry.eventType}
                                  </span>
                                  <span className="text-[10px] text-brand-muted font-bold flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {format(new Date(entry.date?.seconds * 1000 || entry.date), 'MMMM dd, yyyy')}
                                  </span>
                                </div>
                                <p className="text-xs text-brand-text leading-relaxed font-medium">
                                  {entry.description}
                                </p>
                             </div>
                             <div className="md:text-right shrink-0">
                                <div className="flex items-center md:justify-end gap-2 text-brand-muted mb-1">
                                  <User className="w-3 h-3 text-brand-primary" />
                                  <span className="text-[10px] font-bold uppercase tracking-widest">Recorder:</span>
                                </div>
                                <p className="text-[10px] font-black text-brand-text uppercase">{entry.recordedBy}</p>
                             </div>
                           </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
