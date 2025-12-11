// ScrollToHashElement.tsx

import React, { useEffect } from 'react';

// Component to handle scroll-to-hash navigation
const ScrollToHashElement: React.FC = () => {
  const scrollToElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  // Handle initial page load with hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const elementId = hash.replace('#', '');
      // Wait for DOM to be fully ready
      setTimeout(() => {
        scrollToElement(elementId);
      }, 500);
    }
  }, []);

  // Listen for hash changes during navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) {
        const elementId = hash.replace('#', '');
        setTimeout(() => {
          scrollToElement(elementId);
        }, 100);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return null;
};

export default ScrollToHashElement;
