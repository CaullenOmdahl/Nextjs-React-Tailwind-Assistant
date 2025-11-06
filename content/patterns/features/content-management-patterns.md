# Content Management Patterns

## Overview

Content management determines how you create, store, and deliver content (text, images, media). The right pattern depends on content volume, update frequency, team structure, and technical requirements.

## Key Considerations

### Content Authoring
- **Editor Experience**: Markdown, WYSIWYG, blocks
- **Preview**: Real-time or staged
- **Collaboration**: Multi-user editing
- **Workflows**: Draft → Review → Publish
- **Versioning**: History, rollback

### Content Structure
- **Schema**: Flexible vs rigid structure
- **Relationships**: Content linking, taxonomies
- **Localization**: Multi-language support
- **Media Management**: Images, videos, files
- **Metadata**: SEO, social sharing

### Performance
- **Static Generation**: Build-time vs runtime
- **Caching Strategy**: Edge, CDN, application
- **Incremental Updates**: Rebuild only changed content
- **Image Optimization**: Automatic resizing, formats
- **Search**: Full-text search capabilities

### Developer Experience
- **Version Control**: Git-based vs database
- **Local Development**: Easy content preview
- **Deployment**: Simple, automated
- **Type Safety**: Content type definitions
- **Querying**: GraphQL, REST, SDK

## Common Approaches

### File-Based (MDX, Markdown)
**Philosophy**: Content as code in version control

**Characteristics**:
- Markdown/MDX files in repo
- Git as content store
- Build-time processing
- Component-based content (MDX)
- Version control included

**When to Choose**:
- Documentation sites
- Blogs (low update frequency)
- Developer-focused content
- Want version control
- Small to medium content volume

**Tradeoffs**:
- ➕ Version controlled
- ➕ Simple, portable
- ➕ Type-safe (TypeScript)
- ➕ No database needed
- ➕ Fast (static generation)
- ➖ Non-technical authors need help
- ➖ No real-time preview
- ➖ Rebuild required for changes
- ➖ Limited for large content teams

**Implementation**:
```typescript
// content/blog/my-post.mdx
---
title: My Post
date: 2024-01-01
---

# Hello World

This is **markdown** content.

// Load and parse
import fs from 'fs'
import matter from 'gray-matter'

const fileContents = fs.readFileSync('content/blog/my-post.mdx', 'utf8')
const { data, content } = matter(fileContents)

// Render with MDX
import { MDXRemote } from 'next-mdx-remote/rsc'
<MDXRemote source={content} />
```

**Tools**: Contentlayer, next-mdx-remote, @next/mdx, remark, rehype

### Git-Based CMS
**Philosophy**: Git as backend, visual UI for editing

**Services**:
- Tina CMS
- Decap CMS (formerly Netlify CMS)
- Forestry
- CloudCannon

**Characteristics**:
- Visual editor for MDX/Markdown
- Commits to Git on save
- Preview branches
- Version control benefits
- Open-source (most)

**When to Choose**:
- Need non-technical authors
- Want version control
- Static site generation
- Don't want database complexity

**Tradeoffs**:
- ➕ Visual editing
- ➕ Git version control
- ➕ No database needed
- ➕ Git workflows (branches, PRs)
- ➖ Slower updates (Git commits)
- ➖ Setup complexity
- ➖ Limited real-time collaboration
- ➖ Rebuild for changes

**Tina CMS Example**:
```typescript
import { client } from '../tina/__generated__/client'

export async function getPost(slug: string) {
  const result = await client.queries.post({
    relativePath: `${slug}.mdx`,
  })

  return result.data.post
}

// Visual editor embedded in site
import { useTina } from 'tinacms/dist/react'

export default function Post({ data }) {
  const { data: tinaData } = useTina({
    query: data.query,
    variables: data.variables,
    data: data.post,
  })

  return <div>{tinaData.post.title}</div>
}
```

### Headless CMS (API-Based)
**Philosophy**: Content stored in CMS, delivered via API

**Services**:
- Contentful
- Sanity
- Strapi (self-hosted)
- Prismic
- DatoCMS
- Hygraph (GraphQL)

**Characteristics**:
- Hosted content database
- Visual content editor
- RESTful or GraphQL API
- Real-time updates
- Media management
- Webhooks for rebuilds

