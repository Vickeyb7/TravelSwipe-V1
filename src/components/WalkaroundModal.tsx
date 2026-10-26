import React, { useState, useEffect } from 'react';

interface WalkaroundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanTrip?: () => void;
}

interface StepContent {
  title: string;
  badge: string;
  description: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  previewType: 'planner' | 'swipe' | 'luggage' | 'wallet';
}

const TOUR_STEPS: StepContent[] = [
  {
    title: 'Smart AI Trip Planning',
    badge: 'Step 1 of 4 • AI Engine',
    description:
      'Enter any destination in India or worldwide. TripSwipe uses Gemini AI to analyze climate indices, cold snaps, and itinerary days to curate your exact weather-safe packing list.',
    icon: 'auto_awesome',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
    previewType: 'planner',
  },
  {
    title: 'Swipe Mode Packing',
    badge: 'Step 2 of 4 • Quick Sort',
    description:
      'Packing made fun and effortless! Swipe cards right if you have already packed the item, or swipe left to add it to your Missing Essentials shopping checklist.',
    icon: 'touch_app',
    iconColor: 'text-teal-600',
    iconBg: 'bg-teal-50',
    previewType: 'swipe',
  },
  {
    title: 'Luggage Limits & Baggage Safety',
    badge: 'Step 3 of 4 • Weight Protection',
    description:
      'Choose your setup—such as Cabin Luggage (7kg) + Aeroplane Check-in Luggage (15–20kg). TripSwipe calculates cumulative gear weight so you never face excess baggage fees.',
    icon: 'scale',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50',
    previewType: 'luggage',
  },
  {
    title: 'Offline Wallet & Gear Stores',
    badge: 'Step 4 of 4 • Travel Ready',
    description:
      'Keep flight boarding passes, hotel vouchers, and train PNRs securely stored offline. Compare gear prices on Amazon India, Decathlon, and Myntra in 1 tap.',
    icon: 'badge',
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-50',
    previewType: 'wallet',
  },
];

export const WalkaroundModal: React.FC<WalkaroundModalProps> = ({
  isOpen,
  onClose,
  onPlanTrip,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  // Reset step when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const isLast = currentStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem('tripswipe_walkaround_shown', 'true');
      onClose();
      if (onPlanTrip) onPlanTrip();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('tripswipe_walkaround_shown', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col gap-4 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Controls */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
            {step.badge}
          </span>
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs font-bold text-slate-400 hover:text-slate-700 px-2 py-1 rounded-lg transition-colors"
          >
            Skip Tour
          </button>
        </div>

        {/* Step Visual Preview Card */}
        <div className="relative w-full h-44 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-200/70 p-4 flex flex-col justify-between overflow-hidden shadow-inner">
          {step.previewType === 'planner' && (
            <div className="flex flex-col gap-2.5 h-full justify-center">
              <div className="flex items-center justify-between bg-white p-2.5 rounded-xl shadow-xs border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-[20px]">
                    location_on
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Manali, Himachal</p>
                    <p className="text-[10px] text-teal-600 font-semibold">-2°C to 7°C • Winter Snow</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                  AI Synced
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white p-2 rounded-xl text-center shadow-xs border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">Travelers</span>
                  <span className="text-xs font-bold text-slate-800">2 Travelers</span>
                </div>
                <div className="flex-1 bg-white p-2 rounded-xl text-center shadow-xs border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">Duration</span>
                  <span className="text-xs font-bold text-slate-800">5 Nights</span>
                </div>
                <div className="flex-1 bg-white p-2 rounded-xl text-center shadow-xs border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">Layers</span>
                  <span className="text-xs font-bold text-blue-600">Sub-Zero</span>
                </div>
              </div>
            </div>
          )}

          {step.previewType === 'swipe' && (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <div className="relative w-52 bg-white rounded-2xl p-3 shadow-md border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">ac_unit</span>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-900">Thermal Innerwear</p>
                    <p className="text-[10px] text-slate-400">Moisture-wicking base</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  Pack →
                </span>
              </div>

              <div className="flex items-center gap-4 text-[11px] font-bold">
                <span className="text-amber-600 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                  <span>Swipe Left: To Buy</span>
                </span>
                <span className="text-teal-700 flex items-center gap-1">
                  <span>Swipe Right: Packed</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </span>
              </div>
            </div>
          )}

          {step.previewType === 'luggage' && (
            <div className="flex flex-col justify-center h-full gap-2.5">
              <div className="bg-white p-2.5 rounded-xl shadow-xs border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-[20px]">
                    luggage
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Cabin (7kg) + Aeroplane Check-in (15kg)</p>
                    <p className="text-[10px] text-slate-500">Dual Flight Allowance</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                  Configured
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-xl shadow-xs border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Active Baggage Load</span>
                  <span className="text-xs font-bold text-slate-800">9.4 kg of 22.0 kg Total</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 text-[10px] font-extrabold">
                  Safe (Under Limit)
                </span>
              </div>
            </div>
          )}

          {step.previewType === 'wallet' && (
            <div className="flex flex-col justify-center h-full gap-2">
              <div className="bg-white p-2.5 rounded-xl shadow-xs border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-600 text-[20px]">
                    airplane_ticket
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Air India AI-804 Boarding Pass</p>
                    <p className="text-[10px] text-slate-400">Offline Vault • Encrypted</p>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-teal-500" />
              </div>

              <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-100 shadow-xs text-[10px] font-bold text-slate-600">
                <span className="text-blue-600">Amazon India</span>
                <span className="text-teal-700">Decathlon</span>
                <span className="text-pink-600">Myntra</span>
                <span className="text-amber-600">Flipkart</span>
              </div>
            </div>
          )}
        </div>

        {/* Step Text Info */}
        <div className="flex flex-col gap-1.5 text-center px-1">
          <div className="flex items-center justify-center gap-2">
            <div
              className={`w-8 h-8 rounded-xl ${step.iconBg} ${step.iconColor} flex items-center justify-center shadow-xs`}
            >
              <span className="material-symbols-outlined text-[20px]">{step.icon}</span>
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
              {step.title}
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
            {step.description}
          </p>
        </div>

        {/* Step Dots Indicator */}
        <div className="flex items-center justify-center gap-1.5 py-1">
          {TOUR_STEPS.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentStep(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentStep ? 'w-6 bg-blue-600' : 'w-2 bg-slate-200 hover:bg-slate-300'
              }`}
              aria-label={`Go to step ${idx + 1}`}
            />
          ))}
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={handlePrev}
              className="px-4 h-12 rounded-full bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 active:scale-95 transition-all"
            >
              Back
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            className="flex-1 h-12 rounded-full bg-blue-600 text-white font-bold text-xs shadow-md hover:bg-blue-700 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <span>{isLast ? 'Get Started & Plan Trip' : 'Next Step'}</span>
            <span className="material-symbols-outlined text-[18px]">
              {isLast ? 'rocket_launch' : 'arrow_forward'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
