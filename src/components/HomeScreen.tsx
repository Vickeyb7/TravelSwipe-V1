import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTrips } from '../context/TripsContext';
import { curatedInspirations } from '../utils/data';
import { useUserClimate } from '../hooks/useUserClimate';
import { PopularDestinationsSection } from './PopularDestinationsSection';

interface HomeScreenProps {
  onPlanTrip: (initialDestination?: string) => void;
  onPackCurated: (destination: string) => void;
  onResumePacking: () => void;
  onOpenDeck: () => void;
  onNavigateTab: (tab: 'my-trips' | 'shop' | 'wallet' | 'profile') => void;
  onOpenWalkaround?: () => void;
  onOpenAnimateVideo?: (imageUrl?: string, title?: string) => void;
  onOpenInstallMobile?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onPlanTrip,
  onPackCurated,
  onResumePacking,
  onOpenDeck,
  onNavigateTab,
  onOpenWalkaround,
  onOpenAnimateVideo,
  onOpenInstallMobile,
}) => {
  const { currentUser, userProfile } = useAuth();
  const { activeTrip } = useTrips();
  const { climate, refreshClimate } = useUserClimate();
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate packed counts for active trip
  const totalItems = activeTrip?.items?.length || 0;
  const packedCount =
    activeTrip?.items?.filter((i) => i.status === 'packed').length || 0;
  const toBuyCount =
    activeTrip?.items?.filter((i) => i.status === 'to_buy').length || 0;
  const packedPct = totalItems > 0 ? Math.round((packedCount / totalItems) * 100) : 0;

  const displayName =
    currentUser && userProfile?.name && userProfile.name !== 'Aarav Sharma'
      ? userProfile.name.split(' ')[0]
      : 'Traveller';

  return (
    <div className="flex flex-col gap-4 pb-24 pt-20 px-4 max-w-md mx-auto animate-in fade-in duration-200">
      {/* Welcome Header with User's Location and Temperature neatly aligned */}
      <section className="flex flex-col gap-2 pt-1">
        <div className="flex items-start justify-between gap-3">
          {/* Left: Traveler Greeting */}
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight truncate">
              Hey, {displayName}! <span className="inline-block animate-bounce">👋</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Ready for your next adventure?</p>
          </div>

          {/* Right: Detected Location & Real-Time Temperature Pills */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {/* Location Pill */}
            <button
              type="button"
              onClick={() => refreshClimate(true)}
              title={`Detected location: ${climate.location} (Click to re-detect)`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-slate-700 text-xs font-semibold shadow-2xs border border-slate-200/80 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer max-w-[155px]"
            >
              <span className="material-symbols-outlined text-[14px] text-blue-600 shrink-0">near_me</span>
              <span className="truncate">{climate.location}</span>
            </button>

            {/* Temperature Pill */}
            <button
              type="button"
              onClick={() => refreshClimate(true)}
              title={`Live climate: ${climate.temperatureText} (Click to refresh)`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200/80 shadow-2xs hover:bg-teal-100 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px] text-teal-600 shrink-0">{climate.icon}</span>
              <span>{climate.temperatureText}</span>
              <span className="relative flex h-1.5 w-1.5 ml-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Onboarding Tour Banner for First-Time Visitors */}
      {onOpenWalkaround && (
        <button
          type="button"
          onClick={onOpenWalkaround}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-2xl shadow-xs flex items-center justify-between hover:opacity-95 active:scale-98 transition-all cursor-pointer text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">explore</span>
            </div>
            <div>
              <p className="text-xs font-extrabold leading-tight">First time here? Take a 30-sec Tour</p>
              <p className="text-[10px] text-white/80 leading-tight">Learn AI packing, swipe mode & baggage</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-white text-[16px]">arrow_forward</span>
        </button>
      )}

      {/* Test on Mobile & Install APK Banner */}
      {onOpenInstallMobile && (
        <button
          type="button"
          onClick={onOpenInstallMobile}
          className="w-full bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 text-white p-3 rounded-2xl shadow-xs flex items-center justify-between hover:opacity-95 active:scale-98 transition-all cursor-pointer text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">install_mobile</span>
            </div>
            <div>
              <p className="text-xs font-extrabold leading-tight">Test on Mobile • Install Android APK</p>
              <p className="text-[10px] text-teal-100 leading-tight">Native WebAPK install, QR code & APK package</p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-white/20 text-white border border-white/20 flex items-center gap-1">
            <span>Install</span>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
          </span>
        </button>
      )}

      {/* Quick Search & Plan Action Card */}
      <section className="bg-white p-4 rounded-2xl shadow-xs border border-slate-100 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined text-[18px]">flight_takeoff</span>
            </div>
            <span className="text-xs font-bold text-slate-800">Where to next?</span>
          </div>
          <button
            onClick={() => onNavigateTab('my-trips')}
            className="text-xs font-semibold text-blue-600 flex items-center gap-0.5 hover:underline cursor-pointer"
          >
            <span>Explore Guides</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>

        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Ladakh, Goa, Paris, Coorg..."
            className="w-full h-11 pl-9 pr-9 bg-slate-50 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border focus:border-blue-500 transition-all"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">mic</span>
          </button>
        </div>

        <button
          onClick={() => onPlanTrip(searchQuery.trim() || undefined)}
          className="w-full h-12 rounded-full bg-blue-600 text-white font-bold text-xs shadow-md hover:bg-blue-700 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Plan a New Trip</span>
        </button>
      </section>

      {/* Weather Alert Banner */}
      <section className="bg-amber-50 border border-amber-200/80 p-3.5 rounded-2xl shadow-xs flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="material-symbols-outlined text-[20px]">
            {activeTrip ? 'severe_cold' : 'wb_sunny'}
          </span>
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
              {activeTrip ? `Weather Alert • ${activeTrip.destination}` : 'Live Weather Radar • Ready'}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900">
              {activeTrip?.tempRange || 'Radar Active'}
            </span>
          </div>
          <p className="text-xs text-amber-800 leading-snug mt-1">
            {activeTrip
              ? `Seasonal freezing temperatures detected for ${activeTrip.destination}. Heavy down thermals & waterproof boots recommended.`
              : 'Auto-syncs real-time climate, monsoon alerts, and temperature drops once you set your destination.'}
          </p>
        </div>
      </section>

      {/* Featured Upcoming Trip Card (if trip exists) or First-Time Journey Card */}
      {activeTrip ? (
        <section className="bg-white rounded-2xl overflow-hidden shadow-xs border border-slate-100 flex flex-col">
          {/* Visual Header */}
          <div
            className="relative h-44 w-full bg-cover bg-center"
            style={{ backgroundImage: `url('${activeTrip.heroImage}')` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent" />
            <div className="absolute top-3 inset-x-3 flex items-center justify-between">
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-900 font-bold text-[11px] shadow-xs">
                <span className="material-symbols-outlined text-[14px] text-blue-600">ac_unit</span>
                <span>{activeTrip.tag}</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white font-bold text-[11px] shadow-xs">
                {activeTrip.daysAway} Days to Go
              </span>
            </div>

            <div className="absolute bottom-3 left-3 right-3 text-white">
              <span className="text-[11px] text-teal-300 font-bold block">
                {activeTrip.region}
              </span>
              <h2 className="text-xl font-extrabold tracking-tight drop-shadow-sm">
                {activeTrip.destination} Getaway
              </h2>
            </div>
          </div>

          {/* Details & Packing Progress */}
          <div className="p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-blue-600">
                  calendar_month
                </span>
                <span className="text-slate-800 font-semibold">{activeTrip.datesText}</span>
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px]">
                {activeTrip.durationNights}N / {activeTrip.durationDays}D
              </span>
            </div>

            {/* Circular Gauge + Bar */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative w-8 h-8 flex items-center justify-center">
                    <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-200 stroke-current"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        strokeWidth="3.5"
                      />
                      <path
                        className="text-blue-600 stroke-current transition-all duration-700"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        strokeDasharray={`${packedPct}, 100`}
                        strokeLinecap="round"
                        strokeWidth="3.5"
                      />
                    </svg>
                    <span className="absolute text-[10px] font-extrabold text-blue-600">
                      {packedPct}%
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Packing Status</p>
                    <p className="text-[11px] text-slate-500">
                      {packedCount} of {totalItems} items ready
                    </p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                  {toBuyCount} Left
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${packedPct}%` }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={onResumePacking}
                className="flex-1 h-11 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:bg-blue-700 active:scale-98 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">touch_app</span>
                <span>Resume Packing (Swipe Mode)</span>
              </button>
              <button
                onClick={onOpenDeck}
                className="px-4 h-11 rounded-full bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 active:scale-98 transition-all cursor-pointer"
              >
                Deck
              </button>
            </div>
          </div>
        </section>
      ) : (
        /* First-Time Visitor Friendly Hero Card */
        <section className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100 flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[32px]">luggage</span>
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Start Your First Packing Deck</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
              Plan your domestic or international journey. Gemini AI generates climate-safe essentials and clothing layers.
            </p>
          </div>
          <button
            onClick={() => onPlanTrip()}
            className="w-full h-11 rounded-full bg-blue-600 text-white font-bold text-xs shadow-md hover:bg-blue-700 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>Plan My Trip with AI</span>
          </button>
        </section>
      )}

      {/* Travel Hub Quick Actions */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Travel Hub</h3>
          <span className="text-[11px] text-slate-400">Quick Actions</span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={() => onNavigateTab('my-trips')}
            className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-slate-100 shadow-xs text-center active:scale-95 transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5">
              <span className="material-symbols-outlined text-[20px]">fact_check</span>
            </div>
            <span className="text-xs font-bold text-slate-900">Smart Lists</span>
            <span className="text-[10px] text-slate-400">Active gear</span>
          </button>

          <button
            onClick={() => onNavigateTab('shop')}
            className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-slate-100 shadow-xs text-center active:scale-95 transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-1.5">
              <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
            </div>
            <span className="text-xs font-bold text-slate-900">Essentials</span>
            <span className="text-[10px] text-slate-400">Deals & stores</span>
          </button>

          <button
            onClick={() => onNavigateTab('wallet')}
            className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-slate-100 shadow-xs text-center active:scale-95 transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1.5">
              <span className="material-symbols-outlined text-[20px]">badge</span>
            </div>
            <span className="text-xs font-bold text-slate-900">Documents</span>
            <span className="text-[10px] text-slate-400">Offline vault</span>
          </button>
        </div>
      </section>

      {/* Feature Block: Animate images into video with Veo */}
      {onOpenAnimateVideo && (
        <section className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white rounded-3xl p-4 shadow-md border border-white/10 flex items-center justify-between gap-3 overflow-hidden relative group">
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-teal-500/20 to-transparent pointer-events-none" />
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-500 to-teal-400 text-white flex items-center justify-center shadow-md shrink-0">
              <span className="material-symbols-outlined text-[24px]">movie</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-tight text-white truncate">
                  Animate images into video
                </span>
                <span className="px-1.5 py-0.2 rounded-full bg-teal-400 text-teal-950 text-[9px] font-black uppercase">
                  Veo 3.1
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-snug line-clamp-1">
                Upload any travel photo to generate cinematic 16:9 or 9:16 videos
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenAnimateVideo()}
            className="shrink-0 px-3 py-2 rounded-xl bg-white text-slate-950 hover:bg-slate-100 active:scale-95 text-xs font-black flex items-center gap-1 shadow-sm transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px] text-blue-600">movie</span>
            <span>Create</span>
          </button>
        </section>
      )}

      {/* Popular Trending Destinations Powered by Gemini AI based on Current Seasonal Interests */}
      <PopularDestinationsSection
        onPackDestination={onPackCurated}
        onPlanTrip={onPlanTrip}
        onAnimateDestination={onOpenAnimateVideo}
      />

      {/* Curated Inspirations Horizontal Deck */}
      <section className="flex flex-col gap-2 pt-1">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Curated Inspirations</h3>
            <p className="text-[11px] text-slate-400">Pre-built packing decks for trending spots</p>
          </div>
          <button
            onClick={() => onPlanTrip()}
            className="text-xs font-bold text-blue-600 flex items-center hover:underline cursor-pointer"
          >
            <span>See All</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
          {curatedInspirations.map((item) => (
            <div
              key={item.destination}
              onClick={() => onPackCurated(item.tripId || item.destination)}
              className="flex-shrink-0 w-60 bg-white rounded-2xl shadow-xs border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all overflow-hidden flex flex-col cursor-pointer group"
            >
              <div
                className="relative h-28 w-full bg-cover bg-center"
                style={{ backgroundImage: `url('${item.image}')` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-slate-800">
                  {item.theme}
                </span>
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-extrabold shadow-xs">
                  {item.days}D / {item.days - 1}N
                </span>
                <div className="absolute bottom-2 left-2.5 right-2.5 text-white">
                  <span className="text-sm font-bold block leading-none">{item.destination}</span>
                  <span className="text-[10px] text-teal-300 font-semibold">{item.region}</span>
                </div>
              </div>

              <div className="p-2.5 flex items-center justify-between bg-white">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-800">{item.itemCount} Items Ready</span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[110px]">
                    {item.highlights}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPackCurated(item.tripId || item.destination);
                  }}
                  className="px-3 py-1 rounded-full bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-[13px]">backpack</span>
                  <span>Pack {item.destination}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Baggage Load Safety Widget */}
      <section className="bg-slate-100/90 p-3.5 rounded-2xl flex items-center justify-between border border-slate-200/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-xs">
            <span className="material-symbols-outlined text-[20px]">scale</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Estimated Baggage Load</p>
            <p className="text-[11px] text-slate-500">
              {activeTrip
                ? `9.4 kg of 15 kg cabin limit (${activeTrip.destination})`
                : 'No active baggage yet • Configures when you plan a trip'}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-teal-100 text-teal-800">
          {activeTrip ? 'Safe' : 'Ready'}
        </span>
      </section>
    </div>
  );
};