**When to Choose**:
- Non-technical content team
- Frequent content updates
- Multi-channel delivery (web, mobile, etc.)
- Need powerful editor
- Large content volume

**Tradeoffs**:
- ➕ User-friendly editor
- ➕ Real-time updates
- ➕ Powerful features
- ➕ Scales to large teams
- ➕ Media management
- ➖ Ongoing costs
- ➖ Vendor lock-in
- ➖ API latency
- ➖ Requires API calls (not static)

**Contentful Example**:
```typescript
import { createClient } from 'contentful'

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
})

// Fetch content
const entries = await client.getEntries({
  content_type: 'blogPost',
  limit: 10,
})

// Type-safe with codegen
interface BlogPost {
  title: string
  slug: string
  content: Document // Rich text
  publishDate: string
}

const posts: BlogPost[] = entries.items.map(entry => entry.fields)
```

### Database-Backed (Custom CMS)
**Philosophy**: Build your own content management

**Characteristics**:
- Database stores content
- Custom admin interface
- Full control over schema
- Integrated with application
- Self-hosted

**When to Choose**:
- Unique content requirements
- Already have database
- Want full control
- Internal tools/admin panel
- Complex content relationships

**Tradeoffs**:
- ➕ Full customization
- ➕ Integrated with app
- ➕ No external dependencies
- ➕ No vendor costs
- ➖ Build and maintain yourself
- ➖ Time investment
- ➖ No ready-made editor
- ➖ Have to handle everything

**Implementation**:
```typescript
// Prisma schema
model Post {
  id        String   @id @default(cuid())
  title     String
  slug      String   @unique
  content   String   @db.Text
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// API routes for CRUD
app.get('/api/posts', async (req, res) => {
  const posts = await prisma.post.findMany({
    where: { published: true },
    include: { author: true }
  })
  res.json(posts)
})

// Admin interface with React
function PostEditor({ postId }: { postId: string }) {
  const [post, setPost] = useState(null)

  return (
    <form onSubmit={handleSave}>
      <input value={post.title} onChange={...} />
      <textarea value={post.content} />
      <button type="submit">Save</button>
    </form>
  )
}
```

### Notion as CMS
**Philosophy**: Use Notion database as content source

**Characteristics**:
- Notion as content editor
- API to fetch content
- Rich editing experience
- Collaboration built-in
- Free for small teams

**When to Choose**:
- Already using Notion
- Small team
- Simple content needs
- Want great editor
- Low budget

**Tradeoffs**:
- ➕ Great editing experience
- ➕ Free tier generous
- ➕ Team collaboration
- ➕ Quick setup
- ➖ Not designed for CMS
- ➖ API limitations
- ➖ Limited customization
- ➖ Slower API

**Example**:
```typescript
import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_API_KEY })

// Get database entries
const response = await notion.databases.query({
  database_id: process.env.NOTION_DATABASE_ID,
  filter: {
    property: 'Published',
    checkbox: { equals: true }
  }
})

// Convert Notion blocks to HTML/Markdown
const blocks = await notion.blocks.children.list({
  block_id: pageId
})
```

## Content Delivery Patterns

### Static Generation (SSG)
Build HTML at build time:

```typescript
// Next.js
export async function generateStaticParams() {
  const posts = await getPosts()
  return posts.map(post => ({ slug: post.slug }))
}

export default async function Post({ params }) {
  const post = await getPost(params.slug)
  return <article>{post.content}</article>
}
```

**Benefits**: Fast, SEO-friendly, cheap hosting
**Use when**: Content updates infrequently

### Incremental Static Regeneration (ISR)
Update static pages after build:

```typescript
// Revalidate every hour
export const revalidate = 3600

export default async function Post({ params }) {
  const post = await getPost(params.slug)
  return <article>{post.content}</article>
}
```

**Benefits**: Static speed + fresh content
**Use when**: Balance between speed and freshness

### Server-Side Rendering (SSR)
Generate HTML per request:

```typescript
// Fetch fresh data on every request
export default async function Post({ params }) {
  const post = await getPost(params.slug) // Runs on every request
  return <article>{post.content}</article>
}
```

**Benefits**: Always fresh content
**Use when**: Content changes frequently, personalized

### Client-Side Fetching
Fetch content in browser:

```typescript
function Post({ slug }) {
  const { data: post } = useSWR(`/api/posts/${slug}`, fetcher)

  if (!post) return <Loading />
  return <article>{post.content}</article>
}
```

