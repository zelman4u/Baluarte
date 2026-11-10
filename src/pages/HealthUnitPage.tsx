import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Activity, ArrowLeft, Stethoscope, Baby, Users, Megaphone, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import { landingPageService, LandingPageContent } from '../services/landingPageService';
import { OrgChart } from '../components/OrgChart';
import { cn } from '../lib/utils';
import { GeminiChatFloatingButton } from '../components/ai/GeminiCivicAssistantModal';

export const HealthUnitPage: React.FC = () => {
  const [content, setContent] = useState<LandingPageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await landingPageService.getPageContent('health');
        if (data) setContent(data);
      } catch (err) {
        console.error('Failed to load health page content:', err);
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
      <div className="h-screen w-full flex items-center justify-center bg-[#051111]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#051111] text-brand-text font-sans overflow-x-hidden selection:bg-cyan-500 selection:text-white relative">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.05)_0%,transparent_70%)] pointer-events-none" />
      
      <nav className="relative z-50 px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="min-h-[44px] flex items-center gap-2 group interactive-click">
          <ArrowLeft className="w-4 h-4 text-brand-muted group-hover:text-cyan-400 transition-colors" />
          <span className="text-[11px] font-black uppercase tracking-widest text-brand-muted group-hover:text-brand-text transition-colors">Main Portal</span>
        </Link>
        <div className="flex items-center gap-2">
           <Heart className="w-5 h-5 text-cyan-500" />
           <span className="font-black uppercase tracking-[0.2em] text-xs sm:text-sm text-cyan-400">Health Unit</span>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative h-[80vh] flex items-center justify-center overflow-hidden">
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
              <div className="absolute inset-0 bg-black/60 z-10"></div>
              <img src={content.heroImages[currentSlide]} className="w-full h-full object-cover" alt="Health" />
            </motion.div>
          </AnimatePresence>
        ) : (
           <div className="absolute inset-0 bg-gradient-to-br from-[#051111] via-[#0a1f1f] to-[#051111]"></div>
        )}

        <div className="relative z-20 max-w-5xl mx-auto text-center px-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-8 text-cyan-400"
          >
            <Activity className="w-3 h-3" />
            <span className="text-[9px] font-black uppercase tracking-widest">Public Health & Welfare</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-8xl font-black tracking-tighter uppercase mb-6 leading-[0.85] text-white"
          >
            {content?.title || <>Compassion <br /> In <span className="text-cyan-500">Service</span></>}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/70 max-w-2xl mx-auto text-sm md:text-lg font-medium leading-relaxed mb-10"
          >
             {content?.body?.substring(0, 200) || "Providing healthcare coordination and social welfare support for the residents of Barangay Baluarte."}
          </motion.p>
        </div>
      </header>

      {/* Quick Facts / Stats */}
      {content?.quickFacts && content.quickFacts.length > 0 && (
        <section className="relative z-10 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-white/5 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
              {content.quickFacts.map((fact, i) => (
                <motion.div 
                  key={fact.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  className="p-4 sm:p-6 bg-black/40 border border-white/10 rounded-2xl text-center kinetic-card interactive-click"
                >
                  <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1 truncate">{fact.label}</p>
                  <p className="text-sm sm:text-base font-black text-cyan-400 truncate interactive-text">{fact.value}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Body */}
      <section className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 mb-6 kinetic-badge">
            Our Commitment
          </span>
          <div className="text-lg sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-brand-text leading-relaxed whitespace-pre-wrap interactive-text">
            {content?.body || "Streamlining medical record keeping, vaccination tracking, and maternal care coordination to ensure the well-being of every resident in our community."}
          </div>
        </motion.div>
      </section>

      {/* Announcements */}
      {content?.announcements && content.announcements.length > 0 && (
        <section className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-black/20 border-b border-white/5">
          <div className="max-w-7xl mx-auto">
            <motion.h3 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl sm:text-3xl font-black uppercase tracking-tighter mb-8 sm:mb-12 text-center text-cyan-400 interactive-text"
            >
              Health Advisories
            </motion.h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {content.announcements.map((ann, i) => (
                <motion.div 
                  key={ann.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="p-6 sm:p-8 bg-white/5 border border-white/10 rounded-2xl kinetic-card interactive-click"
                >
                  <Megaphone className="w-6 h-6 text-cyan-400 mb-4" />
                  <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-2">{new Date(ann.date).toLocaleDateString()}</p>
                  <h4 className="text-base sm:text-lg font-black uppercase tracking-tight mb-3 text-white interactive-text">{ann.title}</h4>
                  <p className="text-xs text-brand-muted leading-relaxed line-clamp-4">{ann.content}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Organization */}
      {content?.organization && content.organization.length > 0 && (
        <OrgChart members={content.organization} accentColor="cyan-500" subtitle="Professional Staff" title="Health Personnel Tree" />
      )}

      {/* Community Gallery */}
      {content?.communityHappenings && content.communityHappenings.length > 0 && (
        <section className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.h3 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl sm:text-3xl font-black uppercase tracking-tighter mb-8 sm:mb-12 text-center text-cyan-400 interactive-text"
            >
              Health Initiatives
            </motion.h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {content.communityHappenings.map((event, i) => (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="group relative aspect-video rounded-3xl overflow-hidden border border-white/10 bg-white/5 kinetic-card interactive-click"
                >
                  {event.image ? (
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-muted">
                      <Camera className="w-12 h-12 opacity-10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-end p-6 sm:p-8">
                    <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest mb-1">{new Date(event.date).toLocaleDateString()}</span>
                    <h4 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter mb-2 interactive-text">{event.title}</h4>
                    <p className="text-xs text-white/70 font-medium max-w-md line-clamp-2">{event.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Floating Gemini Civic Assistant */}
      <GeminiChatFloatingButton />
    </div>
  );
};
