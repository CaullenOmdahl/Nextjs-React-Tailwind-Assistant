# Typography Patterns

## Overview
Typography systems, font pairings, and text styling patterns used in professional Next.js templates.

## Pattern A: Font System Setup

### Characteristics
- System fonts for performance
- Custom fonts via Next.js Font Optimization
- Clear hierarchy with font weights
- Responsive scaling

### System Font Stack (Fast, Native)
```tsx
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace',
        ],
      },
    },
  },
}
```

### Custom Font with next/font (Recommended)
```tsx
// app/layout.tsx
import { Inter, Lexend } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const lexend = Lexend({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lexend',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${lexend.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
```

```tsx
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-lexend)', 'sans-serif'],
      },
    },
  },
}
```

### Common Font Pairings

**Modern SaaS:**
- **Headings**: Inter, DM Sans, Manrope
- **Body**: Inter, Open Sans, System UI
```tsx
<h1 className="font-display">Heading</h1>
<p className="font-sans">Body text</p>
```

**Professional/Corporate:**
- **Headings**: Poppins, Montserrat, Work Sans
- **Body**: Inter, Roboto, Lato

**Creative/Editorial:**
- **Headings**: Playfair Display, Merriweather, Libre Baskerville
- **Body**: Source Sans Pro, Lora, Crimson Text

**Technical/Developer:**
- **Headings**: Space Grotesk, JetBrains Mono, IBM Plex Sans
- **Body**: IBM Plex Sans, Roboto Mono, Fira Code

## Pattern B: Type Scale System

### Characteristics
- Consistent size relationships
- Responsive scaling
- Clear visual hierarchy

### Type Scale (Tailwind Default)
```tsx
// Tailwind's default scale (good starting point)
{
  'xs': '0.75rem',     // 12px
  'sm': '0.875rem',    // 14px
  'base': '1rem',      // 16px
  'lg': '1.125rem',    // 18px
  'xl': '1.25rem',     // 20px
  '2xl': '1.5rem',     // 24px
  '3xl': '1.875rem',   // 30px
  '4xl': '2.25rem',    // 36px
  '5xl': '3rem',       // 48px
  '6xl': '3.75rem',    // 60px
  '7xl': '4.5rem',     // 72px
  '8xl': '6rem',       // 96px
  '9xl': '8rem',       // 128px
}
```

### Custom Type Scale
```tsx
// tailwind.config.js - More granular control
module.exports = {
  theme: {
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
      '6xl': ['3.75rem', { lineHeight: '1' }],
      '7xl': ['4.5rem', { lineHeight: '1' }],
      '8xl': ['6rem', { lineHeight: '1' }],
      '9xl': ['8rem', { lineHeight: '1' }],
    },
  },
}
```

## Pattern C: Heading Hierarchy

### Display Headings (Hero, Landing Pages)
```tsx
<h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
  Build amazing products faster
</h1>

// With gradient text
<h1 className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-7xl">
  Modern SaaS Platform
</h1>

// With tight tracking for impact
<h1 className="text-6xl font-black tracking-tighter text-gray-900 sm:text-8xl">
  Innovation
</h1>
```

### Page Headings
```tsx
// H1 - Page title
<h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
  Documentation
</h1>

// H2 - Major sections
<h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
  Getting Started
</h2>

// H3 - Subsections
<h3 className="text-xl font-semibold text-gray-900">
  Installation
</h3>

// H4 - Minor headings
<h4 className="text-lg font-semibold text-gray-900">
  Prerequisites
</h4>

// H5 - Small headings
<h5 className="text-base font-semibold text-gray-900">
  Step 1
</h5>

// H6 - Minimal headings
<h6 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
  Note
</h6>
```

### Responsive Heading Pattern
```tsx
// Scales from mobile to desktop
<h1 className="text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl">

// Common breakpoint pattern
<h1 className="text-4xl sm:text-5xl lg:text-6xl">

// Marketing hero pattern
<h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
```

## Pattern D: Body Text & Paragraph Styles

