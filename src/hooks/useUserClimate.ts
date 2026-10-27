import React, { useState, useEffect, useCallback } from 'react';
import {
  UserClimateData,
  detectUserClimate,
  getCachedUserClimate,
} from '../services/locationWeather';

export function useUserClimate() {
  const [climate, setClimate] = useState<UserClimateData>(() => {
    return (
      getCachedUserClimate() || {
        location: 'Detecting...',
        city: 'Detecting...',
        country: '',
        temperature: 25,
        temperatureText: '25°C',
        condition: 'Sunny',
        icon: 'wb_sunny',
        isLive: false,
        source: 'default',
        updatedAt: 0,
      }
    );
  });
  const [loading, setLoading] = useState<boolean>(false);

  const refreshClimate = useCallback(async (forceFresh: boolean = true) => {
    setLoading(true);
    try {
      const data = await detectUserClimate(forceFresh);
      setClimate(data);
    } catch (e) {
      console.warn('Failed to detect climate:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch if cache is absent or old
    const cached = getCachedUserClimate();
    if (!cached || Date.now() - cached.updatedAt > 20 * 60 * 1000) {
      refreshClimate(false);
    }
  }, [refreshClimate]);

  return {
    climate,
    loading,
    refreshClimate,
  };
}
