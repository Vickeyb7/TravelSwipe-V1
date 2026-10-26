import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTrips } from '../context/TripsContext';
import {
  HUMAN_VECTOR_AVATARS,
  DEFAULT_HUMAN_AVATAR,
  generateSvgDataUriForEmail,
  VectorAvatarOption,
} from '../utils/avatars';

interface ProfileScreenProps {
  onOpenAuth: () => void;
  onOpenWalkaround?: () => void;
  onOpenShare?: () => void;
  onOpenInstallMobile?: () => void;
}

const PACKING_STYLES = [
  {
    title: 'Casual & Practical (Merino wool & layered gear)',
    description: 'Versatile layers, quick-drying textiles, comfortable walking footwear.',
    tags: ['Ultralight Layers', 'Quick-Dry Fabrics', 'Minimal Shoes (x2)'],
    icon: 'dry_cleaning',
  },
  {
    title: 'Ultra Cozy (Heavy joggers, oversized hoodies)',
    description: 'Fleece-lined sweatpants, thermal hoodies, and maximum warmth relaxation.',
    tags: ['Fleece Hoodies', 'Thermal Joggers', 'Cozy Knitwear', 'Indoor Booties'],
    icon: 'airline_seat_recline_extra',
  },
  {
    title: 'Aesthetic Gram (Trench coats, beanies & knitwear)',
    description: 'Curated statement coats, matching beanies, and camera-ready travel outfits.',
    tags: ['Statement Coats', 'Merino Beanies', 'Chic Boots', 'Photo Accessories'],
    icon: 'auto_awesome',
  },
  {
    title: 'Ultralight (Merino wool capsule wardrobe)',
    description: 'Minimalist 3-day capsule, sink-washable merino, single carry-on bag.',
    tags: ['Capsule Wardrobe', 'Sink Washable', 'Ultralight Pack', 'Sub-7kg'],
    icon: 'compress',
  },
];

const LUGGAGE_OPTIONS = [
  {
    title: 'Cabin Luggage (7kg) + Aeroplane Check-in Luggage (15–20kg)',
    subtitle: 'Dual Flight Allowance • 7kg overhead trolley + 15–20kg checked bag',
    weightDesc: 'Total: 22–27 kg limit',
    icon: 'luggage',
    badge: 'Popular Combo',
  },
  {
    title: 'Cabin Trolley Only (7–10kg Overhead)',
    subtitle: 'Fast airport transit, overhead compartment only, zero baggage belt queues',
    weightDesc: 'Strict 7–10 kg limit',
    icon: 'flight_takeoff',
    badge: 'Fast Travel',
  },
  {
    title: 'Aeroplane Check-in Luggage (15–25kg Full Suitcase)',
    subtitle: 'Large hardshell with ample room for heavy winter jackets, boots & liquids',
    weightDesc: '15–25 kg checked weight',
    icon: 'business_center',
    badge: 'Spacious',
  },
  {
    title: '50–65L Trekking Backpack + 7kg Cabin Daypack',
    subtitle: 'Ideal for steep mountain stairs, snowy trails, road trips & bus transits',
    weightDesc: 'Rugged terrain load',
    icon: 'backpack',
    badge: 'Adventure',
  },
  {
    title: 'International Flight (2x 23kg Check-in + 8kg Cabin)',
    subtitle: 'Long-haul dual piece allowance for overseas study, family visits & tours',
    weightDesc: 'Up to 54 kg total allowance',
    icon: 'flight',
    badge: 'Long-Haul',
  },
  {
    title: 'Duffle Bag (10–12kg) Weekend Getaway',
    subtitle: 'Flexible soft duffle for road trips, Vande Bharat train berths & short escapes',
    weightDesc: '10–12 kg soft bag',
    icon: 'shopping_bag',
    badge: 'Weekend',
  },
];

