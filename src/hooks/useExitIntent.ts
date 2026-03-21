'use client';

import { useState, useEffect, useCallback } from 'react';

export function useExitIntent(threshold: number = 50) {
  const [showPopup, setShowPopup] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  const handleMouseLeave = useCallback(
    (e: MouseEvent) => {
      if (e.clientY <= threshold && !hasTriggered) {
        setShowPopup(true);
        setHasTriggered(true);
      }
    },
    [threshold, hasTriggered]
  );

  useEffect(() => {
    const el = document.documentElement;
    el.addEventListener('mouseleave', handleMouseLeave);
    return () => el.removeEventListener('mouseleave', handleMouseLeave);
  }, [handleMouseLeave]);

  const closePopup = useCallback(() => setShowPopup(false), []);

  return { showPopup, closePopup };
}