### Standard Body Text
```tsx
// Default paragraph
<p className="text-base text-gray-600">
  This is standard body text for most content.
</p>

// Lead paragraph (introductory)
<p className="text-lg leading-8 text-gray-600">
  Larger, more prominent introductory text.
</p>

// Large body (landing pages)
<p className="text-xl leading-8 text-gray-600">
  Deploy your Next.js apps with confidence.
</p>

// Small text
<p className="text-sm text-gray-500">
  Helper text, captions, or secondary information.
</p>

// Extra small (legal, footnotes)
<p className="text-xs text-gray-500">
  Terms and conditions apply.
</p>
```

### Line Height Patterns
```tsx
// Tight (headings)
className="leading-tight"    // 1.25

// Normal (most text)
className="leading-normal"   // 1.5

// Relaxed (long-form content)
className="leading-relaxed"  // 1.625

// Loose (very readable)
className="leading-loose"    // 2
```

### Line Length (Measure)
```tsx
// Optimal reading width: 60-75 characters
<div className="mx-auto max-w-2xl">  // ~65ch
  <p>Long-form content...</p>
</div>

// Narrower for better readability
<div className="mx-auto max-w-xl">   // ~50ch
  <p>Marketing copy...</p>
</div>

// Wide for documentation
<div className="mx-auto max-w-4xl">  // ~80ch
  <article>Documentation...</article>
</div>
```

## Pattern E: Font Weight System

### Weight Hierarchy
```tsx
// Thin (100) - Rarely used
className="font-thin"

// Extra Light (200) - Display headings
className="font-extralight"

// Light (300) - Large display text
className="font-light"

// Normal (400) - Body text (default)
className="font-normal"

// Medium (500) - Slightly emphasized
className="font-medium"

// Semibold (600) - Headings, buttons
className="font-semibold"

// Bold (700) - Strong emphasis
className="font-bold"

// Extra Bold (800) - Large display
className="font-extrabold"

// Black (900) - Maximum impact
className="font-black"
```

### Common Weight Patterns
```tsx
// Hero headings
<h1 className="font-bold">         // or font-black for extra impact

// Section headings
<h2 className="font-semibold">     // or font-bold

// Body text
<p className="font-normal">

// Buttons
<button className="font-semibold"> // or font-medium

// Navigation
<nav className="font-medium">      // or font-semibold

// Captions/labels
<span className="font-medium text-sm">
```

## Pattern F: Letter Spacing (Tracking)

### Tracking Patterns
```tsx
// Tighter (large display text)
className="tracking-tighter"  // -0.05em

// Tight (headings)
className="tracking-tight"    // -0.025em

// Normal (default)
className="tracking-normal"   // 0em

// Wide (small caps, labels)
className="tracking-wide"     // 0.025em

// Wider (uppercase labels)
className="tracking-wider"    // 0.05em

// Widest (maximum spacing)
className="tracking-widest"   // 0.1em
```

### Common Uses
```tsx
// Large display headings
<h1 className="text-7xl font-bold tracking-tight">

// Uppercase labels
<span className="text-xs uppercase tracking-wider text-gray-500">
  Category
</span>

// Tight spacing for visual impact
<h2 className="text-5xl font-black tracking-tighter">
  Bold Statement
</h2>
```

## Pattern G: Text Color Patterns

### Light Mode Hierarchy
```tsx
// Primary text (headings)
className="text-gray-900"

// Secondary text (body)
className="text-gray-700"

// Tertiary text (captions)
className="text-gray-600"

// Muted text (placeholder, disabled)
className="text-gray-500"

// Very muted (borders, dividers)
className="text-gray-400"
```

### Dark Mode Hierarchy
```tsx
// Primary text (headings)
className="dark:text-white"

// Secondary text (body)
className="dark:text-gray-300"

// Tertiary text (captions)
className="dark:text-gray-400"

// Muted text
className="dark:text-gray-500"
```

### Combined Light/Dark
```tsx
<h1 className="text-gray-900 dark:text-white">
<p className="text-gray-700 dark:text-gray-300">
<span className="text-gray-600 dark:text-gray-400">
```

## Pattern H: Link Styles

### Inline Links
```tsx
// Standard underlined link
<a href="#" className="text-indigo-600 underline hover:text-indigo-500">
  Learn more
</a>

// Underline on hover
<a href="#" className="text-indigo-600 underline-offset-4 hover:underline">
  Documentation
</a>

// No underline, color change
<a href="#" className="text-indigo-600 hover:text-indigo-700">
  Link
</a>
```

