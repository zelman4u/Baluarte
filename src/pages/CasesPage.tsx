import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scale, 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Gavel, 
  Printer, 
  Users, 
  Eye, 
  X,
  FileCheck,
  Building,
  ShieldCheck,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Card, Button, Input } from '../components/ui/Base';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { auditService } from '../services/auditService';

export interface KPCase {
  id: string;
  caseNumber: string;
  disputeNature: string;
  complainantName: string;
  complainantAddress: string;
  respondentName: string;
  respondentAddress: string;
  filingDate: string;
  stage: 'PB Mediation' | 'Pangkat Conciliation' | 'Settled' | 'CFA Issued' | 'Dismissed';
  pangkatConstituted: boolean;
  assignedLuponMembers: string[];
  hearingDate?: string;
  hearingTime?: string;
  narrative: string;
  settlementTerms?: string;
  cfaGrounds?: string;
  cfaIssuedAt?: string;
  recordedBy: string;
}

const DEFAULT_KP_CASES: KPCase[] = [
  {
    id: 'kp-001',
    caseNumber: 'KP-2026-0012',
    disputeNature: 'Boundary Line & Encroachment',
    complainantName: 'Juan Dela Cruz',
    complainantAddress: 'Purok 2 San Jose, Baluarte',
    respondentName: 'Mario Santos',
    respondentAddress: 'Purok 2 San Jose, Baluarte',
    filingDate: '2026-10-14',
    stage: 'PB Mediation',
    pangkatConstituted: false,
    assignedLuponMembers: ['PB Roberto Gomez', 'Lupon Sec. Ana Reyes'],
    hearingDate: '2026-11-12',
    hearingTime: '09:00 AM',
    narrative: 'Complainant alleges respondent erected a perimeter fence encroaching 1.5 meters into titled lot boundary.',
    recordedBy: 'PB Roberto Gomez'
  },
  {
    id: 'kp-002',
    caseNumber: 'KP-2026-0014',
    disputeNature: 'Small Claims / Debt Collection (₱28,000)',
    complainantName: 'Maria Theresa Ramos',
    complainantAddress: 'Purok 1 Central, Baluarte',
    respondentName: 'Carlos Bautista',
    respondentAddress: 'Purok 4 Highway, Baluarte',
    filingDate: '2026-10-02',
    stage: 'Pangkat Conciliation',
    pangkatConstituted: true,
    assignedLuponMembers: ['Kgd. Vicente Morales', 'Lupon Elena Dizon', 'Lupon Dante Castro'],
    hearingDate: '2026-11-15',
    hearingTime: '02:00 PM',
    narrative: 'Non-payment of agricultural produce balance delivered in August 2026. Elevated to Pangkat Tagapagkasundo.',
    recordedBy: 'Lupon Sec. Ana Reyes'
  },
  {
    id: 'kp-003',
    caseNumber: 'KP-2026-0008',
    disputeNature: 'Unjust Vexation & Neighborhood Disturbance',
    complainantName: 'Rodrigo Flores',
    complainantAddress: 'Purok 3 Riverside, Baluarte',
    respondentName: 'Federico Tan',
    respondentAddress: 'Purok 3 Riverside, Baluarte',
    filingDate: '2026-09-20',
    stage: 'Settled',
    pangkatConstituted: false,
    assignedLuponMembers: ['PB Roberto Gomez'],
    narrative: 'Excessive videoke volume past 10:00 PM curfew and barking guard dogs without proper confinement.',
    settlementTerms: 'Both parties executed Amicable Settlement (KP Form 16) agreeing to honor barangay curfew.',
    recordedBy: 'PB Roberto Gomez'
  }
];

