import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { MapPin, Navigation, Shield, Heart, AlertTriangle, Layers, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface MapFacility {
  id: string;
  name: string;
  category: 'evacuation' | 'health' | 'security' | 'government';
  lat: number;
  lng: number;
  address: string;
  contact: string;
  status: string;
  capacity?: string;
  notes: string;
}

export const BALUARTE_FACILITIES: MapFacility[] = [
  {
    id: 'fac-1',
    name: 'Baluarte Central Multi-Purpose Evacuation Gym',
    category: 'evacuation',
    lat: 8.5442,
    lng: 124.7415,
    address: 'Zone 2 Central Poblacion, Baluarte, Tagoloan',
    contact: '0917-882-5827 (DRRM Head Dan Garcia)',
    status: 'Standby / Fully Stocked',
    capacity: '450 Individuals (90 Families)',
    notes: 'Equipped with solar emergency backup generator, separate maternal hygiene quarters, and direct water supply filtration.'
  },
  {
    id: 'fac-2',
    name: 'Baluarte Riverside Spillway Relief Staging Point',
    category: 'evacuation',
    lat: 8.5475,
    lng: 124.7389,
    address: 'Zone 1 Lower Spillway Dike',
    contact: '0928-334-1100 (Disaster Watch)',
    status: 'Active River Telemetry Monitoring',
    capacity: '200 Individuals',
    notes: 'High-elevation concrete staging area for rapid boat deployment and river rescue operations.'
  },
  {
    id: 'fac-3',
    name: 'Barangay Baluarte Health Station & Birthing Clinic',
    category: 'health',
    lat: 8.5435,
    lng: 124.7408,
    address: 'Beside Barangay Hall, Zone 2',
    contact: '0928-112-9844 (Midwife Remedios Santos)',
    status: 'Operational 08:00 - 17:00 (Emergency On-Call)',
    notes: 'Equipped with cold-chain vaccine refrigeration, emergency oxygen, and basic triage trauma supplies.'
  },
  {
    id: 'fac-4',
    name: 'Baluarte Tanod Headquarters & Security Outpost',
    category: 'security',
    lat: 8.5451,
    lng: 124.7422,
    address: 'National Highway Junction, Zone 3',
    contact: '0917-882-5827 / VHF Radio Ch-4',
    status: '24/7 Active Security Watch',
    notes: 'Command post for mobile roving patrols, CCTV telemetry monitoring, and rapid dispute intervention.'
  },
  {
    id: 'fac-5',
    name: 'Barangay Baluarte Hall & Legislative Session Hall',
    category: 'government',
    lat: 8.5438,
    lng: 124.7411,
    address: 'Poblacion Road, Baluarte, Tagoloan, Misamis Oriental',
    contact: '(088) 890-2144 (Secretariat Desk)',
    status: 'Open Mon-Fri 08:00 - 17:00',
    notes: 'Seat of the Punong Barangay, Sangguniang Barangay, Katarungang Pambarangay Mediation Office, and Treasury.'
  }
];

// Fallback demo key or empty string if not configured
const GOOGLE_MAPS_API_KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';

export const BaluarteInteractiveMap: React.FC<{
  onSelectFacility?: (facility: MapFacility) => void;
  className?: string;
}> = ({ onSelectFacility, className }) => {
  const [selectedFacility, setSelectedFacility] = useState<MapFacility | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [mapCenter, setMapCenter] = useState({ lat: 8.5442, lng: 124.7412 });
  const [zoom, setZoom] = useState(16);

  const filteredFacilities = BALUARTE_FACILITIES.filter(f => 
    activeCategory === 'all' || f.category === activeCategory
  );

  const handleSelect = (fac: MapFacility) => {
    setSelectedFacility(fac);
    setMapCenter({ lat: fac.lat, lng: fac.lng });
    setZoom(17);
    if (onSelectFacility) onSelectFacility(fac);
  };

  const getPinColor = (category: MapFacility['category']) => {
    switch(category) {
      case 'evacuation': return { background: '#D29922', glyphColor: '#FFFFFF', borderColor: '#9E6A03' };
      case 'health': return { background: '#F778BA', glyphColor: '#FFFFFF', borderColor: '#BF4B8A' };
      case 'security': return { background: '#3FB950', glyphColor: '#FFFFFF', borderColor: '#238636' };
      case 'government': return { background: '#58A6FF', glyphColor: '#FFFFFF', borderColor: '#1F6FEB' };
    }
  };

  return (
    <div className={cn("relative rounded-2xl overflow-hidden border border-brand-border bg-brand-surface flex flex-col", className)}>
      {/* Category Filter Ribbon */}
      <div className="p-3 bg-brand-surface/90 backdrop-blur-md border-b border-brand-border flex items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Landmarks', icon: Layers },
            { id: 'evacuation', label: 'Evacuation & DRRM', icon: AlertTriangle },
            { id: 'health', label: 'Health Clinics', icon: Heart },
            { id: 'security', label: 'Tanod Security', icon: Shield },
            { id: 'government', label: 'Barangay Hall', icon: MapPin },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "min-h-[34px] px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all interactive-click whitespace-nowrap",
                activeCategory === cat.id
                  ? "bg-brand-primary text-brand-bg shadow-sm"
                  : "text-brand-muted hover:text-brand-text hover:bg-brand-card"
              )}
            >
              <cat.icon className="w-3 h-3" />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-brand-muted">
          <span>Lat: 8.5438° N</span>
          <span>Lng: 124.7411° E</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="w-full h-[400px] md:h-[480px] relative">
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
          <Map
            center={mapCenter}
            zoom={zoom}
            mapId="DEMO_MAP_ID"
            gestureHandling="greedy"
            disableDefaultUI={false}
            className="w-full h-full"
            internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
          >
            {filteredFacilities.map((fac) => {
              const pinStyle = getPinColor(fac.category);
              return (
                <AdvancedMarker
                  key={fac.id}
                  position={{ lat: fac.lat, lng: fac.lng }}
                  onClick={() => handleSelect(fac)}
                  title={fac.name}
                >
                  <Pin 
                    background={pinStyle.background} 
                    glyphColor={pinStyle.glyphColor} 
                    borderColor={pinStyle.borderColor} 
                  />
                </AdvancedMarker>
              );
            })}

            {selectedFacility && (
              <InfoWindow
                position={{ lat: selectedFacility.lat, lng: selectedFacility.lng }}
                onCloseClick={() => setSelectedFacility(null)}
              >
                <div className="p-2 max-w-xs text-brand-bg font-sans">
                  <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary block mb-0.5">
                    {selectedFacility.category}
                  </span>
                  <h4 className="text-xs font-black text-slate-900 leading-tight mb-1">
                    {selectedFacility.name}
                  </h4>
                  <p className="text-[11px] text-slate-700 leading-relaxed mb-2">
                    {selectedFacility.address}
                  </p>
                  {selectedFacility.capacity && (
                    <div className="mb-2 p-1.5 bg-slate-100 rounded text-[10px] font-bold text-slate-800">
                      Capacity: {selectedFacility.capacity}
                    </div>
                  )}
                  <p className="text-[10px] text-slate-600 mb-2 italic">
                    {selectedFacility.notes}
                  </p>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedFacility.lat},${selectedFacility.lng}&utm_campaign=gmp_mcp_codeassist_v1_aistudio`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline uppercase"
                  >
                    <span>Get Directions</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>

        {/* Quick Facility Chips on Map Overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 overflow-x-auto pb-1 pointer-events-auto">
          {filteredFacilities.map((fac) => (
            <button
              key={fac.id}
              onClick={() => handleSelect(fac)}
              className={cn(
                "p-2.5 rounded-xl bg-brand-surface/90 backdrop-blur-md border border-brand-border text-left shadow-lg shrink-0 max-w-[200px] transition-all interactive-click hover:border-brand-primary",
                selectedFacility?.id === fac.id ? "ring-2 ring-brand-primary border-brand-primary" : ""
              )}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  fac.category === 'evacuation' ? "bg-amber-400" :
                  fac.category === 'health' ? "bg-pink-400" :
                  fac.category === 'security' ? "bg-emerald-400" : "bg-brand-primary"
                )}></span>
                <span className="text-[9px] font-black uppercase tracking-wider text-brand-muted truncate">
                  {fac.category}
                </span>
              </div>
              <p className="text-[11px] font-bold text-brand-text truncate leading-tight">
                {fac.name}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
