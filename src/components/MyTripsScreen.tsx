import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTrips } from '../context/TripsContext';
import { Trip } from '../types';

interface MyTripsScreenProps {
  onPlanTrip: () => void;
  onSelectTrip: (trip: Trip) => void;
  onResumePacking: (trip: Trip) => void;
  onOpenAuth: () => void;
}

export const MyTripsScreen: React.FC<MyTripsScreenProps> = ({
  onPlanTrip,
  onSelectTrip,
  onResumePacking,
  onOpenAuth,
}) => {
  const { currentUser } = useAuth();
  const { trips, activeTrip, deleteTrip, toggleFavoriteTrip, toggleFrequentTrip } = useTrips();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'favourites' | 'frequent' | 'past' | 'drafts'>('upcoming');
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter out any temporary preview-only trips from official My Trips view
  const savedTrips = trips.filter((t) => !t.isCuratedPreview);

  const filteredTrips = savedTrips.filter((t) => {
    if (activeTab === 'favourites') return !!t.isFavorite;
    if (activeTab === 'frequent') return !!t.isFrequent;
    if (activeTab === 'upcoming') return t.status === 'active' || t.status === 'planning';
    if (activeTab === 'past') return t.status === 'past';
    return t.status === 'draft';
  });

  const handleDeleteConfirm = async () => {
    if (!tripToDelete) return;
    try {
      setIsDeleting(true);
      await deleteTrip(tripToDelete.id);
      setTripToDelete(null);
    } catch (e) {
      console.error('Failed to delete trip:', e);
    } finally {
      setIsDeleting(false);
    }
  };

  const upcomingCount = savedTrips.filter((t) => t.status === 'active' || t.status === 'planning').length;
  const favCount = savedTrips.filter((t) => t.isFavorite).length;
  const freqCount = savedTrips.filter((t) => t.isFrequent).length;

  return (
    <div className="flex flex-col gap-6 pb-28 pt-20 px-4 sm:px-6 lg:px-8 max-w-6xl xl:max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Top Bar Title & Sub-action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">My Trips</h1>
          <p className="text-xs sm:text-sm text-slate-500">Your upcoming getaways & curated gear lists</p>
        </div>
        <button
          onClick={onPlanTrip}
          aria-label="Plan New Trip"
          className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 active:scale-95 transition-all shadow-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
        </button>
      </div>

      {/* Auth Status Notification Banner if logged out */}
      {!currentUser && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="material-symbols-outlined text-blue-600 text-[20px]">cloud_off</span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-blue-900">Guest Preview Mode</p>
              <p className="text-[11px] text-blue-700 truncate">
                Sign in to sync your trips securely to Firebase.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenAuth}
            className="px-3 py-1.5 rounded-full bg-blue-600 text-white text-xs font-bold shadow-xs whitespace-nowrap active:scale-95 transition-all cursor-pointer"
          >
            Sign In
          </button>
        </div>
      )}

      {/* Segmented Tab Bar */}
      <div className="flex items-center bg-slate-100 p-1 rounded-full w-full overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold text-center whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'upcoming'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Upcoming ({upcomingCount})
        </button>
        <button
          onClick={() => setActiveTab('favourites')}
          className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold text-center whitespace-nowrap transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'favourites'
              ? 'bg-white text-amber-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span className="text-amber-500">★</span>
          <span>Favourites ({favCount})</span>
        </button>
        <button
          onClick={() => setActiveTab('frequent')}
          className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold text-center whitespace-nowrap transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'frequent'
              ? 'bg-white text-teal-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-[14px] text-teal-600">repeat</span>
          <span>Frequent ({freqCount})</span>
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold text-center whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'past'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Past
        </button>
      </div>

      {/* Trip Cards Stack */}
      {filteredTrips.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <span className="material-symbols-outlined text-[26px]">
              {activeTab === 'favourites' ? 'star' : activeTab === 'frequent' ? 'repeat' : 'luggage'}
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">
              {activeTab === 'favourites'
                ? 'No favourite trips yet'
                : activeTab === 'frequent'
                ? 'No frequent trips marked'
                : 'No trips in this tab'}
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              {activeTab === 'favourites'
                ? 'Tap the star icon on any trip card to quickly pin your beloved vacation destinations.'
                : activeTab === 'frequent'
                ? 'Mark recurring travel destinations as frequent for 1-tap packing reload.'
                : 'Plan your next journey with custom packing lists or check curated inspirations.'}
            </p>
          </div>
          <button
            onClick={onPlanTrip}
            className="mt-1 px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            Plan a Trip
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => {
            const total = trip.items?.length || 40;
            const packed = trip.items?.filter((i) => i.status === 'packed').length || 0;
            const remaining = total - packed;
            const pct = total > 0 ? Math.round((packed / total) * 100) : 0;

            return (
              <div
                key={trip.id}
                className="flex flex-col rounded-2xl overflow-hidden bg-white shadow-xs border border-slate-100 transition-all hover:shadow-md"
              >
                {/* Image Banner */}
                <div
                  className="relative w-full h-48 bg-cover bg-center"
                  style={{ backgroundImage: `url('${trip.heroImage}')` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent" />

                  {/* Top Header Actions (Badges, Favorite, Frequent, Delete) */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-xs font-bold text-slate-800 shadow-xs">
                        <span>{trip.tempRange?.includes('-') ? '❄️' : '☀️'}</span>
                        <span>{trip.daysAway} Days Away</span>
                      </span>

                      {trip.isFavorite && (
                        <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-extrabold shadow-xs">
                          <span>★</span>
                          <span>Favourite</span>
                        </span>
                      )}

                      {trip.isFrequent && (
                        <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-teal-500 text-white text-[10px] font-extrabold shadow-xs">
                          <span className="material-symbols-outlined text-[11px]">repeat</span>
                          <span>Frequent</span>
                        </span>
                      )}
                    </div>

                    {/* Action Icon Buttons: Favorite, Frequent, Delete */}
                    <div className="flex items-center gap-1.5">
                      {/* Favorite Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavoriteTrip(trip.id);
                        }}
                        title={trip.isFavorite ? 'Remove from favourites' : 'Mark as favourite destination'}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow-xs ${
                          trip.isFavorite
                            ? 'bg-amber-400 text-amber-950 hover:bg-amber-300'
                            : 'bg-black/40 text-white/90 hover:bg-black/60 hover:text-amber-300'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {trip.isFavorite ? 'star' : 'star_border'}
                        </span>
                      </button>

                      {/* Frequent Destination Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFrequentTrip(trip.id);
                        }}
                        title={trip.isFrequent ? 'Remove frequent tag' : 'Mark as frequent destination (recurring travel)'}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow-xs ${
                          trip.isFrequent
                            ? 'bg-teal-500 text-white hover:bg-teal-400'
                            : 'bg-black/40 text-white/90 hover:bg-black/60 hover:text-teal-300'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[17px]">repeat</span>
                      </button>

                      {/* Delete Trip Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTripToDelete(trip);
                        }}
                        title="Delete trip from history"
                        className="w-8 h-8 rounded-full bg-black/40 text-white/90 hover:bg-rose-600 hover:text-white transition-all cursor-pointer backdrop-blur-md flex items-center justify-center shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[17px]">delete</span>
                      </button>
                    </div>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-base font-extrabold drop-shadow-sm block">
                      {trip.destination}, {trip.region.split(',')[0]}
                    </span>
                    <div className="flex items-center gap-1 text-slate-200 text-xs font-medium mt-0.5">
                      <span className="material-symbols-outlined text-[15px]">calendar_month</span>
                      <span>
                        {trip.datesText} • {trip.durationDays} Days
                      </span>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <span className="material-symbols-outlined text-[18px] text-blue-600">
                          luggage
                        </span>
                        <span>Packing Progress</span>
                      </div>
                      <span className="text-xs font-extrabold text-blue-600">{pct}% Packed</span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span>{packed} of {total} essentials checked</span>
                      <span className="text-amber-700 font-bold">{remaining} remaining</span>
                    </div>
                  </div>

                  {/* Weather hint & tag */}
                  <div className="flex items-center justify-between px-1 text-slate-500 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-blue-600 text-[18px]">
                        {trip.tempRange?.includes('-') ? 'ac_unit' : 'wb_sunny'}
                      </span>
                      <span>{trip.tempRange} expected climate</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                      {trip.tag}
                    </span>
                  </div>

                  {/* Quick Actions Grid */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => onResumePacking(trip)}
                      className="flex-1 flex items-center justify-center gap-1.5 h-11 px-4 rounded-full bg-blue-600 text-white text-xs font-bold shadow-sm hover:bg-blue-700 active:scale-95 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">touch_app</span>
                      <span>Resume Packing</span>
                    </button>
                    <button
                      onClick={() => onSelectTrip(trip)}
                      className="h-11 px-4 rounded-full bg-slate-100 text-blue-600 text-xs font-bold hover:bg-slate-200 active:scale-95 transition-all cursor-pointer"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Luggage Optimization Widget */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-100">
        <div className="w-11 h-11 rounded-2xl bg-white shadow-xs flex items-center justify-center text-blue-600 flex-shrink-0">
          <span className="material-symbols-outlined text-[24px]">flight_takeoff</span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold text-slate-900">Luggage Optimization</span>
          <span className="text-[11px] text-slate-600">
            Your cabin carry-on for {activeTrip?.destination || 'your trip'} is within safe weight limits!
          </span>
        </div>
      </div>

      {/* Plan a New Trip Full-Width CTA */}
      <div className="pt-1">
        <button
          onClick={onPlanTrip}
          className="w-full flex items-center justify-center gap-2 h-12 rounded-full bg-blue-600 text-white font-bold text-xs shadow-md hover:bg-blue-700 active:scale-98 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          <span>Plan a New Trip</span>
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {tripToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-200 border border-slate-100"
            role="alertdialog"
            aria-labelledby="delete-dialog-title"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">delete_forever</span>
              </div>
              <div>
                <h3 id="delete-dialog-title" className="text-base font-extrabold text-slate-900">
                  Delete Trip to {tripToDelete.destination}?
                </h3>
                <p className="text-xs text-slate-500">
                  {tripToDelete.datesText}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              This will remove this trip from your history, along with all checklist packing items, scanned permits, and baggage calculations.
            </p>

            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setTripToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-full border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-full bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 active:scale-95 transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>{isDeleting ? 'Deleting...' : 'Delete Trip'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
