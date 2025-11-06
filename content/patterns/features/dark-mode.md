# Dark Mode Implementation Patterns

## Overview
Common patterns for implementing dark mode in Next.js applications using `next-themes` and Tailwind CSS.

## Pattern A: next-themes with Tailwind

### Characteristics
- System preference detection
- Smooth theme transitions
- LocalStorage persistence
- No flash of unstyled content
- **Recommended**: Most complete and accessible solution

### Setup

#### 1. Install Dependencies
```bash
npm install next-themes
```

#### 2. Configure Tailwind (tailwind.config.js)
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // or 'media' for system-only
  // ... rest of config
}
```

#### 3. Create Theme Provider
```tsx
// app/providers.tsx
'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'

export function Providers({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

#### 4. Wrap App in Provider
```tsx
// app/layout.tsx
import { Providers } from './providers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

### Theme Toggle Component
```tsx
'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-lg bg-gray-200 dark:bg-gray-800" />
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <SunIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
      ) : (
        <MoonIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
      )}
    </button>
  )
}
```

### Multi-Theme Toggle (Light/Dark/System)
```tsx
'use client'

import { useTheme } from 'next-themes'
import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { SunIcon, MoonIcon, ComputerDesktopIcon, CheckIcon } from '@heroicons/react/24/outline'

const themes = [
  { name: 'Light', value: 'light', icon: SunIcon },
  { name: 'Dark', value: 'dark', icon: MoonIcon },
  { name: 'System', value: 'system', icon: ComputerDesktopIcon },
]

