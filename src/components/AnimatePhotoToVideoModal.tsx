import React, { useState, useRef, useEffect } from 'react';

interface AnimatePhotoToVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialImageUrl?: string;
  initialTitle?: string;
}

const SAMPLE_TRAVEL_PHOTOS = [
  {
    name: 'Manali Snow Peaks',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAEvBRRdHc-X3sCDHUZ1AWYTKQcvy7ZfXymzRAaTfDjYLEbYxBPmr00xcO-gTV-1uer-3Uvh9Ih6IVynu-CCptfkrwOqpvlGy9bcjwL1gQ2fO82qoR6WWu4SLGI6z_vMXEqoshVoQ7rlJRMkdefT8il98iytvY9fQKi_uVIuekvq2hQaCPV5d0IjmzasSCqeHjV5dBR16Kth06W21lgG40ajW7tJxThGW6UqJgQe5TgFsYr6uol-4pZ3A',
    presetPrompt: 'Gentle snowfall drifting across Himalayan pine trees with crisp mountain morning light',
    aspect: '16:9' as const,
  },
  {
    name: 'Goa Sunset Beach',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGxOi4-uawzrMvpLNbL0S-6QJsHPVRMzGrMRzftn52ABKjdVPsiu-4C3R5eggXg74ifQVqKy-ztFqm-9M7u0pw-Nr2hU8nUT-XFcIS1xDsnb5tx8dmquvBB3s0X5H8-6eVfxDfU_w5z-xeSjwE37UB03sl5LqHX9v7XkQ-YC1WrlO6-rKIIHGK_2S6XqqyO5K7d8RJgHpkm0QDqymdHT570yr5rH_npMuX-QLriD7K-j9lU7MrIadH5w',
    presetPrompt: 'Rolling golden ocean waves crashing on soft tropical sand with swaying coconut palms',
    aspect: '16:9' as const,
  },
  {
    name: 'Jaipur Royal Palace',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDcfszlFr0RIWqHwFOl4Slea-FLW534_Wx1OBHOHLyeDPPn0T5P7msW49C2mqvOEI2WVjqSjbuAhZPhuWwegkmbOZcgnotPc5AP3M3lv9DXwijW6wYp1VN2yCZ4kU5ceZQsAzggHKbKSjclj1xMOnlXPLtE9porGFCpVuzPRreImBa0A2vL5cuolHAGdqlbbdxFPdCL86qUqXsqkSbfjwAEQApR6AP_-QUXaj4I169MwFKrdAmxFbfqvg',
    presetPrompt: 'Cinematic golden hour sunlight shimmering across palace water courtyard with warm breeze',
    aspect: '16:9' as const,
  },
  {
    name: 'Kyoto Autumn Temple',
    url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    presetPrompt: 'Vibrant crimson autumn maple leaves gently fluttering in the wind past ancient wooden pagoda',
    aspect: '9:16' as const,
  },
];

const REASSURING_MESSAGES = [
  'Veo 3.1 AI analyzing image composition & depth geometry...',
  'Synthesizing cinematic motion & atmospheric breeze...',
  'Simulating natural lighting shifts and weather particles...',
  'Rendering high-definition 720p travel video...',
  'Encoding final video stream — almost ready!',
];

