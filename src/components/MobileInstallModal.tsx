import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface MobileInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileInstallModal: React.FC<MobileInstallModalProps> = ({ isOpen, onClose }) => {
  const { canInstall, isInstalled, isAndroid, isIOS, installApp } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'instant' | 'apk' | 'qr' | 'icons'>('instant');
  const [maskShape, setMaskShape] = useState<'squircle' | 'circle' | 'rounded' | 'none'>('squircle');

  if (!isOpen) return null;

  // The live app URL for mobile testing
  const mobileUrl = window.location.origin;
  const pwaBuilderUrl = `https://www.pwabuilder.com?site=${encodeURIComponent(mobileUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(mobileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeInstall = async () => {
    if (canInstall) {
      await installApp();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with App Icon */}
        <div className="relative bg-gradient-to-br from-blue-700 via-indigo-700 to-teal-700 p-5 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            ✕
          </button>

          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0">
              <img
                src="/icons/icon-192x192.png"
                alt="TripSwipe Logo"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-teal-200 border border-white/20">
                  Android APK & PWA
                </span>
                {isInstalled && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400 text-slate-900">
                    Installed
                  </span>
                )}
              </div>
              <h2 className="text-lg font-black text-white mt-0.5">Test TripSwipe on Mobile</h2>
              <p className="text-xs text-blue-100 opacity-90 leading-tight">
                Install as native Android WebAPK or download standalone APK
              </p>
            </div>
          </div>

          {/* Switcher Tabs */}
          <div className="grid grid-cols-4 gap-1 bg-white/10 p-1 rounded-2xl mt-4 text-[11px] font-bold">
            <button
              onClick={() => setActiveTab('instant')}
              className={`py-1.5 rounded-xl transition-all cursor-pointer text-center ${
                activeTab === 'instant'
                  ? 'bg-white text-blue-800 shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              1. Install
            </button>
            <button
              onClick={() => setActiveTab('qr')}
              className={`py-1.5 rounded-xl transition-all cursor-pointer text-center ${
                activeTab === 'qr'
                  ? 'bg-white text-blue-800 shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              2. Phone Link
            </button>
            <button
              onClick={() => setActiveTab('apk')}
              className={`py-1.5 rounded-xl transition-all cursor-pointer text-center ${
                activeTab === 'apk'
                  ? 'bg-white text-blue-800 shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              3. APK Tool
            </button>
            <button
              onClick={() => setActiveTab('icons')}
              className={`py-1.5 rounded-xl transition-all cursor-pointer text-center ${
                activeTab === 'icons'
                  ? 'bg-white text-blue-800 shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              4. App Icons
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          {/* TAB 1: Instant Native Android WebAPK Installation */}
          {activeTab === 'instant' && (
            <div className="flex flex-col gap-3 animate-in fade-in">
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-start gap-3">
                <span className="material-symbols-outlined text-blue-600 text-[24px] shrink-0 mt-0.5">
                  android
                </span>
                <div>
                  <h3 className="text-xs font-extrabold text-blue-950">
                    Native Android WebAPK Support Ready
                  </h3>
                  <p className="text-[11px] text-blue-900 leading-relaxed mt-0.5">
                    TripSwipe is fully packaged with an Android Web App Manifest, Service Worker, and high-res adaptive icons. Android Chrome automatically generates and installs a native <strong>WebAPK</strong> on your phone.
                  </p>
                </div>
              </div>

              {/* Install Status Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Mobile Installation Status:</span>
                  <span
                    className={`font-black px-2 py-0.5 rounded-full text-[10px] ${
                      isInstalled
                        ? 'bg-emerald-100 text-emerald-800'
                        : canInstall
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isInstalled ? 'Installed on Device' : canInstall ? 'Ready to Install' : 'Open in Mobile Chrome'}
                  </span>
                </div>

                {canInstall ? (
                  <button
                    onClick={handleNativeInstall}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-98 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    <span>Install TripSwipe App Now</span>
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      To install directly as an app on your Android phone:
                    </p>
                    <ol className="text-[11px] text-slate-700 space-y-1.5 list-decimal pl-4">
                      <li>
                        Open <strong>{mobileUrl}</strong> in <strong>Chrome</strong> on your Android mobile.
                      </li>
                      <li>
                        Tap the <strong>three dots (⋮)</strong> at top right or look for the banner <strong>&quot;Add TripSwipe to Home screen&quot;</strong> / <strong>&quot;Install app&quot;</strong>.
                      </li>
                      <li>
                        Tap <strong>Install</strong>. Android will build and install the native WebAPK in seconds!
                      </li>
                    </ol>
                  </div>
                )}
              </div>

              {/* What You Get After Installing */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-teal-600">offline_pin</span>
                    <span>Offline Ready</span>
                  </span>
                  <p className="text-[10px] text-slate-500">Service Worker caches your trip packing lists & tickets.</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-blue-600">fullscreen</span>
                    <span>Standalone UI</span>
                  </span>
                  <p className="text-[10px] text-slate-500">No browser address bar; runs like an APK app.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Open on Phone via QR Code or Link */}
          {activeTab === 'qr' && (
            <div className="flex flex-col items-center gap-3 animate-in fade-in text-center">
              <p className="text-xs text-slate-600">
                Scan this QR code with your phone camera or copy the link to test on mobile:
              </p>

              {/* Dynamic QR Code using standard Google Chart / QR service */}
              <div className="p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-xs">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    mobileUrl
                  )}`}
                  alt="Scan to open on phone"
                  className="w-44 h-44 rounded-lg"
                />
              </div>

              {/* Copy URL Box */}
              <div className="w-full flex items-center gap-2 bg-slate-100 p-2 rounded-xl border border-slate-200">
                <input
                  type="text"
                  readOnly
                  value={mobileUrl}
                  className="flex-1 bg-transparent text-xs text-slate-700 font-mono truncate px-1 outline-hidden"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>

              <div className="text-[11px] text-slate-500">
                Tip: Share this link to your phone via WhatsApp or Telegram, tap to open in Chrome, and tap <strong>Install</strong>.
              </div>
            </div>
          )}

          {/* TAB 3: Download Standalone .APK File via PWABuilder */}
          {activeTab === 'apk' && (
            <div className="flex flex-col gap-3 animate-in fade-in">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-amber-600 text-[22px] shrink-0 mt-0.5">
                  package_2
                </span>
                <div>
                  <h4 className="text-xs font-black text-amber-950">Standalone .APK Binary Generation</h4>
                  <p className="text-[11px] text-amber-900 leading-relaxed mt-0.5">
                    Need a downloadable raw <code>.apk</code> file for sideloading or sharing? We preconfigured the manifest and assets so PWABuilder can generate the signed APK for you in 1 click!
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-col gap-2.5 text-xs">
                <span className="font-extrabold text-slate-900">How to download the .APK file:</span>
                <ol className="text-[11px] text-slate-700 space-y-2 list-decimal pl-4">
                  <li>
                    Click the button below to open <strong>PWABuilder</strong> with this app pre-loaded.
                  </li>
                  <li>
                    PWABuilder will verify the <code>manifest.json</code> and Service Worker (all score 100%).
                  </li>
                  <li>
                    Click <strong>&quot;Generate Package&quot;</strong> &rarr; Select <strong>Android</strong> &rarr; Download your <code>.apk</code> file.
                  </li>
                  <li>
                    Transfer or download the <code>.apk</code> to your Android phone and tap to install!
                  </li>
                </ol>
              </div>

              <a
                href={pwaBuilderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span>Generate & Download .APK via PWABuilder</span>
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              </a>
            </div>
          )}

          {/* TAB 4: Live App Icon Inspector & Download Gallery */}
          {activeTab === 'icons' && (
            <div className="flex flex-col gap-4 animate-in fade-in">
              <div className="text-center flex flex-col items-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mb-1">
                  Android Adaptive & Maskable Icon
                </span>
                <p className="text-xs text-slate-600">
                  Preview how the TripSwipe app icon appears on different phone home screens:
                </p>

                {/* Interactive Shape Preview */}
                <div className="py-4 flex flex-col items-center gap-2">
                  <div
                    className={`w-28 h-28 p-1.5 bg-slate-900/10 shadow-xl border-2 border-white transition-all duration-300 overflow-hidden flex items-center justify-center ${
                      maskShape === 'circle'
                        ? 'rounded-full'
                        : maskShape === 'squircle'
                        ? 'rounded-3xl'
                        : maskShape === 'rounded'
                        ? 'rounded-2xl'
                        : 'rounded-none'
                    }`}
                  >
                    <img
                      src="/icons/icon-maskable-512x512.png"
                      alt="Maskable Icon Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Mask shape toggle */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[10px] font-bold">
                    <button
                      onClick={() => setMaskShape('squircle')}
                      className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                        maskShape === 'squircle' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      Samsung
                    </button>
                    <button
                      onClick={() => setMaskShape('circle')}
                      className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                        maskShape === 'circle' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      Google Pixel
                    </button>
                    <button
                      onClick={() => setMaskShape('rounded')}
                      className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                        maskShape === 'rounded' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      Xiaomi / iOS
                    </button>
                    <button
                      onClick={() => setMaskShape('none')}
                      className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                        maskShape === 'none' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      Raw 512px
                    </button>
                  </div>
                </div>
              </div>

              {/* List of Icon Files with Direct Download Buttons */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-black text-slate-800">Available Icon Files:</span>

                {/* 512x512 High-Res */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src="/icons/icon-512x512.png"
                      alt="512px icon"
                      className="w-10 h-10 rounded-xl shadow-xs border border-white"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">icon-512x512.png</span>
                      <span className="text-[10px] text-slate-500 block">
                        512×512 px • High-DPI Splash & Play Store
                      </span>
                    </div>
                  </div>
                  <a
                    href="/icons/icon-512x512.png"
                    download="tripswipe-icon-512x512.png"
                    className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">download</span>
                    <span>Save</span>
                  </a>
                </div>

                {/* 192x192 Standard */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src="/icons/icon-192x192.png"
                      alt="192px icon"
                      className="w-10 h-10 rounded-xl shadow-xs border border-white"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">icon-192x192.png</span>
                      <span className="text-[10px] text-slate-500 block">
                        192×192 px • Standard Android Home Launcher
                      </span>
                    </div>
                  </div>
                  <a
                    href="/icons/icon-192x192.png"
                    download="tripswipe-icon-192x192.png"
                    className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">download</span>
                    <span>Save</span>
                  </a>
                </div>

                {/* Vector SVG */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src="/icons/icon.svg"
                      alt="SVG Vector"
                      className="w-10 h-10 rounded-xl shadow-xs border border-white"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">icon.svg</span>
                      <span className="text-[10px] text-slate-500 block">
                        Scalable Vector Graphic (Source)
                      </span>
                    </div>
                  </div>
                  <a
                    href="/icons/icon.svg"
                    download="tripswipe-icon.svg"
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">download</span>
                    <span>Save</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            TripSwipe v1.2 • PWA & WebAPK Certified
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-800 text-xs font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
