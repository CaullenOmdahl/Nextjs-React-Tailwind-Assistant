# Blog and Article Layout Patterns

## Overview
Common blog and article layout patterns for Next.js applications with MDX content.

## Pattern A: Blog Index with Card Grid

### Characteristics
- Grid of article cards
- Each card shows: title, date, excerpt, featured image
- Pagination or infinite scroll
- RSS feed integration
- **Common in**: Company blogs, personal blogs, content sites

### Structure
```tsx
// app/blog/page.tsx
import { getBlogPosts } from '@/lib/blog'
import Link from 'next/link'
import Image from 'next/image'

export default async function BlogPage() {
  const posts = await getBlogPosts()

  return (
    <div className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Blog
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          Thoughts, ideas, and insights from our team.
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-2xl auto-rows-fr grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="relative isolate flex flex-col justify-end overflow-hidden rounded-2xl bg-gray-900 px-8 pb-8 pt-80 sm:pt-48 lg:pt-80"
          >
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="absolute inset-0 -z-10 h-full w-full object-cover"
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-gray-900 via-gray-900/40" />

            <div className="flex flex-wrap items-center gap-y-1 overflow-hidden text-sm leading-6 text-gray-300">
              <time dateTime={post.date} className="mr-8">
                {formatDate(post.date)}
              </time>
              <div className="-ml-4 flex items-center gap-x-4">
                <div className="h-px w-4 bg-gray-600" />
                <div className="flex gap-x-2.5">
                  {post.author.name}
                </div>
              </div>
            </div>
            <h3 className="mt-3 text-lg font-semibold leading-6 text-white">
              <Link href={`/blog/${post.slug}`}>
                <span className="absolute inset-0" />
                {post.title}
              </Link>
            </h3>
          </article>
        ))}
      </div>
    </div>
  )
}
```

### Alternative: Simple Card Style
```tsx
<div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
  {posts.map((post) => (
    <article key={post.slug} className="flex flex-col items-start">
      <div className="relative w-full">
        <Image
          src={post.image}
          alt={post.title}
          width={800}
          height={400}
          className="aspect-[16/9] w-full rounded-2xl bg-gray-100 object-cover sm:aspect-[2/1] lg:aspect-[3/2]"
        />
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
      </div>
      <div className="max-w-xl">
        <div className="mt-8 flex items-center gap-x-4 text-xs">
          <time dateTime={post.date} className="text-gray-500">
            {formatDate(post.date)}
          </time>
          <span className="relative z-10 rounded-full bg-gray-100 px-3 py-1.5 font-medium text-gray-600">
            {post.category}
          </span>
        </div>
        <div className="group relative">
          <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
            <Link href={`/blog/${post.slug}`}>
              <span className="absolute inset-0" />
              {post.title}
            </Link>
          </h3>
          <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600">
            {post.excerpt}
          </p>
        </div>
        <div className="relative mt-8 flex items-center gap-x-4">
          <Image
            src={post.author.avatar}
            alt={post.author.name}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full bg-gray-100"
          />
          <div className="text-sm leading-6">
            <p className="font-semibold text-gray-900">{post.author.name}</p>
            <p className="text-gray-600">{post.author.role}</p>
          </div>
        </div>
      </div>
    </article>
  ))}
</div>
```

## Pattern B: Article Layout with Sidebar

### Characteristics
- Full article content in typography-optimized container
- Sidebar with author info, related posts, or table of contents
- Previous/next article navigation
- Social sharing buttons
- **Common in**: Technical blogs, long-form content

