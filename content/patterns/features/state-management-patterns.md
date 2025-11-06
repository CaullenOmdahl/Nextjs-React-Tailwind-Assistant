# State Management Patterns

## Overview

State management is how your application stores, updates, and shares data across components. The right pattern depends on your state's scope, complexity, and update frequency.

## Types of State

### Local State
**Scope**: Single component
**Examples**: Form inputs, toggles, UI state
**Tools**: `useState`, `useReducer`

```typescript
function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

**When to use**: Component-specific data that doesn't need sharing

### Shared State
**Scope**: Multiple components
**Examples**: User preferences, theme, selected items
**Tools**: Context, prop drilling, state management libraries

**When to use**: Data needed by multiple unrelated components

### Server State
**Scope**: Data from external sources
**Examples**: API responses, database queries, real-time data
**Tools**: TanStack Query, SWR, Apollo Client

**When to use**: Data fetched from servers/APIs

### URL State
**Scope**: Browser URL (search params, path)
**Examples**: Filters, pagination, selected tabs
**Tools**: useSearchParams, next/navigation

**When to use**: Shareable, bookmarkable application state

### Global State
**Scope**: Entire application
**Examples**: Auth user, app settings, shopping cart
**Tools**: Context, Redux, Zustand, Jotai

**When to use**: Data needed everywhere or frequently

## Common Approaches

### React Context
**Philosophy**: Built-in way to pass data through component tree

**Characteristics**:
- No external dependencies
- Provider/Consumer pattern
- Re-renders all consumers on change
- Simple API

**When to Choose**:
- Infrequent updates (theme, auth)
- Small to medium apps
- Want to avoid prop drilling
- Don't need advanced features

**Tradeoffs**:
- ➕ Built into React
- ➕ Simple to understand
- ➕ Type-safe with TypeScript
- ➖ Re-render performance issues
- ➖ No built-in dev tools
- ➖ Verbose for complex state

**Example**:
```typescript
const ThemeContext = createContext<Theme>('light')

function App() {
  const [theme, setTheme] = useState('light')

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Layout />
    </ThemeContext.Provider>
  )
}

function ThemedButton() {
  const { theme } = useContext(ThemeContext)
  return <button className={theme}>Click me</button>
}
```

**Performance Optimization**:
```typescript
// Split contexts to prevent unnecessary re-renders
const ThemeContext = createContext<Theme>('light')
const ThemeUpdateContext = createContext<(theme: Theme) => void>(() => {})

// Use useMemo for values
const value = useMemo(() => ({ theme, setTheme }), [theme])
```

### Redux (+ Redux Toolkit)
**Philosophy**: Single centralized store with predictable state updates

**Characteristics**:
- Single source of truth
- Immutable state updates
- Action-based architecture
- Time-travel debugging
- Middleware ecosystem

**When to Choose**:
- Large applications
- Complex state logic
- Need predictable state updates
- Want powerful dev tools
- Team familiar with Redux

**Tradeoffs**:
- ➕ Predictable state management
- ➕ Excellent dev tools
- ➕ Mature ecosystem
- ➕ Time-travel debugging
- ➖ Boilerplate (even with RTK)
- ➖ Learning curve
- ➖ Overkill for small apps

**Redux Toolkit Example**:
```typescript
import { createSlice, configureStore } from '@reduxjs/toolkit'

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1 // RTK uses Immer
    },
    decrement: (state) => {
      state.value -= 1
    },
  },
})

const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
  },
})

// In component
const count = useSelector((state) => state.counter.value)
const dispatch = useDispatch()
dispatch(counterSlice.actions.increment())
```

### Zustand
**Philosophy**: Minimal, flexible state management without boilerplate

**Characteristics**:
- Simple API
- No providers needed
- Selectors for optimization
- Middleware support
- Small bundle size

**When to Choose**:
- Want simpler alternative to Redux
- Don't need Redux ecosystem
- Want flexibility
- Medium to large apps

**Tradeoffs**:
- ➕ Minimal boilerplate
- ➕ No providers
- ➕ Simple API
- ➕ Small bundle size
- ➖ Less opinionated
- ➖ Smaller ecosystem than Redux
- ➖ No built-in dev tools (needs middleware)

**Example**:
```typescript
import create from 'zustand'

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}))

// In component - no provider needed
function Counter() {
  const { count, increment } = useStore()
  return <button onClick={increment}>{count}</button>
}

