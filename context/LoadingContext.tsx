
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  registerItem: (id: string) => void;
  markLoaded: (id: string) => void;
  preloadedVideos: Set<string>;
  addPreloadedVideo: (url: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [itemsToLoad, setItemsToLoad] = useState<Set<string>>(new Set());
  const [loadedItems, setLoadedItems] = useState<Set<string>>(new Set());
  const [preloadedVideos, setPreloadedVideos] = useState<Set<string>>(new Set());
  const [isFinished, setIsFinished] = useState(false);

  const registerItem = useCallback((id: string) => {
    setItemsToLoad(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const markLoaded = useCallback((id: string) => {
    setLoadedItems(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const addPreloadedVideo = useCallback((url: string) => {
    setPreloadedVideos(prev => {
      const next = new Set(prev);
      next.add(url);
      return next;
    });
  }, []);

  // We are loading if we have items registered and not all are loaded
  // Or if we haven't registered anything yet (initial state)
  const isLoading = !isFinished && (itemsToLoad.size === 0 || loadedItems.size < itemsToLoad.size);

  useEffect(() => {
    // Safety timeout: Never show loading screen for more than 4 seconds
    const safetyTimeout = setTimeout(() => {
      setIsFinished(true);
    }, 4000);

    return () => clearTimeout(safetyTimeout);
  }, []);

  useEffect(() => {
    if (itemsToLoad.size > 0 && loadedItems.size >= itemsToLoad.size) {
      // Small delay for smooth transition
      const timer = setTimeout(() => {
        setIsFinished(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [itemsToLoad.size, loadedItems.size]);

  return (
    <LoadingContext.Provider value={{ isLoading, registerItem, markLoaded, preloadedVideos, addPreloadedVideo }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