const BUDGET_OPTIONS = [
  {
    title: 'Value Finds (₹)',
    subtitle: 'Local gear rental, budget combo packs & affordable essentials',
    symbol: '₹',
  },
  {
    title: 'Mid-range (₹₹ • Optimal)',
    subtitle: 'Decathlon, Puma & verified durable brands (Value & Durable)',
    symbol: '₹₹',
  },
  {
    title: 'Premium Alpine (₹₹₹)',
    subtitle: 'Columbia, Forclaz Pro & specialized mountaineering apparel',
    symbol: '₹₹₹',
  },
];

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onOpenAuth,
  onOpenWalkaround,
  onOpenShare,
  onOpenInstallMobile,
}) => {
  const { currentUser, userProfile, logout, updateUserProfilePreferences } = useAuth();
  const { trips } = useTrips();
  const [climateAlerts, setClimateAlerts] = useState(userProfile?.climateAlertsEnabled ?? true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modals for customizations
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);
  const [isLuggageModalOpen, setIsLuggageModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleSelectVectorAvatar = async (avatar: VectorAvatarOption) => {
    await updateUserProfilePreferences({ avatarUrl: avatar.url });
    setIsAvatarModalOpen(false);
    setToastMsg(`Profile pic updated to vector photo: ${avatar.name}`);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleSelectEmailAvatar = async () => {
    const emailToUse = userProfile?.email || currentUser?.email || 'traveler@tripswipe.app';
    const emailAvatar = generateSvgDataUriForEmail(emailToUse, userProfile?.name);
    await updateUserProfilePreferences({ avatarUrl: emailAvatar });
    setIsAvatarModalOpen(false);
    setToastMsg('Profile pic updated to your Email ID avatar');
    setTimeout(() => setToastMsg(null), 2500);
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tripswipe.app';
  const referralCode = userProfile?.name
    ? userProfile.name.toLowerCase().replace(/[^a-z0-9]/g, '')
    : 'explorer';
  const inviteLink = `${origin}?ref=${referralCode}`;
  const shareText = `Hey! I'm using TripSwipe to plan trips, check airline baggage limits, and generate AI climate-safe packing lists. Plan and pack together with me: ${inviteLink}`;

  const handleCopyInviteLink = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(inviteLink);
      } else {
        const input = document.createElement('input');
        input.value = inviteLink;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopiedLink(true);
      setToastMsg('Invite link copied to clipboard!');
      setTimeout(() => {
        setCopiedLink(false);
        setToastMsg(null);
      }, 2500);
    } catch {
      setToastMsg('Failed to copy link');
      setTimeout(() => setToastMsg(null), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'TripSwipe • Smart AI Travel Packing & Radar',
          text: `Hey! Plan and pack trips with me on TripSwipe: smart luggage limits, AI checklists & real-time weather radar.`,
          url: inviteLink,
        });
        setToastMsg('Invitation shared!');
        setTimeout(() => setToastMsg(null), 2000);
      } catch {
        // Dismissed
      }
    } else if (onOpenShare) {
      onOpenShare();
    } else {
      handleCopyInviteLink();
    }
  };

  // Determine if user is a first time visitor / not logged in or has no trips
  const isFirstTimeVisitor = !currentUser || !trips || trips.length === 0;

  // Real calculations when user has logged in and has created trips
  const userTrips = currentUser ? trips || [] : [];
  const tripsCount = userTrips.length;

  const uniqueDestinations = new Set(
    userTrips.map((t) => t.destination.split(',')[0].trim()).filter(Boolean)
  );
  const statesVisitedCount = uniqueDestinations.size;

  let totalItemsCount = 0;
  let packedItemsCount = 0;
  userTrips.forEach((t) => {
    (t.items || []).forEach((item) => {
      totalItemsCount++;
      if (item.status === 'packed') packedItemsCount++;
    });
  });

  const checklistRate =
    totalItemsCount > 0 ? Math.round((packedItemsCount / totalItemsCount) * 100) : 0;

  // Weight saved: ~2.6 kg saved per optimized trip
  const weightSavedKg = Number((tripsCount * 2.6).toFixed(1));

  // Determine user level & badge
  const userLevel = currentUser && tripsCount > 0 ? Math.min(5, Math.max(1, tripsCount + 1)) : 1;
  const userBadge = currentUser && tripsCount > 0
    ? tripsCount >= 3
      ? 'PRO Packer'
      : tripsCount >= 1
      ? 'Active Explorer'
      : 'New Explorer'
    : 'New Explorer';

  const handleToggleAlerts = async () => {
    const newVal = !climateAlerts;
    setClimateAlerts(newVal);
    await updateUserProfilePreferences({ climateAlertsEnabled: newVal });
    setToastMsg(newVal ? 'Weather & Monsoon alerts enabled' : 'Weather alerts muted');
    setTimeout(() => setToastMsg(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setToastMsg('Please choose an image file (PNG, JPG, WebP)');
      setTimeout(() => setToastMsg(null), 2500);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          updateUserProfilePreferences({ avatarUrl: compressedDataUrl });
          setToastMsg('Profile photo updated successfully!');
          setTimeout(() => setToastMsg(null), 2500);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateUserProfilePreferences({ avatarUrl: '' });
    setToastMsg('Profile photo reset to blank');
    setTimeout(() => setToastMsg(null), 2000);
  };

  const handleSignOut = async () => {
    await logout();
    setToastMsg('Signed out of TripSwipe');
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleSelectPackingStyle = async (styleOption: typeof PACKING_STYLES[0]) => {
    await updateUserProfilePreferences({
      packingStyle: styleOption.title,
      packingTags: styleOption.tags,
    });
    setIsStyleModalOpen(false);
    setToastMsg('Packaging style updated!');
    setTimeout(() => setToastMsg(null), 2000);
  };

  const handleSelectLuggage = async (luggageTitle: string) => {
    await updateUserProfilePreferences({
      luggageDefault: luggageTitle,
    });
    setIsLuggageModalOpen(false);
    setToastMsg('Luggage default updated!');
    setTimeout(() => setToastMsg(null), 2000);
  };

  const handleSelectBudget = async (budgetTitle: string) => {
    await updateUserProfilePreferences({
      defaultBudget: budgetTitle,
    });
    setIsBudgetModalOpen(false);
    setToastMsg('Shopping budget updated!');
    setTimeout(() => setToastMsg(null), 2000);
  };

  const handleToggleRetailer = async (retailer: string) => {
    const currentList = userProfile?.preferredRetailers || ['Amazon India', 'Decathlon', 'Myntra', 'Flipkart'];
    let updated: string[];
    if (currentList.includes(retailer)) {
      if (currentList.length <= 1) {
        setToastMsg('At least one preferred store must remain active');
        setTimeout(() => setToastMsg(null), 2000);
        return;
      }
      updated = currentList.filter((r) => r !== retailer);
    } else {
      updated = [...currentList, retailer];
    }
    await updateUserProfilePreferences({ preferredRetailers: updated });
  };

  const hasCustomAvatar = Boolean(userProfile?.avatarUrl && userProfile.avatarUrl.trim() !== '');
  const activeRetailers = userProfile?.preferredRetailers || ['Amazon India', 'Decathlon', 'Myntra', 'Flipkart'];
  const displayName = userProfile?.name && userProfile.name !== 'Aarav Sharma' ? userProfile.name : 'Traveller';

  return (
    <div className="flex flex-col gap-4 pb-28 pt-20 px-4 max-w-md mx-auto animate-in fade-in duration-200">
      {/* Hidden file input for custom photo upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
      />

      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-16 left-4 right-4 z-50 bg-slate-900 text-white p-3 rounded-2xl shadow-xl flex items-center justify-between text-xs font-bold animate-in fade-in">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* User Profile Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-white p-4 shadow-xs border border-slate-100">
        <div className="flex items-center gap-3.5 relative z-10">
          {/* Avatar with Customizer Upload Trigger */}
          <div
            onClick={() => setIsAvatarModalOpen(true)}
            className="relative shrink-0 cursor-pointer group"
            title="Click to choose a vector photo or upload a picture"
          >
            {hasCustomAvatar ? (
              <img
                src={userProfile!.avatarUrl}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover shadow-sm border-2 border-blue-500 group-hover:opacity-90 transition-opacity"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 group-hover:border-blue-500 flex flex-col items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                <span className="material-symbols-outlined text-[26px]">account_circle</span>
                <span className="text-[9px] font-bold mt-0.5">Choose</span>
              </div>
            )}

            {/* Camera / Edit Badge */}
            <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-xs border-2 border-white group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[13px]">
                {hasCustomAvatar ? 'edit' : 'photo_camera'}
              </span>
            </div>
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-extrabold text-slate-900 truncate">
                {displayName}
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold shadow-xs shrink-0">
                <span className="material-symbols-outlined text-[13px]">workspace_premium</span>
                <span>{userBadge}</span>
              </span>
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 underline flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[13px]">face</span>
                <span>{hasCustomAvatar ? 'Change Photo / Avatar' : 'Set Profile Photo / Avatar'}</span>
              </button>

              {hasCustomAvatar && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="text-[10px] font-semibold text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            <p className="text-xs text-slate-500 truncate mt-1">
              {!isFirstTimeVisitor
                ? `${tripsCount} Trip${tripsCount === 1 ? '' : 's'} Completed`
                : 'First-Time Explorer • 0 Trips Completed'}
            </p>

            <div className="flex items-center gap-2 mt-2">
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: !isFirstTimeVisitor ? `${Math.min(100, userLevel * 25)}%` : '0%' }}
                />
              </div>
              <span className="text-[10px] font-bold text-blue-600 shrink-0">
                Level {!isFirstTimeVisitor ? userLevel : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats Bento Strip: Explicitly shows dash '-' for first-time visitors */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
          <div className="flex flex-col items-center">
            <span className="text-sm font-extrabold text-blue-600">
              {!isFirstTimeVisitor ? `${weightSavedKg} kg` : '-'}
            </span>
            <span className="text-[10px] text-slate-500 font-semibold mt-0.5">Weight Saved</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm font-extrabold text-teal-700">
              {!isFirstTimeVisitor ? `${checklistRate}%` : '-'}
            </span>
            <span className="text-[10px] text-slate-500 font-semibold mt-0.5">Checklist Rate</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm font-extrabold text-amber-700">
              {!isFirstTimeVisitor ? statesVisitedCount : '-'}
            </span>
            <span className="text-[10px] text-slate-500 font-semibold mt-0.5">States Visited</span>
          </div>
        </div>

        {/* First time visitor informational helper */}
        {isFirstTimeVisitor && (
          <div className="mt-3 p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-blue-900 leading-snug flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-[18px]">info</span>
              <span>Stats calculate automatically when you log in and pack your trips!</span>
            </div>
            {!currentUser && (
              <button
                type="button"
                onClick={onOpenAuth}
                className="text-[10px] font-bold text-blue-600 bg-white px-2 py-1 rounded-lg shadow-xs hover:bg-blue-100 shrink-0 cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        )}
      </div>

      {/* Walkaround / App Tour Onboarding Card */}
      {onOpenWalkaround && (
        <button
          type="button"
          onClick={onOpenWalkaround}
          className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 p-3.5 rounded-2xl text-white shadow-sm hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
              <span className="material-symbols-outlined text-[20px]">explore</span>
            </div>
            <div>
              <span className="text-xs font-extrabold block">App Walkaround & Guide</span>
              <span className="text-[11px] text-white/80 block">
                Quick 30-sec tour of AI packing, swipe mode & luggage
              </span>
            </div>
          </div>
          <span className="material-symbols-outlined text-white text-[18px]">arrow_forward</span>
        </button>
      )}

      {/* Refer or Share App Link to Family & Friends Section */}
      <section className="bg-gradient-to-br from-indigo-50 via-blue-50 to-teal-50 border border-blue-200/80 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">share</span>
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Invite Friends & Family
              </h3>
              <p className="text-[11px] text-slate-600">
                Share TripSwipe with travel buddies so you pack & coordinate together.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 shrink-0">
            Earn Badge
          </span>
        </div>

        {/* Link box with 1-click copy */}
        <div className="flex items-center gap-1.5 bg-white p-1.5 pl-3 rounded-xl border border-slate-200 shadow-2xs">
          <span className="material-symbols-outlined text-slate-400 text-[16px]">link</span>
          <span className="text-[11px] font-semibold text-slate-700 truncate flex-1 select-all">
            {inviteLink}
          </span>
          <button
            type="button"
            onClick={handleCopyInviteLink}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
              copiedLink
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-95'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">
              {copiedLink ? 'check' : 'content_copy'}
            </span>
            <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        {/* Quick Share Action Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-0.5">
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-2.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors border border-[#25D366]/30"
          >
            <span className="material-symbols-outlined text-[16px]">chat</span>
            <span>WhatsApp</span>
          </a>

          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(
              "Let's pack and plan our trip with TripSwipe!"
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-2.5 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors border border-sky-200"
          >
            <span className="material-symbols-outlined text-[16px]">send</span>
            <span>Telegram</span>
          </a>

          <button
            type="button"
            onClick={handleNativeShare}
            className="py-2 px-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors border border-slate-200 shadow-2xs cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">ios_share</span>
            <span>More Options</span>
          </button>
        </div>
      </section>

      {/* Travel Preferences Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <span className="material-symbols-outlined text-blue-600 text-[18px]">tune</span>
            <span>Travel Defaults</span>
          </div>
          <span className="text-[11px] text-blue-600 font-semibold">Tap cards below to edit</span>
        </div>

        {/* Packaging Style Card - Interactive, Clickable & Instant Feedback */}
        <button
          type="button"
          onClick={() => setIsStyleModalOpen(true)}
          className="w-full text-left bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 hover:border-blue-500 hover:shadow-sm active:scale-[0.99] transition-all flex flex-col gap-2 group cursor-pointer"
        >
          <div className="flex items-start justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 transition-colors">
                <span className="material-symbols-outlined text-[20px]">dry_cleaning</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 block">Packaging Style</span>
                  <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                    Tap to Choose
                  </span>
                </div>
                <span className="text-[11px] text-slate-600 font-medium line-clamp-1 mt-0.5">
                  {userProfile?.packingStyle || 'Casual & Practical (Merino wool & layered gear)'}
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400 group-hover:text-blue-600 text-[18px] transition-colors">
              chevron_right
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1 pl-12">
            {(userProfile?.packingTags || [
              'Ultralight Layers',
              'Quick-Dry Fabrics',
              'Minimal Shoes (x2)',
            ]).map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold"
              >
                {tag}
              </span>
            ))}
          </div>
        </button>

        {/* Luggage Default Card - Interactive, Clickable with Combos */}
        <button
          type="button"
          onClick={() => setIsLuggageModalOpen(true)}
          className="w-full text-left bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 hover:border-blue-500 hover:shadow-sm active:scale-[0.99] transition-all flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 transition-colors">
              <span className="material-symbols-outlined text-[20px]">luggage</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 block truncate">
                  Luggage Default
                </span>
                <span className="text-[9px] font-bold bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded-full">
                  Tap to Choose
                </span>
              </div>
              <span className="text-[11px] text-slate-600 font-medium block truncate mt-0.5">
                {userProfile?.luggageDefault || 'Cabin Luggage (7kg) + Aeroplane Check-in Luggage (15–20kg)'}
              </span>
            </div>
          </div>
          <span className="material-symbols-outlined text-slate-400 group-hover:text-blue-600 text-[18px] transition-colors shrink-0 ml-2">
            chevron_right
          </span>
        </button>

        {/* Default Climate Alert Card */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">thunderstorm</span>
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-900 block truncate">
                Climate Safety Alerts
              </span>
              <span className="text-[11px] text-slate-500 block truncate">
                Sub-zero & Monsoon triggers active
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleAlerts}
            className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 cursor-pointer ${
              climateAlerts ? 'bg-blue-600' : 'bg-slate-200'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform ${
                climateAlerts ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Shopping Preferences Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <span className="material-symbols-outlined text-blue-600 text-[18px]">local_mall</span>
            <span>Shopping & Gear Stores</span>
          </div>
          <span className="text-[11px] text-slate-400">Tap to toggle stores</span>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Preferred Retailers (India)</span>
              <span className="text-[11px] text-teal-700 font-bold">
                {activeRetailers.length} Selected
              </span>
            </div>
            {/* Clickable Retailer Chips */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {['Amazon India', 'Decathlon', 'Myntra', 'Flipkart'].map((ret) => {
                const isSelected = activeRetailers.includes(ret);
                return (
                  <button
                    key={ret}
                    type="button"
                    onClick={() => handleToggleRetailer(ret)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all active:scale-95 cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50 text-teal-800 border-teal-200 shadow-xs'
                        : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {isSelected ? 'check' : 'add'}
                    </span>
                    <span>{ret}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Default Shopping Budget Card - Clickable */}
          <button
            type="button"
            onClick={() => setIsBudgetModalOpen(true)}
            className="w-full bg-slate-50 hover:bg-slate-100 rounded-xl p-3 flex items-center justify-between text-left transition-colors cursor-pointer border border-slate-200/60"
          >
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-900">Default Shopping Budget</span>
              <span className="text-[11px] text-slate-500">
                {userProfile?.defaultBudget || 'Mid-range (Value & Durable)'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-2.5 py-1 rounded-full bg-white text-slate-700 font-bold text-[10px] shadow-xs">
                {userProfile?.defaultBudget?.includes('₹₹₹')
                  ? '₹₹₹ • PREMIUM'
                  : userProfile?.defaultBudget?.includes('Value')
                  ? '₹ • VALUE'
                  : '₹₹ • OPTIMAL'}
              </span>
              <span className="material-symbols-outlined text-slate-400 text-[18px]">
                chevron_right
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Settings & Vault Group */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center px-1 gap-1.5 text-xs font-bold text-slate-900">
          <span className="material-symbols-outlined text-blue-600 text-[18px]">settings</span>
          <span>Settings & Vault</span>
        </div>

        <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden flex flex-col divide-y divide-slate-100">
          <div
            onClick={() => {
              setToastMsg('Offline vault is active and encrypted on this device.');
              setTimeout(() => setToastMsg(null), 2500);
            }}
            className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-blue-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">encrypted</span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Offline Wallet & Encryption
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Manage stored passkeys & boarding docs
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-teal-700">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              <span>Secured</span>
            </div>
          </div>

          <div
            onClick={() => {
              setToastMsg('Packing reminders scheduled: 7-day, 3-day, and evening before departure.');
              setTimeout(() => setToastMsg(null), 2500);
            }}
            className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-blue-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">notifications_active</span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Push & Packing Reminders
                </span>
                <span className="text-[11px] text-slate-500 block">
                  7-day, 3-day, and night-before alerts
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-[18px]">
              chevron_right
            </span>
          </div>

          {onOpenInstallMobile && (
            <div
              onClick={onOpenInstallMobile}
              className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer border-t border-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">install_mobile</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Test on Mobile • Install Android APK
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Install as native WebAPK or download standalone .apk
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-teal-600 text-[18px]">
                arrow_forward
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Sign Out or Log In Action */}
      <div className="pt-2 flex flex-col gap-2">
        {currentUser ? (
          <button
            onClick={handleSignOut}
            className="w-full h-12 rounded-full bg-red-50 text-red-700 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-red-100 active:scale-98 transition-all border border-red-200 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Sign Out of TripSwipe</span>
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className="w-full h-12 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:bg-blue-700 active:scale-98 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">login</span>
            <span>Sign In / Create Account</span>
          </button>
        )}

        <div className="text-center text-[11px] text-slate-400 py-1">
          TripSwipe v3.4.1 (Build 890) • Made for Explorers
        </div>
      </div>

      {/* MODAL 1: Customize Packaging Style */}
      {isStyleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 flex flex-col gap-4 max-h-[85vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">dry_cleaning</span>
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">Choose Packaging Style</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsStyleModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Select your wardrobe approach. TripSwipe biases luggage weight and layering suggestions accordingly:
            </p>

            <div className="flex flex-col gap-2.5">
              {PACKING_STYLES.map((st) => {
                const isSelected = userProfile?.packingStyle === st.title;
                return (
                  <button
                    key={st.title}
                    type="button"
                    onClick={() => handleSelectPackingStyle(st)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all flex flex-col gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/90 border-blue-600 text-blue-900 shadow-xs ring-2 ring-blue-600/30'
                        : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between w-full">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">{st.icon}</span>
                        </div>
                        <div>
                          <span className="text-xs font-bold block">{st.title.split('(')[0].trim()}</span>
                          <span className="text-[11px] text-slate-500">{st.description}</span>
                        </div>
                      </div>
                      <span
                        className={`material-symbols-outlined text-[20px] ${
                          isSelected ? 'text-blue-600' : 'text-slate-300'
                        }`}
                      >
                        {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pl-10">
                      {st.tags.map((tg) => (
                        <span
                          key={tg}
                          className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[10px] font-semibold text-slate-600"
                        >
                          {tg}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Customize Default Luggage with Weight Options */}
      {isLuggageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 flex flex-col gap-4 max-h-[85vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">luggage</span>
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Select Luggage Weight Defaults</h3>
                  <p className="text-[10px] text-slate-400">Cabin, Check-in & Combo configurations</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLuggageModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Select your primary luggage format. TripSwipe computes total baggage limits to keep you within airline allowances:
            </p>

            <div className="flex flex-col gap-2.5">
              {LUGGAGE_OPTIONS.map((lug) => {
                const isSelected = userProfile?.luggageDefault === lug.title;
                return (
                  <button
                    key={lug.title}
                    type="button"
                    onClick={() => handleSelectLuggage(lug.title)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all flex flex-col gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/90 border-blue-600 text-blue-900 shadow-xs ring-2 ring-blue-600/30'
                        : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between w-full">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[20px]">{lug.icon}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold leading-tight">{lug.title}</span>
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                              {lug.badge}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 block mt-0.5 leading-snug">
                            {lug.subtitle}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`material-symbols-outlined text-[20px] shrink-0 ml-2 ${
                          isSelected ? 'text-blue-600' : 'text-slate-300'
                        }`}
                      >
                        {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pl-11">
                      <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                        {lug.weightDesc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Customize Shopping Budget */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">sell</span>
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">Default Shopping Budget</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBudgetModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {BUDGET_OPTIONS.map((bg) => {
                const isSelected = userProfile?.defaultBudget === bg.title;
                return (
                  <button
                    key={bg.title}
                    type="button"
                    onClick={() => handleSelectBudget(bg.title)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-xs ring-2 ring-blue-600/30'
                        : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold block">{bg.title}</span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">{bg.subtitle}</span>
                    </div>
                    <span className="text-sm font-extrabold text-blue-600 px-2 py-1 rounded-lg bg-slate-100">
                      {bg.symbol}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Customize Avatar & Choose Vector Photo of a Human Being */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 flex flex-col gap-4 max-h-[88vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">face</span>
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Choose Profile Picture</h3>
                  <p className="text-[10px] text-slate-400">Human vector photos, email avatar, or upload custom</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            {/* Section A: Vector Photos of Human Beings */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-blue-600">person</span>
                  <span>Vector Photos of Human Beings</span>
                </span>
                <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  Recommended
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Choose an artistic vector photo of a human explorer with gear & travel apparel:
              </p>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {HUMAN_VECTOR_AVATARS.map((av) => {
                  const isCurrent = userProfile?.avatarUrl === av.url;
                  return (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => handleSelectVectorAvatar(av)}
                      className={`p-3 rounded-2xl border-2 text-left flex flex-col items-center gap-2 transition-all cursor-pointer ${
                        isCurrent
                          ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-2 ring-blue-600/20'
                          : 'border-slate-200 hover:border-blue-400 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={av.url}
                          alt={av.name}
                          className="w-20 h-20 rounded-full object-cover shadow-sm border-2 border-white"
                        />
                        {isCurrent && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            <span className="material-symbols-outlined text-[13px]">check</span>
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <span className="text-xs font-bold text-slate-900 block">{av.name}</span>
                        <span className="text-[10px] text-slate-500 block">{av.tag}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section B: Email ID Vector Avatar */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-teal-600">alternate_email</span>
                <span>My Email ID Vector Avatar</span>
              </span>
              <p className="text-[11px] text-slate-500">
                Vector avatar based on your email handle ({userProfile?.email || currentUser?.email || 'traveler@tripswipe.app'}).
              </p>

              <button
                type="button"
                onClick={handleSelectEmailAvatar}
                className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-teal-50/50 hover:border-teal-300 transition-all flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={generateSvgDataUriForEmail(
                      userProfile?.email || currentUser?.email || 'traveler@tripswipe.app',
                      userProfile?.name
                    )}
                    alt="Email Avatar"
                    className="w-12 h-12 rounded-full border border-teal-200 shadow-xs shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 block">
                      Use Email ID Avatar
                    </span>
                    <span className="text-[11px] text-slate-500 block truncate">
                      {userProfile?.email || currentUser?.email || 'Same as login email ID'}
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-teal-600 text-[20px] shrink-0">
                  arrow_forward
                </span>
              </button>
            </div>

            {/* Section C: Upload Custom Photo from Device */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-indigo-600">upload_file</span>
                <span>Upload From Your Device</span>
              </span>
              <p className="text-[11px] text-slate-500">
                Upload your own portrait photo or custom image (PNG, JPG, WebP).
              </p>

              <button
                type="button"
                onClick={() => {
                  fileInputRef.current?.click();
                  setIsAvatarModalOpen(false);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs hover:bg-blue-700 active:scale-98 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">photo_library</span>
                <span>Select Photo From Gallery / Files</span>
              </button>
            </div>

            {/* Reset */}
            {hasCustomAvatar && (
              <div className="pt-2 border-t border-slate-100 flex justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    handleRemovePhoto(e);
                    setIsAvatarModalOpen(false);
                  }}
                  className="text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  <span>Reset to Blank / Default</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
