import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Upload, 
  AlertCircle,
  CheckCircle2,
  Users,
  Megaphone,
  Layout,
  Camera,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { landingPageService, LandingPageContent, Announcement, OrganizationMember, CommunityHappening } from '../services/landingPageService';
import { storageService } from '../services/storageService';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const ContentManagementPage: React.FC = () => {
  const { profile, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'hero' | 'announcements' | 'body' | 'facts' | 'org' | 'happenings'>('hero');

  const getStandardOrg = (): OrganizationMember[] => {
    const captainId = crypto.randomUUID();
    
    // Intermediate Groups to reduce width
    const adminGroupId = crypto.randomUUID();
    const councilGroupId = crypto.randomUUID();
    const safetyGroupId = crypto.randomUUID();
    const servicesGroupId = crypto.randomUUID();
    
    const kagawadIds = Array.from({ length: 7 }).map(() => crypto.randomUUID());
    
    return [
      { id: captainId, name: 'Hon. [Full Name]', role: 'Punong Barangay / Barangay Captain' },
      
      // Vertical / Horizontal separation groups
      { id: adminGroupId, name: 'Secretariat & Finance', role: 'Administrative Department', reportsTo: captainId },
      { id: councilGroupId, name: 'Sangguniang Barangay', role: 'Legislative Department', reportsTo: captainId },
      { id: safetyGroupId, name: 'Public Safety & Justice', role: 'Peace & Order Department', reportsTo: captainId },
      { id: servicesGroupId, name: 'Social & Health Services', role: 'Welfare Department', reportsTo: captainId },

      // Sub-members
      { id: crypto.randomUUID(), name: '[Full Name]', role: 'Barangay Secretary', reportsTo: adminGroupId },
      { id: crypto.randomUUID(), name: '[Full Name]', role: 'Barangay Treasurer', reportsTo: adminGroupId },
      
      { id: crypto.randomUUID(), name: '[Full Name]', role: 'SK Chairman', reportsTo: councilGroupId },
      ...kagawadIds.map((id, i) => ({
        id,
        name: `[Barangay Kagawad Name ${i + 1}]`,
        role: 'Barangay Kagawad',
        reportsTo: councilGroupId
      })),
      
      { id: crypto.randomUUID(), name: '[Name]', role: 'Barangay Tanod (CHIEF)', reportsTo: safetyGroupId },
      { id: crypto.randomUUID(), name: '[Name]', role: 'Lupon Tagapamayapa', reportsTo: safetyGroupId },
      
      { id: crypto.randomUUID(), name: '[Name]', role: 'Barangay Health Worker', reportsTo: servicesGroupId },
      { id: crypto.randomUUID(), name: '[Name]', role: 'Day Care Worker', reportsTo: servicesGroupId },
    ];
  };

  const [content, setContent] = useState<LandingPageContent | null>(null);

  // Default facts for Baluarte Main Page
  const getBaluarteFacts = () => [
    { id: '1', label: 'Type', value: 'Barangay' },
    { id: '2', label: 'Island group', value: 'Mindanao' },
    { id: '3', label: 'Region', value: 'Northern Mindanao (Region X)' },
    { id: '4', label: 'Province', value: 'Misamis Oriental' },
    { id: '5', label: 'Municipality', value: 'Tagoloan' },
    { id: '6', label: 'Postal code', value: '9001' },
    { id: '7', label: 'Population (2020)', value: '10,860' },
    { id: '8', label: 'Households (2015)', value: '2,158' },
    { id: '9', label: 'Median Age', value: '23.13' },
    { id: '10', label: 'Growth Rate', value: '2.60%' },
    { id: '11', label: 'Elevation', value: '3.5 meters (11.5 feet)' }
  ];

  // Determine which page the user can edit based on department/role
  const getEditablePageId = () => {
    if (!profile) return null;
    if (profile.role === 'SuperAdmin' || profile.role === 'Captain' || profile.department === 'Administration') return 'main';
    if (profile.department === 'Justice') return 'justice';
    if (profile.department === 'Health') return 'health';
    if (profile.department === 'Youth') return 'youth';
    return null;
  };

  const pageId = getEditablePageId();

  useEffect(() => {
    if (pageId) {
      loadContent();
    }
  }, [pageId]);

  const loadContent = async () => {
    if (!pageId) return;
    setLoading(true);
    try {
      const data = await landingPageService.getPageContent(pageId);
      if (data) {
        setContent({
          ...data,
          quickFacts: data.quickFacts || []
        });
      } else {
        // Initialize default content
        const defaultBody = pageId === 'main' 
          ? "Baluarte is a barangay in the municipality of Tagoloan, in the province of Misamis Oriental. Its population as determined by the 2020 Census was 10,860. This represented 13.52% of the total population of Tagoloan.\n\nDemographics\nThe household population of Baluarte in the 2015 Census was 9,591 broken down into 2,158 households or an average of 4.44 members per household."
          : '';
          
        setContent({
          pageId: pageId as any,
          title: pageId === 'main' ? 'Barangay Baluarte' : `Barangay ${pageId.charAt(0).toUpperCase() + pageId.slice(1)} Unit`,
          heroImages: [],
          announcements: [],
          body: defaultBody,
          organization: [],
          communityHappenings: [],
          quickFacts: pageId === 'main' ? getBaluarteFacts() : []
        });
      }
    } catch (err) {
      setError('Failed to load content.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!pageId || !content || !user) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await landingPageService.updatePageContent(pageId, content, user.uid);
      setSuccess('Content updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'hero' | 'org' | 'happenings', id?: string) => {
    if (!e.target.files || e.target.files.length === 0 || !pageId) return;
    
    setSaving(true);
    try {
      const files = Array.from(e.target.files) as File[];
      const urls = await storageService.uploadImages(`landing_pages/${pageId}/${target}`, files);
      
      if (target === 'hero') {
        setContent(prev => prev ? { ...prev, heroImages: [...(prev.heroImages || []), ...urls] } : null);
      } else if (target === 'org' && id) {
        setContent(prev => prev ? {
          ...prev,
          organization: (prev.organization || []).map(m => m.id === id ? { ...m, image: urls[0] } : m)
        } : null);
      } else if (target === 'happenings' && id) {
        setContent(prev => prev ? {
          ...prev,
          communityHappenings: (prev.communityHappenings || []).map(h => h.id === id ? { ...h, image: urls[0] } : h)
        } : null);
      }
      setSuccess('Image(s) uploaded successfully!');
    } catch (err) {
      setError('Failed to upload image.');
    } finally {
      setSaving(false);
    }
  };

  const removeHeroImage = (index: number) => {
    setContent(prev => prev ? {
      ...prev,
      heroImages: prev.heroImages.filter((_, i) => i !== index)
    } : null);
  };

  // Content modifiers
  const addAnnouncement = () => {
    const newAnn: Announcement = {
      id: crypto.randomUUID(),
      title: 'New Announcement',
      content: '',
      date: new Date().toISOString()
    };
    setContent(prev => prev ? { ...prev, announcements: [newAnn, ...prev.announcements] } : null);
  };

  const updateAnnouncement = (id: string, updates: Partial<Announcement>) => {
    setContent(prev => prev ? {
      ...prev,
      announcements: prev.announcements.map(a => a.id === id ? { ...a, ...updates } : a)
    } : null);
  };

  const removeAnnouncement = (id: string) => {
    setContent(prev => prev ? {
      ...prev,
      announcements: prev.announcements.filter(a => a.id !== id)
    } : null);
  };

  const addOrgMember = () => {
    const captain = content?.organization.find(m => 
      m.role.toLowerCase().includes('captain') || m.role.toLowerCase().includes('punong')
    );
    
    const newMember: OrganizationMember = {
      id: crypto.randomUUID(),
      name: '[Full Name Placeholder]',
      role: '[Position / Designation]',
      reportsTo: captain?.id
    };
    setContent(prev => prev ? { ...prev, organization: [...prev.organization, newMember] } : null);
  };

  const addHappening = () => {
    const newHappening: CommunityHappening = {
      id: crypto.randomUUID(),
      title: 'New Event',
      description: '',
      date: new Date().toISOString()
    };
    setContent(prev => prev ? { ...prev, communityHappenings: [newHappening, ...prev.communityHappenings] } : null);
  };

  if (!pageId) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-black text-brand-text mb-4 uppercase tracking-tighter">Access Denied</h1>
        <p className="text-brand-muted text-xs uppercase tracking-widest leading-relaxed">
          You do not have permission to manage landing page content.
        </p>
      </div>
    );
  }

  if (loading) return null;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-6 bg-brand-primary rounded-full"></span>
            <h1 className="text-3xl font-black text-brand-text uppercase tracking-tighter">Content Terminal</h1>
          </div>
          <p className="text-brand-muted text-xs uppercase tracking-[0.2em] font-bold">
            Managing <span className="text-brand-primary">{pageId.toUpperCase()}</span> Landing Page
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-brand-bg rounded-xl font-black uppercase text-xs tracking-widest hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
          >
            {saving ? <div className="w-4 h-4 border-2 border-brand-bg/30 border-t-brand-bg animate-spin rounded-full" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-xs font-bold uppercase tracking-widest"
          >
            <AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-500 text-xs font-bold uppercase tracking-widest"
          >
            <CheckCircle2 className="w-5 h-5" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <div className="flex flex-col gap-2">
          {[
            { id: 'hero', icon: ImageIcon, label: 'Hero Display' },
            { id: 'announcements', icon: Megaphone, label: 'News & Announcements' },
            { id: 'facts', icon: AlertCircle, label: 'Demographics' },
            { id: 'body', icon: Layout, label: 'About Section' },
            { id: 'org', icon: Users, label: 'Governance Body' },
            { id: 'happenings', icon: Camera, label: 'Gallery' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                activeTab === tab.id 
                  ? "bg-brand-primary text-brand-bg" 
                  : "bg-brand-surface text-brand-muted hover:text-brand-text hover:bg-brand-border/30"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 bg-brand-surface border border-brand-border rounded-2xl p-6 lg:p-8">
          {content && (
            <div className="space-y-8">
              {activeTab === 'hero' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-brand-text uppercase tracking-tighter">Hero Display Gallery</h2>
                    <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary/20 transition-all">
                      <Plus className="w-3 h-3" />
                      Add Images
                      <input type="file" multiple className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'hero')} />
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {content.heroImages.map((img, idx) => (
                      <div key={idx} className="group relative aspect-video bg-brand-bg rounded-xl overflow-hidden border border-brand-border">
                        <img src={img} alt={`Hero ${idx}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-brand-bg/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            onClick={() => removeHeroImage(idx)}
                            className="p-2 bg-red-500 text-white rounded-lg hover:scale-110 active:scale-95 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {content.heroImages.length === 0 && (
                      <div className="col-span-full py-12 flex flex-col items-center justify-center text-brand-muted">
                        <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">No hero images uploaded yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'announcements' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-brand-text uppercase tracking-tighter">Latest Announcements</h2>
                    <button onClick={addAnnouncement} className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-brand-bg rounded-lg text-[10px] font-black uppercase tracking-widest">
                      <Plus className="w-3 h-3" />
                      Add New
                    </button>
                  </div>

                  <div className="space-y-4">
                    {content.announcements.map((ann) => (
                      <div key={ann.id} className="p-4 bg-brand-bg border border-brand-border rounded-xl space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <input
                            type="text"
                            value={ann.title}
                            onChange={(e) => updateAnnouncement(ann.id, { title: e.target.value })}
                            placeholder="Announcement Title"
                            className="bg-transparent text-sm font-black uppercase tracking-tight text-brand-text w-full focus:outline-none"
                          />
                          <button onClick={() => removeAnnouncement(ann.id)} className="text-brand-muted hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <textarea
                          value={ann.content}
                          onChange={(e) => updateAnnouncement(ann.id, { content: e.target.value })}
                          placeholder="Write your announcement content here..."
                          className="w-full h-24 bg-brand-surface border border-brand-border rounded-lg p-3 text-xs text-brand-text focus:outline-none focus:border-brand-primary transition-all resize-none"
                        />
                      </div>
                    ))}
                    {content.announcements.length === 0 && (
                      <div className="py-12 flex flex-col items-center justify-center text-brand-muted">
                        <Megaphone className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">No announcements posted</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'facts' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-brand-text uppercase tracking-tighter">Barangay Quick Facts</h2>
                      <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mt-1">Key demographics and administrative data</p>
                    </div>
                    <button 
                      onClick={() => setContent(prev => prev ? {
                        ...prev,
                        quickFacts: [...(prev.quickFacts || []), { id: crypto.randomUUID(), label: 'New Fact', value: '' }]
                      } : null)}
                      className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-brand-bg rounded-lg text-[10px] font-black uppercase tracking-widest"
                    >
                      <Plus className="w-3 h-3" />
                      Add Data Point
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(content.quickFacts || []).map((fact) => (
                      <div key={fact.id} className="p-4 bg-brand-bg border border-brand-border rounded-xl flex items-center gap-4">
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={fact.label}
                            onChange={(e) => setContent(prev => prev ? {
                              ...prev,
                              quickFacts: prev.quickFacts?.map(f => f.id === fact.id ? { ...f, label: e.target.value } : f)
                            } : null)}
                            placeholder="Label (e.g. Population)"
                            className="bg-transparent text-[10px] font-black uppercase tracking-widest text-brand-primary w-full focus:outline-none"
                          />
                          <input
                            type="text"
                            value={fact.value}
                            onChange={(e) => setContent(prev => prev ? {
                              ...prev,
                              quickFacts: prev.quickFacts?.map(f => f.id === fact.id ? { ...f, value: e.target.value } : f)
                            } : null)}
                            placeholder="Value"
                            className="bg-transparent text-sm font-black text-brand-text w-full focus:outline-none"
                          />
                        </div>
                        <button 
                          onClick={() => setContent(prev => prev ? {
                            ...prev,
                            quickFacts: prev.quickFacts?.filter(f => f.id !== fact.id)
                          } : null)}
                          className="text-brand-muted hover:text-red-500 transition-colors p-2"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {(content.quickFacts || []).length === 0 && (
                      <div className="col-span-full py-12 flex flex-col items-center justify-center text-brand-muted border-2 border-dashed border-brand-border rounded-2xl">
                        <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">No facts added yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'body' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-black text-brand-text uppercase tracking-tighter">Landing Page Body Content</h2>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Description / About Section</label>
                    <textarea
                      value={content.body}
                      onChange={(e) => setContent(prev => prev ? { ...prev, body: e.target.value } : null)}
                      placeholder="Enter the main body text for this landing page..."
                      className="w-full h-64 bg-brand-bg border border-brand-border rounded-xl p-4 text-sm text-brand-text focus:outline-none focus:border-brand-primary transition-all leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'org' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-black text-brand-text uppercase tracking-tighter">Organization Chart</h2>
                      <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mt-1">Build your barangay's leadership hierarchy</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => {
                          if (confirm('This will replace current organization with a standard barangay structure. Continue?')) {
                            setContent(prev => prev ? { ...prev, organization: getStandardOrg() } : null);
                          }
                        }}
                        className="px-4 py-2 border border-brand-border text-brand-muted rounded-lg text-[10px] font-black uppercase tracking-widest hover:text-brand-text transition-all"
                      >
                        Reset to Standard
                      </button>
                      <button onClick={addOrgMember} className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-brand-bg rounded-lg text-[10px] font-black uppercase tracking-widest">
                        <Plus className="w-3 h-3" />
                        Add Personnel
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {content.organization.map((member) => (
                      <div key={member.id} className="p-4 bg-brand-bg border border-brand-border rounded-xl flex gap-4">
                        <div className="relative group w-16 h-16 rounded-lg bg-brand-surface border border-brand-border overflow-hidden shrink-0">
                          {member.image ? (
                            <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Users className="w-6 h-6 text-brand-border" />
                            </div>
                          )}
                          <label className="absolute inset-0 bg-brand-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                            <Upload className="w-4 h-4 text-brand-bg" />
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'org', member.id)} />
                          </label>
                        </div>
                        
                          <div className="flex flex-col gap-2 flex-1">
                            <div className="flex justify-between items-start">
                              <input
                                type="text"
                                value={member.name}
                                onChange={(e) => setContent(prev => prev ? {
                                  ...prev,
                                  organization: prev.organization.map(m => m.id === member.id ? { ...m, name: e.target.value } : m)
                                } : null)}
                                placeholder="Name"
                                className="bg-transparent text-xs font-black uppercase tracking-tight text-brand-text w-full focus:outline-none"
                              />
                              <button 
                                onClick={() => setContent(prev => prev ? {
                                  ...prev,
                                  organization: prev.organization.filter(m => m.id !== member.id)
                                } : null)}
                                className="text-brand-muted hover:text-red-500 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                            <input
                              type="text"
                              value={member.role}
                              onChange={(e) => setContent(prev => prev ? {
                                ...prev,
                                organization: prev.organization.map(m => m.id === member.id ? { ...m, role: e.target.value } : m)
                              } : null)}
                              placeholder="Role / Position"
                              className="bg-transparent text-[10px] uppercase tracking-widest text-brand-muted w-full focus:outline-none"
                            />
                            <div className="flex flex-col gap-1">
                              <label className="text-[8px] font-black text-brand-muted uppercase tracking-widest">Reports To</label>
                              <select
                                value={member.reportsTo || ''}
                                onChange={(e) => setContent(prev => prev ? {
                                  ...prev,
                                  organization: prev.organization.map(m => m.id === member.id ? { ...m, reportsTo: e.target.value || undefined } : m)
                                } : null)}
                                className="bg-brand-surface border border-brand-border rounded px-2 py-1 text-[9px] font-bold uppercase text-brand-text focus:outline-none focus:border-brand-primary"
                              >
                                <option value="">None (Top Level)</option>
                                {content.organization.filter(m => m.id !== member.id).map(other => (
                                  <option key={other.id} value={other.id}>{other.name} ({other.role})</option>
                                ))}
                              </select>
                            </div>
                          </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'happenings' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-brand-text uppercase tracking-tighter">Community Happenings</h2>
                    <button onClick={addHappening} className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-brand-bg rounded-lg text-[10px] font-black uppercase tracking-widest">
                      <Plus className="w-3 h-3" />
                      Add Event
                    </button>
                  </div>

                  <div className="space-y-6">
                    {content.communityHappenings.map((event) => (
                      <div key={event.id} className="p-4 bg-brand-bg border border-brand-border rounded-xl flex flex-col md:flex-row gap-6">
                        <div className="relative group w-full md:w-32 aspect-video md:aspect-square rounded-lg bg-brand-surface border border-brand-border overflow-hidden shrink-0">
                          {event.image ? (
                            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Camera className="w-8 h-8 text-brand-border" />
                            </div>
                          )}
                          <label className="absolute inset-0 bg-brand-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                            <Upload className="w-5 h-5 text-brand-bg" />
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'happenings', event.id)} />
                          </label>
                        </div>

                        <div className="flex-1 space-y-3">
                          <div className="flex justify-between items-start gap-4">
                            <input
                              type="text"
                              value={event.title}
                              onChange={(e) => setContent(prev => prev ? {
                                ...prev,
                                communityHappenings: prev.communityHappenings.map(h => h.id === event.id ? { ...h, title: e.target.value } : h)
                              } : null)}
                              placeholder="Event Title"
                              className="bg-transparent text-sm font-black uppercase tracking-tight text-brand-text w-full focus:outline-none"
                            />
                            <button 
                              onClick={() => setContent(prev => prev ? {
                                ...prev,
                                communityHappenings: prev.communityHappenings.filter(h => h.id !== event.id)
                              } : null)}
                              className="text-brand-muted hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <textarea
                            value={event.description}
                            onChange={(e) => setContent(prev => prev ? {
                              ...prev,
                              communityHappenings: prev.communityHappenings.map(h => h.id === event.id ? { ...h, description: e.target.value } : h)
                            } : null)}
                            placeholder="Brief description of the event..."
                            className="w-full h-16 bg-brand-surface border border-brand-border rounded-lg p-3 text-xs text-brand-text focus:outline-none focus:border-brand-primary transition-all resize-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