### Structure
```tsx
// app/blog/[slug]/page.tsx
import { getPostBySlug, getAllPosts } from '@/lib/blog'
import { MDXRemote } from 'next-mdx-remote/rsc'
import Link from 'next/link'

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)
  const allPosts = await getAllPosts()
  const postIndex = allPosts.findIndex((p) => p.slug === params.slug)
  const previousPost = allPosts[postIndex + 1]
  const nextPost = allPosts[postIndex - 1]

  return (
    <div className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-12 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-12">
        {/* Main Content */}
        <article className="lg:col-span-8">
          <header>
            <div className="flex items-center gap-x-4 text-xs">
              <time dateTime={post.date} className="text-gray-500">
                {formatDate(post.date)}
              </time>
              <span className="rounded-full bg-gray-100 px-3 py-1.5 font-medium text-gray-600">
                {post.category}
              </span>
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              {post.title}
            </h1>
            <p className="mt-6 text-xl leading-8 text-gray-600">
              {post.excerpt}
            </p>
            <div className="mt-10 flex items-center gap-x-6 border-t border-gray-200 pt-6">
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full bg-gray-100"
              />
              <div>
                <p className="text-sm font-semibold text-gray-900">{post.author.name}</p>
                <p className="text-sm text-gray-600">{post.author.role}</p>
              </div>
            </div>
          </header>

          <div className="prose prose-lg prose-indigo mt-10 max-w-none">
            <MDXRemote source={post.content} />
          </div>

          {/* Previous/Next Navigation */}
          <nav className="mt-16 flex justify-between border-t border-gray-200 pt-8">
            {previousPost && (
              <Link href={`/blog/${previousPost.slug}`} className="group">
                <p className="text-sm text-gray-500">Previous article</p>
                <p className="mt-1 font-semibold text-gray-900 group-hover:text-indigo-600">
                  {previousPost.title}
                </p>
              </Link>
            )}
            {nextPost && (
              <Link href={`/blog/${nextPost.slug}`} className="group text-right">
                <p className="text-sm text-gray-500">Next article</p>
                <p className="mt-1 font-semibold text-gray-900 group-hover:text-indigo-600">
                  {nextPost.title}
                </p>
              </Link>
            )}
          </nav>
        </article>

        {/* Sidebar */}
        <aside className="lg:col-span-4">
          <div className="sticky top-8 space-y-8">
            {/* About Author */}
            <div className="rounded-2xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900">About the author</h3>
              <div className="mt-4 flex items-center gap-x-4">
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full"
                />
                <div>
                  <p className="font-semibold">{post.author.name}</p>
                  <p className="text-sm text-gray-600">{post.author.role}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600">{post.author.bio}</p>
            </div>

            {/* Related Posts */}
            <div className="rounded-2xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900">Related articles</h3>
              <ul className="mt-4 space-y-4">
                {relatedPosts.map((relatedPost) => (
                  <li key={relatedPost.slug}>
                    <Link
                      href={`/blog/${relatedPost.slug}`}
                      className="group flex gap-x-4"
                    >
                      <Image
                        src={relatedPost.image}
                        alt={relatedPost.title}
                        width={64}
                        height={64}
                        className="h-16 w-16 flex-none rounded object-cover"
                      />
                      <div className="flex-auto">
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600">
                          {relatedPost.title}
                        </p>
                        <p className="mt-1 text-xs text-gray-600">
                          {formatDate(relatedPost.date)}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
```

## Pattern C: Centered Article Layout (Simple)

### Characteristics
- Single column, centered content
- Maximum width for optimal readability
- No sidebar distractions
- Focus on content
- **Common in**: Minimal blogs, personal sites

### Structure
```tsx
export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)

  return (
    <article className="mx-auto max-w-2xl px-6 py-24">
      <header className="text-center">
        <time dateTime={post.date} className="text-sm text-gray-500">
          {formatDate(post.date)}
        </time>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          {post.title}
        </h1>
        <p className="mt-6 text-xl leading-8 text-gray-600">
          {post.excerpt}
        </p>
      </header>

      {post.image && (
        <div className="mt-10">
          <Image
            src={post.image}
            alt={post.title}
            width={1200}
            height={630}
            className="aspect-video w-full rounded-2xl object-cover"
          />
        </div>
      )}

      <div className="prose prose-lg prose-indigo mx-auto mt-10">
        <MDXRemote source={post.content} />
      </div>

      <footer className="mt-16 border-t border-gray-200 pt-8">
        <div className="flex items-center">
          <Image
            src={post.author.avatar}
            alt={post.author.name}
            width={48}
            height={48}
            className="h-12 w-12 rounded-full"
          />
          <div className="ml-4">
            <p className="font-semibold text-gray-900">{post.author.name}</p>
            <p className="text-sm text-gray-600">{post.author.role}</p>
          </div>
        </div>
      </footer>
    </article>
  )
}
```

