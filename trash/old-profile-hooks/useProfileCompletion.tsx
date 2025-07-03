'use client';
import { useState, useEffect } from 'react';

// Simple test version
export function useProfileCompletion() {
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [incompleteSections, setIncompleteSections] = useState([]);

  const refetchProfile = async () => {
    console.log('Refetching profile...');
  };

  return {
    completionPercentage,
    incompleteSections,
    refetchProfile,
  };
}

// Make sure we export the function reference correctly
export { useProfileCompletion as default };
