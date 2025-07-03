import React from 'react';
import { Settings } from 'lucide-react';

interface PlaceholderSectionProps {
  title: string;
}

export const PlaceholderSection: React.FC<PlaceholderSectionProps> = ({
  title,
}) => {
  return (
    <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
      <div className="text-gray-400">
        <Settings className="mx-auto mb-4 h-16 w-16" />
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          {title.charAt(0).toUpperCase() + title.slice(1)} Section
        </h3>
        <p className="text-gray-600">This section is coming soon...</p>
      </div>
    </div>
  );
};
