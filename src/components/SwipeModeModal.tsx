import React, { useState } from 'react';
import { PackingStatus, Trip } from '../types';
import { useTrips } from '../context/TripsContext';

interface SwipeModeModalProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
  onViewDeck: () => void;
}

export const SwipeModeModal: React.FC<SwipeModeModalProps> = ({
  trip,
  isOpen,
  onClose,
  onViewDeck,
}) => {
  const { updateItemStatus } = useTrips();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastAction, setLastAction] = useState<string | null>(null);

  if (!isOpen) return null;

  const items = trip.items || [];
  const currentItem = items[currentIndex];
  const isFinished = currentIndex >= items.length;

  const handleDecision = (status: PackingStatus, label: string) => {
    if (!currentItem) return;
    setLastAction(label);
    updateItemStatus(trip.id, currentItem.id, status);

    setTimeout(() => {
      setLastAction(null);
      setCurrentIndex((prev) => prev + 1);
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Top Header */}
        <div className="w-full flex items-center justify-between text-white mb-4 px-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[18px]">touch_app</span>
            </div>
            <div>
              <span className="text-xs font-bold block">{trip.destination}</span>
              <span className="text-[10px] text-slate-300">
                Swipe Packing Mode • {currentIndex + 1} of {items.length}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Card Stage */}
        {!isFinished && currentItem ? (
          <div className="w-full bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 flex flex-col relative overflow-hidden transition-all duration-200">
            {/* Visual Action Stamp Overlay */}
            {lastAction && (
              <div className="absolute inset-0 bg-blue-600/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-white animate-in zoom-in-90 duration-150">
                <span className="text-2xl font-extrabold uppercase tracking-wider">{lastAction}</span>
              </div>
            )}

            {/* Top Category Tag & Quantity Badge */}
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                {currentItem.category}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                Qty: {currentItem.recommendedQty}
              </span>
            </div>

            {/* Item Title & Specs */}
            <div className="my-2">
              <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
                {currentItem.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-500 font-semibold">
                  Est. {currentItem.weightKg} kg
                </span>
                {currentItem.subZeroOrSpecial && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                    Sub-Zero Gear
                  </span>
                )}
              </div>
            </div>

            {/* Recommendation Box */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 my-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Why It's Recommended
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">{currentItem.reason}</p>
            </div>

            {/* Current Item Status Pill */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 pb-3">
              <span>Current Status:</span>
              <span className="font-bold text-blue-600 capitalize">
                {currentItem.status.replace('_', ' ')}
              </span>
            </div>

            {/* 4 Interactive Decision Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleDecision('skip', 'Skipped')}
                className="py-3 px-2 rounded-2xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px] text-red-500">close</span>
                <span>Skip ✕</span>
              </button>

              <button
                type="button"
                onClick={() => handleDecision('to_buy', 'Need to Buy')}
                className="py-3 px-2 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200 font-bold text-xs hover:bg-amber-100 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px] text-amber-600">
                  shopping_bag
                </span>
                <span>To Buy 🛒</span>
              </button>

              <button
                type="button"
                onClick={() => handleDecision('own', 'Already Own')}
                className="py-3 px-2 rounded-2xl bg-blue-50 text-blue-900 border border-blue-200 font-bold text-xs hover:bg-blue-100 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px] text-blue-600">
                  check_circle
                </span>
                <span>Already Own ✓</span>
              </button>

              <button
                type="button"
                onClick={() => handleDecision('packed', 'Packed in Bag!')}
                className="py-3 px-2 rounded-2xl bg-teal-600 text-white font-bold text-xs shadow-md hover:bg-teal-700 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">luggage</span>
                <span>Packed 🎒</span>
              </button>
            </div>
          </div>
        ) : (
          /* Finished Screen */
          <div className="w-full bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[32px]">celebration</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Deck Review Completed!</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              All {items.length} gear items for {trip.destination} have been processed and sorted into your personal packing deck.
            </p>

            <div className="w-full grid grid-cols-2 gap-2 my-4">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-lg font-extrabold text-teal-700 block">
                  {items.filter((i) => i.status === 'packed').length}
                </span>
                <span className="text-[11px] font-bold text-slate-500">Packed in Bag</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-lg font-extrabold text-amber-700 block">
                  {items.filter((i) => i.status === 'to_buy').length}
                </span>
                <span className="text-[11px] font-bold text-slate-500">Need to Buy</span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onViewDeck();
              }}
              className="w-full h-12 rounded-full bg-blue-600 text-white font-bold text-xs shadow-md hover:bg-blue-700 active:scale-98 transition-all"
            >
              View Updated Trip Deck
            </button>
          </div>
        )}

        {/* Footer Swipe Helper */}
        <p className="text-slate-300 text-[11px] text-center mt-4">
          Tap an action or swipe cards to swiftly categorize your gear
        </p>
      </div>
    </div>
  );
};