// Selective subscription
const count = useStore((state) => state.count) // Only re-renders when count changes
```

### Jotai
**Philosophy**: Atomic state management inspired by Recoil

**Characteristics**:
- Atomic state (atoms)
- Bottom-up approach
- No providers (for basic usage)
- Computed values (derived atoms)
- React Suspense support

**When to Choose**:
- Want atomic state management
- Building complex derived state
- Need fine-grained reactivity
- React Suspense integration

**Tradeoffs**:
- ➕ Fine-grained reactivity
- ➕ Computed values built-in
- ➕ TypeScript-first
- ➕ Suspense support
- ➖ Different mental model
- ➖ Less mature than alternatives
- ➖ Can be complex for simple needs

**Example**:
```typescript
import { atom, useAtom } from 'jotai'

const countAtom = atom(0)
const doubleCountAtom = atom((get) => get(countAtom) * 2)

function Counter() {
  const [count, setCount] = useAtom(countAtom)
  const [double] = useAtom(doubleCountAtom)

  return (
    <>
      <button onClick={() => setCount(count + 1)}>{count}</button>
      <p>Double: {double}</p>
    </>
  )
}
```

### TanStack Query (React Query)
**Philosophy**: Specialized for server state, not client state

**Characteristics**:
- Automatic caching
- Background refetching
- Optimistic updates
- Pagination/infinite queries
- Automatic garbage collection

**When to Choose**:
- Managing server/API state
- Need automatic caching
- Want background updates
- Complex data fetching needs

**Tradeoffs**:
- ➕ Perfect for server state
- ➕ Automatic caching strategy
- ➕ Handles loading/error states
- ➕ Background refetching
- ➖ Not for client state
- ➖ Learning curve
- ➖ Additional dependency

**Example**:
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

function Todos() {
  const queryClient = useQueryClient()

  // Fetch data
  const { data, isLoading } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  })

  // Mutate data
  const mutation = useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })

  if (isLoading) return 'Loading...'
  return (
    <>
      {data.map(todo => <div key={todo.id}>{todo.text}</div>)}
      <button onClick={() => mutation.mutate('New todo')}>
        Add Todo
      </button>
    </>
  )
}
```

### MobX
**Philosophy**: Reactive state management with observables

**Characteristics**:
- Automatic dependency tracking
- Mutable state (with tracking)
- Computed values
- Class-based or functional
- Minimal boilerplate

**When to Choose**:
- Prefer OOP patterns
- Complex derived state
- Want automatic dependency tracking
- Team familiar with observables

**Tradeoffs**:
- ➕ Minimal boilerplate
- ➕ Automatic reactivity
- ➕ Mutable API (easier to reason about)
- ➕ Computed values
- ➖ Magic" behavior (auto-tracking)
- ➖ Less explicit than Redux
- ➖ Requires understanding observables

## State Location Patterns

### Lift State Up
Move state to closest common ancestor:

```typescript
function Parent() {
  const [selected, setSelected] = useState('')

  return (
    <>
      <ChildA selected={selected} onSelect={setSelected} />
      <ChildB selected={selected} />
    </>
  )
}
```

**When**: Only 2-3 components need state

### Colocation
Keep state as close to where it's used:

```typescript
function TodoItem() {
  // State only used in this component
  const [isEditing, setIsEditing] = useState(false)

  if (isEditing) return <input />
  return <button onClick={() => setIsEditing(true)}>Edit</button>
}
```

**When**: State not needed elsewhere

### Prop Drilling
Pass state through multiple levels:

```typescript
<GrandParent data={data}>
  <Parent data={data}>
    <Child data={data} />
  </Parent>
</GrandParent>
```

**When**: Only a few levels, not too many props

### Component Composition
Pass components instead of data:

```typescript
function Layout({ sidebar, content }) {
  return (
    <div>
      <Sidebar>{sidebar}</Sidebar>
      <Content>{content}</Content>
    </div>
  )
}

<Layout
  sidebar={<UserSidebar user={user} />}
  content={<Dashboard user={user} />}
/>
```

**When**: Avoid prop drilling, keep data close to usage

## Derived State Patterns

### useMemo
Compute expensive values:

```typescript
const filteredItems = useMemo(() =>
  items.filter(item => item.category === selectedCategory),
  [items, selectedCategory]
)
```

### Computed Values
In state management libraries:

```typescript
// Zustand
const useStore = create((set, get) => ({
  items: [],
  selectedCategory: null,
  filteredItems: () => {
    const { items, selectedCategory } = get()
    return items.filter(item => item.category === selectedCategory)
  },
}))

// Jotai
const filteredItemsAtom = atom((get) => {
  const items = get(itemsAtom)
  const category = get(selectedCategoryAtom)
  return items.filter(item => item.category === category)
})
```

