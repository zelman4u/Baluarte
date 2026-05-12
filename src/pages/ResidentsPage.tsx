import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Card, Button, Input } from '../components/ui/Base';
import { Plus, Search, Filter, Download, MoreHorizontal, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

import { generateResidentReport } from '../lib/reports';

export const ResidentsPage: React.FC = () => {
  const [residents, setResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const { profile } = useAuth();

  useEffect(() => {
    if (!profile) return;

    // Only allow officials or appropriate roles to fetch the full registry
    const isAuthorized = ['SuperAdmin', 'Captain', 'Secretary', 'Treasurer', 'Kagawad', 'SKOfficial', 'BHW'].includes(profile.role) || 
                        ['Administration', 'Health', 'Justice', 'Youth'].includes(profile.department);

    if (!isAuthorized && profile.role !== 'Resident') {
       setLoading(false);
       return;
    }

    const q = query(collection(db, 'residents'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setResidents(data);
      setLoading(false);
    }, (error) => {
      console.error("Residents snapshot error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [profile]);

  const handleExport = () => {
    generateResidentReport(filteredResidents);
  };

  const filteredResidents = residents.filter(r => 
    `${r.firstName} ${r.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <div className="flex items-center gap-2 mb-1">
            <span className="text-brand-muted text-xs font-bold uppercase tracking-widest">Portal /</span>
            <span className="text-brand-text text-xs font-bold uppercase tracking-widest">Resident Registry</span>
          </div>
          <h1 className="text-2xl font-bold text-brand-text tracking-tight">Citizen Database</h1>
          <p className="text-brand-muted text-sm font-medium">Baluarte Unified Inhabitant Monitoring System</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="hidden lg:flex" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Audit
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="bg-brand-primary text-brand-bg">
            <Plus className="w-4 h-4 mr-2" />
            Register Citizen
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden bg-brand-surface border-brand-border">
        <div className="p-6 border-b border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-card/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted font-bold" />
            <Input 
              placeholder="Query biometric ID, name, or purok..." 
              className="pl-10 bg-brand-bg border-brand-border focus:border-brand-primary" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-3 h-3 mr-2" />
              Purok
            </Button>
            <Button variant="outline" size="sm">
              Status
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-bg text-brand-muted text-[10px] uppercase tracking-widest font-black">
                <th className="px-6 py-4 border-b border-brand-border">Identity Profile</th>
                <th className="px-6 py-4 border-b border-brand-border">Household</th>
                <th className="px-6 py-4 border-b border-brand-border">Validation</th>
                <th className="px-6 py-4 border-b border-brand-border">Category</th>
                <th className="px-6 py-4 border-b border-brand-border">Channel</th>
                <th className="px-6 py-4 border-b border-brand-border text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
                  </td>
                </tr>
              ) : filteredResidents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center text-brand-muted italic font-medium">
                    No matching records found in central encrypted storage.
                  </td>
                </tr>
              ) : filteredResidents.map((resident) => (
                <tr key={resident.id} className="hover:bg-brand-card/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-brand-bg border border-brand-border flex items-center justify-center overflow-hidden">
                        <User className="w-5 h-5 text-brand-muted" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-brand-text">{resident.firstName} {resident.lastName}</p>
                        <p className="text-[10px] text-brand-muted font-mono uppercase tracking-tighter">HEX: {resident.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-brand-muted bg-brand-bg border border-brand-border px-2 py-1 rounded">HH-{resident.householdId || 'UNT'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tight",
                      resident.voterStatus === 'Registered' ? "bg-brand-success/10 text-brand-success border border-brand-success/20" : "bg-brand-muted/10 text-brand-muted border border-brand-border"
                    )}>
                      {resident.voterStatus || 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1.5">
                      {resident.isSeniorCitizen && <span className="text-[9px] font-black bg-brand-warning/10 text-brand-warning border border-brand-warning/20 px-1.5 py-0.5 rounded">SR</span>}
                      {resident.isPWD && <span className="text-[9px] font-black bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-1.5 py-0.5 rounded">PWD</span>}
                      {!resident.isSeniorCitizen && !resident.isPWD && <span className="text-[10px] text-brand-muted/30">GEN</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] text-brand-muted font-mono">{resident.contactNumber || 'SECURE'}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-brand-muted hover:text-brand-primary hover:bg-brand-bg rounded-lg transition-all">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-brand-border bg-brand-card/20 flex items-center justify-between">
          <p className="text-[10px] text-brand-muted font-bold uppercase tracking-widest">Total Records Managed: {residents.length}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-[10px] px-3 font-bold">PREV</Button>
            <Button variant="outline" size="sm" className="text-[10px] px-3 font-bold">NEXT</Button>
          </div>
        </div>
      </Card>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-text/20 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-brand-surface rounded-2xl shadow-2xl border border-brand-border overflow-hidden"
            >
              <div className="p-6 border-b border-brand-border flex items-center justify-between">
                <h2 className="text-xl font-bold text-brand-text">Register New Resident</h2>
                <button onClick={() => setShowAddModal(false)} className="text-brand-muted hover:text-brand-text">×</button>
              </div>
              <div className="p-8 max-h-[70vh] overflow-y-auto">
                <ResidentForm onSuccess={() => setShowAddModal(false)} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ResidentForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: 'Male',
    voterStatus: 'Not Registered',
    isSeniorCitizen: false,
    isPWD: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'residents'), {
        ...formData,
        createdAt: serverTimestamp(),
        status: 'Alive'
      });
      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">First Name</label>
          <Input required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Last Name</label>
          <Input required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Birth Date</label>
          <Input type="date" required value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Gender</label>
          <select 
            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            value={formData.gender}
            onChange={e => setFormData({...formData, gender: e.target.value})}
          >
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>
      </div>
      <div className="flex gap-6 items-center py-4 border-y border-slate-100">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="rounded text-blue-600" checked={formData.isSeniorCitizen} onChange={e => setFormData({...formData, isSeniorCitizen: e.target.checked})} />
          <span className="text-sm font-medium text-slate-700">Senior Citizen</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="rounded text-blue-600" checked={formData.isPWD} onChange={e => setFormData({...formData, isPWD: e.target.checked})} />
          <span className="text-sm font-medium text-slate-700">PWD</span>
        </label>
      </div>
      <Button type="submit" disabled={loading} className="w-full h-12">
        {loading ? 'Registering...' : 'Complete Registration'}
      </Button>
    </form>
  );
};
