import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  CreditCard,
  User,
  ArrowUpRight,
  ExternalLink
} from 'lucide-react';
import { collection, query, onSnapshot, getDocs, addDoc, serverTimestamp, orderBy, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Input } from '../components/ui/Base';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface DocumentRequest {
  id: string;
  residentId: string;
  type: string;
  purpose: string;
  status: 'Pending' | 'Approved' | 'Processing' | 'Ready For Pickup' | 'Completed' | 'Rejected';
  requestedAt: any;
  amountPaid?: number;
  orNumber?: string;
  controlNumber?: string;
}

export const RequestsPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Barangay Clearance',
    purpose: '',
  });

  useEffect(() => {
    if (!profile) return;
    
    let q;
    if (profile?.role === 'Resident') {
      q = query(
        collection(db, 'requests'), 
        where('residentId', '==', user?.uid),
        orderBy('requestedAt', 'desc')
      );
    } else {
      q = query(collection(db, 'requests'), orderBy('requestedAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any)
      })) as DocumentRequest[];
      setRequests(data);
      setLoading(false);
    }, (error) => {
      console.error("Requests sync failure:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !user) return;
    
    try {
      await addDoc(collection(db, 'requests'), {
        ...formData,
        residentId: user.uid,
        residentName: profile.displayName || profile.email,
        status: 'Pending',
        requestedAt: serverTimestamp(),
      });
      setShowAddModal(false);
      setFormData({
        type: 'Barangay Clearance',
        purpose: '',
      });
    } catch (error) {
      console.error("Error adding request:", error);
    }
  };

  const filteredRequests = requests.filter(r => 
    r.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.id.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Completed': return "bg-brand-success/10 text-brand-success border-brand-success/20";
      case 'Pending': return "bg-brand-warning/10 text-brand-warning border-brand-warning/20";
      case 'Rejected': return "bg-brand-danger/10 text-brand-danger border-brand-danger/20";
      default: return "bg-brand-primary/10 text-brand-primary border-brand-primary/20";
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* New Request Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-brand-surface border border-brand-border rounded-xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-brand-border bg-brand-card/50">
              <h3 className="text-lg font-black text-brand-text uppercase tracking-tight">Request Official Document</h3>
              <p className="text-xs text-brand-muted font-bold mt-1 uppercase tracking-widest leading-none">Administrative Portal V4</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Document Classification</label>
                  <select 
                    className="w-full bg-brand-bg border border-brand-border rounded-lg p-2.5 text-xs text-brand-text focus:outline-none focus:border-brand-primary font-bold uppercase"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option>Barangay Clearance</option>
                    <option>Certificate of Indigency</option>
                    <option>Residency Certificate</option>
                    <option>Business Permit</option>
                    <option>Others</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Purpose / Utilization</label>
                  <textarea 
                    className="w-full bg-brand-bg border border-brand-border rounded-lg p-3 text-xs text-brand-text h-24 focus:outline-none focus:border-brand-primary"
                    required
                    placeholder="Describe the usage for this document..."
                    value={formData.purpose}
                    onChange={(e) => setFormData({...formData, purpose: e.target.value})}
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
                  Confirm Request
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-brand-muted text-xs font-bold uppercase tracking-widest">Documentation /</span>
            <span className="text-brand-text text-xs font-bold uppercase tracking-widest">Public Service</span>
          </div>
          <h1 className="text-4xl font-bold text-brand-text tracking-tight uppercase tracking-[-0.05em] leading-none mb-1">Document Queue</h1>
          <p className="text-brand-muted text-sm font-medium">Baluarte Official Certificate & Clearance Processing Service</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="hidden lg:flex">
            Fee Schedule
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="bg-brand-primary text-brand-bg uppercase font-black text-[10px] tracking-widest">
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Unprocessed', value: requests.filter(r => r.status === 'Pending').length.toString(), icon: Clock, color: 'text-brand-warning' },
          { label: 'Processed', value: requests.filter(r => r.status === 'Completed').length.toString(), icon: CheckCircle2, color: 'text-brand-success' },
          { label: 'Avg Pulse', value: '4.2H', icon: ArrowUpRight, color: 'text-brand-primary' },
          { label: 'Daily Revenue', value: '₱2,850', icon: CreditCard, color: 'text-purple-400' },
        ].map((stat, i) => (
          <Card key={i} className="p-4 bg-brand-surface border-brand-border">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-brand-bg border border-brand-border rounded-lg">
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
              placeholder="Query Control ID or Document Type..." 
              className="pl-10 bg-brand-bg border-brand-border focus:border-brand-primary" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-[10px] font-bold">
               ALL_DOCS
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-bg text-brand-muted text-[10px] uppercase tracking-widest font-black">
                <th className="px-6 py-4 border-b border-brand-border">Request ID</th>
                <th className="px-6 py-4 border-b border-brand-border">Document Classification</th>
                <th className="px-6 py-4 border-b border-brand-border">Timestamp</th>
                <th className="px-6 py-4 border-b border-brand-border">Validation</th>
                <th className="px-6 py-4 border-b border-brand-border">Payment</th>
                <th className="px-6 py-4 border-b border-brand-border text-right">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center text-brand-muted italic font-medium">
                    No active requests found in the documentation pipeline.
                  </td>
                </tr>
              ) : filteredRequests.map((r) => (
                <tr key={r.id} className="hover:bg-brand-card/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <FileText className="w-4 h-4 text-brand-muted" />
                       <span className="font-mono text-brand-text">#{r.id.slice(0, 8)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className="text-brand-text font-black uppercase tracking-tight">{r.type}</span>
                  </td>
                  <td className="px-6 py-4 text-brand-muted font-bold font-mono">
                    {format(new Date(r.requestedAt?.seconds * 1000 || r.requestedAt), 'MMM dd | HH:mm')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                      getStatusStyle(r.status)
                    )}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {r.amountPaid ? (
                      <span className="text-[10px] font-black text-brand-success uppercase tracking-tighter">₱{r.amountPaid.toLocaleString()} [{r.orNumber}]</span>
                    ) : (
                      <span className="text-[10px] text-brand-danger font-black uppercase tracking-tighter">UNPAID</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-brand-muted hover:text-brand-primary hover:bg-brand-bg rounded-lg transition-all">
                      <ExternalLink className="w-4 h-4" />
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
