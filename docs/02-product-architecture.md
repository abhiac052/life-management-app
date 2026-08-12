# [APP_NAME] — Product Architecture

> Document version: 1.0
> Status: 📋 Review
> Last updated: 2026-08-12

---

## 1. High-Level System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        MOBILE CLIENT                             │
│                   React Native CLI + TypeScript                  │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ TanStack │  │  Zustand  │  │   React  │  │    Local     │   │
│  │  Query   │  │  (Client  │  │   Hook   │  │ Notifications│   │
│  │ (Server) │  │   State)  │  │   Form   │  │  Scheduler   │   │
│  └────┬─────┘  └──────────┘  └──────────┘  └──────────────┘   │
│       │                                                          │
│       │  HTTPS / REST                                            │
└───────┼──────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND API                               │
│                    NestJS + TypeScript                           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    API Gateway Layer                       │   │
│  │         (Auth Guard, Validation, Rate Limiting)           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │   Auth   │  │ Reminder │  │ Document │  │   Health     │   │
│  │  Module  │  │  Module  │  │  Module  │  │   Module     │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ Medicine │  │ Warranty │  │ Vehicle  │  │  Dashboard   │   │
│  │  Module  │  │  Module  │  │  Module  │  │   Module     │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
│                              │                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  Shared Services Layer                     │   │
│  │   StorageService │ NotificationService │ ReminderEngine   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Prisma ORM Layer                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌──────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  PostgreSQL  │    │  Object Storage  │    │  Firebase Cloud  │
│  (Database)  │    │  (S3-compatible) │    │   Messaging      │
└──────────────┘    └──────────────────┘    └──────────────────┘
```

---

## 2. Architecture Style: Modular Monolith

### Why Modular Monolith?

| Concern | Decision |
|---------|----------|
| Complexity | Single deployable unit — simple DevOps |
| Cost | One server, one database — minimal infrastructure |
| Developer experience | One codebase, one `npm start`, instant feedback |
| Module isolation | NestJS modules provide clear boundaries |
| Future scalability | Modules can be extracted to services IF needed |

### Module Rules

1. Each module owns its own controllers, services, and DTOs
2. Modules communicate through well-defined service interfaces (not direct DB queries across boundaries)
3. Shared infrastructure (storage, notifications, reminders) lives in a `shared/` module
4. No circular dependencies between modules
5. The Reminder Engine is a shared service that other modules consume

---

## 3. Backend Architecture (NestJS)

### Layer Structure

```
Request → Controller → Service → Repository (Prisma) → Database
                          │
                          ├── StorageService (for file operations)
                          ├── NotificationService (for FCM)
                          └── ReminderService (for scheduled reminders)
```

### Layer Responsibilities

| Layer | Responsibility |
|-------|---------------|
| Controller | HTTP handling, request validation, response formatting |
| Service | Business logic, orchestration, authorization checks |
| Repository | Data access via Prisma (thin wrapper where needed) |
| Guard | Authentication & authorization |
| Interceptor | Response transformation, logging |
| Pipe | Input validation & transformation |

### Cross-Cutting Concerns

| Concern | Implementation |
|---------|---------------|
| Authentication | JWT Guard (access token validation) |
| Authorization | User-scoped data access (household_id filtering) |
| Validation | class-validator + class-transformer via ValidationPipe |
| Error handling | Global exception filter with consistent error format |
| Logging | NestJS Logger (structured, no sensitive data) |
| Rate limiting | @nestjs/throttler |
| CORS | Configured per environment |

---

## 4. Mobile Architecture (React Native)

### State Management Strategy

```
┌─────────────────────────────────────────────────┐
│                  React Native App                │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │            UI Layer (Screens)               │ │
│  └──────────────────┬─────────────────────────┘ │
│                     │                            │
│  ┌──────────────────┼─────────────────────────┐ │
│  │          State Management Layer             │ │
│  │                                             │ │
│  │  Server State: TanStack Query               │ │
│  │  ├── Caching                                │ │
│  │  ├── Background refetch                     │ │
│  │  ├── Optimistic updates                     │ │
│  │  └── Offline support                        │ │
│  │                                             │ │
│  │  Client State: Zustand                      │ │
│  │  ├── Auth state (tokens, user)              │ │
│  │  ├── UI state (modals, theme)               │ │
│  │  └── Notification preferences               │ │
│  │                                             │ │
│  │  Form State: React Hook Form                │ │
│  │  ├── Validation (Zod)                       │ │
│  │  └── Per-form, no global pollution          │ │
│  └─────────────────────────────────────────────┘ │
│                     │                            │
│  ┌──────────────────┼─────────────────────────┐ │
│  │            Service Layer                    │ │
│  │  ├── API client (Axios + interceptors)      │ │
│  │  ├── Storage service (secure + async)       │ │
│  │  ├── Notification service                   │ │
│  │  └── Analytics (future)                     │ │
│  └─────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

### Key Mobile Patterns

| Pattern | Usage |
|---------|-------|
| Feature-based folders | Each module is self-contained |
| Container/Presentational | Separate logic from UI |
| Custom hooks | Reusable logic extraction |
| API layer abstraction | All HTTP calls in service files |
| Secure storage | Tokens in Keychain/EncryptedSharedPrefs |
| Type-safe navigation | Typed React Navigation params |

---

## 5. Data Flow Architecture

### Server State Flow (Read)

