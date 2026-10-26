import React, { useState } from 'react';
import { GearCategory, PackingItem, PackingStatus, Trip } from '../types';
import { useTrips } from '../context/TripsContext';

interface PersonalizedChecklistScreenProps {
  trip: Trip;
  onSelectItem: (item: PackingItem) => void;
  onOpenShop: () => void;
  onOpenSwipeMode: () => void;
  onBack: () => void;
}

export const PersonalizedChecklistScreen: React.FC<PersonalizedChecklistScreenProps> = ({
  trip,
  onSelectItem,
  onOpenShop,
  onOpenSwipeMode,
  onBack,
}) => {
  const { updateItemStatus, toggleItemPacked, addCustomItem } = useTrips();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<GearCategory>('Clothing & Layers');
  const [newItemQty, setNewItemQty] = useState('1 unit');

  const items = trip.items || [];
  const total = items.length;
  const packedCount = items.filter((i) => i.status === 'packed').length;
  const readyCount = items.filter((i) => i.status === 'packed' || i.status === 'own').length;
  const toBuyCount = items.filter((i) => i.status === 'to_buy').length;
  const pct = total > 0 ? Math.round((readyCount / total) * 100) : 0;

  // Categories list
  const categories = [
    'All',
    'Clothing & Layers',
    'Footwear & Boots',
    'Toiletries & Meds',
    'Electronics & Gadgets',
    'Travel Documents & Permits',
    'Adventure & Essentials',
  ];

  const filteredItems = items.filter((item) => {
    if (selectedCategory === 'All') return true;
    return item.category === selectedCategory;
  });

  const handleStatusChange = (e: React.MouseEvent, itemId: string, status: PackingStatus) => {
    e.stopPropagation();
    updateItemStatus(trip.id, itemId, status);
  };

  const handleToggleCheckbox = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    toggleItemPacked(trip.id, itemId);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    await addCustomItem(trip.id, {
      name: newItemName.trim(),
      category: newItemCategory,
      recommendedQty: newItemQty || '1 unit',
      weightKg: 0.3,
      reason: `Custom item added for ${trip.destination}.`,
      status: 'to_buy',
      priority: 'recommended',
    });
    setNewItemName('');
    setShowAddModal(false);
  };

  return (
    <div className="flex flex-col gap-5 pb-32 pt-20 px-4 sm:px-6 lg:px-8 max-w-6xl xl:max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Top Nav Subheader */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Deck Overview</span>
        </button>

        <button
          onClick={onOpenSwipeMode}
          className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[15px]">touch_app</span>
          <span>Swipe Mode</span>
        </button>
      </div>

      {/* Trip Header Context Card */}
      <div className="relative overflow-hidden rounded-2xl bg-white p-4 shadow-xs border border-slate-100">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="material-symbols-outlined text-blue-600 text-[16px]">ac_unit</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                {trip.tag}
              </span>
            </div>
            <h2 className="text-base font-extrabold text-slate-900 truncate">
              {trip.destination} Gear Deck
            </h2>
          </div>
          <div className="flex flex-col items-end flex-shrink-0">
            <span className="text-base font-extrabold text-blue-600">{pct}%</span>
            <span className="text-[10px] text-slate-400 font-semibold">
              {readyCount} / {total} Ready
            </span>
          </div>
        </div>

        {/* Progress Track */}
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-1">
          <div className="flex flex-col items-center py-1.5 px-2 rounded-xl bg-slate-50 text-center border border-slate-100">
            <span className="text-[10px] text-slate-500 font-semibold">To Buy</span>
            <span className="text-xs font-extrabold text-amber-700 flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[14px]">shopping_bag</span>
              {toBuyCount}
            </span>
          </div>
          <div className="flex flex-col items-center py-1.5 px-2 rounded-xl bg-slate-50 text-center border border-slate-100">
            <span className="text-[10px] text-slate-500 font-semibold">In Bag</span>
            <span className="text-xs font-extrabold text-blue-600 flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[14px]">inventory_2</span>
              {packedCount}
            </span>
          </div>
          <div className="flex flex-col items-center py-1.5 px-2 rounded-xl bg-slate-50 text-center border border-slate-100">
            <span className="text-[10px] text-slate-500 font-semibold">Est. Weight</span>
            <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[14px]">scale</span>
              12.4kg
            </span>
          </div>
        </div>
      </div>

      {/* Horizontal Scrollable Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-4 px-4 py-1">
        {categories.map((cat) => {
          const isSel = selectedCategory === cat;
          const count =
            cat === 'All' ? total : items.filter((i) => i.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs ${
                isSel
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <span className="material-symbols-outlined text-teal-600 text-[18px]">checkroom</span>
          <span>
            {selectedCategory === 'All' ? 'Curated Travel Gear' : selectedCategory}
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">
          {filteredItems.length} items
        </span>
      </div>

      {/* Checklist Cards Stack */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredItems.map((item) => {
          const isPacked = item.status === 'packed';
          const isToBuy = item.status === 'to_buy';
          const isOwn = item.status === 'own';
          const isSkip = item.status === 'skip';

          return (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className={`bg-white rounded-2xl p-3.5 shadow-xs border transition-all cursor-pointer hover:border-blue-300 ${
                isPacked ? 'border-teal-200 bg-teal-50/20' : 'border-slate-100'
              }`}
            >
              {/* Item Top Row */}
              <div className="flex items-start gap-2.5 mb-2.5">
                {/* 1-Tap Checkbox */}
                <button
                  type="button"
                  onClick={(e) => handleToggleCheckbox(e, item.id)}
                  aria-label="Toggle packed"
                  className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                    isPacked
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'border-2 border-slate-300 text-transparent hover:border-blue-500'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5 mb-0.5">
                    <h3
                      className={`text-xs font-bold truncate ${
                        isPacked ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {item.name}
                    </h3>
                    <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                      {item.recommendedQty}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1 leading-tight">
                    {item.reason}
                  </p>
                </div>
              </div>

              {/* 4 Status Toggle Controls */}
              <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-slate-50 border border-slate-100">
                <button
                  type="button"
                  onClick={(e) => handleStatusChange(e, item.id, 'own')}
                  className={`py-1 px-1 rounded-lg text-[11px] font-bold text-center truncate transition-all ${
                    isOwn
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-white'
                  }`}
                >
                  Own ✓
                </button>
                <button
                  type="button"
                  onClick={(e) => handleStatusChange(e, item.id, 'to_buy')}
                  className={`py-1 px-1 rounded-lg text-[11px] font-bold text-center truncate transition-all ${
                    isToBuy
                      ? 'bg-amber-100 text-amber-900 shadow-xs'
                      : 'text-slate-600 hover:bg-white'
                  }`}
                >
                  To Buy 🛒
                </button>
                <button
                  type="button"
                  onClick={(e) => handleStatusChange(e, item.id, 'packed')}
                  className={`py-1 px-1 rounded-lg text-[11px] font-bold text-center truncate transition-all ${
                    isPacked
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-white'
                  }`}
                >
                  Packed 🎒
                </button>
                <button
                  type="button"
                  onClick={(e) => handleStatusChange(e, item.id, 'skip')}
                  className={`py-1 px-1 rounded-lg text-[11px] font-bold text-center truncate transition-all ${
                    isSkip
                      ? 'bg-red-100 text-red-800 shadow-xs'
                      : 'text-slate-400 hover:bg-white'
                  }`}
                >
                  Skip ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Advisory Box */}
      <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200/60 flex items-start gap-2.5">
        <span className="material-symbols-outlined text-blue-600 text-[20px] flex-shrink-0 mt-0.5">
          wb_twilight
        </span>
        <div className="min-w-0">
          <h4 className="text-xs font-bold text-blue-900">Solang Pass Advisory</h4>
          <p className="text-[11px] text-blue-800 leading-snug mt-0.5">
            Temperatures drop to -8°C past 4:00 PM. Make sure thermals and outer down coats are packed together in your primary cabin duffle.
          </p>
        </div>
      </div>

      {/* Floating Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl px-4 py-3 border-t border-slate-200/60 shadow-lg">
        <div className="flex items-center gap-2 max-w-md mx-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 h-12 rounded-full bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-200 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px] text-blue-600">add_circle</span>
            <span>Add Item</span>
          </button>

          <button
            onClick={onOpenShop}
            className="flex-[1.5] h-12 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:bg-blue-700 active:scale-95 transition-all"
          >
            <span>Shop Missing</span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold text-white">
              {toBuyCount}
            </span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Add Custom Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Add Custom Packing Item</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Polaroid Film or Woolen Cap"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as GearCategory)}
                    className="w-full h-11 px-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                  >
                    {categories.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">Quantity</label>
                  <input
                    type="text"
                    placeholder="e.g. 2 sets"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(e.target.value)}
                    className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-12 mt-2 rounded-full bg-blue-600 text-white font-bold text-xs shadow-md hover:bg-blue-700 active:scale-98 transition-all"
              >
                Add to Checklist
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
