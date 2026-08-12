# [APP_NAME] — Security Model

> Document version: 1.0
> Status: 📋 Review
> Last updated: 2026-08-12

---

## 1. Security Priority

This application stores highly sensitive personal data:
- Government identity documents (Aadhaar, PAN, Passport)
- Medical records and prescriptions
- Health information
- Financial documents (insurance)

**Security is the #1 priority.** A single data breach could expose a user's entire personal life.

---

## 2. Threat Model

### Primary Threats

| Threat | Impact | Likelihood | Mitigation |
|--------|--------|------------|-----------|
| Stolen device with active session | Access to cached data + active tokens | Medium | Secure storage, short access token, biometric lock (future) |
| Man-in-the-middle attack | Intercepted API traffic | Low (HTTPS) | TLS 1.2+, certificate pinning (future) |
| Credential stuffing/brute force | Account takeover | Medium | Rate limiting, strong passwords, account lockout |
| SQL injection | Database access | Low (Prisma) | Prisma parameterized queries, input validation |
| Server compromise | Full data access | Low | Encryption at rest, minimal data exposure, audit logs |
| Insider threat | Unauthorized data access | Low | Data isolation, no admin backdoors, access logging |
| Token theft (XSS) | Session hijacking | Very Low (native app) | No web views with user data, HttpOnly (N/A for mobile) |
| File access without auth | Document leak | Medium | Signed URLs, no public storage |

---

## 3. Data Protection Layers

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Transport Security                                  │
│ TLS 1.2+ for all API communication                          │
│ HSTS headers in production                                   │
├─────────────────────────────────────────────────────────────┤
│ Layer 2: Authentication                                      │
│ JWT access tokens (15 min) + refresh tokens (7 days)        │
│ bcrypt password hashing (12 rounds)                          │
├─────────────────────────────────────────────────────────────┤
│ Layer 3: Authorization                                       │
│ Every query scoped to authenticated userId                   │
│ No cross-user data access possible                          │
├─────────────────────────────────────────────────────────────┤
│ Layer 4: Data Isolation                                      │
│ User can ONLY access their own data                         │
│ No admin endpoints that bypass isolation                     │
├─────────────────────────────────────────────────────────────┤
│ Layer 5: Storage Security                                    │
│ Files: private bucket, signed URLs only                      │
│ Database: encrypted at rest (managed PostgreSQL)             │
│ Mobile: Keychain/EncryptedSharedPreferences                 │
├─────────────────────────────────────────────────────────────┤
│ Layer 6: Input Validation                                    │
│ All inputs validated with class-validator                    │
│ File type verification (magic bytes)                         │
│ Parameterized queries (Prisma)                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Backend Security Implementation

### 4.1 Data Isolation (Critical)

**Every database query MUST be scoped to the authenticated user.**

```typescript
// ✅ CORRECT — always filter by userId
async getDocuments(userId: string) {
  return this.prisma.document.findMany({
    where: { userId, deletedAt: null },
  });
}

// ❌ WRONG — never trust client-provided userId
async getDocuments(userIdFromBody: string) {
  return this.prisma.document.findMany({
    where: { userId: userIdFromBody },
  });
}
```

**Rule:** The `userId` for data filtering ALWAYS comes from the JWT payload (verified by the server), NEVER from request body/params.

### 4.2 IDOR Prevention (Insecure Direct Object Reference)

```typescript
// When accessing a specific resource by ID:
async getDocument(userId: string, documentId: string) {
  const doc = await this.prisma.document.findFirst({
    where: { 
      id: documentId, 
      userId,           // ← This prevents IDOR
      deletedAt: null,
    },
  });
  
  if (!doc) throw new NotFoundException();
  return doc;
}
```

Even if an attacker guesses a valid document UUID, they can't access it unless they own it.

### 4.3 Input Validation

All inputs validated before processing:

```typescript
// DTOs use class-validator decorators
export class CreateReminderDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsISO8601()
  dueDate: string;

  @IsEnum(RecurrenceType)
  recurrenceType: RecurrenceType;
}
```

### 4.4 Rate Limiting

```typescript
// Global rate limiting
@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,       // 60 seconds window
      limit: 100,    // 100 requests per window
    }),
  ],
})

// Stricter limits for auth endpoints
@Throttle(5, 900)  // 5 requests per 15 minutes
@Post('login')
async login() { ... }
```

