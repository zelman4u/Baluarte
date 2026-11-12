import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  Compass, 
  Search, 
  Plus, 
  Trophy, 
  Target, 
  Trees, 
  Cpu,
  Users,
  GraduationCap,
  X,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Card, Button, Input } from '../components/ui/Base';
import { useAuth } from '../context/AuthContext';
import { auditService } from '../services/auditService';
import { notificationService } from '../services/notificationService';
import { cn } from '../lib/utils';

interface YouthProgram {
  id: string;
  title: string;
  category: 'Sports' | 'Scholarship' | 'Environment' | 'Training';
  status: 'Active' | 'Planned' | 'Completed';
  beneficiariesCount: number;
  startDate: any;
}

export const YouthPage: React.FC = () => {
  const [programs, setPrograms] = useState<YouthProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Sports' as YouthProgram['category'],
    status: 'Active' as YouthProgram['status'],
    beneficiariesCount: '45',
    description: ''
  });
  const { profile } = useAuth();

  useEffect(() => {
    if (!profile) return;
    
    const q = query(collection(db, 'youth_programs'), orderBy('startDate', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as YouthProgram[];
      setPrograms(data);
      setLoading(false);
    }, (error) => {
      console.error("Youth programs sync failure:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile]);

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    try {
      const docRef = await addDoc(collection(db, 'youth_programs'), {
        title: formData.title,
        category: formData.category,
        status: formData.status,
        beneficiariesCount: Number(formData.beneficiariesCount) || 0,
        description: formData.description,
        startDate: serverTimestamp(),
        createdBy: profile?.displayName || profile?.email || 'SK Chairman'
      });

      await auditService.logAction({
        userId: profile?.uid || 'sk-officer',
        userName: profile?.displayName || 'SK Chairman',
        userEmail: profile?.email || 'sk@baluarte.gov.ph',
        userRole: profile?.role || 'SKOfficial',
        department: 'Youth',
        action: 'CREATE',
        targetEntity: 'Youth',
        targetId: docRef.id,
        targetName: formData.title,
        details: `Launched SK youth initiative: ${formData.title} (${formData.category})`,
        severity: 'Info'
      });

      notificationService.addNotification({
        title: 'New SK Youth Program Launched',
        message: `${formData.title} is now active with ${formData.beneficiariesCount} projected youth participants.`,
        category: 'system',
        severity: 'info',
        department: 'Administration',
        actionUrl: '/youth'
      });

      setShowAddModal(false);
      setFormData({
        title: '',
        category: 'Sports',
        status: 'Active',
        beneficiariesCount: '45',
        description: ''
      });
    } catch (err) {
      console.error('Error creating program:', err);
    }
  };

  const filteredPrograms = programs.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || p.category.toUpperCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Create Initiative Modal */}
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
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-brand-text uppercase tracking-tight">New Youth Initiative</h3>
                    <p className="text-[10px] text-brand-muted font-bold uppercase tracking-widest leading-none mt-1">Sangguniang Kabataan Baluarte</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 text-brand-muted hover:text-brand-text rounded-lg hover:bg-brand-bg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateProgram} className="p-4 sm:p-6 space-y-4">
                <div>
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Program / Project Title</label>
                  <Input
                    required
                    placeholder="e.g. Inter-Purok Youth Basketball Cup 2026"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-brand-bg min-h-[44px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Category Pillar</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as YouthProgram['category'] })}
                      className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-text focus:outline-none focus:border-brand-primary min-h-[44px]"
                    >
                      <option value="Sports">Sports & Wellness</option>
                      <option value="Scholarship">Scholarship & Academic</option>
                      <option value="Environment">Environmental Stewardship</option>
                      <option value="Training">Livelihood & Digital Skills</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Target Beneficiaries</label>
                    <Input
                      type="number"
                      min="1"
                      required
                      placeholder="e.g. 50"
                      value={formData.beneficiariesCount}
                      onChange={(e) => setFormData({ ...formData, beneficiariesCount: e.target.value })}
                      className="bg-brand-bg min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Initial Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as YouthProgram['status'] })}
                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-text focus:outline-none focus:border-brand-primary min-h-[44px]"
                  >
                    <option value="Active">Active / Ongoing</option>
                    <option value="Planned">Planned / Scheduled</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Program Objectives & Scope</label>
                  <textarea
                    rows={3}
                    placeholder="Objectives, participating youth sectors, schedule..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-brand-bg border border-brand-border rounded-lg p-3 text-xs text-brand-text focus:outline-none focus:border-brand-primary"
                  />
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
                    Launch Program
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
            <span className="text-brand-text text-xs font-bold uppercase tracking-widest">Youth Development</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-brand-text tracking-tight uppercase tracking-[-0.05em] leading-none mb-1 interactive-text cursor-default">
            SK Program Management
          </h1>
          <p className="text-brand-muted text-xs sm:text-sm font-medium">Monitoring youth initiatives, scholarships, and engagement metrics.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 text-brand-success bg-brand-success/5 border border-brand-success/20 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-brand-success rounded-full animate-pulse shadow-[0_0_8px_rgba(63,185,80,0.5)]"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest leading-none">SK Active Session</span>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setSelectedCategory('ALL')}
            className={cn("min-h-[44px] interactive-click", selectedCategory === 'ALL' && "border-brand-primary text-brand-primary")}
          >
            All Initiatives
          </Button>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-brand-primary text-brand-bg uppercase font-black text-xs tracking-wider min-h-[44px] interactive-click shadow-lg shadow-brand-primary/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Initiative
          </Button>
        </div>
      </div>

      {/* Dashboard-Style Staggered Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'Active Programs', val: programs.filter(p => p.status === 'Active').length || 4, icon: Compass, color: 'text-blue-400', bg: 'bg-blue-500/10', change: 'Live' },
          { label: 'Beneficiaries', val: programs.reduce((acc, p) => acc + p.beneficiariesCount, 0) || 280, icon: Users, color: 'text-green-400', bg: 'bg-green-500/10', change: '+18.5%' },
          { label: 'Scholarships Awarded', val: '142', icon: GraduationCap, color: 'text-purple-400', bg: 'bg-purple-500/10', change: 'Academic' },
          { label: 'Green Eco Programs', val: '4 Projects', icon: Trees, color: 'text-emerald-400', bg: 'bg-emerald-500/10', change: 'Eco Active' }
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
              <h3 className="text-2xl font-black text-brand-text mt-1 interactive-text">{stat.val}</h3>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="overflow-hidden bg-brand-surface border-brand-border">
        <div className="p-6 border-b border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-card/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted font-bold" />
            <Input 
              placeholder="Search initiatives or categories..." 
              className="pl-10 bg-brand-bg border-brand-border focus:border-brand-primary" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSelectedCategory(selectedCategory === 'SPORTS' ? 'ALL' : 'SPORTS')}
              className={cn("text-[10px] font-bold min-h-[36px] interactive-click", selectedCategory === 'SPORTS' && "bg-brand-primary text-brand-bg border-brand-primary")}
            >
              SPORTS
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSelectedCategory(selectedCategory === 'SCHOLARSHIP' ? 'ALL' : 'SCHOLARSHIP')}
              className={cn("text-[10px] font-bold min-h-[36px] interactive-click", selectedCategory === 'SCHOLARSHIP' && "bg-brand-primary text-brand-bg border-brand-primary")}
            >
              ACADEMIC
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSelectedCategory(selectedCategory === 'ENVIRONMENT' ? 'ALL' : 'ENVIRONMENT')}
              className={cn("text-[10px] font-bold min-h-[36px] interactive-click", selectedCategory === 'ENVIRONMENT' && "bg-brand-primary text-brand-bg border-brand-primary")}
            >
              GREEN
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-bg text-brand-muted text-[10px] uppercase tracking-widest font-black">
                <th className="px-6 py-4 border-b border-brand-border">Initiative Title</th>
                <th className="px-6 py-4 border-b border-brand-border">Category</th>
                <th className="px-6 py-4 border-b border-brand-border">Impact</th>
                <th className="px-6 py-4 border-b border-brand-border">Status</th>
                <th className="px-6 py-4 border-b border-brand-border text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {loading ? (
                <tr><td colSpan={5} className="py-12 text-center text-brand-muted animate-pulse font-bold uppercase text-[10px]">Synchronizing SK Vault...</td></tr>
              ) : filteredPrograms.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-brand-muted italic">No active youth initiatives found.</td></tr>
              ) : filteredPrograms.map(p => (
                <tr key={p.id} className="hover:bg-brand-card/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-brand-text uppercase">{p.title}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-brand-bg border border-brand-border rounded text-[9px] font-black uppercase text-brand-muted">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono font-bold text-brand-primary">+{p.beneficiariesCount}</span>
                    <span className="text-[8px] text-brand-muted ml-1 uppercase font-bold tracking-tighter">Beneficiaries</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-[9px] font-black uppercase px-2 py-1 rounded-full",
                      p.status === 'Active' ? "bg-green-500/10 text-green-500" : "bg-blue-500/10 text-blue-500"
                    )}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-xs font-black uppercase text-brand-muted hover:text-brand-primary tracking-widest">Detail</button>
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