## MDX Content Loading

### Using next-mdx-remote
```bash
npm install next-mdx-remote gray-matter
```

```tsx
// lib/blog.ts
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'content/blog')

export async function getPostBySlug(slug: string) {
  const fullPath = path.join(postsDirectory, `${slug}.mdx`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  return {
    slug,
    content,
    ...data,
  }
}

export async function getAllPosts() {
  const fileNames = fs.readdirSync(postsDirectory)
  const posts = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.mdx$/, '')
    return getPostBySlug(slug)
  })

  return posts.sort((a, b) => (a.date > b.date ? -1 : 1))
}
```

## RSS Feed Generation

```tsx
// app/blog/rss.xml/route.ts
import { getAllPosts } from '@/lib/blog'
import RSS from 'rss'

export async function GET() {
  const posts = await getAllPosts()

  const feed = new RSS({
    title: 'My Blog',
    description: 'Latest articles from my blog',
    feed_url: 'https://example.com/blog/rss.xml',
    site_url: 'https://example.com',
    language: 'en',
  })

  posts.forEach((post) => {
    feed.item({
      title: post.title,
      description: post.excerpt,
      url: `https://example.com/blog/${post.slug}`,
      date: post.date,
      author: post.author.name,
    })
  })

  return new Response(feed.xml(), {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
```

## Typography Configuration

### Tailwind Typography Plugin
```bash
npm install @tailwindcss/typography
```

```js
// tailwind.config.js
module.exports = {
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
```

### Usage
```tsx
<div className="prose prose-lg prose-indigo mx-auto">
  <MDXRemote source={content} />
</div>
```

### Custom Typography Styles
```css
/* globals.css */
.prose {
  @apply text-gray-700;
}

.prose h2 {
  @apply mt-12 text-3xl font-bold tracking-tight;
}

.prose h3 {
  @apply mt-8 text-2xl font-semibold;
}

.prose a {
  @apply text-indigo-600 no-underline hover:text-indigo-500;
}

.prose code {
  @apply rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono text-gray-900;
}
```

## Common Features

### Reading Time Calculation
```tsx
export function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200
  const words = content.split(/\s+/).length
  const minutes = Math.ceil(words / wordsPerMinute)
  return `${minutes} min read`
}
```

### Share Buttons
```tsx
function ShareButtons({ url, title }: { url: string; title: string }) {
  return (
    <div className="flex gap-x-4">
      <a
        href={`https://twitter.com/intent/tweet?url=${url}&text=${title}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-400 hover:text-gray-500"
      >
        <span className="sr-only">Share on Twitter</span>
        {/* Twitter icon */}
      </a>
      {/* More share buttons */}
    </div>
  )
}
```

### Table of Contents
```tsx
function TableOfContents({ headings }: { headings: { id: string; text: string; level: number }[] }) {
  return (
    <nav className="space-y-2">
      <h3 className="text-sm font-semibold">On this page</h3>
      <ul className="space-y-2 text-sm">
        {headings.map((heading) => (
          <li key={heading.id} style={{ paddingLeft: `${(heading.level - 2) * 1}rem` }}>
            <a
              href={`#${heading.id}`}
              className="text-gray-600 hover:text-gray-900"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
```

## SEO Metadata

```tsx
// app/blog/[slug]/page.tsx
import { type Metadata } from 'next'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author.name],
      images: [{ url: post.image }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  }
}
```

## Dependencies
- `next-mdx-remote` - MDX rendering
- `gray-matter` - Frontmatter parsing
- `@tailwindcss/typography` - Typography styles
- `rss` - RSS feed generation (optional)
