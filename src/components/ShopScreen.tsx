import React, { useState, useMemo, useEffect } from 'react';
import { useTrips } from '../context/TripsContext';
import { PackingItem, GearCategory } from '../types';
import {
  DESTINATION_THEMES,
  PRESET_SMART_SHOP,
  detectPresetForTrip,
  DestinationTheme,
} from '../utils/shopPresets';

export interface ShopProduct {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  discount: string;
  retailer: 'Amazon India' | 'Decathlon' | 'Myntra' | 'Flipkart' | string;
  rating: number;
  reviews: string;
  badge?: string;
  featureIcon: string;
  featureText: string;
  imageUrl: string;
  category: 'beach' | 'winter' | 'electronics' | 'luggage' | 'toiletries' | 'footwear' | 'clothing';
  keywords: string[];
  link: string;
}

export interface SmartShopRecommendation {
  id: string;
  title: string;
  category: string;
  imageUrl?: string;
  weatherMatchReason: string;
  activityMatchReason: string;
  priceINR: number;
  originalPriceINR: number;
  discount: string;
  retailer: 'Amazon India' | 'Decathlon' | 'Myntra' | 'Flipkart' | string;
  rating: number;
  reviews: string;
  badge: string;
  specPill: string;
  searchQuery: string;
  directSearchLinks: {
    amazon: string;
    decathlon: string;
    myntra: string;
    flipkart: string;
  };
  preferredRetailerUrl: string;
}

export interface SmartShopData {
  analysisSummary: string;
  climateBadge: string;
  activityHighlight: string;
  estimatedShopBudgetINR: number;
  recommendations: SmartShopRecommendation[];
}

interface ShopScreenProps {
  onSelectItemDetails?: (item: PackingItem) => void;
}

// Curated image assets for travel gear
const IMAGES = {
  sweaterMerino:
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80',
  sweaterFleece:
    'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80',
  sweaterKnit:
    'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=600&q=80',
  jacketDown:
    'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=600&q=80',
  sunscreen:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCz5a3hvzrHyxWHpJaIJacSH-CoPyxAtfXcaHbFzfALLEUIwz71lNFCyRA3mAORi9nMryqwHt1fN0tuAKO8kvAH0IXSxIEd7Gq7AYbJqyt-zmn-Iv7NzOYFVfSKj-EsFESHPblGk6b7sRZE2YRxVQnr1TC7uOrx4NeMVlxZtaR5t-S-V7mszgbhRzyOJu_nLNuyucWC6cCcol2-asZlz-6RICO2nDmWBEa-Efct4ycoLVNiXw-wlAYh1w',
  linenShirt:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD5fPefNvxwy5tOUHhuNFxWFP-4uSWHB9CMCzXbN19_QA_XRnHt701md0JmGUQ24FVVwN5Uzx6B12aUKrRAcyYrNCGBf8LGuYwGs-j0HlpSqQDXFSK2ccgrmwVrexP7DgDieU1xf7w0exIzPBc6XthdRp7x0OgWoOn7gtmP7hmzxUHg5gYmL0X_6wTfaKKonAJgiJaAjwmV5hMM6YahDix7Nf-IQZpv3Fm_L-jJoSC6hg_djlHSy2QkmA',
  boots:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBe5Jj_X5S7cMsa8tx2wx5iIPT6B0OEgeL3pGoXh9jMSX2qoabM__4hJpSaFPM-8oMlGmB2XKIjEtutjMEkUASwIzESBkrflabJ88dIg4OESNupCQe9lsQAA5yFik82f9nrq2mFpoXURMLGpHxSsdAnpx3eBLtd5thEWtQToOdDCSwThEU38jj2hvXEULZc-ak7MRWnT2Ve-zJq8q8yJVHfDSuAxvfGGEevym3VIfM0CWb0M7qpt7K_Fw',
  powerbank:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAANvFdMoHy74JhWyWroeDwnp2YozqvBksLiwAwgPjKeN7wDpzdXm3fyzZvtBGd_uhZs_vjK5rln4szTvV_7p1AwmlngFOMjreR2500AjxTnXwcG1MmpQkTBp3xXC-6j8vqlk0hiMcqDdqzeSqQ9OP735oXdu5HWcgOhQTyXDMpl5m97zTpxknDWud97nRqcwxHH19gJGewZkw6-AKN-ydz3MwDnCJv7J0JzExmWOtYTGvehCBfUHHkKA',
  adapter:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAaWWrjJWk1w5cpJIWOHKTRBxK3cVTAKFs7euiUS4nDes0H4QQppeFTHWwxdyg9kV7MJJevkLJDQ6oXnsHCP4lgy6EHDq9nY-4J1Z42Fz1oUC1HQv85IC_xqRcxs4zIE-jSnCCrDoDWL2WRksoIOBSIBTH1f_Vgo3XE-SJ2eggF8A5LwzxhzdQKEVKteGVDkU5XQEvStXRiEDYU7lcGaN64wxsv15Cg5MZTKe-TBoPS1_ns7SCA7uLY8A',
  backpack:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBe5Jj_X5S7cMsa8tx2wx5iIPT6B0OEgeL3pGoXh9jMSX2qoabM__4hJpSaFPM-8oMlGmB2XKIjEtutjMEkUASwIzESBkrflabJ88dIg4OESNupCQe9lsQAA5yFik82f9nrq2mFpoXURMLGpHxSsdAnpx3eBLtd5thEWtQToOdDCSwThEU38jj2hvXEULZc-ak7MRWnT2Ve-zJq8q8yJVHfDSuAxvfGGEevym3VIfM0CWb0M7qpt7K_Fw',
  cubes:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDcfszlFr0RIWqHwFOl4Slea-FLW534_Wx1OBHOHLyeDPPn0T5P7msW49C2mqvOEI2WVjqSjbuAhZPhuWwegkmbOZcgnotPc5AP3M3lv9DXwijW6wYp1VN2yCZ4kU5ceZQsAzggHKbKSjclj1xMOnlXPLtE9porGFCpVuzPRreImBa0A2vL5cuolHAGdqlbbdxFPdCL86qUqXsqkSbfjwAEQApR6AP_-QUXaj4I169MwFKrdAmxFbfqvg',
  bottles:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCz5a3hvzrHyxWHpJaIJacSH-CoPyxAtfXcaHbFzfALLEUIwz71lNFCyRA3mAORi9nMryqwHt1fN0tuAKO8kvAH0IXSxIEd7Gq7AYbJqyt-zmn-Iv7NzOYFVfSKj-EsFESHPblGk6b7sRZE2YRxVQnr1TC7uOrx4NeMVlxZtaR5t-S-V7mszgbhRzyOJu_nLNuyucWC6cCcol2-asZlz-6RICO2nDmWBEa-Efct4ycoLVNiXw-wlAYh1w',
  swimShorts:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCe5LOTeBx46gjtld8dww-FG1fB2J5qq1FuIuFdwcKEsrUDzkCgT5QXRIS5T5Gn1lDGlRtxGUzOGcm4WV2U31o5AQ9aFiO_Una5KOdVFyLFijFzYLhxRiDj5083hkbax-5JZsFAmPaJUGpVZuxeQfJ8D48emw4OPK9JpLc9Y7H50w7ZN047vMUVcAsojfEXk_1xas9lCBNcMPkN365U7NZnRqZEcsgzaPA9hLpwkjn72e4nizqNVgGhSg',
  gloves:
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
  genericGear:
    'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=600&q=80',
};

