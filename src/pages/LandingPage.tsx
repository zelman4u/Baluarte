import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ArrowRight, Building2, Scale, Heart, Compass, ChevronLeft, ChevronRight, Megaphone, Users, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Base';
import { OrganizationMember, landingPageService, LandingPageContent } from '../services/landingPageService';
import { OrgChart } from '../components/OrgChart';
import { cn } from '../lib/utils';

export const LandingPage: React.FC = () => {
  const [content, setContent] = useState<LandingPageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await landingPageService.getPageContent('main');
        if (data) setContent(data);
      } catch (err) {
        console.error('Failed to load landing page content:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  useEffect(() => {
    if (content?.heroImages?.length && content.heroImages.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % content.heroImages.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [content]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-brand-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans selection:bg-brand-primary selection:text-brand-bg">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-brand-bg/80 backdrop-blur-md border-b border-brand-border px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img 
            src="https://lh3.googleusercontent.com/d/15qEeMZnaeEI052MdJrFujHjkxcKJMHku=s1000" 
            alt="Logo" 
            referrerPolicy="no-referrer"
            className="w-10 h-10 object-contain rounded-full" 
            onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/100/1e1e1e/58a6ff?text=B" }} 
          />
          <span className="font-black uppercase tracking-widest text-sm">Baluarte</span>
        </div>
        <div className="flex items-center gap-8">
          <button onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })} className="text-[10px] font-black uppercase text-brand-muted hover:text-brand-primary transition-colors tracking-widest cursor-pointer">About</button>
          <button onClick={() => document.getElementById('announcements')?.scrollIntoView({ behavior: 'smooth' })} className="text-[10px] font-black uppercase text-brand-muted hover:text-brand-primary transition-colors tracking-widest cursor-pointer">News</button>
          <Link to="/login">
            <Button variant="outline" size="sm" className="text-[10px] font-black uppercase border-brand-primary/30 text-brand-primary">
              Personnel Portal
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section with Slider */}
      <section className="relative min-h-screen pt-32 pb-20 flex flex-col items-center justify-center overflow-hidden">
        {content?.heroImages?.length ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              <div className="absolute inset-0 bg-brand-bg/60 z-10"></div>
              <img src={content.heroImages[currentSlide]} className="w-full h-full object-cover" alt="Baluarte" />
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-bg via-brand-surface to-brand-bg">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4"></div>
          </div>
        )}

        <div className="relative z-20 max-w-7xl mx-auto text-center px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex flex-col items-center gap-4 mb-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-bg/50 backdrop-blur-sm border border-white/10 rounded-full text-white">
              <Shield className="w-3 h-3 text-brand-primary" />
              <span className="text-[9px] font-black uppercase tracking-widest">Official Governance System</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-white/80 text-[11px] font-black uppercase tracking-[0.5em] mb-1 drop-shadow-md">Municipality of Tagoloan</span>
              <span className="text-brand-primary text-[11px] font-black uppercase tracking-[0.3em] drop-shadow-md">Province of Misamis Oriental</span>
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-7xl font-black tracking-tighter uppercase mb-6 leading-[0.9] text-white drop-shadow-2xl"
          >
            {content?.title ? (
              <>{content.title}</>
            ) : (
              <>Empowering Barangay <br /><span className="text-brand-primary">Baluarte</span> <br /> Through Digitalization</>
            )}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/80 max-w-2xl mx-auto text-sm md:text-lg font-medium leading-relaxed mb-10"
          >
            {content?.body ? content.body.substring(0, 160) + '...' : 'The centralized management information system for Barangay Baluarte, streamlining administration, justice, health center operations, and community development.'}
          </motion.p>


        </div>

        {content?.heroImages?.length && content.heroImages.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {content.heroImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={cn(
                  "h-1.5 transition-all rounded-full",
                  currentSlide === idx ? "w-12 bg-brand-primary" : "w-3 bg-white/30"
                )}
              />
            ))}
          </div>
        )}
      </section>

      {/* Quick Facts / Demographics */}
      {content?.quickFacts && content.quickFacts.length > 0 && (
        <section className="py-24 px-8 border-b border-brand-border">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary mb-2">Data Summary</h2>
              <h3 className="text-3xl font-black uppercase tracking-tighter">Barangay Profile</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {(content.quickFacts?.length ? content.quickFacts : [
                { label: 'Type', value: 'Barangay' },
                { label: 'Island Group', value: 'Mindanao' },
                { label: 'Region', value: 'Region X' },
                { label: 'Province', value: 'Misamis Oriental' },
                { label: 'Population', value: '10,860' },
                { label: 'Households', value: '2,158' },
                { label: 'Median Age', value: '23.13' },
                { label: 'Land Area', value: 'Approx. 3.5m elev.' },
                { label: 'Postal Code', value: '9001' },
                { label: 'Growth Rate', value: '2.60%' }
              ]).map((fact: any, i: number) => (
                <div key={i} className="p-6 bg-brand-surface border border-brand-border rounded-xl text-center hover:border-brand-primary transition-colors">
                  <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-2">{fact.label}</p>
                  <p className="text-sm font-black text-brand-text">{fact.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Body / About */}
      <section id="about" className="py-32 px-8 border-b border-brand-border bg-brand-surface/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary mb-6">Our Mission & Identity</h2>
            <div className="text-xl md:text-2xl font-bold uppercase tracking-tight text-brand-text leading-tight whitespace-pre-wrap text-center">
              {content?.body || "Providing efficient and accessible public services through technology, ensuring that every resident of Barangay Baluarte is heard and served with integrity and transparency."}
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section id="location" className="py-24 px-8 border-b border-brand-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary mb-2">Location</h2>
              <h3 className="text-3xl font-black uppercase tracking-tighter mb-6">Strategic Position</h3>
              <p className="text-sm text-brand-muted leading-relaxed mb-8 uppercase font-bold tracking-widest">
                Baluarte is situated at approximately 8.5438, 124.7411, in the island of Mindanao. Elevation is estimated at 3.5 meters above mean sea level.
              </p>
              
              <div className="space-y-6 mb-8">
                <div>
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-brand-primary mb-2">Adjacent Barangays</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Poblacion', 'Santa Cruz', 'Gracia'].map(b => (
                      <span key={b} className="px-3 py-1 bg-brand-surface border border-brand-border rounded-full text-[9px] font-bold uppercase tracking-widest">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-brand-primary mb-2">Nearby Landmarks</h4>
                  <ul className="text-[10px] space-y-1 text-brand-muted font-bold uppercase tracking-widest">
                    <li>• Tagoloan River (1.08 km)</li>
                    <li>• Cagayan de Oro River (10.05 km)</li>
                    <li>• Mount Balatukan (34.50 km)</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <a href="https://www.google.com/maps/search/?api=1&query=8.5438,124.7411" target="_blank" rel="noreferrer" className="px-6 py-3 bg-brand-surface border border-brand-border rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-brand-primary transition-colors">
                  Open In Google Maps
                </a>
              </div>
            </div>
            <div className="flex-1 w-full aspect-video bg-brand-surface rounded-3xl border border-brand-border overflow-hidden relative group">
               <iframe
                 width="100%"
                 height="100%"
                 frameBorder="0"
                 style={{ border: 0 }}
                 src="https://maps.google.com/maps?q=Baluarte,%20Tagoloan,%20Misamis%20Oriental&t=&z=15&ie=UTF8&iwloc=&output=embed"
                 allowFullScreen
                 className="w-full h-full brightness-90 contrast-125 group-hover:brightness-100 transition-all duration-700"
                 title="Baluarte Location Map"
               ></iframe>
               <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-brand-border rounded-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Demographics & History */}
      <section className="py-24 px-8 border-b border-brand-border bg-brand-surface/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Population Trends */}
            <div>
              <div className="mb-10">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary mb-2">Analytics</h2>
                <h3 className="text-3xl font-black uppercase tracking-tighter">Population Trends</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-brand-border">
                      <th className="py-4 text-[9px] font-black uppercase tracking-widest text-brand-muted">Census Date</th>
                      <th className="py-4 text-[9px] font-black uppercase tracking-widest text-brand-muted">Population</th>
                      <th className="py-4 text-[9px] font-black uppercase tracking-widest text-brand-muted">Annual Growth</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/30">
                    {[
                      { date: '1990 May 1', pop: '4,772', growth: '-' },
                      { date: '2000 May 1', pop: '5,811', growth: '0.07%' },
                      { date: '2010 May 1', pop: '9,306', growth: '9.40%' },
                      { date: '2020 May 1', pop: '10,860', growth: '2.60%' }
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-brand-primary/5 transition-colors group">
                        <td className="py-4 text-[10px] font-black uppercase tracking-tight">{row.date}</td>
                        <td className="py-4 text-[10px] font-black text-brand-text">{row.pop}</td>
                        <td className="py-4 text-[10px] font-black text-brand-primary">{row.growth}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Age Distribution */}
            <div>
              <div className="mb-10">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary mb-2">Demographics</h2>
                <h3 className="text-3xl font-black uppercase tracking-tighter">Age Distribution</h3>
              </div>
              <div className="space-y-6">
                {[
                  { label: 'Young Dependents (0-14)', value: '32.65%', count: '3,138' },
                  { label: 'Working Age (15-64)', value: '63.98%', count: '6,150' },
                  { label: 'Senior Citizens (65+)', value: '3.37%', count: '324' }
                ].map((group, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black uppercase tracking-widest">{group.label}</span>
                      <span className="text-[10px] font-black text-brand-primary">{group.value}</span>
                    </div>
                    <div className="h-2 w-full bg-brand-surface border border-brand-border rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: group.value }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="h-full bg-brand-primary"
                      />
                    </div>
                  </div>
                ))}
                <div className="pt-6 border-t border-brand-border">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-brand-surface border border-brand-border rounded-xl">
                      <p className="text-[8px] font-black text-brand-muted uppercase tracking-widest mb-1">Median Age</p>
                      <p className="text-xl font-black text-brand-text">23.13</p>
                    </div>
                    <div className="p-4 bg-brand-surface border border-brand-border rounded-xl">
                      <p className="text-[8px] font-black text-brand-muted uppercase tracking-widest mb-1">Dependency Ratio</p>
                      <p className="text-xl font-black text-brand-text">56.29</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Announcements */}
      <section id="announcements" className="py-24 px-8 bg-brand-surface/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary mb-2">Bulletins</h2>
              <h3 className="text-3xl font-black uppercase tracking-tighter">Latest Announcements</h3>
            </div>
          </div>
          
          {content?.announcements && content.announcements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.announcements.map((ann) => (
                <div key={ann.id} className="p-8 bg-brand-card border border-brand-border rounded-2xl hover:border-brand-primary/30 transition-all group">
                  <div className="w-10 h-10 bg-brand-bg rounded-xl flex items-center justify-center mb-6 border border-brand-border text-brand-primary">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-2">
                    {new Date(ann.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                  <h4 className="text-lg font-black uppercase tracking-tight mb-4 group-hover:text-brand-primary transition-colors">{ann.title}</h4>
                  <p className="text-xs text-brand-muted leading-relaxed line-clamp-4">{ann.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-brand-border rounded-3xl">
              <Megaphone className="w-12 h-12 text-brand-muted mx-auto mb-4 opacity-20" />
              <p className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em]">No official announcements at this time.</p>
            </div>
          )}
        </div>
      </section>

      {/* Core Departments */}
      <section className="py-24 px-8 border-y border-brand-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
             <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary mb-2">Structure</h2>
             <h3 className="text-3xl font-black uppercase tracking-tighter">Departmental Portals</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { id: 'JUSTICE', title: 'Justice & Safety', icon: Scale, path: '/info/justice' },
              { id: 'HEALTH', title: 'Social Welfare', icon: Heart, path: '/info/health' },
              { id: 'YOUTH', title: 'Community & SK', icon: Compass, path: '/info/youth' },
            ].map(dept => (
              <Link key={dept.id} to={dept.path} className="group">
                <div className="p-8 h-full bg-brand-card border border-brand-border rounded-2xl hover:border-brand-primary/50 transition-all flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-brand-bg border border-brand-border rounded-2xl flex items-center justify-center text-brand-primary mb-6 group-hover:scale-110 transition-transform">
                    <dept.icon className="w-7 h-7" />
                  </div>
                  <h4 className="text-lg font-black uppercase tracking-tight mb-2">{dept.title}</h4>
                  <span className="text-[9px] font-black text-brand-muted uppercase tracking-widest group-hover:text-brand-primary transition-colors">Access Portal</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Organization Chart */}
      {content?.organization && content.organization.length > 0 && (
        <OrgChart members={content.organization} subtitle="Leadership" title="Barangay Organization Tree" />
      )}

      {/* Community Happenings */}
      {content?.communityHappenings && content.communityHappenings.length > 0 && (
        <section className="py-24 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary mb-2">Gallery</h2>
                <h3 className="text-3xl font-black uppercase tracking-tighter">Community Happenings</h3>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {content.communityHappenings.map((event) => (
                <div key={event.id} className="group relative aspect-[16/9] rounded-3xl overflow-hidden border border-brand-border bg-brand-surface">
                  {event.image ? (
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-muted">
                      <Camera className="w-12 h-12 opacity-10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8">
                    <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest mb-1">
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <h4 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">{event.title}</h4>
                    <p className="text-xs text-white/70 font-medium max-w-md line-clamp-2">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-20 px-8 border-t border-brand-border bg-brand-bg">
        <div className="max-w-7xl mx-auto text-center">
            <div className="flex flex-col items-center gap-6 mb-12">
              <img 
                src="https://lh3.googleusercontent.com/d/15qEeMZnaeEI052MdJrFujHjkxcKJMHku=s1000" 
                alt="Logo" 
                referrerPolicy="no-referrer"
                className="w-16 h-16 object-contain rounded-full" 
                onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/100/1e1e1e/58a6ff?text=B" }} 
              />
              <span className="font-black uppercase tracking-widest text-lg">Barangay Baluarte</span>
              <p className="text-xs text-brand-muted leading-relaxed font-medium max-w-sm uppercase tracking-widest">
                Official Digital Governance Portal <br /> Transparency • Service • Innovation
              </p>
            </div>
            <div className="pt-8 border-t border-brand-border text-[10px] font-black text-brand-muted uppercase tracking-[0.3em]">
              © 2026 BARANGAY BALUARTE • ALL RIGHTS RESERVED
            </div>
        </div>
      </footer>

    </div>
  );
};
