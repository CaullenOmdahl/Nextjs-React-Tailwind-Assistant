# Visual Effects Patterns

## Overview
Distinctive visual effects and decorative elements used in professional Next.js templates to create engaging, memorable user experiences.

## Pattern A: Gradient Backgrounds

### Characteristics
- Subtle to bold gradient combinations
- Often combined with transparency for layering
- Used for sections, cards, hero areas, overlays
- **Common in**: Modern SaaS, creative portfolios, landing pages

### Implementation Examples

#### Subtle Gradient Section
```tsx
<section className="bg-gradient-to-b from-indigo-100/20 to-transparent">
  {/* Content */}
</section>
```

#### Bold Gradient Hero
```tsx
<div className="bg-gradient-to-br from-indigo-600 to-purple-600">
  {/* Hero content */}
</div>
```

#### Gradient with Multiple Stops
```tsx
<div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
  {/* Content */}
</div>
```

#### Radial Gradients
```tsx
<div className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-white to-white">
  {/* Content */}
</div>
```

### Common Gradient Combinations

**Professional/Corporate:**
- `from-gray-50 to-white`
- `from-blue-50 to-indigo-50`
- `from-slate-50 via-white to-slate-50`

**Modern SaaS:**
- `from-indigo-100/20 to-transparent`
- `from-blue-50 to-cyan-50`
- `from-violet-50 to-purple-50`

**Bold/Creative:**
- `from-pink-500 via-purple-500 to-indigo-500`
- `from-orange-400 to-pink-600`
- `from-emerald-400 to-cyan-400`

**Dark Mode:**
- `from-gray-900 to-black`
- `from-slate-900 via-purple-900 to-slate-900`
- `from-zinc-900 to-zinc-950`

## Pattern B: Glow Effects

### Characteristics
- Radial gradients with blur for soft glows
- Often positioned absolutely behind content
- Creates depth and focus
- **Common in**: Developer tools, technical products

### Radial Glow Implementation
```tsx
<div className="relative">
  {/* Glow effect */}
  <div className="absolute -inset-x-20 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
    <div
      className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-600 to-purple-600 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
      style={{
        clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'
      }}
    />
  </div>

  {/* Content */}
  <div className="relative">
    {/* Your content here */}
  </div>
</div>
```

### Decorative Glow Behind Card
```tsx
<div className="relative">
  {/* Glow */}
  <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000" />

  {/* Card */}
  <div className="relative rounded-lg bg-white p-6">
    {/* Card content */}
  </div>
</div>
```

### Sidebar Glow (Commit-style)
```tsx
<aside className="relative">
  {/* Radial glow effect */}
  <div className="absolute inset-x-0 top-0 h-96 bg-gradient-radial from-indigo-500/20 to-transparent opacity-50" />

  <div className="relative">
    {/* Sidebar content */}
  </div>
</aside>
```

## Pattern C: Animated Backgrounds

### Starfield Animation
```tsx
'use client'

import { useEffect, useRef } from 'react'

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const stars: Array<{ x: number; y: number; radius: number; opacity: number; speed: number }> = []

    // Generate stars
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5,
        opacity: Math.random(),
        speed: Math.random() * 0.5
      })
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)

      stars.forEach((star) => {
        ctx!.beginPath()
        ctx!.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
        ctx!.fill()

        // Twinkle effect
        star.opacity += star.speed * 0.01
        if (star.opacity > 1 || star.opacity < 0) {
          star.speed = -star.speed
        }
      })

      requestAnimationFrame(animate)
    }

    animate()
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  )
}
```

### Animated Gradient Mesh
```tsx
<div className="absolute inset-0 -z-10 overflow-hidden">
  <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
        <path d="M0 32V0h32" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-200" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" />
  </svg>
</div>
```

### Animated Circles (Pocket-style)
```tsx
'use client'

import { motion } from 'framer-motion'

export function AnimatedCircles() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute -top-1/2 -right-1/2 h-[200%] w-[200%]"
      >
        <svg viewBox="0 0 200 200" className="h-full w-full">
          <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-indigo-200" />
          <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-purple-200" />
          <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-pink-200" />
        </svg>
      </motion.div>
    </div>
  )
}
```

## Pattern D: Decorative SVG Elements

### Hand-Drawn Underline (Salient-style)
```tsx
export function DecorativeUnderline() {
  return (
    <svg
      viewBox="0 0 200 20"
      className="absolute left-0 top-full w-full"
      preserveAspectRatio="none"
    >
      <path
        d="M0 10 Q 50 15, 100 10 T 200 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-indigo-500"
      />
    </svg>
  )
}
```

### Swirly Doodle Decoration
```tsx
export function SwirlyDoodle() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="absolute h-32 w-32 text-indigo-200"
      aria-hidden="true"
    >
      <path
        d="M 10 50 Q 30 20, 50 50 T 90 50"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
    </svg>
  )
}
```

