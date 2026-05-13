import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, ChevronLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import { OrganizationMember } from '../services/landingPageService';

interface OrgMemberNodeProps {
  member: any;
  level: number;
  isFirst: boolean;
  isLast: boolean;
  hasSiblings: boolean;
  onMemberClick?: (member: any) => void;
  accentColor?: string;
}

const OrgMemberNode: React.FC<OrgMemberNodeProps> = ({ 
  member, 
  level, 
  isFirst, 
  isLast, 
  hasSiblings, 
  onMemberClick,
  accentColor = 'brand-primary'
}) => {
  const getAccentClass = (type: 'text' | 'bg' | 'border' | 'hover:from' | 'hover:border' | 'group-hover:text' | 'group-hover:border' | 'group-hover:opacity' | 'shadow' | 'hover:shadow' | 'hover:bg') => {
    const isBrand = accentColor.startsWith('brand-');
    if (isBrand) return `${type}-${accentColor}`;
    // If it's a standard tailwind color like 'green-500'
    return `${type}-${accentColor}`;
  };

  const textAccent = getAccentClass('text');
  const bgAccent = getAccentClass('bg');
  const borderAccent = getAccentClass('border');
  const hoverFromAccent = getAccentClass('hover:from');
  const hoverBorderAccent = getAccentClass('hover:border');
  const groupHoverTextAccent = getAccentClass('group-hover:text');
  const groupHoverBorderAccent = getAccentClass('group-hover:border');
  const shadowAccent = getAccentClass('shadow');
  const hoverShadowAccent = getAccentClass('hover:shadow');
  const hoverBgAccent = getAccentClass('hover:bg');

  return (
    <div className="flex flex-col items-center relative">
      {/* Horizontal connector to siblings */}
      {hasSiblings && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-brand-border/30" 
             style={{ 
               left: isFirst ? '50%' : '0', 
               right: isLast ? '50%' : '0' 
             }} 
        />
      )}
      
      {/* Vertical connector from parent */}
      {level > 0 && (
        <div className="w-[2px] h-8 bg-brand-border/30 relative">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full border border-brand-border/30 bg-brand-bg" />
        </div>
      )}
      
      {/* Member Card */}
      <div 
        className={cn(
          "relative p-[1px] bg-gradient-to-b from-transparent to-transparent rounded-2xl shadow-2xl cursor-pointer group transition-all duration-500",
          `${hoverFromAccent}/40`
        )}
        onClick={() => onMemberClick?.(member)}
      >
        <div className={cn(
          "p-3 md:p-4 bg-brand-card/90 backdrop-blur-md border border-brand-border/50 rounded-2xl min-w-[140px] md:min-w-[180px] flex flex-col items-center group transition-all duration-500",
          `${hoverBorderAccent} ${hoverShadowAccent}/10`
        )}>
          <div className="relative w-16 h-16 md:w-20 md:h-20 mb-3">
            <div className={cn("absolute inset-0 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity", `${bgAccent}/20`)}></div>
            <div className={cn("relative w-full h-full bg-brand-bg border-2 border-brand-border rounded-xl overflow-hidden transition-colors duration-500", `${groupHoverBorderAccent}`)}>
              {member.image ? (
                <img src={member.image} className="w-full h-full object-cover transition-all duration-700" alt={member.name} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-brand-muted/20">
                  <Users className="w-8 h-8 md:w-10 md:h-10" />
                </div>
              )}
            </div>
          </div>
          
          <div className="text-center w-full">
            <h5 className={cn("text-[10px] md:text-[11px] font-black uppercase tracking-tight text-white mb-1.5 transition-colors line-clamp-2 min-h-[1.5rem]", `${groupHoverTextAccent}`)}>
              {member.name || "Vacant Position"}
            </h5>
            <div className="inline-block px-3 py-1 bg-brand-surface border border-brand-border rounded-lg">
              <p className={cn("text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] whitespace-nowrap", `${textAccent}`)}>
                {member.role}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Vertical connector to children */}
      {member.children && member.children.length > 0 && (
        <div className="w-[2px] h-12 bg-brand-border/30" />
      )}
      
      {/* Children Grid */}
      {member.children && member.children.length > 0 && (
        <div className="flex justify-center gap-4 md:gap-8">
          {member.children.map((child: any, idx: number) => (
            <OrgMemberNode 
              key={child.id} 
              member={child} 
              level={level + 1} 
              isFirst={idx === 0} 
              isLast={idx === member.children.length - 1} 
              hasSiblings={member.children.length > 1}
              onMemberClick={onMemberClick}
              accentColor={accentColor}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface OrgChartProps {
  members: OrganizationMember[];
  accentColor?: string;
  title?: string;
  subtitle?: string;
}

export const OrgChart: React.FC<OrgChartProps> = ({ 
  members, 
  accentColor = 'brand-primary',
  title = "Organization Tree",
  subtitle = "Leadership"
}) => {
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [chartScale, setChartScale] = useState(1);
  const [chartHeight, setChartHeight] = useState<string | number>('auto');
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartContentRef = useRef<HTMLDivElement>(null);

  const getAccentClass = (type: 'text' | 'bg' | 'border' | 'hover:from' | 'hover:border' | 'group-hover:text' | 'group-hover:border' | 'group-hover:opacity' | 'shadow' | 'hover:shadow' | 'hover:bg') => {
    return `${type}-${accentColor}`;
  };

  const textAccent = getAccentClass('text');
  const bgAccent = getAccentClass('bg');
  const hoverBgAccent = getAccentClass('hover:bg');

  useEffect(() => {
    const handleResize = () => {
      if (chartContainerRef.current && chartContentRef.current) {
        const containerWidth = chartContainerRef.current.offsetWidth;
        
        // Measure with scale 1 to get real dimensions
        const originalTransform = chartContentRef.current.style.transform;
        chartContentRef.current.style.transform = 'scale(1)';
        const contentWidth = chartContentRef.current.scrollWidth;
        const contentHeight = chartContentRef.current.scrollHeight;
        chartContentRef.current.style.transform = originalTransform;
        
        if (contentWidth > containerWidth && containerWidth > 0) {
          const newScale = Math.max(0.25, (containerWidth - 32) / contentWidth);
          setChartScale(newScale);
          setChartHeight(contentHeight * newScale);
        } else {
          setChartScale(1);
          setChartHeight(contentHeight || 'auto');
        }
      }
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (chartContainerRef.current) observer.observe(chartContainerRef.current);
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [members]);

  if (!members || members.length === 0) return null;

  return (
    <section className="py-24 px-4 md:px-8 bg-brand-surface/30 relative w-full overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 md:mb-24 px-4">
          <h2 className={cn("text-[10px] font-black uppercase tracking-[0.4em] mb-2", `text-${accentColor}`)}>{subtitle}</h2>
          <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white">{title}</h3>
        </div>
        
        <div ref={chartContainerRef} className="px-4 overflow-hidden flex justify-center w-full" style={{ height: chartHeight }}>
          <div 
            ref={chartContentRef}
            className="inline-block origin-top transition-transform duration-500 pb-12"
            style={{ 
              transform: `scale(${chartScale})`,
            }}
          >
            {(() => {
              const map: { [key: string]: any } = {};
              const tree: any[] = [];
              
              members.forEach(member => {
                map[member.id] = { ...member, children: [] };
              });
              
              members.forEach(member => {
                if (member.reportsTo && map[member.reportsTo]) {
                  map[member.reportsTo].children.push(map[member.id]);
                } else {
                  tree.push(map[member.id]);
                }
              });
              
              // Sort roots
              tree.sort((a, b) => {
                const aRole = a.role.toLowerCase();
                const bRole = b.role.toLowerCase();
                if (aRole.includes('captain') || aRole.includes('punong') || aRole.includes('chairman') || aRole.includes('chief')) return -1;
                if (bRole.includes('captain') || bRole.includes('punong') || bRole.includes('chairman') || bRole.includes('chief')) return 1;
                return 0;
              });
              
              return (
                <div className="flex justify-center">
                  {tree.map(root => (
                    <OrgMemberNode 
                      key={root.id} 
                      member={root} 
                      level={0} 
                      isFirst={true} 
                      isLast={true} 
                      hasSiblings={false} 
                      onMemberClick={(m) => setSelectedMember(m)}
                      accentColor={accentColor}
                    />
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Member Detail Modal */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMember(null)}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="relative w-full max-w-2xl bg-brand-surface/90 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row gap-8 p-6 md:p-10"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-full md:w-1/2 aspect-square md:aspect-auto h-auto md:h-[400px] rounded-3xl overflow-hidden border-2 border-brand-border/50">
                {selectedMember.image ? (
                  <img 
                    src={selectedMember.image} 
                    alt={selectedMember.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-brand-bg text-brand-muted/20">
                    <Users className="w-24 h-24" />
                  </div>
                )}
              </div>
              
              <div className="flex flex-col justify-center flex-1">
                <div className="mb-8">
                  <h2 className={cn("text-[12px] font-black uppercase tracking-[0.4em] mb-3", `${textAccent}`)}>Community Leader</h2>
                  <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-4 text-white">
                    {selectedMember.name || "Vacant Position"}
                  </h3>
                  <div className={cn("inline-flex items-center px-6 py-2 text-black font-black uppercase text-[10px] md:text-[12px] tracking-[0.2em] rounded-full", `${bgAccent}`)}>
                    {selectedMember.role}
                  </div>
                </div>

                <div className="space-y-4 pt-8 border-t border-white/5">
                  <p className="text-brand-muted font-medium italic">
                    "Dedicated to serving the people of Barangay Baluarte."
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedMember(null)}
                className={cn("absolute top-6 right-6 w-12 h-12 bg-white/5 transition-all duration-300 rounded-full flex items-center justify-center text-white border border-white/10", `${hoverBgAccent} hover:text-black`)}
              >
                <ChevronLeft className="w-8 h-8 rotate-180" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
