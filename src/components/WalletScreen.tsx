import React, { useState } from 'react';
import { useTrips } from '../context/TripsContext';
import { TravelDocument } from '../types';

interface WalletScreenProps {
  onOpenAddDoc: () => void;
}

export const WalletScreen: React.FC<WalletScreenProps> = ({ onOpenAddDoc }) => {
  const { activeTrip, trips, setActiveTripId } = useTrips();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showTripMenu, setShowTripMenu] = useState<boolean>(false);
  const [selectedDocForView, setSelectedDocForView] = useState<TravelDocument | null>(null);

  const docs = activeTrip?.documents || [];

  const filteredDocs = docs.filter((doc) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'transit') return doc.type === 'flight' || doc.type === 'cab';
    if (selectedCategory === 'stay') return doc.type === 'hotel';
    if (selectedCategory === 'permit') return doc.type === 'permit' || doc.type === 'insurance';
    return true;
  });

  return (
    <div className="flex flex-col gap-4 pb-28 pt-20 px-4 max-w-md mx-auto animate-in fade-in duration-200">
      {/* Trip Selector & Vault Badge Hero Section */}
      <div className="flex flex-col gap-2.5 bg-white p-4 rounded-2xl shadow-xs border border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-teal-700 text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px]">shield</span>
            <span>Secure Vault</span>
          </div>
          <div className="flex items-center gap-1.5 bg-teal-50 text-teal-800 px-2.5 py-0.5 rounded-full text-xs font-bold border border-teal-100">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            <span>{docs.length} Files Synced</span>
          </div>
        </div>

        {/* Active Trip Dropdown Trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowTripMenu(!showTripMenu)}
            className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl text-left border border-slate-100 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">ac_unit</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {activeTrip?.destination} Snow Trip
                </span>
                <span className="text-[11px] text-slate-500">
                  {activeTrip?.datesText} • {activeTrip?.durationDays} Days
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400">
              {showTripMenu ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {/* Dropdown Menu */}
          {showTripMenu && (
            <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden p-1">
              {trips.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveTripId(t.id);
                    setShowTripMenu(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold text-left transition-colors ${
                    activeTrip?.id === t.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{t.destination} ({t.datesText})</span>
                  {activeTrip?.id === t.id && (
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Security & Privacy Trust Banner */}
      <div className="flex items-start gap-3 p-3.5 bg-blue-50/80 border border-blue-200/60 rounded-2xl text-slate-800">
        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          <span className="material-symbols-outlined text-[18px]">lock</span>
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-extrabold text-blue-900">Encrypted On-Device Vault</span>
            <span className="text-[9px] font-extrabold bg-teal-600 text-white px-1.5 py-0.2 rounded uppercase tracking-wider">
              100% Offline
            </span>
          </div>
          <p className="text-[11px] text-blue-800 leading-snug">
            Your travel passes are stored on this device only. TripSwipe strictly never archives government IDs (Aadhaar, PAN, Passport).
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-4 px-4 py-0.5">
        {[
          { id: 'all', label: 'All', count: docs.length },
          {
            id: 'transit',
            label: 'Flight / Train',
            count: docs.filter((d) => d.type === 'flight' || d.type === 'cab').length,
          },
          {
            id: 'stay',
            label: 'Hotels',
            count: docs.filter((d) => d.type === 'hotel').length,
          },
          {
            id: 'permit',
            label: 'Activity Permits',
            count: docs.filter((d) => d.type === 'permit' || d.type === 'insurance').length,
          },
        ].map((tab) => {
          const isSel = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold flex-shrink-0 transition-all ${
                isSel
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                  isSel ? 'bg-white/30 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Document Cards List */}
      <div className="flex flex-col gap-3.5">
        {filteredDocs.map((docItem) => (
          <div
            key={docItem.id}
            className="flex flex-col bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden transition-all hover:shadow-md"
          >
            {/* Top Accent Strip */}
            <div
              className={`h-1.5 w-full ${
                docItem.type === 'flight'
                  ? 'bg-blue-600'
                  : docItem.type === 'hotel'
                  ? 'bg-amber-600'
                  : 'bg-teal-600'
              }`}
            />

            <div className="p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      docItem.type === 'flight'
                        ? 'bg-blue-50 text-blue-600'
                        : docItem.type === 'hotel'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-teal-50 text-teal-700'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[22px]">
                      {docItem.type === 'flight'
                        ? 'airplane_ticket'
                        : docItem.type === 'hotel'
                        ? 'apartment'
                        : 'landscape'}
                    </span>
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">
                      {docItem.categoryLabel}
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900 leading-tight truncate">
                      {docItem.title}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">{docItem.subtitle}</p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${
                    docItem.badgeColor === 'emerald'
                      ? 'bg-teal-100 text-teal-800'
                      : docItem.badgeColor === 'amber'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-teal-600 text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[13px]">check_circle</span>
                  <span>{docItem.badge}</span>
                </span>
              </div>

              {/* Quick Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-semibold">{docItem.metric1Label}</span>
                  <span className="font-bold text-slate-800 mt-0.5">{docItem.metric1Val}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-400 font-semibold">{docItem.metric2Label}</span>
                  <span className="font-bold text-slate-800 mt-0.5">{docItem.metric2Val}</span>
                </div>
              </div>

              {/* Status Row */}
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <div className="flex items-center gap-1 text-slate-700 font-medium">
                  <span className="material-symbols-outlined text-red-500 text-[16px]">
                    picture_as_pdf
                  </span>
                  <span>{docItem.fileDocName}</span>
                </div>
                <span className="flex items-center gap-1 text-teal-700 font-bold">
                  <span className="material-symbols-outlined text-[15px]">cloud_done</span>
                  <span>Saved Offline</span>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedDocForView(docItem)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-blue-600 text-white rounded-full text-xs font-bold shadow-xs hover:bg-blue-700 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {docItem.type === 'permit' ? 'qr_code_scanner' : 'visibility'}
                  </span>
                  <span>
                    {docItem.type === 'permit' ? 'Show QR at Checkpost' : 'View Offline'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => alert(`Downloading offline backup: ${docItem.fileDocName}`)}
                  className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 active:scale-95 transition-all"
                  title="Download Copy"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: docItem.title,
                        text: `${docItem.title} - ${docItem.subtitle}`,
                      }).catch(() => {});
                    } else {
                      alert('Pass details copied to clipboard');
                    }
                  }}
                  className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 active:scale-95 transition-all"
                  title="Share Document"
                >
                  <span className="material-symbols-outlined text-[18px]">share</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Primary Floating Action Button / CTA */}
      <div className="pt-2">
        <button
          onClick={onOpenAddDoc}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-full font-bold text-xs shadow-md hover:bg-blue-700 active:scale-98 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          <span>+ Add Travel Document</span>
        </button>
        <p className="text-center text-[10px] text-slate-400 mt-2">
          Supports PDF, Apple Wallet PKPass, PNG & QR screenshot imports
        </p>
      </div>

      {/* QR / Document Offline Inspection Modal */}
      {selectedDocForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center gap-4 relative">
            <button
              onClick={() => setSelectedDocForView(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">qr_code_2</span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                Verified Inspector QR Code
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                {selectedDocForView.title}
              </h3>
              <p className="text-xs text-slate-500">{selectedDocForView.subtitle}</p>
            </div>

            {/* Offline Barcode Simulation */}
            <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center">
              <svg className="w-48 h-48" viewBox="0 0 200 200">
                <rect width="200" height="200" fill="#ffffff" />
                {/* 3 Large Corner Position Markers */}
                <rect x="20" y="20" width="40" height="40" fill="#0f172a" />
                <rect x="28" y="28" width="24" height="24" fill="#ffffff" />
                <rect x="34" y="34" width="12" height="12" fill="#0f172a" />

                <rect x="140" y="20" width="40" height="40" fill="#0f172a" />
                <rect x="148" y="28" width="24" height="24" fill="#ffffff" />
                <rect x="154" y="34" width="12" height="12" fill="#0f172a" />

                <rect x="20" y="140" width="40" height="40" fill="#0f172a" />
                <rect x="28" y="148" width="24" height="24" fill="#ffffff" />
                <rect x="34" y="154" width="12" height="12" fill="#0f172a" />

                {/* Simulated Data Pattern */}
                <rect x="80" y="30" width="10" height="10" fill="#0f172a" />
                <rect x="100" y="30" width="10" height="10" fill="#0f172a" />
                <rect x="90" y="50" width="15" height="10" fill="#0f172a" />
                <rect x="70" y="70" width="20" height="20" fill="#0f172a" />
                <rect x="110" y="70" width="10" height="15" fill="#0f172a" />
                <rect x="130" y="90" width="15" height="20" fill="#0f172a" />
                <rect x="85" y="110" width="25" height="15" fill="#0f172a" />
                <rect x="140" y="130" width="15" height="15" fill="#0f172a" />
                <rect x="80" y="145" width="20" height="15" fill="#0f172a" />
                <rect x="115" y="150" width="10" height="20" fill="#0f172a" />
                <rect x="150" y="160" width="20" height="15" fill="#0f172a" />
              </svg>
              <span className="text-[10px] font-mono font-bold text-slate-500 mt-2">
                {selectedDocForView.qrPayload || 'TRIPSWIPE-PASS-HP-2026-ENCRYPTED'}
              </span>
            </div>

            <div className="w-full p-2.5 bg-teal-50 text-teal-800 text-[11px] rounded-xl flex items-center justify-center gap-1.5 font-bold">
              <span className="material-symbols-outlined text-[16px]">wifi_off</span>
              <span>Screen brightness boosted • 100% Offline Ready</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
