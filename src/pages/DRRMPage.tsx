import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Home, 
  Package, 
  Activity, 
  MapPin, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Users, 
  Radio, 
  PhoneCall, 
  FileText, 
  Flame, 
  Waves, 
  Wind, 
  RefreshCw,
  Eye,
  X,
  Navigation
} from 'lucide-react';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Card, Button, Input } from '../components/ui/Base';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { BaluarteInteractiveMap } from '../components/maps/BaluarteInteractiveMap';
import { auditService } from '../services/auditService';

export interface EvacuationCenter {
  id: string;
  name: string;
  location: string;
  purok: string;
  capacity: number;
  currentEvacuees: number;
  familiesCount: number;
  status: 'Open' | 'Near Capacity' | 'Full' | 'Standby' | 'Closed';
  facilities: string[];
  powerStatus: 'Normal' | 'Generator' | 'Outage';
  waterStatus: 'Operational' | 'Rationed' | 'Unavailable';
  contactPerson: string;
  contactNumber: string;
}

export interface DRRMIncident {
  id: string;
  incidentNumber: string;
  type: 'Flood' | 'Fire' | 'Typhoon' | 'Landslide' | 'Medical Emergency' | 'Vehicular';
  severity: 'Low' | 'Moderate' | 'High' | 'Critical';
  location: string;
  purok: string;
  status: 'Reported' | 'Dispatched' | 'Responding' | 'Contained' | 'Resolved';
  reportedAt: any;
  reportedBy: string;
  respondingUnit: string;
  actionsTaken: string;
  casualtiesCount: number;
  affectedFamilies: number;
}

export interface ReliefGood {
  id: string;
  itemCode: string;
  name: string;
  category: 'Food Packs' | 'Hygiene Kits' | 'Medical Supplies' | 'Water Containers' | 'Blankets & Mats';
  quantity: number;
  unit: string;
  allocated: number;
  storageLocation: string;
  expiryDate?: string;
  lastUpdated?: any;
}

const DEFAULT_EVACUATION_CENTERS: EvacuationCenter[] = [
  {
    id: 'evac-001',
    name: 'Baluarte Central Multi-Purpose Evacuation Gym',
    location: 'Purok 1 Central Compound, Baluarte',
    purok: 'Purok 1',
    capacity: 350,
    currentEvacuees: 42,
    familiesCount: 11,
    status: 'Open',
    facilities: ['Child-Friendly Space', 'Medical Triage', 'Community Kitchen', 'Shower Stalls'],
    powerStatus: 'Normal',
    waterStatus: 'Operational',
    contactPerson: 'Kgd. Roberto Tanod',
    contactNumber: '0917-555-0192'
  },
  {
    id: 'evac-002',
    name: 'Baluarte Elementary School Building B',
    location: 'Purok 4 Riverside Highway, Baluarte',
    purok: 'Purok 4',
    capacity: 200,
    currentEvacuees: 0,
    familiesCount: 0,
    status: 'Standby',
    facilities: ['Classroom Quarters', 'Handwashing Stations', 'Solar Emergency Lamps'],
    powerStatus: 'Normal',
    waterStatus: 'Operational',
    contactPerson: 'Ms. Elena Reyes (DepEd In-Charge)',
    contactNumber: '0918-222-8811'
  },
  {
    id: 'evac-003',
    name: 'Purok 6 Coastal Covered Court',
    location: 'Purok 6 Fisherman Village, Baluarte',
    purok: 'Purok 6',
    capacity: 180,
    currentEvacuees: 15,
    familiesCount: 4,
    status: 'Open',
    facilities: ['Raised Staging Area', 'Mobile Water Filtration', 'First Aid Station'],
    powerStatus: 'Generator',
    waterStatus: 'Rationed',
    contactPerson: 'Officer Dan Garcia',
    contactNumber: '0920-888-3344'
  }
];

