import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Sparkle,
  Trophy,
  Mic2,
  MessageSquare,
  Rocket,
  ChevronRight,
  ChevronLeft,
  X
} from 'lucide-react';

const STORAGE_KEY = 'takk_onboarding_completed';

interface OnboardingStep {
  icon: React.ReactNode;
  emoji: string;
  title: string;
  description: string;
  highlights: string[];
  gradient: string;
}

const steps: OnboardingStep[] = [
  {
    icon: <Rocket size={40} />,
    emoji: '🏟️',
    title: 'Velkomin í Takk Arena!',
    description: 'Takk Arena er gamified sölukerfi sem breytir hverri vakt í leik. Skráðu sölu, keptu við samstarfsfólk og náðu nýjum hæðum!',
    highlights: [
      'Skráðu sölu í rauntíma',
      'Keppu í 1v1 bardögum',
      'Fylgstu með árangri þínum',
      'Fáðu AI þjálfun frá MorriAI'
    ],
    gradient: 'from-indigo-500 to-purple-600'
  },
  {
    icon: <LayoutDashboard size={40} />,
    emoji: '📊',
    title: 'Mælaborðið',
    description: 'Mælaborðið er heimasvæðið þitt. Hér sérðu yfirlit yfir daginn, markmið, og AI greining á frammistöðu.',
    highlights: [
      'Dagsmarkmið og framvinda',
      'Rauntíma teljari á vakt',
      'AI ráðgjöf frá þjálfara',
      'Hraðaðgangur að skráningu'
    ],
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    icon: <Sparkle size={40} />,
    emoji: '✨',
    title: 'Skráning sölu',
    description: 'Hjarta appsins! Skráðu nýjar sölur og uppfærslur á einfaldan hátt. Bounty verkefni gefa þér auka áskoranir.',
    highlights: [
      'Ný sala eða uppfærsla',
      'Bounty verkefni fyrir bónus',
      'Sjálfvirk pásustjórnun',
      'OF skráning ef þarf'
    ],
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    icon: <Trophy size={40} />,
    emoji: '⚔️',
    title: 'The Arena',
    description: 'Keppikeflið! Skoraðu á samstarfsfólk í 1v1 bardögum, fylgstu með stigatöflu og vinndu viðurkenningar.',
    highlights: [
      '1v1 bardagar í rauntíma',
      'Stigatöflur og deildir',
      'Afrek og verðlaun',
      'Liðakeppnir'
    ],
    gradient: 'from-rose-500 to-pink-600'
  },
  {
    icon: <Mic2 size={40} />,
    emoji: '🤖',
    title: 'MorriAI Þjálfari',
    description: 'Þinn persónulegi AI þjálfari! Veldu persónuleika og fáðu sérsniðna ráðgjöf, hvatningu og greiningu.',
    highlights: [
      '4 þjálfarapersónuleikar',
      'Raddstýrð söluhjálp',
      'Greining á frammistöðu',
      'Árangursráð í rauntíma'
    ],
    gradient: 'from-cyan-500 to-blue-600'
  },
  {
    icon: <MessageSquare size={40} />,
    emoji: '🚀',
    title: 'Tilbúin/n að byrja!',
    description: 'Þú ert tilbúin/n! Kannaðu líka skilaboð, afrek, tölfræði og margt fleira. Gangi þér vel í Takk Arena!',
    highlights: [
      'Skilaboð við liðsfélaga',
      '25+ afrek til að aflæsa',
      'Launaseðill og vaktasaga',
      'Sérsniðnar stillingar'
    ],
    gradient: 'from-violet-500 to-indigo-600'
  }
];

interface OnboardingWalkthroughProps {
  forceShow?: boolean;
  onClose?: () => void;
}

const OnboardingWalkthrough: React.FC<OnboardingWalkthroughProps> = ({ forceShow, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (forceShow) {
      setIsOpen(true);
      setCurrentStep(0);
      return;
    }
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      setIsOpen(true);
    }
  }, [forceShow]);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsOpen(false);
    onClose?.();
  };

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      handleClose();
      return;
    }
    setDirection(1);
    setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep === 0) return;
    setDirection(-1);
    setCurrentStep(prev => prev - 1);
  };

  if (!isOpen) return null;

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={handleClose}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative z-10 w-[90vw] max-w-md mx-4"
      >
        {/* Skip button */}
        {!isLast && (
          <button
            onClick={handleClose}
            className="absolute -top-12 right-0 text-slate-500 hover:text-white text-sm font-bold flex items-center gap-1 transition-colors"
          >
            Sleppa <X size={14} />
          </button>
        )}

        <div className="glass rounded-[32px] border border-white/10 overflow-hidden shadow-2xl">
          {/* Top gradient bar */}
          <div className={`h-2 bg-gradient-to-r ${step.gradient}`} />

          {/* Content */}
          <div className="p-8">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                initial={{ opacity: 0, x: direction * 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -60 }}
                transition={{ duration: 0.25 }}
              >
                {/* Icon + Emoji */}
                <div className="flex items-center justify-center mb-6">
                  <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white shadow-lg`}>
                    <span className="text-4xl">{step.emoji}</span>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-black text-white text-center tracking-tight mb-3">
                  {step.title}
                </h2>

                {/* Description */}
                <p className="text-sm text-slate-400 text-center leading-relaxed mb-6">
                  {step.description}
                </p>

                {/* Highlights */}
                <div className="space-y-2.5">
                  {step.highlights.map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.08 }}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/5"
                    >
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${step.gradient} flex-shrink-0`} />
                      <span className="text-xs font-semibold text-slate-300">{h}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-8 pb-8 pt-2">
            {/* Progress dots */}
            <div className="flex justify-center gap-2 mb-6">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > currentStep ? 1 : -1);
                    setCurrentStep(i);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentStep
                      ? 'w-8 bg-indigo-500'
                      : i < currentStep
                        ? 'w-2 bg-indigo-500/50'
                        : 'w-2 bg-white/20'
                  }`}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-3">
              {!isFirst && (
                <button
                  onClick={handlePrev}
                  className="flex-1 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-slate-400 font-bold text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <ChevronLeft size={16} />
                  Til baka
                </button>
              )}
              <button
                onClick={handleNext}
                className={`flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  isLast
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50'
                    : 'bg-indigo-500 text-white hover:bg-indigo-400'
                }`}
              >
                {isLast ? 'Byrja! 🚀' : 'Næsta'}
                {!isLast && <ChevronRight size={16} />}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingWalkthrough;
export { STORAGE_KEY as ONBOARDING_STORAGE_KEY };
