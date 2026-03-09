import React, { useState, useEffect } from 'react';
import { X, Sparkles, Trophy, Zap, Bell, Volume2, PartyPopper } from 'lucide-react';

const APP_VERSION = '3.2.0';
const STORAGE_KEY = 'arnarflow_last_seen_version';

interface WhatsNewModalProps {
  onClose?: () => void;
}

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  tag?: string;
}

const features: Feature[] = [
  {
    icon: <Sparkles className="text-indigo-400" size={24} />,
    title: 'Notandaprófíll',
    description: 'Breyttu nafni, settu gælunafn og hladdu upp prófílmynd! Myndin birtist á stigatöflu og í TV mode.',
    tag: 'NÝ FEATURE'
  },
  {
    icon: <Trophy className="text-amber-400" size={24} />,
    title: 'Prófílmynd í TV Mode',
    description: 'Prófílmyndin þín birtist nú á TV stigatöflunni í stað upphafsstafa.',
    tag: 'LAGFÆRING'
  },
  {
    icon: <Zap className="text-emerald-400" size={24} />,
    title: 'Firebase Storage',
    description: 'Myndir eru vistaðar á öruggan hátt í Firebase Storage.',
  },
];

const WhatsNewModal: React.FC<WhatsNewModalProps> = ({ onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Check if user has seen this version
    const lastSeenVersion = localStorage.getItem(STORAGE_KEY);
    
    if (lastSeenVersion !== APP_VERSION) {
      // Small delay for smoother appearance after app loads
      const timer = setTimeout(() => setIsOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    localStorage.setItem(STORAGE_KEY, APP_VERSION);
    
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      onClose?.();
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div 
        className={`relative w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl shadow-2xl border border-white/10 overflow-hidden transform transition-all duration-300 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        {/* Decorative top gradient */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-indigo-500/20 to-transparent pointer-events-none" />
        
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
        >
          <X size={20} className="text-white/70" />
        </button>

        {/* Header */}
        <div className="relative pt-8 pb-4 px-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg shadow-indigo-500/30">
            <Sparkles size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mb-1">
            Hvað er nýtt? ✨
          </h2>
          <p className="text-sm text-slate-400">
            Útgáfa {APP_VERSION} • Notandaprófíll
          </p>
        </div>

        {/* Features list */}
        <div className="px-6 pb-6 space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: isClosing ? 'none' : 'slideInUp 0.4s ease-out forwards'
              }}
            >
              <div className="flex-shrink-0 p-2 rounded-xl bg-white/10">
                {feature.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-white text-sm">
                    {feature.title}
                  </h3>
                  {feature.tag && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded-full uppercase tracking-wider">
                      {feature.tag}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={handleClose}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/30"
          >
            Flott, við höldum áfram! 🚀
          </button>
          
          <p className="text-center text-[10px] text-slate-500 mt-4">
            Sjá allar breytingar í{' '}
            <a 
              href="https://github.com/arnar/takkarena/blob/main/CHANGELOG.md" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-400 hover:underline"
            >
              CHANGELOG.md
            </a>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

// Hook to manually trigger the modal
export const useWhatsNew = () => {
  const [shouldShow, setShouldShow] = useState(false);

  const showWhatsNew = () => {
    localStorage.removeItem(STORAGE_KEY);
    setShouldShow(true);
  };

  const resetVersion = () => {
    localStorage.setItem(STORAGE_KEY, APP_VERSION);
    setShouldShow(false);
  };

  return { shouldShow, showWhatsNew, resetVersion };
};

export const APP_VERSION_NUMBER = APP_VERSION;
export default WhatsNewModal;