### Dot Grid Pattern
```tsx
<div className="absolute inset-0 -z-10">
  <div className="absolute inset-0" style={{
    backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
    backgroundSize: '24px 24px'
  }} />
</div>
```

## Pattern E: Ring & Border Effects

### Ring Pattern (Spotlight-style)
```tsx
<div className="fixed inset-0 -z-10">
  <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/10 sm:rounded-[5rem]" />
</div>
```

### Animated Border Gradient
```tsx
<div className="relative p-[2px] rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-gradient">
  <div className="rounded-lg bg-white p-6">
    {/* Content */}
  </div>
</div>

{/* Add to tailwind.config.js */}
{
  theme: {
    extend: {
      animation: {
        'gradient': 'gradient 3s ease infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-position': '0% 50%',
          },
          '50%': {
            'background-position': '100% 50%',
          },
        },
      },
    },
  },
}
```

### Inset Shadow for Depth
```tsx
<div className="rounded-2xl bg-white shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] dark:bg-gray-900 dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
  {/* Content */}
</div>
```

## Pattern F: Bento Grid Layout (Radiant-style)

### Characteristics
- Asymmetric grid with varied column/row spans
- Cards with different visual treatments
- Interactive elements within cards
- Modern, Pinterest-like aesthetic

### Implementation
```tsx
<div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:grid-rows-2">
  {/* Large feature - spans 4 columns, 2 rows */}
  <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 p-8 lg:col-span-4 lg:row-span-2">
    <h3 className="text-2xl font-bold text-white">Primary Feature</h3>
    {/* Feature content */}

    {/* Decorative gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
  </div>

  {/* Medium card - spans 2 columns, 1 row */}
  <div className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-gray-200 lg:col-span-2">
    <h3 className="text-lg font-semibold">Feature Two</h3>
    {/* Content */}
  </div>

  {/* Small card */}
  <div className="rounded-3xl bg-gradient-to-br from-pink-50 to-purple-50 p-6 lg:col-span-2">
    <h3 className="text-lg font-semibold">Feature Three</h3>
    {/* Content */}
  </div>
</div>
```

## Pattern G: Image Treatments

### Grayscale with Color on Hover
```tsx
<Image
  src="/image.jpg"
  alt="Description"
  className="grayscale transition-all duration-300 hover:grayscale-0"
/>
```

### Image with Gradient Overlay
```tsx
<div className="relative">
  <Image src="/image.jpg" alt="Description" fill className="object-cover" />
  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />

  {/* Content overlaid on image */}
  <div className="relative z-10 p-6">
    <h3 className="text-white">Title</h3>
  </div>
</div>
```

### Image with Ring
```tsx
<div className="relative aspect-video overflow-hidden rounded-2xl">
  <Image src="/image.jpg" alt="Description" fill className="object-cover" />
  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
</div>
```

## Pattern H: Backdrop Effects

### Backdrop Blur for Overlays
```tsx
<div className="fixed inset-0 bg-black/30 backdrop-blur-sm">
  {/* Modal or overlay content */}
</div>
```

### Frosted Glass Effect
```tsx
<div className="rounded-2xl bg-white/80 backdrop-blur-xl ring-1 ring-gray-900/10 dark:bg-gray-900/80 dark:ring-white/10">
  {/* Content */}
</div>
```

## Pattern I: Clip Paths & Masks

### Diagonal Clip
```tsx
<div
  className="bg-gradient-to-br from-indigo-600 to-purple-600"
  style={{
    clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)'
  }}
>
  {/* Content */}
</div>
```

### Custom Shape Mask
```tsx
<div className="relative">
  <Image src="/image.jpg" alt="Description" fill />
  <div
    className="absolute inset-0 bg-gradient-to-tr from-indigo-600/90 to-purple-600/90"
    style={{
      clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'
    }}
  />
</div>
```

## Performance Considerations

- Use `will-change` sparingly for animated elements
- Prefer `transform` and `opacity` for animations
- Use `backdrop-filter` with caution (performance cost)
- Implement lazy loading for heavy SVG animations
- Consider reduced motion preferences

```tsx
const prefersReducedMotion = useReducedMotion()

<motion.div
  animate={prefersReducedMotion ? {} : { scale: [1, 1.2, 1] }}
>
  {/* Content */}
</motion.div>
```

## Accessibility Notes

- Always use `aria-hidden="true"` on decorative elements
- Ensure sufficient contrast for text over backgrounds
- Provide alternatives for users with motion sensitivity
- Don't rely solely on visual effects to convey information
- Test with screen readers to ensure decorative elements don't interfere

## Browser Support

- Backdrop filters: Modern browsers only (consider fallbacks)
- Clip paths: Well supported, provide rectangular fallback
- Gradients: Universal support
- SVG animations: Use CSS animations for broader support
