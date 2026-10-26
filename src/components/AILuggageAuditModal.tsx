import React, { useState, useEffect } from 'react';
import { useTrips } from '../context/TripsContext';

interface AILuggageAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdvisor?: (prompt?: string) => void;
}

interface AuditData {
  score: number;
  grade: string;
  summary: string;
  weightAnalysis: {
    totalKg: number;
    cabinKg: number;
    checkinKg: number;
    excessKg: number;
    status: 'safe' | 'warning' | 'overweight';
  };
  securityWarnings: string[];
  missingEssentials: string[];
  overpackSuggestions: string[];
  aiGenerated?: boolean;
}

export const AILuggageAuditModal: React.FC<AILuggageAuditModalProps> = ({
  isOpen,
  onClose,
  onOpenAdvisor,
}) => {
  const { activeTrip } = useTrips();
  const [loading, setLoading] = useState(true);
  const [auditData, setAuditData] = useState<AuditData | null>(null);

  const destination = activeTrip?.destination || 'Manali';
  const duration = activeTrip?.durationDays || 5;
  const tempRange = activeTrip?.tempRange || '-2°C to 7°C';
  const items = activeTrip?.items || [];

  const runAudit = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/ai/luggage-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          durationDays: duration,
          tempRange,
          items: items.map((it) => ({
            id: it.id,
            name: it.name,
            category: it.category,
            status: it.status,
            weightKg: it.weightKg,
            priority: it.priority,
          })),
          luggageLimitKg: 15,
        }),
      });

      const data = await res.json();
      setAuditData(data);
    } catch (err) {
      console.error('Failed to run luggage audit:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runAudit();
    }
  }, [isOpen, destination, items.length]);

  if (!isOpen) return null;

  const totalKg = auditData?.weightAnalysis?.totalKg ?? 11.2;
  const limitKg = 15;
  const progressPct = Math.min(100, Math.round((totalKg / limitKg) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 backdrop-blur-md flex items-center justify-center border border-blue-400/30 text-blue-300">
              <span className="material-symbols-outlined text-[24px]">scale</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-base tracking-tight">AI Baggage & Weight Audit</h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-400/20 text-blue-300 text-[10px] font-extrabold border border-blue-400/30">
                  DGCA Ready
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {destination} • {duration} Days • 15kg Limit
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-12 h-12 rounded-full border-3 border-blue-600 border-t-transparent animate-spin"></div>
              <h4 className="font-bold text-slate-800 text-sm">Auditing Baggage with Gemini AI...</h4>
              <p className="text-xs text-slate-500 max-w-xs">
                Checking item weight distribution, hazardous items, airline limits, and weather resilience.
              </p>
            </div>
          ) : auditData ? (
            <>
              {/* Score & Status Card */}
              <div className="bg-gradient-to-br from-blue-50/60 to-indigo-50/40 border border-blue-100 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600">
                    Baggage Flight Readiness
                  </span>
                  <h4 className="text-xl font-extrabold text-slate-900">{auditData.grade}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-[260px]">
                    {auditData.summary}
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center shrink-0">
                  <div className="relative w-18 h-18 rounded-full flex items-center justify-center bg-white shadow-sm border-4 border-blue-600">
                    <span className="text-xl font-black text-slate-900">{auditData.score}</span>
                    <span className="text-[10px] font-bold text-slate-400 absolute bottom-2">/100</span>
                  </div>
                </div>
              </div>

              {/* Weight Distribution Meter */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-blue-600">luggage</span>
                    Total Packed Weight
                  </span>
                  <span>
                    {totalKg} kg / {limitKg} kg Limit ({15 - totalKg > 0 ? `${(15 - totalKg).toFixed(1)} kg remaining` : `${(totalKg - 15).toFixed(1)} kg excess`})
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      progressPct > 100
                        ? 'bg-rose-500'
                        : progressPct > 85
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, progressPct)}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                      Cabin Hand Bag (Max 7kg)
                    </span>
                    <span className="text-sm font-extrabold text-slate-900">
                      {auditData.weightAnalysis?.cabinKg || 4.2} kg
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                      Check-in Bag (Max 15kg)
                    </span>
                    <span className="text-sm font-extrabold text-slate-900">
                      {auditData.weightAnalysis?.checkinKg || 7.0} kg
                    </span>
                  </div>
                </div>
              </div>

              {/* Security & Airline Regulations */}
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 flex flex-col gap-2">
                <h5 className="font-extrabold text-xs text-amber-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-amber-600">security</span>
                  <span>DGCA & Airline Baggage Rules</span>
                </h5>
                <ul className="space-y-1.5 text-xs text-amber-900/90 pl-1">
                  {auditData.securityWarnings?.map((warn, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{warn}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Climate Essentials & Overpack Insights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Missing Essentials */}
                <div className="bg-rose-50/50 border border-rose-200/70 rounded-2xl p-3.5 flex flex-col gap-1.5">
                  <h6 className="font-bold text-xs text-rose-900 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-rose-600">warning</span>
                    <span>Missing Essentials</span>
                  </h6>
                  <ul className="text-xs text-slate-700 space-y-1">
                    {auditData.missingEssentials?.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-rose-500 font-bold">+</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Overpack Suggestions */}
                <div className="bg-emerald-50/50 border border-emerald-200/70 rounded-2xl p-3.5 flex flex-col gap-1.5">
                  <h6 className="font-bold text-xs text-emerald-900 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-emerald-600">checkroom</span>
                    <span>To Save Weight</span>
                  </h6>
                  <ul className="text-xs text-slate-700 space-y-1">
                    {auditData.overpackSuggestions?.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-emerald-500 font-bold">-</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={() => runAudit()}
            disabled={loading}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1 transition-all cursor-pointer"
          >
            <span className={`material-symbols-outlined text-[16px] ${loading ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>Re-Audit</span>
          </button>

          <div className="flex items-center gap-2">
            {onOpenAdvisor && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAdvisor(`How can I optimize my luggage weight and pack lighter for ${destination}?`);
                }}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                <span>Ask AI Advisor</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
