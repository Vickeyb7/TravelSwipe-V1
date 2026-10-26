import React from 'react';
import { useTrips } from '../context/TripsContext';
import { curatedInspirations } from '../utils/data';
import { Trip } from '../types';

interface CuratedTripActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  destinationOrId: string | null;
  onRecordUpcoming: (trip: Trip) => void;
  onPreviewTinker: (trip: Trip) => void;
}

export const CuratedTripActionModal: React.FC<CuratedTripActionModalProps> = ({
  isOpen,
  onClose,
  destinationOrId,
  onRecordUpcoming,
  onPreviewTinker,
}) => {
  const { activateCuratedTrip } = useTrips();

  if (!isOpen || !destinationOrId) return null;

  // Resolve template preview
  const previewTrip = activateCuratedTrip(destinationOrId, { asPreviewOnly: true });
  const inspirationMeta = curatedInspirations.find(
    (c) =>
      c.destination.toLowerCase() === destinationOrId.toLowerCase() ||
      c.tripId.toLowerCase() === destinationOrId.toLowerCase() ||
      c.destination.toLowerCase() === previewTrip.destination.toLowerCase()
  );

  const destination = previewTrip.destination;
  const heroImage = previewTrip.heroImage || inspirationMeta?.image;
  const itemCount = previewTrip.items?.length || inspirationMeta?.itemCount || 24;
  const tempRange = previewTrip.tempRange || '24°C - 32°C';
  const region = previewTrip.region || inspirationMeta?.region || 'Curated Escape';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-6 duration-300"
        role="dialog"
        aria-modal="true"
        aria-labelledby="curated-modal-title"
      >
        {/* Destination Image Banner */}
        <div
          className="relative h-44 w-full bg-cover bg-center shrink-0"
          style={{ backgroundImage: `url('${heroImage}')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-all cursor-pointer backdrop-blur-sm"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>

          {/* Badges */}
          <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-sm text-[10px] font-bold text-slate-800 shadow-xs">
              {inspirationMeta?.theme || 'Curated Inspiration'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/90 backdrop-blur-sm text-[10px] font-extrabold text-white shadow-xs">
              {tempRange}
            </span>
          </div>

          {/* Destination Title */}
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <div className="flex items-center gap-1 text-teal-300 text-xs font-semibold">
              <span className="material-symbols-outlined text-[14px]">explore</span>
              <span>{region}</span>
            </div>
            <h2 id="curated-modal-title" className="text-2xl font-black tracking-tight leading-tight">
              {destination}
            </h2>
            <p className="text-xs text-slate-200 mt-0.5 opacity-90">
              {previewTrip.durationDays} Days • {itemCount} curated essentials ready
            </p>
          </div>
        </div>

        {/* Question & Options */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              How would you like to explore {destination}?
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Are you planning this as your next journey, or are you just playing around and exploring what to pack?
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {/* Option 1: Record as Upcoming Trip */}
            <button
              type="button"
              onClick={() => onRecordUpcoming(previewTrip)}
              className="p-3.5 rounded-2xl border-2 border-blue-600 bg-blue-50/70 hover:bg-blue-100/70 transition-all text-left flex items-start gap-3 group active:scale-[0.99] cursor-pointer shadow-xs"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[22px]">backpack</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-blue-950">Record as My Upcoming Trip</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                    Official
                  </span>
                </div>
                <p className="text-xs text-blue-900/80 mt-1 leading-snug">
                  Save {destination} to your trips schedule, track luggage limits, and keep packing checklist progress.
                </p>
              </div>
            </button>

            {/* Option 2: Just Playing Around (Preview & Tinker) */}
            <button
              type="button"
              onClick={() => onPreviewTinker(previewTrip)}
              className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all text-left flex items-start gap-3 group active:scale-[0.99] cursor-pointer shadow-xs"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-xs mt-0.5 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[22px]">interests</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-800">Just Playing Around</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    Preview
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-snug">
                  Tinker with gear, test-drive swiping, and explore recommendations without adding it to your saved trips.
                </p>
              </div>
            </button>
          </div>

          <div className="pt-1 flex items-center justify-center">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
