import React, { useState } from 'react';
import { Trip } from '../types';
import { DestinationWeatherWidget } from './DestinationWeatherWidget';
import { DestinationForecastData } from '../services/locationWeather';
import { PackingProgressChart } from './PackingProgressChart';
import { ContextualWeatherAlert } from './ContextualWeatherAlert';

interface TripPackingDeckScreenProps {
  trip: Trip;
  onOpenChecklist: () => void;
  onOpenShop: () => void;
  onOpenWallet: () => void;
  onOpenSwipeMode: () => void;
  onOpenReadiness: () => void;
  onBack: () => void;
  onRecordUpcoming?: (trip: Trip) => void;
  onOpenAIAdvisor?: (initialPrompt?: string) => void;
  onOpenAILuggageAudit?: () => void;
}

export const TripPackingDeckScreen: React.FC<TripPackingDeckScreenProps> = ({
  trip,
  onOpenChecklist,
  onOpenShop,
  onOpenWallet,
  onOpenSwipeMode,
  onOpenReadiness,
  onBack,
  onRecordUpcoming,
  onOpenAIAdvisor,
  onOpenAILuggageAudit,
}) => {
  const [showWeatherExplainer, setShowWeatherExplainer] = useState(true);
  const [liveForecastData, setLiveForecastData] = useState<DestinationForecastData | null>(null);

  const total = trip.items?.length || 40;
  const owned = trip.items?.filter((i) => i.status === 'own').length || 20;
  const inLuggage = trip.items?.filter((i) => i.status === 'packed').length || 6;
  const needToBuy = trip.items?.filter((i) => i.status === 'to_buy').length || 14;
  const readyCount = owned + inLuggage;
  const pct = total > 0 ? Math.round((readyCount / total) * 100) : 65;

  return (
    <div className="flex flex-col gap-6 pb-28 pt-20 px-4 sm:px-6 lg:px-8 max-w-6xl xl:max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Curated Preview Banner if user is just playing around */}
      {trip.isCuratedPreview && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-3.5 flex flex-col gap-2 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600 text-[20px]">interests</span>
              <span className="text-xs font-bold text-amber-950">Curated Preview & Tinker Mode</span>
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
              Playing Around
            </span>
          </div>
          <p className="text-[11px] text-amber-800 leading-snug">
            You're test-driving the curated {trip.destination} packing deck. You can explore, swipe items, and tinker with gear without cluttering your upcoming trips.
          </p>
          {onRecordUpcoming && (
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => onRecordUpcoming(trip)}
                className="flex-1 py-1.5 px-3 rounded-full bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">backpack</span>
                <span>Record as My Upcoming Trip</span>
              </button>
              <button
                type="button"
                onClick={onBack}
                className="py-1.5 px-3 rounded-full bg-white border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100 active:scale-95 transition-all cursor-pointer"
              >
                Exit
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sub Navigation */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>{trip.isCuratedPreview ? 'Exit Preview' : 'Back to My Trips'}</span>
        </button>

        <div className="flex items-center gap-1.5">
          {onOpenAILuggageAudit && (
            <button
              onClick={onOpenAILuggageAudit}
              title="Audit baggage weight & airline compliance"
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors shadow-2xs border border-indigo-200 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">scale</span>
              <span>AI Audit</span>
            </button>
          )}

          {onOpenAIAdvisor && (
            <button
              onClick={() => onOpenAIAdvisor(`What critical items am I missing for my trip to ${trip.destination}?`)}
              title="Ask Gemini AI travel advisor"
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold transition-opacity hover:opacity-95 shadow-2xs cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
              <span>Ask AI</span>
            </button>
          )}

          <button
            onClick={onOpenReadiness}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors shadow-2xs border border-blue-200"
          >
            <span className="material-symbols-outlined text-[15px]">analytics</span>
            <span>Readiness</span>
          </button>
        </div>
      </div>

      {/* 2-Column Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Destination Hero & Weather Forecast */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Hero Card: Destination Landscape */}
          <div className="relative w-full rounded-3xl overflow-hidden shadow-sm bg-slate-900">
        <div
          className="w-full h-52 bg-cover bg-center relative"
          style={{ backgroundImage: `url('${trip.heroImage}')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-slate-800 text-xs font-bold shadow-xs">
              <span>
                {liveForecastData?.overallTripMin !== undefined && liveForecastData.overallTripMin <= 0
                  ? '❄️'
                  : trip.tempRange?.includes('-')
                  ? '❄️'
                  : trip.destination.toLowerCase().includes('goa')
                  ? '🏖️'
                  : '☀️'}
              </span>
              <span>{trip.daysAway} Days to Departure</span>
              <span className="text-slate-300">•</span>
              <span className="text-blue-700 font-extrabold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[13px]">thermostat</span>
                <span>{liveForecastData?.tripExpectedTempRange || trip.tempRange || 'Weather Forecast'}</span>
              </span>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenSwipeMode}
                title="Interactive Swipe Mode"
                className="px-3 py-1.5 rounded-full bg-blue-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5 active:scale-95 transition-all hover:bg-blue-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">touch_app</span>
                <span>Swipe Mode</span>
              </button>
            </div>
          </div>

          {/* Destination Details Bottom */}
          <div className="absolute bottom-3 left-3.5 right-3.5 text-white">
            <div className="flex items-center gap-1 text-teal-300 text-xs font-bold mb-0.5">
              <span className="material-symbols-outlined text-[15px]">location_on</span>
              <span className="uppercase tracking-wider">{trip.region}</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight drop-shadow-sm text-white">
              {trip.destination}
            </h2>
            <p className="text-xs text-slate-200 flex items-center gap-1.5 mt-0.5 opacity-90">
              <span className="material-symbols-outlined text-[14px]">event</span>
              <span>
                {trip.datesText} • {trip.durationNights}N / {trip.durationDays}D
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* AI Contextual Weather Alert & Packing Optimizer */}
      <ContextualWeatherAlert
        tripId={trip.id}
        destination={trip.destination}
        forecastData={liveForecastData}
        items={trip.items || []}
        onOpenChecklist={onOpenChecklist}
      />

      {/* Real-Time Destination & Dates Weather Forecast Widget */}
      <DestinationWeatherWidget
        tripId={trip.id}
        destination={trip.destination}
        region={trip.region}
        startDate={trip.startDate}
        endDate={trip.endDate}
        datesText={trip.datesText}
        durationDays={trip.durationDays}
        daysAway={trip.daysAway}
        fallbackTempRange={trip.tempRange}
        fallbackClimateTitle={trip.climateTitle}
        fallbackClimateNote={trip.climateNote}
        packingRules={trip.packingRules}
        onOpenChecklist={onOpenChecklist}
        onOpenAIAdvisor={onOpenAIAdvisor}
        onWeatherLoaded={setLiveForecastData}
      />
    </div>

    {/* Right Column: D3 Packing Progress Dashboard & Hub Cards */}
    <div className="lg:col-span-5 flex flex-col gap-6">
      {/* D3.js Packing Progress Dashboard Widget */}
      <PackingProgressChart
        items={trip.items || []}
        onOpenCategoryChecklist={() => onOpenChecklist()}
      />

      {/* 2x2 Metric Stat Tiles */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800">Luggage Breakdown</h4>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {total} Items Total
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between border border-slate-100">
            <div>
              <span className="text-xl font-extrabold text-slate-900 leading-tight block">
                {total}
              </span>
              <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Total Gear</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-200/70 flex items-center justify-center text-slate-600">
              <span className="material-symbols-outlined text-[18px]">checklist</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between border border-slate-100">
            <div>
              <span className="text-xl font-extrabold text-teal-700 leading-tight block">
                {owned}
              </span>
              <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Owned (✓)</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between border border-slate-100">
            <div>
              <span className="text-xl font-extrabold text-blue-600 leading-tight block">
                {inLuggage}
              </span>
              <p className="text-[11px] font-semibold text-slate-500 mt-0.5">In Luggage (🎒)</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined text-[18px]">luggage</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between border border-slate-100">
            <div>
              <span className="text-xl font-extrabold text-amber-700 leading-tight block">
                {needToBuy}
              </span>
              <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Need to Buy (🛒)</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
              <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Section Hub Cards */}
      <div className="space-y-2.5">
        {/* Personalized Checklist */}
        <button
          onClick={onOpenChecklist}
          className="w-full text-left bg-white rounded-2xl p-3.5 shadow-xs border border-slate-100 hover:border-blue-200 active:scale-[0.99] transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">fact_check</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Personalized Checklist</h4>
                <p className="text-xs text-slate-500">
                  Manage & sort all {total} {trip.destination} gear items
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-[20px]">
              arrow_forward_ios
            </span>
          </div>
        </button>

        {/* Shopping Recommendations */}
        <button
          onClick={onOpenShop}
          className="w-full text-left bg-white rounded-2xl p-3.5 shadow-xs border border-slate-100 hover:border-amber-200 active:scale-[0.99] transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">local_mall</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">Shopping Recommendations</h4>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold shrink-0">
                    {needToBuy} items
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">
                  Gloves, thermal fleece & mountain deals
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-[20px]">
              arrow_forward_ios
            </span>
          </div>
        </button>

        {/* Travel Documents */}
        <button
          onClick={onOpenWallet}
          className="w-full text-left bg-white rounded-2xl p-3.5 shadow-xs border border-slate-100 hover:border-teal-200 active:scale-[0.99] transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">confirmation_number</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">Travel Documents</h4>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                    {trip.documents?.length || 3} Files
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Flight e-tickets & {trip.destination} reservation vouchers
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-[20px]">
              arrow_forward_ios
            </span>
          </div>
        </button>
      </div>

      {/* Primary Bottom Action */}
      <div className="pt-2 flex flex-col gap-2">
        <button
          onClick={onOpenChecklist}
          className="w-full h-12 rounded-full bg-blue-600 text-white font-bold text-sm shadow-md hover:bg-blue-700 active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <span>View My Packing List</span>
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>

        <button
          onClick={onOpenSwipeMode}
          className="w-full h-11 rounded-full bg-slate-100 text-blue-600 font-bold text-xs hover:bg-slate-200 active:scale-98 transition-all flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[18px]">view_carousel</span>
          <span>Start Swipe Packing Mode</span>
        </button>
      </div>
    </div>
  </div>
</div>
  );
};
