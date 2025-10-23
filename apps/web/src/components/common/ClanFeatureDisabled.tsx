// Component to show when clan features are disabled
import { isFeatureEnabled } from '@/utils/feature-flags';

export function ClanFeatureDisabled() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="card-glass w-full max-w-md p-8 text-center">
        <div className="mb-4 text-6xl">🚧</div>
        <h1 className="mb-4 text-2xl font-bold text-gray-900">
          Clan Features Coming Soon
        </h1>
        <p className="mb-6 text-gray-600">
          Clan functionality is currently disabled for the MVP version. This
          feature will be available in a future release.
        </p>
        <div className="space-y-2">
          <button
            onClick={() => (window.location.href = '/dashboard')}
            className="btn-primary w-full"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => (window.location.href = '/marketplace')}
            className="btn-secondary w-full"
          >
            Browse Marketplace
          </button>
        </div>
      </div>
    </div>
  );
}

// Higher-order component to wrap clan-related pages
export function withClanFeatureCheck<T extends {}>(
  WrappedComponent: React.ComponentType<T>
) {
  return function ClanFeatureWrapper(props: T) {
    if (!isFeatureEnabled('CLANS_ENABLED')) {
      return <ClanFeatureDisabled />;
    }

    return <WrappedComponent {...props} />;
  };
}
