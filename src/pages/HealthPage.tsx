import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Heart, 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  Activity, 
  Thermometer, 
  Syringe,
  History,
  ArrowUpRight,
  Stethoscope,
  Weight
} from 'lucide-react';
import { collection, query, onSnapshot, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Card, Button, Input } from '../components/ui/Base';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

interface HealthRecord {
  id: string;
  residentId: string;
  residentName?: string;
  height: number;
  weight: number;
  bloodPressure: string;
  findings: string;
  treatment: string;
  isPregnant: boolean;
  lastCheckup: any;
  recordedBy: string;
}

export const HealthPage: React.FC = () => {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    residentId: '',
    height: '',
    weight: '',
    bloodPressure: '',
    findings: '',
    treatment: '',
    isPregnant: false
  });
  const { profile } = useAuth();

  useEffect(() => {
    if (!profile) return;
    
    const q = query(collection(db, 'health_records'), orderBy('lastCheckup', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HealthRecord[];
      setRecords(data);
      setLoading(false);
    }, (error) => {
      console.error("Health records sync failure:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    try {
      await addDoc(collection(db, 'health_records'), {
        ...formData,
        height: Number(formData.height),
        weight: Number(formData.weight),
        lastCheckup: serverTimestamp(),
        recordedBy: profile.displayName || profile.email
      });
      setShowAddModal(false);
      setFormData({
        residentId: '',
        height: '',
        weight: '',
        bloodPressure: '',
        findings: '',
        treatment: '',
        isPregnant: false
      });
    } catch (error) {
      console.error("Error adding health record:", error);
    }
  };

  const filteredRecords = records.filter(r => 
    r.residentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.findings.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Add Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-brand-surface border border-brand-border rounded-xl w-full max-w-lg overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-brand-border bg-brand-card/50">
              <h3 className="text-lg font-black text-brand-text uppercase tracking-tight">New Clinical Entry</h3>
              <p className="text-xs text-brand-muted font-bold mt-1 uppercase tracking-widest leading-none">Vigilance & Care Protocol 4.0</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Resident Identifier</label>
                  <Input 
                    required
                    placeholder="UID or Resident ID..."
                    value={formData.residentId}
                    onChange={(e) => setFormData({...formData, residentId: e.target.value})}
                    className="bg-brand-bg uppercase"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Height (cm)</label>
                  <Input 
                    type="number"
                    required
                    value={formData.height}
                    onChange={(e) => setFormData({...formData, height: e.target.value})}
                    className="bg-brand-bg"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Weight (kg)</label>
                  <Input 
                    type="number"
                    required
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    className="bg-brand-bg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Blood Pressure (mmHg)</label>
                  <Input 
                    required
                    placeholder="120/80"
                    value={formData.bloodPressure}
                    onChange={(e) => setFormData({...formData, bloodPressure: e.target.value})}
                    className="bg-brand-bg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Clinical Findings</label>
                  <textarea 
                    className="w-full bg-brand-bg border border-brand-border rounded-lg p-3 text-xs text-brand-text h-24 focus:outline-none focus:border-brand-primary"
                    required
                    value={formData.findings}
                    onChange={(e) => setFormData({...formData, findings: e.target.value})}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Treatment/Prescription</label>
                  <Input 
                    value={formData.treatment}
                    onChange={(e) => setFormData({...formData, treatment: e.target.value})}
                    className="bg-brand-bg"
                  />
                </div>
                <div className="col-span-2 flex items-center gap-3 bg-brand-bg/50 p-3 rounded-lg border border-brand-border">
                  <input 
                    type="checkbox" 
                    id="isPregnant"
                    checked={formData.isPregnant}
                    onChange={(e) => setFormData({...formData, isPregnant: e.target.checked})}
                    className="w-4 h-4 accent-brand-primary"
                  />
                  <label htmlFor="isPregnant" className="text-[10px] font-black text-brand-text uppercase tracking-widest">Mark as Maternal Case</label>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 uppercase font-bold text-[10px]"
                >
                  Abnormal Close
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-brand-primary text-brand-bg uppercase font-black text-[10px] tracking-widest"
                >
                  Commit Entry
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-brand-muted text-xs font-bold uppercase tracking-widest">Welfare /</span>
            <span className="text-brand-text text-xs font-bold uppercase tracking-widest">Health Registry</span>
          </div>
          <h1 className="text-4xl font-bold text-brand-text tracking-tight uppercase tracking-[-0.05em] leading-none mb-1">Medical Surveillance</h1>
          <p className="text-brand-muted text-sm font-medium">Baluarte Health Center Resident Monitoring & Records Audit</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="hidden lg:flex">
            Health Census
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="bg-brand-primary text-brand-bg uppercase font-black text-[10px] tracking-widest">
            <Plus className="w-4 h-4 mr-2" />
            Clinical Entry
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-brand-surface border-brand-border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-brand-danger/10 rounded-lg text-brand-danger border border-brand-danger/20">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <p className="text-brand-muted text-[10px] font-bold uppercase tracking-widest">Active Consultations</p>
          <h3 className="text-2xl font-bold text-brand-text mt-1">{records.length}</h3>
        </Card>
        
        <Card className="p-6 bg-brand-surface border-brand-border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-brand-success/10 rounded-lg text-brand-success border border-brand-success/20">
              <Syringe className="w-5 h-5" />
            </div>
          </div>
          <p className="text-brand-muted text-[10px] font-bold uppercase tracking-widest">Vaccination Coverage</p>
          <h3 className="text-2xl font-bold text-brand-text mt-1">94.8%</h3>
        </Card>

        <Card className="p-6 bg-brand-surface border-brand-border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-400/10 rounded-lg text-purple-400 border border-purple-400/20">
              <Heart className="w-5 h-5" />
            </div>
          </div>
          <p className="text-brand-muted text-[10px] font-bold uppercase tracking-widest">Maternal Care (Live)</p>
          <h3 className="text-2xl font-bold text-brand-text mt-1">12</h3>
        </Card>
      </div>

      <Card className="overflow-hidden bg-brand-surface border-brand-border">
        <div className="p-6 border-b border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-card/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted font-bold" />
            <Input 
              placeholder="Query Resident ID or Medical Findings..." 
              className="pl-10 bg-brand-bg border-brand-border focus:border-brand-primary" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-[10px] font-bold">
               VITAL_SIGNS
            </Button>
            <Button variant="outline" size="sm" className="text-[10px] font-bold">
               VACCINE_LOGS
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-bg text-brand-muted text-[10px] uppercase tracking-widest font-black">
                <th className="px-6 py-4 border-b border-brand-border">Resident Anchor</th>
                <th className="px-6 py-4 border-b border-brand-border">Vital Telemetry</th>
                <th className="px-6 py-4 border-b border-brand-border">Clinical Findings</th>
                <th className="px-6 py-4 border-b border-brand-border">Last Engagement</th>
                <th className="px-6 py-4 border-b border-brand-border">Officer</th>
                <th className="px-6 py-4 border-b border-brand-border text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border text-[11px] font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center text-brand-muted italic">
                    No medical records retrieved from the secure clinical vault.
                  </td>
                </tr>
              ) : filteredRecords.map((r) => (
                <tr key={r.id} className="hover:bg-brand-card/30 transition-colors">
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-brand-bg border border-brand-border flex items-center justify-center">
                           <Stethoscope className="w-3.5 h-3.5 text-brand-primary" />
                        </div>
                        <div>
                           <p className="text-brand-text font-bold uppercase tracking-tight">RES-{r.residentId.slice(0, 8)}</p>
                           {r.isPregnant && <span className="text-[8px] font-black bg-brand-danger/10 text-brand-danger px-1.5 py-0.5 rounded">MATERNAL</span>}
                        </div>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="space-y-1">
                        <div className="flex items-center gap-2">
                           <Activity className="w-3 h-3 text-brand-danger" />
                           <span className="text-brand-text font-black tracking-tight">{r.bloodPressure} mmHg</span>
                        </div>
                        <div className="flex items-center gap-2 opacity-60">
                           <Weight className="w-3 h-3" />
                           <span>{r.weight} kg / {r.height} cm</span>
                        </div>
                     </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <p className="text-brand-text truncate font-bold text-[10px]">{r.findings}</p>
                    <p className="text-brand-muted truncate text-[10px] mt-0.5 italic">{r.treatment}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-brand-muted font-bold font-mono">
                       <History className="w-3 h-3" />
                       <span className="text-[10px]">{format(new Date(r.lastCheckup?.seconds * 1000 || r.lastCheckup), 'MMM dd, HH:mm')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-brand-muted uppercase truncate max-w-[80px] block">{r.recordedBy || 'SYSTEM'}</span>
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
      </Card>
    </div>
  );
};
