# Form Handling Patterns

## Overview

Forms are how users input data into applications. Good form handling balances validation, user experience, accessibility, and data integrity.

## Key Considerations

### User Experience
- **Validation Timing**: When to show errors (on blur, on submit, on change)
- **Error Messages**: Clear, actionable feedback
- **Loading States**: Indicate submission progress
- **Success Feedback**: Confirm successful submission
- **Field State**: Show touched, dirty, validating states

### Performance
- **Controlled vs Uncontrolled**: State management tradeoffs
- **Validation Cost**: Async validation, debouncing
- **Re-render Optimization**: Isolate component updates
- **Bundle Size**: Library size vs functionality

### Data Integrity
- **Client-Side Validation**: Immediate feedback, UX improvement
- **Server-Side Validation**: Security, data integrity (always required)
- **Type Safety**: Catch errors at compile time
- **Schema Validation**: Ensure data shape correctness

### Accessibility
- **Keyboard Navigation**: Tab order, enter to submit
- **Screen Reader Support**: Labels, ARIA attributes, error announcements
- **Error Association**: Link errors to form fields
- **Focus Management**: Move focus to errors on validation failure

## Common Approaches

### Controlled Components (React State)
**Philosophy**: React state as single source of truth

**Characteristics**:
- State stored in React
- Value prop on inputs
- onChange handlers update state
- Direct control over input value

**When to Choose**:
- Simple forms (1-5 fields)
- Need to derive UI from form state
- Conditional field logic
- Real-time validation

**Tradeoffs**:
- ➕ Simple to understand
- ➕ Full control over values
- ➕ Easy to test
- ➖ Re-renders on every keystroke
- ➖ Verbose for large forms
- ➖ Manual validation logic

**Example**:
```typescript
const [email, setEmail] = useState('')
const [error, setError] = useState('')

const validateEmail = (value: string) => {
  if (!value.includes('@')) {
    setError('Invalid email')
  } else {
    setError('')
  }
}

<input
  value={email}
  onChange={(e) => {
    setEmail(e.target.value)
    validateEmail(e.target.value)
  }}
/>
```

### Uncontrolled Components (Refs)
**Philosophy**: DOM as source of truth

**Characteristics**:
- No React state for input values
- Use refs to access DOM values
- Extract values on submit
- Minimal re-renders

**When to Choose**:
- Performance critical forms
- Simple validation on submit
- File inputs (always uncontrolled)
- Integrating with non-React code

**Tradeoffs**:
- ➕ Better performance (fewer re-renders)
- ➕ Less boilerplate code
- ➕ Simpler for basic forms
- ➖ Harder to validate in real-time
- ➖ Can't derive UI from form state
- ➖ Less React-idiomatic

**Example**:
```typescript
const emailRef = useRef<HTMLInputElement>(null)

const handleSubmit = (e: FormEvent) => {
  e.preventDefault()
  const email = emailRef.current?.value
  if (email && !email.includes('@')) {
    alert('Invalid email')
  }
}

<input ref={emailRef} type="email" />
```

### Form Libraries (React Hook Form, Formik)
**Philosophy**: Specialized form state management

**Characteristics**:
- Uncontrolled with tracking
- Built-in validation
- Performance optimized
- Rich features (arrays, nested objects)

**When to Choose**:
- Medium to large forms (5+ fields)
- Complex validation rules
- Need field arrays or nested structures
- Want optimal performance

**Tradeoffs**:
- ➕ Excellent performance
- ➕ Comprehensive feature set
- ➕ Less boilerplate
- ➕ Built-in validation patterns
- ➖ Learning curve
- ➖ Additional dependency
- ➖ Abstracts away some control

**React Hook Form Example**:
```typescript
const { register, handleSubmit, formState: { errors } } = useForm()

<input {...register('email', {
  required: 'Email is required',
  pattern: {
    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$/i,
    message: 'Invalid email'
  }
})} />
{errors.email && <p>{errors.email.message}</p>}
```

### Server Components with Form Actions
**Philosophy**: Progressive enhancement with server-side processing

**Characteristics**:
- Works without JavaScript
- Server-side validation
- Form state in URL (search params)
- Server actions handle submission

**When to Choose**:
- Next.js 13+ with Server Components
- Want progressive enhancement
- Multi-step forms with URL state
- Server-side data mutations

