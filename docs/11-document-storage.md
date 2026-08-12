# [APP_NAME] — Document Storage Architecture

> Document version: 1.0
> Status: 📋 Review
> Last updated: 2026-08-12

---

## 1. Design Goals

1. **Provider-agnostic** — switch storage backends without changing business logic
2. **Secure** — no publicly accessible files; signed URLs for all access
3. **Cost-aware** — minimal storage costs; configurable quotas
4. **Simple** — no over-engineering for Phase 1 scale

---

## 2. Architecture Overview

```
┌────────────────────────────────────────────────────────────────┐
│                      Mobile Client                              │
│                                                                 │
│  Upload: multipart/form-data ──────────────────────────────┐   │
│  Download: GET signed URL ───────────────────────────────┐ │   │
│                                                          │ │   │
└──────────────────────────────────────────────────────────┼─┼───┘
                                                           │ │
                                                           ▼ │
┌────────────────────────────────────────────────────────────┼───┐
│                      Backend API                            │   │
│                                                             │   │
│  ┌─────────────────────────┐                               │   │
│  │   Document Controller   │                               │   │
│  │                         │                               │   │
│  │ POST /documents         │  (multipart upload)           │   │
│  │ GET /documents/:id/     │                               │   │
│  │     download-url        │──────────────────────────────►│   │
│  └───────────┬─────────────┘                               │   │
│              │                                              │   │
│  ┌───────────▼─────────────┐    ┌──────────────────────┐  │   │
│  │   Document Service      │────│   Storage Service     │  │   │
│  │                         │    │   (Interface)         │  │   │
│  │ - Validate file         │    │                       │  │   │
│  │ - Check quota           │    │ upload()              │  │   │
│  │ - Store metadata in DB  │    │ getSignedUrl()        │  │   │
│  │ - Call StorageService   │    │ delete()              │  │   │
│  └─────────────────────────┘    └───────────┬───────────┘  │   │
│                                              │              │   │
└──────────────────────────────────────────────┼──────────────┘   │
                                               │                   │
                    ┌──────────────────────────┼───────────┐       │
                    │                          │           │       │
                    ▼                          ▼           │       │
          ┌──────────────────┐    ┌─────────────────┐     │       │
          │ LocalStorageImpl │    │  S3StorageImpl  │     │       │
          │ (Development)    │    │  (Production)   │     │       │
          │                  │    │                  │     │       │
          │ ./uploads/       │    │ S3-compatible    │─────┘       │
          │                  │    │ bucket           │   ◄── Signed URL
          └──────────────────┘    └─────────────────┘       redirect
```

---

## 3. Storage Service Interface

```typescript
export interface FileMetadata {
  originalName: string;
  mimeType: string;
  size: number;
}

export interface StorageResult {
  path: string;         // Storage key/path
  url?: string;         // Direct URL (local dev only)
  size: number;
}

export interface IStorageService {
  /**
   * Upload a file to storage
   * @param file - File buffer
   * @param path - Storage destination path (e.g., "users/{userId}/documents/{filename}")
   * @param metadata - File metadata
   */
  upload(file: Buffer, path: string, metadata: FileMetadata): Promise<StorageResult>;
  
  /**
   * Generate a time-limited signed URL for file access
   * @param path - Storage path
   * @param expiresInSeconds - URL validity (default: 900 = 15 min)
   */
  getSignedUrl(path: string, expiresInSeconds?: number): Promise<string>;
  
  /**
   * Delete a file from storage
   * @param path - Storage path
   */
  delete(path: string): Promise<void>;
  
  /**
   * Check if a file exists
   * @param path - Storage path
   */
  exists(path: string): Promise<boolean>;
}
```

---

## 4. File Organization (Storage Paths)

```
{bucket}/
├── users/
│   └── {userId}/
│       ├── documents/
│       │   ├── {uuid}_{original-filename}.pdf
│       │   └── {uuid}_{original-filename}.jpg
│       ├── prescriptions/
│       │   └── {uuid}_{original-filename}.pdf
│       ├── medical-reports/
│       │   └── {uuid}_{original-filename}.pdf
│       ├── warranties/
│       │   └── {uuid}_invoice_{original-filename}.pdf
│       └── avatar/
│           └── avatar.jpg
```

### Path Construction

```typescript
function buildStoragePath(userId: string, module: string, fileName: string): string {
  const uuid = generateUuid();
  const sanitized = sanitizeFileName(fileName);
  return `users/${userId}/${module}/${uuid}_${sanitized}`;
}
```

