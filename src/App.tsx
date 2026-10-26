import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TripsProvider, useTrips } from './context/TripsContext';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { WelcomeScreen } from './components/WelcomeScreen';
import { HomeScreen } from './components/HomeScreen';
import { MyTripsScreen } from './components/MyTripsScreen';
import { TripPackingDeckScreen } from './components/TripPackingDeckScreen';
import { PersonalizedChecklistScreen } from './components/PersonalizedChecklistScreen';
import { AddTripWizard } from './components/AddTripWizard';
import { SwipeModeModal } from './components/SwipeModeModal';
import { ItemDetailsModal } from './components/ItemDetailsModal';
import { ShopScreen } from './components/ShopScreen';
import { WalletScreen } from './components/WalletScreen';
import { AddDocumentModal } from './components/AddDocumentModal';
import { ProfileScreen } from './components/ProfileScreen';
import { ReadinessModal } from './components/ReadinessModal';
import { AuthModal } from './components/AuthModal';
import { WalkaroundModal } from './components/WalkaroundModal';
import { CuratedTripActionModal } from './components/CuratedTripActionModal';
import { ShareAppModal } from './components/ShareAppModal';
import { AITravelAdvisorModal } from './components/AITravelAdvisorModal';
import { AILuggageAuditModal } from './components/AILuggageAuditModal';
import { AnimatePhotoToVideoModal } from './components/AnimatePhotoToVideoModal';
import { MobileInstallModal } from './components/MobileInstallModal';
import { PackingItem, Trip } from './types';
import { testConnection } from './firebase';