### Selectors
Extract derived data:

```typescript
// Redux
const selectFilteredItems = createSelector(
  [selectItems, selectSelectedCategory],
  (items, category) => items.filter(item => item.category === category)
)

const filteredItems = useSelector(selectFilteredItems)
```

## Performance Optimization

### Selective Subscriptions
Only subscribe to needed data:

```typescript
// Zustand
const count = useStore((state) => state.count) // Only count changes trigger re-render

// Redux
const count = useSelector((state) => state.counter.value)
```

### Memoization
Prevent unnecessary recalculations:

```typescript
const memoizedValue = useMemo(() => computeExpensive(a, b), [a, b])
const memoizedCallback = useCallback(() => doSomething(a, b), [a, b])
```

### Code Splitting
Lazy load state management:

```typescript
const store = await import('./store')
```

## Common Patterns

### Optimistic Updates
Update UI before server confirms:

```typescript
const mutation = useMutation({
  mutationFn: updateTodo,
  onMutate: async (newTodo) => {
    // Cancel queries
    await queryClient.cancelQueries(['todos'])

    // Snapshot previous value
    const previous = queryClient.getQueryData(['todos'])

    // Optimistically update
    queryClient.setQueryData(['todos'], (old) => [...old, newTodo])

    return { previous }
  },
  onError: (err, variables, context) => {
    // Rollback
    queryClient.setQueryData(['todos'], context.previous)
  },
})
```

### Undo/Redo
Implement with state history:

```typescript
const [history, setHistory] = useState([initialState])
const [index, setIndex] = useState(0)

const present = history[index]

const set = (newState) => {
  setHistory([...history.slice(0, index + 1), newState])
  setIndex(index + 1)
}

const undo = () => setIndex(Math.max(0, index - 1))
const redo = () => setIndex(Math.min(history.length - 1, index + 1))
```

### State Machines
Explicit state transitions:

```typescript
import { createMachine, interpret } from 'xstate'

const machine = createMachine({
  initial: 'idle',
  states: {
    idle: {
      on: { FETCH: 'loading' }
    },
    loading: {
      on: {
        SUCCESS: 'success',
        ERROR: 'error'
      }
    },
    success: {
      on: { REFETCH: 'loading' }
    },
    error: {
      on: { RETRY: 'loading' }
    }
  }
})
```

## Testing Strategies

### Unit Tests
- State updates
- Reducers/actions
- Selectors
- Derived state

### Integration Tests
- Component with state
- State updates trigger UI changes
- Multiple components share state

### End-to-End Tests
- Full user workflows
- State persistence
- Cross-page state

## Common Pitfalls

1. **Too Much Global State**
   - **Problem**: Everything in global store
   - **Solution**: Keep state as local as possible

2. **Not Using Server State Libraries**
   - **Problem**: Managing API data in Redux/Context
   - **Solution**: Use TanStack Query/SWR for server state

3. **Context Re-render Issues**
   - **Problem**: All consumers re-render on any change
   - **Solution**: Split contexts, use selectors

4. **Over-Engineering**
   - **Problem**: Redux for simple app
   - **Solution**: Start simple, add complexity as needed

5. **State Duplication**
   - **Problem**: Same data in multiple places
   - **Solution**: Single source of truth, derive other values

## Decision Framework

1. **State Scope**
   - Single component → useState/useReducer
   - Few components → Lift state up / Context
   - Many components → Global state library
   - Across routes → Global state + persistence

2. **State Type**
   - Server data → TanStack Query / SWR
   - UI state → Local state / Context
   - Complex logic → useReducer / Redux
   - Form state → Form library

3. **App Size**
   - Small → useState + Context
   - Medium → Zustand / Jotai
   - Large → Redux Toolkit / Zustand

4. **Team Experience**
   - Beginners → Context / Zustand
   - Redux experience → Redux Toolkit
   - Reactive programming → MobX / Jotai

5. **Performance Needs**
   - Critical → Selective subscriptions (Zustand, Jotai)
   - Standard → Any approach
   - Not critical → Context is fine

## Resources

### Libraries
- Redux Toolkit: Official Redux with less boilerplate
- Zustand: Minimal state management
- Jotai: Atomic state management
- TanStack Query: Server state
- MobX: Reactive state

### Learning
- React docs on state management
- Redux Fundamentals
- Zustand documentation
- TanStack Query guides

### Patterns
- Kent C. Dodds: Application State Management
- Redux Style Guide
- React patterns