export const AnimatePhotoToVideoModal: React.FC<AnimatePhotoToVideoModalProps> = ({
  isOpen,
  onClose,
  initialImageUrl,
  initialTitle,
}) => {
  const [selectedImage, setSelectedImage] = useState<string>(initialImageUrl || SAMPLE_TRAVEL_PHOTOS[0].url);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [motionPrompt, setMotionPrompt] = useState<string>(
    SAMPLE_TRAVEL_PHOTOS[0].presetPrompt
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [operationName, setOperationName] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [statusMessageIdx, setStatusMessageIdx] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(10);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingTimerRef = useRef<any>(null);
  const msgTimerRef = useRef<any>(null);

  useEffect(() => {
    if (initialImageUrl) {
      setSelectedImage(initialImageUrl);
      if (initialTitle) {
        setMotionPrompt(`Cinematic atmospheric motion bringing ${initialTitle} scenery to life`);
      }
    }
  }, [initialImageUrl, initialTitle]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
      if (msgTimerRef.current) clearInterval(msgTimerRef.current);
    };
  }, []);

  if (!isOpen) return null;

  // Handle local photo upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSelectedImage(base64);
      setVideoUrl(null);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  // Trigger Veo Video Generation
  const handleStartGeneration = async () => {
    if (!selectedImage) {
      setErrorMessage('Please select or upload a photo first.');
      return;
    }

    try {
      setIsGenerating(true);
      setErrorMessage(null);
      setVideoUrl(null);
      setProgressPercent(15);
      setStatusMessageIdx(0);

      // Rotate reassuring messages every 2.5 seconds
      msgTimerRef.current = setInterval(() => {
        setStatusMessageIdx((prev) => (prev + 1) % REASSURING_MESSAGES.length);
      }, 2500);

      // Convert image URL to base64 if it's an external URL
      let base64Data = selectedImage;
      let mimeType = 'image/jpeg';

      if (selectedImage.startsWith('http')) {
        try {
          const fetched = await fetch(selectedImage);
          const blob = await fetched.blob();
          mimeType = blob.type || 'image/jpeg';
          base64Data = await new Promise<string>((resolve) => {
            const r = new FileReader();
            r.onloadend = () => resolve(r.result as string);
            r.readAsDataURL(blob);
          });
        } catch (e) {
          console.warn('Could not re-fetch image directly, passing original URL as base');
        }
      } else if (selectedImage.startsWith('data:')) {
        const parts = selectedImage.split(';');
        if (parts[0]) mimeType = parts[0].replace('data:', '');
      }

      // 1. Call POST /api/generate-video
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType,
          prompt: motionPrompt,
          aspectRatio,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.operationName) {
        throw new Error(data.error || 'Failed to start video generation');
      }

      const opName = data.operationName;
      setOperationName(opName);

      // 2. Poll POST /api/video-status every 2 seconds
      let pollCount = 0;
      pollingTimerRef.current = setInterval(async () => {
        pollCount += 1;
        try {
          const statusRes = await fetch('/api/video-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operationName: opName }),
          });

          const statusData = await statusRes.json();
          if (statusData.progressPct) {
            setProgressPercent(statusData.progressPct);
          } else {
            setProgressPercent((prev) => Math.min(95, prev + 10));
          }

          if (statusData.done) {
            clearInterval(pollingTimerRef.current);
            clearInterval(msgTimerRef.current);
            setProgressPercent(100);

            // 3. Set Video URL from download route
            const downloadUrl = `/api/video-download?operationName=${encodeURIComponent(opName)}`;
            setVideoUrl(downloadUrl);
            setIsGenerating(false);
          }
        } catch (pollErr: any) {
          console.warn('Polling error:', pollErr);
        }

        // Safety timeout after 90 seconds
        if (pollCount > 45) {
          clearInterval(pollingTimerRef.current);
          clearInterval(msgTimerRef.current);
          setIsGenerating(false);
          setVideoUrl(`/api/video-download?operationName=${encodeURIComponent(opName)}`);
        }
      }, 2000);
    } catch (err: any) {
      console.error('Video generation error:', err);
      clearInterval(pollingTimerRef.current);
      clearInterval(msgTimerRef.current);
      setIsGenerating(false);
      setErrorMessage(err.message || 'Failed to generate video. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-100">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-blue-700 via-indigo-700 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-xs">
              <span className="material-symbols-outlined text-[24px]">movie</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-black text-white leading-tight">
                  Animate Photos into Video
                </h3>
                <span className="px-2 py-0.2 rounded-full bg-teal-400 text-teal-950 text-[10px] font-black uppercase tracking-wider">
                  Veo 3.1
                </span>
              </div>
              <p className="text-[11px] text-blue-100 mt-0.5 opacity-90">
                Model: <code className="font-mono text-white/95">veo-3.1-fast-generate-preview</code>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex flex-col gap-4">
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between animate-in fade-in">
              <span>{errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-rose-600 font-bold ml-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Video Result View */}
          {videoUrl && !isGenerating ? (
            <div className="flex flex-col gap-3.5 bg-slate-900 rounded-3xl p-4 text-white shadow-md animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-teal-400 text-[20px]">
                    check_circle
                  </span>
                  <span className="text-xs font-black">Veo Video Ready!</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                  {aspectRatio === '9:16' ? '9:16 Portrait Reel' : '16:9 Landscape Cinema'}
                </span>
              </div>

              {/* Responsive Video Container */}
              <div
                className={`w-full overflow-hidden rounded-2xl bg-black flex items-center justify-center mx-auto ${
                  aspectRatio === '9:16' ? 'max-w-[280px] aspect-[9/16]' : 'aspect-[16/9]'
                }`}
              >
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <a
                  href={videoUrl}
                  download="tripswipe-veo-video.mp4"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-teal-500 hover:bg-teal-400 active:scale-95 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>Download MP4</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setVideoUrl(null);
                    setIsGenerating(false);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">refresh</span>
                  <span>Animate Another</span>
                </button>
              </div>
            </div>
          ) : isGenerating ? (
            /* Generating Progress Screen */
            <div className="flex flex-col items-center justify-center p-8 bg-slate-900 rounded-3xl text-white text-center gap-4 shadow-md animate-in fade-in">
              <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-teal-400 flex items-center justify-center shadow-lg animate-pulse">
                  <span className="material-symbols-outlined text-[32px] text-white animate-spin">
                    movie_filter
                  </span>
                </div>
              </div>

              <div className="max-w-xs">
                <h4 className="text-sm font-black text-white">
                  Veo Video Generator in Action
                </h4>
                <p className="text-xs text-teal-300 font-semibold mt-1 animate-pulse">
                  {REASSURING_MESSAGES[statusMessageIdx]}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Using model <code className="text-slate-300">veo-3.1-fast-generate-preview</code> ({aspectRatio})
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-xs space-y-1.5 pt-1">
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold px-1">
                  <span>Rendering Atmospheric Motion</span>
                  <span>{progressPercent}%</span>
                </div>
              </div>
            </div>
          ) : (
            /* Creation Controls Form */
            <div className="flex flex-col gap-4">
              {/* Photo Preview & Upload Zone */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-blue-600">image</span>
                    <span>1. Selected Travel Photo to Animate</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">upload_file</span>
                    <span>Upload from Device</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {/* Preview Box */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative w-full rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 hover:border-blue-500 transition-all cursor-pointer group bg-slate-900 ${
                    aspectRatio === '9:16' ? 'h-64 max-w-[220px] mx-auto' : 'h-48'
                  }`}
                >
                  {selectedImage ? (
                    <>
                      <img
                        src={selectedImage}
                        alt="Selected to animate"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-slate-900/30 group-hover:bg-slate-900/10 transition-colors" />
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold">
                          Tap to change photo
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-extrabold">
                          {aspectRatio}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-1 p-4 text-center">
                      <span className="material-symbols-outlined text-[32px] text-slate-500">add_photo_alternate</span>
                      <span className="text-xs font-bold text-slate-700">Click to upload photo</span>
                      <span className="text-[10px] text-slate-400">JPG, PNG, or WebP</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sample Quick Try Photos */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-slate-500">
                  Or pick a sample destination to test immediately:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SAMPLE_TRAVEL_PHOTOS.map((sample) => {
                    const isSelected = selectedImage === sample.url;
                    return (
                      <button
                        key={sample.name}
                        type="button"
                        onClick={() => {
                          setSelectedImage(sample.url);
                          setMotionPrompt(sample.presetPrompt);
                          setAspectRatio(sample.aspect);
                          setVideoUrl(null);
                        }}
                        className={`p-1.5 rounded-xl border flex flex-col gap-1 text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <img
                          src={sample.url}
                          alt={sample.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-14 object-cover rounded-lg"
                        />
                        <span className="text-[10px] font-extrabold text-slate-800 truncate block">
                          {sample.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Aspect Ratio Selection (Mandatory 16:9 or 9:16) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-blue-600">aspect_ratio</span>
                    <span>2. Video Aspect Ratio</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">Veo Supported Ratios</span>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAspectRatio('16:9')}
                    className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                      aspectRatio === '16:9'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-8 h-5 rounded-md border-2 border-current shrink-0" />
                    <div className="text-left">
                      <span className="text-xs font-extrabold block">16:9 Landscape</span>
                      <span className="text-[10px] opacity-75">Cinematic Desktop & TV</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAspectRatio('9:16')}
                    className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                      aspectRatio === '9:16'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-5 h-8 rounded-md border-2 border-current shrink-0" />
                    <div className="text-left">
                      <span className="text-xs font-extrabold block">9:16 Portrait</span>
                      <span className="text-[10px] opacity-75">Reels, Shorts & Mobile</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Motion Prompt & Presets */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-blue-600">auto_videocam</span>
                    <span>3. Atmospheric Motion Prompt</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Natural Scene Motion</span>
                </label>

                <textarea
                  value={motionPrompt}
                  onChange={(e) => setMotionPrompt(e.target.value)}
                  rows={2}
                  placeholder="Describe the desired movement (e.g. falling snow, rolling waves, gentle breeze)..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 transition-all resize-none"
                />

                {/* Quick Preset Buttons */}
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {[
                    '❄️ Falling snow & mountain mist',
                    '🌊 Ocean waves & swaying palms',
                    '🍂 Autumn leaves floating in breeze',
                    '☀️ Golden hour sunbeams & parallax',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setMotionPrompt(preset.replace(/^[^\s]+\s/, ''))}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-[10px] font-bold text-slate-600 transition-all cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                type="button"
                onClick={handleStartGeneration}
                disabled={isGenerating || !selectedImage}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 hover:opacity-95 active:scale-98 text-white text-xs font-black shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">movie</span>
                <span>Generate Video with Veo AI (720p)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
