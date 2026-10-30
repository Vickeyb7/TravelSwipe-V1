import React, { useState, useEffect } from 'react';
import {
  fetchDestinationForecast,
  DestinationForecastData,
  DestinationDailyForecast,
} from '../services/locationWeather';
import { useTrips } from '../context/TripsContext';
import { GearCategory } from '../types';

interface DestinationWeatherWidgetProps {
  destination: string;
  tripId?: string;
  region?: string;
  startDate?: string;
  endDate?: string;
  datesText?: string;
  durationDays?: number;
  daysAway?: number;
  fallbackTempRange?: string;
  fallbackClimateTitle?: string;
  fallbackClimateNote?: string;
  packingRules?: string[];
  onOpenChecklist?: () => void;
  onOpenAIAdvisor?: (prompt?: string) => void;
  onWeatherLoaded?: (data: DestinationForecastData) => void;
}

export const DestinationWeatherWidget: React.FC<DestinationWeatherWidgetProps> = ({
  destination,
  tripId,
  region,
  startDate,
  endDate,
  datesText,
  durationDays = 5,
  daysAway,
  fallbackTempRange,
  fallbackClimateTitle,
  fallbackClimateNote,
  packingRules = [],
  onOpenChecklist,
  onOpenAIAdvisor,
  onWeatherLoaded,
}) => {
  const { addCustomItem } = useTrips();
  const [forecast, setForecast] = useState<DestinationForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'live_weekly' | 'trip_dates'>('live_weekly');
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const loadForecast = async (forceFresh: boolean = false) => {
    try {
      setLoading(true);
      const data = await fetchDestinationForecast(
        destination,
        startDate,
        endDate,
        durationDays,
        forceFresh
      );
      setForecast(data);
      if (onWeatherLoaded) {
        onWeatherLoaded(data);
      }
    } catch (e) {
      console.warn('Failed to load forecast for destination & dates:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForecast();
  }, [destination, startDate, endDate, durationDays]);

  const handleAddMustPackItem = async (itemName: string) => {
    if (!tripId) return;
    try {
      const category: GearCategory =
        itemName.toLowerCase().includes('sunscreen') || itemName.toLowerCase().includes('spf')
          ? 'Cosmetics & Skincare'
          : itemName.toLowerCase().includes('umbrella') || itemName.toLowerCase().includes('rain') || itemName.toLowerCase().includes('bag')
          ? 'Adventure & Essentials'
          : itemName.toLowerCase().includes('boot') || itemName.toLowerCase().includes('shoe') || itemName.toLowerCase().includes('sock')
          ? 'Footwear & Boots'
          : 'Clothing & Layers';

      await addCustomItem(tripId, {
        name: itemName,
        category,
        recommendedQty: '1 unit',
        weightKg: 0.3,
        reason: `Added from ${destination} 7-day weather forecast`,
        status: 'to_buy',
        priority: 'essential',
      });
      setAddedItems((prev) => new Set(prev).add(itemName));
      setActionFeedback(`Added "${itemName}" to checklist!`);
      setTimeout(() => setActionFeedback(null), 2500);
    } catch (e) {
      console.warn('Could not add item to trip:', e);
    }
  };

  // 7-day live weekly slice
  const sevenDayList: DestinationDailyForecast[] = (forecast?.daily || []).slice(0, 7);

  const displayedList: DestinationDailyForecast[] =
    activeTab === 'trip_dates'
      ? (forecast?.tripItineraryForecast?.length ? forecast.tripItineraryForecast : sevenDayList)
      : sevenDayList;

  const activeDay: DestinationDailyForecast | undefined = displayedList[selectedDayIdx] || displayedList[0];

  return (
    <div className="bg-gradient-to-br from-white via-slate-50 to-blue-50/30 border border-slate-200/90 rounded-3xl p-4 shadow-xs flex flex-col gap-3.5 transition-all">
      {/* Top Header: Live Radar Badge, Dates Horizon & Refresh */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1">
              <span>{forecast?.resolvedLocation || destination} Live Radar</span>
            </span>
          </div>
          {datesText && (
            <span className="text-[11px] text-blue-600 font-bold mt-0.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">calendar_month</span>
              <span>Travel Dates: {datesText}</span>
              {daysAway !== undefined && (
                <span className="text-[10px] text-slate-500 font-medium">
                  • {daysAway === 0 ? 'Starts Today!' : daysAway === 1 ? 'Departing Tomorrow' : `Departing in ${daysAway} days`}
                </span>
              )}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => loadForecast(true)}
            title="Refresh live forecast"
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-all cursor-pointer shadow-2xs border border-slate-200 active:scale-95"
          >
            <span className={`material-symbols-outlined text-[16px] ${loading ? 'animate-spin text-blue-600' : ''}`}>
              refresh
            </span>
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 cursor-pointer bg-white px-2.5 py-1.5 rounded-full border border-slate-200 shadow-2xs"
          >
            <span>{isExpanded ? 'Less' : 'Atmosphere'}</span>
            <span className="material-symbols-outlined text-[15px]">
              {isExpanded ? 'expand_less' : 'expand_more'}
            </span>
          </button>
        </div>
      </div>

      {/* Climate Alert Notice (if applicable) */}
      {forecast?.climateAlert && (
        <div
          className={`p-3 rounded-2xl flex items-start gap-2.5 text-xs font-semibold animate-in fade-in ${
            forecast.climateAlert.severity === 'warning'
              ? 'bg-amber-500/10 text-amber-950 border border-amber-300'
              : 'bg-blue-50 text-blue-900 border border-blue-200'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[18px] shrink-0 mt-0.5 ${
              forecast.climateAlert.severity === 'warning' ? 'text-amber-600' : 'text-blue-600'
            }`}
          >
            {forecast.climateAlert.severity === 'warning' ? 'warning' : 'info'}
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="font-extrabold text-[12px]">{forecast.climateAlert.title}</span>
            <p className="text-[11px] leading-snug opacity-90">{forecast.climateAlert.message}</p>
          </div>
        </div>
      )}

      {/* Main Current Weather Display */}
      <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-xs shrink-0 border border-white/20">
            <span className="material-symbols-outlined text-[28px]">
              {forecast?.icon || 'wb_sunny'}
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black leading-none text-white">
                {forecast ? `${forecast.currentTemp}°C` : fallbackTempRange || '24°C'}
              </span>
              <span className="text-xs font-bold text-teal-200">
                {forecast?.condition || fallbackClimateTitle || 'Pleasant'}
              </span>
            </div>
            <span className="text-[11px] text-blue-100 font-medium mt-1">
              Feels like {forecast?.apparentTemp ?? forecast?.currentTemp ?? 25}°C • Dates Range:{' '}
              {forecast?.tripExpectedTempRange || fallbackTempRange || `${forecast?.currentTemp ?? 22}°C - ${(forecast?.currentTemp ?? 22) + 8}°C`}
            </span>
          </div>
        </div>

        {/* Live UV & Rain Badges */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-extrabold shadow-2xs flex items-center gap-1 border border-white/20">
            <span className="material-symbols-outlined text-[13px] text-amber-300">wb_sunny</span>
            <span>UV {forecast?.uvIndex ?? 6}</span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-bold shadow-2xs flex items-center gap-1 border border-white/20">
            <span className="material-symbols-outlined text-[13px] text-sky-300">water_drop</span>
            <span>{forecast?.precipitationProbability ?? 10}% Rain</span>
          </span>
        </div>
      </div>

      {/* Real-Time Expected Temperature Range for Travel Dates */}
      <div className="p-4 rounded-2xl bg-white border border-blue-200/90 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">thermostat</span>
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 block">
                Travel Dates Forecast ({datesText || `${durationDays} Days`})
              </span>
              <h4 className="text-sm font-black text-slate-900 leading-tight">
                Expected Temperature Range
              </h4>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-lg font-black text-blue-700 tracking-tight">
              {forecast?.tripExpectedTempRange || fallbackTempRange || '22°C to 30°C'}
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {forecast?.overallTripMin !== undefined && forecast.overallTripMin <= 0
                ? '❄️ Sub-Zero Freeze Expected'
                : forecast?.overallTripMax !== undefined && forecast.overallTripMax >= 30
                ? '☀️ Tropical Heat'
                : '🌤️ Moderate Range'}
            </span>
          </div>
        </div>

        {/* Min-to-Max Thermal Span Meter */}
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1 text-sky-700">
              <span className="material-symbols-outlined text-[15px] text-sky-500">arrow_downward</span>
              <span>Night Low: <strong>{forecast?.overallTripMin ?? -2}°C</strong></span>
            </span>
            <span className="text-[11px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">
              {forecast?.diurnalSwing ? `${forecast.diurnalSwing}°C Day-Night Shift` : 'Day-Night Variation'}
            </span>
            <span className="flex items-center gap-1 text-amber-700">
              <span className="material-symbols-outlined text-[15px] text-amber-500">arrow_upward</span>
              <span>Day High: <strong>{forecast?.overallTripMax ?? 8}°C</strong></span>
            </span>
          </div>

          <div className="relative w-full h-2.5 rounded-full bg-gradient-to-r from-sky-400 via-amber-300 to-rose-400 overflow-hidden shadow-inner">
            <div className="absolute inset-0 bg-white/10" />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span>Freezing / Thermal Base Layers</span>
            <span>Midday Layers</span>
            <span>Peak Afternoon Sun</span>
          </div>
        </div>
      </div>

      {/* Forecast Scope Tabs: "Next 7 Days Live" vs "Trip Dates Forecast" */}
      <div className="flex items-center justify-between gap-1 bg-slate-200/60 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => {
            setActiveTab('live_weekly');
            setSelectedDayIdx(0);
          }}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'live_weekly'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">calendar_view_week</span>
          <span>7-Day Forecast (Live)</span>
          <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase">
            Radar
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('trip_dates');
            setSelectedDayIdx(0);
          }}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'trip_dates'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">event</span>
          <span>Trip Dates Horizon</span>
        </button>
      </div>

      {/* Date Cards Horizontal Carousel */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider px-0.5">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-blue-600">schedule</span>
            <span>{activeTab === 'live_weekly' ? '7-Day Destination Forecast' : 'Scheduled Itinerary Window'}</span>
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Tap day to view packing impact</span>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
          {displayedList.map((d, idx) => {
            const isSelected = selectedDayIdx === idx;
            return (
              <button
                key={d.date + idx}
                type="button"
                onClick={() => setSelectedDayIdx(idx)}
                className={`flex-shrink-0 w-24 p-2.5 rounded-2xl flex flex-col items-center gap-1 transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-102 ring-2 ring-blue-600/30'
                    : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <span className={`text-[11px] font-extrabold ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                  {d.dayName}
                </span>

                <span className={`text-[10px] font-medium leading-none ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                  {d.formattedDate}
                </span>

                <span
                  className={`material-symbols-outlined text-[24px] my-0.5 ${
                    isSelected ? 'text-teal-200' : 'text-blue-600'
                  }`}
                >
                  {d.icon}
                </span>

                <div className="flex items-baseline gap-1 text-[11px] font-extrabold">
                  <span>{d.tempMax}°</span>
                  <span className={`text-[9px] ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>
                    {d.tempMin}°
                  </span>
                </div>

                <div
                  className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : d.rainProb > 30
                      ? 'bg-sky-100 text-sky-800'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {d.rainProb}% rain
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Breakdown Card & Packing Advice */}
      {activeDay && (
        <div className="p-3.5 rounded-2xl bg-slate-100/90 text-slate-700 text-xs flex flex-col gap-2 border border-slate-200/70 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-blue-600 text-[18px]">
                {activeDay.icon}
              </span>
              <span className="font-extrabold text-slate-900">{activeDay.dayName} ({activeDay.formattedDate}):</span>
              <span className="text-slate-700 font-semibold">{activeDay.condition}</span>
            </div>
            <span className="font-extrabold text-slate-900">
              High {activeDay.tempMax}°C • Low {activeDay.tempMin}°C
            </span>
          </div>

          {activeDay.packingTip && (
            <div className="flex items-center gap-2 text-[11px] text-blue-900 bg-blue-50/90 p-2.5 rounded-xl border border-blue-100">
              <span className="material-symbols-outlined text-blue-600 text-[16px] shrink-0">
                lightbulb
              </span>
              <span>
                <strong>Day Packing Tip:</strong> {activeDay.packingTip}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Weather-Driven Packing Strategy & Must-Pack Gear */}
      <div className="flex flex-col gap-2.5 p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-400 text-amber-950 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[17px]">backpack</span>
            </div>
            <span className="text-xs font-black text-amber-950">
              Weather-Driven Packing Strategy for {destination}
            </span>
          </div>

          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 uppercase tracking-wide">
            {forecast?.packingAdvice.temperatureCategory || 'Tailored'}
          </span>
        </div>

        <p className="text-xs text-amber-900 leading-snug font-medium">
          {forecast?.packingAdvice.summary ||
            fallbackClimateNote ||
            'Configured specifically for expected temperatures and precipitation during your travel dates.'}
        </p>

        {/* Feedback alert after adding item */}
        {actionFeedback && (
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-900 text-[11px] font-bold flex items-center gap-1.5 animate-in fade-in">
            <span className="material-symbols-outlined text-[14px] text-emerald-600">check_circle</span>
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* Packing Guidelines Chips */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {(forecast?.packingAdvice.packingRules || packingRules).map((rule, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-slate-800 text-[11px] font-bold border border-amber-200/70 shadow-2xs"
            >
              <span className="material-symbols-outlined text-[13px] text-teal-600">check</span>
              <span>{rule}</span>
            </span>
          ))}
        </div>

        {/* Must-Pack Gear Checklist with 1-Tap Add to Checklist */}
        {forecast?.packingAdvice.mustPackItems && (
          <div className="pt-2 border-t border-amber-200/60 mt-1 flex flex-col gap-1.5">
            <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-wider">
              Must-Pack Gear for {destination} Conditions:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {forecast.packingAdvice.mustPackItems.map((item, idx) => {
                const isAdded = addedItems.has(item);
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/95 border border-amber-200/80 shadow-2xs"
                  >
                    <span className="text-xs font-bold text-slate-900 truncate mr-2">
                      {item}
                    </span>
                    {tripId ? (
                      <button
                        type="button"
                        onClick={() => handleAddMustPackItem(item)}
                        disabled={isAdded}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold transition-all shrink-0 flex items-center gap-0.5 cursor-pointer ${
                          isAdded
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 hover:bg-amber-200 text-amber-900 active:scale-95'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[12px]">
                          {isAdded ? 'check' : 'add'}
                        </span>
                        <span>{isAdded ? 'Added' : 'Add to List'}</span>
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 mt-1">
          {onOpenChecklist && (
            <button
              type="button"
              onClick={onOpenChecklist}
              className="flex-1 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-500 active:scale-98 text-amber-950 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">checklist</span>
              <span>Review Checklist</span>
            </button>
          )}

          {onOpenAIAdvisor && (
            <button
              type="button"
              onClick={() =>
                onOpenAIAdvisor(
                  `Based on the live forecast for ${destination} (${forecast?.tripExpectedTempRange || fallbackTempRange || 'expected weather'}), give me a day-by-day climate packing strategy and clothing layering guide.`
                )
              }
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:opacity-95 active:scale-98"
            >
              <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
              <span>Ask AI Outfit Guide</span>
            </button>
          )}
        </div>
      </div>

      {/* Atmospheric Deep Details (Expanded) */}
      {isExpanded && forecast && (
        <div className="grid grid-cols-3 gap-2 p-3 bg-white rounded-2xl border border-slate-200 text-center animate-in fade-in duration-200">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Humidity</span>
            <span className="text-sm font-extrabold text-slate-800">{forecast.humidity}%</span>
          </div>
          <div className="flex flex-col border-x border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Wind Speed</span>
            <span className="text-sm font-extrabold text-slate-800">{forecast.windSpeed} km/h</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase">UV Index</span>
            <span className="text-sm font-extrabold text-slate-800">{forecast.uvIndex} (High)</span>
          </div>
        </div>
      )}
    </div>
  );
};
