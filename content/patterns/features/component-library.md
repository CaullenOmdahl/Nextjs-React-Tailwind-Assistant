# Component Library Patterns

## Overview
Reusable component patterns extracted from professional Next.js templates. These are common UI building blocks with consistent styling and behavior patterns.

## Pattern A: Button Components

### Characteristics
- Multiple variants (solid, outline, ghost, text)
- Color schemes (primary, secondary, danger, success)
- Sizes (sm, md, lg, xl)
- Polymorphic (renders as button or link)
- States (default, hover, active, disabled, loading)

### Base Implementation
```tsx
import { type ButtonHTMLAttributes, type AnchorHTMLAttributes } from 'react'
import Link from 'next/link'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        solid: '',
        outline: 'border-2',
        ghost: '',
        text: 'underline-offset-4 hover:underline',
      },
      color: {
        primary: '',
        secondary: '',
        danger: '',
        white: '',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-11 px-6 text-base',
        xl: 'h-12 px-8 text-base',
      },
    },
    compoundVariants: [
      // Solid variants
      {
        variant: 'solid',
        color: 'primary',
        className: 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600',
      },
      {
        variant: 'solid',
        color: 'secondary',
        className: 'bg-gray-900 text-white hover:bg-gray-700 focus-visible:outline-gray-900',
      },
      {
        variant: 'solid',
        color: 'danger',
        className: 'bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-600',
      },
      {
        variant: 'solid',
        color: 'white',
        className: 'bg-white text-gray-900 hover:bg-gray-50 focus-visible:outline-white',
      },
      // Outline variants
      {
        variant: 'outline',
        color: 'primary',
        className: 'border-indigo-600 text-indigo-600 hover:bg-indigo-50 focus-visible:outline-indigo-600',
      },
      {
        variant: 'outline',
        color: 'secondary',
        className: 'border-gray-300 text-gray-700 hover:bg-gray-50 focus-visible:outline-gray-900',
      },
      // Ghost variants
      {
        variant: 'ghost',
        color: 'primary',
        className: 'text-indigo-600 hover:bg-indigo-50 focus-visible:outline-indigo-600',
      },
      {
        variant: 'ghost',
        color: 'secondary',
        className: 'text-gray-700 hover:bg-gray-100 focus-visible:outline-gray-900',
      },
    ],
    defaultVariants: {
      variant: 'solid',
      color: 'primary',
      size: 'md',
    },
  }
)

type ButtonProps = VariantProps<typeof buttonVariants> & (
  | ({ href?: never } & ButtonHTMLAttributes<HTMLButtonElement>)
  | ({ href: string } & AnchorHTMLAttributes<HTMLAnchorElement>)
)

export function Button({
  variant,
  color,
  size,
  className,
  href,
  ...props
}: ButtonProps) {
  const classes = buttonVariants({ variant, color, size, className })

  if (href) {
    return <Link href={href} className={classes} {...props as any} />
  }

  return <button className={classes} {...props as any} />
}
```

### Loading State
```tsx
export function Button({ loading, children, disabled, ...props }: ButtonProps & { loading?: boolean }) {
  return (
    <button disabled={disabled || loading} {...props}>
      {loading && (
        <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  )
}
```

### Icon Button
```tsx
export function IconButton({ icon: Icon, children, ...props }: ButtonProps & { icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <Button {...props}>
      {Icon && <Icon className="mr-2 h-4 w-4" />}
      {children}
    </Button>
  )
}
```

## Pattern B: Card Components

### Base Card
```tsx
export function Card({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
```

### Card with Hover Effect
```tsx
export function InteractiveCard({ children, href, ...props }: React.HTMLAttributes<HTMLDivElement> & { href?: string }) {
  const content = (
    <div className="group rounded-2xl bg-white p-6 shadow-md ring-1 ring-gray-200 transition-all hover:shadow-xl hover:ring-gray-300 dark:bg-gray-900 dark:ring-gray-800 dark:hover:ring-gray-700">
      {children}
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}
```

### Feature Card Pattern
```tsx
export function FeatureCard({ icon: Icon, title, description }: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-gray-200 p-8 dark:border-gray-800">
      <div className="mb-4 inline-flex rounded-lg bg-indigo-100 p-3 dark:bg-indigo-900/20">
        <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </div>
  )
}
```

### Gradient Card
```tsx
export function GradientCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="group relative">
      {/* Gradient border */}
      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 opacity-75 blur transition duration-1000 group-hover:opacity-100" />

      {/* Card content */}
      <div className="relative rounded-2xl bg-white p-6 dark:bg-gray-900">
        {children}
      </div>
    </div>
  )
}
```

## Pattern C: Badge & Pill Components

### Badge Variants
```tsx
const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
  {
    variants: {
      variant: {
        solid: '',
        outline: 'border',
        soft: '',
      },
      color: {
        gray: '',
        blue: '',
        green: '',
        yellow: '',
        red: '',
      },
    },
    compoundVariants: [
      // Solid variants
      {
        variant: 'solid',
        color: 'gray',
        className: 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900',
      },
      {
        variant: 'solid',
        color: 'blue',
        className: 'bg-blue-600 text-white',
      },
      {
        variant: 'solid',
        color: 'green',
        className: 'bg-green-600 text-white',
      },
      {
        variant: 'solid',
        color: 'yellow',
        className: 'bg-yellow-500 text-white',
      },
      {
        variant: 'solid',
        color: 'red',
        className: 'bg-red-600 text-white',
      },
      // Soft variants
      {
        variant: 'soft',
        color: 'gray',
        className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      },
      {
        variant: 'soft',
        color: 'blue',
        className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
      },
      {
        variant: 'soft',
        color: 'green',
        className: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
      },
      {
        variant: 'soft',
        color: 'yellow',
        className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
      },
      {
        variant: 'soft',
        color: 'red',
        className: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
      },
    ],
    defaultVariants: {
      variant: 'soft',
      color: 'gray',
    },
  }
)

export function Badge({ variant, color, children, className }: VariantProps<typeof badgeVariants> & { children: React.ReactNode; className?: string }) {
  return (
    <span className={badgeVariants({ variant, color, className })}>
      {children}
    </span>
  )
}
```

