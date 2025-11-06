# File Upload Patterns

## Overview

File uploads allow users to share images, documents, and other files with your application. Good upload patterns balance user experience, security, performance, and storage costs.

## Key Considerations

### User Experience
- **Progress Indication**: Show upload progress
- **Drag and Drop**: Intuitive file selection
- **Preview**: Show images/files before upload
- **Multiple Files**: Batch uploads when needed
- **Error Handling**: Clear feedback on failures
- **File Validation**: Client-side checks before upload

### Security
- **File Type Validation**: Accept only allowed types
- **File Size Limits**: Prevent abuse
- **Virus Scanning**: Check for malware
- **Access Control**: Who can upload/access files
- **Filename Sanitization**: Prevent path traversal
- **Content Validation**: Verify file contents match extension

### Performance
- **File Size**: Compression before upload
- **Chunking**: Split large files for reliability
- **CDN Delivery**: Fast global access
- **Image Optimization**: Automatic resizing/compression
- **Lazy Loading**: Load images as needed

### Cost
- **Storage Pricing**: Per GB storage costs
- **Bandwidth Costs**: Upload/download data transfer
- **Processing Costs**: Image transformation, video transcoding
- **CDN Costs**: Content delivery fees

## Storage Approaches

### Cloud Storage (S3-Compatible)
**Philosophy**: Dedicated object storage service

**Providers**:
- AWS S3
- Cloudflare R2
- Google Cloud Storage
- DigitalOcean Spaces
- Backblaze B2
- Wasabi

**Characteristics**:
- Unlimited scalability
- Pay per usage
- 99.999999999% durability
- Versioning support
- Lifecycle policies
- Direct browser uploads (presigned URLs)

**When to Choose**:
- Production applications
- Need scalability
- Want durability guarantees
- Global CDN integration

**Tradeoffs**:
- ➕ Highly reliable
- ➕ Scalable
- ➕ Global CDN
- ➕ Advanced features (versioning, lifecycle)
- ➖ Ongoing costs
- ➖ Vendor lock-in (APIs vary)
- ➖ Configuration complexity

**Upload Pattern**:
```typescript
// Get presigned URL from server
const { uploadUrl, fileUrl } = await fetch('/api/upload-url', {
  method: 'POST',
  body: JSON.stringify({ filename, contentType }),
}).then(r => r.json())

// Upload directly to S3
await fetch(uploadUrl, {
  method: 'PUT',
  body: file,
  headers: { 'Content-Type': file.type },
})

// Save fileUrl to database
```

### Image Optimization Services
**Philosophy**: Storage + automatic image transformation

**Services**:
- Cloudinary
- Imgix
- Uploadcare
- ImageKit
- Cloudflare Images

**Characteristics**:
- Automatic optimization
- On-the-fly transformations
- CDN included
- AI features (auto-cropping, tagging)
- Format conversion (WebP, AVIF)
- Responsive images

**When to Choose**:
- Image-heavy applications
- Need responsive images
- Want automatic optimization
- Don't want to manage transformations

**Tradeoffs**:
- ➕ Automatic optimization
- ➕ Easy responsive images
- ➕ CDN included
- ➕ AI features
- ➖ Higher cost
- ➖ Vendor lock-in
- ➖ May be overkill for simple needs

**Example**:
```typescript
// Cloudinary upload
import { CldUploadWidget } from 'next-cloudinary'

<CldUploadWidget
  uploadPreset="my-preset"
  onSuccess={(result) => {
    const imageUrl = result.info.secure_url
    // Save to database
  }}
>
  {({ open }) => (
    <button onClick={() => open()}>Upload Image</button>
  )}
</CldUploadWidget>

// Optimized delivery
<CldImage
  src={publicId}
  width={800}
  height={600}
  crop="fill"
  gravity="auto"
  format="auto"
  quality="auto"
/>
```

### Local/Server Storage
**Philosophy**: Store files on application server

**Characteristics**:
- Simplest setup
- No external dependencies
- Direct file system access
- Server resources used

**When to Choose**:
- Development/prototyping
- Low upload volume
- Internal applications
- Already have server infrastructure