**Tradeoffs**:
- ➕ Works without JS
- ➕ Server-side validation enforced
- ➕ Simple client code
- ➕ Better SEO for multi-step forms
- ➖ Slower feedback (network round-trip)
- ➖ Framework-specific
- ➖ Different mental model

**Example**:
```typescript
async function createUser(formData: FormData) {
  'use server'
  const email = formData.get('email')
  // Validate and save
}

<form action={createUser}>
  <input name="email" type="email" required />
  <button type="submit">Submit</button>
</form>
```

## Validation Strategies

### Client-Side Validation

#### Built-in HTML5 Validation
```html
<input type="email" required minlength="3" pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$" />
```

**Pros**: No JavaScript needed, browser UI
**Cons**: Inconsistent UI across browsers, limited customization

#### JavaScript Validation

**On Submit**:
- Validates all fields when form submitted
- Best for simple forms
- Less intrusive

**On Blur**:
- Validates when field loses focus
- Good balance of UX and performance
- Doesn't interrupt typing

**On Change**:
- Validates on every keystroke
- Immediate feedback
- Can be annoying for slow typers

**Debounced Change**:
- Validates after user stops typing
- Good for async validation
- Smooth UX

### Schema Validation

Use validation libraries for complex rules:

```typescript
import { z } from 'zod'

const userSchema = z.object({
  email: z.string().email('Invalid email'),
  age: z.number().min(18, 'Must be 18+'),
  password: z.string().min(8).regex(/[A-Z]/, 'Need uppercase'),
})

type UserFormData = z.infer<typeof userSchema>

// Validate
const result = userSchema.safeParse(formData)
if (!result.success) {
  // result.error.format() gives field-specific errors
}
```

**Popular Libraries**:
- **Zod**: TypeScript-first, great DX, auto type inference
- **Yup**: Mature, widely used, good documentation
- **Joi**: Feature-rich, Node.js origins
- **Valibot**: Smaller bundle size, modular

### Server-Side Validation

**Always required** - never trust client input:

```typescript
async function createUser(data: unknown) {
  // Parse and validate
  const validated = userSchema.parse(data) // Throws if invalid

  // Or safe parse
  const result = userSchema.safeParse(data)
  if (!result.success) {
    return { error: result.error.format() }
  }

  // Save to database
  await db.user.create(result.data)
}
```

### Async Validation

For validation requiring server checks:

```typescript
// Check username availability
const validateUsername = async (username: string) => {
  const response = await fetch(`/api/check-username?username=${username}`)
  const { available } = await response.json()
  return available || 'Username taken'
}

// React Hook Form with async validation
<input {...register('username', {
  validate: async (value) => {
    await new Promise(resolve => setTimeout(resolve, 500)) // Debounce
    return await validateUsername(value)
  }
})} />
```

**Best Practices**:
- Debounce async validation (500ms)
- Show loading indicator
- Cache results to avoid duplicate checks
- Have server-side validation as backup

## Form Patterns

### Multi-Step Forms

**URL-Based State**:
```typescript
// Step in URL: /signup?step=2
const searchParams = useSearchParams()
const step = searchParams.get('step') || '1'

// Navigate between steps
router.push(`/signup?step=${nextStep}`)
```

**Local State**:
```typescript
const [step, setStep] = useState(1)
const [formData, setFormData] = useState({})

// Accumulate data across steps
const handleStepSubmit = (stepData) => {
  setFormData(prev => ({ ...prev, ...stepData }))
  setStep(prev => prev + 1)
}
```

**Benefits of URL state**:
- Bookmarkable steps
- Browser back button works
- Survives page refresh

### Dynamic Fields

**Field Arrays**:
```typescript
// React Hook Form
const { fields, append, remove } = useFieldArray({
  control,
  name: 'items'
})

{fields.map((field, index) => (
  <div key={field.id}>
    <input {...register(`items.${index}.name`)} />
    <button onClick={() => remove(index)}>Remove</button>
  </div>
))}

<button onClick={() => append({ name: '' })}>Add Item</button>
```

### Dependent Fields

Fields that affect each other:

```typescript
const country = watch('country')

<select {...register('country')}>
  <option value="US">United States</option>
  <option value="CA">Canada</option>
</select>

{country === 'US' && (
  <select {...register('state')}>
    {usStates.map(state => (
      <option key={state.code} value={state.code}>
        {state.name}
      </option>
    ))}
  </select>
)}
```

