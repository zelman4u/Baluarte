import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
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
      {/* Add Household Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-brand-surface border border-brand-border rounded-xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-brand-border bg-brand-card/50">
              <h3 className="text-lg font-black text-brand-text uppercase tracking-tight">Register Structural Unit</h3>
              <p className="text-xs text-brand-muted font-bold mt-1 uppercase tracking-widest leading-none">Demographic Mapping Protocol</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Household ID #</label>
                  <Input 
                    required
                    placeholder="e.g. 2026-001"
                    value={formData.householdNumber}
                    onChange={(e) => setFormData({...formData, householdNumber: e.target.value})}
                    className="bg-brand-bg uppercase"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Head of Family ID / Name</label>
                  <Input 
                    required
                    placeholder="Unique Identifier or Name..."
                    value={formData.headId}
                    onChange={(e) => setFormData({...formData, headId: e.target.value})}
                    className="bg-brand-bg uppercase"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Geospatial Address (Purok/Zone)</label>
                  <Input 
                    required
                    placeholder="e.g. Purok 1, Zone B"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="bg-brand-bg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Total Occupants (Member Count)</label>
                  <Input 
                    type="number"
                    required
                    placeholder="1"
                    value={formData.totalMembers}
                    onChange={(e) => setFormData({...formData, totalMembers: e.target.value})}
                    className="bg-brand-bg"
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
                  Terminate
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-brand-primary text-brand-bg uppercase font-black text-[10px] tracking-widest"
                >
                  Map Entry
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-brand-muted text-xs font-bold uppercase tracking-widest">Portal /</span>
            <span className="text-brand-text text-xs font-bold uppercase tracking-widest">Household Registry</span>
          </div>
          <h1 className="text-2xl font-bold text-brand-text tracking-tight">Residential Clusters</h1>
          <p className="text-brand-muted text-sm font-medium">Baluarte Household Profiling & Location Analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="hidden lg:flex">
            Map View
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="bg-brand-primary text-brand-bg uppercase font-black text-[10px] tracking-widest">
            <Plus className="w-4 h-4 mr-2" />
            Cluster Record
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-brand-surface border-brand-border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary border border-brand-primary/20">
              <Home className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1 text-brand-success text-[10px] font-bold bg-brand-success/10 px-2 py-0.5 rounded-full border border-brand-success/20">
              <ArrowUpRight className="w-2.5 h-2.5" />
              +0.8%
            </div>
          </div>
          <p className="text-brand-muted text-[10px] font-bold uppercase tracking-widest">Total Households</p>
          <h3 className="text-2xl font-bold text-brand-text mt-1">{households.length}</h3>
        </Card>
        
        <Card className="p-6 bg-brand-surface border-brand-border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-400/10 rounded-lg text-purple-400 border border-purple-400/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-brand-muted text-[10px] font-bold uppercase tracking-widest">Avg. Members/HH</p>
          <h3 className="text-2xl font-bold text-brand-text mt-1">4.2</h3>
        </Card>

        <Card className="p-6 bg-brand-surface border-brand-border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-brand-success/10 rounded-lg text-brand-success border border-brand-success/20">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
          <p className="text-brand-muted text-[10px] font-bold uppercase tracking-widest">Geotagged Clusters</p>
          <h3 className="text-2xl font-bold text-brand-text mt-1">82%</h3>
        </Card>
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