export const CasesPage: React.FC = () => {
  const { profile } = useAuth();
  const [cases, setCases] = useState<KPCase[]>(DEFAULT_KP_CASES);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState<KPCase | null>(null);

  const [formData, setFormData] = useState({
    caseNumber: `KP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    disputeNature: 'Boundary Line & Encroachment',
    complainantName: '',
    complainantAddress: 'Purok 1 Central, Baluarte',
    respondentName: '',
    respondentAddress: 'Purok 1 Central, Baluarte',
    filingDate: new Date().toISOString().split('T')[0],
    hearingDate: '',
    hearingTime: '09:00 AM',
    narrative: '',
    assignedLuponMembers: 'PB Roberto Gomez, Lupon Sec. Ana Reyes'
  });

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const assigned = formData.assignedLuponMembers.split(',').map(s => s.trim()).filter(Boolean);
      const newCase: KPCase = {
        id: `case-${Date.now()}`,
        ...formData,
        stage: 'PB Mediation',
        pangkatConstituted: false,
        assignedLuponMembers: assigned,
        recordedBy: profile?.displayName || profile?.email || 'Lupon Secretary'
      };

      setCases(prev => [newCase, ...prev]);

      await auditService.logAction({
        userId: profile?.uid || 'usr_anonymous',
        userName: profile?.displayName || 'Lupon Secretary',
        userEmail: profile?.email || '',
        userRole: profile?.role || 'Staff',
        department: 'Justice',
        action: 'CREATE',
        targetEntity: 'Case',
        targetId: newCase.caseNumber,
        targetName: `${newCase.caseNumber}: ${newCase.complainantName} vs. ${newCase.respondentName}`,
        details: `Docketed KP case for "${newCase.disputeNature}". Initial hearing scheduled on ${newCase.hearingDate || 'TBD'}.`,
        severity: 'Info'
      });

      setShowAddModal(false);
      setFormData({
        caseNumber: `KP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        disputeNature: 'Boundary Line & Encroachment',
        complainantName: '',
        complainantAddress: 'Purok 1 Central, Baluarte',
        respondentName: '',
        respondentAddress: 'Purok 1 Central, Baluarte',
        filingDate: new Date().toISOString().split('T')[0],
        hearingDate: '',
        hearingTime: '09:00 AM',
        narrative: '',
        assignedLuponMembers: 'PB Roberto Gomez, Lupon Sec. Ana Reyes'
      });
    } catch (err) {
      console.error('Failed to add case:', err);
    }
  };

  const handleAdvanceStage = async (caseId: string, newStage: KPCase['stage']) => {
    setCases(prev => prev.map(c => c.id === caseId ? { ...c, stage: newStage } : c));
    if (selectedCase && selectedCase.id === caseId) {
      setSelectedCase(prev => prev ? { ...prev, stage: newStage } : null);
    }

    await auditService.logAction({
      userId: profile?.uid || 'usr_anonymous',
      userName: profile?.displayName || 'Lupon Officer',
      userEmail: profile?.email || '',
      userRole: profile?.role || 'Staff',
      department: 'Justice',
      action: 'STATUS_CHANGE',
      targetEntity: 'Case',
      targetId: caseId,
      targetName: `Case #${caseId}`,
      details: `Dispute stage advanced to ${newStage}`,
      severity: newStage === 'CFA Issued' ? 'Warning' : 'Info'
    });
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch = 
      c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.complainantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.respondentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.disputeNature.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === 'All' || c.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase bg-brand-primary/10 text-brand-primary border border-brand-primary/30">
              Katarungang Pambarangay (RA 7160)
            </span>
            <span className="text-xs text-brand-muted font-medium">Baluarte Lupon Tagapamayapa</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-brand-text tracking-tight uppercase flex items-center gap-3 interactive-text">
            <Scale className="w-8 h-8 text-brand-primary" />
            Justice & Dispute Mediation Docket
          </h1>
          <p className="text-sm text-brand-muted mt-1">
            Punong Barangay mediation, Pangkat Tagapagkasundo conciliation, and Certificate to File Action (CFA) records.
          </p>
        </div>

        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-brand-primary text-brand-bg font-black uppercase tracking-wider text-xs interactive-click active:scale-95"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Docket New KP Complaint
        </Button>
      </div>

      {/* Dashboard-Style Staggered Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'Active Docket Cases', value: cases.length, icon: Scale, color: 'text-brand-primary', bg: 'bg-brand-primary/10', change: 'Docketed' },
          { label: 'PB Mediation Phase', value: cases.filter(c => c.stage === 'PB Mediation').length, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10', change: 'Hearing' },
          { label: 'Pangkat Conciliation', value: cases.filter(c => c.stage === 'Pangkat Conciliation').length, icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10', change: 'Elevated' },
          { label: 'Amicably Settled', value: cases.filter(c => c.stage === 'Settled').length, icon: CheckCircle2, color: 'text-brand-success', bg: 'bg-brand-success/10', change: '84% Rate' },
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

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-brand-surface border-brand-border flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
          <Input 
            placeholder="Search case #, complainant, respondent, or dispute nature..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 bg-brand-bg text-brand-text text-xs"
          />
        </div>

        <div className="flex items-center gap-1 bg-brand-bg p-1 rounded-lg border border-brand-border overflow-x-auto">
          {['All', 'PB Mediation', 'Pangkat Conciliation', 'Settled', 'CFA Issued'].map(st => (
            <button
              key={st}
              onClick={() => setStageFilter(st)}
              className={cn(
                "px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded transition-all interactive-click active:scale-95 whitespace-nowrap",
                stageFilter === st 
                  ? "bg-brand-primary text-brand-bg shadow-sm"
                  : "text-brand-muted hover:text-brand-text"
              )}
            >
              {st}
            </button>
          ))}
        </div>
      </Card>

      {/* Cases Table */}
      <Card className="overflow-hidden bg-brand-surface border-brand-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-bg text-brand-muted text-[10px] uppercase font-black tracking-widest border-b border-brand-border">
              <tr>
                <th className="px-6 py-4">Case Docket</th>
                <th className="px-6 py-4">Dispute Particulars</th>
                <th className="px-6 py-4">Parties Involved</th>
                <th className="px-6 py-4">Mediation Stage</th>
                <th className="px-6 py-4">Next Hearing</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-brand-muted italic">
                    No matching cases found in docket registry.
                  </td>
                </tr>
              ) : filteredCases.map(c => (
                <tr 
                  key={c.id} 
                  onClick={() => setSelectedCase(c)}
                  className="hover:bg-brand-card/50 transition-colors cursor-pointer group interactive-click active:scale-[0.99]"
                >
                  <td className="px-6 py-4 font-mono font-bold text-brand-primary group-hover:underline">
                    {c.caseNumber}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-brand-text">{c.disputeNature}</p>
                    <p className="text-[10px] text-brand-muted line-clamp-1">{c.narrative}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-brand-text font-medium"><span className="text-brand-muted">C:</span> {c.complainantName}</p>
                    <p className="text-brand-text font-medium"><span className="text-brand-muted">R:</span> {c.respondentName}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border",
                      c.stage === 'Settled' ? "bg-brand-success/10 text-brand-success border-brand-success/20" :
                      c.stage === 'CFA Issued' ? "bg-brand-danger/10 text-brand-danger border-brand-danger/20" :
                      c.stage === 'Pangkat Conciliation' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                      "bg-brand-primary/10 text-brand-primary border-brand-primary/20"
                    )}>
                      {c.stage}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-[11px] text-brand-muted">
                    {c.hearingDate ? `${c.hearingDate} @ ${c.hearingTime}` : 'Pending Notice'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-[10px] font-bold text-brand-primary hover:underline uppercase">
                      Inspect →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Case Detail Modal */}
      <AnimatePresence>
        {selectedCase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 16 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="p-4 sm:p-6 border-b border-brand-border bg-brand-card/50 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-mono uppercase text-brand-muted font-bold">Katarungang Pambarangay Docket</span>
                  <h3 className="text-base sm:text-lg font-black text-brand-text uppercase tracking-tight">{selectedCase.caseNumber}</h3>
                </div>
                <button 
                  onClick={() => setSelectedCase(null)} 
                  className="p-2 text-brand-muted hover:text-brand-text rounded-lg hover:bg-brand-bg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 sm:p-6 space-y-4 text-xs">
                <div className="p-3 bg-brand-bg rounded-lg border border-brand-border">
                  <span className="text-[9px] font-black uppercase tracking-widest text-brand-muted block mb-1">Dispute Matter</span>
                  <p className="font-bold text-brand-text text-sm">{selectedCase.disputeNature}</p>
                  <p className="text-brand-muted mt-1 leading-relaxed">{selectedCase.narrative}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 bg-brand-bg rounded-lg border border-brand-border">
                    <span className="text-[9px] font-black uppercase tracking-widest text-brand-muted block mb-1">Complainant</span>
                    <p className="font-bold text-brand-text">{selectedCase.complainantName}</p>
                    <p className="text-[10px] text-brand-muted">{selectedCase.complainantAddress}</p>
                  </div>
                  <div className="p-3 bg-brand-bg rounded-lg border border-brand-border">
                    <span className="text-[9px] font-black uppercase tracking-widest text-brand-muted block mb-1">Respondent</span>
                    <p className="font-bold text-brand-text">{selectedCase.respondentName}</p>
                    <p className="text-[10px] text-brand-muted">{selectedCase.respondentAddress}</p>
                  </div>
                </div>

                <div className="p-3 bg-brand-bg rounded-lg border border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-brand-muted block">Current Stage</span>
                    <p className="font-bold text-brand-primary">{selectedCase.stage}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleAdvanceStage(selectedCase.id, 'Pangkat Conciliation')}
                      className="text-[10px] font-bold uppercase min-h-[36px] interactive-click"
                    >
                      Elevate to Pangkat
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleAdvanceStage(selectedCase.id, 'Settled')}
                      className="bg-brand-success text-brand-bg text-[10px] font-black uppercase min-h-[36px] interactive-click"
                    >
                      Mark Settled
                    </Button>
                    <Button 
                      size="sm" 
                      variant="danger"
                      onClick={() => handleAdvanceStage(selectedCase.id, 'CFA Issued')}
                      className="text-[10px] font-black uppercase min-h-[36px] interactive-click"
                    >
                      Issue CFA
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-brand-border">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      auditService.logAction({
                        userId: profile?.uid || 'lupon-sec',
                        userName: profile?.displayName || 'Lupon Secretary',
                        userEmail: profile?.email || 'lupon@baluarte.gov.ph',
                        userRole: profile?.role || 'Lupon',
                        department: 'Justice',
                        action: 'UPDATE',
                        targetEntity: 'Case',
                        targetId: selectedCase.id,
                        targetName: selectedCase.caseNumber,
                        details: `Printed official KP Form 7 summons for ${selectedCase.caseNumber}`,
                        severity: 'Info'
                      });
                    }} 
                    className="flex-1 text-[10px] font-bold uppercase min-h-[44px] interactive-click"
                  >
                    Print KP Form 7
                  </Button>
                  <Button 
                    onClick={() => setSelectedCase(null)} 
                    className="flex-1 bg-brand-primary text-brand-bg text-[10px] font-black uppercase min-h-[44px] interactive-click"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: New Case */}
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
                <div>
                  <h3 className="text-base font-black text-brand-text uppercase tracking-tight">Docket New KP Complaint</h3>
                  <p className="text-[10px] text-brand-muted uppercase font-bold tracking-widest leading-none mt-1">Katarungang Pambarangay Office</p>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)} 
                  className="p-2 text-brand-muted hover:text-brand-text rounded-lg hover:bg-brand-bg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateCase} className="p-4 sm:p-6 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-brand-muted mb-1 block">Case Docket Number</label>
                    <Input required value={formData.caseNumber} onChange={e => setFormData({...formData, caseNumber: e.target.value})} className="bg-brand-bg text-brand-text font-mono font-bold min-h-[44px]" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-brand-muted mb-1 block">Filing Date</label>
                    <Input type="date" required value={formData.filingDate} onChange={e => setFormData({...formData, filingDate: e.target.value})} className="bg-brand-bg text-brand-text min-h-[44px]" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-brand-muted mb-1 block">Nature of Dispute</label>
                  <Input required placeholder="e.g. Boundary Line & Encroachment, Small Claims Debt" value={formData.disputeNature} onChange={e => setFormData({...formData, disputeNature: e.target.value})} className="bg-brand-bg text-brand-text min-h-[44px]" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-brand-muted mb-1 block">Complainant Full Name</label>
                    <Input required placeholder="Juan Dela Cruz" value={formData.complainantName} onChange={e => setFormData({...formData, complainantName: e.target.value})} className="bg-brand-bg text-brand-text min-h-[44px]" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-brand-muted mb-1 block">Respondent Full Name</label>
                    <Input required placeholder="Mario Santos" value={formData.respondentName} onChange={e => setFormData({...formData, respondentName: e.target.value})} className="bg-brand-bg text-brand-text min-h-[44px]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-brand-muted mb-1 block">Hearing Date</label>
                    <Input type="date" value={formData.hearingDate} onChange={e => setFormData({...formData, hearingDate: e.target.value})} className="bg-brand-bg text-brand-text min-h-[44px]" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-brand-muted mb-1 block">Hearing Time</label>
                    <Input value={formData.hearingTime} onChange={e => setFormData({...formData, hearingTime: e.target.value})} className="bg-brand-bg text-brand-text min-h-[44px]" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-brand-muted mb-1 block">Complaint Narrative</label>
                  <textarea 
                    rows={3} 
                    required 
                    placeholder="Summary of facts, incident dates, and remedies requested..."
                    value={formData.narrative} 
                    onChange={e => setFormData({...formData, narrative: e.target.value})}
                    className="w-full bg-brand-bg border border-brand-border rounded-lg p-3 text-brand-text focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div className="flex gap-3 pt-3 border-t border-brand-border">
                  <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="flex-1 text-xs font-bold uppercase min-h-[44px] interactive-click">Cancel</Button>
                  <Button type="submit" className="flex-1 bg-brand-primary text-brand-bg text-xs font-black uppercase min-h-[44px] interactive-click shadow-lg shadow-brand-primary/20">Confirm Docket</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
