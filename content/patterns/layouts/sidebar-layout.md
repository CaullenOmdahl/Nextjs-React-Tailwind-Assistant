# Sidebar Layout Pattern

## Overview
Responsive sidebar navigation layout for documentation sites and dashboards.

## Structure
```tsx
export function SidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
          {/* Sidebar content */}
        </div>
      </aside>
      
      {/* Main content */}
      <main className="lg:pl-72">
        <div className="px-4 py-10 sm:px-6 lg:px-8 lg:py-6">
          {children}
        </div>
      </main>
    </div>
  )
}
```

## Mobile Behavior
```tsx
const [sidebarOpen, setSidebarOpen] = useState(false)

// Mobile overlay
<div className="lg:hidden">
  <Dialog open={sidebarOpen} onClose={setSidebarOpen}>
    {/* Mobile sidebar */}
  </Dialog>
</div>
```

## Sticky Navigation
```tsx
<div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
```