export function ThemeMenu() {
  const { theme, setTheme } = useTheme()

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
        {theme === 'dark' ? (
          <MoonIcon className="h-5 w-5" />
        ) : (
          <SunIcon className="h-5 w-5" />
        )}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-36 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black/5 focus:outline-none dark:bg-gray-800">
          <div className="p-1">
            {themes.map((item) => (
              <Menu.Item key={item.value}>
                {({ active }) => (
                  <button
                    onClick={() => setTheme(item.value)}
                    className={`group flex w-full items-center rounded-md px-2 py-2 text-sm ${
                      active ? 'bg-gray-100 dark:bg-gray-700' : ''
                    }`}
                  >
                    <item.icon className="mr-2 h-5 w-5" />
                    {item.name}
                    {theme === item.value && (
                      <CheckIcon className="ml-auto h-5 w-5 text-indigo-600" />
                    )}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
```

## Pattern B: Theme Watcher Script

### Purpose
Prevents flash of unstyled content by applying theme class before hydration.

### Implementation
```tsx
// components/theme-watcher.tsx
'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'

export function ThemeWatcher() {
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    function onMediaChange() {
      const systemTheme = media.matches ? 'dark' : 'light'
      if (resolvedTheme === systemTheme) {
        setTheme('system')
      }
    }

    media.addEventListener('change', onMediaChange)
    return () => media.removeEventListener('change', onMediaChange)
  }, [resolvedTheme, setTheme])

  return null
}
```

### Usage in Layout
```tsx
import { ThemeWatcher } from '@/components/theme-watcher'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <ThemeWatcher />
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

## Tailwind Dark Mode Classes

### Basic Usage
```tsx
<div className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
  Content
</div>
```

### Common Patterns

#### Text Colors
```tsx
className="text-gray-900 dark:text-white"
className="text-gray-600 dark:text-gray-400"
className="text-gray-500 dark:text-gray-500"
```

#### Background Colors
```tsx
className="bg-white dark:bg-gray-900"
className="bg-gray-50 dark:bg-gray-800"
className="bg-gray-100 dark:bg-gray-800"
```

#### Borders
```tsx
className="border-gray-200 dark:border-gray-800"
className="ring-gray-200 dark:ring-gray-800"
```

#### Hover States
```tsx
className="hover:bg-gray-100 dark:hover:bg-gray-800"
className="hover:text-gray-900 dark:hover:text-white"
```

### Component Example
```tsx
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      {children}
    </div>
  )
}
```

## Pattern C: Fixed Position Toggle

### Characteristics
- Always visible toggle button
- Fixed to corner of screen
- Common placement: bottom-right or top-right
- **Use Cases**: Documentation sites, blogs

### Implementation
```tsx
<button
  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
  className="fixed bottom-4 right-4 z-50 rounded-full bg-white p-3 shadow-lg ring-1 ring-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:ring-gray-800 dark:hover:bg-gray-700"
  aria-label="Toggle theme"
>
  {theme === 'dark' ? (
    <SunIcon className="h-6 w-6 text-yellow-500" />
  ) : (
    <MoonIcon className="h-6 w-6 text-indigo-600" />
  )}
</button>
```

## Pattern D: Smooth Transitions

### With Transition Classes
```tsx
<div className="bg-white text-gray-900 transition-colors duration-200 dark:bg-gray-900 dark:text-white">
  Content
</div>
```

### Disable Transitions on Change
```tsx
<Providers
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange // Prevents flash during theme switch
>
  {children}
</Providers>
```

## Dark Mode for Images

### Using Picture Element
```tsx
<picture>
  <source srcSet="/logo-dark.svg" media="(prefers-color-scheme: dark)" />
  <img src="/logo-light.svg" alt="Logo" />
</picture>
```

### Using Tailwind Classes
```tsx
<>
  <img src="/logo-light.svg" alt="Logo" className="block dark:hidden" />
  <img src="/logo-dark.svg" alt="Logo" className="hidden dark:block" />
</>
```

### Invert Filter Approach
```tsx
<img
  src="/logo.svg"
  alt="Logo"
  className="dark:invert dark:filter"
/>
```

## Color Scheme Meta Tag

Add to `<head>` to hint browser chrome color:

```tsx
// app/layout.tsx
export const metadata = {
  // ... other metadata
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}
```

## Custom Theme Colors

### Extend Tailwind Config
```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Custom colors with dark variants
        primary: {
          50: '#f0f9ff',
          // ... light mode colors
          900: '#1e3a8a',
        },
      },
    },
  },
}
```

### CSS Variables Approach
```css
/* globals.css */
@layer base {
  :root {
    --color-primary: 59 130 246; /* RGB for blue-500 */
  }

  .dark {
    --color-primary: 96 165 250; /* RGB for blue-400 */
  }
}
```

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
      },
    },
  },
}
```

## Accessibility Considerations

- **System Preference**: Always respect `prefers-color-scheme`
- **Contrast**: Ensure sufficient contrast in both modes (WCAG AA minimum)
- **Focus Indicators**: Visible in both themes
- **Persistence**: Save user's choice to localStorage
- **No Flash**: Use `suppressHydrationWarning` on `<html>` tag

## Testing Dark Mode

### Manual Testing Checklist
- [ ] Toggle works correctly
- [ ] System preference respected on first visit
- [ ] Theme persists after page reload
- [ ] No flash of wrong theme on load
- [ ] All components readable in both modes
- [ ] Focus states visible in both modes
- [ ] Images/logos appropriate for both modes

### Browser DevTools
- Chrome/Edge: DevTools > Rendering > Emulate CSS media feature prefers-color-scheme
- Firefox: DevTools > Inspector > Prefers color scheme

## Provider Configuration Options

```tsx
<Providers
  attribute="class"           // Use 'class' strategy
  defaultTheme="system"       // Default to system preference
  enableSystem={true}         // Enable system theme detection
  disableTransitionOnChange   // Disable CSS transitions during theme change
  enableColorScheme={true}    // Add color-scheme meta tag
  storageKey="theme"         // LocalStorage key (default: 'theme')
  themes={['light', 'dark']} // Available themes (default: ['light', 'dark'])
>
  {children}
</Providers>
```

## Common Issues and Solutions

### Issue: Theme Flashing on Load
**Solution**: Add `suppressHydrationWarning` to `<html>` tag

### Issue: Hydration Mismatch Errors
**Solution**: Use mounted state in toggle component

### Issue: Transitions During Theme Change
**Solution**: Use `disableTransitionOnChange` prop

### Issue: Theme Not Persisting
**Solution**: Ensure cookies/localStorage are enabled

## Dependencies
- `next-themes` - Theme management
- `@heroicons/react` - Icons for toggle button
- `@headlessui/react` - Optional, for menu component
