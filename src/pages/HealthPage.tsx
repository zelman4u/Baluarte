import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
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
  Weight,
  X
} from 'lucide-react';
import { collection, query, onSnapshot, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Card, Button, Input } from '../components/ui/Base';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { auditService } from '../services/auditService';

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
      const docRef = await addDoc(collection(db, 'health_records'), {
        ...formData,
        height: Number(formData.height),
        weight: Number(formData.weight),
        lastCheckup: serverTimestamp(),
        recordedBy: profile.displayName || profile.email
      });
      
      await auditService.logAction({
        userId: profile.uid || 'system',
        userName: profile.displayName || profile.email || 'Health Officer',
        userEmail: profile.email || 'health@baluarte.gov.ph',
        userRole: profile.role || 'BHW',
        department: 'Health',
        action: 'CREATE',
        targetEntity: 'Welfare',
        targetId: docRef.id,
        targetName: `Resident ${formData.residentId}`,
        details: `Logged clinical entry (${formData.bloodPressure}, ${formData.weight}kg)`,
        severity: 'Info'
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
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="bg-brand-surface border border-brand-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="p-4 sm:p-6 border-b border-brand-border bg-brand-card/50 flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-brand-text uppercase tracking-tight">New Clinical Entry</h3>
                  <p className="text-[10px] text-brand-muted font-bold mt-1 uppercase tracking-widest leading-none">Baluarte Health Station Registry</p>
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
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Resident Identifier / Name</label>
                    <Input 
                      required
                      placeholder="e.g. RES-2026-001 or Juan dela Cruz"
                      value={formData.residentId}
                      onChange={(e) => setFormData({...formData, residentId: e.target.value})}
                      className="bg-brand-bg uppercase min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Height (cm)</label>
                    <Input 
                      type="number"
                      required
                      placeholder="165"
                      value={formData.height}
                      onChange={(e) => setFormData({...formData, height: e.target.value})}
                      className="bg-brand-bg min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Weight (kg)</label>
                    <Input 
                      type="number"
                      required
                      placeholder="60"
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                      className="bg-brand-bg min-h-[44px]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Blood Pressure (mmHg)</label>
                    <Input 
                      required
                      placeholder="120/80"
                      value={formData.bloodPressure}
                      onChange={(e) => setFormData({...formData, bloodPressure: e.target.value})}
                      className="bg-brand-bg min-h-[44px]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Clinical Findings</label>
                    <textarea 
                      className="w-full bg-brand-bg border border-brand-border rounded-lg p-3 text-xs text-brand-text h-24 focus:outline-none focus:border-brand-primary"
                      required
                      placeholder="Patient reports mild cough and fever..."
                      value={formData.findings}
                      onChange={(e) => setFormData({...formData, findings: e.target.value})}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Treatment / Prescription</label>
                    <Input 
                      value={formData.treatment}
                      placeholder="Paracetamol 500mg TDS x 3 days, rest"
                      onChange={(e) => setFormData({...formData, treatment: e.target.value})}
                      className="bg-brand-bg min-h-[44px]"
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-3 bg-brand-bg/50 p-3 rounded-lg border border-brand-border">
                    <input 
                      type="checkbox" 
                      id="isPregnant"
                      checked={formData.isPregnant}
                      onChange={(e) => setFormData({...formData, isPregnant: e.target.checked})}
                      className="w-4 h-4 accent-brand-primary cursor-pointer"
                    />
                    <label htmlFor="isPregnant" className="text-[10px] font-black text-brand-text uppercase tracking-widest cursor-pointer">Mark as Maternal Case</label>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-3">
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
                    Save Clinical Entry
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
            <span className="text-brand-muted text-xs font-bold uppercase tracking-widest">Portal /</span>
            <span className="text-brand-text text-xs font-bold uppercase tracking-widest">Health Registry</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-brand-text tracking-tight uppercase tracking-[-0.05em] leading-none mb-1 interactive-text cursor-default">
            Medical Surveillance
          </h1>
          <p className="text-brand-muted text-xs sm:text-sm font-medium">Baluarte Health Center Resident Monitoring & Records Audit</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 text-brand-success bg-brand-success/5 border border-brand-success/20 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-brand-success rounded-full animate-pulse shadow-[0_0_8px_rgba(63,185,80,0.5)]"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Health Station Live</span>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="bg-brand-primary text-brand-bg uppercase font-black text-xs tracking-wider min-h-[44px] interactive-click shadow-lg shadow-brand-primary/20">
            <Plus className="w-4 h-4 mr-2" />
            Clinical Entry
          </Button>
        </div>
      </div>

      {/* Dashboard-Style Staggered Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'Active Consultations', value: (records.length || 24).toString(), icon: Activity, color: 'text-brand-danger', bg: 'bg-brand-danger/10', change: 'Live' },
          { label: 'Vaccination Coverage', value: '94.8%', icon: Syringe, color: 'text-brand-success', bg: 'bg-brand-success/10', change: '+1.2%' },
          { label: 'Maternal Care Roster', value: '18 Cases', icon: Heart, color: 'text-pink-400', bg: 'bg-pink-400/10', change: 'Monitored' },
          { label: 'Medicine Inventory', value: '100% OK', icon: Stethoscope, color: 'text-brand-primary', bg: 'bg-brand-primary/10', change: 'Stocked' },
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
