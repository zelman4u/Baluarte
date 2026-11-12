import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  Users, 
  MapPin, 
  TrendingUp,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { collection, query, onSnapshot, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Card, Button, Input } from '../components/ui/Base';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

interface Household {
  id: string;
  householdNumber: string;
  headId: string;
  address: string;
  totalMembers: number;
  latitude?: number;
  longitude?: number;
}

export const HouseholdsPage: React.FC = () => {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    householdNumber: '',
    headId: '',
    address: '',
    totalMembers: ''
  });
  const { profile } = useAuth();

  useEffect(() => {
    if (!profile) return;
    const q = query(collection(db, 'households'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHouseholds(data as Household[]);
      setLoading(false);
    }, (error) => {
      console.warn("Households sync warning:", error.message);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    try {
      await addDoc(collection(db, 'households'), {
        ...formData,
        totalMembers: Number(formData.totalMembers),
        createdAt: serverTimestamp(),
        recordedBy: profile.displayName || profile.email
      });
      setShowAddModal(false);
      setFormData({
        householdNumber: '',
        headId: '',
        address: '',
        totalMembers: ''
      });
    } catch (error) {
      console.error("Error adding household:", error);
    }
  };

  const filteredHouseholds = households.filter(h => 
    h.householdNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Add Household Modal with fluid motion */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
              <div className="p-4 sm:p-6 border-b border-brand-border bg-brand-card/50 flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-brand-text uppercase tracking-tight">Register Household Unit</h3>
                  <p className="text-[10px] text-brand-muted font-bold mt-0.5 uppercase tracking-widest font-mono">Demographic Mapping Protocol</p>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-brand-muted hover:text-brand-text hover:bg-brand-bg transition-colors min-h-[36px] min-w-[36px] interactive-click"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Household Serial #</label>
                    <Input 
                      required
                      placeholder="e.g. 2026-001"
                      value={formData.householdNumber}
                      onChange={(e) => setFormData({...formData, householdNumber: e.target.value})}
                      className="bg-brand-bg uppercase min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Head of Family ID / Name</label>
                    <Input 
                      required
                      placeholder="e.g. Roberto Santos"
                      value={formData.headId}
                      onChange={(e) => setFormData({...formData, headId: e.target.value})}
                      className="bg-brand-bg min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Purok / Zone Address</label>
                    <Input 
                      required
                      placeholder="e.g. Purok 2, San Jose"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="bg-brand-bg min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Total Occupants (Member Count)</label>
                    <Input 
                      type="number"
                      required
                      min="1"
                      placeholder="1"
                      value={formData.totalMembers}
                      onChange={(e) => setFormData({...formData, totalMembers: e.target.value})}
                      className="bg-brand-bg min-h-[44px]"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 pt-2">
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
                    Save Unit
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
            <span className="text-brand-text text-xs font-bold uppercase tracking-widest">Household Registry</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-brand-text tracking-tight uppercase tracking-[-0.05em] leading-none mb-1 interactive-text cursor-default">
            Residential Clusters
          </h1>
          <p className="text-brand-muted text-xs sm:text-sm font-medium">Baluarte Household Profiling & Location Analytics</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button variant="outline" className="hidden lg:flex min-h-[44px] interactive-click">
            Map View
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="bg-brand-primary text-brand-bg uppercase font-black text-xs tracking-wider min-h-[44px] interactive-click shadow-lg shadow-brand-primary/20">
            <Plus className="w-4 h-4 mr-2" />
            Cluster Record
          </Button>
        </div>
      </div>

      {/* Dashboard-Style Staggered Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'Total Households', value: households.length || '2,158', icon: Home, color: 'text-brand-primary', bg: 'bg-brand-primary/10', change: '+0.8%' },
          { label: 'Avg. Members/HH', value: '4.2', icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10', change: 'Census' },
          { label: 'Geotagged Clusters', value: '82%', icon: MapPin, color: 'text-brand-success', bg: 'bg-brand-success/10', change: 'Live GIS' },
          { label: 'Verified Residences', value: '98.4%', icon: Activity, color: 'text-amber-400', bg: 'bg-amber-400/10', change: 'RBI Valid' },
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
              placeholder="Query HH number, address, or cluster..." 
              className="pl-10 bg-brand-bg border-brand-border focus:border-brand-primary" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-3 h-3 mr-2" />
              Purok Level
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-bg text-brand-muted text-[10px] uppercase tracking-widest font-black">
                <th className="px-6 py-4 border-b border-brand-border">Household Serial</th>
                <th className="px-6 py-4 border-b border-brand-border">Head of Family</th>
                <th className="px-6 py-4 border-b border-brand-border">Location / Purok</th>
                <th className="px-6 py-4 border-b border-brand-border">Members</th>
                <th className="px-6 py-4 border-b border-brand-border">Coordinates</th>
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
              ) : filteredHouseholds.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center text-brand-muted italic font-medium">
                    No residential records found in the current cluster range.
                  </td>
                </tr>
              ) : filteredHouseholds.map((h) => (
                <tr key={h.id} className="hover:bg-brand-card/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-brand-bg border border-brand-border flex items-center justify-center">
                        <Home className="w-4 h-4 text-brand-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-brand-text">HH-{h.householdNumber}</p>
                        <p className="text-[10px] text-brand-muted font-mono uppercase">UID: {h.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-brand-text uppercase tracking-tight">FAMILY HEAD ID: {h.headId.slice(0, 10)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-brand-text font-medium">{h.address}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black bg-brand-bg border border-brand-border px-2 py-1 rounded text-brand-primary">
                      {h.totalMembers} PAX
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] text-brand-muted font-mono">
                      {h.latitude ? `${h.latitude}, ${h.longitude}` : 'UNSET'}
                    </span>
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