**Tradeoffs**:
- ➕ Simple implementation
- ➕ No external costs
- ➕ Full control
- ➖ Not scalable
- ➖ No redundancy
- ➖ Server disk space limits
- ➖ Slower global access

**Implementation**:
```typescript
// API route (Next.js)
export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Save to disk
  const path = `./uploads/${Date.now()}-${file.name}`
  await fs.writeFile(path, buffer)

  return NextResponse.json({ path })
}
```

### Database Storage (Blob)
**Philosophy**: Store files as binary data in database

**Characteristics**:
- Files stored with related data
- ACID compliance
- Backup with database
- Query files with SQL

**When to Choose**:
- Small files (<1MB)
- Files tied to database records
- Need ACID properties
- Simple deployment

**Tradeoffs**:
- ➕ Stored with data
- ➕ ACID compliance
- ➕ Simple backup
- ➖ Database bloat
- ➖ Slow for large files
- ➖ Expensive queries
- ➖ Not recommended for production

## Upload Patterns

### Direct Upload
Client uploads directly to storage:

```typescript
// 1. Get presigned URL from your API
const { uploadUrl, publicUrl } = await getUploadUrl(filename)

// 2. Upload directly to storage
await fetch(uploadUrl, {
  method: 'PUT',
  body: file,
  headers: { 'Content-Type': file.type }
})

// 3. Save publicUrl to database
await saveFileRecord({ url: publicUrl, name: filename })
```

**Benefits**: Reduces server load, faster uploads
**Use when**: Want to offload upload bandwidth

### Proxy Upload
Client uploads through your server:

```typescript
// Client sends to your API
const formData = new FormData()
formData.append('file', file)
await fetch('/api/upload', {
  method: 'POST',
  body: formData
})

// Server forwards to storage
// (Can validate, transform, scan)
```

**Benefits**: Full control, validation, transformation
**Use when**: Need to process files, security critical

### Chunked Upload
Split large files into chunks:

```typescript
const chunkSize = 5 * 1024 * 1024 // 5MB
const chunks = Math.ceil(file.size / chunkSize)

for (let i = 0; i < chunks; i++) {
  const start = i * chunkSize
  const end = Math.min(start + chunkSize, file.size)
  const chunk = file.slice(start, end)

  await uploadChunk(chunk, i, chunks)
}

// Server reassembles chunks
```

**Benefits**: Resume failed uploads, progress tracking
**Use when**: Large files (>100MB), unreliable connections

### Resumable Upload
Continue interrupted uploads:

```typescript
// 1. Initiate upload, get upload ID
const { uploadId } = await startUpload(filename, filesize)

// 2. Upload with upload ID
// (Tracks progress on server)

// 3. If interrupted, resume from last chunk
const { lastChunk } = await getUploadStatus(uploadId)
// Continue from lastChunk + 1
```

**Benefits**: Better UX for large files
**Use when**: Large files, mobile uploads

## File Validation

### Client-Side Validation

```typescript
function validateFile(file: File): string | null {
  // File type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return 'File type not allowed'
  }

  // File size (5MB limit)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    return 'File too large (max 5MB)'
  }

  // File name
  if (file.name.length > 255) {
    return 'Filename too long'
  }

  return null
}
```

### Server-Side Validation
**Always required** - never trust client:

```typescript
import fileType from 'file-type'

async function validateUpload(file: Buffer): Promise<void> {
  // Check actual file type (not extension)
  const type = await fileType.fromBuffer(file)

  if (!type || !['image/jpeg', 'image/png'].includes(type.mime)) {
    throw new Error('Invalid file type')
  }

  // Check file size
  if (file.length > 5 * 1024 * 1024) {
    throw new Error('File too large')
  }

  // Virus scan (ClamAV, etc.)
  await scanForVirus(file)
}
```

## Image Processing

### Optimization
```typescript
import sharp from 'sharp'

async function optimizeImage(buffer: Buffer) {
  return sharp(buffer)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer()
}
```

### Responsive Images
Generate multiple sizes:

