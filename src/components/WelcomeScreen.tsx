import React from 'react';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onOpenAuth: () => void;
  onMyTrips: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onGetStarted,
  onOpenAuth,
  onMyTrips,
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9ff] px-4 pt-safe pb-safe max-w-md mx-auto">
      {/* Brand Header */}
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs flex-shrink-0">
            <span className="material-symbols-outlined text-[20px] text-white">luggage</span>
          </div>
          <span className="text-xl font-extrabold text-slate-900 tracking-tight">
            Trip<span className="text-blue-600">Swipe</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 shadow-xs border border-slate-200/60">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-wider">India Edition</span>
        </div>
      </div>

      {/* Hero Visual Frame with Badges */}
      <div className="relative w-full mt-2 rounded-2xl overflow-hidden bg-slate-100 shadow-sm border border-slate-200/60">
        <div className="relative w-full h-52 bg-slate-200">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0r_pgIDRdXlMSupDQNOeeaOI7GQ4iYHerhmVWcGiKq1UKBrSHsuNvJXfDBAzykMp-X9RB4gX0d1hhu3VWfA_bPigVwW3WZXumBCHwsgvDaN3HxK6Cd-18wub2Q3jNffpS0nbRxqfAJhsVFOfZgLgpFDnFA7QdcdOaRZysGRyKoV4DzEYOLBovtbb_bqny9n3LB-quqXiE8s1vzPeoYH4LeFPdBwfC4sN6GqeekiQYmFn_d6fw8TS1xQ"
            alt="Curated travel essentials"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/10 to-transparent" />
        </div>

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md shadow-sm border border-slate-100">
          <span className="material-symbols-outlined text-[15px] text-amber-600">wb_sunny</span>
          <span className="text-xs font-bold text-slate-800">Weather Synced</span>
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-100/90 text-teal-800 backdrop-blur-md shadow-sm border border-teal-200/60">
          <span className="material-symbols-outlined text-[15px] text-teal-700">verified</span>
          <span className="text-xs font-bold tracking-tight">Deals Verified</span>
        </div>

        {/* Micro-Stat Strip */}
        <div className="p-3.5 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined text-[18px]">travel_explore</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-slate-500 font-medium">Trending Getaways</span>
              <span className="text-sm font-bold text-slate-900 leading-none">
                Goa, Manali & Jaipur
              </span>
            </div>
          </div>
          <button
            onClick={onMyTrips}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer"
          >
            <span>Explore Decks</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Hero Typography */}
      <div className="mt-5 flex flex-col gap-1 text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold w-fit mb-1 border border-blue-100 shadow-xs">
          <span>Hey, Traveller! 👋</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Pack Smart.<br />
          <span className="text-blue-600">Travel Ready.</span>
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed mt-1">
          Your AI-powered travel companion for effortless packing and stress-free adventures.
        </p>
      </div>

      {/* 3 Benefit Highlight Cards */}
      <div className="flex flex-col gap-2.5 mt-5">
        <div className="p-3.5 rounded-2xl bg-white shadow-xs border border-slate-100 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex-shrink-0 flex items-center justify-center text-blue-600">
            <span className="material-symbols-outlined text-[22px]">checklist</span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Tailored Packing Lists</h2>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                AI Driven
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 leading-snug">
              Customized precisely to your destination, monsoon or mountain forecast, and planned activities.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white shadow-xs border border-slate-100 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex-shrink-0 flex items-center justify-center text-teal-600">
            <span className="material-symbols-outlined text-[22px]">local_mall</span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Shop Missing Essentials</h2>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                Best Price
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 leading-snug">
              Direct 1-tap price comparison across Amazon India, Myntra, and Flipkart before departure.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white shadow-xs border border-slate-100 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex-shrink-0 flex items-center justify-center text-indigo-600">
            <span className="material-symbols-outlined text-[22px]">folder_shared</span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Organized Travel Vault</h2>
              <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                Offline OK
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 leading-snug">
              Encrypted local vault for train PNRs, flight boardings, stay vouchers, and driver permits.
            </p>
          </div>
        </div>
      </div>

      {/* Primary & Secondary Actions */}
      <div className="flex flex-col gap-2.5 mt-6">
        <button
          onClick={onGetStarted}
          className="w-full h-12 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-blue-700 active:scale-98 transition-all"
        >
          <span>Plan My Trip</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>

        <div className="flex gap-2">
          <button
            onClick={onMyTrips}
            className="flex-1 h-11 rounded-full bg-white border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 active:scale-98 transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px] text-blue-600">luggage</span>
            <span>My Trips</span>
          </button>
          <button
            onClick={onOpenAuth}
            className="flex-1 h-11 rounded-full bg-slate-100 text-blue-600 font-bold text-xs flex items-center justify-center hover:bg-slate-200 active:scale-98 transition-all"
          >
            <span>Sign In / Sign Up</span>
          </button>
        </div>
      </div>

      {/* Footnote */}
      <div className="mt-auto pt-6 pb-2 flex items-center justify-center gap-1.5 text-center">
        <span className="material-symbols-outlined text-[15px] text-amber-500">favorite</span>
        <p className="text-[11px] text-slate-500">
          Designed for Indian travellers across hill stations, beaches & global escapes.
        </p>
      </div>
    </div>
  );
};