### 4.5 Security Headers

```typescript
// Helmet middleware for security headers
app.use(helmet({
  contentSecurityPolicy: false, // N/A for API-only server
  crossOriginEmbedderPolicy: false,
}));

// Additional headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

### 4.6 CORS Configuration

```typescript
// Only allow requests from known origins
app.enableCors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://app.example.com']  // If web client exists
    : true,                         // Allow all in development
  credentials: true,
});
```

For a mobile-only API, CORS is less critical (native apps don't respect CORS), but good practice for when a web client is eventually added.

### 4.7 Error Handling (No Information Leakage)

```typescript
// Global exception filter
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // In production: never expose stack traces or internal errors
    if (exception instanceof HttpException) {
      // Return structured error
    } else {
      // Log full error internally
      this.logger.error('Unhandled exception', exception);
      
      // Return generic error to client
      response.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
          // NO stack trace, NO SQL error details, NO file paths
        },
      });
    }
  }
}
```

### 4.8 SQL Injection Prevention

**Prisma ORM uses parameterized queries by default.** No raw SQL is allowed unless absolutely necessary — and if used, must use `$queryRaw` with tagged template literals (auto-parameterized).

```typescript
// ✅ Safe — Prisma parameterizes automatically
await prisma.document.findMany({
  where: { name: { contains: userInput } }
});

// ❌ Never do this
await prisma.$queryRawUnsafe(`SELECT * FROM documents WHERE name = '${userInput}'`);
```

---

## 5. Mobile Security Implementation

### 5.1 Token Storage

| Data | Storage | Encryption |
|------|---------|-----------|
| Access token | Zustand (in-memory) | N/A (volatile) |
| Refresh token | react-native-keychain | AES-256 (hardware-backed) |
| User info (cached) | react-native-keychain | AES-256 |
| Dashboard cache | TanStack Query (memory) | N/A (volatile, non-sensitive aggregates) |

**Nothing sensitive is stored in AsyncStorage** (which is unencrypted on both platforms).

### 5.2 Network Security

```typescript
// Axios instance with security measures
const api = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-App-Version': Config.APP_VERSION,
    'X-Platform': Platform.OS,
  },
});

