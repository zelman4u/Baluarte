import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Trophy, ArrowLeft, Target, Trees, Cpu, Megaphone, Users, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import { landingPageService, LandingPageContent } from '../services/landingPageService';
import { cn } from '../lib/utils';

export const YouthUnitPage: React.FC = () => {
  const [content, setContent] = useState<LandingPageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await landingPageService.getPageContent('youth');
        if (data) setContent(data);
      } catch (err) {
        console.error('Failed to load youth page content:', err);
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
      <div className="h-screen w-full flex items-center justify-center bg-[#000d1a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000d1a] text-brand-text font-sans overflow-x-hidden selection:bg-blue-500 selection:text-white">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,120,255,0.08)_0%,transparent_70%)] pointer-events-none" />
      
      <nav className="relative z-50 px-8 py-6 flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2 group">
          <ArrowLeft className="w-4 h-4 text-brand-muted group-hover:text-blue-400 transition-colors" />
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted group-hover:text-brand-text transition-colors">Main Portal</span>
        </Link>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-500" />
              <span className="font-black uppercase tracking-[0.2em] text-sm text-white">Youth_Unit</span>
           </div>
           <div>
              <img 
                src="https://lh3.googleusercontent.com/d/1x8riK__Rn53iKzwbvEUapuNuQmNUwC33=s1000" 
                alt="SK Logo" 
                className="w-10 h-10 object-contain rounded-full border border-white/10"
              />
           </div>
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
              <img src={content.heroImages[currentSlide]} className="w-full h-full object-cover" alt="Youth" />
            </motion.div>
          </AnimatePresence>
        ) : (
           <div className="absolute inset-0 bg-gradient-to-br from-[#000d1a] via-[#001a33] to-[#000d1a]"></div>
        )}

        <div className="relative z-20 max-w-5xl mx-auto text-center px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-8 text-blue-400"
          >
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest">Community & SK Synergy</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-8xl font-black tracking-tighter uppercase mb-6 leading-[0.8] text-white italic"
          >
            {content?.title || <>Future <br /> Driven <span className="text-blue-500">Vision</span></>}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/70 max-w-2xl mx-auto text-sm md:text-lg font-medium leading-relaxed mb-10"
          >
             {content?.body?.substring(0, 200) || "Empowering the youth of Barangay Baluarte through digitalization, sports excellence coordination, and environmental sustainability monitoring."}
          </motion.p>
        </div>
      </header>

      {/* Quick Facts / Stats */}
      {content?.quickFacts && content.quickFacts.length > 0 && (
        <section className="relative z-10 py-16 px-8 border-b border-white/5 bg-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {content.quickFacts.map(fact => (
                <div key={fact.id} className="p-6 bg-black/40 border border-white/10 rounded-2xl text-center">
                  <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">{fact.label}</p>
                  <p className="text-sm font-black text-blue-500 truncate">{fact.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Body */}
      <section className="relative z-10 py-24 px-8 border-b border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-6">Our Vision</h2>
          <div className="text-xl md:text-3xl font-black uppercase tracking-tight text-brand-text leading-tight whitespace-pre-wrap italic">
            {content?.body || "Providing the platform for the next generation of leaders. We focus on building a future-ready Baluarte through youth empowerment and community engagement."}
          </div>
        </div>
      </section>

      {/* Announcements */}
      {content?.announcements && content.announcements.length > 0 && (
        <section className="relative z-10 py-24 px-8 bg-black/20">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-3xl font-black uppercase tracking-tighter mb-12 text-center text-blue-500">SK Bulletins</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.announcements.map((ann) => (
                <div key={ann.id} className="p-8 bg-white/5 border border-white/10 rounded-2xl group hover:border-blue-500/30 transition-all">
                  <Megaphone className="w-6 h-6 text-blue-500 mb-6" />
                  <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-2">{new Date(ann.date).toLocaleDateString()}</p>
                  <h4 className="text-lg font-black uppercase tracking-tight mb-4 text-white group-hover:text-blue-400 transition-colors">{ann.title}</h4>
                  <p className="text-xs text-brand-muted leading-relaxed line-clamp-4">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Organization */}
      {content?.organization && content.organization.length > 0 && (
        <section className="relative z-10 py-24 px-8 border-y border-white/5">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-3xl font-black uppercase tracking-tighter mb-12 text-center text-blue-500">Youth Leadership</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {content.organization.map((member) => (
                <div key={member.id} className="text-center group">
                  <div className="aspect-square bg-white/5 border border-white/10 rounded-2xl mb-4 overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                    {member.image ? (
                      <img src={member.image} className="w-full h-full object-cover" alt={member.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/10">
                        <Users className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  <h5 className="text-[10px] font-black uppercase tracking-tight text-white">{member.name}</h5>
                  <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] mt-1">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Community Gallery */}
      {content?.communityHappenings && content.communityHappenings.length > 0 && (
        <section className="relative z-10 py-24 px-8">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-3xl font-black uppercase tracking-tighter mb-12 text-center text-blue-500">Youth Events</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {content.communityHappenings.map((event) => (
                <div key={event.id} className="group relative aspect-video rounded-3xl overflow-hidden border border-white/10 bg-white/5">
                  {event.image ? (
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-muted">
                      <Camera className="w-12 h-12 opacity-10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#000d1a]/90 via-transparent to-transparent flex flex-col justify-end p-8">
                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">{new Date(event.date).toLocaleDateString()}</span>
                    <h4 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">{event.title}</h4>
                    <p className="text-xs text-white/60 font-medium max-w-md line-clamp-2">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
