import React, { useState, useEffect, useCallback } from 'react';
import { PackingItem, GearCategory } from '../types';
import { DestinationForecastData } from '../services/locationWeather';
import { useTrips } from '../context/TripsContext';

interface RecommendationToAdd {
  id: string;
  name: string;
  category: string;
  reason: string;
  recommendedQty: string;
  priority: 'essential' | 'recommended' | 'optional';
}

interface RecommendationToRemove {
  itemId: string;
  name: string;
  reason: string;
}

interface ContextualWeatherAlertProps {
  tripId: string;
  destination: string;
  forecastData: DestinationForecastData | null;
  items: PackingItem[];
  onOpenChecklist?: () => void;
}

export const ContextualWeatherAlert: React.FC<ContextualWeatherAlertProps> = ({
  tripId,
  destination,
  forecastData,
  items,
  onOpenChecklist,
}) => {
  const { addCustomItem, updateItemStatus } = useTrips();
  const [loading, setLoading] = useState(false);
  const [alertTitle, setAlertTitle] = useState<string>('Analyzing Weather Conditions...');
  const [severity, setSeverity] = useState<'info' | 'warning' | 'alert'>('info');
  const [forecastAnalysis, setForecastAnalysis] = useState<string>('');
  const [recommendationsToAdd, setRecommendationsToAdd] = useState<RecommendationToAdd[]>([]);
  const [recommendationsToRemove, setRecommendationsToRemove] = useState<RecommendationToRemove[]>([]);
  const [isAiGenerated, setIsAiGenerated] = useState<boolean>(false);
  const [addedItemIds, setAddedItemIds] = useState<Set<string>>(new Set());
  const [removedItemIds, setRemovedItemIds] = useState<Set<string>>(new Set());
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const fetchRecommendations = useCallback(async () => {
    if (!destination) return;

    try {
      setLoading(true);

      const maxRain = forecastData
        ? Math.max(
            forecastData.precipitationProbability || 0,
            ...(forecastData.daily || []).map((d) => d.rainProb || 0)
          )
        : 0;

      const payload = {
        destination,
        forecast: forecastData
          ? {
              overallTripMin: forecastData.overallTripMin,
              overallTripMax: forecastData.overallTripMax,
              maxRainChance: maxRain,
              dominantCondition: forecastData.condition,
              daily: forecastData.daily?.slice(0, 7),
            }
          : undefined,
        currentItems: items.map((it) => ({
          id: it.id,
          name: it.name,
          category: it.category,
          status: it.status,
        })),
      };

      const res = await fetch('/api/ai/contextual-weather-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();
      if (data) {
        setAlertTitle(data.alertTitle || 'Destination Weather Advisory');
        setSeverity(data.severity || 'info');
        setForecastAnalysis(
          data.forecastAnalysis ||
            `7-day forecast indicates specific temperature swings for ${destination}. Adjust your packing accordingly.`
        );
        setRecommendationsToAdd(data.recommendationsToAdd || []);
        setRecommendationsToRemove(data.recommendationsToRemove || []);
        setIsAiGenerated(!!data.aiGenerated);
      }
    } catch (e: any) {
      console.warn('Contextual weather alert fetch error:', e.message);
    } finally {
      setLoading(false);
    }
  }, [destination, forecastData, items]);

  useEffect(() => {
    fetchRecommendations();
  }, [destination, forecastData?.overallTripMin, forecastData?.precipitationProbability]);

  // Handle adding recommended item
  const handleAddItem = async (rec: RecommendationToAdd) => {
    try {
      const validCategory: GearCategory =
        rec.category === 'Clothing & Layers' ||
        rec.category === 'Footwear & Boots' ||
        rec.category === 'Toiletries & Meds' ||
        rec.category === 'Electronics & Gadgets' ||
        rec.category === 'Adventure & Essentials' ||
        rec.category === 'Cosmetics & Skincare'
          ? (rec.category as GearCategory)
          : rec.name.toLowerCase().includes('umbrella') || rec.name.toLowerCase().includes('cover')
          ? 'Adventure & Essentials'
          : rec.name.toLowerCase().includes('sunscreen') || rec.name.toLowerCase().includes('cream')
          ? 'Cosmetics & Skincare'
          : 'Clothing & Layers';

      await addCustomItem(tripId, {
        name: rec.name,
        category: validCategory,
        recommendedQty: rec.recommendedQty || '1 unit',
        weightKg: 0.35,
        reason: `AI Weather Alert: ${rec.reason}`,
        status: 'to_buy',
        priority: rec.priority || 'essential',
      });

      setAddedItemIds((prev) => new Set(prev).add(rec.id));
      setActionNotice(`Added "${rec.name}" to packing list!`);
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err) {
      console.error('Failed to add item:', err);
    }
  };

  // Handle skipping / removing unsuited item
  const handleRemoveItem = async (rec: RecommendationToRemove) => {
    try {
      // Mark item status as 'skip' in Firestore / local trip
      await updateItemStatus(tripId, rec.itemId, 'skip');
      setRemovedItemIds((prev) => new Set(prev).add(rec.itemId));
      setActionNotice(`Marked "${rec.name}" as skipped!`);
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const severityStyles = {
    alert: {
      border: 'border-rose-200',
      bg: 'bg-rose-50/70',
      headerBg: 'bg-rose-100/80',
      badge: 'bg-rose-600 text-white',
      badgeLabel: 'Severe Weather Warning',
      icon: 'warning',
      iconColor: 'text-rose-600',
    },
    warning: {
      border: 'border-amber-200',
      bg: 'bg-amber-50/70',
      headerBg: 'bg-amber-100/80',
      badge: 'bg-amber-600 text-white',
      badgeLabel: 'Weather Advisory',
      icon: 'bolt',
      iconColor: 'text-amber-600',
    },
    info: {
      border: 'border-blue-200',
      bg: 'bg-blue-50/70',
      headerBg: 'bg-blue-100/80',
      badge: 'bg-blue-600 text-white',
      badgeLabel: 'Climate Advisory',
      icon: 'auto_awesome',
      iconColor: 'text-blue-600',
    },
  }[severity];

  return (
    <div
      className={`rounded-2xl border ${severityStyles.border} ${severityStyles.bg} overflow-hidden shadow-xs transition-all`}
    >
      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="bg-slate-900 text-white text-xs font-bold py-2 px-4 text-center animate-in fade-in duration-150 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-teal-400">check_circle</span>
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Card Header */}
      <div className="p-4 sm:p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${severityStyles.headerBg} ${severityStyles.iconColor}`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {severityStyles.icon}
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${severityStyles.badge}`}>
                  {severityStyles.badgeLabel}
                </span>
                <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px] text-blue-600">psychology</span>
                  <span>{isAiGenerated ? 'Gemini 3.8 Flash' : 'Weather Grounded'}</span>
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight mt-0.5 truncate">
                {alertTitle}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={fetchRecommendations}
              disabled={loading}
              title="Refresh Gemini AI Weather Audit"
              className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-600 hover:text-blue-600 border border-slate-200/60 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-[16px] ${loading ? 'animate-spin' : ''}`}>
                refresh
              </span>
            </button>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? 'Expand Alert' : 'Minimize Alert'}
              className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border border-slate-200/60 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isCollapsed ? 'expand_more' : 'expand_less'}
              </span>
            </button>
          </div>
        </div>

        {/* AI Forecast Analysis Summary */}
        <p className="text-xs text-slate-700 leading-relaxed font-medium">
          {forecastAnalysis}
        </p>

        {/* Expandable Content: Recommendations To Add & Remove */}
        {!isCollapsed && (
          <div className="pt-2 flex flex-col gap-4">
            {/* Section 1: Recommended to ADD based on 7-Day Forecast */}
            {recommendationsToAdd.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-teal-600 font-bold">
                      add_circle
                    </span>
                    <span>Recommended to Pack for this Forecast</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {recommendationsToAdd.length} suggestions
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {recommendationsToAdd.map((rec) => {
                    const isAdded = addedItemIds.has(rec.id);
                    return (
                      <div
                        key={rec.id}
                        className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs flex flex-col justify-between gap-2.5 transition-all"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                              {rec.category}
                            </span>
                            {rec.priority === 'essential' && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700">
                                Essential
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 leading-snug">
                            {rec.name}
                          </h4>
                          <p className="text-[11px] text-slate-600 leading-tight">
                            {rec.reason}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <span className="text-[10px] text-slate-400 font-medium">
                            Qty: {rec.recommendedQty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddItem(rec)}
                            disabled={isAdded}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                              isAdded
                                ? 'bg-teal-50 text-teal-700 cursor-default'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs active:scale-95'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {isAdded ? 'check' : 'add'}
                            </span>
                            <span>{isAdded ? 'Added' : 'Add to List'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section 2: Recommended to REMOVE / LEAVE BEHIND */}
            {recommendationsToRemove.length > 0 && (
              <div className="flex flex-col gap-2 pt-1 border-t border-slate-200/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-amber-600 font-bold">
                      do_not_disturb_on
                    </span>
                    <span>Recommended to Leave Behind (Save Weight)</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {recommendationsToRemove.length} items
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  {recommendationsToRemove.map((rec) => {
                    const isRemoved = removedItemIds.has(rec.itemId);
                    return (
                      <div
                        key={rec.itemId}
                        className="bg-white/90 rounded-xl p-3 border border-slate-200 shadow-2xs flex items-center justify-between gap-3 transition-all"
                      >
                        <div className="min-w-0 flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {rec.name}
                            </span>
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800">
                              Redundant for this 7-day weather
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-tight">
                            {rec.reason}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(rec)}
                          disabled={isRemoved}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 shrink-0 transition-all cursor-pointer ${
                            isRemoved
                              ? 'bg-slate-100 text-slate-500 cursor-default'
                              : 'bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 shadow-2xs active:scale-95'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {isRemoved ? 'check' : 'remove_circle_outline'}
                          </span>
                          <span>{isRemoved ? 'Skipped' : 'Skip Item'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Link to Checklist */}
            {onOpenChecklist && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">
                  Syncs automatically with your trip packing checklist
                </span>
                <button
                  type="button"
                  onClick={onOpenChecklist}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>Review Checklist</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
