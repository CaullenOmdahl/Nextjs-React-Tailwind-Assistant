# Animation Patterns with Framer Motion

## Overview
Common animation patterns using Framer Motion for smooth, performant animations in Next.js applications.

## Pattern A: Fade In on Scroll

### Characteristics
- Elements fade in with optional Y transform
- Triggers when element enters viewport
- Respects reduced motion preferences
- **Use Cases**: Content sections, cards, feature lists

### Implementation
```tsx
'use client'

import { motion, useReducedMotion } from 'framer-motion'

export function FadeIn({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof motion.div>) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 24 },
        visible: { opacity: 1, y: 0 },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '0px 0px -200px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
```

### Usage
```tsx
<FadeIn>
  <h2>This heading fades in when scrolled into view</h2>
</FadeIn>
```

## Pattern B: Staggered Children Animations

### Characteristics
- Parent controls stagger timing
- Children animate in sequence
- Customizable stagger delay
- **Use Cases**: Lists, grids, navigation items

### Implementation
```tsx
export function FadeInStagger({
  children,
  faster = false,
  ...props
}: React.ComponentPropsWithoutRef<typeof motion.div> & {
  faster?: boolean
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '0px 0px -200px' }}
      transition={{ staggerChildren: faster ? 0.12 : 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Child component
export function FadeInStaggerItem({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof motion.div>) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 24 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
```

### Usage
```tsx
<FadeInStagger className="grid grid-cols-3 gap-8">
  {items.map((item) => (
    <FadeInStaggerItem key={item.id}>
      <Card>{item.content}</Card>
    </FadeInStaggerItem>
  ))}
</FadeInStagger>
```

## Pattern C: Animated Numbers (Count Up)

### Characteristics
- Smooth number transitions
- Springs for natural movement
- Triggers on scroll into view
- **Use Cases**: Statistics, metrics, pricing

### Implementation
```tsx
'use client'

import { useEffect } from 'react'
import { useInView, useMotionValue, useSpring } from 'framer-motion'

export function AnimatedNumber({
  value,
  className,
}: {
  value: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  })
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  useEffect(() => {
    if (isInView) {
      motionValue.set(value)
    }
  }, [motionValue, isInView, value])

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = Intl.NumberFormat('en-US').format(
          Math.floor(latest)
        )
      }
    })

    return unsubscribe
  }, [springValue])

  return <span ref={ref} className={className} />
}
```

### Usage
```tsx
<div className="text-4xl font-bold">
  <AnimatedNumber value={1000000} />+
</div>
```

## Pattern D: Layout Animations

### Characteristics
- Smooth transitions when layout changes
- Automatic position/size animations
- Shared layout transitions
- **Use Cases**: Expanding panels, reordering lists, responsive layouts

### Implementation
```tsx
'use client'

import { motion, MotionConfig } from 'framer-motion'

export function RootLayout({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <MotionConfig transition={shouldReduceMotion ? { duration: 0 } : undefined}>
      <motion.div
        layout
        className="flex min-h-full flex-col"
        style={{ borderRadius: 40 }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  )
}
```

### Expandable Card Example
```tsx
function Card({ expanded, onClick }: { expanded: boolean; onClick: () => void }) {
  return (
    <motion.div
      layout
      onClick={onClick}
      className="cursor-pointer rounded-lg bg-white p-6 shadow-lg"
      initial={false}
      animate={{ height: expanded ? 'auto' : 200 }}
    >
      <motion.h3 layout="position">Card Title</motion.h3>
      {expanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          Additional content...
        </motion.div>
      )}
    </motion.div>
  )
}
```

## Pattern E: Entrance Animations (Menu/Modal)

### Characteristics
- Scale, fade, or slide animations
- AnimatePresence for exit animations
- Smooth entry and exit
- **Use Cases**: Modals, dropdowns, overlays, navigation

