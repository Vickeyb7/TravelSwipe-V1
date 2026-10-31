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
  images?: string[];
}

interface PopularDestinationsSectionProps {
  onPackDestination: (destinationOrId: string) => void;
  onPlanTrip: (initialDestination?: string) => void;
}

const DEFAULT_POPULAR_DESTINATIONS: TrendingDestination[] = [
  {
    id: 'pop-manali',
    destination: 'Manali',
    region: 'Himachal Pradesh, India',
    country: 'India',
    tagline: 'Snow-kissed pine slopes & cozy wooden mountain cafes',
    seasonTrendTag: '❄️ Early Snow & Crisp Air',
    whyVisitNow: 'October and autumn bring crystal clear Himalayan skies, morning frost, and golden amber foliage before peak winter crowds arrive.',
    bestMonths: 'Oct – Dec',
    expectedTemp: '-2°C to 12°C',
    climateBadge: 'Crisp Alpine Freeze',
    trendingScore: 98,
    theme: 'mountains',
    packingHighlights: ['Merino Wool Thermals', 'Quechua Fleece Sweater', 'Touchscreen Gloves'],
    tripId: 'manali-2026',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAEvBRRdHc-X3sCDHUZ1AWYTKQcvy7ZfXymzRAaTfDjYLEbYxBPmr00xcO-gTV-1uer-3Uvh9Ih6IVynu-CCptfkrwOqpvlGy9bcjwL1gQ2fO82qoR6WWu4SLGI6z_vMXEqoshVoQ7rlJRMkdefT8il98iytvY9fQKi_uVIuekvq2hQaCPV5d0IjmzasSCqeHjV5dBR16Kth06W21lgG40ajW7tJxThGW6UqJgQe5TgFsYr6uol-4pZ3A',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAEvBRRdHc-X3sCDHUZ1AWYTKQcvy7ZfXymzRAaTfDjYLEbYxBPmr00xcO-gTV-1uer-3Uvh9Ih6IVynu-CCptfkrwOqpvlGy9bcjwL1gQ2fO82qoR6WWu4SLGI6z_vMXEqoshVoQ7rlJRMkdefT8il98iytvY9fQKi_uVIuekvq2hQaCPV5d0IjmzasSCqeHjV5dBR16Kth06W21lgG40ajW7tJxThGW6UqJgQe5TgFsYr6uol-4pZ3A',
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    id: 'pop-goa',
    destination: 'Goa',
    region: 'Konkan Coast, India',
    country: 'India',
    tagline: 'Beach shacks reopening & serene turquoise waters post-monsoon',
    seasonTrendTag: '🏖️ Shacks Reopening Season',
    whyVisitNow: 'October marks the start of the coastal season: monsoons have subsided, waters are calm, and beaches are clean before peak holiday congestion.',
    bestMonths: 'Oct – Apr',
    expectedTemp: '24°C to 32°C',
    climateBadge: 'Breezy Tropical Coast',
    trendingScore: 96,
    theme: 'beaches',
    packingHighlights: ['Linen Vacation Shirt', 'Reef-Safe SPF 50', 'Quick-Dry Swimwear'],
    tripId: 'goa-2027',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGxOi4-uawzrMvpLNbL0S-6QJsHPVRMzGrMRzftn52ABKjdVPsiu-4C3R5eggXg74ifQVqKy-ztFqm-9M7u0pw-Nr2hU8nUT-XFcIS1xDsnb5tx8dmquvBB3s0X5H8-6eVfxDfU_w5z-xeSjwE37UB03sl5LqHX9v7XkQ-YC1WrlO6-rKIIHGK_2S6XqqyO5K7d8RJgHpkm0QDqymdHT570yr5rH_npMuX-QLriD7K-j9lU7MrIadH5w',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDGxOi4-uawzrMvpLNbL0S-6QJsHPVRMzGrMRzftn52ABKjdVPsiu-4C3R5eggXg74ifQVqKy-ztFqm-9M7u0pw-Nr2hU8nUT-XFcIS1xDsnb5tx8dmquvBB3s0X5H8-6eVfxDfU_w5z-xeSjwE37UB03sl5LqHX9v7XkQ-YC1WrlO6-rKIIHGK_2S6XqqyO5K7d8RJgHpkm0QDqymdHT570yr5rH_npMuX-QLriD7K-j9lU7MrIadH5w',
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1587922546307-776227941871?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    id: 'pop-jaipur',
    destination: 'Jaipur',
    region: 'Rajasthan, India',
    country: 'India',
    tagline: 'Royal pink sandstone palaces bathed in mild autumn sunshine',
    seasonTrendTag: '🏰 Royal Heritage Season',
    whyVisitNow: 'The oppressive summer heat has broken into pleasant 22°C daytime temperatures, ideal for Amer Fort exploration and rooftop sunset dinners.',
    bestMonths: 'Oct – Mar',
    expectedTemp: '16°C to 26°C',
    climateBadge: 'Pleasant 22°C Heritage',
    trendingScore: 95,
    theme: 'heritage',
    packingHighlights: ['Comfortable Walking Sneakers', 'Evening Merino Shawl', 'Cotton Kurtas'],
    tripId: 'jaipur-2027',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDcfszlFr0RIWqHwFOl4Slea-FLW534_Wx1OBHOHLyeDPPn0T5P7msW49C2mqvOEI2WVjqSjbuAhZPhuWwegkmbOZcgnotPc5AP3M3lv9DXwijW6wYp1VN2yCZ4kU5ceZQsAzggHKbKSjclj1xMOnlXPLtE9porGFCpVuzPRreImBa0A2vL5cuolHAGdqlbbdxFPdCL86qUqXsqkSbfjwAEQApR6AP_-QUXaj4I169MwFKrdAmxFbfqvg',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDcfszlFr0RIWqHwFOl4Slea-FLW534_Wx1OBHOHLyeDPPn0T5P7msW49C2mqvOEI2WVjqSjbuAhZPhuWwegkmbOZcgnotPc5AP3M3lv9DXwijW6wYp1VN2yCZ4kU5ceZQsAzggHKbKSjclj1xMOnlXPLtE9porGFCpVuzPRreImBa0A2vL5cuolHAGdqlbbdxFPdCL86qUqXsqkSbfjwAEQApR6AP_-QUXaj4I169MwFKrdAmxFbfqvg',
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1603288967383-8a9d18cb3f84?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    id: 'pop-bali',
    destination: 'Bali',
    region: 'Indonesia',
    country: 'Indonesia',
    tagline: 'Lush tropical paradise, cliffside temples & tranquil waterfalls',
    seasonTrendTag: '🌴 Island Tropical Haven',
    whyVisitNow: 'Sunny tropical beach vibes with comfortable humidity, great surf breaks, and scenic cafe sunsets across Canggu and Uluwatu.',
    bestMonths: 'Year Round (High in Oct)',
    expectedTemp: '24°C to 30°C',
    climateBadge: 'Tropical Island 29°C',
    trendingScore: 94,
    theme: 'international',
    packingHighlights: ['Water Shoes', 'Temple Modesty Sarong', 'Type C Travel Plug'],
    tripId: 'bali-2027',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCe5LOTeBx46gjtld8dww-FG1fB2J5qq1FuIuFdwcKEsrUDzkCgT5QXRIS5T5Gn1lDGlRtxGUzOGcm4WV2U31o5AQ9aFiO_Una5KOdVFyLFijFzYLhxRiDj5083hkbax-5JZsFAmPaJUGpVZuxeQfJ8D48emw4OPK9JpLc9Y7H50w7ZN047vMUVcAsojfEXk_1xas9lCBNcMPkN365U7NZnRqZEcsgzaPA9hLpwkjn72e4nizqNVgGhSg',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCe5LOTeBx46gjtld8dww-FG1fB2J5qq1FuIuFdwcKEsrUDzkCgT5QXRIS5T5Gn1lDGlRtxGUzOGcm4WV2U31o5AQ9aFiO_Una5KOdVFyLFijFzYLhxRiDj5083hkbax-5JZsFAmPaJUGpVZuxeQfJ8D48emw4OPK9JpLc9Y7H50w7ZN047vMUVcAsojfEXk_1xas9lCBNcMPkN365U7NZnRqZEcsgzaPA9hLpwkjn72e4nizqNVgGhSg',
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    id: 'pop-ladakh',
    destination: 'Ladakh',
    region: 'Trans-Himalayas, India',
    country: 'India',
    tagline: 'High-altitude azure lakes, stark moonscapes & Tibetan prayer flags',
    seasonTrendTag: '🏔️ High Mountain Frontier',
    whyVisitNow: 'Last chance to experience Pangong Tso and Khardung La under crystal blue skies before high Himalayan mountain passes close for winter snowfall.',
    bestMonths: 'May – Oct',
    expectedTemp: '-4°C to 10°C',
    climateBadge: 'Sub-Zero High Altitude',
    trendingScore: 93,
    theme: 'mountains',
    packingHighlights: ['Diamox Altitude Kit', 'UV-400 Polarized Shades', 'Fleece-Lined Beanie'],
    tripId: 'ladakh-2026',
    imageUrl: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    id: 'pop-munnar',
    destination: 'Munnar',
    region: 'Kerala, India',
    country: 'India',
    tagline: 'Misty rolling emerald tea plantations & fragrant spice trails',
    seasonTrendTag: '🌱 Post-Monsoon Emerald Hills',
    whyVisitNow: 'The western ghats are at their most vibrant green, with cool misty mornings and refreshing waterfalls following the southwest monsoon.',
    bestMonths: 'Sep – Mar',
    expectedTemp: '14°C to 22°C',
    climateBadge: 'Misty Hill Station',
    trendingScore: 92,
    theme: 'mountains',
    packingHighlights: ['Rain Poncho', 'Trekking Shoes', 'Light Windbreaker'],
    tripId: 'munnar-kerala',
    imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    id: 'pop-kyoto',
    destination: 'Kyoto',
    region: 'Kansai Region, Japan',
    country: 'Japan',
    tagline: 'Fiery crimson momiji maple temples & crisp autumn air',
    seasonTrendTag: '🍁 Peak Autumn Foliage',
    whyVisitNow: 'World-renowned Japanese maple tree turn brilliant fiery crimson against ancient zen temples, offering unmatched seasonal photography.',
    bestMonths: 'Oct – Nov',
    expectedTemp: '11°C to 20°C',
    climateBadge: 'Mild & Crisp Autumn',
    trendingScore: 96,
    theme: 'international',
    packingHighlights: ['Universal Power Adapter', 'Slip-on Walking Shoes', 'Lightweight Cardigan'],
    tripId: 'kyoto-autumn',
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    id: 'pop-zermatt',
    destination: 'Zermatt',
    region: 'Valais, Switzerland',
    country: 'Switzerland',
    tagline: 'Iconic Matterhorn alpine peak & golden European autumn larches',
    seasonTrendTag: '🏔️ Alpine Autumn Grandeur',
    whyVisitNow: 'October delivers crisp mountain air, golden larch forests, and pristine glacier viewpoints with uncrowded Swiss trains and mountain hotels.',
    bestMonths: 'Jun – Oct',
    expectedTemp: '1°C to 9°C',
    climateBadge: 'Alpine Alpine 5°C',
    trendingScore: 94,
    theme: 'international',
    packingHighlights: ['Down Insulated Parka', 'Thermal Gloves', 'European Plug Adapter'],
    tripId: 'zermatt-alps',
    imageUrl: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    ],
  },
];

