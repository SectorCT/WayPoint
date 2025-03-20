import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { useAuth } from './AuthContext';

interface Position {
  latitude: number | null;
  longitude: number | null;
  heading: number | null;
  error: string | null;
}

interface PositionContextType {
  position: Position;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
}

const HEADING_BUFFER_SIZE = 3; // Reduced from 5 to 3 samples for less lag
const HEADING_UPDATE_INTERVAL = 50; // Reduced from 100ms to 50ms for more frequent updates

const normalizeAngle = (angle: number): number => {
  return ((angle % 360) + 360) % 360;
};

const averageHeadings = (headings: number[]): number => {
  if (headings.length === 0) return 0;
  
  // Convert to radians and calculate average of sin and cos components
  const sumSin = headings.reduce((sum, heading) => sum + Math.sin(heading * Math.PI / 180), 0);
  const sumCos = headings.reduce((sum, heading) => sum + Math.cos(heading * Math.PI / 180), 0);
  
  // Convert back to degrees
  return normalizeAngle(Math.atan2(sumSin, sumCos) * 180 / Math.PI);
};

const PositionContext = createContext<PositionContextType | undefined>(undefined);

export function PositionProvider({ children }: { children: React.ReactNode }) {
  const [position, setPosition] = useState<Position>({
    latitude: null,
    longitude: null,
    heading: null,
    error: null
  });
  const [locationSubscription, setLocationSubscription] = useState<Location.LocationSubscription | null>(null);
  const [headingSubscription, setHeadingSubscription] = useState<Location.LocationSubscription | null>(null);
  const { isAuthenticated } = useAuth();

  // Refs for heading smoothing
  const headingBuffer = useRef<number[]>([]);
  const lastUpdateTime = useRef<number>(0);

  const startTracking = async () => {
    try {
      // Request permissions
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== 'granted') {
        setPosition(prev => ({ ...prev, error: 'Permission to access location was denied' }));
        return;
      }

      // Get initial location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation
      });

      setPosition({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        heading: location.coords.heading || null,
        error: null
      });

      // Start watching position
      const locSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (location) => {
          setPosition(prev => ({
            ...prev,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }));
        }
      );
      setLocationSubscription(locSubscription);

      // Start watching heading separately for maximum precision
      const headSubscription = await Location.watchHeadingAsync((heading) => {
        const currentTime = Date.now();
        const newHeading = heading.trueHeading || heading.magHeading || null;
        
        if (newHeading === null) return;

        // Update heading buffer
        headingBuffer.current.push(newHeading);
        if (headingBuffer.current.length > HEADING_BUFFER_SIZE) {
          headingBuffer.current.shift();
        }

        // Only update state if enough time has passed
        if (currentTime - lastUpdateTime.current >= HEADING_UPDATE_INTERVAL) {
          const smoothedHeading = averageHeadings(headingBuffer.current);
          setPosition(prev => ({
            ...prev,
            heading: smoothedHeading,
          }));
          lastUpdateTime.current = currentTime;
        }
      });
      setHeadingSubscription(headSubscription);

    } catch (err) {
      setPosition(prev => ({ ...prev, error: err instanceof Error ? err.message : 'Error tracking location' }));
    }
  };

  const stopTracking = () => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
    if (headingSubscription) {
      headingSubscription.remove();
      setHeadingSubscription(null);
    }
    // Clear the heading buffer
    headingBuffer.current = [];
  };

  // Start tracking when authenticated, stop when not
  useEffect(() => {
    if (isAuthenticated) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => {
      stopTracking();
    };
  }, [isAuthenticated]);

  return (
    <PositionContext.Provider value={{ position, startTracking, stopTracking }}>
      {children}
    </PositionContext.Provider>
  );
}

export function usePosition() {
  const context = useContext(PositionContext);
  if (context === undefined) {
    throw new Error('usePosition must be used within a PositionProvider');
  }
  return context;
} 