// Smart image resolver that pairs products with relevant, realistic imagery
export function resolveGearImage(item: {
  id?: string;
  title: string;
  category?: string;
  imageUrl?: string;
}): string {
  if (item.imageUrl) return item.imageUrl;

  const t = (item.title || '').toLowerCase();
  const id = (item.id || '').toLowerCase();
  const combined = `${id} ${t}`;

  if (combined.includes('powerbank') || combined.includes('power bank') || combined.includes('battery')) {
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuAANvFdMoHy74JhWyWroeDwnp2YozqvBksLiwAwgPjKeN7wDpzdXm3fyzZvtBGd_uhZs_vjK5rln4szTvV_7p1AwmlngFOMjreR2500AjxTnXwcG1MmpQkTBp3xXC-6j8vqlk0hiMcqDdqzeSqQ9OP735oXdu5HWcgOhQTyXDMpl5m97zTpxknDWud97nRqcwxHH19gJGewZkw6-AKN-ydz3MwDnCJv7J0JzExmWOtYTGvehCBfUHHkKA';
  }
  if (combined.includes('cube') || combined.includes('compression') || combined.includes('organizer')) {
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuDcfszlFr0RIWqHwFOl4Slea-FLW534_Wx1OBHOHLyeDPPn0T5P7msW49C2mqvOEI2WVjqSjbuAhZPhuWwegkmbOZcgnotPc5AP3M3lv9DXwijW6wYp1VN2yCZ4kU5ceZQsAzggHKbKSjclj1xMOnlXPLtE9porGFCpVuzPRreImBa0A2vL5cuolHAGdqlbbdxFPdCL86qUqXsqkSbfjwAEQApR6AP_-QUXaj4I169MwFKrdAmxFbfqvg';
  }
  if (combined.includes('adapter') || combined.includes('charger') || combined.includes('plug')) {
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaWWrjJWk1w5cpJIWOHKTRBxK3cVTAKFs7euiUS4nDes0H4QQppeFTHWwxdyg9kV7MJJevkLJDQ6oXnsHCP4lgy6EHDq9nY-4J1Z42Fz1oUC1HQv85IC_xqRcxs4zIE-jSnCCrDoDWL2WRksoIOBSIBTH1f_Vgo3XE-SJ2eggF8A5LwzxhzdQKEVKteGVDkU5XQEvStXRiEDYU7lcGaN64wxsv15Cg5MZTKe-TBoPS1_ns7SCA7uLY8A';
  }
  if (combined.includes('daypack') || combined.includes('backpack') || combined.includes('rucksack') || combined.includes('50l') || combined.includes('travel 500')) {
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuBe5Jj_X5S7cMsa8tx2wx5iIPT6B0OEgeL3pGoXh9jMSX2qoabM__4hJpSaFPM-8oMlGmB2XKIjEtutjMEkUASwIzESBkrflabJ88dIg4OESNupCQe9lsQAA5yFik82f9nrq2mFpoXURMLGpHxSsdAnpx3eBLtd5thEWtQToOdDCSwThEU38jj2hvXEULZc-ak7MRWnT2Ve-zJq8q8yJVHfDSuAxvfGGEevym3VIfM0CWb0M7qpt7K_Fw';
  }
  if (combined.includes('sunscreen') || combined.includes('spf') || combined.includes('lotion')) {
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuCz5a3hvzrHyxWHpJaIJacSH-CoPyxAtfXcaHbFzfALLEUIwz71lNFCyRA3mAORi9nMryqwHt1fN0tuAKO8kvAH0IXSxIEd7Gq7AYbJqyt-zmn-Iv7NzOYFVfSKj-EsFESHPblGk6b7sRZE2YRxVQnr1TC7uOrx4NeMVlxZtaR5t-S-V7mszgbhRzyOJu_nLNuyucWC6cCcol2-asZlz-6RICO2nDmWBEa-Efct4ycoLVNiXw-wlAYh1w';
  }
  if (combined.includes('linen') || combined.includes('shirt') || combined.includes('button-down') || combined.includes('cotton')) {
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5fPefNvxwy5tOUHhuNFxWFP-4uSWHB9CMCzXbN19_QA_XRnHt701md0JmGUQ24FVVwN5Uzx6B12aUKrRAcyYrNCGBf8LGuYwGs-j0HlpSqQDXFSK2ccgrmwVrexP7DgDieU1xf7w0exIzPBc6XthdRp7x0OgWoOn7gtmP7hmzxUHg5gYmL0X_6wTfaKKonAJgiJaAjwmV5hMM6YahDix7Nf-IQZpv3Fm_L-jJoSC6hg_djlHSy2QkmA';
  }
  if (combined.includes('swim') || combined.includes('trunk') || combined.includes('short')) {
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuCe5LOTeBx46gjtld8dww-FG1fB2J5qq1FuIuFdwcKEsrUDzkCgT5QXRIS5T5Gn1lDGlRtxGUzOGcm4WV2U31o5AQ9aFiO_Una5KOdVFyLFijFzYLhxRiDj5083hkbax-5JZsFAmPaJUGpVZuxeQfJ8D48emw4OPK9JpLc9Y7H50w7ZN047vMUVcAsojfEXk_1xas9lCBNcMPkN365U7NZnRqZEcsgzaPA9hLpwkjn72e4nizqNVgGhSg';
  }
  if (combined.includes('sweater') || combined.includes('merino') || combined.includes('knit') || combined.includes('wool')) {
    return 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80';
  }
  if (combined.includes('down') || combined.includes('puffer') || combined.includes('jacket') || combined.includes('forclaz mt500')) {
    return 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=600&q=80';
  }
  if (combined.includes('glove') || combined.includes('mittens')) {
    return 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80';
  }
  if (combined.includes('boot') || combined.includes('snow hiking boots')) {
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuBe5Jj_X5S7cMsa8tx2wx5iIPT6B0OEgeL3pGoXh9jMSX2qoabM__4hJpSaFPM-8oMlGmB2XKIjEtutjMEkUASwIzESBkrflabJ88dIg4OESNupCQe9lsQAA5yFik82f9nrq2mFpoXURMLGpHxSsdAnpx3eBLtd5thEWtQToOdDCSwThEU38jj2hvXEULZc-ak7MRWnT2Ve-zJq8q8yJVHfDSuAxvfGGEevym3VIfM0CWb0M7qpt7K_Fw';
  }
  if (combined.includes('shoe') || combined.includes('sneaker') || combined.includes('gowalk') || combined.includes('mh500')) {
    return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80';
  }
  if (combined.includes('towel') || combined.includes('microfiber')) {
    return 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?auto=format&fit=crop&w=600&q=80';
  }
  if (combined.includes('lock') || combined.includes('tsa')) {
    return 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80';
  }
  if (combined.includes('glass') || combined.includes('sunglass') || combined.includes('goggle')) {
    return 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80';
  }
  if (combined.includes('pouch') || combined.includes('dry bag') || combined.includes('waterproof dry bag')) {
    return 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80';
  }
  if (combined.includes('sandal') || combined.includes('water shoes') || combined.includes('aqua')) {
    return 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=600&q=80';
  }
  if (combined.includes('thermal') || combined.includes('innerwear') || combined.includes('heat-lock') || combined.includes('van heusen')) {
    return 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80';
  }
  if (combined.includes('crossbody') || combined.includes('sling') || combined.includes('rfid')) {
    return 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80';
  }
  if (combined.includes('umbrella')) {
    return 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80';
  }
  if (combined.includes('steamer') || combined.includes('iron')) {
    return 'https://images.unsplash.com/photo-1585336261026-6d633f81e359?auto=format&fit=crop&w=600&q=80';
  }
  if (combined.includes('scale') || combined.includes('luggage scale')) {
    return 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80';
  }
  if (combined.includes('pole') || combined.includes('trekking pole')) {
    return 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80';
  }
  if (combined.includes('headlamp') || combined.includes('torch')) {
    return 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=600&q=80';
  }
  if (combined.includes('bladder') || combined.includes('hydration') || combined.includes('bottle') || combined.includes('flask')) {
    return 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=600&q=80';
  }
  if (combined.includes('cargo') || combined.includes('pant') || combined.includes('trouser')) {
    return 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=600&q=80';
  }
  if (combined.includes('poncho') || combined.includes('raincoat') || combined.includes('rain jacket')) {
    return 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=600&q=80';
  }
  if (combined.includes('cover') || combined.includes('silica') || combined.includes('earbuds') || combined.includes('bivy')) {
    return 'https://images.unsplash.com/photo-1509744645300-a2098b11871a?auto=format&fit=crop&w=600&q=80';
  }

  return 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=600&q=80';
}

