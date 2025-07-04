# 🎭 **Role Switching System - Implementation Guide**

## **Overview**

The 50BraIns platform now supports dynamic role switching for users with multiple roles (e.g., users who are both BRAND and INFLUENCER). This allows seamless switching between different dashboard views without logging out.

---

## **🔧 What We Fixed**

### **1. Dashboard Router Issue**

- **Problem**: Dashboard page was using `DashboardClientRouter` instead of `DashboardRouter`
- **Solution**: Updated `/app/dashboard/page.tsx` to use the role-aware `DashboardRouter`

### **2. Role-Aware Navigation**

- **Problem**: Navigation components weren't responding to role changes
- **Solution**: Updated `DynamicNavigation` to use `useRoleSwitch` hook

### **3. Dashboard Switching**

- **Problem**: Changing roles didn't switch dashboard views
- **Solution**: Enhanced `DashboardRouter` with role-based routing and debug indicators

---

## **🎯 How Role Switching Works**

### **1. Role Switch Context (`useRoleSwitch`)**

```typescript
const { currentRole, availableRoles, switchRole, canSwitchRoles } =
  useRoleSwitch();
```

- **`currentRole`**: Currently active role (stored in localStorage)
- **`availableRoles`**: All roles the user has (filtered from user.roles)
- **`switchRole(role)`**: Function to change active role
- **`canSwitchRoles`**: Boolean if user has multiple roles

### **2. Dashboard Routing Logic**

```typescript
const userType = getUserTypeForRole(currentRole);

switch (userType) {
  case 'creator':     // INFLUENCER, CREW roles
    return <CreatorDashboardClient />;
  case 'brand':       // BRAND role
    return <BrandDashboard />;
  case 'admin':       // ADMIN, SUPER_ADMIN roles
    return <AdminDashboard />;
  case 'moderator':   // MODERATOR role
    return <AdminDashboard />;
}
```

### **3. Role to User Type Mapping**

- **`INFLUENCER`** → `creator` → Creator Dashboard
- **`CREW`** → `creator` → Creator Dashboard
- **`BRAND`** → `brand` → Brand Dashboard
- **`ADMIN`** → `admin` → Admin Dashboard
- **`SUPER_ADMIN`** → `admin` → Admin Dashboard
- **`MODERATOR`** → `moderator` → Admin Dashboard

---

## **🎨 User Interface Components**

### **1. Role Switcher in Header**

Located in the top navbar, shows dropdown with available roles:

```typescript
<RoleSwitcher variant="dropdown" showDescription={true} />
```

### **2. Debug Role Indicators (Development Only)**

When in development mode and user has multiple roles, shows colored banners:

- 🎨 **Purple**: Creator Dashboard Active
- 🏢 **Blue**: Brand Dashboard Active
- ⚡ **Red**: Admin Dashboard Active
- 👥 **Green**: Clan Dashboard Active
- 🚀 **Yellow**: Default Dashboard Active

### **3. Dynamic Navigation**

Navigation items change based on current active role:

- **Creator**: Browse Gigs, Portfolio, Social Media
- **Brand**: Create Campaigns, Find Influencers, Analytics
- **Admin**: User Management, Moderation, System Settings

---

## **🚀 Testing Role Switching**

### **For Users with Multiple Roles:**

1. **Login** with an account that has both BRAND and INFLUENCER roles
2. **Check Header** - You should see a role switcher dropdown
3. **Switch Role** - Click dropdown and select different role
4. **Dashboard Changes** - Dashboard should immediately switch to the selected role's view
5. **Navigation Updates** - Menu items should change based on active role
6. **Console Logs** - Check browser console for role switching debug info

### **Debug Information:**

```
🎭 Dashboard Routing - Current Role: BRAND, User Type: brand, Available Roles: ["BRAND", "INFLUENCER"]
```

---

## **📁 Key Files Modified**

### **Dashboard Routing:**

- `apps/web/src/app/dashboard/page.tsx` - Uses correct DashboardRouter
- `apps/web/src/components/dashboard/DashboardRouter.tsx` - Role-aware routing with debug info

### **Navigation:**

- `apps/web/src/components/dashboard/shared/DynamicNavigation.tsx` - Role-aware navigation
- `apps/web/src/components/layout/BottomNavigation.tsx` - Already role-aware

### **Role Management:**

- `apps/web/src/hooks/useRoleSwitch.tsx` - Role switching context and logic
- `apps/web/src/components/layout/RoleSwitcher.tsx` - UI component for switching roles

### **Providers:**

- `apps/web/src/components/providers.tsx` - Includes RoleSwitchProvider

---

## **💡 How to Add Role Switching to New Components**

```typescript
import { useRoleSwitch } from '@/hooks/useRoleSwitch';

function MyComponent() {
  const { currentRole, getUserTypeForRole, switchRole } = useRoleSwitch();
  const userType = getUserTypeForRole(currentRole);

  // Render different content based on role
  if (userType === 'brand') {
    return <BrandSpecificContent />;
  }

  if (userType === 'creator') {
    return <CreatorSpecificContent />;
  }
}
```

---

## **🔧 Troubleshooting**

### **Role Switcher Not Showing:**

- User must have multiple roles in `user.roles` array
- Check if `RoleSwitchProvider` is wrapping the app

### **Dashboard Not Switching:**

- Check browser console for role switching logs
- Verify `DashboardRouter` is being used (not `DashboardClientRouter`)
- Check if role is saved in localStorage: `localStorage.getItem('50brains_active_role')`

### **Navigation Not Updating:**

- Ensure components use `useRoleSwitch` instead of `usePermissions` for user type
- Check role-to-userType mapping in `getUserTypeForRole`

---

## **🎯 Next Steps**

1. **Test with Real Multi-Role Users** - Create test accounts with multiple roles
2. **Remove Debug Info** - Remove development role indicators before production
3. **Add Role Persistence** - Roles persist across browser sessions via localStorage
4. **Mobile Role Switching** - Consider mobile-specific role switching UI
5. **Analytics** - Track role switching behavior for UX insights

The role switching system is now fully functional and allows users to seamlessly switch between their different roles without needing to log out and log back in.