### Navigation Links
```tsx
<a href="#" className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700">
  Features
</a>

// With underline indicator
<a href="#" className="group relative text-sm font-semibold">
  Features
  <span className="absolute inset-x-0 -bottom-1 h-0.5 origin-left scale-x-0 bg-gray-900 transition-transform group-hover:scale-x-100" />
</a>
```

## Pattern I: Special Text Treatments

### Eyebrow Text (Category Labels)
```tsx
<p className="text-base font-semibold leading-7 text-indigo-600">
  Deploy faster
</p>

// Alternative: smaller uppercase
<p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
  Case Study
</p>
```

### Quotations
```tsx
<blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-700">
  "This is an amazing product that changed our workflow."
</blockquote>

// Centered pull quote
<blockquote className="mx-auto max-w-2xl text-center">
  <p className="text-2xl font-semibold italic text-gray-900">
    "Innovation distinguishes between a leader and a follower."
  </p>
  <cite className="mt-4 block text-sm text-gray-600">— Steve Jobs</cite>
</blockquote>
```

### Code Text
```tsx
// Inline code
<code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono text-gray-900 dark:bg-gray-800 dark:text-gray-100">
  npm install
</code>

// Code block
<pre className="overflow-x-auto rounded-lg bg-gray-900 p-4">
  <code className="font-mono text-sm text-gray-100">
    {codeString}
  </code>
</pre>
```

### Numbers & Stats
```tsx
// Large stat numbers
<div className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
  10,000+
</div>
<div className="text-sm text-gray-600">
  Happy customers
</div>

// Tabular numbers (for alignment)
<span className="tabular-nums">
  $1,234.56
</span>
```

## Pattern J: Prose Content (Blog/Docs)

### Tailwind Typography Plugin
```tsx
// Install
npm install @tailwindcss/typography

// Configure
module.exports = {
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

// Usage
<article className="prose lg:prose-xl">
  {/* Markdown or HTML content */}
</article>
```

### Custom Prose Styling
```tsx
<article className="prose prose-lg prose-indigo max-w-none">
  <h2>Article Heading</h2>
  <p>Content with automatic styling...</p>
</article>

// Dark mode prose
<article className="prose dark:prose-invert">
```

### Prose Customization
```css
/* globals.css */
.prose {
  @apply text-gray-700 dark:text-gray-300;
}

.prose h2 {
  @apply mt-12 text-3xl font-bold tracking-tight text-gray-900 dark:text-white;
}

.prose h3 {
  @apply mt-8 text-2xl font-semibold text-gray-900 dark:text-white;
}

.prose a {
  @apply text-indigo-600 no-underline hover:underline dark:text-indigo-400;
}

.prose code {
  @apply rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono dark:bg-gray-800;
}
```

## Pattern K: Responsive Typography

### Mobile-First Scaling
```tsx
// Hero heading - scales significantly
<h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl">

// Body text - subtle scaling
<p className="text-base sm:text-lg">

// Section heading
<h2 className="text-2xl sm:text-3xl lg:text-4xl">
```

### Container Query Typography
```tsx
// With Tailwind CSS v3.4+
<div className="@container">
  <h2 className="text-2xl @lg:text-3xl @xl:text-4xl">
    Responsive to container
  </h2>
</div>
```

## Best Practices

### Accessibility
- Minimum 16px (1rem) for body text
- Sufficient contrast (4.5:1 for normal, 3:1 for large)
- Don't rely solely on color to convey meaning
- Allow text resizing up to 200%

### Performance
- Use `font-display: swap` for custom fonts
- Preload critical fonts
- Subset fonts to required characters
- Consider system fonts for better performance

### Readability
- Line length: 60-75 characters optimal
- Line height: 1.5-1.75 for body text
- Adequate spacing between paragraphs
- Consistent hierarchy throughout

## Tools & Resources

- **Font Pairing**: https://fontpair.co/
- **Google Fonts**: https://fonts.google.com/
- **Type Scale Calculator**: https://typescale.com/
- **Modular Scale**: https://www.modularscale.com/
- **Font Joy** (AI pairing): https://fontjoy.com/
