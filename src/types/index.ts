export type PackingStatus = 'own' | 'to_buy' | 'packed' | 'skip';

export type GearCategory =
  | 'Clothing & Layers'
  | 'Footwear & Boots'
  | 'Toiletries & Meds'
  | 'Electronics & Gadgets'
  | 'Travel Documents & Permits'
  | 'Cosmetics & Skincare'
  | 'Adventure & Essentials';

export interface RetailerOption {
  retailer: 'Amazon India' | 'Myntra' | 'Flipkart' | 'Decathlon';
  title: string;
  price: number;
  originalPrice: number;
  discountPct: number;
  rating: number;
  reviewCount: string;
  badge?: string;
  deliveryTime: string;
  colorOrStyle: string;
  material: string;
  specPill: string;
  checkoutUrl: string;
  imageUrl: string;
  isBestValue?: boolean;
  isTopWarmth?: boolean;
  isBudgetPick?: boolean;
}

export interface PackingItem {
  id: string;
  name: string;
  category: GearCategory;
  recommendedQty: string;
  weightKg: number;
  reason: string;
  status: PackingStatus;
  priority: 'essential' | 'recommended' | 'optional';
  subZeroOrSpecial?: boolean;
  characteristics?: string[];
  retailerOptions?: RetailerOption[];
  isCustomAdded?: boolean;
}

export interface TravelDocument {
  id: string;
  tripId: string;
  type: 'flight' | 'hotel' | 'permit' | 'cab' | 'insurance';
  title: string;
  subtitle: string;
  categoryLabel: string;
  badge: string;
  badgeColor?: string;
  metric1Label: string;
  metric1Val: string;
  metric2Label: string;
  metric2Val: string;
  fileDocName: string;
  fileSize: string;
  isOfflineCached: boolean;
  qrPayload?: string;
  isCryptographicallySigned?: boolean;
}

export interface Trip {
  id: string;
  destination: string;
  region: string;
  datesText: string;
  startDate: string;
  endDate: string;
  durationNights: number;
  durationDays: number;
  daysAway: number;
  party: 'solo' | 'couple' | 'family' | 'group';
  partyLabel: string;
  purposes: string[];
  activities: string[];
  style: string;
  luggageType: string;
  budgetTier: string;
  hasTechKit: boolean;
  heroImage: string;
  scenicImage: string;
  tag: string;
  tempRange: string;
  climateTitle: string;
  climateNote: string;
  packingRules: string[];
  status: 'active' | 'planning' | 'past' | 'draft';
  isFavorite?: boolean;
  isFrequent?: boolean;
  isCuratedPreview?: boolean;
  items: PackingItem[];
  documents: TravelDocument[];
}

export interface UserProfile {
  name: string;
  email: string;
  badge: string;
  tripsCount: number;
  level: number;
  avatarUrl: string;
  weightSavedKg: number;
  checklistRate: number;
  statesVisited: number;
  packingStyle: string;
  packingTags: string[];
  luggageDefault: string;
  climateAlertsEnabled: boolean;
  preferredRetailers: string[];
  defaultBudget: string;
  isGuest: boolean;
}