```
Screen mounts
    → useQuery hook fires
    → TanStack Query checks cache
    → If stale: API call → Backend → Database → Response
    → Cache updated → UI re-renders
```

### Server State Flow (Write)

```
User action (form submit)
    → useMutation hook fires
    → Optimistic update (optional)
    → API call → Backend validates → Database write → Response
    → Invalidate related queries → UI re-renders
```

### Notification Flow (Local — Medicines)

```
User creates medicine schedule
    → Mobile app calculates next dose times
    → Schedules local notifications on device
    → At scheduled time: device fires notification
    → User taps → app opens → mark Taken/Skip
    → Sync action to backend
```

### Notification Flow (Server — Expiry Alerts)

```
Backend cron job (daily)
    → Scans reminders table for upcoming due items
    → Identifies items needing notification
    → Sends FCM push via Firebase Admin SDK
    → Device receives push → shows notification
    → User taps → app opens to relevant screen
```

---

## 6. Shared Services Architecture

### StorageService

```typescript
interface StorageService {
  upload(file: Buffer, path: string, metadata: FileMetadata): Promise<StorageResult>;
  getSignedUrl(path: string, expiresIn: number): Promise<string>;
  delete(path: string): Promise<void>;
  getMetadata(path: string): Promise<FileMetadata>;
}
```

Implementations:
- `LocalStorageService` — development (files on disk)
- `S3StorageService` — production (any S3-compatible provider)

### NotificationService

```typescript
interface NotificationService {
  sendPush(userId: string, payload: NotificationPayload): Promise<void>;
  sendBulkPush(userIds: string[], payload: NotificationPayload): Promise<void>;
  registerDevice(userId: string, token: string, platform: Platform): Promise<void>;
  unregisterDevice(userId: string, token: string): Promise<void>;
}
```

### ReminderEngine

```typescript
interface ReminderEngine {
  createReminder(data: CreateReminderDto): Promise<Reminder>;
  updateReminder(id: string, data: UpdateReminderDto): Promise<Reminder>;
  deleteReminder(id: string): Promise<void>;
  getUpcoming(userId: string, range: DateRange): Promise<Reminder[]>;
  markComplete(id: string): Promise<void>;
  markSkipped(id: string): Promise<void>;
  snooze(id: string, duration: SnoozeDuration): Promise<void>;
  getDueReminders(timestamp: Date): Promise<Reminder[]>; // For cron job
}
```

---

## 7. Communication Patterns

| From → To | Method |
|-----------|--------|
| Mobile → Backend | REST API over HTTPS |
| Backend → Mobile | FCM Push Notifications |
| Backend → Database | Prisma ORM |
| Backend → Storage | StorageService interface |
| Backend → FCM | Firebase Admin SDK |
| Module → Reminder Engine | Service injection (DI) |
| Mobile → Local Notifications | React Native notification library |

---

## 8. Environment Strategy

| Environment | Database | Storage | API URL | FCM |
|-------------|----------|---------|---------|-----|
| Development | Local PostgreSQL | Local filesystem | localhost:3000 | Test FCM project |
| Staging | Cloud PostgreSQL | S3-compatible bucket | staging.api.* | Staging FCM project |
| Production | Cloud PostgreSQL | S3-compatible bucket | api.* | Production FCM project |

---

## 9. Deployment Architecture (Phase 1 — Simple)

```
┌────────────────────────────────────────┐
│           Single VPS / Cloud Instance  │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │  NestJS Application (PM2)       │  │
│  │  Port 3000                      │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │  PostgreSQL                     │  │
│  │  Port 5432                      │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │  Nginx (Reverse Proxy + SSL)    │  │
│  │  Port 443                       │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
         │
         ▼
┌──────────────────┐
│  S3-compatible   │
│  Object Storage  │
│  (External)      │
└──────────────────┘
```

**Phase 1 deployment goal:** One server, minimal cost, easy to manage.

**Scale-up path (future):** Managed database (RDS/Supabase), container deployment (Docker), load balancer, CDN for assets.

---

## 10. Key Architectural Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Modular monolith over microservices | Single developer/small team, minimize infrastructure complexity |
| 2 | NestJS over Express | Built-in DI, modules, guards, interceptors — better for structured app |
| 3 | Prisma over TypeORM/Sequelize | Type-safe, excellent DX, schema-as-code, good migrations |
| 4 | TanStack Query over Redux for server state | Purpose-built for server state, eliminates boilerplate |
| 5 | Zustand over Redux for client state | Minimal boilerplate, no actions/reducers for simple state |
| 6 | Abstract StorageService | Provider flexibility, testability, no vendor lock-in |
| 7 | Local + FCM dual notification strategy | Reliability for time-critical items, server control for others |
| 8 | household_id on all data tables | Future family support without schema migration |
| 9 | REST over GraphQL | Simpler for CRUD-heavy app, easier caching, team familiarity |
| 10 | Single PostgreSQL database | Cost-effective, ACID compliance, sufficient for Phase 1 scale |

---

## 11. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| API response time | < 200ms for reads, < 500ms for writes |
| Mobile cold start | < 3 seconds |
| Notification delivery | Local: exact time ± 1 min; FCM: within 5 min of trigger |
| File upload | Up to 10MB, < 10 seconds on 4G |
| Availability | 99.5% uptime (single server, no HA in Phase 1) |
| Data isolation | Zero cross-user data leakage |
| Concurrent users | Support up to 1000 concurrent (Phase 1 target) |
