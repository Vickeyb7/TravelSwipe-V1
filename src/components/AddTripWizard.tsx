import React, { useState, useEffect } from 'react';
import { Trip, PackingItem } from '../types';
import { useTrips } from '../context/TripsContext';
import { useAuth } from '../context/AuthContext';

interface AddTripWizardProps {
  onClose: () => void;
  onTripCreated: (trip: Trip) => void;
  onOpenAuth: () => void;
  initialDestination?: string;
}

export const AddTripWizard: React.FC<AddTripWizardProps> = ({
  onClose,
  onTripCreated,
  onOpenAuth,
  initialDestination,
}) => {
  const { createTrip } = useTrips();
  const { currentUser, userProfile } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Dynamic initial destination & theme
  const initDest = (initialDestination || 'Goa, India').trim();
  const isGoa = initDest.toLowerCase().includes('goa');
  const isJaipur = initDest.toLowerCase().includes('jaipur');
  const isParis = initDest.toLowerCase().includes('paris');
  const isLadakh = initDest.toLowerCase().includes('ladakh');

  // Step 1: Trip Base Details
  const [destination, setDestination] = useState(initDest);
  const [startDate, setStartDate] = useState(
    isGoa ? '2027-01-24' : isJaipur ? '2027-02-14' : isParis ? '2027-04-10' : '2026-12-12'
  );
  const [endDate, setEndDate] = useState(
    isGoa ? '2027-01-28' : isJaipur ? '2027-02-17' : isParis ? '2027-04-16' : '2026-12-17'
  );
  const [travelersCount, setTravelersCount] = useState<number>(2);
  const [partyType, setPartyType] = useState<'solo' | 'couple' | 'family' | 'group'>('couple');
  const [purposes, setPurposes] = useState<string[]>(
    isGoa ? ['Beach Holiday', 'Vacation'] : isJaipur ? ['Vacation'] : ['Vacation', 'Adventure']
  );

  // Step 2: Personalize
  const [activities, setActivities] = useState<string[]>(
    isGoa
      ? ['Beach hopping', 'Sunset shacks', 'Water sports', 'Scooter rides']
      : isJaipur
      ? ['Fort visits', 'Bazaar shopping', 'Heritage dining', 'Photography']
      : ['Snow Hikes', 'Cafes & Markets', 'Extreme Sports', 'Bonfire Evenings']
  );
  const [style, setStyle] = useState(
    userProfile?.packingStyle ? userProfile.packingStyle.split('(')[0].trim() : 'Casual & Warm'
  );
  const [luggage, setLuggage] = useState(
    userProfile?.luggageDefault || 'Cabin Luggage (7kg) + Aeroplane Check-in Luggage (15–20kg)'
  );
  const [budget, setBudget] = useState(userProfile?.defaultBudget || 'Decathlon / Puma (₹₹)');
  const [hasTechKit, setHasTechKit] = useState(true);

  // Step 3: Loading States
  const [loadingProgress, setLoadingProgress] = useState(15);
  const [loadingStepStatus, setLoadingStepStatus] = useState<string>(
    'Verifying climate indices...'
  );

  // Calculate duration
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.max(0, end.getTime() - start.getTime());
  const diffDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
  const diffNights = Math.max(1, diffDays - 1);

  // Quick chips
  const quickDestinations = [
    'Paris, France',
    'Manali, Himachal Pradesh, India',
    'Goa, India',
    'Jaipur, Rajasthan',
    'Ladakh, India',
    'Dubai, UAE',
    'Bali, Indonesia',
  ];

  // Dynamic destination image & climate preview
  const getDestinationPreview = (dest: string) => {
    const d = dest.toLowerCase();
    if (d.includes('paris')) {
      return {
        image:
          'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80',
        tag: 'European Autumn / Winter',
        temp: '4°C / 11°C',
        title: 'Eiffel Tower & Seine',
      };
    }
    if (d.includes('goa')) {
      return {
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuD5fPefNvxwy5tOUHhuNFxWFP-4uSWHB9CMCzXbN19_QA_XRnHt701md0JmGUQ24FVVwN5Uzx6B12aUKrRAcyYrNCGBf8LGuYwGs-j0HlpSqQDXFSK2ccgrmwVrexP7DgDieU1xf7w0exIzPBc6XthdRp7x0OgWoOn7gtmP7hmzxUHg5gYmL0X_6wTfaKKonAJgiJaAjwmV5hMM6YahDix7Nf-IQZpv3Fm_L-jJoSC6hg_djlHSy2QkmA',
        tag: 'Coastal Breeze',
        temp: '24°C / 32°C',
        title: 'Morjim & Anjuna Beaches',
      };
    }
    if (d.includes('jaipur')) {
      return {
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDcfszlFr0RIWqHwFOl4Slea-FLW534_Wx1OBHOHLyeDPPn0T5P7msW49C2mqvOEI2WVjqSjbuAhZPhuWwegkmbOZcgnotPc5AP3M3lv9DXwijW6wYp1VN2yCZ4kU5ceZQsAzggHKbKSjclj1xMOnlXPLtE9porGFCpVuzPRreImBa0A2vL5cuolHAGdqlbbdxFPdCL86qUqXsqkSbfjwAEQApR6AP_-QUXaj4I169MwFKrdAmxFbfqvg',
        tag: 'Royal Heritage',
        temp: '12°C / 26°C',
        title: 'Hawa Mahal & Amer Fort',
      };
    }
    if (d.includes('ladakh')) {
      return {
        image:
          'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1000&q=80',
        tag: 'High Altitude Pass',
        temp: '-10°C / 2°C',
        title: 'Pangong Tso & Khardung La',
      };
    }
    // Default Manali
    return {
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCBwl_fiHSQi-D-UdH2On9b0dbpHIqA71kkh70V9bq67QKKWKhga7Ae76J45gytUFmQCMilXWW5e0diPc2buUJR2n8-safH3O3iDBj-s5N1xjoLi-o_v2ytd2uBK1gN4x2qMd6VNC29DJHptdHKADQdWNhebay75977bqBzFoITTWjH-aunDfU6uQKBxHu3NAKjhXMFuRUac6e3aTn9yzGfUc7Aoq4F9h5mNngBkl7LdWZ5b7-CWMPscw',
      tag: 'Winter Escapade',
      temp: '-2°C / 8°C',
      title: 'Solang Valley & Rohtang',
    };
  };

  const preview = getDestinationPreview(destination);

  // Sync party type and travelers count
  const handleSelectParty = (type: 'solo' | 'couple' | 'family' | 'group') => {
    setPartyType(type);
    if (type === 'solo') setTravelersCount(1);
    if (type === 'couple') setTravelersCount(2);
    if (type === 'family') setTravelersCount(3);
    if (type === 'group') setTravelersCount(5);
  };

  const handleTravelersCountChange = (val: number) => {
    const n = Math.max(1, Math.min(50, val));
    setTravelersCount(n);
    if (n === 1) setPartyType('solo');
    else if (n === 2) setPartyType('couple');
    else if (n <= 4) setPartyType('family');
    else setPartyType('group');
  };

  const togglePurpose = (p: string) => {
    if (purposes.includes(p)) {
      if (purposes.length > 1) {
        setPurposes(purposes.filter((item) => item !== p));
      }
    } else {
      setPurposes([...purposes, p]);
    }
  };

  const toggleActivity = (a: string) => {
    if (activities.includes(a)) {
      setActivities(activities.filter((item) => item !== a));
    } else {
      setActivities([...activities, a]);
    }
  };

  // Run AI generation on Step 3
  useEffect(() => {
    if (step !== 3) return;

    let isMounted = true;
    const runGeneration = async () => {
      // Animation ticks
      const timer1 = setTimeout(() => {
        if (isMounted) {
          setLoadingProgress(45);
          setLoadingStepStatus('Analyzing climate & mountain forecasts...');
        }
      }, 700);

      const timer2 = setTimeout(() => {
        if (isMounted) {
          setLoadingProgress(75);
          setLoadingStepStatus('Personalizing layering & luggage capacity...');
        }
      }, 1500);

      try {
        const payload = {
          destination,
          startDate,
          endDate,
          durationDays: diffDays,
          party: `${partyType} (${travelersCount} Travelers)`,
          purposes,
          activities,
          style,
          luggage,
          budget,
          hasTechKit,
        };

        const response = await fetch('/api/generate-packing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (isMounted) {
          setLoadingProgress(100);
          setLoadingStepStatus('Curated packing deck ready!');
        }

        setTimeout(async () => {
          if (!isMounted) return;

          const createdItems: PackingItem[] = (data.items || []).map((it: any) => ({
            id: it.id || `item-${Math.random().toString(36).substring(7)}`,
            name: it.name,
            category: it.category || 'Clothing & Layers',
            recommendedQty: it.recommendedQty || '1 unit',
            weightKg: it.weightKg || 0.4,
            reason: it.reason || `Tailored for ${destination}.`,
            status: it.initialStatus || 'to_buy',
            priority: it.priority || 'essential',
            subZeroOrSpecial: it.subZeroOrSpecial || false,
            characteristics: it.characteristics || [
              `Specially curated for ${diffDays}-day ${destination} journey`,
              'Modular packing design to avoid overpacking',
            ],
            retailerOptions: it.shoppingRecommendation
              ? [
                  {
                    retailer: it.shoppingRecommendation.retailer || 'Amazon India',
                    title: it.shoppingRecommendation.title || it.name,
                    price: it.shoppingRecommendation.approxPriceINR || 999,
                    originalPrice: (it.shoppingRecommendation.approxPriceINR || 999) * 1.4,
                    discountPct: 30,
                    rating: 4.4,
                    reviewCount: '1.2k',
                    deliveryTime: 'Fast Delivery',
                    colorOrStyle: 'Standard',
                    material: 'Weather resistant',
                    specPill: it.shoppingRecommendation.perk || 'Top Pick',
                    checkoutUrl: 'https://amazon.in',
                    imageUrl: preview.image,
                    isBestValue: true,
                  },
                ]
              : undefined,
          }));

          const newTrip: Omit<Trip, 'id'> = {
            destination: destination.split(',')[0],
            region: destination,
            datesText: `${startDate} – ${endDate}`,
            startDate,
            endDate,
            durationNights: diffNights,
            durationDays: diffDays,
            daysAway: Math.max(1, Math.round((start.getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
            party: partyType,
            partyLabel: `${partyType.toUpperCase()} • ${travelersCount} Traveler${
              travelersCount > 1 ? 's' : ''
            }`,
            purposes,
            activities,
            style,
            luggageType: luggage,
            budgetTier: budget,
            hasTechKit,
            heroImage: preview.image,
            scenicImage: preview.image,
            tag: preview.tag,
            tempRange: data.weatherExpected || preview.temp,
            climateTitle: data.climateBadge || 'Climate Benchmark',
            climateNote: data.destinationSummary || 'Personalized AI travel plan.',
            packingRules: ['Layered wear', 'Safe footwear', 'Activity gear'],
            status: 'active',
            items: createdItems,
            documents: [],
          };

          if (currentUser) {
            const saved = await createTrip(newTrip);
            onTripCreated(saved);
          } else {
            // Guest mode: create with random ID
            const guestTrip: Trip = {
              ...newTrip,
              id: `guest-trip-${Date.now()}`,
            };
            onTripCreated(guestTrip);
          }
        }, 800);
      } catch (err) {
        console.error('Trip generation error:', err);
      }
    };

    runGeneration();

    return () => {
      isMounted = false;
    };
  }, [step]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#f9f9ff] flex flex-col max-w-md mx-auto">
      {/* Wizard Header Bar */}
      <header className="sticky top-0 z-20 pt-safe bg-[#f9f9ff]/95 backdrop-blur-md border-b border-slate-200/60 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (step === 2) setStep(1);
              else if (step === 1) onClose();
            }}
            aria-label="Back"
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
          </button>
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <span className="material-symbols-outlined text-[18px]">add_location_alt</span>
          </div>
          <h1 className="text-base font-bold text-slate-900">
            {step === 1 ? 'Trip Details' : step === 2 ? 'Personalize Pack' : 'Generating'}
          </h1>
        </div>

        <button
          onClick={onClose}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg"
        >
          Cancel
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-4 py-4 pb-12 flex flex-col">
        {/* STEP 1: TRIP DETAILS */}
        {step === 1 && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            {/* Step Indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-7 h-2 rounded-full bg-blue-600" />
                <span className="w-2.5 h-2 rounded-full bg-slate-200" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Step 1 of 2: Trip Details
              </span>
            </div>

            {/* Title */}
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Where & when are you travelling?
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Set up your destination, dates, and travelers so TripSwipe can calculate optimal weather layers.
              </p>
            </div>

            {/* Destination Input & Quick Chips */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700">Destination</label>
              <div className="relative flex items-center bg-white rounded-2xl shadow-xs border border-slate-200 px-3.5 py-3 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <span className="material-symbols-outlined text-blue-600 text-[22px] mr-2.5">
                  location_on
                </span>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Paris, France or Manali, India"
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 pr-7"
                />
                {destination && (
                  <button
                    type="button"
                    onClick={() => setDestination('')}
                    className="absolute right-3 w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
                  >
                    <span className="material-symbols-outlined text-[15px]">close</span>
                  </button>
                )}
              </div>

              {/* Quick Destination Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase mr-0.5">Quick:</span>
                {quickDestinations.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setDestination(city)}
                    className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium whitespace-nowrap active:scale-95 transition-all"
                  >
                    {city.split(',')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Destination Scenic Highlight Card */}
            <div className="relative w-full rounded-2xl overflow-hidden shadow-sm bg-slate-100">
              <div
                className="w-full h-28 bg-cover bg-center relative"
                style={{ backgroundImage: `url('${preview.image}')` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-end justify-between text-white">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-600/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-white">
                      {preview.tag}
                    </span>
                    <p className="text-base font-bold text-white mt-1 drop-shadow-sm">
                      {preview.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg text-white font-bold text-xs">
                    <span className="material-symbols-outlined text-[16px]">device_thermostat</span>
                    <span>{preview.temp}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dates & Schedule with Calendar Pickers */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Dates & Schedule</span>
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
                  <span className="material-symbols-outlined text-[15px]">schedule</span>
                  <span>
                    {diffNights} Night{diffNights > 1 ? 's' : ''} • {diffDays} Day{diffDays > 1 ? 's' : ''}
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col bg-white rounded-2xl p-3 border border-slate-200 shadow-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                    <span className="material-symbols-outlined text-[18px] text-blue-600">
                      flight_takeoff
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider">Departure</span>
                  </div>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-transparent font-bold text-slate-900 text-sm outline-none cursor-pointer"
                  />
                </div>

                <div className="flex flex-col bg-white rounded-2xl p-3 border border-slate-200 shadow-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                    <span className="material-symbols-outlined text-[18px] text-teal-600">
                      flight_land
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider">Return</span>
                  </div>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-transparent font-bold text-slate-900 text-sm outline-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Number of Travelers Input & Party Cards */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Number of Travelers</span>
                <span className="text-xs text-blue-600 font-semibold">Baggage specs adapt automatically</span>
              </div>

              {/* Simple Input for Number of Travelers */}
              <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">group</span>
                </div>
                <div className="flex-1">
                  <label htmlFor="travelers-count-input" className="text-xs text-slate-500 font-medium block">Total Travelers</label>
                  <input
                    id="travelers-count-input"
                    type="number"
                    min={1}
                    max={50}
                    value={travelersCount}
                    onChange={(e) => handleTravelersCountChange(parseInt(e.target.value) || 1)}
                    className="text-base font-bold text-slate-900 outline-none w-20"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleTravelersCountChange(travelersCount - 1)}
                    disabled={travelersCount <= 1}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 font-bold disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="text-sm font-bold text-slate-900 px-1">{travelersCount}</span>
                  <button
                    type="button"
                    onClick={() => handleTravelersCountChange(travelersCount + 1)}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Party Presets Grid */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'solo', label: 'Solo', countDesc: '1 Traveler', icon: 'person' },
                  { id: 'couple', label: 'Couple', countDesc: '2 Travelers', icon: 'favorite' },
                  { id: 'family', label: 'Family', countDesc: '3–4 Travelers', icon: 'family_restroom' },
                  { id: 'group', label: 'Group', countDesc: '5+ Travelers', icon: 'groups' },
                ].map((p) => {
                  const isSelected = partyType === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectParty(p.id as any)}
                      className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">{p.icon}</span>
                        </div>
                        <div>
                          <p className="text-xs font-bold leading-tight">{p.label}</p>
                          <p
                            className={`text-[11px] leading-tight ${
                              isSelected ? 'text-blue-100' : 'text-slate-400'
                            }`}
                          >
                            {p.countDesc}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trip Purpose & Vibes */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Trip Purpose & Vibes</span>
                <span className="text-[11px] text-slate-400">Select multiple</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'Vacation', desc: 'Leisure & sightseeing', icon: 'luggage' },
                  { id: 'Adventure', desc: 'Trekking & sports', icon: 'hiking' },
                  { id: 'Business', desc: 'Work & meetings', icon: 'business_center' },
                  { id: 'Beach Holiday', desc: 'Sun, surf & chill', icon: 'beach_access' },
                ].map((item) => {
                  const isSel = purposes.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => togglePurpose(item.id)}
                      className={`flex flex-col justify-between p-3.5 rounded-2xl border text-left transition-all ${
                        isSel
                          ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            isSel ? 'bg-white text-blue-600 shadow-xs' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                        </div>
                        <span
                          className={`material-symbols-outlined text-[18px] ${
                            isSel ? 'text-blue-600' : 'text-slate-300'
                          }`}
                        >
                          {isSel ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-bold block">{item.id}</span>
                        <span className="text-[11px] text-slate-500 leading-tight block">
                          {item.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Auto Weather Sync Teaser */}
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-teal-50 border border-teal-200/60 text-slate-800">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[18px]">ac_unit</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-teal-900">Auto-Weather Sync Active</span>
                <p className="text-xs text-teal-800 leading-snug mt-0.5">
                  TripSwipe connects with Gemini to evaluate expected weather and temperature drops in {destination.split(',')[0]}.
                </p>
              </div>
            </div>

            {/* Continue Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full h-12 rounded-full bg-blue-600 text-white font-bold text-sm shadow-md hover:bg-blue-700 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <span>Continue to Preferences</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PERSONALIZE RECOMMENDATIONS */}
        {step === 2 && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            {/* Step Indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2 rounded-full bg-slate-200" />
                <span className="w-7 h-2 rounded-full bg-blue-600" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Step 2 of 2: Personalize
              </span>
            </div>

            {/* Header snippet */}
            <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-blue-900 block">{destination.split(',')[0]}</span>
                <span className="text-[11px] text-blue-700">{diffDays} Days • {preview.temp}</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-white text-blue-600 font-bold text-xs shadow-xs">
                {travelersCount} Traveler{travelersCount > 1 ? 's' : ''}
              </span>
            </div>

            {/* Activities & Outings Multi-select */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Activities & Outings</span>
                <span className="text-[11px] text-slate-400">Multi-select</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'Snow Hikes', sub: 'Crampons & poles', icon: 'hiking' },
                  { id: 'Cafes & Markets', sub: 'Local street vibe', icon: 'local_cafe' },
                  { id: 'Extreme Sports', sub: 'Skiing / Gliding', icon: 'snowboarding' },
                  { id: 'Bonfire Evenings', sub: 'Heavy insulated gear', icon: 'fireplace' },
                  { id: 'Vashisht Springs', sub: 'Quick-dry towels', icon: 'hot_tub' },
                  { id: 'Nightlife / Clubs', sub: 'Evening jackets', icon: 'nightlife' },
                ].map((act) => {
                  const isSel = activities.includes(act.id);
                  return (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => toggleActivity(act.id)}
                      className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                        isSel
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{act.icon}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate leading-tight">{act.id}</p>
                        <p
                          className={`text-[10px] truncate leading-tight ${
                            isSel ? 'text-blue-100' : 'text-slate-400'
                          }`}
                        >
                          {act.sub}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Style & Layering (Single Choice) */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Style & Layering</span>
                <span className="text-[11px] text-slate-400">Pick one</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    id: 'Casual & Warm',
                    desc: 'Fleece, thermals & sturdy boots',
                    icon: 'dry_cleaning',
                  },
                  {
                    id: 'Ultra Cozy',
                    desc: 'Heavy joggers, oversized hoodies',
                    icon: 'airline_seat_recline_extra',
                  },
                  {
                    id: 'Aesthetic Gram',
                    desc: 'Trench coats & knitwear',
                    icon: 'auto_awesome',
                  },
                  {
                    id: 'Ultralight',
                    desc: 'Merino wool capsule wardrobe',
                    icon: 'compress',
                  },
                ].map((s) => {
                  const isSel = style === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStyle(s.id)}
                      className={`flex flex-col justify-between p-3 rounded-2xl border text-left transition-all ${
                        isSel
                          ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="material-symbols-outlined text-[20px] text-blue-600">
                          {s.icon}
                        </span>
                        <span
                          className={`material-symbols-outlined text-[18px] ${
                            isSel ? 'text-blue-600' : 'text-slate-300'
                          }`}
                        >
                          {isSel ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-bold block">{s.id}</span>
                        <span className="text-[10px] text-slate-500 leading-tight block">
                          {s.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Luggage Capacity */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-800">Luggage Capacity</span>
              <div className="flex flex-col gap-2">
                {[
                  {
                    id: 'Cabin Luggage (7kg) + Aeroplane Check-in Luggage (15–20kg)',
                    tag: 'Flight Combo',
                    desc: '7kg overhead trolley + 15–20kg checked suitcase (Recommended for flights)',
                    icon: 'luggage',
                  },
                  {
                    id: 'Cabin Trolley (7–10kg)',
                    tag: 'Fast Travel',
                    desc: 'Overhead compartment only, compact gear',
                    icon: 'flight_takeoff',
                  },
                  {
                    id: 'Checked Luggage (15–20kg)',
                    tag: 'Spacious',
                    desc: 'Large suitcase with room for warm layers & liquids',
                    icon: 'business_center',
                  },
                  {
                    id: 'Backpack (50–65L) + 7kg Daypack',
                    tag: 'Adventure',
                    desc: 'Ideal for stairs, steep hills & snowy terrain',
                    icon: 'backpack',
                  },
                  {
                    id: 'International Long-Haul (2x 23kg + Cabin)',
                    tag: 'Overseas',
                    desc: 'Heavy international flight allowance',
                    icon: 'flight',
                  },
                ].map((lug) => {
                  const isSel = luggage === lug.id;
                  return (
                    <button
                      key={lug.id}
                      type="button"
                      onClick={() => setLuggage(lug.id)}
                      className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                        isSel
                          ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            isSel ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[20px]">{lug.icon}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold">{lug.id}</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                              {lug.tag}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500">{lug.desc}</span>
                        </div>
                      </div>
                      {isSel && (
                        <span className="material-symbols-outlined text-[18px] text-blue-600">
                          check_circle
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Missing Gear Budget Tier */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-800">Missing Gear Budget</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Value Finds (₹)', title: 'Value Finds', sub: 'Local rental', symbol: '₹' },
                  { id: 'Decathlon / Puma (₹₹)', title: 'Decathlon', sub: 'Durable quality', symbol: '₹₹' },
                  { id: 'Columbia (₹₹₹)', title: 'Columbia', sub: 'Pro alpine wear', symbol: '₹₹₹' },
                ].map((b) => {
                  const isSel = budget === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBudget(b.id)}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        isSel
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs font-bold block">{b.title}</span>
                      <span
                        className={`text-[10px] block mt-0.5 ${
                          isSel ? 'text-blue-100' : 'text-slate-400'
                        }`}
                      >
                        {b.sub}
                      </span>
                      <span className="text-xs font-extrabold mt-1 block">{b.symbol}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Creator / Tech Gear Kit */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">videocam</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Drone & Camera Gear Kit</span>
                  <span className="text-[11px] text-slate-500 block">Cold-temp battery wraps, silica packs</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHasTechKit(!hasTechKit)}
                className={`w-12 h-6 rounded-full p-0.5 transition-colors ${
                  hasTechKit ? 'bg-teal-600' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                    hasTechKit ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Generate Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-full h-14 rounded-full bg-blue-600 text-white font-bold text-sm shadow-lg hover:bg-blue-700 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                <span>Generate My Packing List</span>
              </button>
              <p className="text-center text-[11px] text-slate-400 mt-2">
                Takes ~2 seconds • Powered by Gemini AI Engine
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: AI GENERATING SCREEN */}
        {step === 3 && (
          <div className="flex flex-col items-center justify-center py-6 px-2 text-center animate-in fade-in duration-300">
            {/* Visual Orbiting Suitcase Graphic */}
            <div className="relative w-56 h-56 flex items-center justify-center my-3">
              {/* Spinning orbital ring */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-blue-200 animate-[spin_18s_linear_infinite]" />

              {/* Suitcase */}
              <div className="relative z-10 w-24 h-32 bg-white rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center justify-between p-3 animate-pulse">
                <div className="w-10 h-4 -mt-6 rounded-t-lg bg-slate-300 flex items-center justify-center pt-0.5">
                  <div className="w-6 h-2 rounded-t-sm bg-white" />
                </div>
                <div className="w-full flex-1 flex flex-col justify-around py-1">
                  <div className="w-full h-1.5 rounded-full bg-slate-100" />
                  <div className="w-full h-1.5 rounded-full bg-slate-100" />
                  <div className="w-full h-1.5 rounded-full bg-slate-100" />
                </div>
                <div className="w-full flex items-center justify-between pt-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                  <span className="material-symbols-outlined text-blue-600 text-[18px]">
                    luggage
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                </div>
              </div>

              {/* Orbiting Elements */}
              <div className="absolute top-2 left-4 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-blue-600 animate-bounce">
                <span className="material-symbols-outlined text-[18px]">dry_cleaning</span>
              </div>
              <div
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-amber-600 animate-bounce"
                style={{ animationDelay: '0.4s' }}
              >
                <span className="material-symbols-outlined text-[18px]">hiking</span>
              </div>
              <div
                className="absolute bottom-4 right-4 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-teal-600 animate-bounce"
                style={{ animationDelay: '0.8s' }}
              >
                <span className="material-symbols-outlined text-[18px]">photo_camera</span>
              </div>
              <div
                className="absolute bottom-4 left-4 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-purple-600 animate-bounce"
                style={{ animationDelay: '0.2s' }}
              >
                <span className="material-symbols-outlined text-[18px]">front_hand</span>
              </div>
            </div>

            {/* Destination Locked Card */}
            <div className="w-full bg-white rounded-2xl p-3 shadow-xs border border-slate-100 flex items-center gap-3 text-left mt-2 mb-4">
              <img
                src={preview.image}
                alt="Destination"
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-blue-600">
                    location_on
                  </span>
                  <span className="text-[10px] font-bold uppercase text-blue-600">
                    Destination Locked
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-900 truncate">{destination}</p>
                <p className="text-[11px] text-slate-500">
                  {diffDays} Days • {travelersCount} Traveler{travelersCount > 1 ? 's' : ''}
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[11px] font-bold">
                {preview.temp}
              </span>
            </div>

            <h2 className="text-xl font-extrabold text-slate-900">
              Creating your perfect packing list...
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Customizing essentials for {preview.temp} weather, {style.toLowerCase()} style, and activities.
            </p>

            {/* Real-time Checklist Verification Steps */}
            <div className="w-full flex flex-col gap-2 mt-5 text-left">
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-xs">
                <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800">Historical climate indices verified</p>
                  <p className="text-[11px] text-slate-400">Calculated seasonal freeze and UV index</p>
                </div>
                <span className="material-symbols-outlined text-[16px] text-teal-600">cloud_done</span>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-xs">
                <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800">Analyzing planned itinerary</p>
                  <p className="text-[11px] text-slate-400">{activities.slice(0, 3).join(', ')}</p>
                </div>
                <span className="material-symbols-outlined text-[16px] text-teal-600">downhill_skiing</span>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-xs">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 animate-pulse">
                  <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-blue-700">{loadingStepStatus}</p>
                  <p className="text-[11px] text-slate-400">Calculating 15kg baggage limits & carry-on</p>
                </div>
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              </div>
            </div>

            {/* Progress Meter */}
            <div className="w-full bg-white rounded-2xl p-4 shadow-xs border border-slate-100 mt-4 text-left">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-blue-600">
                    auto_awesome
                  </span>
                  Gemini Generation Status
                </span>
                <span className="text-xs font-extrabold text-blue-600">{loadingProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-teal-600">verified</span>
                Almost ready! Finalizing curated packing recommendations...
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
