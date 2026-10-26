import React, { useState, useEffect } from 'react';

export interface TrendingDestination {
  id: string;
  destination: string;
  region: string;
  country: string;
  tagline: string;
  seasonTrendTag: string;
  whyVisitNow: string;
  bestMonths: string;
  expectedTemp: string;
  climateBadge: string;
  trendingScore: number;
  theme: 'mountains' | 'beaches' | 'heritage' | 'international' | string;
  packingHighlights: string[];
  tripId?: string;
  imageUrl: string;
}

interface PopularDestinationsSectionProps {
  onPackDestination: (destinationOrId: string) => void;
  onPlanTrip: (initialDestination?: string) => void;
  onAnimateDestination?: (imageUrl: string, title: string) => void;
}

export const PopularDestinationsSection: React.FC<PopularDestinationsSectionProps> = ({
  onPackDestination,
  onPlanTrip,
  onAnimateDestination,
}) => {
  const [destinations, setDestinations] = useState<TrendingDestination[]>([]);
  const [seasonTitle, setSeasonTitle] = useState<string>('Autumn & Festive Travel Radar');
  const [seasonOverview, setSeasonOverview] = useState<string>(
    'Clear skies, pleasant temperatures, and the first autumn chill make October prime for Himalayan trails, palace exploration, and opening beach seasons.'
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isAiGenerated, setIsAiGenerated] = useState<boolean>(false);

  const fetchTrendingDestinations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/ai/popular-destinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: 'October',
          season: 'Autumn & Festive Season 2026',
        }),
      });

      const data = await res.json();
      if (data && data.destinations && data.destinations.length > 0) {
        setDestinations(data.destinations);
        if (data.seasonTitle) setSeasonTitle(data.seasonTitle);
        if (data.seasonOverview) setSeasonOverview(data.seasonOverview);
        setIsAiGenerated(Boolean(data.aiGenerated));
      }
    } catch (e) {
      console.warn('Failed to fetch trending destinations:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingDestinations();
  }, []);

  const filteredDestinations = destinations.filter((d) => {
    if (activeCategory === 'all') return true;
    return d.theme?.toLowerCase() === activeCategory.toLowerCase();
  });

  return (
    <section className="flex flex-col gap-3 pt-2">
      {/* Header with Gemini AI Badge and Refresh */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
              <span>Gemini AI Travel Trends</span>
              {isAiGenerated && (
                <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[9px] font-black">
                  Live AI
                </span>
              )}
            </span>
          </div>
          <h2 className="text-base font-black text-slate-900 tracking-tight mt-0.5">
            Popular Destinations
          </h2>
          <p className="text-[11px] text-slate-500 font-medium leading-snug line-clamp-1 mt-0.5">
            {seasonOverview}
          </p>
        </div>

        <button
          type="button"
          onClick={fetchTrendingDestinations}
          disabled={loading}
          title="Refresh trending spots with Gemini"
          className="shrink-0 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all cursor-pointer border border-slate-200/80 shadow-2xs"
        >
          <span className={`material-symbols-outlined text-[16px] ${loading ? 'animate-spin text-blue-600' : ''}`}>
            sync
          </span>
        </button>
      </div>

      {/* Seasonal Category Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-4 px-4 py-0.5">
        {[
          { id: 'all', label: '🌟 All Trending' },
          { id: 'mountains', label: '🏔️ Crisp Mountains' },
          { id: 'heritage', label: '🏰 Royal Heritage' },
          { id: 'beaches', label: '🏖️ Coastal Sun' },
          { id: 'international', label: '✈️ International' },
        ].map((cat) => {
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Destinations Cards Horizontal Carousel / Stack */}
      {loading && destinations.length === 0 ? (
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 py-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-72 bg-white rounded-3xl p-3 border border-slate-200 shadow-xs animate-pulse flex flex-col gap-2.5"
            >
              <div className="w-full h-36 bg-slate-200 rounded-2xl" />
              <div className="h-4 bg-slate-200 rounded-md w-3/4" />
              <div className="h-3 bg-slate-100 rounded-md w-full" />
              <div className="h-8 bg-slate-200 rounded-xl w-full mt-1" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-2 pt-0.5">
          {filteredDestinations.map((item) => (
            <div
              key={item.id}
              className="flex-shrink-0 w-72 sm:w-80 bg-white rounded-3xl shadow-xs border border-slate-200/90 hover:border-blue-500 hover:shadow-md transition-all overflow-hidden flex flex-col group"
            >
              {/* High-Quality Seasonal Imagery Hero */}
              <div className="relative h-40 w-full overflow-hidden bg-slate-900">
                <img
                  src={item.imageUrl}
                  alt={`${item.destination} seasonal view`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/30 to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-slate-900 text-[10px] font-black shadow-xs flex items-center gap-1">
                    <span>{item.seasonTrendTag}</span>
                  </span>

                  <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold shadow-xs flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[12px]">trending_up</span>
                    <span>{item.trendingScore}% Match</span>
                  </span>
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-2.5 left-3 right-3 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-white leading-tight drop-shadow-sm">
                        {item.destination}
                      </h3>
                      <span className="text-[11px] text-teal-300 font-semibold flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[12px]">location_on</span>
                        <span>{item.region}</span>
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-amber-300 block">
                        {item.expectedTemp}
                      </span>
                      <span className="text-[10px] text-slate-200 font-medium">
                        {item.climateBadge}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Body & Why Visit Now */}
              <div className="p-3.5 flex flex-col gap-2.5 flex-1 justify-between bg-white">
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs font-bold text-slate-800 italic leading-snug">
                    &ldquo;{item.tagline}&rdquo;
                  </p>

                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 leading-relaxed">
                    <strong className="text-blue-700 font-extrabold block mb-0.5">
                      Why travel this season:
                    </strong>
                    {item.whyVisitNow}
                  </div>

                  {/* Essential Packing Preview */}
                  <div className="flex flex-col gap-1 pt-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Seasonal Packing Essentials:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {item.packingHighlights?.map((packItem) => (
                        <span
                          key={packItem}
                          className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100/80"
                        >
                          {packItem}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons: Instant 1-Tap Pack or Plan Trip */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onPackDestination(item.tripId || item.destination)}
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">backpack</span>
                    <span>Pack {item.destination}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onPlanTrip(item.destination)}
                    title={`Customize itinerary for ${item.destination}`}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-200/60"
                  >
                    <span className="material-symbols-outlined text-[16px] text-slate-700">tune</span>
                  </button>

                  {onAnimateDestination && (
                    <button
                      type="button"
                      onClick={() => onAnimateDestination(item.imageUrl, item.destination)}
                      title={`Animate ${item.destination} photo into video with Veo`}
                      className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 active:scale-95 text-indigo-700 text-xs font-bold transition-all cursor-pointer border border-indigo-200"
                    >
                      <span className="material-symbols-outlined text-[16px]">movie</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