const AppContent: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const { activeTrip, trips, setActiveTripId, activateCuratedTrip, savePreviewTripAsUpcoming } = useTrips();

  // Navigation state
  const [currentView, setCurrentView] = useState<'welcome' | 'main' | 'deck' | 'checklist'>('main');
  const [currentTab, setCurrentTab] = useState<NavTab>('home');

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authDefaultMode, setAuthDefaultMode] = useState<'login' | 'signup' | 'instagram'>('login');
  const [isAddTripOpen, setIsAddTripOpen] = useState(false);
  const [wizardInitialDest, setWizardInitialDest] = useState<string>('Goa, India');
  const [isSwipeModeOpen, setIsSwipeModeOpen] = useState(false);
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [isReadinessOpen, setIsReadinessOpen] = useState(false);
  const [isWalkaroundOpen, setIsWalkaroundOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAIAdvisorOpen, setIsAIAdvisorOpen] = useState(false);
  const [aiAdvisorPrompt, setAiAdvisorPrompt] = useState<string | undefined>(undefined);
  const [isAILuggageAuditOpen, setIsAILuggageAuditOpen] = useState(false);
  const [isAnimateVideoOpen, setIsAnimateVideoOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [animateVideoInitialImage, setAnimateVideoInitialImage] = useState<string | undefined>(undefined);
  const [animateVideoInitialTitle, setAnimateVideoInitialTitle] = useState<string | undefined>(undefined);
  const [curatedActionDestination, setCuratedActionDestination] = useState<string | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<PackingItem | null>(null);

  const handleOpenAnimateVideo = (imageUrl?: string, title?: string) => {
    setAnimateVideoInitialImage(imageUrl);
    setAnimateVideoInitialTitle(title);
    setIsAnimateVideoOpen(true);
  };

  // Initial connection test & auto first-time tour check
  useEffect(() => {
    testConnection();
    const hasSeenTour = localStorage.getItem('tripswipe_walkaround_shown');
    if (!hasSeenTour) {
      // Small delay for smooth entry
      const timer = setTimeout(() => {
        setIsWalkaroundOpen(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleOpenAuth = (mode: 'login' | 'signup' | 'instagram' = 'login') => {
    setAuthDefaultMode(mode);
    setIsAuthModalOpen(true);
  };

  const handlePlanTrip = (initialDest?: string) => {
    if (initialDest) {
      setWizardInitialDest(initialDest);
    }
    setIsAddTripOpen(true);
  };

  const handlePackCurated = (destinationNameOrId: string) => {
    setCuratedActionDestination(destinationNameOrId);
  };

  const handleRecordCuratedUpcoming = async (trip: Trip) => {
    setCuratedActionDestination(null);
    const recorded = await savePreviewTripAsUpcoming(trip);
    setSelectedTrip(recorded);
    setActiveTripId(recorded.id);
    setCurrentView('deck');
  };

  const handlePreviewCuratedTinker = (trip: Trip) => {
    setCuratedActionDestination(null);
    const previewTrip: Trip = { ...trip, isCuratedPreview: true };
    setSelectedTrip(previewTrip);
    setActiveTripId(previewTrip.id);
    setCurrentView('deck');
  };

  const handleTripCreated = (newTrip: Trip) => {
    setIsAddTripOpen(false);
    setSelectedTrip(newTrip);
    setActiveTripId(newTrip.id);
    setCurrentView('deck');
  };

  const handleSelectTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setActiveTripId(trip.id);
    setCurrentView('deck');
  };

  const handleResumePacking = (trip: Trip) => {
    setSelectedTrip(trip);
    setActiveTripId(trip.id);
    setIsSwipeModeOpen(true);
  };

  // Determine current active trip for deck screens
  const deckTrip =
    (selectedTrip && activeTrip && selectedTrip.id === activeTrip.id ? activeTrip : null) ||
    selectedTrip ||
    activeTrip;

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-slate-900 font-sans antialiased flex flex-col selection:bg-blue-100">
      {/* Top Header */}
      {currentView !== 'welcome' && (
        <Header
          title={
            currentView === 'deck'
              ? 'Trip Packing Deck'
              : currentView === 'checklist'
              ? 'Personalized Checklist'
              : currentTab === 'home'
              ? 'Home'
              : currentTab === 'my-trips'
              ? 'My Trips'
              : currentTab === 'shop'
              ? 'Shop'
              : currentTab === 'wallet'
              ? 'Wallet'
              : 'Profile'
          }
          showBack={currentView === 'deck' || currentView === 'checklist'}
          onBack={() => {
            if (currentView === 'checklist') setCurrentView('deck');
            else setCurrentView('main');
          }}
          onOpenAuth={() => handleOpenAuth('login')}
          onOpenProfile={() => {
            setCurrentView('main');
            setCurrentTab('profile');
          }}
          onOpenShare={() => setIsShareModalOpen(true)}
          onOpenAIAdvisor={() => {
            setAiAdvisorPrompt(undefined);
            setIsAIAdvisorOpen(true);
          }}
          onOpenAnimateVideo={() => handleOpenAnimateVideo()}
          onOpenInstallMobile={() => setIsInstallModalOpen(true)}
        />
      )}

      {/* Main View Container */}
      <main className="flex-1 w-full">
        {currentView === 'welcome' && (
          <WelcomeScreen
            onGetStarted={() => {
              setCurrentView('main');
              handlePlanTrip();
            }}
            onOpenAuth={() => handleOpenAuth('login')}
            onMyTrips={() => {
              setCurrentView('main');
              setCurrentTab('my-trips');
            }}
          />
        )}

        {currentView === 'deck' && deckTrip && (
          <TripPackingDeckScreen
            trip={deckTrip}
            onOpenChecklist={() => setCurrentView('checklist')}
            onOpenShop={() => {
              setCurrentView('main');
              setCurrentTab('shop');
            }}
            onOpenWallet={() => {
              setCurrentView('main');
              setCurrentTab('wallet');
            }}
            onOpenSwipeMode={() => setIsSwipeModeOpen(true)}
            onOpenReadiness={() => setIsReadinessOpen(true)}
            onBack={() => {
              setSelectedTrip(null);
              setCurrentView('main');
            }}
            onRecordUpcoming={handleRecordCuratedUpcoming}
            onOpenAIAdvisor={(prompt) => {
              setAiAdvisorPrompt(prompt);
              setIsAIAdvisorOpen(true);
            }}
            onOpenAILuggageAudit={() => setIsAILuggageAuditOpen(true)}
            onAnimateHeroVideo={handleOpenAnimateVideo}
          />
        )}

        {currentView === 'checklist' && deckTrip && (
          <PersonalizedChecklistScreen
            trip={deckTrip}
            onSelectItem={(item) => setSelectedItemForDetails(item)}
            onOpenShop={() => {
              setCurrentView('main');
              setCurrentTab('shop');
            }}
            onOpenSwipeMode={() => setIsSwipeModeOpen(true)}
            onBack={() => setCurrentView('deck')}
          />
        )}

        {currentView === 'main' && (
          <>
            {currentTab === 'home' && (
              <HomeScreen
                onPlanTrip={handlePlanTrip}
                onPackCurated={handlePackCurated}
                onResumePacking={() => {
                  if (activeTrip) handleResumePacking(activeTrip);
                  else handlePlanTrip();
                }}
                onOpenDeck={() => setCurrentView('deck')}
                onNavigateTab={(tab) => setCurrentTab(tab)}
                onOpenWalkaround={() => setIsWalkaroundOpen(true)}
                onOpenAnimateVideo={handleOpenAnimateVideo}
                onOpenInstallMobile={() => setIsInstallModalOpen(true)}
              />
            )}

            {currentTab === 'my-trips' && (
              <MyTripsScreen
                onPlanTrip={handlePlanTrip}
                onSelectTrip={handleSelectTrip}
                onResumePacking={handleResumePacking}
                onOpenAuth={() => handleOpenAuth('login')}
              />
            )}

            {currentTab === 'shop' && (
              <ShopScreen
                onSelectItemDetails={(item) => setSelectedItemForDetails(item)}
              />
            )}

            {currentTab === 'wallet' && (
              <WalletScreen onOpenAddDoc={() => setIsAddDocOpen(true)} />
            )}

            {currentTab === 'profile' && (
              <ProfileScreen
                onOpenAuth={() => handleOpenAuth('login')}
                onOpenWalkaround={() => setIsWalkaroundOpen(true)}
                onOpenShare={() => setIsShareModalOpen(true)}
                onOpenInstallMobile={() => setIsInstallModalOpen(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Persistent Bottom Nav in Main Views */}
      {currentView === 'main' && (
        <BottomNav currentTab={currentTab} onSelectTab={(tab) => setCurrentTab(tab)} />
      )}

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authDefaultMode}
      />

      <WalkaroundModal
        isOpen={isWalkaroundOpen}
        onClose={() => setIsWalkaroundOpen(false)}
        onPlanTrip={handlePlanTrip}
      />

      {isAddTripOpen && (
        <AddTripWizard
          onClose={() => setIsAddTripOpen(false)}
          onTripCreated={handleTripCreated}
          onOpenAuth={() => handleOpenAuth('signup')}
          initialDestination={wizardInitialDest}
        />
      )}

      {isSwipeModeOpen && deckTrip && (
        <SwipeModeModal
          trip={deckTrip}
          isOpen={isSwipeModeOpen}
          onClose={() => setIsSwipeModeOpen(false)}
          onViewDeck={() => {
            setIsSwipeModeOpen(false);
            setCurrentView('deck');
          }}
        />
      )}

      {selectedItemForDetails && deckTrip && (
        <ItemDetailsModal
          item={selectedItemForDetails}
          trip={deckTrip}
          isOpen={Boolean(selectedItemForDetails)}
          onClose={() => setSelectedItemForDetails(null)}
        />
      )}

      {isAddDocOpen && (
        <AddDocumentModal
          isOpen={isAddDocOpen}
          onClose={() => setIsAddDocOpen(false)}
        />
      )}

      {isReadinessOpen && deckTrip && (
        <ReadinessModal
          trip={deckTrip}
          isOpen={isReadinessOpen}
          onClose={() => setIsReadinessOpen(false)}
          onOpenChecklist={() => {
            setIsReadinessOpen(false);
            setCurrentView('checklist');
          }}
          onOpenShop={() => {
            setIsReadinessOpen(false);
            setCurrentView('main');
            setCurrentTab('shop');
          }}
        />
      )}

      {/* Curated Trip Choice Modal: Ask user if recording as upcoming trip or just playing around */}
      <CuratedTripActionModal
        isOpen={Boolean(curatedActionDestination)}
        onClose={() => setCuratedActionDestination(null)}
        destinationOrId={curatedActionDestination}
        onRecordUpcoming={handleRecordCuratedUpcoming}
        onPreviewTinker={handlePreviewCuratedTinker}
      />

      {/* Share / Refer App with Friends & Family Modal */}
      <ShareAppModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* Floating Ask AI Advisor Button */}
      {currentView !== 'welcome' && (
        <button
          type="button"
          onClick={() => {
            setAiAdvisorPrompt(undefined);
            setIsAIAdvisorOpen(true);
          }}
          title="Ask TripSwipe Gemini AI Travel Advisor"
          className="fixed bottom-22 right-4 z-30 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 text-white font-black text-xs shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer border border-white/20 animate-in fade-in"
        >
          <span className="material-symbols-outlined text-[18px] animate-pulse">auto_awesome</span>
          <span>Ask AI</span>
        </button>
      )}

      {/* Gemini AI Advisor Modal */}
      <AITravelAdvisorModal
        isOpen={isAIAdvisorOpen}
        onClose={() => {
          setIsAIAdvisorOpen(false);
          setAiAdvisorPrompt(undefined);
        }}
        initialPrompt={aiAdvisorPrompt}
      />

      {/* Gemini AI Luggage & Baggage Audit Modal */}
      <AILuggageAuditModal
        isOpen={isAILuggageAuditOpen}
        onClose={() => setIsAILuggageAuditOpen(false)}
        onOpenAdvisor={(prompt) => {
          setIsAILuggageAuditOpen(false);
          setAiAdvisorPrompt(prompt);
          setIsAIAdvisorOpen(true);
        }}
      />

      {/* Veo 3.1 Fast Video Generation Modal: Animate Images into Video */}
      <AnimatePhotoToVideoModal
        isOpen={isAnimateVideoOpen}
        onClose={() => setIsAnimateVideoOpen(false)}
        initialImageUrl={animateVideoInitialImage}
        initialTitle={animateVideoInitialTitle}
      />

      {/* Mobile Testing & Android APK / WebAPK Installation Modal */}
      <MobileInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <TripsProvider>
        <AppContent />
      </TripsProvider>
    </AuthProvider>
  );
}
