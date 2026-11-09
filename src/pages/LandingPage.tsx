import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  ArrowRight, 
  Building2, 
  Scale, 
  Heart, 
  Compass, 
  Megaphone, 
  Users, 
  Camera, 
  MapPin, 
  ExternalLink,
  Calendar,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  PhoneCall
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Base';
import { landingPageService, LandingPageContent } from '../services/landingPageService';
import { OrgChart } from '../components/OrgChart';
import { cn } from '../lib/utils';
import { GeminiChatFloatingButton } from '../components/ai/GeminiCivicAssistantModal';

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
      }, 5500);
      return () => clearInterval(timer);
    }
  }, [content]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-brand-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
          <span className="text-xs font-mono uppercase tracking-widest text-brand-muted animate-pulse">Loading Baluarte Portal...</span>
        </div>
      </div>
    );
  }

  const quickFacts = (content?.quickFacts && content.quickFacts.length > 0) ? content.quickFacts : [
    { label: 'Classification', value: 'Barangay' },
    { label: 'Municipality', value: 'Tagoloan' },
    { label: 'Province', value: 'Misamis Oriental' },
    { label: 'Region', value: 'Region X' },
    { label: 'Total Population', value: '10,860' },
    { label: 'Registered Households', value: '2,158' },
    { label: 'Median Age', value: '23.1 yrs' },
    { label: 'Elevation', value: '3.5m MSL' },
    { label: 'Postal Code', value: '9001' },
    { label: 'Annual Growth Rate', value: '2.60%' }
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans selection:bg-brand-primary selection:text-brand-bg relative overflow-x-hidden">
      {/* Global Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-bg/90 backdrop-blur-md border-b border-brand-border h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group interactive-click">
            <div className="relative">
              <img 
                src="https://lh3.googleusercontent.com/d/15qEeMZnaeEI052MdJrFujHjkxcKJMHku=s1000" 
                alt="Barangay Baluarte Seal" 
                referrerPolicy="no-referrer"
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-full shadow-md group-hover:scale-105 transition-transform" 
                onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/100/1e1e1e/58a6ff?text=B" }} 
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-brand-bg"></span>
            </div>
            <div className="flex flex-col">
              <span className="font-black uppercase tracking-wider text-xs sm:text-sm text-brand-text group-hover:text-brand-primary transition-colors interactive-text">
                Barangay Baluarte
              </span>
              <span className="text-[9px] font-mono text-brand-muted uppercase tracking-widest leading-none">
                Tagoloan, Misamis Oriental
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-6">
            <button 
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })} 
              className="min-h-[44px] px-3 py-1.5 text-[11px] font-black uppercase text-brand-muted hover:text-brand-primary transition-colors tracking-widest cursor-pointer interactive-click hidden md:inline-flex items-center"
            >
              About
            </button>
            <button 
              onClick={() => document.getElementById('departments')?.scrollIntoView({ behavior: 'smooth' })} 
              className="min-h-[44px] px-3 py-1.5 text-[11px] font-black uppercase text-brand-muted hover:text-brand-primary transition-colors tracking-widest cursor-pointer interactive-click hidden md:inline-flex items-center"
            >
              Services
            </button>
            <button 
              onClick={() => document.getElementById('location')?.scrollIntoView({ behavior: 'smooth' })} 
              className="min-h-[44px] px-3 py-1.5 text-[11px] font-black uppercase text-brand-muted hover:text-brand-primary transition-colors tracking-widest cursor-pointer interactive-click hidden sm:inline-flex items-center"
            >
              GIS Map
            </button>
            <button 
              onClick={() => document.getElementById('announcements')?.scrollIntoView({ behavior: 'smooth' })} 
              className="min-h-[44px] px-3 py-1.5 text-[11px] font-black uppercase text-brand-muted hover:text-brand-primary transition-colors tracking-widest cursor-pointer interactive-click hidden sm:inline-flex items-center"
            >
              Bulletins
            </button>

            <Link to="/login" className="inline-block">
              <Button 
                variant="outline" 
                size="sm" 
                className="min-h-[44px] text-[11px] font-black uppercase border-brand-primary/40 text-brand-primary px-4 sm:px-6 interactive-click hover:bg-brand-primary hover:text-brand-bg transition-all shadow-md shadow-brand-primary/10"
              >
                Terminal Login
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[92vh] pt-28 pb-16 flex flex-col items-center justify-center overflow-hidden border-b border-brand-border">
        {/* Background Layer with Transition */}
        {content?.heroImages?.length ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <div className="absolute inset-0 bg-brand-bg/75 backdrop-blur-[2px] z-10"></div>
              <img src={content.heroImages[currentSlide]} className="w-full h-full object-cover" alt="Baluarte Community" />
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-bg via-brand-surface to-brand-bg">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[45rem] h-[30rem] bg-brand-primary/10 blur-[140px] rounded-full pointer-events-none"></div>
          </div>
        )}

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center my-auto">
          {/* Eyebrow Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-card/80 backdrop-blur-md border border-brand-border text-brand-text mb-6 shadow-lg shadow-black/40 kinetic-badge"
          >
            <Shield className="w-3.5 h-3.5 text-brand-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text">
              Official Local Government Terminal
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </motion.div>

          {/* Tagoloan / MisOr Subtitle */}
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center justify-center gap-2 text-xs sm:text-sm font-black uppercase tracking-[0.3em] text-brand-primary mb-4 drop-shadow"
          >
            <span>Municipality of Tagoloan</span>
            <span>•</span>
            <span>Province of Misamis Oriental</span>
          </motion.div>

          {/* Main Hero Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight uppercase leading-[0.95] text-white drop-shadow-2xl max-w-5xl mx-auto interactive-text cursor-default"
          >
            {content?.title ? (
              <>{content.title}</>
            ) : (
              <>Empowering Barangay <span className="text-brand-primary">Baluarte</span> Through Digitalization</>
            )}
          </motion.h1>

          {/* Hero Description */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-white/80 max-w-2xl mx-auto text-xs sm:text-base md:text-lg font-normal leading-relaxed mt-6 mb-8 interactive-text"
          >
            {content?.body 
              ? content.body.substring(0, 180) + '...' 
              : 'The centralized management information system for Barangay Baluarte, streamlining administration, Katarungang Pambarangay, public health operations, and community development.'
            }
          </motion.p>

          {/* Call-to-Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full sm:w-auto"
          >
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-baluarte-companion'));
              }}
              className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-primary to-blue-600 text-brand-bg font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-brand-primary/25 hover:brightness-110 interactive-click"
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Talk to Baluarte Your AI companions</span>
            </button>
            <button
              onClick={() => document.getElementById('location')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto min-h-[48px] px-7 py-3.5 rounded-xl bg-brand-surface/90 backdrop-blur-md border border-brand-border text-brand-text font-black text-xs uppercase tracking-wider hover:bg-brand-surface hover:border-brand-primary/40 interactive-click"
            >
              Explore Barangay GIS & Profile
            </button>
          </motion.div>
        </div>

        {/* Slide Carousel Indicators */}
        {content?.heroImages?.length && content.heroImages.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-brand-card/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-brand-border/50">
            {content.heroImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={cn(
                  "h-1.5 transition-all rounded-full interactive-click",
                  currentSlide === idx ? "w-8 bg-brand-primary" : "w-2.5 bg-white/30 hover:bg-white/60"
                )}
              />
            ))}
          </div>
        )}
      </section>

      {/* Quick Facts & Demographics Grid */}
      <section id="facts" className="py-20 sm:py-24 border-b border-brand-border bg-brand-surface/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 sm:mb-16"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-black uppercase tracking-[0.25em] mb-2 kinetic-badge">
              <Activity className="w-3 h-3" />
              <span>Statistical Profile</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white interactive-text cursor-default">
              Barangay Baluarte Demographics
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted max-w-xl mx-auto mt-2 leading-relaxed">
              Key administrative parameters, land elevation metrics, and household census figures.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {quickFacts.map((fact, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="p-4 sm:p-5 bg-brand-surface border border-brand-border rounded-xl text-center kinetic-card interactive-click group"
              >
                <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1.5 truncate group-hover:text-brand-primary transition-colors">
                  {fact.label}
                </p>
                <p className="text-sm sm:text-base font-black text-brand-text interactive-text">
                  {fact.value}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Identity Section */}
      <section id="about" className="py-20 sm:py-24 border-b border-brand-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-black uppercase tracking-[0.25em] mb-2 kinetic-badge">
              <Sparkles className="w-3 h-3" />
              <span>Vision & Governance</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white interactive-text cursor-default">
              Our Mission & Identity
            </h2>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-8 sm:p-12 bg-gradient-to-br from-brand-surface via-brand-card to-brand-surface border border-brand-border rounded-3xl shadow-xl text-center relative overflow-hidden kinetic-card"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <p className="text-lg sm:text-2xl font-bold uppercase tracking-tight text-brand-text leading-snug whitespace-pre-wrap interactive-text">
              {content?.body || "Providing efficient and accessible public services through technology, ensuring that every resident of Barangay Baluarte is heard and served with integrity, transparency, and accountability."}
            </p>

            <div className="mt-8 pt-8 border-t border-brand-border/40 flex flex-wrap items-center justify-center gap-6 text-xs text-brand-muted">
              <span className="flex items-center gap-2 font-bold uppercase tracking-wider text-brand-primary">
                <CheckCircle2 className="w-4 h-4" />
                DILG Compliant Records
              </span>
              <span className="flex items-center gap-2 font-bold uppercase tracking-wider text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                24/7 Security & DRRM Telemetry
              </span>
              <span className="flex items-center gap-2 font-bold uppercase tracking-wider text-amber-400">
                <CheckCircle2 className="w-4 h-4" />
                Direct Katarungang Pambarangay
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* GIS Location & Infrastructure Section */}
      <section id="location" className="py-20 sm:py-24 border-b border-brand-border bg-brand-surface/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 sm:mb-16"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-black uppercase tracking-[0.25em] mb-2 kinetic-badge">
              <MapPin className="w-3 h-3" />
              <span>Geospatial Intelligence</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white interactive-text cursor-default">
              Strategic Location & Geography
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted max-w-xl mx-auto mt-2 leading-relaxed">
              Situated in Tagoloan alongside the Tagoloan River delta and Macajalar Bay industrial zone.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column: Geographic Details */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="p-6 bg-brand-surface border border-brand-border rounded-2xl kinetic-card">
                <h3 className="text-xs font-black uppercase tracking-widest text-brand-primary mb-2">
                  Coordinates & Elevation
                </h3>
                <p className="text-sm text-brand-text leading-relaxed font-mono">
                  Latitude: <span className="font-bold text-brand-primary">8.5438° N</span> • Longitude: <span className="font-bold text-brand-primary">124.7411° E</span>
                </p>
                <p className="text-xs text-brand-muted mt-2 leading-relaxed">
                  Baluarte is located in Northern Mindanao at an estimated elevation of 3.5 meters above mean sea level, featuring coastal-riverine terrain critical for flood risk telemetry.
                </p>
              </div>

              <div className="p-6 bg-brand-surface border border-brand-border rounded-2xl kinetic-card space-y-4">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2">
                    Adjacent Tagoloan Barangays
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {['Poblacion', 'Santa Cruz', 'Gracia', 'Caniogan', 'Natumolan'].map(b => (
                      <span key={b} className="px-3 py-1 bg-brand-bg border border-brand-border rounded-lg text-[10px] font-bold uppercase tracking-wider text-brand-text kinetic-badge">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-brand-border/40">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2">
                    Proximity Landmarks
                  </h4>
                  <ul className="text-xs space-y-1.5 text-brand-muted">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
                      <span>Tagoloan River Spillway & Dike — 1.08 km</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
                      <span>Cagayan de Oro City Border — 10.05 km</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
                      <span>PHIVIDEC Industrial Estate — Adjacent Sector</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=8.5438,124.7411&utm_campaign=gmp_mcp_codeassist_v1_aistudio" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="min-h-[44px] px-6 py-3 bg-brand-surface border border-brand-border rounded-xl text-xs font-black uppercase tracking-wider text-brand-text hover:text-brand-primary hover:border-brand-primary/40 transition-colors flex items-center gap-2 interactive-click"
                >
                  <span>Open Coordinates in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>

            {/* Right Column: Google Maps Embed */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="w-full aspect-[4/3] sm:aspect-video lg:aspect-square max-h-[420px] bg-brand-surface rounded-3xl border border-brand-border overflow-hidden relative group shadow-2xl kinetic-card"
            >
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src="https://maps.google.com/maps?q=Baluarte,%20Tagoloan,%20Misamis%20Oriental&t=&z=15&ie=UTF8&iwloc=&output=embed"
                allowFullScreen
                className="w-full h-full brightness-90 contrast-125 group-hover:brightness-100 transition-all duration-700"
                title="Barangay Baluarte Map View"
              ></iframe>
              <div className="absolute top-4 left-4 bg-brand-bg/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-brand-border text-[10px] font-black uppercase tracking-wider text-brand-text flex items-center gap-2 pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Baluarte Poblacion Dike</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Demographics & Population Analytics */}
      <section className="py-20 sm:py-24 border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 sm:mb-16"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-black uppercase tracking-[0.25em] mb-2 kinetic-badge">
              <TrendingUp className="w-3 h-3" />
              <span>Census Analytics</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white interactive-text cursor-default">
              Population Growth & Age Structure
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted max-w-xl mx-auto mt-2 leading-relaxed">
              Official PSA census counts and demographic dependency ratios.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Population Trends Table */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="p-6 sm:p-8 bg-brand-surface border border-brand-border rounded-2xl kinetic-card"
            >
              <div className="mb-6 pb-4 border-b border-brand-border/50">
                <h3 className="text-base font-black uppercase tracking-tight text-brand-text interactive-text">
                  Historical Census Trajectory
                </h3>
                <p className="text-xs text-brand-muted mt-1">Official population recordings across three decades</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-brand-border">
                      <th className="py-3 text-[10px] font-black uppercase tracking-widest text-brand-muted">Census Record</th>
                      <th className="py-3 text-[10px] font-black uppercase tracking-widest text-brand-muted text-right">Population</th>
                      <th className="py-3 text-[10px] font-black uppercase tracking-widest text-brand-muted text-right">Annual Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/40 font-mono text-xs">
                    {[
                      { date: '1990 May 1', pop: '4,772', growth: 'Baseline' },
                      { date: '2000 May 1', pop: '5,811', growth: '+0.07%' },
                      { date: '2010 May 1', pop: '9,306', growth: '+9.40%' },
                      { date: '2020 May 1', pop: '10,860', growth: '+2.60%' }
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-brand-primary/5 transition-colors group interactive-click">
                        <td className="py-3.5 text-brand-text font-bold group-hover:text-brand-primary">{row.date}</td>
                        <td className="py-3.5 text-right font-black text-brand-text">{row.pop}</td>
                        <td className="py-3.5 text-right text-emerald-400 font-bold">{row.growth}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Age Distribution Progress */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-6 sm:p-8 bg-brand-surface border border-brand-border rounded-2xl kinetic-card flex flex-col justify-between"
            >
              <div>
                <div className="mb-6 pb-4 border-b border-brand-border/50">
                  <h3 className="text-base font-black uppercase tracking-tight text-brand-text interactive-text">
                    Age Cohort Distribution
                  </h3>
                  <p className="text-xs text-brand-muted mt-1">Productive demographic dividend breakdown</p>
                </div>

                <div className="space-y-5">
                  {[
                    { label: 'Young Dependents (0-14 yrs)', value: '32.65%', count: '3,138 Residents', color: 'bg-brand-primary' },
                    { label: 'Working Age Population (15-64 yrs)', value: '63.98%', count: '6,150 Residents', color: 'bg-emerald-400' },
                    { label: 'Senior Citizens (65+ yrs)', value: '3.37%', count: '324 Residents', color: 'bg-amber-400' }
                  ].map((group, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between items-end text-xs">
                        <span className="font-bold text-brand-text">{group.label}</span>
                        <span className="font-mono font-bold text-brand-primary">{group.value} ({group.count})</span>
                      </div>
                      <div className="h-2.5 w-full bg-brand-bg border border-brand-border rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: group.value }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.9, delay: i * 0.15 }}
                          className={cn("h-full rounded-full", group.color)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-brand-border/40 grid grid-cols-2 gap-4">
                <div className="p-3.5 bg-brand-bg rounded-xl border border-brand-border text-center">
                  <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-0.5">Median Age</p>
                  <p className="text-xl font-black text-brand-text font-mono">23.13 Years</p>
                </div>
                <div className="p-3.5 bg-brand-bg rounded-xl border border-brand-border text-center">
                  <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-0.5">Dependency Ratio</p>
                  <p className="text-xl font-black text-brand-text font-mono">56.29</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Departmental Portals */}
      <section id="departments" className="py-20 sm:py-24 border-b border-brand-border bg-brand-surface/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 sm:mb-16"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-black uppercase tracking-[0.25em] mb-2 kinetic-badge">
              <Building2 className="w-3 h-3" />
              <span>Public Service Divisions</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white interactive-text cursor-default">
              Departmental Information Portals
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted max-w-xl mx-auto mt-2 leading-relaxed">
              Public service mandates, dispute conciliation rules, health clinics, and youth initiatives.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                id: 'JUSTICE', 
                title: 'Justice & Public Order', 
                subtitle: 'Katarungang Pambarangay & Tanod', 
                desc: 'Amicable settlement mediation, Lupon Tagapamayapa summons, and 24/7 public safety patrol operations.',
                icon: Scale, 
                color: 'text-amber-400',
                badgeBg: 'bg-amber-400/10 border-amber-400/25',
                path: '/info/justice' 
              },
              { 
                id: 'HEALTH', 
                title: 'Health & Social Welfare', 
                subtitle: 'Medical Center & AICS Subsidies', 
                desc: 'Barangay Health Station maternal care, vaccination schedules, PWD/Senior Citizen social assistance.',
                icon: Heart, 
                color: 'text-pink-400',
                badgeBg: 'bg-pink-400/10 border-pink-400/25',
                path: '/info/health' 
              },
              { 
                id: 'YOUTH', 
                title: 'Youth & Community (SK)', 
                subtitle: 'Sangguniang Kabataan Development', 
                desc: 'Youth education subsidies, leadership fellowships, sports tournaments, and disaster youth volunteers.',
                icon: Compass, 
                color: 'text-brand-primary',
                badgeBg: 'bg-brand-primary/10 border-brand-primary/25',
                path: '/info/youth' 
              },
            ].map((dept, i) => (
              <motion.div
                key={dept.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link to={dept.path} className="block h-full group">
                  <div className="p-7 sm:p-8 h-full bg-brand-surface border border-brand-border rounded-2xl hover:border-brand-primary/50 transition-all flex flex-col justify-between kinetic-card interactive-click">
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className={cn("w-14 h-14 rounded-2xl border flex items-center justify-center transition-transform group-hover:scale-110", dept.badgeBg, dept.color)}>
                          <dept.icon className="w-7 h-7" />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-brand-muted uppercase tracking-widest">
                          {dept.id}
                        </span>
                      </div>

                      <h3 className="text-xl font-black uppercase tracking-tight text-brand-text group-hover:text-brand-primary transition-colors interactive-text">
                        {dept.title}
                      </h3>
                      <p className="text-xs font-bold text-brand-primary uppercase tracking-wide mt-1">
                        {dept.subtitle}
                      </p>
                      <p className="text-xs text-brand-muted leading-relaxed mt-3">
                        {dept.desc}
                      </p>
                    </div>

                    <div className="pt-6 mt-6 border-t border-brand-border/40 flex items-center justify-between text-xs font-black uppercase tracking-wider text-brand-primary group-hover:translate-x-1 transition-transform">
                      <span>Access Public Portal</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Tree */}
      {content?.organization && content.organization.length > 0 && (
        <OrgChart members={content.organization} subtitle="Leadership" title="Barangay Organization Tree" />
      )}

      {/* Latest Bulletins & Announcements */}
      <section id="announcements" className="py-20 sm:py-24 border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 sm:mb-16"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-black uppercase tracking-[0.25em] mb-2 kinetic-badge">
              <Megaphone className="w-3 h-3" />
              <span>Official Bulletins</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white interactive-text cursor-default">
              Latest Barangay Announcements
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted max-w-xl mx-auto mt-2 leading-relaxed">
              Direct municipal notices, health center schedules, and disaster weather advisories.
            </p>
          </motion.div>

          {content?.announcements && content.announcements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.announcements.map((ann, i) => (
                <motion.div
                  key={ann.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="p-6 sm:p-7 bg-brand-surface border border-brand-border rounded-2xl hover:border-brand-primary/40 transition-all group kinetic-card interactive-click flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-brand-bg rounded-xl flex items-center justify-center border border-brand-border text-brand-primary">
                        <Megaphone className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono text-brand-muted">
                        {new Date(ann.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <h4 className="text-base sm:text-lg font-black uppercase tracking-tight text-brand-text mb-2 group-hover:text-brand-primary transition-colors interactive-text">
                      {ann.title}
                    </h4>
                    <p className="text-xs text-brand-muted leading-relaxed line-clamp-4">
                      {ann.content}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-brand-border/40 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-brand-primary">
                    <span>Verified Official Release</span>
                    <span>Zone 2 Secretariat</span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center border border-dashed border-brand-border rounded-2xl bg-brand-surface/30">
              <Megaphone className="w-10 h-10 text-brand-muted mx-auto mb-3 opacity-30" />
              <p className="text-xs font-bold text-brand-muted uppercase tracking-widest">
                No active announcements at this time.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Community Happenings / Gallery */}
      {content?.communityHappenings && content.communityHappenings.length > 0 && (
        <section className="py-20 sm:py-24 border-b border-brand-border bg-brand-surface/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12 sm:mb-16"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-black uppercase tracking-[0.25em] mb-2 kinetic-badge">
                <Camera className="w-3 h-3" />
                <span>Field Documentation</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white interactive-text cursor-default">
                Community Happenings & Programs
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {content.communityHappenings.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group relative aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden border border-brand-border bg-brand-surface kinetic-card"
                >
                  {event.image ? (
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-muted">
                      <Camera className="w-12 h-12 opacity-20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 sm:p-8">
                    <span className="text-[10px] font-mono font-bold text-brand-primary uppercase tracking-widest mb-1">
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mb-1.5 interactive-text">
                      {event.title}
                    </h3>
                    <p className="text-xs text-white/80 font-normal line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Global Landing Footer */}
      <footer className="py-16 sm:py-20 border-t border-brand-border bg-brand-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-12 border-b border-brand-border/40">
            <div className="flex items-center gap-4 text-center md:text-left">
              <img 
                src="https://lh3.googleusercontent.com/d/15qEeMZnaeEI052MdJrFujHjkxcKJMHku=s1000" 
                alt="Barangay Logo" 
                referrerPolicy="no-referrer"
                className="w-14 h-14 object-contain rounded-full shadow-lg" 
                onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/100/1e1e1e/58a6ff?text=B" }} 
              />
              <div>
                <h4 className="font-black uppercase tracking-wider text-base text-brand-text interactive-text">
                  Barangay Baluarte Governance
                </h4>
                <p className="text-xs text-brand-muted mt-0.5">
                  Municipality of Tagoloan • Province of Misamis Oriental
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-brand-muted">
              <Link to="/login" className="hover:text-brand-primary transition-colors uppercase font-bold tracking-wider">
                Terminal Login
              </Link>
              <Link to="/info/justice" className="hover:text-brand-primary transition-colors uppercase font-bold tracking-wider">
                Katarungang Pambarangay
              </Link>
              <Link to="/info/health" className="hover:text-brand-primary transition-colors uppercase font-bold tracking-wider">
                Health & Welfare
              </Link>
              <Link to="/info/youth" className="hover:text-brand-primary transition-colors uppercase font-bold tracking-wider">
                Youth Programs (SK)
              </Link>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono text-brand-muted text-center sm:text-left uppercase tracking-wider">
            <span>© 2026 BARANGAY BALUARTE • ALL RIGHTS RESERVED</span>
            <span>PUBLIC SAFETY COMMAND HOTLINE: 0917-882-5827</span>
          </div>
        </div>
      </footer>

      {/* Floating Gemini Civic Assistant */}
      <GeminiChatFloatingButton />
    </div>
  );
};
