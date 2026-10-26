import React from 'react';
import { Trip } from '../types';

interface ReadinessModalProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
  onOpenChecklist: () => void;
  onOpenShop: () => void;
}

export const ReadinessModal: React.FC<ReadinessModalProps> = ({
  trip,
  isOpen,
  onClose,
  onOpenChecklist,
  onOpenShop,
}) => {
  if (!isOpen) return null;

  const total = trip.items?.length || 40;
  const packed = trip.items?.filter((i) => i.status === 'packed').length || 26;
  const owned = trip.items?.filter((i) => i.status === 'own').length || 8;
  const missing = trip.items?.filter((i) => i.status === 'to_buy').length || 6;
  const readyCount = packed + owned;
  const pct = total > 0 ? Math.round((readyCount / total) * 100) : 85;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center p-3 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 flex flex-col gap-4 my-auto relative max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </button>
            <h2 className="text-sm font-extrabold text-slate-900">Trip Packing Readiness</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        {/* Trip Destination Ribbon */}
        <div className="flex items-center justify-between bg-blue-50/80 rounded-2xl p-3 border border-blue-200/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
              <span className="material-symbols-outlined text-[18px]">ac_unit</span>
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                {trip.destination} Snow Trip • {trip.durationDays} Days
              </span>
              <p className="text-xs font-bold text-slate-900 truncate">Readiness Analytics</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-teal-100 text-teal-800 px-2.5 py-1 rounded-full shrink-0">
            <span className="material-symbols-outlined text-[13px]">flight_takeoff</span>
            <span>{trip.daysAway} Days Left</span>
          </span>
        </div>

        {/* Radial Readiness Hero Bento Card */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center text-center">
          {/* Circular Progress Gauge */}
          <div className="relative w-40 h-40 flex items-center justify-center my-1">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              <circle
                className="text-slate-200 stroke-current"
                cx="80"
                cy="80"
                r="64"
                fill="transparent"
                strokeWidth="12"
              />
              <circle
                className="text-blue-600 stroke-current transition-all duration-1000 ease-out"
                cx="80"
                cy="80"
                r="64"
                fill="transparent"
                strokeWidth="12"
                strokeDasharray="402"
                strokeDashoffset={402 - (402 * pct) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-slate-900 leading-none tracking-tight">
                {pct}
                <span className="text-blue-600 text-lg font-bold">%</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">
                Ready to Go
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                {readyCount} of {total} Items
              </span>
            </div>
          </div>

          {/* Metric Pill Chips */}
          <div className="grid grid-cols-3 gap-2 w-full mt-3">
            <div className="bg-white rounded-xl p-2.5 flex flex-col items-center border border-slate-100">
              <div className="flex items-center gap-1 text-teal-700">
                <span className="material-symbols-outlined text-[15px]">check_circle</span>
                <span className="text-xs font-extrabold">{packed}</span>
              </div>
              <span className="text-[10px] text-slate-500 text-center font-medium mt-0.5">
                In Bag
              </span>
            </div>

            <div className="bg-white rounded-xl p-2.5 flex flex-col items-center border border-slate-100">
              <div className="flex items-center gap-1 text-blue-600">
                <span className="material-symbols-outlined text-[15px]">inventory_2</span>
                <span className="text-xs font-extrabold">{owned}</span>
              </div>
              <span className="text-[10px] text-slate-500 text-center font-medium mt-0.5">
                Acquired
              </span>
            </div>

            <div className="bg-red-50 rounded-xl p-2.5 flex flex-col items-center border border-red-100">
              <div className="flex items-center gap-1 text-red-700">
                <span className="material-symbols-outlined text-[15px]">priority_high</span>
                <span className="text-xs font-extrabold">{missing}</span>
              </div>
              <span className="text-[10px] text-red-700 text-center font-medium mt-0.5">
                Missing
              </span>
            </div>
          </div>
        </div>

        {/* Baggage Weight Estimator Card */}
        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">luggage</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900">Estimated Weight</span>
                <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.2 rounded-full">
                  Safe
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                12.4 kg <span className="text-slate-400">• Within 15 kg limit</span>
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-teal-600 rounded-full" style={{ width: '82%' }} />
            </div>
            <span className="text-[10px] font-bold text-teal-700 mt-1">2.6 kg free</span>
          </div>
        </div>

        {/* Category Progress Breakdown */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900">Category Progress</h3>
            <span className="text-[10px] text-slate-400 font-semibold">5 Categories</span>
          </div>

          {[
            { name: 'Clothing & Layers', icon: 'apparel', packed: '16/18', pct: 88, color: 'bg-blue-600' },
            { name: 'Footwear & Boots', icon: 'hiking', packed: '3/4', pct: 75, color: 'bg-blue-600' },
            { name: 'Toiletries & Meds', icon: 'medication', packed: '8/8', pct: 100, color: 'bg-teal-600', done: true },
            { name: 'Electronics & Gadgets', icon: 'devices', packed: '5/6', pct: 83, color: 'bg-blue-600' },
            { name: 'Travel Documents', icon: 'badge', packed: '2/4', pct: 50, color: 'bg-amber-600' },
          ].map((cat) => (
            <div key={cat.name} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-800">
                  <span className="material-symbols-outlined text-[16px] text-slate-500">
                    {cat.icon}
                  </span>
                  <span className="font-semibold text-[11px]">{cat.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-500">{cat.packed}</span>
                  <span className="text-[11px] font-bold text-slate-800">{cat.pct}%</span>
                  {cat.done && (
                    <span className="material-symbols-outlined text-[14px] text-teal-600">
                      check
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${cat.color} rounded-full transition-all duration-500`}
                  style={{ width: `${cat.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={() => {
              onClose();
              onOpenChecklist();
            }}
            className="w-full h-12 rounded-full bg-blue-600 text-white font-bold text-xs shadow-md hover:bg-blue-700 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <span>Finish Remaining Items</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenShop();
            }}
            className="w-full h-11 rounded-full bg-slate-100 text-blue-600 font-bold text-xs hover:bg-slate-200 active:scale-98 transition-all"
          >
            Shop Missing Gear
          </button>
        </div>
      </div>
    </div>
  );
};
