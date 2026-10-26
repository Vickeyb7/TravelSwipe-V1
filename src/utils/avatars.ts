import femaleVectorAvatar from '../assets/images/traveler_vector_avatar_1792329777906.jpg';
import maleVectorAvatar from '../assets/images/traveler_male_vector_1792329798177.jpg';

export interface VectorAvatarOption {
  id: string;
  name: string;
  url: string;
  tag: string;
}

export const HUMAN_VECTOR_AVATARS: VectorAvatarOption[] = [
  {
    id: 'female-explorer',
    name: 'Explorer Mia',
    url: femaleVectorAvatar,
    tag: 'Mountain & Trails',
  },
  {
    id: 'male-explorer',
    name: 'Explorer Leo',
    url: maleVectorAvatar,
    tag: 'Adventure Trekker',
  },
];

export const DEFAULT_HUMAN_AVATAR = femaleVectorAvatar;

/**
 * Returns a vector avatar generated from the user's email ID.
 * When somebody signs in using Instagram or Gmail and hasn't setup their profile pic,
 * this gives them a customized vector avatar seeded by their email address.
 */
export function getEmailVectorAvatar(email: string, name?: string): string {
  if (!email || !email.trim()) return DEFAULT_HUMAN_AVATAR;
  const cleanEmail = email.toLowerCase().trim();
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
    cleanEmail
  )}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

export function generateSvgDataUriForEmail(email: string, displayName?: string): string {
  const cleanEmail = (email || 'traveler@tripswipe.app').toLowerCase().trim();
  const handle = cleanEmail.split('@')[0] || displayName || 'Traveler';
  const initial = (displayName || handle || 'T').charAt(0).toUpperCase();

  // Consistent hash for color palette
  let hash = 0;
  for (let i = 0; i < cleanEmail.length; i++) {
    hash = (hash << 5) - hash + cleanEmail.charCodeAt(i);
    hash |= 0;
  }
  const palettes = [
    { bg1: '#1E3A8A', bg2: '#3B82F6', accent: '#60A5FA', badge: '#DBEAFE', text: '#1E40AF' },
    { bg1: '#0F766E', bg2: '#14B8A6', accent: '#2DD4BF', badge: '#CCFBF1', text: '#115E59' },
    { bg1: '#581C87', bg2: '#8B5CF6', accent: '#A78BFA', badge: '#EDE9FE', text: '#6D28D9' },
    { bg1: '#9A3412', bg2: '#F97316', accent: '#FB923C', badge: '#FFEDD5', text: '#C2410C' },
    { bg1: '#065F46', bg2: '#10B981', accent: '#34D399', badge: '#D1FAE5', text: '#047857' },
  ];
  const p = palettes[Math.abs(hash) % palettes.length];
  const displayHandle = handle.length > 10 ? `${handle.slice(0, 9)}…` : handle;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${p.bg1}" />
        <stop offset="100%" stop-color="${p.bg2}" />
      </linearGradient>
      <clipPath id="circleClip">
        <circle cx="60" cy="60" r="56" />
      </clipPath>
    </defs>
    <!-- Background Circle with border -->
    <circle cx="60" cy="60" r="58" fill="${p.accent}" opacity="0.3" />
    <circle cx="60" cy="60" r="56" fill="url(#grad)" />
    <!-- Vector Human Traveler Silhouette -->
    <g clip-path="url(#circleClip)">
      <!-- Head / Beanie -->
      <circle cx="60" cy="42" r="16" fill="#FDE68A" />
      <path d="M44 40 C44 28 76 28 76 40 Z" fill="${p.accent}" />
      <!-- Torso / Jacket -->
      <path d="M30 92 C32 64 88 64 90 92 Z" fill="#FFFFFF" opacity="0.95" />
      <path d="M42 92 C44 72 76 72 78 92 Z" fill="${p.bg1}" opacity="0.2" />
      <!-- Initial Badge on Chest -->
      <circle cx="60" cy="74" r="11" fill="${p.bg1}" />
      <text x="60" y="78" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle">${initial}</text>
    </g>
    <!-- Outer Glow Ring -->
    <circle cx="60" cy="60" r="56" fill="none" stroke="${p.accent}" stroke-width="2.5" opacity="0.8" />
    <!-- Email Pill Banner across bottom -->
    <rect x="14" y="94" width="92" height="18" rx="9" fill="${p.badge}" stroke="#FFFFFF" stroke-width="1.5" />
    <text x="60" y="106" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="8.5" font-weight="800" fill="${p.text}" text-anchor="middle">${displayHandle}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
