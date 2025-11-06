# Application Header Pattern

## Overview
A responsive header component for Next.js applications with navigation, search, theme toggle, and mobile menu support.

## Key Features
- Scroll-based opacity changes
- Mobile-responsive navigation
- Dark mode toggle
- Search functionality
- Animated transitions (Framer Motion)

## Common Structure

```typescript
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/Button'
import { ThemeToggle } from '@/components/ThemeToggle'

export function Header() {
  const { scrollY } = useScroll()
  const bgOpacity = useTransform(scrollY, [0, 72], ['0.5', '0.9'])
  
  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50"
      style={{ backgroundColor: `rgba(255, 255, 255, ${bgOpacity})` }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              {/* Your logo here */}
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:gap-x-8">
            <Link href="/docs" className="text-sm/6 font-semibold">
              Documentation
            </Link>
            {/* More nav items */}
          </nav>
          
          {/* Actions */}
          <div className="flex items-center gap-x-4">
            <ThemeToggle />
            {/* Mobile menu button */}
          </div>
        </div>
      </div>
    </motion.header>
  )
}
```

## Styling Patterns

### Scroll-Based Styling
```typescript
const { scrollY } = useScroll()
const bgOpacityLight = useTransform(scrollY, [0, 72], ['50%', '90%'])
const bgOpacityDark = useTransform(scrollY, [0, 72], ['20%', '80%'])
```

### Responsive Navigation
```tsx
<nav className="hidden md:flex md:gap-x-8">
  {/* Desktop nav */}
</nav>

<div className="md:hidden">
  {/* Mobile menu button */}
</div>
```

## Dependencies
- `framer-motion` - For animations
- `@headlessui/react` - For accessible UI components
- `next/link` - For client-side navigation

## Accessibility
- Use semantic HTML (`<header>`, `<nav>`)
- Include ARIA labels for icon buttons
- Ensure keyboard navigation works
- Provide focus indicators

## Dark Mode Support
```tsx
className="bg-white dark:bg-zinc-900"
className="text-zinc-900 dark:text-white"
```

