# 🔄 **Role Persistence Fix - Dashboard Refresh Issue**

## **Problem**

When users refresh the page, the dashboard reverts to the default one instead of maintaining the selected role, even though the role was properly saved to localStorage.

## **Root Cause**

The issue was in the `useRoleSwitch` hook initialization logic:

1. **Race Condition**: During initial render, `availableRoles` was empty because user data hadn't loaded yet
2. **Failed Validation**: The check `availableRoles.includes(savedRole)` would fail with an empty array
3. **Fallback to Primary**: It would fall back to the primary role instead of waiting for user data

## **Solution**

### **1. Fixed Initialization Logic**

```typescript
// OLD - Tried to read localStorage during initial render
const [currentRole, setCurrentRole] = useState<UserRole>(() => {
  if (typeof window !== 'undefined') {
    const savedRole = localStorage.getItem('50brains_active_role');
    if (savedRole && availableRoles.includes(savedRole as UserRole)) {
      return savedRole as UserRole;
    }
  }
  return getPrimaryRole();
});

// NEW - Wait for user data before reading localStorage
const [currentRole, setCurrentRole] = useState<UserRole>(() => {
  return getPrimaryRole();
});

// Initialize role from localStorage after user data is available
useEffect(() => {
  if (typeof window !== 'undefined' && user && availableRoles.length > 0) {
    const savedRole = localStorage.getItem('50brains_active_role');
    if (savedRole && availableRoles.includes(savedRole as UserRole)) {
      setCurrentRole(savedRole as UserRole);
    }
  }
}, [user, availableRoles]);
```

### **2. Fixed Infinite Loop in Reset Logic**

```typescript
// OLD - Had currentRole in dependency array causing loops
useEffect(() => {
  if (user) {
    const primaryRole = getPrimaryRole();
    if (
      !availableRoles.includes(currentRole) ||
      !user.roles?.includes(currentRole)
    ) {
      setCurrentRole(primaryRole);
    }
  }
}, [user, availableRoles, currentRole, getPrimaryRole]); // currentRole caused loops

// NEW - Removed currentRole from dependencies
useEffect(() => {
  if (user && availableRoles.length > 0) {
    const primaryRole = getPrimaryRole();
    if (
      !availableRoles.includes(currentRole) ||
      !user.roles?.includes(currentRole)
    ) {
      setCurrentRole(primaryRole);
    }
  }
}, [user, availableRoles, getPrimaryRole]); // No currentRole dependency
```

### **3. Added Debug Logging**

Added comprehensive logging to track role initialization and switching:

```typescript
console.log('🔄 Initializing role from localStorage:', {
  savedRole,
  availableRoles,
  currentRole,
  userRoles: user.roles,
});

console.log('🎭 Switching role from', currentRole, 'to', role);
console.log('💾 Saving role to localStorage:', currentRole);
```

## **How It Works Now**

### **Page Load Sequence:**

1. **Initial Render**: Sets role to primary role (immediate)
2. **User Data Loads**: Auth provider fetches user data
3. **Role Restoration**: Reads saved role from localStorage and validates it
4. **Dashboard Update**: Dashboard re-renders with correct role

### **Role Switching:**

1. **User Clicks Role**: Calls `switchRole(newRole)`
2. **State Update**: Updates `currentRole` state
3. **localStorage Save**: Automatically saves to localStorage
4. **Dashboard Update**: Dashboard immediately re-renders

### **Page Refresh:**

1. **Page Loads**: Initial render with primary role
2. **Auth Restores**: User data loads from cookies/API
3. **Role Restores**: Saved role loads from localStorage
4. **Dashboard Switches**: Automatically switches to saved role

## **Testing the Fix**

### **Test Steps:**

1. **Login** with multi-role account
2. **Switch Role** using the dropdown in header
3. **Verify Dashboard** changes to selected role
4. **Refresh Page** (F5 or Ctrl+R)
5. **Verify Persistence** - Dashboard should return to selected role (not default)

### **Debug Information:**

Check browser console for role switching logs:

```
🔄 Initializing role from localStorage: {savedRole: "BRAND", availableRoles: ["INFLUENCER", "BRAND"], ...}
✅ Setting role from localStorage: BRAND
💾 Saving role to localStorage: BRAND
🎭 Dashboard Routing - Current Role: BRAND, User Type: brand, Available Roles: ["INFLUENCER", "BRAND"]
```

### **localStorage Check:**

You can manually check if role is being saved:

```javascript
// In browser console
localStorage.getItem('50brains_active_role');
// Should return the selected role like "BRAND" or "INFLUENCER"
```

## **Files Modified**

- `apps/web/src/hooks/useRoleSwitch.tsx` - Fixed initialization and persistence logic

## **Expected Behavior**

✅ **Role persists across page refreshes**  
✅ **No more reverting to default dashboard**  
✅ **Smooth role switching without glitches**  
✅ **Debug information available in console**

The role switching system now properly maintains user's selected role even after page refreshes, providing a seamless multi-role experience.
