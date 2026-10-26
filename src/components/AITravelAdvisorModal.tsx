import React, { useState, useRef, useEffect } from 'react';
import { useTrips } from '../context/TripsContext';
import { PackingItem } from '../types';

interface SuggestedItem {
  id: string;
  name: string;
  category: string;
  recommendedQty: string;
  weightKg: number;
  reason: string;
  priority: 'essential' | 'recommended' | 'optional';
  retailer: 'Amazon India' | 'Decathlon' | 'Myntra' | 'Flipkart';
  approxPriceINR: number;
  link?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  suggestedItems?: SuggestedItem[];
  quickFollowUps?: string[];
  timestamp: string;
}

interface AITravelAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

export const AITravelAdvisorModal: React.FC<AITravelAdvisorModalProps> = ({
  isOpen,
  onClose,
  initialPrompt,
}) => {
  const { activeTrip, addCustomItem } = useTrips();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const destination = activeTrip?.destination || 'Manali, Himachal Pradesh';
  const duration = activeTrip?.durationDays || 5;
  const weather = activeTrip?.tempRange || '-2°C to 7°C';
  const itemsCount = activeTrip?.items?.length || 0;
  const totalWeight = activeTrip?.items
    ? Math.round(activeTrip.items.reduce((acc, it) => acc + (it.weightKg || 0.3), 0) * 10) / 10
    : 11.2;

  // Initialize greeting on open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greetingText = `👋 Namaste! I'm your **TripSwipe AI Travel & Packing Advisor**.\n\nI can help you prepare for **${destination}** (${duration} days, ${weather}). Ask me about packing essentials, airline baggage rules (IndiGo, Air India), weather layering, or shopping gear for your trip!`;

      setMessages([
        {
          id: 'welcome-msg',
          sender: 'ai',
          text: greetingText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          quickFollowUps: [
            `What essential items am I missing for ${destination.split(',')[0]}?`,
            'Can I pack power banks in check-in baggage?',
            'What is the 3-layer rule for cold mountain weather?',
            'How can I keep my bag under 15kg?',
          ],
        },
      ]);
    }
  }, [isOpen, destination, duration, weather]);

  // Handle auto-triggering initial prompt if passed
  useEffect(() => {
    if (isOpen && initialPrompt && messages.length > 0) {
      handleSendMessage(initialPrompt);
    }
  }, [isOpen, initialPrompt]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          tripContext: {
            destination,
            durationDays: duration,
            tempRange: weather,
            itemsCount,
            totalWeightKg: totalWeight,
            luggageLimitKg: 15,
          },
        }),
      });

      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || 'Here is the packing and travel advice you requested.',
        suggestedItems: data.suggestedItems || [],
        quickFollowUps: data.quickFollowUps || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Failed to communicate with AI advisor:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: `Here is a quick travel tip for **${destination}**: Keep all lithium-ion power banks inside your cabin hand baggage (74Wh to 100Wh allowed). For cold climates, always prioritize moisture-wicking thermal base layers and windproof outer shells.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          quickFollowUps: ['What shoes should I pack?', 'How to keep bag under 15kg?'],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItemToDeck = async (item: SuggestedItem) => {
    if (!activeTrip) {
      setToastMsg('Please select or create an active trip first');
      setTimeout(() => setToastMsg(null), 3000);
      return;
    }

    try {
      const newItem: PackingItem = {
        id: `ai-item-${Date.now()}`,
        name: item.name,
        category: (item.category as any) || 'Clothing & Layers',
        recommendedQty: item.recommendedQty || '1 unit',
        weightKg: item.weightKg || 0.4,
        reason: item.reason || `Curated by TripSwipe AI for ${destination}`,
        status: 'to_buy',
        priority: item.priority || 'essential',
        subZeroOrSpecial: weather.includes('-') || item.category === 'Clothing & Layers',
        characteristics: [
          `AI recommended based on ${destination} conditions`,
          `Estimated weight: ${item.weightKg} kg`,
        ],
        retailerOptions: [
          {
            retailer: item.retailer,
            title: item.name,
            price: item.approxPriceINR,
            originalPrice: Math.round(item.approxPriceINR * 1.35),
            discountPct: 25,
            rating: 4.6,
            reviewCount: '2.1k',
            deliveryTime: 'Fast Delivery',
            colorOrStyle: 'Standard',
            material: 'Weather-ready',
            specPill: 'AI Verified',
            imageUrl: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=600&q=80',
            checkoutUrl: item.link || `https://www.amazon.in/s?k=${encodeURIComponent(item.name)}`,
            isBestValue: true,
          },
        ],
      };

      await addCustomItem(activeTrip.id, newItem);
      setAddedItemIds((prev) => ({ ...prev, [item.id]: true }));
      setToastMsg(`✓ "${item.name}" added to your Packing Deck!`);
      setTimeout(() => setToastMsg(null), 3500);
    } catch (e) {
      console.error('Failed to add AI item:', e);
      setToastMsg('Failed to add item to trip.');
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl h-[88vh] max-h-[720px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-100">
        {/* Toast Feedback */}
        {toastMsg && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold shadow-lg flex items-center gap-2 animate-bounce">
            <span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span>
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shadow-inner">
              <span className="material-symbols-outlined text-[24px]">smart_toy</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-base tracking-tight">TripSwipe AI Advisor</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-400/30">
                  Gemini 3.8
                </span>
              </div>
              <p className="text-xs text-blue-100/90 flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">location_on</span>
                <span className="truncate max-w-[200px]">{destination}</span>
                <span>• {weather}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Active Trip Info Bar */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Context: {duration}D Trip ({itemsCount} items • {totalWeight} kg)</span>
          </div>
          <span className="text-[11px] text-slate-500">Airline Guideline: 15kg Limit</span>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] sm:max-w-[82%] rounded-2xl px-4 py-3 shadow-xs text-sm ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-xs'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                }`}
              >
                {/* Message text with basic markdown formatting */}
                <div className="whitespace-pre-line leading-relaxed">
                  {msg.text.split('\n').map((line, idx) => {
                    if (line.startsWith('• ') || line.startsWith('- ')) {
                      return (
                        <div key={idx} className="flex items-start gap-1.5 my-1 pl-1">
                          <span className="text-blue-500 font-bold">•</span>
                          <span>{line.substring(2)}</span>
                        </div>
                      );
                    }
                    if (line.includes('**')) {
                      const parts = line.split('**');
                      return (
                        <p key={idx} className="my-1">
                          {parts.map((p, i) =>
                            i % 2 === 1 ? <strong key={i} className="font-bold text-slate-900">{p}</strong> : p
                          )}
                        </p>
                      );
                    }
                    return line ? <p key={idx} className="my-1">{line}</p> : <div key={idx} className="h-1.5" />;
                  })}
                </div>

                {/* Suggested Gear Items Cards */}
                {msg.suggestedItems && msg.suggestedItems.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-blue-600">shopping_bag</span>
                      Recommended Travel Gear
                    </span>

                    {msg.suggestedItems.map((item) => {
                      const isAdded = addedItemIds[item.id];
                      return (
                        <div
                          key={item.id}
                          className="bg-slate-50 border border-slate-200/90 rounded-xl p-2.5 flex flex-col gap-1.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h5 className="font-bold text-xs text-slate-900 leading-snug">{item.name}</h5>
                              <p className="text-[11px] text-slate-500 mt-0.5">{item.reason}</p>
                            </div>
                            <span className="text-xs font-extrabold text-blue-600 shrink-0">
                              ₹{item.approxPriceINR.toLocaleString('en-IN')}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                            <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                              <span>{item.retailer}</span>
                              <span>•</span>
                              <span>{item.weightKg} kg</span>
                            </span>

                            <div className="flex items-center gap-1.5">
                              {item.link && (
                                <a
                                  href={item.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-700 text-[10px] font-bold hover:bg-slate-100 flex items-center gap-0.5"
                                >
                                  <span>Buy</span>
                                  <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                                </a>
                              )}

                              <button
                                type="button"
                                onClick={() => handleAddItemToDeck(item)}
                                disabled={isAdded}
                                className={`px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all ${
                                  isAdded
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 cursor-pointer shadow-2xs'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[12px]">
                                  {isAdded ? 'check' : 'add'}
                                </span>
                                <span>{isAdded ? 'Added' : 'Add to Deck'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div
                  className={`text-[10px] mt-1.5 flex justify-end ${
                    msg.sender === 'user' ? 'text-blue-100' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {/* Quick follow-ups */}
              {msg.quickFollowUps && msg.quickFollowUps.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5 max-w-[90%]">
                  {msg.quickFollowUps.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(q)}
                      className="text-[11px] font-semibold px-3 py-1.5 rounded-full bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 active:scale-95 transition-all text-left shadow-2xs cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[12px] text-blue-500">sparkles</span>
                      <span>{q}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">TripSwipe AI is analyzing your trip...</span>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex flex-col gap-2 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Ask about ${destination.split(',')[0]}, flight rules, or gear...`}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-slate-100 rounded-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all shrink-0 ${
                inputMessage.trim() && !isLoading
                  ? 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-md cursor-pointer'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
              title="Send message"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </form>

          <p className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
            <span>Powered by Gemini • Travel recommendations, airline rules, and real-time gear curation</span>
          </p>
        </div>
      </div>
    </div>
  );
};