```typescript
const sizes = [
  { name: 'thumbnail', width: 150 },
  { name: 'medium', width: 600 },
  { name: 'large', width: 1200 },
]

for (const size of sizes) {
  const resized = await sharp(buffer)
    .resize(size.width)
    .toBuffer()

  await uploadToStorage(`${filename}-${size.name}.jpg`, resized)
}
```

### Format Conversion
Modern formats for better compression:

```typescript
// Convert to WebP
await sharp(buffer)
  .webp({ quality: 80 })
  .toFile('output.webp')

// Convert to AVIF (better compression)
await sharp(buffer)
  .avif({ quality: 80 })
  .toFile('output.avif')
```

## UI Patterns

### Drag and Drop
```typescript
function DropZone({ onDrop }: { onDrop: (files: File[]) => void }) {
  const [isDragging, setIsDragging] = useState(false)

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragging(false)

        const files = Array.from(e.dataTransfer.files)
        onDrop(files)
      }}
      className={isDragging ? 'border-blue-500' : 'border-gray-300'}
    >
      Drop files here or click to select
    </div>
  )
}
```

### Progress Bar
```typescript
function UploadProgress() {
  const [progress, setProgress] = useState(0)

  const upload = async (file: File) => {
    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        setProgress((e.loaded / e.total) * 100)
      }
    })

    xhr.addEventListener('load', () => {
      setProgress(100)
    })

    xhr.open('POST', '/api/upload')
    xhr.send(file)
  }

  return (
    <div className="w-full bg-gray-200 rounded">
      <div
        className="bg-blue-500 h-2 rounded"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
```

### Image Preview
```typescript
function ImagePreview({ file }: { file: File }) {
  const [preview, setPreview] = useState<string>('')

  useEffect(() => {
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }, [file])

  return <img src={preview} alt="Preview" />
}
```

## Security Best Practices

1. **Validate File Types**
   - Check magic bytes, not just extension
   - Use server-side validation

2. **Scan for Malware**
   - Use ClamAV or commercial service
   - Quarantine suspicious files

3. **Limit File Sizes**
   - Prevent DoS attacks
   - Enforce on server side

4. **Sanitize Filenames**
   - Remove special characters
   - Prevent path traversal (../)
   - Generate unique names

5. **Access Control**
   - Private files require authentication
   - Use signed URLs for temporary access
   - Separate user uploads

6. **Content Security**
   - Set correct Content-Type headers
   - Use Content-Disposition for downloads
   - Prevent XSS (SVG can contain scripts)

## Common Pitfalls

1. **No Server Validation**
   - **Risk**: Malicious files uploaded
   - **Solution**: Always validate on server

2. **Storing Original Filenames**
   - **Risk**: Path traversal, collisions
   - **Solution**: Generate unique names

3. **No File Size Limits**
   - **Risk**: Storage exhaustion, DoS
   - **Solution**: Enforce limits

4. **No Progress Indication**
   - **Risk**: Poor UX, double uploads
   - **Solution**: Show progress, disable button

5. **Missing Error Handling**
   - **Risk**: User confusion
   - **Solution**: Clear error messages, retry option

## Testing Strategies

- Test large files (>100MB)
- Test unsupported file types
- Test exceeding size limits
- Test interrupted uploads
- Test concurrent uploads
- Test malicious files (if scanning)

## Decision Framework

1. **Storage Choice**
   - Development → Local storage
   - Production, any scale → Cloud storage
   - Image-heavy → Image optimization service
   - Simple needs → S3-compatible

2. **Upload Pattern**
   - Small files (<10MB) → Direct or proxy
   - Large files (>100MB) → Chunked/resumable
   - Need processing → Proxy upload

3. **Image Handling**
   - Few images → Sharp (self-hosted)
   - Many images → Image optimization service
   - Need responsive → Generate multiple sizes

## Resources

### Cloud Storage
- AWS S3 documentation
- Cloudflare R2
- Vercel Blob

### Image Processing
- Sharp (Node.js)
- Cloudinary
- ImageKit

### File Upload
- Uppy (upload UI)
- Dropzone.js
- Filepond

### Security
- OWASP File Upload Cheat Sheet
- ClamAV (virus scanning)
- File type validation best practices
