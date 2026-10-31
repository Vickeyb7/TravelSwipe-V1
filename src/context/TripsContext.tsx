import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { PackingItem, PackingStatus, TravelDocument, Trip } from '../types';
import { initialTrips } from '../utils/data';
import { sanitizeForFirestore } from '../utils/sanitize';
import { useAuth } from './AuthContext';

interface TripsContextType {
  trips: Trip[];
  activeTrip: Trip | null;
  loadingTrips: boolean;
  setActiveTripId: (tripId: string) => void;
  activateCuratedTrip: (destinationOrId: string, options?: { asPreviewOnly?: boolean }) => Trip;
  savePreviewTripAsUpcoming: (trip: Trip) => Promise<Trip>;
  createTrip: (tripData: Omit<Trip, 'id'>) => Promise<Trip>;
  updateTrip: (tripId: string, updates: Partial<Trip>) => Promise<void>;
  deleteTrip: (tripId: string) => Promise<void>;
  toggleFavoriteTrip: (tripId: string) => Promise<void>;
  toggleFrequentTrip: (tripId: string) => Promise<void>;
  updateItemStatus: (tripId: string, itemId: string, newStatus: PackingStatus) => Promise<void>;
  toggleItemPacked: (tripId: string, itemId: string) => Promise<void>;
  addCustomItem: (tripId: string, item: Omit<PackingItem, 'id'>) => Promise<void>;
  addDocumentToTrip: (tripId: string, document: Omit<TravelDocument, 'id'>) => Promise<void>;
  removeDocumentFromTrip: (tripId: string, documentId: string) => Promise<void>;
}

const TripsContext = createContext<TripsContextType | undefined>(undefined);

const GUEST_TRIPS_STORAGE_KEY = 'tripswipe_guest_trips';
const ACTIVE_TRIP_ID_KEY = 'tripswipe_active_trip_id';
const DELETED_TRIPS_KEY = 'tripswipe_deleted_trip_ids';

const getDeletedTripIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(DELETED_TRIPS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
};

const markTripIdDeleted = (id: string) => {
  try {
    const set = getDeletedTripIds();
    set.add(id);
    localStorage.setItem(DELETED_TRIPS_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.warn('Failed to mark trip deleted:', e);
  }
};

const loadGuestTrips = (): Trip[] => {
  const deletedIds = getDeletedTripIds();
  try {
    const raw = localStorage.getItem(GUEST_TRIPS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((t: Trip) => !deletedIds.has(t.id));
      }
    }
  } catch (e) {
    console.warn('Failed to load guest trips from localStorage:', e);
  }
  // Start clean for first-time visitors without forcing unwanted trips
  return [];
};

