# Authentication Layout Patterns

## Overview
Common authentication page layouts for login, registration, and password reset flows.

## Pattern A: Centered Auth Layout

### Characteristics
- Centered card/form on neutral background
- Logo at top
- Link to alternate auth page (login ↔ register)
- Minimal distractions
- **Common in**: Simple SaaS applications, B2C products

### Structure
```tsx
export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Logo className="mx-auto h-10 w-auto" />
        <h2 className="mt-6 text-center text-2xl font-bold">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          {children}
        </div>
      </div>
    </div>
  )
}
```

### Key Features
- Max width: `max-w-md` for forms
- Background: White card on gray page
- Shadow: `shadow` or `shadow-lg`
- Responsive padding adjustments

## Pattern B: Split Screen Auth

### Characteristics
- Two-column layout on desktop
- Left: Branding, testimonial, or visual
- Right: Form
- Single column on mobile
- **Common in**: Enterprise SaaS, B2B applications

### Structure
```tsx
<div className="flex min-h-full">
  {/* Left side - Branding */}
  <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-12">
    <div className="max-w-xl">
      <Logo className="h-12 w-auto" />
      <p className="mt-6 text-lg text-gray-600">
        Join thousands of teams...
      </p>
      {/* Testimonial or stats */}
    </div>
  </div>

  {/* Right side - Form */}
  <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
    <div className="mx-auto w-full max-w-sm">
      {children}
    </div>
  </div>
</div>
```

### Variations
- Background gradient on branding side
- Animated background patterns
- Rotating testimonials
- Product screenshots

## Pattern C: Gradient Background Auth

### Characteristics
- Full-screen gradient background
- Floating card with shadow and ring
- Glassmorphism effects (optional)
- Modern, colorful aesthetic
- **Common in**: Consumer apps, creative products

### Structure
```tsx
<div className="relative flex min-h-full items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 px-4 py-12">
  {/* Optional decorative elements */}
  <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

  <div className="relative w-full max-w-md">
    <div className="rounded-2xl bg-white px-8 py-10 shadow-xl ring-1 ring-gray-200">
      <Logo className="mx-auto h-10 w-auto" />
      {children}
    </div>
  </div>
</div>
```

### Visual Enhancements
- Gradient backgrounds: `bg-gradient-to-br from-{color}-50 to-{color}-100`
- Decorative elements: Grid patterns, dots, gradients
- Card effects: `shadow-xl`, `ring-1 ring-gray-200`
- Border radius: `rounded-2xl` or `rounded-3xl`

## Pattern D: Progressive Disclosure

### Characteristics
- One field/step at a time
- Minimal UI, focused flow
- Email → Password → OTP
- Clean typography hierarchy
- **Common in**: Onboarding flows, verification processes

### Structure
```tsx
<div className="flex min-h-full flex-col justify-center px-4 py-12">
  <div className="mx-auto w-full max-w-sm">
    <h1 className="text-3xl font-bold tracking-tight">
      {currentStep === 'email' ? 'Welcome back' : 'Verify your email'}
    </h1>

    <form className="mt-8 space-y-6">
      {currentStep === 'email' && (
        <input type="email" className="..." />
      )}
      {currentStep === 'otp' && (
        <OTPInput length={6} />
      )}
    </form>
  </div>
</div>
```

### Implementation Notes
- State management for steps
- Conditional rendering based on step
- Back button for navigation
- Progress indicator (optional)

## Common Form Elements

### Form Field Styling
```tsx
<div>
  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
    Email address
  </label>
  <input
    id="email"
    type="email"
    required
    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
  />
</div>
```

### Remember Me Checkbox
```tsx
<div className="flex items-center">
  <input
    id="remember-me"
    type="checkbox"
    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
  />
  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
    Remember me
  </label>
</div>
```

### Action Links
```tsx
<div className="flex items-center justify-between">
  <div className="flex items-center">
    {/* Remember me checkbox */}
  </div>
  <div className="text-sm">
    <Link href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
      Forgot password?
    </Link>
  </div>
</div>
```

### Submit Button
```tsx
<Button type="submit" className="w-full">
  Sign in
</Button>
```

### Alternate Action
```tsx
<p className="mt-6 text-center text-sm text-gray-600">
  Don't have an account?{' '}
  <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
    Sign up
  </Link>
</p>
```

## Route Group Pattern

Organize auth pages with route groups to share layouts without affecting URLs:

```
app/
├── (auth)/
│   ├── layout.tsx          # Shared auth layout
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   └── forgot-password/
│       └── page.tsx
└── (main)/
    └── ...                 # Main app routes
```

### Auth Layout Component
```tsx
// app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col justify-center">
      {children}
    </div>
  )
}
```

## Accessibility Considerations

- **Labels**: Every input must have an associated label
- **Focus Management**: Auto-focus first field on mount
- **Error Messages**: Use `aria-describedby` to link errors to inputs
- **Keyboard Navigation**: Ensure tab order is logical
- **Screen Readers**: Announce errors and success messages

## Security Best Practices

- **HTTPS Only**: Always use secure connections
- **CSRF Protection**: Use tokens for form submissions
- **Rate Limiting**: Prevent brute force attempts
- **Password Requirements**: Enforce strong passwords
- **OAuth/Social Login**: Consider third-party authentication
- **Two-Factor Auth**: Offer 2FA for enhanced security
