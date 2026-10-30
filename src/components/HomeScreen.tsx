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
  onOpenInstallMobile?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onPlanTrip,
  onPackCurated,
  onResumePacking,
  onOpenDeck,
  onNavigateTab,
  onOpenWalkaround,
  onOpenInstallMobile,
}) => {
  const { currentUser, userProfile } = useAuth();
  const { activeTrip } = useTrips();
  const { climate, refreshClimate } = useUserClimate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAirline, setSelectedAirline] = useState<'indigo' | 'airindia' | 'akasa'>('indigo');

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
    <div className="flex flex-col gap-8 pb-24 md:pb-16 pt-20 px-4 sm:px-6 lg:px-8 max-w-6xl xl:max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Welcome Header with User's Location and Temperature neatly aligned */}
      <section className="flex flex-col gap-2 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: Traveler Greeting */}
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight truncate">
              Hey, {displayName}! <span className="inline-block animate-bounce">👋</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Ready for your next journey? Plan with real-time climate syncing & smart packing.
            </p>
          </div>

          {/* Right: Detected Location & Real-Time Temperature Pills */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Location Pill */}
            <button
              type="button"
              onClick={() => refreshClimate(true)}
              title={`Detected location: ${climate.location} (Click to re-detect)`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-slate-700 text-xs font-semibold shadow-2xs border border-slate-200/80 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px] text-blue-600 shrink-0">near_me</span>
              <span>{climate.location}</span>
            </button>

            {/* Temperature Pill */}
            <button
              type="button"
              onClick={() => refreshClimate(true)}
              title={`Live climate: ${climate.temperatureText} (Click to refresh)`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200/80 shadow-2xs hover:bg-teal-100 active:scale-95 transition-all cursor-pointer"
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

      {/* Action Banners (Tour + Mobile APK) */}
      {(onOpenWalkaround || onOpenInstallMobile) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {onOpenWalkaround && (
            <button
              type="button"
              onClick={onOpenWalkaround}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3.5 rounded-2xl shadow-xs flex items-center justify-between hover:opacity-95 active:scale-98 transition-all cursor-pointer text-left"
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

          {onOpenInstallMobile && (
            <button
              type="button"
              onClick={onOpenInstallMobile}
              className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white p-3.5 rounded-2xl shadow-xs flex items-center justify-between hover:opacity-95 active:scale-98 transition-all cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">phone_android</span>
                </div>
                <div>
                  <p className="text-xs font-extrabold leading-tight">Test on Mobile • Install Android APK</p>
                  <p className="text-[10px] text-white/80 leading-tight">Instant WebAPK install & standalone .apk download</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-white text-[16px]">download</span>
            </button>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TOP DASHBOARD: Trip Planner + Travel Toolkit (Balanced 2-Col on Desktop) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Quick Search & Plan + Active Upcoming Trip */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Quick Search & Plan Action Card */}
          <section className="bg-white p-4 sm:p-5 rounded-3xl shadow-xs border border-slate-100 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <span className="material-symbols-outlined text-[18px]">flight_takeoff</span>
                </div>
                <span className="text-sm font-extrabold text-slate-800">Where are you heading next?</span>
              </div>
              <button
                onClick={() => onNavigateTab('my-trips')}
                className="text-xs font-bold text-blue-600 flex items-center gap-0.5 hover:underline cursor-pointer"
              >
                <span>My Saved Decks</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>

            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onPlanTrip(searchQuery.trim() || undefined);
                }}
                placeholder="Search destination (e.g. Manali, Goa, Ladakh, Kyoto, Munnar)..."
                className="w-full h-12 pl-10 pr-10 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            <button
              onClick={() => onPlanTrip(searchQuery.trim() || undefined)}
              className="w-full h-12 rounded-full bg-blue-600 text-white font-extrabold text-xs shadow-md hover:bg-blue-700 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Plan a New Trip</span>
            </button>
          </section>

          {/* Featured Upcoming Trip Card (if trip exists) or First-Time Journey Card */}
          {activeTrip ? (
            <section className="bg-white rounded-3xl overflow-hidden shadow-xs border border-slate-100 flex flex-col">
              {/* Visual Header */}
              <div
                className="relative h-48 w-full bg-cover bg-center"
                style={{ backgroundImage: `url('${activeTrip.heroImage}')` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent" />
                <div className="absolute top-3 inset-x-3.5 flex items-center justify-between">
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-slate-900 font-bold text-[11px] shadow-xs">
                    <span className="material-symbols-outlined text-[14px] text-blue-600">ac_unit</span>
                    <span>{activeTrip.tag}</span>
                  </span>
                  <span className="px-3 py-1 rounded-full bg-blue-600 text-white font-bold text-[11px] shadow-xs">
                    {activeTrip.daysAway} Days to Go
                  </span>
                </div>

                <div className="absolute bottom-3 left-3.5 right-3.5 text-white">
                  <span className="text-[11px] text-teal-300 font-bold block">
                    {activeTrip.region}
                  </span>
                  <h2 className="text-2xl font-extrabold tracking-tight drop-shadow-sm text-white">
                    {activeTrip.destination} Getaway
                  </h2>
                </div>
              </div>

              {/* Details & Packing Progress */}
              <div className="p-4 sm:p-5 flex flex-col gap-3.5">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-blue-600">
                      calendar_month
                    </span>
                    <span className="text-slate-800 font-semibold">{activeTrip.datesText}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px]">
                    {activeTrip.durationNights}N / {activeTrip.durationDays}D
                  </span>
                </div>

                {/* Circular Gauge + Bar */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="relative w-9 h-9 flex items-center justify-center">
                        <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
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
                        <p className="text-xs font-bold text-slate-900">Packing Readiness</p>
                        <p className="text-[11px] text-slate-500">
                          {packedCount} of {totalItems} items packed into luggage
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                      {toBuyCount} To Buy
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${packedPct}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2.5 pt-1">
                  <button
                    onClick={onResumePacking}
                    className="flex-1 h-12 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:bg-blue-700 active:scale-98 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">touch_app</span>
                    <span>Resume Packing (Swipe Mode)</span>
                  </button>
                  <button
                    onClick={onOpenDeck}
                    className="px-5 h-12 rounded-full bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 active:scale-98 transition-all cursor-pointer"
                  >
                    View Deck
                  </button>
                </div>
              </div>
            </section>
          ) : (
            /* First-Time Visitor Friendly Hero Card */
            <section className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 flex flex-col items-center text-center gap-3.5">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[36px]">luggage</span>
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Start Your First Packing Deck</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
                  Plan your domestic or international journey. Gemini AI generates climate-safe clothing layers, medicines, and baggage guidelines.
                </p>
              </div>
              <button
                onClick={() => onPlanTrip()}
                className="w-full max-w-xs h-12 rounded-full bg-blue-600 text-white font-extrabold text-xs shadow-md hover:bg-blue-700 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>Plan My Trip with AI</span>
              </button>
            </section>
          )}
        </div>

        {/* Right Column: Climate Radar, Airline Baggage Checker & Travel Hub */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Weather Alert & Climate Radar Banner */}
          <section className="bg-amber-50/90 border border-amber-200/90 p-4 sm:p-5 rounded-3xl shadow-xs flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[22px]">
                {activeTrip ? 'severe_cold' : 'wb_sunny'}
              </span>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900">
                  {activeTrip ? `Climate Alert • ${activeTrip.destination}` : 'Live Weather Radar'}
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 shrink-0">
                  {activeTrip?.tempRange || 'Radar Active'}
                </span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed mt-1">
                {activeTrip
                  ? `Sub-zero nights expected for ${activeTrip.destination}. Thermal base layers & touch-screen snow gloves recommended.`
                  : 'TripSwipe auto-detects destination temperatures, rainfall, and airline baggage limits before you depart.'}
              </p>
            </div>
          </section>

          {/* Airline Baggage Load & Cabin Limits Guide */}
          <section className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-100 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">scale</span>
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900">Airline Baggage Limits</p>
                  <p className="text-[10px] text-slate-400">Domestic Indian Carrier Rules</p>
                </div>
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800">
                Verified
              </span>
            </div>

            {/* Airline Toggle Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
              {(['indigo', 'airindia', 'akasa'] as const).map((al) => (
                <button
                  key={al}
                  type="button"
                  onClick={() => setSelectedAirline(al)}
                  className={`py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    selectedAirline === al
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {al === 'indigo' ? 'IndiGo' : al === 'airindia' ? 'Air India' : 'Akasa Air'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cabin Bag</span>
                <span className="text-sm font-black text-blue-600">7.0 kg max</span>
                <span className="text-[10px] text-slate-500">1 standard laptop / backpack</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Check-in</span>
                <span className="text-sm font-black text-slate-800">
                  {selectedAirline === 'airindia' ? '15–20 kg' : '15.0 kg'}
                </span>
                <span className="text-[10px] text-slate-500">1 piece standard trolley</span>
              </div>
            </div>
          </section>

          {/* Travel Hub Quick Shortcuts */}
          <section className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-100 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Travel Hub Shortcuts
              </h3>
              <span className="text-[10px] text-slate-400">Quick Access</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onNavigateTab('my-trips')}
                className="flex flex-col items-center justify-center p-3 bg-slate-50 hover:bg-blue-50/60 rounded-2xl border border-slate-100 text-center active:scale-95 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center mb-1 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[20px]">fact_check</span>
                </div>
                <span className="text-xs font-bold text-slate-900">My Trips</span>
                <span className="text-[10px] text-slate-400">All decks</span>
              </button>

              <button
                onClick={() => onNavigateTab('shop')}
                className="flex flex-col items-center justify-center p-3 bg-slate-50 hover:bg-teal-50/60 rounded-2xl border border-slate-100 text-center active:scale-95 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-100/70 text-teal-600 flex items-center justify-center mb-1 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                </div>
                <span className="text-xs font-bold text-slate-900">Gear Store</span>
                <span className="text-[10px] text-slate-400">Top deals</span>
              </button>

              <button
                onClick={() => onNavigateTab('wallet')}
                className="flex flex-col items-center justify-center p-3 bg-slate-50 hover:bg-indigo-50/60 rounded-2xl border border-slate-100 text-center active:scale-95 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-100/70 text-indigo-600 flex items-center justify-center mb-1 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[20px]">badge</span>
                </div>
                <span className="text-xs font-bold text-slate-900">Wallet</span>
                <span className="text-[10px] text-slate-400">Passes</span>
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 2: FULL-WIDTH POPULAR TRENDING DESTINATIONS SHOWCASE */}
      {/* ========================================================= */}
      <PopularDestinationsSection
        onPackDestination={onPackCurated}
        onPlanTrip={onPlanTrip}
      />

      {/* ========================================================= */}
      {/* SECTION 3: FULL-WIDTH CURATED INSPIRATIONS (8 COMPLETE DESTINATIONS) */}
      {/* ========================================================= */}
      <section className="flex flex-col gap-4 pt-4 border-t border-slate-200/60">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="material-symbols-outlined text-[16px] text-blue-600">travel_explore</span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">
                Turnkey Ready Decks
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Curated Inspirations
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Hand-crafted packing decks with complete climate-calibrated gear checklists ({curatedInspirations.length} Destinations)
            </p>
          </div>

          <button
            onClick={() => onPlanTrip()}
            className="self-start sm:self-auto text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline cursor-pointer bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100"
          >
            <span>Plan Custom Trip</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          </button>
        </div>

        {/* 4-Column Responsive Grid on Desktop filling the entire width */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-1">
          {curatedInspirations.map((item) => (
            <div
              key={item.destination}
              onClick={() => onPackCurated(item.tripId || item.destination)}
              className="bg-white rounded-3xl shadow-xs border border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col cursor-pointer group h-full"
            >
              {/* High-res Hero Image Frame */}
              <div
                className="relative h-48 sm:h-52 w-full bg-cover bg-center overflow-hidden"
                style={{ backgroundImage: `url('${item.image}')` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent group-hover:scale-105 transition-transform duration-700" />
                
                {/* Top Floating Badges */}
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-black text-slate-800 shadow-xs">
                  {item.theme}
                </span>
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-blue-600 text-white text-[10px] font-extrabold shadow-xs">
                  {item.days}D / {item.days - 1}N
                </span>

                {/* Bottom Overlay Destination Name */}
                <div className="absolute bottom-3 left-3.5 right-3.5 text-white">
                  <h3 className="text-xl font-black text-white leading-tight drop-shadow-md">
                    {item.destination}
                  </h3>
                  <span className="text-xs text-teal-300 font-semibold block mt-0.5">
                    {item.region}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex flex-col gap-3 flex-1 justify-between bg-white">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-teal-600">checklist</span>
                      <span>{item.itemCount} Items Ready</span>
                    </span>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      Climate Matched
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                    {item.highlights}
                  </p>
                </div>

                {/* 1-Tap Pack Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPackCurated(item.tripId || item.destination);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">backpack</span>
                  <span>Pack {item.destination}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
