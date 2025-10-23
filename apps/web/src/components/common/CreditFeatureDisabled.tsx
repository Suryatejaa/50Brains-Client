import React from 'react';
import { CreditCard, Clock } from 'lucide-react';

interface CreditFeatureDisabledProps {
  feature?: string;
  className?: string;
}

export const CreditFeatureDisabled: React.FC<CreditFeatureDisabledProps> = ({
  feature = 'Credit features',
  className = '',
}) => {
  return (
    <div
      className={`flex min-h-[400px] items-center justify-center p-6 ${className}`}
    >
      <div className="border-1px card-glass dashboard-card-padding w-full max-w-md border-gray-800 text-center">
        <div className="mb-6">
          <div className="mx-auto mb-4 w-fit rounded-full bg-gray-100 p-3">
            <CreditCard className="h-6 w-6 text-gray-600" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            {feature} Coming Soon
          </h2>
          <p className="mb-4 text-gray-600">
            Credit and boost features are currently disabled in the MVP version.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>Available in the full release</span>
        </div>
      </div>
    </div>
  );
};

export default CreditFeatureDisabled;
