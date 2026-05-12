import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Card, Button, Input } from '../components/ui/Base';
import { cn } from '../lib/utils';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ArrowRight,
  Filter,
  Download
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

export const TreasuryPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Revenue',
    category: 'Permit Fees',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const { profile } = useAuth();

  useEffect(() => {
    if (!profile) return;
    const q = query(collection(db, 'treasury'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLogs(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    try {
      await addDoc(collection(db, 'treasury'), {
        ...formData,
        amount: Number(formData.amount),
        recordedBy: profile.displayName || profile.email,
        createdAt: serverTimestamp()
      });
      setShowAddModal(false);
      setFormData({
        type: 'Revenue',
        category: 'Permit Fees',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  const totalRevenue = logs.filter(l => l.type === 'Revenue').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalExpense = logs.filter(l => l.type === 'Expense').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const balance = totalRevenue - totalExpense;

  const chartData = [
    { name: 'Revenue', value: totalRevenue, color: '#16a34a' },
    { name: 'Expenses', value: totalExpense, color: '#dc2626' }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-brand-surface border border-brand-border rounded-xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-brand-border bg-brand-card/50">
              <h3 className="text-lg font-black text-brand-text uppercase tracking-tight">Fiscal Transaction Entry</h3>
              <p className="text-xs text-brand-muted font-bold mt-1 uppercase tracking-widest leading-none">Transparency Ledger V2</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Flow Direction</label>
                  <div className="flex gap-2">
                    {['Revenue', 'Expense'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({...formData, type})}
                        className={cn(
                          "flex-1 py-3 border rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                          formData.type === type 
                            ? (type === 'Revenue' ? "bg-brand-success/20 border-brand-success text-brand-success" : "bg-brand-danger/20 border-brand-danger text-brand-danger")
                            : "bg-brand-bg border-brand-border text-brand-muted"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Category / Source</label>
                  <Input 
                    required
                    placeholder="e.g. Permit Fees, Utility, Payroll..."
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="bg-brand-bg"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Value (₱)</label>
                  <Input 
                    type="number"
                    required
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="bg-brand-bg font-black"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Log Date</label>
                  <Input 
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="bg-brand-bg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1.5 block">Log Description</label>
                  <Input 
                    placeholder="Detailed transaction notes..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
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
                  Discard
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-brand-primary text-brand-bg uppercase font-black text-[10px] tracking-widest"
                >
                  Confirm Audit
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-brand-muted text-xs font-bold uppercase tracking-widest">Finance /</span>
            <span className="text-brand-text text-xs font-bold uppercase tracking-widest">Treasury Oversight</span>
          </div>
          <h1 className="text-2xl font-bold text-brand-text tracking-tight">Barangay Budget Ledger</h1>
          <p className="text-brand-muted text-sm font-medium">Baluarte Fiscal Transparency & Revenue Tracking</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-brand-primary text-brand-bg font-black uppercase tracking-widest text-[10px]">
          <Plus className="w-4 h-4 mr-2" />
          Log Transaction
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-b-2 border-b-brand-success shadow-lg shadow-brand-success/5 bg-brand-surface">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-brand-success/10 rounded-lg border border-brand-success/20">
              <TrendingUp className="w-5 h-5 text-brand-success" />
            </div>
            <span className="text-[10px] font-black text-brand-success uppercase tracking-widest bg-brand-success/5 px-2 py-1 rounded">Budget In</span>
          </div>
          <p className="text-brand-muted text-[10px] font-black uppercase tracking-wider">Total Revenue</p>
          <h3 className="text-3xl font-black text-brand-text mt-1 tracking-tighter">₱{totalRevenue.toLocaleString()}</h3>
        </Card>
        
        <Card className="p-6 border-b-2 border-b-brand-danger shadow-lg shadow-brand-danger/5 bg-brand-surface">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-brand-danger/10 rounded-lg border border-brand-danger/20">
              <TrendingDown className="w-5 h-5 text-brand-danger" />
            </div>
            <span className="text-[10px] font-black text-brand-danger uppercase tracking-widest bg-brand-danger/5 px-2 py-1 rounded">Budget Out</span>
          </div>
          <p className="text-brand-muted text-[10px] font-black uppercase tracking-wider">Total Expenses</p>
          <h3 className="text-3xl font-black text-brand-text mt-1 tracking-tighter">₱{totalExpense.toLocaleString()}</h3>
        </Card>

        <Card className="p-6 border-b-2 border-b-brand-primary shadow-lg shadow-brand-primary/5 bg-brand-primary text-brand-bg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-brand-bg/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-brand-bg" />
            </div>
            <span className="text-[10px] font-black text-brand-bg uppercase tracking-widest bg-brand-bg/10 px-2 py-1 rounded">Net Standing</span>
          </div>
          <p className="text-brand-bg/60 text-[10px] font-black uppercase tracking-wider">Net Balance</p>
          <h3 className="text-3xl font-black mt-1 tracking-tighter">₱{balance.toLocaleString()}</h3>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="p-8 lg:col-span-2 bg-brand-surface border-brand-border">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-black text-brand-text uppercase tracking-widest">Financial Velocity</h3>
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 bg-brand-success rounded-full"></span>
               <span className="text-[10px] font-bold text-brand-muted uppercase">Revenue</span>
               <span className="w-2 h-2 bg-brand-danger rounded-full ml-2"></span>
               <span className="text-[10px] font-bold text-brand-muted uppercase">Expenditure</span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#30363D" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#8B949E', fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#8B949E', fontWeight: 'bold'}} />
                <Tooltip 
                  cursor={{fill: '#161B22'}}
                  contentStyle={{ backgroundColor: '#161B22', borderRadius: '8px', border: '1px solid #30363D', color: '#E6EDF3', fontSize: '12px' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={50}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-8 bg-brand-surface border-brand-border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-black text-brand-text uppercase tracking-widest">Recent Activity</h3>
            <Button variant="outline" size="sm" className="text-[10px] font-bold px-3">LEDGER</Button>
          </div>
          <div className="space-y-4">
            {logs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-brand-bg rounded-lg border border-brand-border">
                <div className="flex items-center gap-3">
                  <div className={cn("p-1.5 rounded border", log.type === 'Revenue' ? 'bg-brand-success/5 text-brand-success border-brand-success/20' : 'bg-brand-danger/5 text-brand-danger border-brand-danger/20')}>
                    {log.type === 'Revenue' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-brand-text">{log.category}</p>
                    <p className="text-[10px] text-brand-muted truncate max-w-[120px]">{log.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn("text-xs font-black", log.type === 'Revenue' ? 'text-brand-success' : 'text-brand-danger')}>
                    {log.type === 'Revenue' ? '+' : '-'} ₱{Number(log.amount).toLocaleString()}
                  </p>
                  <p className="text-[9px] text-brand-muted font-bold uppercase tracking-tighter">{log.date && format(new Date(log.date), 'MMM dd')}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden border-brand-border h-full">
        <div className="p-6 bg-brand-surface border-b border-brand-border flex items-center justify-between">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Official Audit Trail</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-[10px] font-bold">SORT</Button>
            <Button variant="outline" size="sm" className="text-[10px] font-bold">EXPORT</Button>
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-brand-bg text-[9px] uppercase font-black text-brand-muted tracking-[0.15em] border-b border-brand-border">
            <tr>
              <th className="px-8 py-4">Ref_ID</th>
              <th className="px-8 py-4">Trans_Type</th>
              <th className="px-8 py-4">Cat_Registry</th>
              <th className="px-8 py-4">Val_Amount</th>
              <th className="px-8 py-4">Auth_Signee</th>
              <th className="px-8 py-4 text-right">Ops</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border text-[11px] font-medium bg-brand-card">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-brand-bg/50 transition-colors group">
                <td className="px-8 py-4 font-mono text-brand-muted group-hover:text-brand-primary">{log.id.slice(0, 8)}</td>
                <td className="px-8 py-4">
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                    log.type === 'Revenue' ? 'bg-brand-success/10 text-brand-success border-brand-success/20' : 'bg-brand-danger/10 text-brand-danger border-brand-danger/20'
                  )}>{log.type}</span>
                </td>
                <td className="px-8 py-4 text-brand-text font-bold">{log.category}</td>
                <td className="px-8 py-4 text-brand-text font-black tracking-tight">₱{Number(log.amount).toLocaleString()}</td>
                <td className="px-8 py-4 text-brand-muted font-bold italic">{log.recordedBy || 'ROOT'}</td>
                <td className="px-8 py-4 text-right">
                  <button className="text-brand-muted hover:text-brand-primary transition-colors">
                    <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