// Never log sensitive data
api.interceptors.request.use((config) => {
  if (__DEV__) {
    console.log(`${config.method?.toUpperCase()} ${config.url}`);
    // DO NOT log: authorization headers, request bodies with passwords
  }
  return config;
});
```

### 5.3 Certificate Pinning (Future Enhancement)

Not in Phase 1, but the architecture supports it:

```typescript
// Future: TrustKit or similar for cert pinning
// Prevents MITM even with compromised CA
```

### 5.4 Secure Build Practices

| Practice | Implementation |
|----------|---------------|
| No secrets in source code | All config from environment variables |
| No secrets in git | .gitignore covers .env, *.keystore, *.pem |
| Obfuscation (Android) | ProGuard/R8 enabled in release builds |
| No debuggable release | `android:debuggable=false` in release |
| No console logs in prod | Strip `console.*` in release builds |
| Secure keystore | Release keystore stored outside repo |

### 5.5 Deep Link Security

```typescript
// Validate deep link tokens server-side
// Never trust data from deep links without verification
// Example: reset password deep link
const handleDeepLink = (url: string) => {
  const token = extractToken(url);
  // Don't auto-login with this token
  // Navigate to ResetPassword screen where user must provide new password
  // Token is validated server-side on submission
};
```

---

## 6. API Security Checklist

| # | Check | Status |
|---|-------|--------|
| 1 | All endpoints require authentication (except /auth/*) | ✅ |
| 2 | JWT verified on every request (signature + expiry) | ✅ |
| 3 | userId from JWT payload, never from request body | ✅ |
| 4 | All database queries scoped to userId | ✅ |
| 5 | Input validation on all endpoints (DTOs) | ✅ |
| 6 | Rate limiting on all endpoints | ✅ |
| 7 | Stricter rate limits on auth endpoints | ✅ |
| 8 | No email enumeration (generic error messages) | ✅ |
| 9 | Passwords hashed with bcrypt (12 rounds) | ✅ |
| 10 | Refresh token rotation on every use | ✅ |
| 11 | Files accessible only via signed URLs | ✅ |
| 12 | File type validated (magic bytes + MIME) | ✅ |
| 13 | File size enforced server-side | ✅ |
| 14 | No stack traces in production errors | ✅ |
| 15 | Security headers set (Helmet) | ✅ |
| 16 | HTTPS only in production | ✅ |
| 17 | No secrets in code or git | ✅ |
| 18 | Parameterized queries (Prisma) | ✅ |
| 19 | Account deletion cascades all data | ✅ |
| 20 | Logging excludes sensitive fields | ✅ |

---

## 7. Logging & Audit

### What to Log

| Event | Log Level | Data Logged |
|-------|-----------|-------------|
| Successful login | INFO | userId, IP, timestamp |
| Failed login | WARN | email (masked), IP, timestamp |
| Password change | INFO | userId, timestamp |
| Account deletion | INFO | userId, timestamp |
| File upload | INFO | userId, documentId, fileSize |
| Rate limit hit | WARN | IP, endpoint, timestamp |
| Unexpected errors | ERROR | Error message, stack (internal only) |

### What NOT to Log

- Passwords (plaintext or hashed)
- Token values (access or refresh)
- File contents
- Health information
- Document metadata details
- Full request/response bodies in production

### Log Format

```json
{
  "timestamp": "2026-08-12T12:00:00.000Z",
  "level": "info",
  "message": "User login successful",
  "userId": "uuid",
  "ip": "192.168.1.1",
  "userAgent": "AppName/1.0 (Android 14)",
  "requestId": "req-uuid"
}
```

---

## 8. Secrets Management

### Development

```
.env file (local, git-ignored)
├── DATABASE_URL
├── JWT_ACCESS_SECRET
├── JWT_REFRESH_SECRET
├── S3_ACCESS_KEY
├── S3_SECRET_KEY
├── SMTP_PASS
└── FCM_PRIVATE_KEY
```

### Production

| Option | Suitability |
|--------|-------------|
| Environment variables (server-level) | ✅ Simple, good for Phase 1 |
| AWS Secrets Manager | Good for AWS deployments |
| HashiCorp Vault | Over-engineered for Phase 1 |
| Docker secrets | If using Docker |

**Phase 1:** Server-level environment variables, never committed to code.

---

## 9. Dependency Security

- Run `npm audit` regularly (weekly minimum)
- Pin dependency versions (exact versions, no `^` or `~`)
- Review new dependencies before adding:
  - Is it actively maintained?
  - Does it have known vulnerabilities?
  - Is it from a trusted source?
- Use `npm audit fix` for patch-level fixes
- Review breaking changes before major version bumps

---

## 10. Incident Response Plan

### If a Security Incident Occurs

| Step | Action |
|------|--------|
| 1. Detect | Monitor logs for unusual patterns (many failed logins, unusual access patterns) |
| 2. Contain | Revoke all sessions (rotate JWT secrets), block suspicious IPs |
| 3. Assess | Determine scope: what data was accessed, which users affected |
| 4. Notify | Notify affected users (if data breach confirmed) |
| 5. Fix | Patch vulnerability, deploy fix |
| 6. Review | Post-mortem, update security measures |

### Phase 1 Monitoring (Simple)

- Application logs (structured JSON)
- Failed login spike detection (basic threshold alert)
- Error rate monitoring
- Server resource monitoring (CPU, memory, disk)

No complex SIEM in Phase 1 — structured logs that can be searched if needed.

---

## 11. Privacy by Design

| Principle | Implementation |
|-----------|---------------|
| Data minimization | Only collect what's needed; all health/profile fields optional |
| Purpose limitation | Data used only for stated feature purpose |
| User control | Users can delete individual records or entire account |
| Isolation | No sharing between users (Phase 1); no analytics on personal data |
| Retention | Soft-deleted docs removed after 30 days; account deletion = immediate |
| Transparency | Privacy screen explains what data is stored and why |

---

## 12. Future Security Enhancements

Not in Phase 1, but architecture supports:

| Enhancement | When |
|-------------|------|
| Biometric lock (app open) | Phase 2 |
| Certificate pinning | Phase 2 |
| End-to-end encryption for documents | Phase 3+ |
| MFA (TOTP/SMS) | Phase 2 |
| Session management UI (active sessions) | Phase 2 |
| IP-based anomaly detection | Phase 3 |
| Field-level encryption (health data) | Phase 3 |
| SOC 2 compliance | If pursuing enterprise/healthcare |
