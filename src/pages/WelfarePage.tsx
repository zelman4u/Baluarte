import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Users, 
  FileCheck, 
  Coins, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Filter,
  Download,
  AlertCircle
} from 'lucide-react';
import { Card } from '../components/ui/Base';
import { auditService } from '../services/auditService';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

interface WelfareCase {
  id: string;
  beneficiaryName: string;
  category: 'Senior Citizen' | 'PWD' | 'Solo Parent' | 'AICS Indigent' | 'Emergency Aid';
  voucherType: 'Medical Subsidy' | 'Burial Assistance' | 'Educational Aid' | 'Food Rations' | 'Livelihood Seed';
  amount: number;
  status: 'Approved & Disbursed' | 'Under Review' | 'Pending PB Signoff';
  purok: string;
  contactNumber: string;
  caseWorker: string;
  remarks: string;
  dateFiled: string;
}

const INITIAL_CASES: WelfareCase[] = [
  {
    id: 'WLF-2026-041',
    beneficiaryName: 'Rosalina Mendoza',
    category: 'Senior Citizen',
    voucherType: 'Medical Subsidy',
    amount: 3500,
    status: 'Pending PB Signoff',
    purok: 'Zone 2 Lower Baluarte',
    contactNumber: '0928-112-9844',
    caseWorker: 'BHW Remedios Santos',
    remarks: 'Maintenance prescription support for chronic hypertension and dialysis referral.',
    dateFiled: 'Today, 08:30 AM'
  },
  {
    id: 'WLF-2026-040',
    beneficiaryName: 'Eduardo G. Tan',
    category: 'PWD',
    voucherType: 'Livelihood Seed',
    amount: 5000,
    status: 'Approved & Disbursed',
    purok: 'Zone 4 Highway Sector',
    contactNumber: '0919-445-1200',
    caseWorker: 'Social Worker J. Reyes',
    remarks: 'Micro-retail inventory grant for accessible neighborhood sundry store.',
    dateFiled: 'Yesterday'
  },
  {
    id: 'WLF-2026-039',
    beneficiaryName: 'Maria Clara Bautista',
    category: 'Solo Parent',
    voucherType: 'Educational Aid',
    amount: 2500,
    status: 'Approved & Disbursed',
    purok: 'Zone 1 Riverside',
    contactNumber: '0935-776-3321',
    caseWorker: 'BHW Remedios Santos',
    remarks: 'School supply stipend and uniform voucher for two primary school dependents.',
    dateFiled: '3 days ago'
  },
  {
    id: 'WLF-2026-038',
    beneficiaryName: 'Danilo S. Fernandez',
    category: 'AICS Indigent',
    voucherType: 'Food Rations',
    amount: 4000,
    status: 'Under Review',
    purok: 'Zone 3 Spillway',
    contactNumber: '0945-889-0123',
    caseWorker: 'Social Worker J. Reyes',
    remarks: 'Flash flood roofing damage rehabilitation subsidy.',
    dateFiled: '4 days ago'
  }
];