### Badge with Dot Indicator
```tsx
export function StatusBadge({ status, children }: { status: 'success' | 'warning' | 'error' | 'info'; children: React.ReactNode }) {
  const colors = {
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  }

  return (
    <span className="inline-flex items-center gap-x-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
      <span className={`h-1.5 w-1.5 rounded-full ${colors[status]}`} />
      {children}
    </span>
  )
}
```

## Pattern D: Input & Form Field Components

### Text Input
```tsx
export function Input({ label, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  return (
    <div>
      {label && (
        <label htmlFor={props.id} className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        className={`block w-full rounded-lg border ${
          error
            ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900'
        } px-3 py-2 shadow-sm focus:outline-none focus:ring-1 sm:text-sm`}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}
```

### Textarea
```tsx
export function Textarea({ label, error, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }) {
  return (
    <div>
      {label && (
        <label htmlFor={props.id} className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <textarea
        className={`block w-full rounded-lg border ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900'
        } px-3 py-2 shadow-sm focus:outline-none focus:ring-1 sm:text-sm`}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}
```

## Pattern E: Container Components

### Standard Container
```tsx
export function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className || ''}`}>
      {children}
    </div>
  )
}
```

### Narrow Container (for content)
```tsx
export function NarrowContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  )
}
```

### Section Container
```tsx
export function Section({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`py-20 sm:py-32 ${className || ''}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  )
}
```

## Pattern F: Avatar Components

### Simple Avatar
```tsx
import Image from 'next/image'

export function Avatar({ src, alt, size = 'md' }: { src: string; alt: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  }

  return (
    <div className={`relative ${sizes[size]} overflow-hidden rounded-full bg-gray-100`}>
      <Image src={src} alt={alt} fill className="object-cover" />
    </div>
  )
}
```

### Avatar with Ring
```tsx
export function AvatarWithRing({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-white shadow-lg dark:ring-gray-900">
      <Image src={src} alt={alt} fill className="object-cover" />
    </div>
  )
}
```

### Initials Avatar
```tsx
export function InitialsAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  }

  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className={`inline-flex ${sizes[size]} items-center justify-center rounded-full bg-indigo-600 font-semibold text-white`}>
      {initials}
    </div>
  )
}
```

## Pattern G: Divider Components

### Simple Divider
```tsx
export function Divider({ className }: { className?: string }) {
  return <hr className={`border-gray-200 dark:border-gray-800 ${className || ''}`} />
}
```

### Divider with Text
```tsx
export function DividerWithText({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-gray-200 dark:border-gray-800" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-white px-2 text-sm text-gray-500 dark:bg-gray-950 dark:text-gray-400">
          {children}
        </span>
      </div>
    </div>
  )
}
```

## Pattern H: Loading & Skeleton Components

### Spinner
```tsx
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <svg className={`animate-spin text-indigo-600 ${sizes[size]}`} viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}
```

### Skeleton Loaders
```tsx
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800 ${className || ''}`} />
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-200 p-6 dark:border-gray-800">
      <Skeleton className="mb-4 h-12 w-12 rounded-lg" />
      <Skeleton className="mb-2 h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-5/6" />
    </div>
  )
}
```

## Pattern I: Alert/Toast Components

### Alert
```tsx
const alertVariants = cva(
  'rounded-lg p-4',
  {
    variants: {
      variant: {
        info: 'bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-200',
        success: 'bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-200',
        warning: 'bg-yellow-50 text-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-200',
        error: 'bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-200',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
)

export function Alert({ variant, title, children }: VariantProps<typeof alertVariants> & { title?: string; children: React.ReactNode }) {
  return (
    <div className={alertVariants({ variant })}>
      {title && <h3 className="mb-1 font-semibold">{title}</h3>}
      <div className="text-sm">{children}</div>
    </div>
  )
}
```

## Pattern J: Tooltip Component

### Simple Tooltip
```tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function Tooltip({ children, content }: { children: React.ReactNode; content: string }) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white shadow-lg dark:bg-gray-700"
          >
            {content}
            <div className="absolute left-1/2 top-full -translate-x-1/2">
              <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

## Common Patterns Summary

### Consistency Keys
- **Spacing**: Use consistent padding/margin scale (4, 6, 8, 12, 16, 20, 24)
- **Border Radius**: rounded-lg (8px), rounded-xl (12px), rounded-2xl (16px)
- **Shadows**: shadow-sm, shadow, shadow-lg, shadow-xl
- **Transitions**: transition-colors, transition-all duration-200/300
- **Focus States**: Always include focus-visible:outline

### Dark Mode Pattern
```tsx
className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white"
```

### Hover States Pattern
```tsx
className="hover:bg-gray-100 transition-colors duration-200 dark:hover:bg-gray-800"
```

## Dependencies
- `class-variance-authority` - Variant management
- `clsx` - Conditional classnames
- `next/image` - Optimized images
- `framer-motion` - Animations (optional)