**Why UUID prefix on filename?**
- Prevents filename collisions
- Makes paths unguessable even if storage is misconfigured
- Preserves original filename for download

---

## 5. Upload Flow

```
1. Client sends multipart/form-data to POST /documents
   - file: binary data
   - metadata fields: name, category, etc.

2. Backend receives request (NestJS FileInterceptor / Multer)

3. Validation:
   ├── File size ≤ 10MB?
   ├── MIME type allowed? (pdf, jpeg, jpg, png)
   ├── User quota not exceeded?
   └── All pass → continue

4. Build storage path: users/{userId}/documents/{uuid}_{filename}

5. Call StorageService.upload(buffer, path, metadata)
   ├── LocalStorage: write to ./uploads/{path}
   └── S3Storage: PutObject to bucket

6. Store metadata in Document table:
   - fileName (original)
   - filePath (storage key)
   - fileSize
   - mimeType
   
7. Return document metadata to client (NOT the file URL)
```

---

## 6. Download Flow (Signed URLs)

```
1. Client requests: GET /documents/:id/download-url

2. Backend verifies:
   ├── User owns this document (userId match)
   └── Document not soft-deleted

3. Call StorageService.getSignedUrl(document.filePath, 900)
   ├── LocalStorage: return local URL (dev only)
   └── S3Storage: generate pre-signed S3 URL (15 min expiry)

4. Return signed URL to client

5. Client:
   ├── Display: load image/PDF from signed URL
   └── Share: pass signed URL to OS share sheet
```

### Why Signed URLs?

- Files are NEVER publicly accessible
- Each URL expires after 15 minutes
- User must be authenticated to get a URL
- URL can't be shared permanently (expires)
- No need for proxy — client downloads directly from storage

---

## 7. Local Storage Implementation (Development)

```typescript
@Injectable()
export class LocalStorageService implements IStorageService {
  private basePath: string;
  
  constructor(private configService: ConfigService) {
    this.basePath = configService.get('STORAGE_LOCAL_PATH', './uploads');
  }
  
  async upload(file: Buffer, path: string, metadata: FileMetadata): Promise<StorageResult> {
    const fullPath = join(this.basePath, path);
    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, file);
    
    return {
      path,
      size: file.length,
    };
  }
  
  async getSignedUrl(path: string, expiresInSeconds = 900): Promise<string> {
    // In development, return a direct URL served by NestJS static
    const baseUrl = this.configService.get('APP_URL', 'http://localhost:3000');
    return `${baseUrl}/uploads/${path}`;
    // Note: In dev, no real signature — files are accessible if you know the path
    // This is acceptable for local development only
  }
  
  async delete(path: string): Promise<void> {
    const fullPath = join(this.basePath, path);
    await unlink(fullPath).catch(() => {}); // Ignore if not exists
  }
  
  async exists(path: string): Promise<boolean> {
    const fullPath = join(this.basePath, path);
    return access(fullPath).then(() => true).catch(() => false);
  }
}
```

---

## 8. S3 Storage Implementation (Production)

```typescript
@Injectable()
export class S3StorageService implements IStorageService {
  private client: S3Client;
  private bucket: string;
  
  constructor(private configService: ConfigService) {
    this.bucket = configService.get('S3_BUCKET');
    this.client = new S3Client({
      region: configService.get('S3_REGION'),
      credentials: {
        accessKeyId: configService.get('S3_ACCESS_KEY'),
        secretAccessKey: configService.get('S3_SECRET_KEY'),
      },
      // For R2: endpoint override
      // endpoint: configService.get('S3_ENDPOINT'),
    });
  }
  
  async upload(file: Buffer, path: string, metadata: FileMetadata): Promise<StorageResult> {
    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: path,
      Body: file,
      ContentType: metadata.mimeType,
      ContentDisposition: `inline; filename="${metadata.originalName}"`,
    }));
    
    return { path, size: file.length };
  }
  
  async getSignedUrl(path: string, expiresInSeconds = 900): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: path,
    });
    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }
  
  async delete(path: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: path,
    }));
  }
  
  async exists(path: string): Promise<boolean> {
    try {
      await this.client.send(new HeadObjectCommand({
        Bucket: this.bucket,
        Key: path,
      }));
      return true;
    } catch {
      return false;
    }
  }
}
```

---

## 9. Provider Selection (Module Registration)

```typescript
@Module({
  providers: [
    {
      provide: 'STORAGE_SERVICE',
      useFactory: (configService: ConfigService) => {
        const provider = configService.get('STORAGE_PROVIDER', 'local');
        switch (provider) {
          case 's3':
            return new S3StorageService(configService);
          case 'local':
          default:
            return new LocalStorageService(configService);
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: ['STORAGE_SERVICE'],
})
export class StorageModule {}
```

