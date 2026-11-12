import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Card, Button, Input } from '../components/ui/Base';
import { Plus, Search, Filter, Download, MoreHorizontal, User, Users, CheckCircle2, Heart, MapPin, ArrowUpRight } from 'lucide-react';
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-brand-border">
        <div>
           <div className="flex items-center gap-2 mb-1">
            <span className="text-brand-muted text-xs font-bold uppercase tracking-widest">Portal /</span>
            <span className="text-brand-text text-xs font-bold uppercase tracking-widest">Resident Registry</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-brand-text tracking-tight uppercase tracking-[-0.05em] leading-none mb-1 interactive-text cursor-default">
            Citizen Database
          </h1>
          <p className="text-brand-muted text-xs sm:text-sm font-medium">Baluarte Unified Inhabitant Monitoring System</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button variant="outline" className="hidden lg:flex min-h-[44px] interactive-click" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Audit
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="bg-brand-primary text-brand-bg min-h-[44px] interactive-click shadow-lg shadow-brand-primary/20">
            <Plus className="w-4 h-4 mr-2" />
            Register Citizen
          </Button>
        </div>
      </div>

      {/* Dashboard-Style Staggered Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'Registered Citizens', value: residents.length || '12,482', icon: Users, color: 'text-brand-primary', bg: 'bg-brand-primary/10', change: '+2.4%' },
          { label: 'Verified Voters', value: '8,920', icon: CheckCircle2, color: 'text-brand-success', bg: 'bg-brand-success/10', change: 'Live' },
          { label: 'Vulnerable Sectors', value: '1,482', icon: Heart, color: 'text-pink-400', bg: 'bg-pink-400/10', change: 'Monitored' },
          { label: 'Cluster Puroks', value: '7 Zones', icon: MapPin, color: 'text-purple-400', bg: 'bg-purple-400/10', change: 'Active' },
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

      <Card className="overflow-hidden bg-brand-surface border-brand-border kinetic-card">
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
    voterStatus: 'Registered',
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
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">First Name</label>
          <Input 
            required 
            placeholder="e.g. Juan"
            value={formData.firstName} 
            onChange={e => setFormData({...formData, firstName: e.target.value})} 
            className="bg-brand-bg border-brand-border text-brand-text min-h-[44px]"
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Last Name</label>
          <Input 
            required 
            placeholder="e.g. Dela Cruz"
            value={formData.lastName} 
            onChange={e => setFormData({...formData, lastName: e.target.value})} 
            className="bg-brand-bg border-brand-border text-brand-text min-h-[44px]"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Birth Date</label>
          <Input 
            type="date" 
            required 
            value={formData.birthDate} 
            onChange={e => setFormData({...formData, birthDate: e.target.value})} 
            className="bg-brand-bg border-brand-border text-brand-text min-h-[44px]"
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Gender</label>
          <select 
            className="w-full bg-brand-bg border border-brand-border text-brand-text rounded-lg px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-brand-primary min-h-[44px]"
            value={formData.gender}
            onChange={e => setFormData({...formData, gender: e.target.value})}
          >
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 items-center py-3 border-y border-brand-border bg-brand-bg/40 px-3 rounded-lg">
        <label className="flex items-center gap-2 cursor-pointer interactive-click">
          <input 
            type="checkbox" 
            className="w-4 h-4 accent-brand-primary rounded" 
            checked={formData.isSeniorCitizen} 
            onChange={e => setFormData({...formData, isSeniorCitizen: e.target.checked})} 
          />
          <span className="text-xs font-bold text-brand-text">Senior Citizen (60+)</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer interactive-click">
          <input 
            type="checkbox" 
            className="w-4 h-4 accent-brand-primary rounded" 
            checked={formData.isPWD} 
            onChange={e => setFormData({...formData, isPWD: e.target.checked})} 
          />
          <span className="text-xs font-bold text-brand-text">PWD (Special Needs)</span>
        </label>
      </div>
      <div className="flex gap-3 pt-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onSuccess} 
          className="flex-1 min-h-[44px] uppercase font-bold text-xs interactive-click"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={loading} 
          className="flex-1 min-h-[44px] bg-brand-primary text-brand-bg uppercase font-black text-xs tracking-wider interactive-click shadow-lg shadow-brand-primary/20"
        >
          {loading ? 'Registering...' : 'Complete Registration'}
        </Button>
      </div>
    </form>
  );
};
