# 📚 Next.js Project Structure Guide

## For Developers Coming from Vanilla React

### 🏗️ **Project Overview**

```
50BraIns-Client/
├── apps/web/                    # Main Next.js application
│   ├── src/
│   │   ├── app/                 # 🚨 NEW: App Router (Next.js 13+)
│   │   │   ├── globals.css      # Global styles
│   │   │   ├── layout.tsx       # Root layout (replaces _app.js)
│   │   │   ├── page.tsx         # Home page (replaces index.js)
│   │   │   ├── login/
│   │   │   │   └── page.tsx     # Login page (/login route)
│   │   │   ├── register/
│   │   │   │   └── page.tsx     # Register page (/register route)
│   │   │   └── dashboard/
│   │   │       └── page.tsx     # Dashboard page (/dashboard route)
│   │   ├── components/          # Reusable React components
│   │   │   ├── auth/           # Authentication-related components
│   │   │   ├── landing/        # Landing page components
│   │   │   └── layout/         # Layout components (Header, Footer)
│   │   └── hooks/              # Custom React hooks
│   ├── package.json
│   ├── tailwind.config.js       # Tailwind CSS configuration
│   └── next.config.js          # Next.js configuration
├── packages/                    # Shared packages (monorepo structure)
│   ├── api-client/             # API client library
│   └── shared-types/           # TypeScript type definitions
└── turbo.json                  # Turborepo configuration
```

---

## 🔄 **Key Differences: Vanilla React vs Next.js**

### **1. Routing System**

| **Vanilla React**                                         | **Next.js App Router**           |
| --------------------------------------------------------- | -------------------------------- |
| React Router: `<Route path="/login" component={Login} />` | File-based: `app/login/page.tsx` |
| Manual setup                                              | Automatic                        |
| Client-side only                                          | Server + Client                  |

### **2. Page Creation**

| **Vanilla React**              | **Next.js**                        |
| ------------------------------ | ---------------------------------- |
| `Login.jsx` → Import in Router | `app/login/page.tsx` → Auto-routed |
| Manual route definition        | File = Route                       |

### **3. File Naming Conventions**

```bash
# Next.js App Router Special Files:
app/page.tsx          # Home page (/)
app/layout.tsx        # Layout wrapper
app/loading.tsx       # Loading UI
app/error.tsx         # Error handling
app/not-found.tsx     # 404 page

# Route Examples:
app/login/page.tsx           → /login
app/dashboard/page.tsx       → /dashboard
app/profile/settings/page.tsx → /profile/settings
```

---

## 🎨 **Styling System (Current Setup)**

### **Tailwind CSS Classes Explained**

```css
/* Custom CSS Classes (defined in globals.css) */
.btn-primary         /* Blue button with hover effects */
.btn-ghost          /* Transparent button */
.card-glass         /* Glass morphism card effect */
.input              /* Styled form input */
.text-heading       /* Heading text style */
.text-muted         /* Muted/secondary text */

/* Tailwind Utility Classes */
.bg-brand-primary   /* Brand blue background */
.text-brand-text-main /* Main text color */
.border-brand-border /* Border color */
.rounded-none         /* Large border radius */
.px-4 py-2          /* Padding: 1rem horizontal, 0.5rem vertical */
.flex items-center  /* Flexbox with center alignment */
```

### **Color System**

```javascript
// From tailwind.config.js
colors: {
  brand: {
    primary: '#247eab',           // Main blue
    base: '#FFFFFF',              // White background
    'light-blue': '#E0F5FE',      // Light blue accents
    text: {
      main: '#1E1E1E',            // Dark text
      muted: '#5E6A79',           // Gray text
    },
    border: '#E5EAF2',            // Border color
  }
}
```

---

## 🧩 **Component Structure**

### **1. Page Components** (`app/*/page.tsx`)

```tsx
// app/register/page.tsx
'use client'; // 🚨 Required for client-side features (useState, etc.)

import { useState } from 'react';
import { Header } from '@/components/layout/header';

export default function RegisterPage() {
  // Component logic
  return (
    <div>
      <Header />
      {/* Page content */}
    </div>
  );
}
```

### **2. Layout Components** (`app/layout.tsx`)

```tsx
// app/layout.tsx - Wraps all pages
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <div id="root">
          {children} {/* Your page content goes here */}
        </div>
      </body>
    </html>
  );
}
```

### **3. Reusable Components** (`components/*/`)

```tsx
// components/layout/header.tsx
export function Header() {
  return <header className="border-b bg-white">{/* Header content */}</header>;
}
```

