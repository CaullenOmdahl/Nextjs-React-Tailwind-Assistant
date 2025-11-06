# Hero Section Pattern

## Overview
Eye-catching landing page hero sections with gradients, animations, and CTAs.

## Variants

### 1. Centered Hero with Gradient
```tsx
export function HeroSection() {
  return (
    <div className="relative isolate overflow-hidden bg-gradient-to-b from-indigo-100/20">
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
          <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Build amazing products faster
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Deploy your Next.js apps with confidence using modern tools and best practices.
          </p>
          <div className="mt-10 flex items-center gap-x-6">
            <Button href="/docs">Get started</Button>
            <Button href="/demo" variant="outline">Live demo</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### 2. Split Hero with Image
```tsx
<div className="grid lg:grid-cols-2 gap-8 items-center">
  <div>
    {/* Content */}
  </div>
  <div className="relative">
    <Image src="/hero.png" alt="Product" className="rounded-lg shadow-2xl" />
  </div>
</div>
```

## Animation Patterns
```tsx
import { motion } from 'framer-motion'

<motion.h1
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
```

## Background Patterns
- Gradient meshes
- Grid patterns
- Dot patterns
- Animated particles