export const TripsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [trips, setTrips] = useState<Trip[]>(() => loadGuestTrips());
  const [activeTripId, setActiveTripId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_TRIP_ID_KEY);
      if (saved) return saved;
    } catch {}
    return '';
  });
  const [loadingTrips, setLoadingTrips] = useState<boolean>(true);

  // Firestore subscription for logged-in user trips
  useEffect(() => {
    if (!currentUser) {
      const localTrips = loadGuestTrips();
      setTrips(localTrips);
      if (
        localTrips.length > 0 &&
        !localTrips.some((t) => t.id === activeTripId)
      ) {
        setActiveTripId(localTrips[0].id);
      }
      setLoadingTrips(false);
      return;
    }

    setLoadingTrips(true);
    const tripsColRef = collection(db, 'users', currentUser.uid, 'trips');

    const unsubscribe = onSnapshot(
      tripsColRef,
      async (snapshot) => {
        if (snapshot.empty) {
          const guestTrips = loadGuestTrips();
          if (guestTrips.length > 0) {
            setTrips(guestTrips);
            if (!activeTripId || !guestTrips.some((t) => t.id === activeTripId)) {
              setActiveTripId(guestTrips[0].id);
            }
            const initialTrip = guestTrips[0];
            const tripRef = doc(db, 'users', currentUser.uid, 'trips', initialTrip.id);
            const payload = sanitizeForFirestore({
              ...initialTrip,
              userId: currentUser.uid,
            });
            setDoc(tripRef, payload).catch((e) =>
              console.warn('Initial trip sync error:', e)
            );
          } else {
            setTrips([]);
          }
        } else {
          const userTrips: Trip[] = [];
          snapshot.forEach((docSnap) => {
            userTrips.push(docSnap.data() as Trip);
          });
          // Sort active first, then date
          userTrips.sort((a, b) => (a.status === 'active' ? -1 : 1));
          setTrips(userTrips);
          if (
            userTrips.length > 0 &&
            !userTrips.some((t) => t.id === activeTripId)
          ) {
            setActiveTripId(userTrips[0].id);
          }
        }
        setLoadingTrips(false);
      },
      (error) => {
        console.error('Error fetching trips for user:', error);
        handleFirestoreError(error, OperationType.LIST, `users/${currentUser.uid}/trips`);
        setLoadingTrips(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Resolve activeTrip: matching id from user trips or the first user trip
  const activeTrip =
    trips.find((t) => t.id === activeTripId) ||
    (trips.length > 0 ? trips[0] : null);

  const activateCuratedTrip = (
    destinationOrId: string,
    options?: { asPreviewOnly?: boolean }
  ): Trip => {
    const term = destinationOrId.toLowerCase().trim();

    // 1. Direct ID match first from templates or existing trips
    let match = initialTrips.find((t) => t.id.toLowerCase() === term);
    if (!match) {
      match = trips.find((t) => t.id.toLowerCase() === term);
    }

    // 2. Exact destination match
    if (!match) {
      match = initialTrips.find((t) => t.destination.toLowerCase() === term);
    }
    if (!match) {
      match = trips.find((t) => t.destination.toLowerCase() === term);
    }

    // 3. Substring match
    if (!match) {
      match = initialTrips.find(
        (t) =>
          t.destination.toLowerCase().includes(term) ||
          term.includes(t.destination.toLowerCase())
      );
    }
    if (!match) {
      match = trips.find(
        (t) =>
          t.destination.toLowerCase().includes(term) ||
          term.includes(t.destination.toLowerCase())
      );
    }

    // 4. Fallback: dynamically construct curated trip for exotic destinations
    if (!match) {
      const isBeach = ['goa', 'bali', 'phuket', 'maldives', 'pattaya', 'kerala'].some((k) =>
        term.includes(k)
      );
      match = {
        id: `${term.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`,
        destination: destinationOrId,
        region: isBeach ? `${destinationOrId}, Coastal Breezy` : `${destinationOrId}, Getaway`,
        datesText: 'Upcoming 5-Day Journey',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        durationNights: 4,
        durationDays: 5,
        daysAway: 15,
        party: 'solo',
        partyLabel: 'Solo • 1 Traveler',
        purposes: ['Vacation', 'Exploration'],
        activities: ['Sightseeing', 'Local Food', 'Relaxation'],
        style: 'Smart Casual',
        luggageType: 'Cabin Luggage (7kg) + Check-in Luggage (15–20kg)',
        budgetTier: 'Mid-range (₹₹)',
        hasTechKit: true,
        tag: 'Curated Journey',
        tempRange: isBeach ? '25°C to 32°C' : '18°C to 28°C',
        climateTitle: isBeach ? 'Tropical Warm Climate' : 'Pleasant Travel Weather',
        climateNote: 'Mild days with high UV protection and light evening breeze expected.',
        packingRules: ['Comfortable Footwear', 'UV Eye Protection', 'Hydration Pack', 'Smart Essentials'],
        status: 'active',
        heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5fPefNvxwy5tOUHhuNFxWFP-4uSWHB9CMCzXbN19_QA_XRnHt701md0JmGUQ24FVVwN5Uzx6B12aUKrRAcyYrNCGBf8LGuYwGs-j0HlpSqQDXFSK2ccgrmwVrexP7DgDieU1xf7w0exIzPBc6XthdRp7x0OgWoOn7gtmP7hmzxUHg5gYmL0X_6wTfaKKonAJgiJaAjwmV5hMM6YahDix7Nf-IQZpv3Fm_L-jJoSC6hg_djlHSy2QkmA',
        scenicImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGxOi4-uawzrMvpLNbL0S-6QJsHPVRMzGrMRzftn52ABKjdVPsiu-4C3R5eggXg74ifQVqKy-ztFqm-9M7u0pw-Nr2hU8nUT-XFcIS1xDsnb5tx8dmquvBB3s0X5H8-6eVfxDfU_w5z-xeSjwE37UB03sl5LqHX9v7XkQ-YC1WrlO6-rKIIHGK_2S6XqqyO5K7d8RJgHpkm0QDqymdHT570yr5rH_npMuX-QLriD7K-j9lU7MrIadH5w',
        items: [
          {
            id: 'breathable-shirts',
            name: 'Light Breathable Travel Shirts',
            category: 'Clothing & Layers',
            recommendedQty: '3 units',
            weightKg: 0.45,
            reason: 'Keeps comfortable during daytime explorations.',
            status: 'to_buy',
            priority: 'essential',
            subZeroOrSpecial: false,
          },
          {
            id: 'sunglasses-curated',
            name: 'UV400 Polarized Sunglasses',
            category: 'Electronics & Gadgets',
            recommendedQty: '1 pair',
            weightKg: 0.08,
            reason: 'Shields eyes during sunny outdoor travels.',
            status: 'own',
            priority: 'essential',
            subZeroOrSpecial: false,
          },
          {
            id: 'sunscreen-curated',
            name: 'Broad Spectrum SPF 50+ Sunscreen',
            category: 'Toiletries & Meds',
            recommendedQty: '1 bottle (100ml)',
            weightKg: 0.15,
            reason: 'Essential UV protection for outdoor exploration.',
            status: 'to_buy',
            priority: 'essential',
            subZeroOrSpecial: false,
          },
          {
            id: 'powerbank-curated',
            name: '10,000mAh Slim Fast Power Bank',
            category: 'Electronics & Gadgets',
            recommendedQty: '1 unit',
            weightKg: 0.22,
            reason: 'Keeps smartphone powered for maps and navigation.',
            status: 'packed',
            priority: 'essential',
            subZeroOrSpecial: false,
          },
        ],
        documents: [],
      };
    }

    const activated: Trip = {
      ...(match as Trip),
      isCuratedPreview: !!options?.asPreviewOnly,
    };

    // If just previewing/tinkering, DO NOT persist into user's upcoming trips
    if (options?.asPreviewOnly) {
      return activated;
    }

    // Official upcoming trip: add to trips and persist
    setTrips((prev) => [activated, ...prev.filter((t) => t.id !== activated.id)]);
    setActiveTripId(activated.id);

    try {
      localStorage.setItem(ACTIVE_TRIP_ID_KEY, activated.id);
    } catch {}

    if (currentUser) {
      const payload = sanitizeForFirestore({
        ...activated,
        userId: currentUser.uid,
        isCuratedPreview: false,
      });
      setDoc(doc(db, 'users', currentUser.uid, 'trips', activated.id), payload).catch((e) =>
        console.warn('Sync curated trip to Firestore error:', e)
      );
    } else {
      try {
        const currentGuest = loadGuestTrips();
        localStorage.setItem(
          GUEST_TRIPS_STORAGE_KEY,
          JSON.stringify([activated, ...currentGuest.filter((t) => t.id !== activated.id)])
        );
      } catch (e) {
        console.warn('Save guest trip error:', e);
      }
    }

    return activated;
  };

  const savePreviewTripAsUpcoming = async (trip: Trip): Promise<Trip> => {
    const recordedTrip: Trip = {
      ...trip,
      isCuratedPreview: false,
      status: 'active',
    };

    setTrips((prev) => [recordedTrip, ...prev.filter((t) => t.id !== recordedTrip.id)]);
    setActiveTripId(recordedTrip.id);

    try {
      localStorage.setItem(ACTIVE_TRIP_ID_KEY, recordedTrip.id);
    } catch {}

    if (currentUser) {
      try {
        const tripRef = doc(db, 'users', currentUser.uid, 'trips', recordedTrip.id);
        const payload = sanitizeForFirestore({ ...recordedTrip, userId: currentUser.uid });
        await setDoc(tripRef, payload);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `users/${currentUser.uid}/trips/${recordedTrip.id}`);
      }
    } else {
      try {
        const currentGuest = loadGuestTrips();
        localStorage.setItem(
          GUEST_TRIPS_STORAGE_KEY,
          JSON.stringify([recordedTrip, ...currentGuest.filter((t) => t.id !== recordedTrip.id)])
        );
      } catch (e) {
        console.warn('Failed to record upcoming trip in localStorage:', e);
      }
    }

    return recordedTrip;
  };

  const createTrip = async (tripData: Omit<Trip, 'id'>): Promise<Trip> => {
    const tripId = `trip-${Date.now()}`;
    const newTrip: Trip = {
      ...tripData,
      id: tripId,
    };

    if (currentUser) {
      try {
        const tripRef = doc(db, 'users', currentUser.uid, 'trips', tripId);
        const payload = sanitizeForFirestore({
          ...newTrip,
          userId: currentUser.uid,
        });
        await setDoc(tripRef, payload);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `users/${currentUser.uid}/trips/${tripId}`);
        throw err;
      }
    } else {
      try {
        const updated = [newTrip, ...trips];
        localStorage.setItem(GUEST_TRIPS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save guest trip to localStorage:', e);
      }
    }

    setTrips((prev) => [newTrip, ...prev]);
    setActiveTripId(tripId);
    return newTrip;
  };

  const updateTrip = async (tripId: string, updates: Partial<Trip>) => {
    setTrips((prev) => {
      const updated = prev.map((t) => (t.id === tripId ? { ...t, ...updates } : t));
      if (!currentUser) {
        try {
          localStorage.setItem(GUEST_TRIPS_STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.warn('Failed to update guest trip:', e);
        }
      }
      return updated;
    });

    if (currentUser) {
      try {
        const tripRef = doc(db, 'users', currentUser.uid, 'trips', tripId);
        const payload = sanitizeForFirestore(updates);
        await setDoc(tripRef, payload, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}/trips/${tripId}`);
      }
    }
  };

  const deleteTrip = async (tripId: string) => {
    markTripIdDeleted(tripId);

    setTrips((prev) => {
      const updated = prev.filter((t) => t.id !== tripId);
      if (!currentUser) {
        try {
          localStorage.setItem(GUEST_TRIPS_STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.warn('Failed to delete guest trip:', e);
        }
      }
      return updated;
    });

    // If deleting the currently active trip, shift to another trip
    if (activeTripId === tripId) {
      const remaining = trips.filter((t) => t.id !== tripId);
      const nextId = remaining.length > 0 ? remaining[0].id : '';
      setActiveTripId(nextId);
      try {
        localStorage.setItem(ACTIVE_TRIP_ID_KEY, nextId);
      } catch {}
    }

    if (currentUser) {
      try {
        const tripRef = doc(db, 'users', currentUser.uid, 'trips', tripId);
        await deleteDoc(tripRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${currentUser.uid}/trips/${tripId}`);
      }
    }
  };

  const toggleFavoriteTrip = async (tripId: string) => {
    const target = trips.find((t) => t.id === tripId);
    if (!target) return;
    const isFavorite = !target.isFavorite;
    await updateTrip(tripId, { isFavorite });
  };

  const toggleFrequentTrip = async (tripId: string) => {
    const target = trips.find((t) => t.id === tripId);
    if (!target) return;
    const isFrequent = !target.isFrequent;
    await updateTrip(tripId, { isFrequent });
  };

  const updateItemStatus = async (tripId: string, itemId: string, newStatus: PackingStatus) => {
    const targetTrip = trips.find((t) => t.id === tripId);
    if (!targetTrip) return;

    const updatedItems = targetTrip.items.map((item) =>
      item.id === itemId ? { ...item, status: newStatus } : item
    );

    await updateTrip(tripId, { items: updatedItems });
  };

  const toggleItemPacked = async (tripId: string, itemId: string) => {
    const targetTrip = trips.find((t) => t.id === tripId);
    if (!targetTrip) return;

    const targetItem = targetTrip.items.find((i) => i.id === itemId);
    if (!targetItem) return;

    const newStatus: PackingStatus = targetItem.status === 'packed' ? 'own' : 'packed';
    await updateItemStatus(tripId, itemId, newStatus);
  };

  const addCustomItem = async (tripId: string, itemData: Omit<PackingItem, 'id'>) => {
    const targetTrip = trips.find((t) => t.id === tripId);
    if (!targetTrip) return;

    const newItem: PackingItem = {
      ...itemData,
      id: `custom-${Date.now()}`,
      isCustomAdded: true,
    };

    const updatedItems = [newItem, ...targetTrip.items];
    await updateTrip(tripId, { items: updatedItems });
  };

  const addDocumentToTrip = async (tripId: string, docData: Omit<TravelDocument, 'id'>) => {
    const targetTrip = trips.find((t) => t.id === tripId);
    if (!targetTrip) return;

    const newDoc: TravelDocument = {
      ...docData,
      id: `doc-${Date.now()}`,
      tripId,
    };

    const updatedDocs = [newDoc, ...(targetTrip.documents || [])];
    await updateTrip(tripId, { documents: updatedDocs });
  };

  const removeDocumentFromTrip = async (tripId: string, documentId: string) => {
    const targetTrip = trips.find((t) => t.id === tripId);
    if (!targetTrip) return;

    const updatedDocs = (targetTrip.documents || []).filter((d) => d.id !== documentId);
    await updateTrip(tripId, { documents: updatedDocs });
  };

  return (
    <TripsContext.Provider
      value={{
        trips,
        activeTrip,
        loadingTrips,
        setActiveTripId,
        activateCuratedTrip,
        savePreviewTripAsUpcoming,
        createTrip,
        updateTrip,
        deleteTrip,
        toggleFavoriteTrip,
        toggleFrequentTrip,
        updateItemStatus,
        toggleItemPacked,
        addCustomItem,
        addDocumentToTrip,
        removeDocumentFromTrip,
      }}
    >
      {children}
    </TripsContext.Provider>
  );
};

export const useTrips = () => {
  const context = useContext(TripsContext);
  if (!context) {
    throw new Error('useTrips must be used within a TripsProvider');
  }
  return context;
};
