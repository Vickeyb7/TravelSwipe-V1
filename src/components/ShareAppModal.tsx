import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({ isOpen, onClose }) => {
  const { userProfile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [invitedCount, setInvitedCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('tripswipe_referrals_count');
      return saved ? parseInt(saved, 10) : 1;
    } catch {
      return 1;
    }
  });

  if (!isOpen) return null;

  // Generate a personalized referral link
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tripswipe.app';
  const referralCode = userProfile?.name
    ? userProfile.name.toLowerCase().replace(/[^a-z0-9]/g, '')
    : 'explorer';
  const shareUrl = `${origin}?ref=${referralCode}`;

  const shareText = `Hey! I'm using TripSwipe to plan trips, check airline baggage limits, and generate AI climate-safe packing lists. Plan and pack together with me:`;

  const recordShareAction = () => {
    const nextCount = Math.min(5, invitedCount + 1);
    setInvitedCount(nextCount);
    try {
      localStorage.setItem('tripswipe_referrals_count', nextCount.toString());
    } catch {}
  };

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const input = document.createElement('input');
        input.value = shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      recordShareAction();
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'TripSwipe • Smart AI Travel Packing & Radar',
          text: shareText,
          url: shareUrl,
        });
        recordShareAction();
      } catch {
        // User cancelled or share dismissed
      }
    } else {
      handleCopyLink();
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${shareText}\n${shareUrl}`
  )}`;

  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(
    shareUrl
  )}&text=${encodeURIComponent(shareText)}`;

  const emailUrl = `mailto:?subject=${encodeURIComponent(
    'Pack smarter for our next trip with TripSwipe!'
  )}&body=${encodeURIComponent(`${shareText}\n\nJoin here: ${shareUrl}`)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-6 duration-300"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
      >
        {/* Header Visual Banner */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 p-5 text-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-wider text-teal-200">
              <span className="material-symbols-outlined text-[12px]">celebration</span>
              <span>Invite & Share</span>
            </span>
          </div>

          <h2 id="share-modal-title" className="text-xl font-black tracking-tight leading-snug">
            Invite Family & Friends
          </h2>
          <p className="text-xs text-blue-100 mt-1 leading-relaxed opacity-95">
            Share TripSwipe so your travel group can explore curated destinations, coordinate packing lists, and avoid airline baggage fees together.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          {/* Referral Reward Milestone Tracker */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[22px]">redeem</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-amber-950">Group Explorer Reward</span>
                <span className="text-[11px] text-amber-800 leading-tight">
                  {invitedCount >= 3 ? '🎉 PRO Explorer unlocked!' : `${3 - invitedCount} more invite to unlock PRO Luggage Optimizer`}
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-200 text-amber-900 text-[11px] font-extrabold whitespace-nowrap">
              {invitedCount} / 3
            </span>
          </div>

          {/* Referral Link Copy Box */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Your Personal Invite Link
            </label>
            <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="material-symbols-outlined text-slate-400 text-[18px] ml-2">link</span>
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-transparent text-xs font-semibold text-slate-700 focus:outline-none truncate selection:bg-blue-100"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">
                  {copied ? 'check' : 'content_copy'}
                </span>
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* 1-Tap Direct Social Sharing Channels */}
          <div className="flex flex-col gap-2 pt-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Direct 1-Tap Share
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {/* WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={recordShareAction}
                className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 text-emerald-900 text-xs font-bold flex items-center gap-2.5 transition-all active:scale-98 shadow-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-xs shrink-0">
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                </div>
                <div className="flex flex-col text-left">
                  <span>WhatsApp</span>
                  <span className="text-[10px] text-emerald-700 font-medium">Family & Groups</span>
                </div>
              </a>

              {/* Telegram */}
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={recordShareAction}
                className="p-3 rounded-2xl bg-sky-50 hover:bg-sky-100/80 border border-sky-200/80 text-sky-900 text-xs font-bold flex items-center gap-2.5 transition-all active:scale-98 shadow-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-[#0088cc] text-white flex items-center justify-center shadow-xs shrink-0">
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </div>
                <div className="flex flex-col text-left">
                  <span>Telegram</span>
                  <span className="text-[10px] text-sky-700 font-medium">Travel Chats</span>
                </div>
              </a>

              {/* Native System Share Sheet */}
              <button
                type="button"
                onClick={handleNativeShare}
                className="p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/80 text-indigo-900 text-xs font-bold flex items-center gap-2.5 transition-all active:scale-98 shadow-xs cursor-pointer text-left"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <span className="material-symbols-outlined text-[18px]">share</span>
                </div>
                <div className="flex flex-col">
                  <span>Share Sheet</span>
                  <span className="text-[10px] text-indigo-700 font-medium">AirDrop, SMS, Apps</span>
                </div>
              </button>

              {/* Email */}
              <a
                href={emailUrl}
                onClick={recordShareAction}
                className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-800 text-xs font-bold flex items-center gap-2.5 transition-all active:scale-98 shadow-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-700 text-white flex items-center justify-center shadow-xs shrink-0">
                  <span className="material-symbols-outlined text-[18px]">mail</span>
                </div>
                <div className="flex flex-col text-left">
                  <span>Email</span>
                  <span className="text-[10px] text-slate-600 font-medium">Send Invitation</span>
                </div>
              </a>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-center">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