Usage in services:
```typescript
@Injectable()
export class DocumentsService {
  constructor(
    @Inject('STORAGE_SERVICE') private storage: IStorageService,
  ) {}
}
```

---

## 10. File Validation

### Allowed File Types

| Context | Allowed MIME Types |
|---------|-------------------|
| Documents | application/pdf, image/jpeg, image/png |
| Prescriptions | application/pdf, image/jpeg, image/png |
| Medical Reports | application/pdf, image/jpeg, image/png |
| Warranty Invoice | application/pdf, image/jpeg, image/png |
| User Avatar | image/jpeg, image/png |

### Validation Rules

```typescript
const FILE_VALIDATION = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: [
    'application/pdf',
    'image/jpeg',
    'image/png',
  ],
  avatarMaxSize: 2 * 1024 * 1024, // 2MB for avatars
};
```

### Validation Steps

```
1. Check Content-Type header matches actual file content (magic bytes)
2. Check file size against limit
3. Check MIME type against allowlist
4. Sanitize filename (remove special chars, limit length)
5. Reject if validation fails (413 or 415 HTTP status)
```

**Why validate magic bytes?** A file named `document.pdf` with Content-Type `application/pdf` could actually be a malicious executable. Checking the file's magic bytes (first few bytes that identify format) prevents this.

---

## 11. Storage Quota

### Phase 1 Implementation

```typescript
const STORAGE_QUOTA = {
  maxPerUser: 500 * 1024 * 1024,    // 500MB per user
  maxPerFile: 10 * 1024 * 1024,     // 10MB per file
};

// Before upload:
async checkQuota(userId: string, newFileSize: number): Promise<boolean> {
  const currentUsage = await this.prisma.document.aggregate({
    where: { userId, deletedAt: null },
    _sum: { fileSize: true },
  });
  
  // Also count prescriptions, reports, warranty invoices
  const totalUsage = currentUsage._sum.fileSize + 
    prescriptionUsage + reportUsage + warrantyUsage;
  
  return (totalUsage + newFileSize) <= STORAGE_QUOTA.maxPerUser;
}
```

If quota exceeded → return 507 with message: "Storage quota exceeded. Delete some files to free space."

---

## 12. Soft Delete & Cleanup

### Document Soft Delete
```
DELETE /documents/:id
    → Set deletedAt = now()
    → File remains in storage
    → Document hidden from lists (WHERE deletedAt IS NULL)
    → User can restore within 30 days
```

### Permanent Cleanup (Cron — daily at 3:00 AM)
```
Find documents where:
    deletedAt < now() - 30 days

For each:
    → Delete file from storage (StorageService.delete)
    → Hard delete database record
```

### Account Deletion
```
User deletes account:
    → Find ALL files for user (documents, prescriptions, reports, invoices)
    → Delete each from storage
    → Cascade delete all DB records
    → No recovery possible
```

---

## 13. S3 Bucket Configuration (Production)

### Bucket Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::app-name-documents/*",
      "Condition": {
        "Bool": {
          "aws:SecureTransport": "false"
        }
      }
    }
  ]
}
```

### Key Settings
- **Public access:** BLOCKED (all public access disabled)
- **Encryption:** SSE-S3 (server-side encryption at rest)
- **Versioning:** Disabled (we don't need file history)
- **Lifecycle rules:** Delete incomplete multipart uploads after 24 hours
- **CORS:** Configure for signed URL access from mobile (if needed for web in future)

---

## 14. Cost Estimation

### Storage costs at scale (S3 pricing, approximate)

| Users | Avg storage/user | Total storage | Monthly cost (S3) | Monthly cost (R2) |
|-------|-----------------|--------------|-------------------|-------------------|
| 100 | 100MB | 10 GB | ~$0.23 | ~$0.15 |
| 1,000 | 200MB | 200 GB | ~$4.60 | ~$3.00 |
| 10,000 | 300MB | 3 TB | ~$69 | ~$45 |

R2 advantage: **zero egress fees** — significant if users frequently view/download documents.

---

## 15. Dependencies

| Package | Purpose |
|---------|---------|
| `@aws-sdk/client-s3` | S3 operations |
| `@aws-sdk/s3-request-presigner` | Generate signed URLs |
| `multer` / `@nestjs/platform-express` | File upload handling |
| `file-type` | Magic byte validation |
