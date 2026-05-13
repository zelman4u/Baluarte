import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
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
  FileText
} from 'lucide-react';
import { collection, query, onSnapshot, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Card, Button, Input } from '../components/ui/Base';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

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
      await addDoc(collection(db, 'blotter'), {
        ...formData,
        reportedAt: serverTimestamp(),
        recordedBy: profile.displayName || profile.email
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
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-brand-surface border border-brand-border rounded-xl w-full max-w-lg overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-brand-border bg-brand-card/50">
              <h3 className="text-lg font-black text-brand-text uppercase tracking-tight">Official Blotter Deposition</h3>
              <p className="text-xs text-brand-muted font-bold mt-1 uppercase tracking-widest leading-none">Legal & Order Protocol 7-B</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Case Reference #</label>
                  <Input 
                    required
                    value={formData.caseNumber}
                    onChange={(e) => setFormData({...formData, caseNumber: e.target.value})}
                    className="bg-brand-bg font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Incident Classification</label>
                  <select 
                    className="w-full bg-brand-bg border border-brand-border rounded-lg p-2.5 text-xs text-brand-text focus:outline-none focus:border-brand-primary font-bold uppercase"
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
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Complainant Integrity Name</label>
                  <Input 
                    required
                    placeholder="Full Name of Complainer..."
                    value={formData.complainantName}
                    onChange={(e) => setFormData({...formData, complainantName: e.target.value})}
                    className="bg-brand-bg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Respondent / Subject</label>
                  <Input 
                    required
                    placeholder="Full Name of Respondent..."
                    value={formData.respondentName}
                    onChange={(e) => setFormData({...formData, respondentName: e.target.value})}
                    className="bg-brand-bg uppercase"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Date of Incident</label>
                  <Input 
                    type="date"
                    required
                    value={formData.incidentDate}
                    onChange={(e) => setFormData({...formData, incidentDate: e.target.value})}
                    className="bg-brand-bg"
                  />
                </div>
                <div className="col-span-2">
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
              
              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 uppercase font-bold text-[10px]"
                >
                  Cancel Deposition
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-brand-primary text-brand-bg uppercase font-black text-[10px] tracking-widest"
                >
                  Seal Entry
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
            <span className="text-brand-text text-xs font-bold uppercase tracking-widest">Peace & Order</span>
          </div>
          <h1 className="text-4xl font-bold text-brand-text tracking-tight uppercase tracking-[-0.05em] leading-none mb-1">Blotter Registry</h1>
          <p className="text-brand-muted text-sm font-medium">Baluarte Official Incident Logging & Case Management</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="hidden lg:flex">
            Audit Export
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="bg-brand-primary text-brand-bg uppercase font-black text-[10px] tracking-widest">
            <Plus className="w-4 h-4 mr-2" />
            New Entry
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Cases', value: '12', icon: Clock, color: 'text-brand-warning', bg: 'bg-brand-warning/10' },
          { label: 'Settled', value: '48', icon: ShieldCheck, color: 'text-brand-success', bg: 'bg-brand-success/10' },
          { label: 'Escalated', value: '03', icon: AlertCircle, color: 'text-brand-danger', bg: 'bg-brand-danger/10' },
          { label: 'Total Logs', value: records.length.toString(), icon: FileText, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
        ].map((stat, i) => (
          <Card key={i} className="p-4 bg-brand-surface border-brand-border">
            <div className="flex items-center gap-4">
              <div className={cn("p-2 rounded-lg border border-brand-border", stat.bg)}>
                <stat.icon className={cn("w-4 h-4", stat.color)} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest leading-none">{stat.label}</p>
                <h4 className="text-lg font-black text-brand-text mt-1">{stat.value}</h4>
              </div>
            </div>
          </Card>
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