export const ShopScreen: React.FC<ShopScreenProps> = () => {
  const { trips, activeTrip, setActiveTripId, updateItemStatus, addCustomItem } = useTrips();

  // Primary view tabs: 'smart_shop' (Gemini AI trip gear match) vs 'browse' (catalog & search)
  const [activeTab, setActiveTab] = useState<'smart_shop' | 'browse'>('smart_shop');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [onlyTripRelevant, setOnlyTripRelevant] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // AI Single Search state
  const [isAiSearching, setIsAiSearching] = useState<boolean>(false);
  const [aiCustomProducts, setAiCustomProducts] = useState<ShopProduct[]>([]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  // Smart Shop Theme & Destination Selection
  const [selectedThemeId, setSelectedThemeId] = useState<string>(() => detectPresetForTrip(activeTrip));
  const [customDestinationQuery, setCustomDestinationQuery] = useState<string>('');
  const [activeCustomDestination, setActiveCustomDestination] = useState<string | null>(null);

  // Smart Shop (Gemini AI Trip Profile Analysis) State
  const [isAnalyzingSmartShop, setIsAnalyzingSmartShop] = useState<boolean>(false);
  const [smartShopError, setSmartShopError] = useState<string | null>(null);
  const [aiShopCache, setAiShopCache] = useState<Record<string, SmartShopData>>({});

  // Sync theme when activeTrip changes
  useEffect(() => {
    if (activeTrip) {
      const detected = detectPresetForTrip(activeTrip);
      setSelectedThemeId(detected);
      setActiveCustomDestination(null);
    }
  }, [activeTrip?.id]);

  // Active theme object
  const currentTheme = useMemo<DestinationTheme>(() => {
    const found = DESTINATION_THEMES.find((t) => t.id === selectedThemeId);
    return found || DESTINATION_THEMES[0];
  }, [selectedThemeId]);

  // Current effective destination details
  const effectiveDestination = activeCustomDestination
    ? activeCustomDestination
    : activeTrip?.destination
    ? activeTrip.destination
    : currentTheme.destinationName;

  const effectiveTempRange = activeTrip?.tempRange || currentTheme.tempRange;
  const effectiveClimateTitle = activeTrip?.climateTitle || currentTheme.climateTitle;
  const effectiveActivities = activeTrip?.activities || currentTheme.activities;

  // Active Smart Shop Data: Instant 0ms load!
  const smartShopData = useMemo<SmartShopData>(() => {
    const cacheKey = activeCustomDestination
      ? `custom-${activeCustomDestination.toLowerCase()}`
      : activeTrip
      ? `trip-${activeTrip.id}`
      : selectedThemeId;

    if (aiShopCache[cacheKey]) {
      return aiShopCache[cacheKey];
    }

    const basePreset = PRESET_SMART_SHOP[selectedThemeId] || PRESET_SMART_SHOP.universal;

    if (activeCustomDestination) {
      return {
        ...basePreset,
        analysisSummary: `Instant curated travel gear tailored for ${activeCustomDestination}. Tap 'Re-Analyze with AI' anytime for custom itinerary synthesis.`,
        climateBadge: `${activeCustomDestination} Gear Curation`,
      };
    }

    if (activeTrip && activeTrip.destination !== basePreset.climateBadge) {
      return {
        ...basePreset,
        analysisSummary: `Curated gear optimized for ${activeTrip.destination} (${activeTrip.tempRange || currentTheme.tempRange}) and ${activeTrip.activities?.slice(0, 2).join(' & ') || 'vacation activities'}.`,
        climateBadge: `${activeTrip.destination} • ${activeTrip.climateTitle || currentTheme.climateTitle}`,
      };
    }

    return basePreset;
  }, [activeCustomDestination, activeTrip, selectedThemeId, aiShopCache, currentTheme]);

  // On-demand fetch for Gemini AI Smart Shop
  const handleFetchSmartShop = async (targetThemeId?: string, overrideDest?: string) => {
    const themeToUse = targetThemeId || selectedThemeId;
    const matchedTheme = DESTINATION_THEMES.find((t) => t.id === themeToUse) || currentTheme;
    const dest = overrideDest || effectiveDestination;
    const cacheKey = overrideDest
      ? `custom-${overrideDest.toLowerCase()}`
      : activeTrip
      ? `trip-${activeTrip.id}`
      : themeToUse;

    try {
      setIsAnalyzingSmartShop(true);
      setSmartShopError(null);

      const datesText = activeTrip?.datesText || 'Upcoming 5-Day Journey';
      const durationDays = activeTrip?.durationDays || 5;
      const tempRange = activeTrip?.tempRange || matchedTheme.tempRange;
      const climateTitle = activeTrip?.climateTitle || matchedTheme.climateTitle;
      const climateNote = activeTrip?.climateNote || matchedTheme.climateNote;
      const activities = activeTrip?.activities || matchedTheme.activities;
      const purposes = activeTrip?.purposes || ['Vacation', 'Exploration'];
      const style = activeTrip?.style || 'Casual & Practical';
      const budgetTier = activeTrip?.budgetTier || 'Mid-range';
      const luggageType = activeTrip?.luggageType || 'Backpack or Trolley';

      const unpackedOrToBuyItems = (activeTrip?.items || [])
        .filter((it) => it.status === 'to_buy' || it.status === 'own')
        .map((it) => `${it.name} (${it.category})`);

      const res = await fetch('/api/ai/smart-shop-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: dest,
          datesText,
          durationDays,
          tempRange,
          climateTitle,
          climateNote,
          activities,
          purposes,
          style,
          budgetTier,
          luggageType,
          unpackedOrToBuyItems,
        }),
      });

      const data = await res.json();
      if (data && data.recommendations && data.recommendations.length > 0) {
        const compiled: SmartShopData = {
          analysisSummary: data.analysisSummary,
          climateBadge: data.climateBadge || `${dest} Climate Analysis`,
          activityHighlight: data.activityHighlight || 'Trip Activities Focus',
          estimatedShopBudgetINR: data.estimatedShopBudgetINR || 4500,
          recommendations: data.recommendations,
        };
        setAiShopCache((prev) => ({ ...prev, [cacheKey]: compiled }));
        setToastMsg(`✓ Gemini AI personalized gear for ${dest}!`);
        setTimeout(() => setToastMsg(null), 3000);
      } else {
        throw new Error('No recommendations returned');
      }
    } catch (err: any) {
      console.warn('Smart Shop fetch error:', err.message);
      setSmartShopError('Could not refresh AI recommendations right now; showing instant curated gear.');
    } finally {
      setIsAnalyzingSmartShop(false);
    }
  };

  const handleApplyCustomDestination = (destInput?: string) => {
    const raw = (destInput || customDestinationQuery).trim();
    if (!raw) return;
    setActiveCustomDestination(raw);

    const lower = raw.toLowerCase();
    if (
      lower.includes('snow') ||
      lower.includes('winter') ||
      lower.includes('manali') ||
      lower.includes('kashmir') ||
      lower.includes('gulmarg') ||
      lower.includes('alps') ||
      lower.includes('switzerland')
    ) {
      setSelectedThemeId('winter');
    } else if (
      lower.includes('beach') ||
      lower.includes('goa') ||
      lower.includes('bali') ||
      lower.includes('phuket') ||
      lower.includes('andaman') ||
      lower.includes('maldives') ||
      lower.includes('hawaii')
    ) {
      setSelectedThemeId('beach');
    } else if (
      lower.includes('trek') ||
      lower.includes('ladakh') ||
      lower.includes('spiti') ||
      lower.includes('himalaya') ||
      lower.includes('camp')
    ) {
      setSelectedThemeId('trekking');
    } else if (
      lower.includes('heritage') ||
      lower.includes('jaipur') ||
      lower.includes('udaipur') ||
      lower.includes('europe') ||
      lower.includes('paris') ||
      lower.includes('rome') ||
      lower.includes('kyoto') ||
      lower.includes('london')
    ) {
      setSelectedThemeId('heritage');
    } else if (
      lower.includes('rain') ||
      lower.includes('monsoon') ||
      lower.includes('kerala') ||
      lower.includes('meghalaya')
    ) {
      setSelectedThemeId('monsoon');
    } else {
      setSelectedThemeId('universal');
    }

    setToastMsg(`Showing gear tailored for "${raw}"!`);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // AI-powered dynamic search across stores
  const handleRunAISearch = async (queryText?: string) => {
    const q = (queryText || searchQuery).trim();
    if (!q) return;

    try {
      setIsAiSearching(true);
      const res = await fetch('/api/ai/shop-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          destination: effectiveDestination,
        }),
      });

      const data = await res.json();
      if (data && data.products) {
        const mappedProducts: ShopProduct[] = data.products.map((p: any) => ({
          id: p.id || `ai-${Math.random()}`,
          title: p.title,
          price: p.price || 999,
          originalPrice: p.originalPrice || 1499,
          discount: p.discount || '35% OFF',
          retailer: p.retailer || 'Amazon India',
          rating: p.rating || 4.6,
          reviews: p.reviews || '2.8k',
          badge: p.badge || 'AI Top Pick',
          featureIcon: p.featureIcon || 'verified',
          featureText: p.featureText || 'Verified high-durability travel gear',
          imageUrl:
            p.imageUrl ||
            (q.toLowerCase().includes('sweater') ? IMAGES.sweaterMerino : IMAGES.genericGear),
          category: p.category || 'clothing',
          keywords: [q.toLowerCase(), p.title.toLowerCase()],
          link: p.link || `https://www.amazon.in/s?k=${encodeURIComponent(p.title)}`,
        }));

        setAiCustomProducts(mappedProducts);
        setAiSummary(data.aiSummary || null);
        setToastMsg(`✓ Gemini AI curated ${mappedProducts.length} items for "${q}"!`);
      }
    } catch (e) {
      console.warn('AI shop search error:', e);
    } finally {
      setIsAiSearching(false);
    }
  };

  // Comprehensive travel products catalog
  const catalog: ShopProduct[] = useMemo(
    () => [
      // Sweaters & Winter Knitwear (Directly satisfies user search for sweaters)
      {
        id: 'prod-merino-wool-sweater',
        title: '100% Pure Merino Wool Thermal Crewneck Travel Sweater',
        price: 1499,
        originalPrice: 2499,
        discount: '40% OFF',
        retailer: 'Amazon India',
        rating: 4.7,
        reviews: '3.4k',
        badge: 'Amazon Prime 1-Day',
        featureIcon: 'dry_cleaning',
        featureText: 'Pure Australian merino wool, odor-resistant, ultralight thermal trap',
        imageUrl: IMAGES.sweaterMerino,
        category: 'winter',
        keywords: [
          'sweater',
          'sweaters',
          'merino wool',
          'knitwear',
          'pullover',
          'warm',
          'winter',
          'cardigan',
          'manali',
          'wool',
        ],
        link: 'https://www.amazon.in/s?k=merino+wool+sweater+men+women',
      },
      {
        id: 'prod-quechua-fleece-sweater',
        title: 'Quechua MH100 Warm Mountain Hiking Fleece Sweater Pullover',
        price: 899,
        originalPrice: 1299,
        discount: 'Decathlon Direct',
        retailer: 'Decathlon',
        rating: 4.8,
        reviews: '5.1k',
        badge: 'Decathlon Best Value',
        featureIcon: 'hiking',
        featureText: 'Brushed microfleece, breathable moisture regulation, sub-10°C rated',
        imageUrl: IMAGES.sweaterFleece,
        category: 'winter',
        keywords: [
          'sweater',
          'sweaters',
          'fleece',
          'quechua',
          'pullover',
          'hiking',
          'mountain',
          'winter',
          'decathlon',
        ],
        link: 'https://www.decathlon.in/search?query=hiking+fleece+sweater',
      },
      {
        id: 'prod-roadster-highneck-sweater',
        title: 'Roadster Aesthetic High-Neck Ribbed Knit Travel Sweater',
        price: 1199,
        originalPrice: 2299,
        discount: '48% OFF',
        retailer: 'Myntra',
        rating: 4.5,
        reviews: '2.6k',
        badge: 'Trending Travel Fit',
        featureIcon: 'auto_awesome',
        featureText: 'Cozy acrylic-cotton blend, wind-stopping high-collar aesthetic fit',
        imageUrl: IMAGES.sweaterKnit,
        category: 'winter',
        keywords: [
          'sweater',
          'sweaters',
          'knit',
          'aesthetic',
          'winter wear',
          'knitwear',
          'high neck',
          'myntra',
        ],
        link: 'https://www.myntra.com/sweaters',
      },
      {
        id: 'prod-highlander-cable-sweater',
        title: 'Highlander Cable-Knit Casual Winter Travel Sweater',
        price: 999,
        originalPrice: 1999,
        discount: '50% OFF',
        retailer: 'Flipkart',
        rating: 4.4,
        reviews: '1.9k',
        badge: 'Flipkart Assured',
        featureIcon: 'checkroom',
        featureText: 'Classic cable pattern, stretch ribbed cuffs and hem, machine washable',
        imageUrl: IMAGES.sweaterKnit,
        category: 'winter',
        keywords: ['sweater', 'sweaters', 'cable knit', 'casual', 'warm', 'winter', 'flipkart'],
        link: 'https://www.flipkart.com/search?q=winter+sweater',
      },
      {
        id: 'prod-columbia-puffer',
        title: 'Columbia Omni-Heat Waterproof Down Puffer Jacket',
        price: 4999,
        originalPrice: 8999,
        discount: '44% OFF',
        retailer: 'Amazon India',
        rating: 4.8,
        reviews: '2.1k',
        badge: 'Sub-Zero -10°C',
        featureIcon: 'ac_unit',
        featureText: 'Thermal reflective lining, 650-fill power down insulation, packable',
        imageUrl: IMAGES.jacketDown,
        category: 'winter',
        keywords: ['jacket', 'puffer', 'winter', 'down jacket', 'snow', 'cold', 'columbia', 'coat'],
        link: 'https://www.amazon.in/s?k=down+puffer+jacket',
      },
      {
        id: 'prod-thermal-vanheusen',
        title: 'Van Heusen Heat-Lock Thermal Top & Bottom Set',
        price: 1199,
        originalPrice: 1899,
        discount: '37% OFF',
        retailer: 'Amazon India',
        rating: 4.5,
        reviews: '3.2k',
        badge: 'Sub-Zero Rated',
        featureIcon: 'heat_pump',
        featureText: 'Heat-lock brushed fleece inside, antibacterial snug warmth',
        imageUrl: IMAGES.powerbank,
        category: 'winter',
        keywords: ['thermal', 'inners', 'warm', 'winter', 'fleece', 'base layer', 'snow', 'long johns'],
        link: 'https://www.amazon.in/s?k=thermal+innerwear+set',
      },
      {
        id: 'prod-quechua-boots',
        title: 'Quechua SH100 Warm Waterproof Hiking & Snow Boots',
        price: 2499,
        originalPrice: 2999,
        discount: 'Decathlon Direct',
        retailer: 'Decathlon',
        rating: 4.6,
        reviews: '1.8k',
        badge: 'Snowproof Grip',
        featureIcon: 'hiking',
        featureText: 'Snow grip Snowcontact sole with waterproof breathable membrane',
        imageUrl: IMAGES.boots,
        category: 'footwear',
        keywords: ['boots', 'shoes', 'hiking', 'snow', 'trekking', 'quechua', 'footwear', 'waterproof'],
        link: 'https://www.decathlon.in/search?query=hiking+boots',
      },
      {
        id: 'prod-boldfit-gloves',
        title: 'Boldfit Touchscreen Windproof Winter Gloves & Mittens',
        price: 449,
        originalPrice: 899,
        discount: '50% OFF',
        retailer: 'Flipkart',
        rating: 4.3,
        reviews: '950',
        badge: 'Touchscreen Tips',
        featureIcon: 'touch_app',
        featureText: 'Non-slip silicone palm grip, works seamlessly on smartphones',
        imageUrl: IMAGES.gloves,
        category: 'winter',
        keywords: ['gloves', 'winter', 'mittens', 'touchscreen', 'cold', 'snow', 'hand wear'],
        link: 'https://www.flipkart.com/search?q=winter+gloves',
      },

      // Beach & Warm Weather Essentials
      {
        id: 'prod-mineral-sunscreen',
        title: 'Reef-Safe SPF 50+ PA++++ Mineral Sunscreen (100ml)',
        price: 599,
        originalPrice: 850,
        discount: '30% OFF',
        retailer: 'Amazon India',
        rating: 4.6,
        reviews: '4.8k',
        badge: 'Water Resistant 80m',
        featureIcon: 'wb_sunny',
        featureText: 'Broad spectrum UVA/UVB zinc oxide, zero white cast',
        imageUrl: IMAGES.sunscreen,
        category: 'beach',
        keywords: ['sunscreen', 'spf', 'lotion', 'sunblock', 'beach', 'goa', 'skin', 'uv', 'sun'],
        link: 'https://www.amazon.in/s?k=reef+safe+mineral+sunscreen+spf+50',
      },
      {
        id: 'prod-linen-shirt',
        title: '100% Pure Breathable Linen Relaxed Travel Shirt',
        price: 1299,
        originalPrice: 2299,
        discount: '43% OFF',
        retailer: 'Myntra',
        rating: 4.5,
        reviews: '2.3k',
        badge: 'Ultra Breathable',
        featureIcon: 'checkroom',
        featureText: 'Natural temperature regulating fabric, breezy coastal fit',
        imageUrl: IMAGES.linenShirt,
        category: 'beach',
        keywords: ['shirt', 'linen', 'clothing', 'beachwear', 'summer', 'casual'],
        link: 'https://www.myntra.com/linen-shirts',
      },
      {
        id: 'prod-swim-trunks',
        title: 'Nabaiji Quick-Dry Water Repellent Beach Shorts',
        price: 799,
        originalPrice: 1199,
        discount: 'Decathlon Direct',
        retailer: 'Decathlon',
        rating: 4.5,
        reviews: '3.1k',
        badge: 'Fast Drying',
        featureIcon: 'pool',
        featureText: 'Chlorine and salt-water resistant with zippered key pocket',
        imageUrl: IMAGES.swimShorts,
        category: 'beach',
        keywords: ['shorts', 'swim', 'trunks', 'beach', 'water', 'quick-dry', 'swimwear'],
        link: 'https://www.decathlon.in/search?query=swim+shorts',
      },

      // Electronics & Luggage
      {
        id: 'prod-powerbank-20k',
        title: 'Mi 20,000mAh 18W Fast Charging Power Bank 3i',
        price: 1699,
        originalPrice: 2199,
        discount: '23% OFF',
        retailer: 'Amazon India',
        rating: 4.5,
        reviews: '124k',
        badge: 'Bestseller',
        featureIcon: 'battery_charging_full',
        featureText: 'Triple port output, flight cabin safe (74Wh), two-way fast charge',
        imageUrl: IMAGES.powerbank,
        category: 'electronics',
        keywords: ['power bank', 'powerbank', 'battery', 'charger', 'fast charging', 'usb', 'gadget'],
        link: 'https://www.amazon.in/s?k=20000mah+power+bank',
      },
      {
        id: 'prod-universal-adapter',
        title: 'All-in-One Universal Travel Adapter (150+ Countries)',
        price: 899,
        originalPrice: 1499,
        discount: '40% OFF',
        retailer: 'Amazon India',
        rating: 4.6,
        reviews: '8.4k',
        badge: 'US/EU/UK/AUS/IND',
        featureIcon: 'power',
        featureText: 'Dual USB + Type C 20W PD, built-in safety fuse and shutter',
        imageUrl: IMAGES.adapter,
        category: 'electronics',
        keywords: ['adapter', 'plug', 'universal', 'travel plug', 'international', 'converter', 'charger'],
        link: 'https://www.amazon.in/s?k=universal+travel+adapter',
      },
      {
        id: 'prod-travel-backpack',
        title: 'Quechua NH Escape 500 (32L) Cabin Carry-On Backpack',
        price: 2499,
        originalPrice: 2999,
        discount: 'Top Rated',
        retailer: 'Decathlon',
        rating: 4.8,
        reviews: '6.4k',
        badge: 'Cabin Approved 7kg',
        featureIcon: 'backpack',
        featureText: '15.6" laptop pocket, secret passport pouch, ventilated back foam',
        imageUrl: IMAGES.backpack,
        category: 'luggage',
        keywords: ['backpack', 'bag', 'cabin', 'luggage', 'rucksack', 'quechua', 'laptop bag'],
        link: 'https://www.decathlon.in/search?query=nh+escape+500',
      },
      {
        id: 'prod-packing-cubes',
        title: '6-Piece Compression Luggage Packing Cubes Set',
        price: 799,
        originalPrice: 1399,
        discount: '43% OFF',
        retailer: 'Amazon India',
        rating: 4.5,
        reviews: '7.8k',
        badge: 'Space Saver 60%',
        featureIcon: 'inventory_2',
        featureText: 'Double compression zipper, water-resistant nylon, separate shoe pouch',
        imageUrl: IMAGES.cubes,
        category: 'luggage',
        keywords: ['packing cubes', 'cubes', 'organizer', 'suitcase', 'compression', 'luggage'],
        link: 'https://www.amazon.in/s?k=compression+packing+cubes',
      },
      {
        id: 'prod-silicone-bottles',
        title: 'Leakproof Silicone Travel Bottles (4-Pack 90ml TSA Size)',
        price: 399,
        originalPrice: 699,
        discount: '43% OFF',
        retailer: 'Amazon India',
        rating: 4.6,
        reviews: '3.8k',
        badge: 'TSA 100ml Flight Pass',
        featureIcon: 'sanitizer',
        featureText: '3-layer leakproof valve, BPA-free food-grade flexible silicone',
        imageUrl: IMAGES.bottles,
        category: 'toiletries',
        keywords: ['bottles', 'shampoo', 'toiletries', 'silicone', 'tsa', 'liquid bottles', 'carry on'],
        link: 'https://www.amazon.in/s?k=silicone+travel+bottles',
      },
    ],
    []
  );

  // Dynamic Marketplace Item Generator for ANY custom user search query (e.g. "sweaters", "gloves", "dji drone", etc.)
  const dynamicQueryProducts = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return [];

    const capitalized = q.charAt(0).toUpperCase() + q.slice(1);
    const lower = q.toLowerCase();

    // Determine relevant image placeholder based on search term
    let previewImg = IMAGES.genericGear;
    if (
      lower.includes('sweater') ||
      lower.includes('knit') ||
      lower.includes('cardigan') ||
      lower.includes('pullover')
    ) {
      previewImg = IMAGES.sweaterMerino;
    } else if (lower.includes('jacket') || lower.includes('coat') || lower.includes('parka')) {
      previewImg = IMAGES.jacketDown;
    } else if (lower.includes('boot') || lower.includes('shoe')) {
      previewImg = IMAGES.boots;
    } else if (lower.includes('bag') || lower.includes('pack')) {
      previewImg = IMAGES.backpack;
    } else if (lower.includes('sunscreen') || lower.includes('cream')) {
      previewImg = IMAGES.sunscreen;
    } else if (lower.includes('shirt') || lower.includes('cloth')) {
      previewImg = IMAGES.linenShirt;
    }

    const dynamicItems: ShopProduct[] = [
      {
        id: `dyn-amazon-${lower.replace(/[^a-z0-9]/g, '-')}`,
        title: `Amazon Prime Bestseller • Premium Travel ${capitalized}`,
        price: 1299,
        originalPrice: 2199,
        discount: '41% OFF',
        retailer: 'Amazon India',
        rating: 4.6,
        reviews: '6.4k',
        badge: 'Amazon Prime 1-Day',
        featureIcon: 'local_shipping',
        featureText: `Fast 1-day delivery to your doorstep before your trip, verified travel gear`,
        imageUrl: previewImg,
        category: 'clothing',
        keywords: [lower, `${lower}s`, 'travel', 'amazon'],
        link: `https://www.amazon.in/s?k=${encodeURIComponent(q)}`,
      },
      {
        id: `dyn-decathlon-${lower.replace(/[^a-z0-9]/g, '-')}`,
        title: `Quechua / Forclaz Outdoor Expedition ${capitalized}`,
        price: 999,
        originalPrice: 1499,
        discount: 'Decathlon Direct',
        retailer: 'Decathlon',
        rating: 4.7,
        reviews: '4.8k',
        badge: 'Decathlon Best Value',
        featureIcon: 'hiking',
        featureText: `Rugged outdoor performance, breathable weather resistance with 2-year warranty`,
        imageUrl: lower.includes('sweater') ? IMAGES.sweaterFleece : previewImg,
        category: 'clothing',
        keywords: [lower, `${lower}s`, 'travel', 'decathlon'],
        link: `https://www.decathlon.in/search?query=${encodeURIComponent(q)}`,
      },
      {
        id: `dyn-myntra-${lower.replace(/[^a-z0-9]/g, '-')}`,
        title: `Roadster / HRX Vacation Collection ${capitalized}`,
        price: 1399,
        originalPrice: 2499,
        discount: '44% OFF',
        retailer: 'Myntra',
        rating: 4.5,
        reviews: '3.1k',
        badge: 'Trending Travel Fit',
        featureIcon: 'auto_awesome',
        featureText: `Curated aesthetic design, lightweight breathable fabric perfect for holiday photos`,
        imageUrl: lower.includes('sweater') ? IMAGES.sweaterKnit : previewImg,
        category: 'clothing',
        keywords: [lower, `${lower}s`, 'travel', 'myntra'],
        link: `https://www.myntra.com/${encodeURIComponent(q.replace(/\s+/g, '-'))}`,
      },
      {
        id: `dyn-flipkart-${lower.replace(/[^a-z0-9]/g, '-')}`,
        title: `Highlander Travel Essentials Pack ${capitalized}`,
        price: 799,
        originalPrice: 1599,
        discount: '50% OFF',
        retailer: 'Flipkart',
        rating: 4.4,
        reviews: '2.9k',
        badge: 'Flipkart Assured',
        featureIcon: 'verified',
        featureText: `Value-for-money travel essential with high durability and easy packability`,
        imageUrl: previewImg,
        category: 'clothing',
        keywords: [lower, `${lower}s`, 'travel', 'flipkart'],
        link: `https://www.flipkart.com/search?q=${encodeURIComponent(q)}`,
      },
    ];

    return dynamicItems;
  }, [searchQuery]);

  // Combined product filtering with smart stemming
  const filteredProducts = useMemo(() => {
    const rawMatches = catalog.filter((p) => {
      // 1. Text search across title, retailer, category, and keywords
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const singular = q.endsWith('s') && q.length > 3 ? q.slice(0, -1) : q;
        const plural = q.endsWith('s') ? q : `${q}s`;

        const matchesTitle =
          p.title.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(singular) ||
          p.title.toLowerCase().includes(plural);

        const matchesCategory = p.category.toLowerCase().includes(q);
        const matchesRetailer = p.retailer.toLowerCase().includes(q);
        const matchesFeature = p.featureText.toLowerCase().includes(q);
        const matchesKeywords = p.keywords.some(
          (k) =>
            k.toLowerCase().includes(q) ||
            k.toLowerCase().includes(singular) ||
            (k.length > 3 && q.includes(k.toLowerCase()))
        );

        if (!matchesTitle && !matchesCategory && !matchesRetailer && !matchesFeature && !matchesKeywords) {
          return false;
        }
      }

      // 2. Store filter
      if (selectedStore !== 'all' && !p.retailer.toLowerCase().includes(selectedStore.toLowerCase())) {
        return false;
      }

      // 3. Category filter (Only applies when not doing specific text search)
      if (!searchQuery.trim()) {
        if (selectedCategory === 'beach' && p.category !== 'beach') return false;
        if (selectedCategory === 'winter' && p.category !== 'winter' && p.category !== 'footwear')
          return false;
        if (selectedCategory === 'electronics' && p.category !== 'electronics') return false;
        if (selectedCategory === 'luggage' && p.category !== 'luggage') return false;
        if (selectedCategory === 'toiletries' && p.category !== 'toiletries') return false;
        if (selectedCategory === 'budget' && p.price >= 1000) return false;
        if (selectedCategory === 'rated' && p.rating < 4.5) return false;
      }

      // 4. Trip-specific filter if explicitly toggled (and user is not searching)
      if (onlyTripRelevant && activeTrip && !searchQuery.trim()) {
        const dest = activeTrip.destination.toLowerCase();
        const isWarm = ['goa', 'bali', 'phuket', 'kerala', 'jaipur'].some((k) => dest.includes(k));
        const isCold = ['manali', 'ladakh', 'spiti', 'kashmir', 'shimla'].some((k) => dest.includes(k));

        if (isWarm && (p.category === 'winter' || p.category === 'footwear')) return false;
        if (isCold && p.category === 'beach') return false;
      }

      return true;
    });

    // If user typed a search query, append dynamic marketplace items if store matches
    if (searchQuery.trim()) {
      const dynamicFiltered = dynamicQueryProducts.filter((dp) => {
        if (selectedStore !== 'all' && !dp.retailer.toLowerCase().includes(selectedStore.toLowerCase())) {
          return false;
        }
        return true;
      });

      // Prepend any AI curated products returned by Gemini
      return [...aiCustomProducts, ...rawMatches, ...dynamicFiltered];
    }

    return aiCustomProducts.length > 0 ? [...aiCustomProducts, ...rawMatches] : rawMatches;
  }, [
    catalog,
    dynamicQueryProducts,
    aiCustomProducts,
    searchQuery,
    selectedCategory,
    selectedStore,
    onlyTripRelevant,
    activeTrip,
  ]);

  const handleSaveToTrip = (prod: ShopProduct | SmartShopRecommendation) => {
    const title = prod.title;
    const retailer = prod.retailer;
    const category = 'category' in prod ? prod.category : 'Clothing & Layers';

    if (activeTrip) {
      const match = activeTrip.items?.find(
        (i) =>
          ('keywords' in prod && prod.keywords.some((k) => i.name.toLowerCase().includes(k))) ||
          i.name.toLowerCase().includes(title.toLowerCase())
      );

      const resolveGearCategory = (cat: string): GearCategory => {
        const c = (cat || '').toLowerCase();
        if (c.includes('footwear') || c.includes('boot') || c.includes('shoe')) return 'Footwear & Boots';
        if (c.includes('toilet') || c.includes('med') || c.includes('health')) return 'Toiletries & Meds';
        if (c.includes('electr') || c.includes('gadget') || c.includes('tech') || c.includes('power')) return 'Electronics & Gadgets';
        if (c.includes('cosmetic') || c.includes('skin') || c.includes('sunscreen')) return 'Cosmetics & Skincare';
        if (c.includes('advent') || c.includes('luggage') || c.includes('bag') || c.includes('cube')) return 'Adventure & Essentials';
        if (c.includes('document') || c.includes('permit') || c.includes('passport')) return 'Travel Documents & Permits';
        return 'Clothing & Layers';
      };

      if (match) {
        updateItemStatus(activeTrip.id, match.id, 'to_buy');
        setToastMsg(`Saved to "${activeTrip.destination}" checklist (${title.slice(0, 24)}...)`);
      } else {
        addCustomItem(activeTrip.id, {
          name: title,
          category: resolveGearCategory(category),
          recommendedQty: '1 unit',
          weightKg: 0.4,
          reason: `Added from Smart Shop (${retailer})`,
          status: 'to_buy',
          priority: 'recommended',
        });
        setToastMsg(`Added "${title.slice(0, 24)}..." to ${activeTrip.destination} checklist!`);
      }
    } else {
      setToastMsg(`Saved to wishlist: ${title.slice(0, 24)}... (Plan a trip to link)`);
    }

    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAddSearchedQueryToTrip = () => {
    if (!searchQuery.trim()) return;
    const clean = searchQuery.trim();
    const capitalized = clean.charAt(0).toUpperCase() + clean.slice(1);

    if (activeTrip) {
      addCustomItem(activeTrip.id, {
        name: capitalized,
        category: 'Clothing & Layers',
        recommendedQty: '1 unit',
        weightKg: 0.4,
        reason: `Added from Travel Store search`,
        status: 'to_buy',
        priority: 'essential',
      });
      setToastMsg(`Added "${capitalized}" to your ${activeTrip.destination} packing checklist!`);
    } else {
      setToastMsg(`Saved "${capitalized}" to wishlist!`);
    }
    setTimeout(() => setToastMsg(null), 3000);
  };

  const activeRetailers = ['All Stores', 'Amazon India', 'Decathlon', 'Myntra', 'Flipkart'];

  return (
    <div className="flex flex-col gap-6 pb-28 pt-20 px-4 sm:px-6 lg:px-8 max-w-6xl xl:max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-18 left-4 right-4 z-50 p-3 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-xl border border-white/20 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-teal-400 text-[18px]">check_circle</span>
            <span>{toastMsg}</span>
          </div>
          <button
            onClick={() => setToastMsg(null)}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Navigation Tabs: Smart Shop (Gemini AI) vs Browse All Stores */}
      <div className="flex rounded-2xl bg-slate-100 p-1 border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('smart_shop')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'smart_shop'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-[17px] text-blue-600">auto_awesome</span>
          <span>Smart Shop (AI)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 font-black">
            Trip Matched
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('browse')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'browse'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-[17px] text-slate-700">storefront</span>
          <span>Browse All Stores</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-bold">
            {catalog.length}
          </span>
        </button>
      </div>

      {/* Universal Search Bar: Search Anything across Amazon, Decathlon, Myntra, Flipkart */}
      <section className="bg-white rounded-2xl p-3 shadow-xs border border-slate-100 flex flex-col gap-2">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3.5 text-slate-400 text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleRunAISearch();
              }
            }}
            placeholder="Search anything (e.g. sweaters, power bank, snow boots, drone)..."
            className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all"
          />

          <div className="absolute right-2 flex items-center gap-1">
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setAiCustomProducts([]);
                  setAiSummary(null);
                }}
                className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[12px] hover:bg-slate-300 cursor-pointer"
                title="Clear"
              >
                ✕
              </button>
            )}
            <button
              type="button"
              onClick={() => handleRunAISearch()}
              disabled={isAiSearching || !searchQuery.trim()}
              title="Search with Gemini AI"
              className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-extrabold flex items-center gap-1 shadow-2xs hover:shadow-xs active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isAiSearching ? (
                <span className="material-symbols-outlined text-[13px] animate-spin">sync</span>
              ) : (
                <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
              )}
              <span>AI Find</span>
            </button>
          </div>
        </div>

        {/* Live Search Stats / Quick Add to Trip / AI Trigger */}
        {searchQuery && (
          <div className="flex flex-col gap-2 pt-1">
            <div className="flex items-center justify-between px-1 text-xs">
              <span className="text-slate-700 font-semibold">
                Showing <strong className="text-blue-600">{filteredProducts.length}</strong> items for &quot;{searchQuery}&quot;
              </span>

              <div className="flex items-center gap-2">
                {activeTrip && (
                  <button
                    type="button"
                    onClick={handleAddSearchedQueryToTrip}
                    className="text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 cursor-pointer flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[13px]">add</span>
                    <span>Add &quot;{searchQuery}&quot; to Checklist</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setAiCustomProducts([]);
                    setAiSummary(null);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* AI Summary Banner if generated */}
            {aiSummary && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-xl p-2.5 flex items-start gap-2 text-xs text-blue-950 animate-in fade-in">
                <span className="material-symbols-outlined text-blue-600 text-[18px] shrink-0 mt-0.5">
                  auto_awesome
                </span>
                <div className="flex-1">
                  <span className="font-extrabold text-[11px] uppercase tracking-wider text-blue-700 block">
                    Gemini AI Shopping Curation
                  </span>
                  <p className="text-xs leading-relaxed text-slate-700 mt-0.5">{aiSummary}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Universal E-Commerce Marketplace Hub: Direct 1-Tap Search on Amazon, Decathlon, Myntra, Flipkart */}
      {searchQuery.trim() && (
        <section className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-200/80 rounded-2xl p-3.5 shadow-xs flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600 text-[20px]">shopping_cart</span>
              <span className="text-xs font-black text-amber-950">
                Buy &quot;{searchQuery}&quot; Directly on Major E-Commerce Stores
              </span>
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
              Live Stores
            </span>
          </div>

          <p className="text-[11px] text-amber-900 leading-snug">
            Need more styles or sizes? Search complete inventories on Amazon, Decathlon, Myntra, and Flipkart with 1 tap:
          </p>

          <div className="grid grid-cols-2 gap-2 pt-0.5">
            {/* Amazon India Direct Search */}
            <a
              href={`https://www.amazon.in/s?k=${encodeURIComponent(searchQuery.trim())}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-amber-200 flex items-center justify-between text-xs font-bold text-slate-900 shadow-2xs group transition-all"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-black">
                  a
                </span>
                <span className="truncate">Amazon India</span>
              </div>
              <span className="material-symbols-outlined text-slate-400 group-hover:text-amber-600 text-[15px]">
                open_in_new
              </span>
            </a>

            {/* Decathlon Direct Search */}
            <a
              href={`https://www.decathlon.in/search?query=${encodeURIComponent(searchQuery.trim())}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-amber-200 flex items-center justify-between text-xs font-bold text-slate-900 shadow-2xs group transition-all"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">
                  D
                </span>
                <span className="truncate">Decathlon</span>
              </div>
              <span className="material-symbols-outlined text-slate-400 group-hover:text-blue-600 text-[15px]">
                open_in_new
              </span>
            </a>

            {/* Myntra Direct Search */}
            <a
              href={`https://www.myntra.com/${encodeURIComponent(searchQuery.trim().replace(/\s+/g, '-'))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-amber-200 flex items-center justify-between text-xs font-bold text-slate-900 shadow-2xs group transition-all"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center text-[10px] font-black">
                  M
                </span>
                <span className="truncate">Myntra Fashion</span>
              </div>
              <span className="material-symbols-outlined text-slate-400 group-hover:text-pink-600 text-[15px]">
                open_in_new
              </span>
            </a>

            {/* Flipkart Direct Search */}
            <a
              href={`https://www.flipkart.com/search?q=${encodeURIComponent(searchQuery.trim())}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-amber-200 flex items-center justify-between text-xs font-bold text-slate-900 shadow-2xs group transition-all"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-yellow-400 text-slate-900 flex items-center justify-center text-[10px] font-black">
                  F
                </span>
                <span className="truncate">Flipkart Deals</span>
              </div>
              <span className="material-symbols-outlined text-slate-400 group-hover:text-yellow-600 text-[15px]">
                open_in_new
              </span>
            </a>
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* TAB 1: SMART SHOP (Gemini AI Destination, Weather & Activity Matching) */}
      {/* ========================================================= */}
      {activeTab === 'smart_shop' && !searchQuery.trim() && (
        <div className="flex flex-col gap-4 animate-in fade-in">
          {/* Destination & Style Selector Hub */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-200/90 flex flex-col gap-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[19px]">explore</span>
                </span>
                <div>
                  <h2 className="text-sm font-black text-slate-900 leading-tight">
                    Select Destination or Travel Style
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {activeTrip
                      ? `Linked to active trip "${activeTrip.destination}". Switch below or explore presets:`
                      : 'Choose a climate preset or type any custom destination to shop:'}
                  </p>
                </div>
              </div>

              {/* My Planned Trips Switcher (if user has trips) */}
              {trips && trips.length > 0 && (
                <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto max-w-full pb-1 sm:pb-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0">
                    My Trips:
                  </span>
                  {trips.map((t) => {
                    const isCurrent = activeTrip?.id === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setActiveTripId(t.id);
                          setActiveCustomDestination(null);
                          const detected = detectPresetForTrip(t);
                          setSelectedThemeId(detected);
                          setToastMsg(`Switched gear matching to "${t.destination}"!`);
                          setTimeout(() => setToastMsg(null), 2500);
                        }}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 border ${
                          isCurrent
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[13px]">flight_takeoff</span>
                        <span>{t.destination}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Travel Vibe & Climate Preset Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {DESTINATION_THEMES.map((theme) => {
                const isSelected = selectedThemeId === theme.id && !activeCustomDestination;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => {
                      setSelectedThemeId(theme.id);
                      setActiveCustomDestination(null);
                      setToastMsg(`Switched to "${theme.label}" gear preset!`);
                      setTimeout(() => setToastMsg(null), 2500);
                    }}
                    className={`p-2.5 rounded-2xl flex flex-col items-start gap-1 text-left transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-500 shadow-xs ring-2 ring-blue-500/20'
                        : 'bg-slate-50/80 hover:bg-white hover:border-slate-300 border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`material-symbols-outlined text-[18px] ${
                          isSelected ? 'text-blue-600' : 'text-slate-500'
                        }`}
                      >
                        {theme.icon}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                      )}
                    </div>
                    <span
                      className={`text-xs font-black leading-tight line-clamp-1 ${
                        isSelected ? 'text-blue-900' : 'text-slate-800'
                      }`}
                    >
                      {theme.label}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium line-clamp-1">
                      {theme.tempRange}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Destination Input */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1 flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">
                  pin_drop
                </span>
                <input
                  type="text"
                  value={customDestinationQuery}
                  onChange={(e) => setCustomDestinationQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleApplyCustomDestination();
                    }
                  }}
                  placeholder="Or enter any custom destination (e.g. Dubai, Switzerland, Bali, Kerala, Tokyo)..."
                  className="w-full pl-9 pr-20 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all"
                />
                {customDestinationQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomDestinationQuery('');
                      setActiveCustomDestination(null);
                    }}
                    className="absolute right-12 w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-[11px] flex items-center justify-center hover:bg-slate-300 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleApplyCustomDestination()}
                  disabled={!customDestinationQuery.trim()}
                  className="absolute right-1.5 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-[11px] font-bold cursor-pointer transition-all"
                >
                  Apply
                </button>
              </div>

              {activeCustomDestination && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 shrink-0">
                  <span className="font-bold">Active:</span>
                  <span className="font-extrabold text-blue-700">{activeCustomDestination}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCustomDestination(null);
                      setCustomDestinationQuery('');
                    }}
                    className="ml-1 text-slate-400 hover:text-slate-700 font-black cursor-pointer"
                    title="Reset custom destination"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Trip Profile Analysis Header Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-blue-800 to-teal-800 p-5 text-white shadow-md border border-white/10">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-teal-200 text-[11px] font-extrabold w-fit mb-2 uppercase tracking-wider border border-white/10">
                  <span className="material-symbols-outlined text-[15px] animate-pulse">
                    auto_awesome
                  </span>
                  <span>Instant Smart Shop • Climate & Gear Matching</span>
                </div>

                <h1 className="text-xl font-black text-white leading-tight">
                  Curated Gear for {effectiveDestination}
                </h1>

                <p className="text-xs text-blue-100 mt-1 opacity-90 leading-relaxed max-w-md">
                  Tailored gear matching {effectiveDestination}&apos;s real-time climate ({effectiveTempRange}) and activities with direct purchase links to Amazon, Decathlon, Myntra, and Flipkart.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleFetchSmartShop(selectedThemeId, activeCustomDestination || undefined)}
                disabled={isAnalyzingSmartShop}
                className="shrink-0 px-3.5 py-2 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 border border-white/20 shadow-xs cursor-pointer transition-all"
                title="Re-analyze trip with Gemini AI"
              >
                <span
                  className={`material-symbols-outlined text-[16px] ${
                    isAnalyzingSmartShop ? 'animate-spin text-teal-300' : ''
                  }`}
                >
                  sync
                </span>
                <span>{isAnalyzingSmartShop ? 'Analyzing...' : 'Re-Analyze with AI'}</span>
              </button>
            </div>

            {/* Profile Badges Grid: Destination, Expected Temp Range, Activity Profile */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/15 text-xs">
              <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm flex flex-col gap-0.5">
                <span className="text-[10px] uppercase font-bold text-blue-200 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">location_on</span>
                  <span>Destination</span>
                </span>
                <span className="font-extrabold text-white truncate">
                  {effectiveDestination}
                </span>
                <span className="text-[10px] text-teal-200 font-medium truncate">
                  {activeTrip ? 'Active Planned Trip' : currentTheme.label}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm flex flex-col gap-0.5">
                <span className="text-[10px] uppercase font-bold text-amber-200 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">thermostat</span>
                  <span>Expected Weather</span>
                </span>
                <span className="font-extrabold text-white truncate">
                  {effectiveTempRange}
                </span>
                <span className="text-[10px] text-amber-200 font-medium truncate">
                  {effectiveClimateTitle}
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-white/10 backdrop-blur-sm flex flex-col gap-0.5">
                <span className="text-[10px] uppercase font-bold text-teal-200 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">hiking</span>
                  <span>Activities Focus</span>
                </span>
                <span className="font-extrabold text-white truncate">
                  {effectiveActivities[0] || 'Transit & Sightseeing'}
                </span>
                <span className="text-[10px] text-teal-100 font-medium truncate">
                  {effectiveActivities.slice(1).join(', ') || 'Local Exploration'}
                </span>
              </div>
            </div>
          </div>

          {/* AI Analysis Strategy Banner */}
          {smartShopData?.analysisSummary && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/90 rounded-2xl p-4 shadow-xs flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <span className="material-symbols-outlined text-[16px]">psychology</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 block">
                      Gemini Smart Shop Analysis
                    </span>
                    <h4 className="text-xs font-black text-slate-900 leading-tight">
                      Climate & Activity Packing Strategy
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold border border-blue-200">
                    {smartShopData.climateBadge}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed mt-0.5">
                {smartShopData.analysisSummary}
              </p>

              {smartShopData.estimatedShopBudgetINR > 0 && (
                <div className="pt-2 border-t border-blue-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    Estimated gear budget across recommendations:
                  </span>
                  <span className="font-black text-blue-700">
                    ≈ ₹{smartShopData.estimatedShopBudgetINR.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Non-blocking live analysis banner */}
          {isAnalyzingSmartShop && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 via-teal-50 to-indigo-50 border border-blue-200 text-xs text-blue-900 flex items-center justify-between shadow-2xs animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center animate-spin shrink-0">
                  <span className="material-symbols-outlined text-[15px]">sync</span>
                </div>
                <div>
                  <span className="font-extrabold text-blue-950 block">
                    Gemini AI is analyzing custom gear for &quot;{effectiveDestination}&quot;...
                  </span>
                  <span className="text-[11px] text-blue-700 font-medium">
                    Current curated items remain ready to browse while AI refines climate-specific options.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error notice if any */}
          {smartShopError && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
              <span>{smartShopError}</span>
              <button
                type="button"
                onClick={() => handleFetchSmartShop(selectedThemeId, activeCustomDestination || undefined)}
                className="font-bold underline text-amber-800 cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* Smart Shop Recommendations Cards List */}
          {smartShopData && smartShopData.recommendations && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-blue-600 text-[18px]">
                    verified
                  </span>
                  <span>Targeted Gear Recommendations ({smartShopData.recommendations.length})</span>
                </h3>
                <span className="text-xs text-slate-500 font-bold">
                  Direct Buy Links & Best Prices
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {smartShopData.recommendations.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-4 shadow-xs border border-slate-200/90 hover:shadow-md transition-all flex flex-col gap-3 group"
                >
                  {/* Top Bar: Category Pill & Store Badge & Spec */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {item.category}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {item.badge}
                      </span>
                      {item.specPill && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                          {item.specPill}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Photo Showcase */}
                  <div className="relative w-full h-44 rounded-2xl bg-slate-100 overflow-hidden shadow-2xs group-hover:shadow-xs transition-all">
                    <img
                      src={resolveGearImage(item)}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-slate-800 text-[11px] font-bold shadow-xs border border-slate-200/50">
                      <span className="material-symbols-outlined text-[13px] text-amber-600">
                        storefront
                      </span>
                      <span>{item.retailer}</span>
                    </div>
                    {item.discount && (
                      <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-emerald-600 text-white text-[10px] font-extrabold shadow-xs">
                        {item.discount}
                      </div>
                    )}
                  </div>

                  {/* Title & Price Line */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col">
                      <h4 className="text-sm font-black text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-base font-black text-blue-600">
                          ₹{item.priceINR.toLocaleString()}
                        </span>
                        {item.originalPriceINR > item.priceINR && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{item.originalPriceINR.toLocaleString()}
                          </span>
                        )}
                        <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100">
                          {item.discount}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-semibold text-slate-600 flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[14px] text-amber-500">
                            star
                          </span>
                          <span>{item.rating}</span>
                          <span className="text-[10px] text-slate-400">({item.reviews})</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dual Match Reasons: Weather Match + Activity Match */}
                  <div className="flex flex-col gap-2 pt-1 text-xs">
                    {/* Weather Match Reason */}
                    <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-950 flex items-start gap-2">
                      <span className="material-symbols-outlined text-amber-600 text-[18px] shrink-0 mt-0.5">
                        thermostat
                      </span>
                      <div className="flex-1">
                        <strong className="font-extrabold text-[11px] uppercase tracking-wide text-amber-900 block">
                          Weather Match ({effectiveTempRange})
                        </strong>
                        <p className="text-[11px] leading-snug mt-0.5 text-amber-900/90">
                          {item.weatherMatchReason}
                        </p>
                      </div>
                    </div>

                    {/* Activity Match Reason */}
                    <div className="p-2.5 rounded-xl bg-teal-50/80 border border-teal-200/80 text-teal-950 flex items-start gap-2">
                      <span className="material-symbols-outlined text-teal-600 text-[18px] shrink-0 mt-0.5">
                        hiking
                      </span>
                      <div className="flex-1">
                        <strong className="font-extrabold text-[11px] uppercase tracking-wide text-teal-900 block">
                          Activity Match ({effectiveActivities[0] || 'Travel & Exploration'})
                        </strong>
                        <p className="text-[11px] leading-snug mt-0.5 text-teal-900/90">
                          {item.activityMatchReason}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Direct Multi-Store Search Launcher */}
                  <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-100">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Search & Compare on Major E-Commerce Stores:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      <a
                        href={item.directSearchLinks.amazon}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-[11px] font-bold text-slate-800 flex items-center justify-between transition-all"
                      >
                        <span className="truncate">Amazon</span>
                        <span className="material-symbols-outlined text-[13px] text-amber-600">
                          open_in_new
                        </span>
                      </a>

                      <a
                        href={item.directSearchLinks.decathlon}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-[11px] font-bold text-slate-800 flex items-center justify-between transition-all"
                      >
                        <span className="truncate">Decathlon</span>
                        <span className="material-symbols-outlined text-[13px] text-blue-600">
                          open_in_new
                        </span>
                      </a>

                      <a
                        href={item.directSearchLinks.myntra}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-pink-50 border border-slate-200 hover:border-pink-300 text-[11px] font-bold text-slate-800 flex items-center justify-between transition-all"
                      >
                        <span className="truncate">Myntra</span>
                        <span className="material-symbols-outlined text-[13px] text-pink-600">
                          open_in_new
                        </span>
                      </a>

                      <a
                        href={item.directSearchLinks.flipkart}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-yellow-50 border border-slate-200 hover:border-yellow-300 text-[11px] font-bold text-slate-800 flex items-center justify-between transition-all"
                      >
                        <span className="truncate">Flipkart</span>
                        <span className="material-symbols-outlined text-[13px] text-yellow-600">
                          open_in_new
                        </span>
                      </a>
                    </div>
                  </div>

                  {/* Primary Action Buttons: Direct Purchase on Preferred Store + Save to Trip */}
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={item.preferredRetailerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <span>Buy on {item.retailer}</span>
                      <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleSaveToTrip(item)}
                      className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-800 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                      title="Save to Checklist"
                    >
                      <span className="material-symbols-outlined text-[16px] text-blue-600">
                        bookmark_add
                      </span>
                      <span>Save to Trip</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )}

      {/* ========================================================= */}
      {/* TAB 2 or SEARCH RESULTS: BROWSE ALL STORES & CATALOG */}
      {/* ========================================================= */}
      {(activeTab === 'browse' || Boolean(searchQuery.trim())) && (
        <div className="flex flex-col gap-4 animate-in fade-in">
          {/* Header Banner: Clean store header */}
          {!searchQuery.trim() && (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-teal-700 p-4 text-white shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col min-w-0">
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-extrabold w-fit mb-1.5 uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[13px]">
                      {activeTrip ? 'travel_explore' : 'shopping_bag'}
                    </span>
                    <span>{activeTrip ? `Gear for ${activeTrip.destination}` : 'Travel Essentials Store'}</span>
                  </div>

                  <h1 className="text-xl font-black leading-tight text-white">
                    {activeTrip ? `Complete Your ${activeTrip.destination} Gear` : 'Travel Gear & Essentials Store'}
                  </h1>

                  <p className="text-xs text-blue-100 mt-1 opacity-90 leading-snug">
                    {activeTrip
                      ? `Tailored gear recommendations for ${activeTrip.destination} (${activeTrip.tempRange || 'upcoming journey'}). Compare best deals across Amazon, Decathlon, Myntra & Flipkart.`
                      : 'Verified luggage, apparel, tech essentials, weather protection & accessories with price comparisons across top stores.'}
                  </p>

                  {/* If user has an active trip, allow 1-tap toggle between "All Gear" and "Tailored for Trip" */}
                  {activeTrip && !searchQuery && (
                    <div className="pt-2.5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setOnlyTripRelevant(!onlyTripRelevant)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          onlyTripRelevant
                            ? 'bg-teal-300 text-teal-950 shadow-xs'
                            : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          {onlyTripRelevant ? 'check_circle' : 'filter_alt'}
                        </span>
                        <span>
                          {onlyTripRelevant
                            ? `Filtered for ${activeTrip.destination}`
                            : `Tailor for ${activeTrip.destination}`}
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20">
                  <span className="text-xl font-black text-teal-300 leading-none">
                    {filteredProducts.length}
                  </span>
                  <span className="text-[9px] font-bold opacity-80 mt-0.5 uppercase tracking-wider">
                    Items
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Category Filter Chips (when not in specific search mode) */}
          {!searchQuery && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-4 px-4 py-1">
              {[
                { id: 'all', label: `All Gear (${catalog.length})` },
                { id: 'winter', label: 'Winter & Sweaters' },
                { id: 'beach', label: 'Beach & Coastal' },
                { id: 'electronics', label: 'Electronics & Tech' },
                { id: 'luggage', label: 'Luggage & Cubes' },
                { id: 'toiletries', label: 'Toiletries & Health' },
              ].map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
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
          )}

          {/* Store Filter Chips */}
          <div className="flex items-center gap-2 px-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Store:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {activeRetailers.map((st) => {
                const val = st === 'All Stores' ? 'all' : st;
                const isSelected = selectedStore === val;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSelectedStore(val)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="flex flex-col bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden transition-all hover:shadow-md"
                >
                  {/* Product Thumbnail & Retailer Pill */}
                  <div className="relative w-full h-44 bg-slate-100 overflow-hidden">
                    <img src={prod.imageUrl} alt={prod.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-slate-800 text-[11px] font-bold shadow-xs">
                      <span className="material-symbols-outlined text-[14px] text-amber-600">
                        storefront
                      </span>
                      <span>{prod.retailer}</span>
                    </div>
                    {prod.badge && (
                      <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold shadow-xs">
                        {prod.badge}
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-4 flex flex-col gap-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-col min-w-0">
                        <h3 className="text-sm font-extrabold text-slate-900 line-clamp-1">
                          {prod.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-base font-extrabold text-blue-600">
                            ₹{prod.price.toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-400 line-through">
                            ₹{prod.originalPrice.toLocaleString()}
                          </span>
                          <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                            {prod.discount}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-100 text-slate-800 shrink-0">
                        <span className="material-symbols-outlined text-[16px] text-amber-500">
                          star
                        </span>
                        <span className="text-xs font-bold">{prod.rating}</span>
                        <span className="text-[10px] text-slate-400">({prod.reviews})</span>
                      </div>
                    </div>

                    {/* Key Benefit Highlight */}
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 text-xs">
                      <span className="material-symbols-outlined text-teal-600 text-[18px] shrink-0">
                        {prod.featureIcon}
                      </span>
                      <span className="truncate">{prod.featureText}</span>
                    </div>

                    {/* Action Buttons: View on Store & Save to Checklist */}
                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={prod.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                      >
                        <span>Buy on {prod.retailer}</span>
                        <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => handleSaveToTrip(prod)}
                        className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-800 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                        title="Save to Checklist"
                      >
                        <span className="material-symbols-outlined text-[16px] text-blue-600">
                          bookmark_add
                        </span>
                        <span>Save to Trip</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* No Results Fallback with Direct External Store Search */
            <div className="p-8 bg-white rounded-3xl border border-slate-200/90 shadow-xs flex flex-col items-center justify-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl font-black">
                🛍️
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900">
                  Search &quot;{searchQuery}&quot; Directly on Major Stores
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  You can purchase anything and everything on Amazon India, Decathlon, Myntra, and Flipkart with direct 1-tap links:
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 w-full max-w-md pt-2">
                <a
                  href={`https://www.amazon.in/s?k=${encodeURIComponent(searchQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-xs"
                >
                  <span>Amazon India</span>
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </a>
                <a
                  href={`https://www.decathlon.in/search?query=${encodeURIComponent(searchQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-xs"
                >
                  <span>Decathlon</span>
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </a>
                <a
                  href={`https://www.myntra.com/${encodeURIComponent(searchQuery.replace(/\s+/g, '-'))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-xs"
                >
                  <span>Myntra</span>
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </a>
                <a
                  href={`https://www.flipkart.com/search?q=${encodeURIComponent(searchQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-slate-900 text-xs font-bold flex items-center justify-center gap-1 shadow-xs"
                >
                  <span>Flipkart</span>
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </a>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleRunAISearch(searchQuery)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                  <span>Ask Gemini AI to Find Items</span>
                </button>
                {activeTrip && (
                  <button
                    type="button"
                    onClick={handleAddSearchedQueryToTrip}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px] text-teal-600">add</span>
                    <span>Add to Trip Checklist</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