const DEFAULT_RELIEF_ITEMS: ReliefGood[] = [
  {
    id: 'rlf-001',
    itemCode: 'RLF-FDP-001',
    name: 'Standard Family Food Pack (6kg Rice, Canned Goods, Coffee)',
    category: 'Food Packs',
    quantity: 450,
    unit: 'boxes',
    allocated: 65,
    storageLocation: 'Central Warehouse B'
  },
  {
    id: 'rlf-002',
    itemCode: 'RLF-HYG-002',
    name: 'Family Hygiene Kit (Soap, Toothbrush, Detergent, Towels)',
    category: 'Hygiene Kits',
    quantity: 320,
    unit: 'packs',
    allocated: 40,
    storageLocation: 'Central Warehouse B'
  },
  {
    id: 'rlf-003',
    itemCode: 'RLF-MED-003',
    name: 'Emergency First-Aid Trauma & First Responder Kits',
    category: 'Medical Supplies',
    quantity: 60,
    unit: 'kits',
    allocated: 12,
    storageLocation: 'Health Station Triage Room'
  }
];

export const DRRMPage: React.FC = () => {
  const { profile } = useAuth();
  const [centers, setCenters] = useState<EvacuationCenter[]>(DEFAULT_EVACUATION_CENTERS);
  const [reliefGoods, setReliefGoods] = useState<ReliefGood[]>(DEFAULT_RELIEF_ITEMS);
  const [incidents, setIncidents] = useState<DRRMIncident[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'evacuation' | 'relief' | 'incidents'>('overview');
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showReliefModal, setShowReliefModal] = useState(false);

  const [incidentForm, setIncidentForm] = useState({
    type: 'Flood' as DRRMIncident['type'],
    severity: 'High' as DRRMIncident['severity'],
    location: '',
    purok: 'Purok 1',
    respondingUnit: 'Baluarte BDRRMC Quick Response Team 1',
    actionsTaken: '',
    casualtiesCount: 0,
    affectedFamilies: 0
  });

  const [reliefForm, setReliefForm] = useState({
    itemCode: `RLF-${Math.floor(100 + Math.random() * 900)}`,
    name: '',
    category: 'Food Packs' as ReliefGood['category'],
    quantity: 100,
    unit: 'boxes',
    storageLocation: 'Central Warehouse'
  });

  // Sync incidents from Firestore
  useEffect(() => {
    const qIncidents = query(collection(db, 'drrm_incidents'), orderBy('reportedAt', 'desc'));
    const unsub = onSnapshot(qIncidents, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as DRRMIncident[];
      setIncidents(data);
    }, (err) => {
      console.warn('Incident listener fallback:', err);
    });
    return () => unsub();
  }, []);

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const incidentNumber = `DRRM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const entry = {
        incidentNumber,
        ...incidentForm,
        status: 'Reported' as const,
        reportedAt: serverTimestamp(),
        reportedBy: profile?.displayName || profile?.email || 'Authorized DRRM Officer'
      };

      await addDoc(collection(db, 'drrm_incidents'), entry);

      await auditService.logAction({
        userId: profile?.uid || 'usr_anonymous',
        userName: profile?.displayName || profile?.email || 'DRRM Coordinator',
        userEmail: profile?.email || '',
        userRole: profile?.role || 'Staff',
        department: 'DRRM',
        action: 'CREATE',
        targetEntity: 'DRRM',
        targetId: incidentNumber,
        targetName: `${incidentForm.type} at ${incidentForm.location}`,
        details: `Incident alert escalated: ${incidentForm.severity} severity in ${incidentForm.purok}. Unit: ${incidentForm.respondingUnit}`,
        severity: incidentForm.severity === 'Critical' ? 'Critical' : 'Warning'
      });

      setShowIncidentModal(false);
      setIncidentForm({
        type: 'Flood',
        severity: 'High',
        location: '',
        purok: 'Purok 1',
        respondingUnit: 'Baluarte BDRRMC Quick Response Team 1',
        actionsTaken: '',
        casualtiesCount: 0,
        affectedFamilies: 0
      });
    } catch (err) {
      console.error('Failed to create incident:', err);
    }
  };

  const handleCreateRelief = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newRelief: ReliefGood = {
        id: `rel-${Date.now()}`,
        ...reliefForm,
        allocated: 0,
        lastUpdated: new Date().toISOString()
      };
      setReliefGoods(prev => [newRelief, ...prev]);

      await auditService.logAction({
        userId: profile?.uid || 'usr_anonymous',
        userName: profile?.displayName || 'Logistics In-Charge',
        userEmail: profile?.email || '',
        userRole: profile?.role || 'Staff',
        department: 'DRRM',
        action: 'CREATE',
        targetEntity: 'DRRM',
        targetId: reliefForm.itemCode,
        targetName: `${reliefForm.name} (${reliefForm.quantity} ${reliefForm.unit})`,
        details: `Stocked ${reliefForm.quantity} ${reliefForm.unit} under ${reliefForm.category} at ${reliefForm.storageLocation}`,
        severity: 'Info'
      });

      setShowReliefModal(false);
    } catch (err) {
      console.error('Relief stock failed:', err);
    }
  };

  const totalCapacity = centers.reduce((sum, c) => sum + c.capacity, 0);
  const totalEvacuees = centers.reduce((sum, c) => sum + c.currentEvacuees, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase bg-brand-danger/10 text-brand-danger border border-brand-danger/30">
              RA 10121 BDRRMC Command
            </span>
            <span className="text-xs text-brand-muted font-medium">Baluarte Disaster Operations Enclave</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-brand-text tracking-tight uppercase flex items-center gap-3 interactive-text">
            <ShieldAlert className="w-8 h-8 text-brand-primary" />
            Disaster Risk Reduction & Management
          </h1>
          <p className="text-sm text-brand-muted mt-1">
            Real-time hazard telemetry, Google Maps GIS facility logistics, relief supplies, and incident dispatch.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button 
            onClick={() => setShowIncidentModal(true)}
            variant="danger"
            size="sm"
            className="shadow-lg shadow-brand-danger/20 font-bold uppercase tracking-wider text-xs interactive-click active:scale-95"
          >
            <AlertTriangle className="w-4 h-4 mr-1 animate-pulse" />
            Log Emergency Incident
          </Button>

          <Button 
            onClick={() => setShowReliefModal(true)}
            variant="outline"
            size="sm"
            className="font-bold uppercase tracking-wider text-xs interactive-click active:scale-95"
          >
            <Package className="w-4 h-4 mr-1" />
            Stock Relief Item
          </Button>
        </div>
      </div>

      {/* Emergency Alert Banner */}
      <div className="bg-gradient-to-r from-brand-danger/20 via-brand-warning/10 to-brand-surface border border-brand-danger/30 rounded-2xl p-4 lg:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-danger/20 border border-brand-danger/40 flex items-center justify-center shrink-0">
            <Radio className="w-6 h-6 text-brand-danger animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-danger animate-ping"></span>
              <span className="text-xs font-black uppercase tracking-widest text-brand-danger">
                Live Preparedness Status: White Alert (Heightened Monsoon Monitoring)
              </span>
            </div>
            <p className="text-sm font-medium text-brand-text mt-0.5">
              Baluarte Quick Response Units on 24/7 standby. Coastal monitoring active in Purok 6 and Purok 7.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3 py-1.5 rounded-lg bg-brand-bg/80 border border-brand-border text-center">
            <p className="text-[10px] text-brand-muted uppercase tracking-widest font-black">24/7 Command Hotline</p>
            <p className="text-xs font-mono font-black text-brand-primary flex items-center gap-1 justify-center">
              <PhoneCall className="w-3 h-3" /> (088) 555-BALUARTE
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-brand-border overflow-x-auto pb-1">
        {[
          { id: 'overview', label: 'Operations Overview' },
          { id: 'map', label: 'Interactive Google GIS Map' },
          { id: 'evacuation', label: `Evac Centers (${centers.length})` },
          { id: 'relief', label: `Relief Supplies (${reliefGoods.length})` },
          { id: 'incidents', label: `Incidents (${incidents.length})` }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={cn(
              'px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap interactive-click active:scale-95',
              activeTab === t.id
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-brand-muted hover:text-brand-text'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: GIS Map */}
      {activeTab === 'map' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-brand-text uppercase tracking-tight">
                Live Spatial Intelligence & Hazard Evacuation Grid
              </h2>
              <p className="text-xs text-brand-muted">
                Powered by Google Maps Platform. Displays verified shelter coordinates, health posts, and security stations.
              </p>
            </div>
          </div>
          <BaluarteInteractiveMap height="560px" />
        </div>
      )}

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-brand-surface border-brand-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Active Incidents</span>
                <AlertTriangle className="w-4 h-4 text-brand-danger" />
              </div>
              <div className="text-2xl font-black text-brand-text">{incidents.length}</div>
              <p className="text-[10px] text-brand-muted mt-1 uppercase tracking-wide">Emergency Dispatches</p>
            </Card>

            <Card className="p-4 bg-brand-surface border-brand-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Sheltered Evacuees</span>
                <Users className="w-4 h-4 text-brand-primary" />
              </div>
              <div className="text-2xl font-black text-brand-text">{totalEvacuees} <span className="text-xs font-normal text-brand-muted">/ {totalCapacity} cap</span></div>
              <p className="text-[10px] text-brand-muted mt-1 uppercase tracking-wide">
                Across {centers.length} facilities
              </p>
            </Card>

            <Card className="p-4 bg-brand-surface border-brand-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Relief Units In Stock</span>
                <Package className="w-4 h-4 text-brand-success" />
              </div>
              <div className="text-2xl font-black text-brand-text">
                {reliefGoods.reduce((s, r) => s + r.quantity, 0)}
              </div>
              <p className="text-[10px] text-brand-muted mt-1 uppercase tracking-wide">Food & Hygiene kits</p>
            </Card>

            <Card className="p-4 bg-brand-surface border-brand-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Evac Capacity</span>
                <Home className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-black text-brand-text">{totalCapacity}</div>
              <p className="text-[10px] text-brand-muted mt-1 uppercase tracking-wide">Total safe shelter spots</p>
            </Card>
          </div>

          {/* Embedded Google Maps Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-brand-primary flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Live Satellite & Facility Spatial Radar (Google Maps)
              </h3>
              <button 
                onClick={() => setActiveTab('map')}
                className="text-[10px] font-bold text-brand-primary hover:underline uppercase tracking-wider interactive-click"
              >
                Expand Full GIS Screen →
              </button>
            </div>
            <BaluarteInteractiveMap height="360px" />
          </div>
        </div>
      )}

      {/* Tab: Evacuation Centers */}
      {activeTab === 'evacuation' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {centers.map(center => (
            <Card key={center.id} className="p-6 bg-brand-surface border-brand-border space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[9px] font-mono uppercase text-brand-muted font-bold">{center.purok}</span>
                  <h3 className="text-sm font-black text-brand-text uppercase tracking-tight mt-0.5">{center.name}</h3>
                </div>
                <span className={cn(
                  "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border",
                  center.status === 'Open' ? "bg-brand-success/10 text-brand-success border-brand-success/20" : "bg-brand-warning/10 text-brand-warning border-brand-warning/20"
                )}>
                  {center.status}
                </span>
              </div>

              <div className="p-3 bg-brand-bg rounded-lg border border-brand-border space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-brand-muted">Capacity:</span>
                  <span className="font-bold text-brand-text">{center.currentEvacuees} / {center.capacity} pax</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-muted">Families Sheltered:</span>
                  <span className="font-bold text-brand-text">{center.familiesCount} families</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-muted">Power & Water:</span>
                  <span className="font-bold text-brand-primary">{center.powerStatus} / {center.waterStatus}</span>
                </div>
              </div>

              <div className="space-y-1 text-[11px]">
                <p className="text-brand-muted font-bold uppercase text-[9px]">Designated Facilities:</p>
                <div className="flex flex-wrap gap-1">
                  {center.facilities.map((f, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-brand-card text-brand-muted border border-brand-border text-[9px] font-medium">
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-brand-border flex items-center justify-between text-[10px] text-brand-muted">
                <span>In-Charge: {center.contactPerson}</span>
                <span className="font-mono text-brand-primary font-bold">{center.contactNumber}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tab: Relief Goods */}
      {activeTab === 'relief' && (
        <Card className="overflow-hidden bg-brand-surface border-brand-border">
          <div className="p-4 border-b border-brand-border bg-brand-card/50 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-brand-text">Disaster Food & Welfare Stockpile</h3>
            <span className="text-[10px] font-mono text-brand-muted uppercase font-bold">Total SKUs: {reliefGoods.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-bg text-brand-muted text-[10px] uppercase font-black tracking-widest border-b border-brand-border">
                <tr>
                  <th className="px-6 py-3">Item Code</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Available</th>
                  <th className="px-6 py-3">Allocated</th>
                  <th className="px-6 py-3">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {reliefGoods.map(r => (
                  <tr key={r.id} className="hover:bg-brand-card/40 transition-colors">
                    <td className="px-6 py-3 font-mono font-bold text-brand-primary">{r.itemCode}</td>
                    <td className="px-6 py-3 font-bold text-brand-text">{r.name}</td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-brand-bg border border-brand-border text-brand-muted">
                        {r.category}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-black text-brand-success">{r.quantity} {r.unit}</td>
                    <td className="px-6 py-3 font-mono text-brand-muted">{r.allocated} {r.unit}</td>
                    <td className="px-6 py-3 text-brand-muted">{r.storageLocation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab: Incidents */}
      {activeTab === 'incidents' && (
        <Card className="overflow-hidden bg-brand-surface border-brand-border">
          <div className="p-4 border-b border-brand-border bg-brand-card/50 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-brand-text">Active Incident Dispatch Log</h3>
            <Button size="sm" onClick={() => setShowIncidentModal(true)} className="bg-brand-danger text-white text-[10px] font-bold uppercase">
              <Plus className="w-3.5 h-3.5 mr-1" /> Log Incident
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-bg text-brand-muted text-[10px] uppercase font-black tracking-widest border-b border-brand-border">
                <tr>
                  <th className="px-6 py-3">Ref ID</th>
                  <th className="px-6 py-3">Hazard Type</th>
                  <th className="px-6 py-3">Location & Purok</th>
                  <th className="px-6 py-3">Severity</th>
                  <th className="px-6 py-3">Responding Unit</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {incidents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-brand-muted italic">
                      No active emergency dispatches logged.
                    </td>
                  </tr>
                ) : incidents.map(inc => (
                  <tr key={inc.id} className="hover:bg-brand-card/40 transition-colors">
                    <td className="px-6 py-3 font-mono text-brand-primary">{inc.incidentNumber}</td>
                    <td className="px-6 py-3 font-bold text-brand-text">{inc.type}</td>
                    <td className="px-6 py-3 text-brand-muted">{inc.location} ({inc.purok})</td>
                    <td className="px-6 py-3">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border",
                        inc.severity === 'Critical' ? "bg-brand-danger/20 text-brand-danger border-brand-danger/30" : "bg-amber-400/20 text-amber-400 border-amber-400/30"
                      )}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-brand-muted">{inc.respondingUnit}</td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-brand-bg border border-brand-border text-brand-primary">
                        {inc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal: Log Incident */}
      <AnimatePresence>
        {showIncidentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 16 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
              <div className="p-4 sm:p-6 border-b border-brand-border bg-brand-card/50 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-brand-text uppercase tracking-tight">Log Emergency Incident</h3>
                  <p className="text-[10px] text-brand-muted uppercase tracking-wider font-mono">BDRRMC Immediate Escalation Protocol</p>
                </div>
                <button onClick={() => setShowIncidentModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-brand-muted hover:text-brand-text hover:bg-brand-bg transition-colors min-h-[36px] min-w-[36px] interactive-click">✕</button>
              </div>
              <form onSubmit={handleCreateIncident} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-brand-muted mb-1 block">Hazard Type</label>
                    <select 
                      value={incidentForm.type} 
                      onChange={e => setIncidentForm({...incidentForm, type: e.target.value as any})}
                      className="w-full bg-brand-bg border border-brand-border rounded-lg p-2.5 text-brand-text min-h-[44px]"
                    >
                      <option>Flood</option>
                      <option>Fire</option>
                      <option>Typhoon</option>
                      <option>Landslide</option>
                      <option>Medical Emergency</option>
                      <option>Vehicular</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-brand-muted mb-1 block">Severity Level</label>
                    <select 
                      value={incidentForm.severity} 
                      onChange={e => setIncidentForm({...incidentForm, severity: e.target.value as any})}
                      className="w-full bg-brand-bg border border-brand-border rounded-lg p-2.5 text-brand-text min-h-[44px]"
                    >
                      <option>Low</option>
                      <option>Moderate</option>
                      <option>High</option>
                      <option>Critical</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-brand-muted mb-1 block">Specific Location</label>
                    <Input required placeholder="e.g. Near Seawall, Riverside Alley" value={incidentForm.location} onChange={e => setIncidentForm({...incidentForm, location: e.target.value})} className="bg-brand-bg text-brand-text min-h-[44px]" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-brand-muted mb-1 block">Purok</label>
                    <select value={incidentForm.purok} onChange={e => setIncidentForm({...incidentForm, purok: e.target.value})} className="w-full bg-brand-bg border border-brand-border rounded-lg p-2.5 text-brand-text min-h-[44px]">
                      <option>Purok 1</option>
                      <option>Purok 2</option>
                      <option>Purok 3</option>
                      <option>Purok 4</option>
                      <option>Purok 5</option>
                      <option>Purok 6</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-brand-muted mb-1 block">Responding Unit</label>
                  <Input value={incidentForm.respondingUnit} onChange={e => setIncidentForm({...incidentForm, respondingUnit: e.target.value})} className="bg-brand-bg text-brand-text min-h-[44px]" />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowIncidentModal(false)} className="flex-1 min-h-[44px] text-xs font-bold uppercase interactive-click">Cancel</Button>
                  <Button type="submit" variant="danger" className="flex-1 min-h-[44px] text-xs font-black uppercase interactive-click shadow-lg shadow-brand-danger/20">Confirm Dispatch</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Stock Relief */}
      <AnimatePresence>
        {showReliefModal && (
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
                  <h3 className="text-base font-black text-brand-text uppercase tracking-tight">Stock Relief Inventory</h3>
                  <p className="text-[10px] text-brand-muted uppercase tracking-wider font-mono">BDRRMC Warehouse Log</p>
                </div>
                <button onClick={() => setShowReliefModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-brand-muted hover:text-brand-text hover:bg-brand-bg transition-colors min-h-[36px] min-w-[36px] interactive-click">✕</button>
              </div>
              <form onSubmit={handleCreateRelief} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-brand-muted mb-1 block">Item Name & Description</label>
                  <Input required placeholder="e.g. 50kg Rice Sacks, Ready-To-Eat Meals" value={reliefForm.name} onChange={e => setReliefForm({...reliefForm, name: e.target.value})} className="bg-brand-bg text-brand-text min-h-[44px]" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-brand-muted mb-1 block">Category</label>
                    <select value={reliefForm.category} onChange={e => setReliefForm({...reliefForm, category: e.target.value as any})} className="w-full bg-brand-bg border border-brand-border rounded-lg p-2.5 text-brand-text min-h-[44px]">
                      <option>Food Packs</option>
                      <option>Hygiene Kits</option>
                      <option>Medical Supplies</option>
                      <option>Water Containers</option>
                      <option>Blankets & Mats</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-brand-muted mb-1 block">Quantity</label>
                    <Input type="number" required min="1" value={reliefForm.quantity} onChange={e => setReliefForm({...reliefForm, quantity: Number(e.target.value)})} className="bg-brand-bg text-brand-text font-black min-h-[44px]" />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowReliefModal(false)} className="flex-1 min-h-[44px] text-xs font-bold uppercase interactive-click">Cancel</Button>
                  <Button type="submit" className="flex-1 min-h-[44px] bg-brand-primary text-brand-bg text-xs font-black uppercase interactive-click shadow-lg shadow-brand-primary/20">Save Stock</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
