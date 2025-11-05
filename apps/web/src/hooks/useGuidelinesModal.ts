'use client';

import { useState, useCallback } from 'react';

export type GuidelinesType = 'brand' | 'creator';

export function useGuidelinesModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [guidelinesType, setGuidelinesType] = useState<GuidelinesType>('brand');

  const openGuidelines = useCallback((type: GuidelinesType = 'brand') => {
    setGuidelinesType(type);
    setIsOpen(true);
  }, []);

  const closeGuidelines = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    guidelinesType,
    openGuidelines,
    closeGuidelines,
  };
}