export const WelfarePage: React.FC = () => {
  const { profile } = useAuth();
  const [cases, setCases] = useState<WelfareCase[]>(INITIAL_CASES);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [newCase, setNewCase] = useState({
    beneficiaryName: '',
    category: 'AICS Indigent' as WelfareCase['category'],
    voucherType: 'Medical Subsidy' as WelfareCase['voucherType'],
    amount: 3000,
    purok: 'Zone 1 Riverside',
    contactNumber: '',
    remarks: ''
  });

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCase.beneficiaryName || !newCase.contactNumber) return;

    const created: WelfareCase = {
      id: `WLF-2026-${String(cases.length + 42).padStart(3, '0')}`,
      beneficiaryName: newCase.beneficiaryName,
      category: newCase.category,
      voucherType: newCase.voucherType,
      amount: Number(newCase.amount),
      status: 'Pending PB Signoff',
      purok: newCase.purok,
      contactNumber: newCase.contactNumber,
      caseWorker: profile?.displayName || 'Social Welfare Officer',
      remarks: newCase.remarks,
      dateFiled: 'Just now'
    };

    setCases([created, ...cases]);
    setShowIntakeModal(false);

    // Audit trail logging
    auditService.logAction({
      userId: profile?.uid || 'welfare-officer',
      userName: profile?.displayName || 'Welfare Officer',
      userEmail: profile?.email || 'welfare@baluarte.gov.ph',
      userRole: profile?.role || 'BHW',
      department: 'Health',
      action: 'CREATE',
      targetEntity: 'Welfare',
      targetId: created.id,
      targetName: `${created.beneficiaryName} (₱${created.amount})`,
      details: `Enrolled new welfare voucher for ${created.category} (${created.voucherType}).`,
      severity: 'Info'
    });

    // Department Head Notification
    notificationService.addNotification({
      title: 'New Indigent Welfare Voucher Enrolled',
      message: `${created.beneficiaryName} - ₱${created.amount.toLocaleString()} ${created.voucherType} awaits signoff.`,
      category: 'welfare',
      severity: 'warning',
      department: 'Health',
      actionUrl: '/welfare'
    });

    setNewCase({
      beneficiaryName: '',
      category: 'AICS Indigent',
      voucherType: 'Medical Subsidy',
      amount: 3000,
      purok: 'Zone 1 Riverside',
      contactNumber: '',
      remarks: ''
    });
  };

  const handleApproveCase = (id: string) => {
    const target = cases.find(c => c.id === id);
    if (!target) return;

    setCases(cases.map(c => c.id === id ? { ...c, status: 'Approved & Disbursed' } : c));

    auditService.logAction({
      userId: profile?.uid || 'admin',
      userName: profile?.displayName || 'Punong Barangay',
      userEmail: profile?.email || 'captain@baluarte.gov.ph',
      userRole: profile?.role || 'Captain',
      department: 'Administration',
      action: 'APPROVE',
      targetEntity: 'Welfare',
      targetId: id,
      targetName: `${target.beneficiaryName} - ₱${target.amount}`,
      details: `Approved municipal and barangay treasury disbursement for ${target.voucherType}.`,
      severity: 'Critical'
    });

    notificationService.addNotification({
      title: 'Welfare Voucher Disbursed',
      message: `Aid voucher of ₱${target.amount.toLocaleString()} for ${target.beneficiaryName} released.`,
      category: 'welfare',
      severity: 'info',
      department: 'Finance',
      actionUrl: '/treasury'
    });
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch = 
      c.beneficiaryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.purok.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.remarks.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalDisbursed = cases
    .filter(c => c.status === 'Approved & Disbursed')
    .reduce((sum, c) => sum + c.amount, 0);

  const pendingAmount = cases
    .filter(c => c.status !== 'Approved & Disbursed')
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-pink-500/10 text-pink-400 border border-pink-500/20 kinetic-badge">
              DILG & DSWD Registry
            </span>
            <span className="text-xs text-brand-muted font-mono">• AICS & Vulnerable Sectors</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-brand-text uppercase tracking-tight interactive-text cursor-default">
            Social Welfare & Assistance Portal
          </h1>
          <p className="text-xs text-brand-muted mt-1 max-w-xl">
            Social safety net management, indigent subsidies, PWD and senior citizen allowances, and emergency relief disbursements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowIntakeModal(true)}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-brand-primary text-brand-bg font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90 interactive-click"
          >
            <Plus className="w-4 h-4" />
            <span>New Assistance Intake</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-brand-surface border-brand-border kinetic-card">
          <div className="flex items-center justify-between text-brand-muted mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest">Total Disbursed (MTD)</span>
            <Coins className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-brand-text interactive-text">
            ₱{totalDisbursed.toLocaleString()}
          </div>
          <p className="text-[10px] text-brand-muted mt-1">{cases.filter(c => c.status === 'Approved & Disbursed').length} released vouchers</p>
        </Card>

        <Card className="p-4 bg-brand-surface border-brand-border kinetic-card">
          <div className="flex items-center justify-between text-brand-muted mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest">Pending Signoff</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-brand-text interactive-text">
            ₱{pendingAmount.toLocaleString()}
          </div>
          <p className="text-[10px] text-brand-muted mt-1">{cases.filter(c => c.status !== 'Approved & Disbursed').length} awaiting Punong Barangay</p>
        </Card>

        <Card className="p-4 bg-brand-surface border-brand-border kinetic-card">
          <div className="flex items-center justify-between text-brand-muted mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest">Enrolled Beneficiaries</span>
            <Users className="w-4 h-4 text-brand-primary" />
          </div>
          <div className="text-2xl font-black text-brand-text interactive-text">
            1,482 Residents
          </div>
          <p className="text-[10px] text-brand-muted mt-1">Cross-matched with RBI Census</p>
        </Card>

        <Card className="p-4 bg-brand-surface border-brand-border kinetic-card">
          <div className="flex items-center justify-between text-brand-muted mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest">Welfare Desk</span>
            <HeartHandshake className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-2xl font-black text-brand-text interactive-text">
            Baluarte MSWDO
          </div>
          <p className="text-[10px] text-brand-muted mt-1">Direct Tagoloan Link Active</p>
        </Card>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-brand-surface p-3 rounded-xl border border-brand-border">
        <div className="flex items-center gap-2 bg-brand-bg px-3 py-2 rounded-lg border border-brand-border flex-1 max-w-md">
          <Search className="w-4 h-4 text-brand-muted shrink-0" />
          <input
            type="text"
            placeholder="Search beneficiary, case ID, purok, or remarks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-xs w-full text-brand-text placeholder:text-brand-muted/50"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Senior Citizen', 'PWD', 'Solo Parent', 'AICS Indigent'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all min-h-[36px] interactive-click",
                categoryFilter === cat
                  ? "bg-brand-primary text-brand-bg shadow-sm"
                  : "text-brand-muted hover:text-brand-text hover:bg-brand-card"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Case Roster */}
      <div className="space-y-3">
        {filteredCases.map((item) => (
          <Card key={item.id} className="p-4 md:p-5 bg-brand-surface border-brand-border hover:border-brand-primary/30 transition-all kinetic-card">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-brand-text interactive-text">
                      {item.beneficiaryName}
                    </span>
                    <span className="text-[10px] font-mono text-brand-muted">
                      ({item.id})
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-brand-card text-brand-primary border border-brand-border">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-brand-muted mt-0.5">
                    {item.purok} • Contact: <span className="text-brand-text font-mono">{item.contactNumber}</span> • Caseworker: {item.caseWorker}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-base font-black text-brand-text font-mono interactive-text">
                    ₱{item.amount.toLocaleString()}
                  </div>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider inline-block",
                    item.status === 'Approved & Disbursed' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                    item.status === 'Under Review' ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                    "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  )}>
                    {item.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-brand-bg/60 p-3 rounded-lg border border-brand-border/50 mb-3 text-xs text-brand-muted flex items-start gap-2">
              <FileCheck className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-brand-text mr-1">Voucher Type: {item.voucherType} —</span>
                {item.remarks}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-brand-border/40 text-[10px]">
              <span className="text-brand-muted font-mono">
                Filed on {item.dateFiled}
              </span>

              {item.status !== 'Approved & Disbursed' ? (
                <button
                  onClick={() => handleApproveCase(item.id)}
                  className="min-h-[36px] px-4 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider transition-all interactive-click flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve & Authorize Voucher</span>
                </button>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Disbursed via Barangay Treasury
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* New Assistance Intake Modal */}
      {showIntakeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-brand-border bg-brand-card/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-pink-400" />
                <h3 className="text-sm font-black uppercase tracking-wider text-brand-text">
                  New Welfare Assistance Intake
                </h3>
              </div>
              <button 
                onClick={() => setShowIntakeModal(false)}
                className="text-brand-muted hover:text-brand-text p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="p-5 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block mb-1">
                  Full Legal Name of Beneficiary
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maria Teresa Santos"
                  value={newCase.beneficiaryName}
                  onChange={(e) => setNewCase({ ...newCase, beneficiaryName: e.target.value })}
                  className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-text focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block mb-1">
                    Beneficiary Sector
                  </label>
                  <select
                    value={newCase.category}
                    onChange={(e) => setNewCase({ ...newCase, category: e.target.value as WelfareCase['category'] })}
                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-text focus:outline-none focus:border-brand-primary"
                  >
                    <option value="Senior Citizen">Senior Citizen (60+)</option>
                    <option value="PWD">PWD (Differently Abled)</option>
                    <option value="Solo Parent">Solo Parent</option>
                    <option value="AICS Indigent">AICS Indigent Household</option>
                    <option value="Emergency Aid">Emergency Aid</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block mb-1">
                    Assistance Program
                  </label>
                  <select
                    value={newCase.voucherType}
                    onChange={(e) => setNewCase({ ...newCase, voucherType: e.target.value as WelfareCase['voucherType'] })}
                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-text focus:outline-none focus:border-brand-primary"
                  >
                    <option value="Medical Subsidy">Medical Subsidy</option>
                    <option value="Burial Assistance">Burial Assistance</option>
                    <option value="Educational Aid">Educational Aid</option>
                    <option value="Food Rations">Food Rations</option>
                    <option value="Livelihood Seed">Livelihood Seed Grant</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block mb-1">
                    Requested Grant Amount (₱)
                  </label>
                  <input
                    type="number"
                    min="500"
                    step="500"
                    required
                    value={newCase.amount}
                    onChange={(e) => setNewCase({ ...newCase, amount: Number(e.target.value) })}
                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-text focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block mb-1">
                    Contact Mobile Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0917-000-0000"
                    value={newCase.contactNumber}
                    onChange={(e) => setNewCase({ ...newCase, contactNumber: e.target.value })}
                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-text focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block mb-1">
                  Residential Purok / Zone
                </label>
                <select
                  value={newCase.purok}
                  onChange={(e) => setNewCase({ ...newCase, purok: e.target.value })}
                  className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-text focus:outline-none focus:border-brand-primary"
                >
                  <option value="Zone 1 Riverside">Zone 1 Riverside</option>
                  <option value="Zone 2 Lower Baluarte">Zone 2 Lower Baluarte</option>
                  <option value="Zone 3 Spillway">Zone 3 Spillway</option>
                  <option value="Zone 4 Highway Sector">Zone 4 Highway Sector</option>
                  <option value="Zone 5 Upper Baluarte Foothills">Zone 5 Upper Baluarte Foothills</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block mb-1">
                  Caseworker Assessment & Justification
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Clinical assessment, doctor certificate verification, or indigency grounds..."
                  value={newCase.remarks}
                  onChange={(e) => setNewCase({ ...newCase, remarks: e.target.value })}
                  className="w-full bg-brand-bg border border-brand-border rounded-lg p-3 text-xs text-brand-text focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setShowIntakeModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-brand-muted hover:text-brand-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-brand-primary text-brand-bg font-black text-xs uppercase tracking-wider shadow-lg shadow-brand-primary/20 interactive-click"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