**Benefits**: Interactive, real-time updates
**Use when**: Personalized content, real-time data

## Content Querying

### REST API
```typescript
// Fetch posts
const response = await fetch('/api/posts?limit=10&category=tech')
const posts = await response.json()
```

### GraphQL
```typescript
import { gql } from '@apollo/client'

const GET_POSTS = gql`
  query GetPosts($limit: Int!, $category: String) {
    posts(limit: $limit, category: $category) {
      id
      title
      excerpt
      author {
        name
        avatar
      }
    }
  }
`

const { data } = useQuery(GET_POSTS, {
  variables: { limit: 10, category: 'tech' }
})
```

### SDK/Client
```typescript
// Sanity client
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'your-project',
  dataset: 'production',
  apiVersion: '2024-01-01',
})

const posts = await client.fetch(`
  *[_type == "post" && category == $category] {
    title,
    slug,
    "author": author->name
  }
`, { category: 'tech' })
```

## Rich Text Handling

### Portable Text (Sanity)
```typescript
import { PortableText } from '@portabletext/react'

<PortableText
  value={post.content}
  components={{
    types: {
      image: ({ value }) => <img src={value.url} />,
      code: ({ value }) => <pre><code>{value.code}</code></pre>,
    },
    marks: {
      link: ({ value, children }) => <a href={value.href}>{children}</a>,
    },
  }}
/>
```

### MDX
```typescript
import { MDXRemote } from 'next-mdx-remote/rsc'

const components = {
  h1: (props) => <h1 className="text-4xl" {...props} />,
  img: (props) => <Image {...props} />,
  MyComponent: () => <div>Custom component</div>,
}

<MDXRemote source={content} components={components} />
```

### HTML (from WYSIWYG)
```typescript
// Sanitize first!
import DOMPurify from 'isomorphic-dompurify'

const clean = DOMPurify.sanitize(htmlContent)
<div dangerouslySetInnerHTML={{ __html: clean }} />
```

## Search Implementation

### Client-Side Search
```typescript
import Fuse from 'fuse.js'

const fuse = new Fuse(posts, {
  keys: ['title', 'excerpt', 'content'],
  threshold: 0.3,
})

const results = fuse.search(query)
```

### Server-Side Search
```typescript
// Simple SQL
const posts = await db.post.findMany({
  where: {
    OR: [
      { title: { contains: query } },
      { content: { contains: query } },
    ],
  },
})
```

### Full-Text Search
```typescript
// Algolia
import algoliasearch from 'algoliasearch'

const client = algoliasearch('APP_ID', 'API_KEY')
const index = client.initIndex('posts')

const { hits } = await index.search(query, {
  hitsPerPage: 10,
  filters: 'published:true',
})
```

## Common Pitfalls

1. **No Content Validation**
   - **Risk**: Broken content in production
   - **Solution**: Schema validation, preview

2. **Poor Image Handling**
   - **Risk**: Slow page loads
   - **Solution**: Optimization service, next/image

3. **No Search**
   - **Risk**: Poor UX for large content
   - **Solution**: Implement search early

4. **Missing Metadata**
   - **Risk**: Poor SEO
   - **Solution**: Enforce title, description, OG images

5. **Hard-Coded Content**
   - **Risk**: Hard to maintain
   - **Solution**: Externalize content early

## Decision Framework

1. **Team Composition**
   - Developers only → File-based (MDX)
   - Mixed team → Git-based CMS
   - Non-technical → Headless CMS

2. **Content Volume**
   - Small (<100 pages) → File-based
   - Medium (<1000 pages) → Any approach
   - Large (>1000 pages) → Headless CMS

3. **Update Frequency**
   - Rare → Static (MDX, SSG)
   - Daily → ISR or SSR
   - Real-time → SSR or CSR

4. **Budget**
   - Low → File-based or Notion
   - Medium → Git-based CMS
   - Flexible → Headless CMS

5. **Technical Requirements**
   - Version control → File/Git-based
   - Multi-channel → Headless CMS
   - Custom needs → Database-backed

## Resources

### File-Based
- Contentlayer
- next-mdx-remote
- MDX

### Git-Based
- Tina CMS
- Decap CMS

### Headless CMS
- Contentful
- Sanity
- Strapi (self-hosted)

### Learning
- Jamstack best practices
- Content modeling guides
- MDX documentation
