import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Compass, 
  Search, 
  Plus, 
  Trophy, 
  Target, 
  Trees, 
  Cpu,
  Users,
  GraduationCap
} from 'lucide-react';
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Card, Button, Input } from '../components/ui/Base';
import { useAuth } from '../context/AuthContext';
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

  const filteredPrograms = programs.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-brand-muted text-xs font-bold uppercase tracking-widest">Community /</span>
            <span className="text-brand-text text-xs font-bold uppercase tracking-widest">Youth Development</span>
          </div>
          <h1 className="text-4xl font-bold text-brand-text tracking-tight uppercase tracking-[-0.05em] leading-none mb-1">SK Program Management</h1>
          <p className="text-brand-muted text-sm font-medium">Monitoring youth initiatives, scholarships, and engagement metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="hidden lg:flex">
            Youth Census
          </Button>
          <Button className="bg-brand-primary text-brand-bg uppercase font-black text-[10px] tracking-widest">
            <Plus className="w-4 h-4 mr-2" />
            New Initiative
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Active Programs', val: programs.filter(p => p.status === 'Active').length, icon: Compass, color: 'text-blue-400' },
          { label: 'Beneficiaries', val: programs.reduce((acc, p) => acc + p.beneficiariesCount, 0), icon: Users, color: 'text-green-400' },
          { label: 'Scholarships', val: '142', icon: GraduationCap, color: 'text-purple-400' },
          { label: 'Environmental', val: '4', icon: Trees, color: 'text-emerald-400' }
        ].map((stat, i) => (
          <Card key={i} className="p-6 bg-brand-surface border-brand-border">
            <div className={stat.color}>
              <stat.icon className="w-5 h-5 mb-4" />
            </div>
            <p className="text-brand-muted text-[10px] font-bold uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-2xl font-bold text-brand-text mt-1">{stat.val}</h3>
          </Card>
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
            <Button variant="outline" size="sm" className="text-[10px] font-bold">SPORTS</Button>
            <Button variant="outline" size="sm" className="text-[10px] font-bold">ACADEMIC</Button>
            <Button variant="outline" size="sm" className="text-[10px] font-bold">GREEN</Button>
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
