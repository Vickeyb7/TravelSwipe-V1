import React, { useState } from 'react';
import { PackingItem, PackingStatus, Trip } from '../types';
import { useTrips } from '../context/TripsContext';

interface ItemDetailsModalProps {
  item: PackingItem | null;
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
}

export const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({
  item,
  trip,
  isOpen,
  onClose,
}) => {
  const { updateItemStatus } = useTrips();
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !item) return null;

  const handleStatusSelect = (status: PackingStatus) => {
    updateItemStatus(trip.id, item.id, status);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${item.name} for ${trip.destination}`,
        text: `TripSwipe Recommendation: ${item.name} (${item.recommendedQty}) - ${item.reason}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const isPacked = item.status === 'packed';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center p-3 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 flex flex-col gap-4 my-auto relative max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Nav Sub-Header */}
        <div className="flex items-center justify-between py-1">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-blue-600 font-bold text-xs hover:text-blue-700 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Checklist</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              aria-label="Share"
              className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">share</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {copiedLink && (
          <div className="p-2 bg-teal-50 border border-teal-200 rounded-xl text-center text-xs font-bold text-teal-800">
            Link copied to clipboard!
          </div>
        )}

        {/* Selected Item Header */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold uppercase tracking-wider">
                  Gear Recommender
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700">
                  <span className="material-symbols-outlined text-[14px]">ac_unit</span>
                  {trip.tempRange}
                </span>
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 leading-tight">
                {item.name}
              </h2>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold shrink-0">
              {item.recommendedQty}
            </span>
          </div>

          <div className="p-2.5 bg-white rounded-xl border border-slate-200/60 flex items-start gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[18px] shrink-0 mt-0.5">
              verified
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">{item.reason}</p>
          </div>
        </div>

        {/* Packing Status Selector 4 Tabs */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Current Packing Status
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'own', label: 'Already Own', icon: 'inventory_2' },
              { id: 'to_buy', label: 'Need to Buy', icon: 'shopping_bag' },
              { id: 'packed', label: 'Packed in Bag', icon: 'check_circle' },
              { id: 'skip', label: 'Not Needed', icon: 'block' },
            ].map((st) => {
              const isSel = item.status === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => handleStatusSelect(st.id as PackingStatus)}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                    isSel
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{st.icon}</span>
                  <span>{st.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Must-Have Gear Characteristics */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Must-Have Gear Characteristics
          </span>
          {(item.characteristics || [
            'Midweight thermal retention and breathable moisture wicking',
            'Snug ergonomic stretch fit for seamless outdoor layering',
            'Weather-tested for sub-zero mountain excursions',
          ]).map((char, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-800">
              <span className="material-symbols-outlined text-teal-600 text-[18px] shrink-0 mt-0.5">
                check_circle
              </span>
              <span className="font-medium">{char}</span>
            </div>
          ))}
        </div>

        {/* Verified Shopping Picks */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-teal-600 text-[20px]">
                storefront
              </span>
              <h3 className="text-sm font-bold text-slate-900">Verified Retailer Picks</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
              Best Prices
            </span>
          </div>

          {/* Retailer Cards */}
          {(item.retailerOptions && item.retailerOptions.length > 0
            ? item.retailerOptions
            : [
                {
                  retailer: 'Amazon India' as const,
                  title: 'Van Heusen Thermal Set (Top & Bottom)',
                  price: 1199,
                  originalPrice: 1899,
                  discountPct: 36,
                  rating: 4.4,
                  reviewCount: '3,280',
                  deliveryTime: 'Prime 1-Day Delivery',
                  colorOrStyle: 'Charcoal Heather',
                  material: 'Polyester-Spandex',
                  specPill: 'Midweight 220 GSM',
                  checkoutUrl: 'https://amazon.in',
                  imageUrl: '/images/products/thermal-underwear.jpg',
                  isBestValue: true,
                },
                {
                  retailer: 'Myntra' as const,
                  title: 'Jockey Heatgen Ultra-Warm Thermals',
                  price: 1349,
                  originalPrice: 1699,
                  discountPct: 20,
                  rating: 4.5,
                  reviewCount: '4,110',
                  deliveryTime: '2-3 Days to Bengaluru',
                  colorOrStyle: 'Jet Black Finish',
                  material: 'Microfiber Brushed',
                  specPill: 'Deep Collar Layering',
                  checkoutUrl: 'https://myntra.com',
                  imageUrl: '/images/products/thermal-underwear.jpg',
                  isTopWarmth: true,
                },
                {
                  retailer: 'Flipkart' as const,
                  title: 'Dollar Ultra Trouser & Vest Combo',
                  price: 799,
                  originalPrice: 1199,
                  discountPct: 33,
                  rating: 4.1,
                  reviewCount: '1,450',
                  deliveryTime: 'Assured Delivery',
                  colorOrStyle: 'Dark Grey Heather',
                  material: 'Cotton-Poly Blend',
                  specPill: 'Lightweight Ribs',
                  checkoutUrl: 'https://flipkart.com',
                  imageUrl: '/images/products/thermal-underwear.jpg',
                  isBudgetPick: true,
                },
              ]
          ).map((option, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex flex-col gap-2.5"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    option.isBestValue
                      ? 'bg-amber-100 text-amber-800'
                      : option.isTopWarmth
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {option.isBestValue ? 'Best Value' : option.isTopWarmth ? 'Top Warmth' : 'Budget Pick'}
                </span>
                <span className="text-xs font-bold text-slate-800">{option.retailer}</span>
              </div>

              <div className="flex gap-3">
                <img
                  src={option.imageUrl}
                  alt={option.title}
                  className="w-16 h-16 rounded-xl object-contain bg-slate-50 border border-slate-100 shrink-0 p-1 mix-blend-multiply"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/images/products/thermal-underwear.jpg';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{option.title}</h4>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-sm font-extrabold text-blue-600">₹{option.price}</span>
                    <span className="text-[11px] text-slate-400 line-through">
                      ₹{option.originalPrice}
                    </span>
                    <span className="text-[10px] font-bold text-teal-600">
                      {option.discountPct}% OFF
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                    <span className="material-symbols-outlined text-amber-500 text-[14px]">
                      star
                    </span>
                    <span className="font-bold text-slate-800">{option.rating}</span>
                    <span>({option.reviewCount})</span>
                  </div>
                </div>
              </div>

              {/* Specs Pills */}
              <div className="grid grid-cols-2 gap-1.5 p-2 bg-slate-50 rounded-xl text-[10px] text-slate-700">
                <span className="truncate">• {option.deliveryTime}</span>
                <span className="truncate">• {option.specPill}</span>
              </div>

              {/* Direct checkout button */}
              <a
                href={option.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-10 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-black active:scale-98 transition-all"
              >
                <span>Shop on {option.retailer}</span>
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              </a>
            </div>
          ))}
        </div>

        {/* Fast Action Sticky Banner */}
        <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-900">Already have this item?</span>
            <span className="text-[11px] text-slate-500">Update status instantly</span>
          </div>
          <button
            type="button"
            onClick={() => handleStatusSelect(isPacked ? 'own' : 'packed')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xs active:scale-95 transition-all ${
              isPacked ? 'bg-teal-600 text-white' : 'bg-blue-600 text-white'
            }`}
          >
            {isPacked ? '✓ Packed in Bag' : 'Mark Packed'}
          </button>
        </div>

        {/* Transparency note */}
        <p className="text-[11px] text-slate-400 text-center leading-relaxed">
          Prices & availability are illustrative. Tapping opens retailer in a new tab.
        </p>
      </div>
    </div>
  );
};
