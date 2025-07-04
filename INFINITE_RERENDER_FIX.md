# 🚨 **Infinite Re-render Fix - Dashboard Auto-Toggle Issue**

## **Problem**

The dashboard was auto-toggling between different roles (CREW ↔ BRAND) hundreds of times per second, causing:

- **Infinite console logging** of role switches
- **Dashboard flickering** rapidly between states
- **Performance issues** and browser freezing
- **"Maximum update depth exceeded"** React errors

## **Root Cause**

The issue was in the `useRoleSwitch` hook which had **THREE competing useEffect hooks** that were fighting each other:

1. **Initialization Effect**: Read role from localStorage and set it
2. **Save Effect**: Save current role to localStorage
3. **Validation Effect**: Reset to primary role if current role is invalid

### **The Conflict Loop:**

```
localStorage has "BRAND" → Effect 1 loads "BRAND" → Effect 3 validates "BRAND"
→ Effect 3 resets to "CREW" → Effect 2 saves "CREW" → Effect 1 loads "CREW"
→ Effect 3 validates "CREW" → INFINITE LOOP!
```

### **Problematic Code:**

```tsx
// Effect 1: Initialize from localStorage
useEffect(() => {
  const savedRole = localStorage.getItem('50brains_active_role');
  if (savedRole && availableRoles.includes(savedRole)) {
    setCurrentRole(savedRole); // ← This triggers Effect 2 & 3
  }
}, [user, availableRoles]);

// Effect 2: Save to localStorage
useEffect(() => {
  localStorage.setItem('50brains_active_role', currentRole); // ← This runs every time
}, [currentRole]);

// Effect 3: Validate and reset
useEffect(() => {
  setCurrentRole((currentRole) => {
    if (!availableRoles.includes(currentRole)) {
      return primaryRole; // ← This triggers Effect 2 again
    }
    return currentRole;
  });
}, [user, availableRoles, getPrimaryRole]);
```

## **Solution**

### **1. Consolidated Role Logic**

Merged the initialization and validation logic into a **single useEffect** to eliminate conflicts:

```tsx
// Single effect to handle role initialization and validation
useEffect(() => {
  if (typeof window !== 'undefined' && user && availableRoles.length > 0) {
    const savedRole = localStorage.getItem('50brains_active_role');
    const primaryRole = getPrimaryRole();

    // Determine the correct role to use
    let targetRole: UserRole;

    if (savedRole && availableRoles.includes(savedRole as UserRole)) {
      // Use saved role if it's valid
      targetRole = savedRole as UserRole;
    } else {
      // Fall back to primary role
      targetRole = primaryRole;
    }

    // Use functional update to avoid dependency on currentRole
    setCurrentRole((current) => {
      if (current !== targetRole) {
        return targetRole;
      }
      return current; // No change needed
    });
  }
}, [user, availableRoles, getPrimaryRole]);
```

### **2. Kept Separate Save Effect**

The localStorage save effect remains separate but clean:

```tsx
// Update localStorage when role changes
useEffect(() => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('50brains_active_role', currentRole);
  }
}, [currentRole]);
```

### **3. Eliminated Race Conditions**

- **Removed `currentRole` dependency** from initialization effect
- **Used functional state updates** to prevent stale closures
- **Added conditional logging** to reduce console noise
- **Single source of truth** for role determination

## **Files Modified**

### **useRoleSwitch.tsx**

- ✅ **Removed competing useEffect hooks**
- ✅ **Consolidated initialization and validation logic**
- ✅ **Fixed circular dependencies**
- ✅ **Added functional state updates**
- ✅ **Improved debugging output**

### **RoleSwitchDebugger.tsx**

- ✅ **Previously fixed infinite render count loop**
- ✅ **Added proper dependency arrays**

## **Expected Behavior Now**

✅ **No more auto-toggling between roles**  
✅ **Clean single role initialization**  
✅ **Stable dashboard state maintained**  
✅ **Role switches only when user explicitly switches**  
✅ **Proper localStorage persistence**  
✅ **Clean console output**  
✅ **Smooth performance**

## **Testing**

1. **Load Dashboard** - Should load with saved role (no flickering)
2. **Switch Roles** - Should switch cleanly once
3. **Refresh Page** - Should maintain the selected role
4. **Check Console** - Should see minimal, clean logging
5. **Performance** - No lag or browser freezing

## **Debugging Notes**

The key insight was that **multiple useEffect hooks trying to manage the same state** will always create race conditions. The solution was to **consolidate related logic** into a single effect that handles all scenarios at once.

**Before:** 3 effects fighting each other  
**After:** 2 effects with clear, separate responsibilities 2. **Switch Roles** - Should switch smoothly without visual glitches 3. **Refresh Page** - Should maintain selected role without flickering 4. **Check Console** - Should show minimal, clean debug info (development only) 5. **No Error Messages** - Should not see "Maximum update depth exceeded" errors

## **Debug Information**

In development mode, you can still see role switching activity in console:

```
🔄 Initializing role from localStorage: {savedRole: "BRAND", availableRoles: [...]}
✅ Setting role from localStorage: BRAND
🎭 Switching role from INFLUENCER to BRAND
💾 Saving role to localStorage: BRAND
```

The role switching system is now stable and performant without the infinite re-render issue!