### File Uploads

```typescript
<input
  type="file"
  accept="image/*"
  onChange={(e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate size
      if (file.size > 5 * 1024 * 1024) {
        alert('File too large (max 5MB)')
        return
      }

      // Preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result)
      }
      reader.readAsDataURL(file)

      // Upload
      const formData = new FormData()
      formData.append('file', file)
      uploadFile(formData)
    }
  }}
/>
```

### Optimistic Updates

Update UI before server confirms:

```typescript
const mutation = useMutation({
  mutationFn: createTodo,
  onMutate: async (newTodo) => {
    // Show success UI immediately
    setTodos(prev => [...prev, newTodo])
  },
  onError: (error, newTodo, context) => {
    // Rollback on error
    setTodos(prev => prev.filter(t => t.id !== newTodo.id))
    alert('Failed to create todo')
  }
})
```

## Accessibility Patterns

### Labels and ARIA

```html
<!-- Explicit label -->
<label htmlFor="email">Email Address</label>
<input id="email" type="email" aria-required="true" />

<!-- Implicit label -->
<label>
  Email Address
  <input type="email" />
</label>

<!-- ARIA labels for custom inputs -->
<div role="group" aria-labelledby="shipping-label">
  <h3 id="shipping-label">Shipping Address</h3>
  <!-- address fields -->
</div>
```

### Error Announcements

```html
<input
  aria-invalid={!!error}
  aria-describedby={error ? "email-error" : undefined}
/>
{error && (
  <p id="email-error" role="alert">
    {error}
  </p>
)}
```

### Focus Management

```typescript
// Focus first error on validation failure
const firstError = Object.keys(errors)[0]
if (firstError) {
  document.getElementsByName(firstError)[0]?.focus()
}
```

## Performance Optimization

### Isolate Re-renders

```typescript
// Extract field to separate component
function EmailField() {
  const { register, formState: { errors } } = useFormContext()

  return (
    <input {...register('email')} />
    // Only this component re-renders on email change
  )
}
```

### Debounce Validation

```typescript
const [debouncedValue] = useDebounce(value, 500)

useEffect(() => {
  validateField(debouncedValue)
}, [debouncedValue])
```

### Memoize Expensive Calculations

```typescript
const options = useMemo(() =>
  processOptions(rawOptions),
  [rawOptions]
)
```

## Testing Strategies

### Unit Tests
- Validation logic
- Form state updates
- Error message generation
- Schema validation

### Integration Tests
- Fill and submit forms
- Validation error display
- Multi-step navigation
- File upload flows

### Accessibility Tests
- Keyboard navigation
- Screen reader announcements
- Label association
- Error focus management

## Common Pitfalls

1. **Client-Only Validation**
   - **Risk**: Security vulnerability
   - **Solution**: Always validate on server

2. **No Loading States**
   - **Risk**: User confusion, double submissions
   - **Solution**: Disable button, show spinner

3. **Poor Error Messages**
   - **Risk**: User frustration
   - **Solution**: Specific, actionable messages

4. **Inaccessible Forms**
   - **Risk**: Excludes users
   - **Solution**: Proper labels, ARIA, keyboard support

5. **Validation on Every Keystroke**
   - **Risk**: Annoying UX
   - **Solution**: Validate on blur or debounced

## Decision Framework

1. **Form Complexity**
   - Simple (1-5 fields) → React state or uncontrolled
   - Medium (5-15 fields) → Form library
   - Complex (15+ fields, arrays) → Form library with schema

2. **Performance Requirements**
   - Critical → Uncontrolled or React Hook Form
   - Standard → Any approach
   - Not critical → Controlled components

3. **Validation Needs**
   - Simple → HTML5 + basic JS
   - Complex → Schema validation library
   - Async → Debounced async validation

4. **Framework**
   - Next.js 13+ → Consider Server Actions
   - React SPA → Form library
   - Vanilla JS → FormData + fetch

## Resources

### Libraries
- React Hook Form: Performance-focused, uncontrolled
- Formik: Popular, feature-rich
- Zod/Yup: Schema validation
- React Final Form: Subscription-based updates

### Accessibility
- WAI-ARIA Forms Guide
- WebAIM Form Accessibility
- A11y Project Form Checklist

### Best Practices
- Gov.UK Design System (form patterns)
- Material Design Forms
- Forms That Work (book)
