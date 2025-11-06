# Color Systems & Palettes

## Overview
Color palette patterns and systems used in professional Next.js templates, organized by use case and brand personality.

## Pattern A: Professional/Corporate Color Systems

### Characteristics
- Muted, trust-inspiring colors
- Heavy use of grays and blues
- High contrast for readability
- **Use Cases**: B2B SaaS, enterprise software, professional services

### Primary Palette
```tsx
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Main brand color
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
      },
    },
  },
}
```

### Usage Examples
```tsx
// Headers
<header className="bg-white border-b border-gray-200">

// Buttons
<button className="bg-blue-600 hover:bg-blue-700 text-white">

// Cards
<div className="bg-white border border-gray-200 shadow-sm">

// Text hierarchy
<h1 className="text-gray-900">
<p className="text-gray-600">
<span className="text-gray-500">
```

## Pattern B: Modern SaaS Color Systems

### Characteristics
- Vibrant, modern colors (indigo, purple, cyan)
- Gradient-friendly palettes
- Light, airy backgrounds
- **Use Cases**: Modern SaaS, startups, tech products

### Primary Palette
```tsx
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1', // Indigo
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        accent: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef', // Purple
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        },
      },
    },
  },
}
```

### Gradient Combinations
```tsx
// Hero backgrounds
className="bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100"

// Card accents
className="bg-gradient-to-r from-indigo-500 to-purple-600"

// Button gradients
className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"

// Text gradients
className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
```

## Pattern C: Bold/Creative Color Systems

### Characteristics
- High-contrast, punchy colors
- Multiple accent colors
- Playful, energetic feel
- **Use Cases**: Consumer apps, creative agencies, marketing sites

### Primary Palette
```tsx
module.exports = {
  theme: {
    extend: {
      colors: {
        pink: {
          500: '#ec4899',
          600: '#db2777',
        },
        purple: {
          500: '#a855f7',
          600: '#9333ea',
        },
        orange: {
          500: '#f97316',
          600: '#ea580c',
        },
        cyan: {
          500: '#06b6d4',
          600: '#0891b2',
        },
      },
    },
  },
}
```

### Multi-Color Gradients
```tsx
// Rainbow gradients
className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"

// Warm gradients
className="bg-gradient-to-br from-orange-400 to-pink-600"

// Cool gradients
className="bg-gradient-to-br from-cyan-400 to-indigo-600"
```

## Pattern D: Minimal/Monochrome Systems

### Characteristics
- Primarily black, white, and grays
- Accent color used sparingly
- Clean, sophisticated aesthetic
- **Use Cases**: Luxury brands, minimalist portfolios, editorial sites

### Primary Palette
```tsx
module.exports = {
  theme: {
    extend: {
      colors: {
        black: '#000000',
        white: '#ffffff',
        gray: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        accent: {
          DEFAULT: '#000000', // Pure black accent
        },
      },
    },
  },
}
```

### Usage
```tsx
// High contrast
<div className="bg-black text-white">

// Subtle differentiation
<div className="bg-gray-50">
<div className="bg-white border border-gray-200">

// Accent usage (sparingly)
<button className="bg-black text-white hover:bg-gray-900">
```

## Pattern E: Semantic Color System

### Characteristics
- Colors convey meaning (success, warning, error, info)
- Consistent across all components
- Accessibility-compliant
- **Use Cases**: All applications (foundational system)

### Semantic Palette
```tsx
module.exports = {
  theme: {
    extend: {
      colors: {
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
    },
  },
}
```

### Usage
```tsx
// Success states
<div className="bg-success-50 text-success-700 border-success-200">
  <CheckCircleIcon className="text-success-500" />
  Operation successful
</div>

// Error states
<div className="bg-error-50 text-error-700 border-error-200">
  <XCircleIcon className="text-error-500" />
  Something went wrong
</div>

// Form validation
<input className="border-error-300 focus:border-error-500 focus:ring-error-500">
```

## Pattern F: Dark Mode Color Systems

### Characteristics
- Inverted brightness hierarchy
- Reduced saturation for better readability
- Softer shadows and borders
- **Essential**: All modern applications

### Dark Mode Palette
```tsx
module.exports = {
  theme: {
    extend: {
      colors: {
        dark: {
          bg: {
            primary: '#0a0a0a',    // Main background
            secondary: '#111111',   // Cards, elevated surfaces
            tertiary: '#1a1a1a',    // Hover states
          },
          text: {
            primary: '#ffffff',     // Headings
            secondary: '#a3a3a3',   // Body text
            tertiary: '#737373',    // Muted text
          },
          border: {
            primary: '#262626',     // Main borders
            secondary: '#404040',   // Hover borders
          },
        },
      },
    },
  },
}
```