---

## 🎯 **Development Workflow**

### **1. Creating a New Page**

```bash
# Create: app/about/page.tsx
mkdir src/app/about
touch src/app/about/page.tsx
```

```tsx
// src/app/about/page.tsx
'use client';

export default function AboutPage() {
  return (
    <div className="page-container">
      <h1 className="text-heading text-3xl">About Us</h1>
    </div>
  );
}
```

**Result**: Automatically available at `/about`

### **2. Adding a Component**

```bash
# Create: components/ui/button.tsx
mkdir src/components/ui
touch src/components/ui/button.tsx
```

```tsx
// src/components/ui/button.tsx
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'ghost';
}

export function Button({
  children,
  onClick,
  variant = 'primary',
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={variant === 'primary' ? 'btn-primary' : 'btn-ghost'}
    >
      {children}
    </button>
  );
}
```

### **3. Using Components**

```tsx
// app/some-page/page.tsx
import { Button } from '@/components/ui/button'; // @ = src/ alias

export default function SomePage() {
  return (
    <div>
      <Button onClick={() => alert('Clicked!')}>Click Me</Button>
    </div>
  );
}
```

---

## 🐛 **Common Debugging Issues & Solutions**

### **Issue 1: "The default export is not a React Component"**

```tsx
// ❌ Wrong
export function LoginPage() {}

// ✅ Correct
export default function LoginPage() {}
```

### **Issue 2: Client vs Server Components**

```tsx
// ❌ Server component using browser APIs
export default function Page() {
  const [state, setState] = useState(0); // Error!
}

// ✅ Client component
('use client');
export default function Page() {
  const [state, setState] = useState(0); // Works!
}
```

### **Issue 3: Route Conflicts**

```bash
# ❌ This creates conflicts:
app/(auth)/login/page.tsx  # Creates /login route
app/login/page.tsx         # Also creates /login route

# ✅ Use one or the other:
app/login/page.tsx         # Simple approach
# OR
app/(auth)/login/page.tsx  # Route groups (advanced)
```

### **Issue 4: CSS Class Not Working**

```tsx
// ❌ Class doesn't exist in CSS
<div className="btn-primary">  // Check globals.css

// ✅ Ensure class is defined
// Check: src/app/globals.css
.btn-primary { @apply bg-brand-primary text-white; }
```

---

## 🚀 **Development Commands**

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Install new package
npm install package-name

# Check for errors
npm run type-check  # TypeScript
npm run lint        # ESLint
```

---

## 📁 **File Organization Best Practices**

### **When to Create New Files**

```bash
# Page = New route needed
app/pricing/page.tsx          # /pricing page

# Component = Reusable UI element
components/ui/modal.tsx       # Modal component

# Hook = Reusable logic
hooks/useLocalStorage.tsx     # Local storage hook

# Type = TypeScript definitions
types/user.ts                 # User type definitions
```

### **Import Patterns**

```tsx
// External packages
import { useState } from 'react';
import Link from 'next/link';

// Internal components (use @ alias)
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

// Types
import type { User } from '@/types/user';
```

---

## 🔧 **Quick Debugging Checklist**

1. **Page not loading?**
   - ✅ Check file is named `page.tsx`
   - ✅ Check `export default function`
   - ✅ Check file location matches URL

2. **Component not rendering?**
   - ✅ Check import path (`@/components/...`)
   - ✅ Check component export
   - ✅ Check for TypeScript errors

3. **Styles not applying?**
   - ✅ Check Tailwind class exists
   - ✅ Check custom class in `globals.css`
   - ✅ Check for typos

4. **State not working?**
   - ✅ Add `'use client';` directive
   - ✅ Check React hooks import

---

## 💡 **Pro Tips**

1. **Use VS Code Extensions**:
   - ES7+ React/Redux/React-Native snippets
   - Tailwind CSS IntelliSense
   - TypeScript Importer

2. **File naming**:
   - `PascalCase` for components: `UserProfile.tsx`
   - `camelCase` for hooks: `useAuth.tsx`
   - `kebab-case` for pages: `page.tsx` (in kebab-case folders)

3. **Folder structure**:
   - Group by feature: `components/auth/LoginForm.tsx`
   - Keep related files together

4. **TypeScript**:
   - Always define prop interfaces
   - Use `React.FC<Props>` or function syntax
   - Export types when needed

---

This structure gives you a clear mental model of how Next.js works compared to vanilla React. The key insight is that **files = routes** and **folders = structure**!