### Modal Animation
```tsx
'use client'

import { Dialog } from '@headlessui/react'
import { AnimatePresence, motion } from 'framer-motion'

export function Modal({ open, onClose, children }: {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <AnimatePresence>
      {open && (
        <Dialog static open={open} onClose={onClose}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel
              as={motion.div}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="max-w-md rounded-2xl bg-white p-6 shadow-xl"
            >
              {children}
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  )
}
```

### Dropdown Animation
```tsx
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15 }}
      className="absolute mt-2 w-56 rounded-lg bg-white shadow-lg ring-1 ring-black/5"
    >
      {/* Dropdown content */}
    </motion.div>
  )}
</AnimatePresence>
```

## Pattern F: Scroll-Based Animations

### Characteristics
- Animations tied to scroll position
- useScroll and useTransform hooks
- Parallax effects
- **Use Cases**: Headers, backgrounds, parallax sections

### Implementation
```tsx
'use client'

import { useScroll, useTransform, motion } from 'framer-motion'

export function ScrollHeader() {
  const { scrollY } = useScroll()
  const bgOpacity = useTransform(scrollY, [0, 72], [0.5, 0.9])
  const scale = useTransform(scrollY, [0, 100], [1, 0.95])

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50"
      style={{
        backgroundColor: useTransform(
          bgOpacity,
          (value) => `rgba(255, 255, 255, ${value})`
        ),
        scale,
      }}
    >
      {/* Header content */}
    </motion.header>
  )
}
```

### Parallax Background
```tsx
export function ParallaxSection({ children }: { children: React.ReactNode }) {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])

  return (
    <section className="relative overflow-hidden">
      <motion.div
        style={{ y }}
        className="absolute inset-0 bg-gradient-to-b from-blue-50 to-transparent"
      />
      <div className="relative">{children}</div>
    </section>
  )
}
```

## Pattern G: Hover and Tap Interactions

### Characteristics
- Scale, color, or position changes on interaction
- Smooth transitions
- Visual feedback
- **Use Cases**: Buttons, cards, links

### Implementation
```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="rounded-lg bg-indigo-600 px-4 py-2 text-white"
>
  Click me
</motion.button>

<motion.div
  whileHover={{ y: -4 }}
  transition={{ type: 'spring', stiffness: 300 }}
  className="rounded-lg border border-gray-200 p-6"
>
  <h3>Hover to lift</h3>
</motion.div>
```

## Pattern H: Page Transitions

### Characteristics
- Smooth transitions between routes
- Fade or slide effects
- AnimatePresence at root level
- **Use Cases**: Route changes, single-page apps

### Implementation
```tsx
'use client'

import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
```

## Best Practices

### Performance
- Use `transform` and `opacity` for animations (GPU-accelerated)
- Avoid animating `width`, `height`, `top`, `left` directly
- Use `will-change` sparingly
- Set `viewport={{ once: true }}` for scroll animations

### Accessibility
- Always respect `prefers-reduced-motion`
- Use `useReducedMotion()` hook
- Provide fallbacks for essential animations
- Don't rely solely on animation to convey information

### Reduced Motion Pattern
```tsx
const shouldReduceMotion = useReducedMotion()

<MotionConfig transition={shouldReduceMotion ? { duration: 0 } : undefined}>
  {/* Your animated components */}
</MotionConfig>
```

### Viewport Margin
```tsx
// Trigger animation 200px before element enters viewport
viewport={{ once: true, margin: '0px 0px -200px' }}
```

## Common Transition Configurations

### Smooth Ease Out
```tsx
transition={{ duration: 0.5, ease: 'easeOut' }}
```

### Spring Animation
```tsx
transition={{ type: 'spring', stiffness: 300, damping: 30 }}
```

### Stagger with Delay
```tsx
transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
```

## Dependencies
- `framer-motion` - Animation library
- `@headlessui/react` - Optional, for Dialog integration

## Resources
- Framer Motion Docs: https://www.framer.com/motion/
- Animation Examples: https://www.framer.com/motion/examples/
