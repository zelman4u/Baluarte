import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  Globe, 
  MapPin, 
  Shield, 
  Scale, 
  AlertTriangle, 
  Heart,
  Smile,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { 
  sendCompanionMessage, 
  CompanionCategory, 
  CompanionMessage, 
  COMPANION_PERSONAS 
} from '../../services/geminiCompanionService';

export type AssistantPersona = 'healthcare_civic' | 'kp_justice' | 'drrm_emergency';

const CATEGORY_ICONS: Record<AssistantPersona, React.ElementType> = {
  healthcare_civic: Heart,
  kp_justice: Scale,
  drrm_emergency: AlertTriangle
};

const SUGGESTED_QUERIES = [
  "How do I get a Barangay Clearance?",
  "Tell me a joke!",
  "I am feeling stressed and tired",
  "Tagoloan River flood status",
  "Are you satisfied with your care?",
  "Ba-la-la-la-la! 👊✨"
];

export const GeminiCivicAssistantModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [category, setCategory] = useState<AssistantPersona>('healthcare_civic');
  const [model, setModel] = useState<'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-4-argon'>('gemini-3.8-flash');
  const [useSearchGrounding, setUseSearchGrounding] = useState(true);
  const [useMapsGrounding, setUseMapsGrounding] = useState(true);
  
  const [messages, setMessages] = useState<CompanionMessage[]>([
    {
      id: 'init-msg',
      role: 'assistant',
      content: COMPANION_PERSONAS.healthcare_civic.initialGreeting,
      timestamp: 'Just now'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleCategoryChange = (newCat: AssistantPersona) => {
    setCategory(newCat);
    setMessages([
      {
        id: `persona-switch-${Date.now()}`,
        role: 'assistant',
        content: COMPANION_PERSONAS[newCat].initialGreeting,
        timestamp: 'Just now'
      }
    ]);
  };

  const handleSendMessage = async (customText?: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSend = (customText || inputValue).trim();
    if (!textToSend || isTyping) return;

    setInputValue('');

    const userMsg: CompanionMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsTyping(true);

    try {
      const response = await sendCompanionMessage({
        userMessage: textToSend,
        history: newHistory,
        category,
        model,
        useSearchGrounding,
        useMapsGrounding
      });

      const assistantMsg: CompanionMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        groundingLinks: response.groundingLinks,
        searchQueries: response.searchQueries,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.warn("Companion response fallback triggered:", err);
      const fallbackMsg: CompanionMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: `I have scanned your inquiry. As Baluarte, your AI companion, I am dedicated to your care. Please feel free to ask again or visit the Baluarte Barangay Hall in Zone 2, Tagoloan!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  const currentConfig = COMPANION_PERSONAS[category];
  const PersonaIcon = CATEGORY_ICONS[category];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-2xl h-[92vh] max-h-[720px] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Modal Header */}
        <div className="p-3.5 sm:p-4 bg-brand-card/90 border-b border-brand-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary/20 via-brand-primary/10 to-emerald-500/20 border border-brand-primary/30 flex items-center justify-center text-brand-primary shadow-inner">
              <Heart className="w-5 h-5 text-brand-primary animate-pulse" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-brand-surface"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-brand-text interactive-text">
                  Baluarte Your AI companions
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-brand-primary/20 text-brand-primary border border-brand-primary/30">
                  Baymax Care Mode
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-brand-muted mt-0.5 flex items-center gap-1.5">
                <span>Personal Healthcare & Civic Guidance</span>
                <span>•</span>
                <span className="text-emerald-400">Tagoloan, MisOr</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close assistant"
            className="p-2 rounded-xl text-brand-muted hover:text-brand-text hover:bg-brand-bg transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center interactive-click"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Persona Mode Selector & Grounding Controls */}
        <div className="p-2.5 bg-brand-bg/90 border-b border-brand-border flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {(['healthcare_civic', 'kp_justice', 'drrm_emergency'] as AssistantPersona[]).map(pKey => {
              const p = COMPANION_PERSONAS[pKey];
              const Icon = CATEGORY_ICONS[pKey];
              const isSelected = category === pKey;
              return (
                <button
                  key={pKey}
                  onClick={() => handleCategoryChange(pKey)}
                  className={cn(
                    "min-h-[36px] px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all interactive-click whitespace-nowrap",
                    isSelected
                      ? "bg-brand-primary text-brand-bg shadow-sm"
                      : "text-brand-muted hover:text-brand-text hover:bg-brand-surface"
                  )}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{p.badge}</span>
                </button>
              );
            })}
          </div>

          {/* Model selection & Grounding */}
          <div className="flex items-center gap-1.5 shrink-0">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value as any)}
              className="bg-brand-surface border border-brand-border rounded-lg px-2 py-1 text-[10px] font-mono text-brand-text focus:outline-none focus:border-brand-primary min-h-[32px]"
            >
              <option value="gemini-3.8-flash">gemini-3.8-flash</option>
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite</option>
              <option value="gemini-4-argon">gemini-4-argon</option>
            </select>

            <button
              onClick={() => setUseSearchGrounding(!useSearchGrounding)}
              title="Toggle Google Search Grounding"
              className={cn(
                "p-1.5 rounded-lg border text-[10px] flex items-center gap-1 transition-all min-h-[32px] interactive-click",
                useSearchGrounding 
                  ? "bg-brand-primary/10 text-brand-primary border-brand-primary/40 font-bold" 
                  : "bg-brand-surface text-brand-muted border-brand-border opacity-50"
              )}
            >
              <Globe className="w-3 h-3" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
        </div>

        {/* Conversation Stream */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex items-start gap-2.5 sm:gap-3",
                  isUser ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-md",
                  isUser 
                    ? "bg-brand-primary text-brand-bg" 
                    : "bg-brand-surface border border-brand-border text-brand-primary"
                )}>
                  {isUser ? 'You' : <PersonaIcon className="w-4 h-4" />}
                </div>

                <div className={cn(
                  "max-w-[85%] sm:max-w-[80%] rounded-2xl p-3 sm:p-4 text-xs leading-relaxed space-y-2",
                  isUser 
                    ? "bg-brand-primary text-brand-bg font-medium rounded-tr-none shadow-md shadow-brand-primary/15" 
                    : "bg-brand-card border border-brand-border text-brand-text rounded-tl-none shadow-sm"
                )}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Grounding Citations */}
                  {msg.groundingLinks && msg.groundingLinks.length > 0 && (
                    <div className="pt-2 border-t border-brand-border/40 mt-2 space-y-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-brand-primary block">
                        Verified Sources & Coordinates:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.groundingLinks.map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-brand-bg border border-brand-border text-[9px] font-mono text-brand-primary hover:underline"
                          >
                            <span>{link.title}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <span className={cn(
                    "block text-[8px] font-mono text-right",
                    isUser ? "text-brand-bg/70" : "text-brand-muted"
                  )}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center text-brand-primary">
                <PersonaIcon className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-brand-card border border-brand-border p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                <span className="text-[10px] font-mono text-brand-muted">Scanning inquiry...</span>
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-bounce [animation-delay:0.15s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-bounce [animation-delay:0.3s]"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3.5 py-2 bg-brand-bg/60 border-t border-brand-border/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[9px] font-black uppercase tracking-widest text-brand-muted shrink-0 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-brand-primary" />
            Quick:
          </span>
          {SUGGESTED_QUERIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={isTyping}
              className="px-2.5 py-1 rounded-full bg-brand-surface hover:bg-brand-primary/10 border border-brand-border hover:border-brand-primary/30 text-[10px] text-brand-muted hover:text-brand-primary whitespace-nowrap transition-colors interactive-click shrink-0 disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={(e) => handleSendMessage(undefined, e)} className="p-3 bg-brand-card/80 border-t border-brand-border flex items-center gap-2 shrink-0">
          <input
            type="text"
            placeholder={`Ask Baluarte Your AI companions anything...`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 bg-brand-bg border border-brand-border rounded-xl px-4 py-2.5 text-xs text-brand-text placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-primary min-h-[44px]"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="min-h-[44px] px-5 rounded-xl bg-brand-primary text-brand-bg font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-brand-primary/20 disabled:opacity-40 disabled:cursor-not-allowed interactive-click shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export const GeminiChatFloatingButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-baluarte-companion', handleOpen);
    return () => window.removeEventListener('open-baluarte-companion', handleOpen);
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open Baluarte Your AI companions"
        className="fixed bottom-6 right-6 z-40 min-h-[48px] px-4 sm:px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-primary via-blue-600 to-indigo-600 text-brand-bg font-black text-xs uppercase tracking-wider flex items-center gap-2.5 shadow-2xl shadow-brand-primary/40 hover:scale-105 active:scale-95 transition-all interactive-click group"
      >
        <div className="relative">
          <Heart className="w-4 h-4 text-brand-bg animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
        </div>
        <div className="flex flex-col text-left leading-none">
          <span className="text-[11px] font-black uppercase tracking-tight">Baluarte Your AI companions</span>
          <span className="text-[8px] font-mono font-medium opacity-80 uppercase tracking-widest mt-0.5">Baymax Care Protocol</span>
        </div>
      </button>

      <GeminiCivicAssistantModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

// Aliases for clean semantic imports
export const BaluarteAICompanionModal = GeminiCivicAssistantModal;
export const BaluarteAICompanionFloatingButton = GeminiChatFloatingButton;
