# Pricing Page Patterns

## Overview
Common pricing page layouts for SaaS products, with tier comparisons, toggles, and feature lists.

## Pattern A: Card-Based Pricing with Toggle

### Characteristics
- 3-tier pricing (Starter, Pro, Enterprise)
- Monthly/Annually toggle with discount indicator
- Featured tier with different styling
- Feature list with checkmarks
- Animated price transitions
- **Common in**: B2B SaaS, subscription products

### Structure
```tsx
'use client'

import { useState } from 'react'
import { RadioGroup } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/24/solid'
import { motion } from 'framer-motion'

const frequencies = [
  { value: 'monthly', label: 'Monthly', priceSuffix: '/month' },
  { value: 'annually', label: 'Annually', priceSuffix: '/month', discount: '20% off' },
]

const tiers = [
  {
    name: 'Starter',
    id: 'tier-starter',
    href: '#',
    price: { monthly: '$29', annually: '$23' },
    description: 'Perfect for small teams getting started.',
    features: [
      'Up to 10 team members',
      '10GB storage',
      'Basic support',
      'Mobile apps',
    ],
    featured: false,
  },
  {
    name: 'Pro',
    id: 'tier-pro',
    href: '#',
    price: { monthly: '$99', annually: '$79' },
    description: 'For growing teams with advanced needs.',
    features: [
      'Up to 50 team members',
      '100GB storage',
      'Priority support',
      'Mobile apps',
      'Advanced analytics',
      'Custom integrations',
    ],
    featured: true,
  },
  {
    name: 'Enterprise',
    id: 'tier-enterprise',
    href: '#',
    price: { monthly: 'Custom', annually: 'Custom' },
    description: 'Dedicated support and infrastructure.',
    features: [
      'Unlimited team members',
      'Unlimited storage',
      '24/7 phone support',
      'Mobile apps',
      'Advanced analytics',
      'Custom integrations',
      'SSO',
      'Dedicated account manager',
    ],
    featured: false,
  },
]

export function PricingCards() {
  const [frequency, setFrequency] = useState(frequencies[0])

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Choose the right plan for you
          </p>
        </div>

        {/* Frequency Toggle */}
        <div className="mt-16 flex justify-center">
          <RadioGroup
            value={frequency}
            onChange={setFrequency}
            className="grid grid-cols-2 gap-x-1 rounded-full bg-gray-100 p-1 text-center text-xs font-semibold leading-5"
          >
            {frequencies.map((option) => (
              <RadioGroup.Option
                key={option.value}
                value={option}
                className={({ checked }) =>
                  `cursor-pointer rounded-full px-2.5 py-1 ${
                    checked ? 'bg-white text-gray-900 shadow' : 'text-gray-500'
                  }`
                }
              >
                {option.label}
              </RadioGroup.Option>
            ))}
          </RadioGroup>
        </div>

        {/* Pricing Cards */}
        <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-3xl p-8 ring-1 ${
                tier.featured
                  ? 'bg-indigo-600 ring-indigo-600'
                  : 'bg-white ring-gray-200'
              }`}
            >
              <h3
                className={`text-lg font-semibold leading-8 ${
                  tier.featured ? 'text-white' : 'text-gray-900'
                }`}
              >
                {tier.name}
              </h3>
              <p
                className={`mt-4 text-sm leading-6 ${
                  tier.featured ? 'text-indigo-100' : 'text-gray-600'
                }`}
              >
                {tier.description}
              </p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <motion.span
                  key={frequency.value}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-4xl font-bold tracking-tight ${
                    tier.featured ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {tier.price[frequency.value as 'monthly' | 'annually']}
                </motion.span>
                {tier.price.monthly !== 'Custom' && (
                  <span
                    className={`text-sm font-semibold leading-6 ${
                      tier.featured ? 'text-indigo-100' : 'text-gray-600'
                    }`}
                  >
                    {frequency.priceSuffix}
                  </span>
                )}
              </p>
              <a
                href={tier.href}
                className={`mt-6 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  tier.featured
                    ? 'bg-white text-indigo-600 hover:bg-indigo-50 focus-visible:outline-white'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600'
                }`}
              >
                Get started
              </a>
              <ul
                role="list"
                className={`mt-8 space-y-3 text-sm leading-6 ${
                  tier.featured ? 'text-indigo-100' : 'text-gray-600'
                }`}
              >
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <CheckIcon
                      className={`h-6 w-5 flex-none ${
                        tier.featured ? 'text-white' : 'text-indigo-600'
                      }`}
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

### Toggle Implementation with Animated Selector
```tsx
<div className="relative">
  <RadioGroup value={frequency} onChange={setFrequency} className="grid grid-cols-2">
    <RadioGroup.Option value="monthly">
      {({ checked }) => (
        <span className={checked ? 'text-gray-900' : 'text-gray-500'}>Monthly</span>
      )}
    </RadioGroup.Option>
    <RadioGroup.Option value="annually">
      {({ checked }) => (
        <span className={checked ? 'text-gray-900' : 'text-gray-500'}>Annually</span>
      )}
    </RadioGroup.Option>
  </RadioGroup>

  {/* Animated background selector */}
  <motion.div
    layout
    className="absolute inset-y-0 left-0 w-1/2 rounded-full bg-white shadow"
    animate={{ x: frequency === 'annually' ? '100%' : '0%' }}
  />
</div>
```

## Pattern B: Pricing with Comparison Table

### Characteristics
- Initial pricing cards
- Detailed comparison table below
- Mobile dropdown to select tier for comparison
- Feature categories (Features, Analysis, Support)
- Check/minus icons for included features
- **Common in**: Enterprise SaaS, complex products

### Structure
```tsx
<div className="py-24">
  {/* Pricing Cards (same as Pattern A) */}
  <PricingCards />

  {/* Comparison Table */}
  <div className="mt-24">
    <h3 className="text-2xl font-bold">Compare plans</h3>

    {/* Mobile: Dropdown Selector */}
    <div className="lg:hidden">
      <Menu>
        <MenuButton>Select a plan to compare</MenuButton>
        <MenuItems>
          {tiers.map((tier) => (
            <MenuItem key={tier.id}>{tier.name}</MenuItem>
          ))}
        </MenuItems>
      </Menu>
    </div>

    {/* Desktop: Full Table */}
    <table className="hidden lg:table w-full">
      <caption className="sr-only">Feature comparison</caption>
      <colgroup>
        <col className="w-3/5" />
        <col className="w-1/5" />
        <col className="w-1/5" />
        <col className="w-1/5" />
      </colgroup>
      <thead>
        <tr>
          <th scope="col">Features</th>
          {tiers.map((tier) => (
            <th key={tier.id} scope="col">{tier.name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {featureCategories.map((category) => (
          <>
            <tr key={category.name}>
              <th
                colSpan={4}
                scope="colgroup"
                className="bg-gray-50 py-3 pl-6 text-left text-sm font-semibold"
              >
                {category.name}
              </th>
            </tr>
            {category.features.map((feature) => (
              <tr key={feature.name}>
                <th scope="row" className="py-4 pl-6 text-left text-sm font-normal">
                  {feature.name}
                </th>
                {tiers.map((tier) => (
                  <td key={tier.id} className="px-6 py-4 text-center">
                    {feature.tiers[tier.name] ? (
                      <CheckIcon className="mx-auto h-5 w-5 text-indigo-600" />
                    ) : (
                      <span className="text-gray-400">−</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </>
        ))}
      </tbody>
    </table>
  </div>
</div>
```

## Pattern C: Simple Inline Pricing

### Characteristics
- Pricing integrated into single-page layout
- Simple tier cards without complex features
- Part of longer landing page flow
- Minimal comparison
- **Common in**: Simple products, one-product sites

### Structure
```tsx
<section id="pricing" className="py-20">
  <div className="mx-auto max-w-7xl px-6">
    <h2 className="text-center text-3xl font-bold">Simple, transparent pricing</h2>

    <div className="mt-12 grid gap-8 md:grid-cols-3">
      {simpleTiers.map((tier) => (
        <div key={tier.name} className="rounded-lg border border-gray-200 p-8">
          <h3 className="text-lg font-semibold">{tier.name}</h3>
          <p className="mt-4 text-4xl font-bold">{tier.price}</p>
          <p className="mt-2 text-sm text-gray-600">{tier.description}</p>
          <Button href={tier.href} className="mt-8 w-full">
            Choose {tier.name}
          </Button>
          <ul className="mt-8 space-y-3">
            {tier.features.map((feature) => (
              <li key={feature} className="flex items-center text-sm">
                <CheckIcon className="mr-3 h-5 w-5 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
</section>
```

## Common Elements

### Discount Badge
```tsx
{frequency.value === 'annually' && (
  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-0.5 text-sm font-semibold text-green-800">
    Save 20%
  </span>
)}
```

### Most Popular Badge
```tsx
{tier.featured && (
  <span className="absolute -top-5 left-0 right-0 mx-auto w-max rounded-full bg-indigo-600 px-3 py-1 text-sm font-semibold text-white">
    Most popular
  </span>
)}
```

### Custom Enterprise CTA
```tsx
{tier.name === 'Enterprise' && (
  <Button href="/contact" variant="outline">
    Contact sales
  </Button>
)}
```

## FAQ Section

Often paired with pricing:

```tsx
<div className="mt-24">
  <h3 className="text-2xl font-bold text-center">Frequently asked questions</h3>
  <dl className="mt-12 space-y-6 divide-y divide-gray-200">
    {faqs.map((faq) => (
      <Disclosure as="div" key={faq.question} className="pt-6">
        {({ open }) => (
          <>
            <dt>
              <Disclosure.Button className="flex w-full items-start justify-between text-left">
                <span className="text-base font-semibold">{faq.question}</span>
                <ChevronDownIcon
                  className={`h-6 w-6 ${open ? 'rotate-180' : ''}`}
                />
              </Disclosure.Button>
            </dt>
            <Disclosure.Panel as="dd" className="mt-2 pr-12">
              <p className="text-base text-gray-600">{faq.answer}</p>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    ))}
  </dl>
</div>
```

## Accessibility Considerations

- **Semantics**: Use proper table structure with caption, colgroup, thead, tbody
- **Labels**: RadioGroup must have accessible labels
- **Keyboard**: Ensure all interactive elements are keyboard accessible
- **Screen Readers**: Use `aria-label` for icon-only indicators
- **Focus**: Maintain visible focus indicators

## Animation Best Practices

- **Price Changes**: Fade or slide when toggling monthly/annual
- **Reduced Motion**: Respect prefers-reduced-motion
- **Performance**: Use transform and opacity for animations
- **Smooth**: Spring animations for natural feel

## Dependencies
- `@headlessui/react` - RadioGroup, Disclosure, Menu
- `@heroicons/react` - CheckIcon, ChevronDownIcon
- `framer-motion` - Price transition animations