interface DestinationCardProps {
  item: TrendingDestination;
  onPackDestination: (destinationOrId: string) => void;
  onPlanTrip: (initialDestination?: string) => void;
}

const PopularDestinationCard: React.FC<DestinationCardProps> = ({
  item,
  onPackDestination,
  onPlanTrip,
}) => {
  const images = item.images && item.images.length > 0 ? item.images : [item.imageUrl];
  const [currentIdx, setCurrentIdx] = useState(0);

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev + 1) % images.length);
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xs border border-slate-200/90 hover:border-blue-500 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group h-full">
      {/* High-Quality Seasonal Imagery Hero with Multi-Photo Switcher */}
      <div className="relative h-60 sm:h-64 md:h-64 w-full overflow-hidden bg-slate-900 select-none">
        <img
          src={images[currentIdx] || item.imageUrl}
          alt={`${item.destination} seasonal view ${currentIdx + 1}`}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/35 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1.5 z-10">
          <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-slate-900 text-[10px] font-black shadow-xs flex items-center gap-1">
            <span>{item.seasonTrendTag}</span>
          </span>

          <span className="px-2.5 py-1 rounded-full bg-blue-600/95 backdrop-blur-md text-white text-[10px] font-extrabold shadow-xs flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">trending_up</span>
            <span>{item.trendingScore}% Match</span>
          </span>
        </div>

        {/* Multi-Photo Carousel Controls (Prev / Next & Dots) */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevPhoto}
              aria-label="Previous photo"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/45 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 z-10 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={handleNextPhoto}
              aria-label="Next photo"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/45 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 z-10 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>

            {/* Photo Counter Pill & Indicator Dots */}
            <div className="absolute top-12 right-3 z-10 px-2 py-0.5 rounded-full bg-black/50 text-white text-[10px] font-bold backdrop-blur-md flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">photo_camera</span>
              <span>{currentIdx + 1}/{images.length}</span>
            </div>

            <div className="absolute bottom-16 inset-x-0 flex items-center justify-center gap-1.5 z-10 pointer-events-none">
              {images.map((_, dotIdx) => (
                <span
                  key={dotIdx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    dotIdx === currentIdx ? 'w-5 bg-white shadow-xs' : 'w-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Bottom Overlay Info */}
        <div className="absolute bottom-3 left-3.5 right-3.5 text-white z-10 pointer-events-none">
          <div className="flex items-end justify-between gap-2">
            <div>
              <h3 className="text-xl font-black text-white leading-tight drop-shadow-md">
                {item.destination}
              </h3>
              <span className="text-xs text-teal-300 font-semibold flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                <span>{item.region}</span>
              </span>
            </div>

            <div className="text-right shrink-0">
              <span className="text-sm font-black text-amber-300 block leading-tight">
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
      <div className="p-4 flex flex-col gap-3 flex-1 justify-between bg-white">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold text-slate-800 italic leading-snug">
            &ldquo;{item.tagline}&rdquo;
          </p>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 leading-relaxed">
            <strong className="text-blue-700 font-extrabold block mb-0.5">
              Why travel this season:
            </strong>
            {item.whyVisitNow}
          </div>

          {/* Essential Packing Preview */}
          <div className="flex flex-col gap-1 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Recommended Gear:
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
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => onPackDestination(item.tripId || item.destination)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">backpack</span>
            <span>Pack {item.destination}</span>
          </button>

          <button
            type="button"
            onClick={() => onPlanTrip(item.destination)}
            title={`Customize dates & activities for ${item.destination}`}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-200/60"
          >
            <span className="material-symbols-outlined text-[17px] text-slate-700">tune</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const PopularDestinationsSection: React.FC<PopularDestinationsSectionProps> = ({
  onPackDestination,
  onPlanTrip,
}) => {
  const [destinations, setDestinations] = useState<TrendingDestination[]>(DEFAULT_POPULAR_DESTINATIONS);
  const [seasonOverview, setSeasonOverview] = useState<string>(
    'Clear skies, pleasant temperatures, and the first autumn chill make October prime for Himalayan trails, palace exploration, and opening beach seasons.'
  );
  const [loading, setLoading] = useState<boolean>(false);
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
        if (data.seasonOverview) setSeasonOverview(data.seasonOverview);
        setIsAiGenerated(Boolean(data.aiGenerated));
      }
    } catch {
      // Handled with curated destinations
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
    <section className="flex flex-col gap-4 pt-2">
      {/* Header with Gemini AI Badge and Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 mb-0.5">
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
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Popular Destinations
          </h2>
          <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-2xl mt-0.5">
            {seasonOverview}
          </p>
        </div>

        <button
          type="button"
          onClick={fetchTrendingDestinations}
          disabled={loading}
          title="Refresh trending spots with Gemini"
          className="self-start sm:self-auto shrink-0 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all cursor-pointer border border-slate-200/80 shadow-2xs text-xs font-bold flex items-center gap-1.5"
        >
          <span className={`material-symbols-outlined text-[16px] ${loading ? 'animate-spin text-blue-600' : ''}`}>
            sync
          </span>
          <span>Refresh Trends</span>
        </button>
      </div>

      {/* Seasonal Category Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 py-0.5">
        {[
          { id: 'all', label: `🌟 All Trending (${destinations.length})` },
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
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 shadow-2xs'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Responsive Grid of Larger Destination Cards with Image Galleries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-1">
        {filteredDestinations.map((item) => (
          <PopularDestinationCard
            key={item.id}
            item={item}
            onPackDestination={onPackDestination}
            onPlanTrip={onPlanTrip}
          />
        ))}
      </div>
    </section>
  );
};