### Implementation Pattern
```tsx
// Component with dark mode
<div className="bg-white text-gray-900 dark:bg-dark-bg-primary dark:text-dark-text-primary">
  <h2 className="text-gray-900 dark:text-white">Heading</h2>
  <p className="text-gray-600 dark:text-dark-text-secondary">Body text</p>
  <p className="text-gray-500 dark:text-dark-text-tertiary">Muted text</p>
</div>

// Borders
<div className="border-gray-200 dark:border-dark-border-primary">

// Shadows (reduce in dark mode)
<div className="shadow-lg dark:shadow-2xl dark:shadow-black/50">
```

### Dark Mode Color Adjustments
```tsx
// Reduce saturation for primary colors in dark mode
colors: {
  primary: {
    light: '#6366f1',  // Bright indigo
    dark: '#818cf8',   // Lighter, less saturated for dark mode
  }
}

// Usage
className="text-primary-light dark:text-primary-dark"
```

## Pattern G: CSS Variables Approach

### Characteristics
- Dynamic color switching
- Single source of truth
- Easy theming
- **Benefit**: Runtime theme changes

### Implementation
```css
/* globals.css */
@layer base {
  :root {
    /* Light mode */
    --color-primary: 59 130 246; /* RGB values */
    --color-background: 255 255 255;
    --color-foreground: 15 23 42;
    --color-muted: 100 116 139;

    --color-success: 34 197 94;
    --color-error: 239 68 68;
  }

  .dark {
    /* Dark mode */
    --color-primary: 96 165 250;
    --color-background: 10 10 10;
    --color-foreground: 248 250 252;
    --color-muted: 148 163 184;

    --color-success: 74 222 128;
    --color-error: 248 113 113;
  }
}
```

```tsx
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        background: 'rgb(var(--color-background) / <alpha-value>)',
        foreground: 'rgb(var(--color-foreground) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        success: 'rgb(var(--color-success) / <alpha-value>)',
        error: 'rgb(var(--color-error) / <alpha-value>)',
      },
    },
  },
}
```

### Usage
```tsx
// Standard usage
<div className="bg-background text-foreground">

// With opacity
<div className="bg-primary/10 text-primary">
```

## Pattern H: Brand Color Extraction

### From Logo/Brand Assets
```tsx
// Example: Extract from brand guidelines
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#FF6B6B',     // From logo
          secondary: '#4ECDC4',   // Complementary
          accent: '#FFE66D',      // Highlight
          dark: '#1A535C',        // Text/anchors
        },
      },
    },
  },
}
```

## Color Usage Best Practices

### Hierarchy
```tsx
// Primary actions (1-2 per page)
className="bg-primary-600 text-white"

// Secondary actions
className="bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"

// Tertiary/ghost actions
className="text-primary-600 hover:bg-primary-50"

// Destructive actions
className="bg-red-600 text-white hover:bg-red-700"
```

### Contrast Requirements (WCAG AA)
- Normal text: 4.5:1 contrast ratio minimum
- Large text (18pt+): 3:1 contrast ratio minimum
- Interactive elements: 3:1 contrast ratio minimum

### Testing Contrast
```tsx
// Tools to use:
// - Chrome DevTools Accessibility tab
// - https://webaim.org/resources/contrastchecker/
// - https://coolors.co/contrast-checker

// Good contrast examples:
<div className="bg-gray-900 text-white">     // 18.1:1 ✓
<div className="bg-indigo-600 text-white">   // 8.6:1 ✓

// Poor contrast examples (avoid):
<div className="bg-gray-200 text-gray-400">  // 2.1:1 ✗
<div className="bg-yellow-100 text-white">   // 1.2:1 ✗
```

## Common Color Patterns

### Hover States
```tsx
// Darken on hover (light mode)
className="bg-blue-600 hover:bg-blue-700"

// Lighten on hover (dark mode)
className="dark:bg-blue-600 dark:hover:bg-blue-500"

// Add background on hover (ghost buttons)
className="hover:bg-gray-100 dark:hover:bg-gray-800"
```

### Focus States
```tsx
// Ring color matches primary
className="focus:ring-2 focus:ring-primary-600 focus:ring-offset-2"

// Outline variant
className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
```

### Disabled States
```tsx
// Reduced opacity
className="disabled:opacity-50 disabled:cursor-not-allowed"

// Specific disabled colors
className="disabled:bg-gray-100 disabled:text-gray-400"
```

## Color Palette Tools

### Generation
- **Tailwind Color Generator**: https://uicolors.app/create
- **Coolors**: https://coolors.co/
- **Adobe Color**: https://color.adobe.com/create/color-wheel

### Accessibility Testing
- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Contrast Ratio**: https://contrast-ratio.com/
- **Who Can Use**: https://whocanuse.com/

### Inspiration
- **Tailwind Color Palette**: https://tailwindcss.com/docs/customizing-colors
- **Radix Colors**: https://www.radix-ui.com/colors
- **Shadcn UI Themes**: https://ui.shadcn.com/themes
