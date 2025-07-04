// components/reputation/index.ts - Reputation component exports

// Client-side components (safe for 'use client' imports)
export { default as ReputationClientWrapper } from './ReputationClientWrapper';
export { default as ReputationDisplay } from './ReputationDisplay';
export { default as ReputationCard } from './ReputationCard';
export { default as ReputationCacheIndicator } from './ReputationCacheIndicator';

// Server-side components (only for server components)
// DO NOT import this in client components due to next/headers dependency
// Use direct import: import ReputationServerWrapper from './ReputationServerWrapper'
// export { default as ReputationServerWrapper } from './ReputationServerWrapper';
