// Dashboard Components
export { DashboardRouter } from './DashboardRouter';

// Shared Components
export { MetricCard } from './shared/MetricCard';
export { NotificationBell } from './shared/NotificationBell';
export { QuickActionButton, QuickActionsGrid } from './shared/QuickActions';
export { DashboardHeader } from './shared/DashboardHeader';
export { DynamicNavigation } from './shared/DynamicNavigation';

// Role-specific Dashboards
export { CreatorDashboard } from './creator/CreatorDashboard';
export { BrandDashboard } from './brand/BrandDashboard';
export { ClanDashboard } from './clan/ClanDashboard';
export { AdminDashboard } from './admin/AdminDashboard';

// Hooks
export { usePermissions, ProtectedComponent } from '../../hooks/usePermissions';
