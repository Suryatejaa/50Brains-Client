'use client';

import React from 'react';
import { DashboardRouter } from '@/components/dashboard/DashboardRouter';

export default function DashboardPage() {
  return (
    <div className="pb-bottom-nav-safe min-h-screen bg-gray-50 pt-16">
      <DashboardRouter />
    </div>
  );
}
