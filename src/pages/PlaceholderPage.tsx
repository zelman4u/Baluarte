import React from 'react';
import { motion } from 'motion/react';
import { Construction } from 'lucide-react';
import { Card } from '../components/ui/Base';

interface PlaceholderPageProps {
  title: string;
  module: string;
  description?: string;
  logoPath?: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, module, description, logoPath }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-brand-muted text-xs font-bold uppercase tracking-widest">Module /</span>
        <span className="text-brand-text text-xs font-bold uppercase tracking-widest">{module}</span>
      </div>
      <h1 className="text-4xl font-bold text-brand-text tracking-tight uppercase tracking-[-0.05em] leading-none mb-1">{title}</h1>
      
      <Card className="p-12 flex flex-col items-center justify-center text-center bg-brand-surface border-brand-border mt-12">
        <div className="w-24 h-24 bg-brand-primary/10 border border-brand-primary/20 rounded-2xl flex items-center justify-center mb-6 overflow-hidden p-3">
           {logoPath ? (
             <img src={logoPath} alt="Module Logo" className="w-full h-full object-contain" />
           ) : (
             <Construction className="w-10 h-10 text-brand-primary animate-pulse" />
           )}
        </div>
        <h2 className="text-xl font-black text-brand-text uppercase tracking-tighter mb-2">Under Development</h2>
        <p className="text-brand-muted max-w-sm text-sm font-medium leading-relaxed">
          {description || "This encrypted module is currently being provisioned in the central Baluarte Governance System. Full decryption will be available in the next lifecycle update."}
        </p>
        <div className="mt-8 flex gap-4 text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
           <span>STABLE_BUILD_V1.2</span>
           <span className="w-1 h-1 bg-brand-border rounded-full self-center"></span>
           <span>SECURE_ENCLAVE</span>
        </div>
      </Card>
    </div>
  );
};
