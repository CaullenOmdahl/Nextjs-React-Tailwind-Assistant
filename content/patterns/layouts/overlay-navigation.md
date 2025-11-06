# Overlay Navigation Pattern

## Overview
Full-screen or expandable overlay navigation that provides immersive menu experience with smooth animations.

## Characteristics
- Full-screen or large overlay that appears on menu activation
- Animated transitions using Framer Motion
- Desktop shows minimal header, mobile shows hamburger
- Context-aware hover states
- Dismisses on navigation or escape key
- **Common in**: Agency sites, creative portfolios, brand-focused experiences

## Implementation Pattern A: Disclosure-Based Overlay

### Structure
```tsx
'use client'

import { Disclosure } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export function OverlayNav() {
  return (
    <Disclosure as="nav">
      {({ open }) => (
        <>
          {/* Header Bar */}
          <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-between p-6">
            <Link href="/" className="flex items-center">
              <Logo className="h-8 w-auto" />
            </Link>

            <Disclosure.Button className="rounded-full bg-white/90 p-2 shadow-lg ring-1 ring-black/10">
              {open ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </Disclosure.Button>
          </div>

          {/* Overlay Panel */}
          <AnimatePresence>
            {open && (
              <Disclosure.Panel
                as={motion.div}
                static
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 flex items-center justify-center bg-gray-900"
              >
                <nav className="flex flex-col items-center space-y-8">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={item.href}
                        className="text-4xl font-bold text-white hover:text-gray-300"
                      >
                        {item.name}
                      </Link>
                    </motion.div>
                  ))}
                </nav>
              </Disclosure.Panel>
            )}
          </AnimatePresence>
        </>
      )}
    </Disclosure>
  )
}
```

## Implementation Pattern B: Context-Based Overlay

### With Motion Config and Reduced Motion
```tsx
'use client'

import { createContext, useContext, useState, useId } from 'react'
import { motion, MotionConfig, useReducedMotion } from 'framer-motion'
import Link from 'next/link'

const NavigationContext = createContext<{
  open: boolean
  setOpen: (open: boolean) => void
} | null>(null)

export function RootLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  return (
    <NavigationContext.Provider value={{ open, setOpen }}>
      <MotionConfig transition={shouldReduceMotion ? { duration: 0 } : undefined}>
        <div className="relative flex min-h-full flex-col">
          <Header />
          <motion.div
            layout
            style={{ borderRadius: 40 }}
            className="relative flex-auto"
          >
            {children}
          </motion.div>
          {open && <Navigation />}
        </div>
      </MotionConfig>
    </NavigationContext.Provider>
  )
}

function Header() {
  const { open, setOpen } = useContext(NavigationContext)!

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between p-6">
      <Logo />
      <button
        onClick={() => setOpen(!open)}
        className="rounded-full bg-white p-2 shadow-lg"
      >
        {open ? <XMarkIcon /> : <Bars3Icon />}
      </button>
    </header>
  )
}

function Navigation() {
  const { setOpen } = useContext(NavigationContext)!

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-gray-900/95 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <nav onClick={(e) => e.stopPropagation()}>
        {/* Navigation content */}
      </nav>
    </motion.div>
  )
}
```

## Animation Patterns

### Staggered Link Animations
```tsx
{navItems.map((item, index) => (
  <motion.div
    key={item.name}
    initial={{ opacity: 0, rotateY: -90 }}
    animate={{ opacity: 1, rotateY: 0 }}
    transition={{
      delay: index * 0.1,
      duration: 0.5,
      type: 'spring'
    }}
  >
    <Link href={item.href}>
      {item.name}
    </Link>
  </motion.div>
))}
```

### Scale and Fade
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ duration: 0.2 }}
>
  {/* Overlay content */}
</motion.div>
```

### Slide from Edge
```tsx
<motion.div
  initial={{ x: '100%' }}
  animate={{ x: 0 }}
  exit={{ x: '100%' }}
  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
>
  {/* Slide-in panel */}
</motion.div>
```

## Styling Variations

### Dark Overlay with Blur
```tsx
className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm"
```

### Gradient Overlay
```tsx
className="fixed inset-0 bg-gradient-to-br from-indigo-600 to-purple-600"
```

### Light Overlay
```tsx
className="fixed inset-0 bg-white"
```

## Navigation Link Styling

### Large Display Links
```tsx
<Link
  href={item.href}
  className="text-5xl font-bold tracking-tight text-white transition hover:text-gray-300 md:text-6xl lg:text-7xl"
>
  {item.name}
</Link>
```

### With Underline Animation
```tsx
<Link
  href={item.href}
  className="group relative text-4xl font-bold text-white"
>
  {item.name}
  <span className="absolute inset-x-0 -bottom-2 h-1 origin-left scale-x-0 bg-white transition-transform group-hover:scale-x-100" />
</Link>
```

### With Icons
```tsx
<Link
  href={item.href}
  className="flex items-center space-x-4 text-3xl font-bold text-white"
>
  <item.icon className="h-8 w-8" />
  <span>{item.name}</span>
</Link>
```

## Accessibility Features

### Keyboard Navigation
```tsx
// Escape key to close
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false)
  }

  if (open) {
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }
}, [open, setOpen])
```

### Focus Management
```tsx
// Focus first link when opened
const firstLinkRef = useRef<HTMLAnchorElement>(null)

useEffect(() => {
  if (open && firstLinkRef.current) {
    firstLinkRef.current.focus()
  }
}, [open])
```

### ARIA Attributes
```tsx
<button
  aria-label="Toggle navigation"
  aria-expanded={open}
  onClick={() => setOpen(!open)}
>
  {open ? <XMarkIcon /> : <Bars3Icon />}
</button>
```

## Mobile Considerations

### Touch-Friendly Targets
- Minimum tap target: 44×44px
- Adequate spacing between links
- Avoid hover-only interactions

### Performance
- Use `will-change` sparingly
- Respect `prefers-reduced-motion`
- Optimize for 60fps animations

## Advanced Features

### Close on Route Change
```tsx
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

function Navigation() {
  const { setOpen } = useContext(NavigationContext)!
  const pathname = usePathname()

  useEffect(() => {
    setOpen(false)
  }, [pathname, setOpen])

  return (/* navigation */)
}
```

### Body Scroll Lock
```tsx
useEffect(() => {
  if (open) {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }
}, [open])
```

### Background Click to Close
```tsx
<div
  onClick={() => setOpen(false)}
  className="fixed inset-0 bg-gray-900/95"
>
  <nav onClick={(e) => e.stopPropagation()}>
    {/* Prevent click from bubbling to background */}
  </nav>
</div>
```

## Dependencies
- `framer-motion` - Smooth animations
- `@headlessui/react` - Disclosure component
- `@heroicons/react` - Menu icons
- `next/navigation` - Route change detection
