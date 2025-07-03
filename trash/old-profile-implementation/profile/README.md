# Profile Components

This directory contains the modular profile page components that were extracted from the large monolithic profile page.

## Structure

```
src/components/profile/
├── constants.ts              # Shared constants (roles, skills, etc.)
├── types.ts                  # TypeScript interface definitions
├── index.ts                  # Barrel exports for all components
├── layout/                   # Layout components
│   ├── ProfileHeader.tsx     # Profile header with cover photo, avatar, basic info
│   └── ProfileNavigation.tsx # Tab navigation for different sections
├── sections/                 # Main content sections
│   ├── OverviewSection.tsx   # Bio, skills, contact info, role-based sections
│   ├── ProfileAnalytics.tsx  # Performance analytics display
│   ├── InfluencerProfile.tsx # Influencer-specific fields
│   ├── BrandProfile.tsx      # Brand-specific fields
│   ├── CrewProfile.tsx       # Crew-specific fields
│   ├── RoleBasedProfileSections.tsx # Wrapper for role-specific sections
│   └── PlaceholderSection.tsx # Placeholder for unimplemented tabs
└── shared/                   # Reusable components
    └── RoleManager.tsx       # Role badge management
```

## Components Overview

### Layout Components

- **ProfileHeader**: Contains the cover photo, profile picture, basic user information, and action buttons
- **ProfileNavigation**: Tabbed navigation for switching between different sections

### Section Components

- **OverviewSection**: Main profile information including bio, skills, contact info, and role-based sections
- **ProfileAnalytics**: Performance metrics and analytics display
- **InfluencerProfile**: Influencer-specific fields (niche, platform, audience demographics)
- **BrandProfile**: Brand-specific fields (company info, industry, budget)
- **CrewProfile**: Crew-specific fields (skills, experience, hourly rate)
- **RoleBasedProfileSections**: Conditional wrapper that shows relevant sections based on user roles
- **PlaceholderSection**: Generic placeholder for sections not yet implemented

### Shared Components

- **RoleManager**: Handles display and editing of user roles with badges

## Usage

The main profile page imports and uses these components:

```tsx
import {
  ProfileHeader,
  ProfileNavigation,
  OverviewSection,
  ProfileAnalytics,
  PlaceholderSection,
} from '../../components/profile';

// Usage in component
<ProfileHeader
  profileData={profileData}
  userRoles={userRoles}
  isEditing={isEditing}
  // ... other props
/>;
```

## Benefits of This Structure

1. **Modularity**: Each component has a single responsibility
2. **Reusability**: Components can be reused in other contexts
3. **Maintainability**: Easier to find and modify specific functionality
4. **Testing**: Individual components can be tested in isolation
5. **Code Organization**: Related code is grouped together
6. **Performance**: Components can be lazy-loaded if needed

## Props Interface

All section components follow a consistent interface:

```tsx
interface ProfileComponentProps {
  profile: any;
  userRoles: string[];
  isEditing: boolean;
  onUpdate: (field: string, value: any) => void;
}
```

This ensures consistency across components and makes them easy to work with.
