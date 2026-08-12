# [APP_NAME] — Database ER Diagram & Schema

> Document version: 1.0
> Status: 📋 Review
> Last updated: 2026-08-12

---

## 1. ER Diagram (Text-based)

```
┌─────────────┐       ┌──────────────┐       ┌─────────────────┐
│  Household  │───1:N──│     User     │───1:1──│  HealthProfile  │
└─────────────┘       └──────┬───────┘       └─────────────────┘
                             │
          ┌──────────────────┼──────────────────────┐
          │                  │                      │
     1:N  │             1:N  │                 1:N  │
          ▼                  ▼                      ▼
┌─────────────────┐  ┌──────────────┐   ┌──────────────────┐
│    Reminder     │  │   Document   │   │     Medicine     │
│                 │  │              │   │                  │
│ (Universal)     │  │  category    │   │  dosage, form    │
│ recurrence_rule │  │  file_path   │   │  meal_relation   │
│ linked_entity   │  │  expiry_date │   │                  │
└────────┬────────┘  └──────────────┘   └────────┬─────────┘
         │                                       │
    1:N  │                               ┌───────┼───────┐
         ▼                               │       │       │
┌─────────────────┐              1:N     │  1:N  │  1:1  │
│ ReminderAction  │                      ▼       ▼       ▼
│                 │         ┌────────────────┐ ┌──────────────┐
│ complete/skip/  │         │ MedicineSchedule│ │ MedicineStock│
│ snooze          │         │                │ └──────────────┘
└─────────────────┘         │ time, days     │
                            └────────────────┘
                                     │
                                1:N  │
                                     ▼
                            ┌────────────────┐
                            │  MedicineDose  │
                            │                │
                            │ taken/skipped/ │
                            │ missed         │
                            └────────────────┘

┌──────────────┐       ┌───────────────────┐       ┌──────────────┐
│    Doctor    │───1:N──│   Appointment     │───0:1──│ Prescription │
└──────────────┘       └───────────────────┘       └──────┬───────┘
                                                          │
                                                     0:N  │
                                                          ▼
                                                   ┌──────────────┐
                                                   │MedicalReport │
                                                   └──────────────┘

┌──────────────┐       ┌──────────────┐
│   Warranty   │       │   Vehicle    │
│              │       │              │
│ purchase_date│       │ insurance_exp│
│ expiry_date  │       │ puc_expiry   │
│ invoice_path │       │ service_date │
└──────────────┘       └──────────────┘

┌──────────────────┐       ┌──────────────────┐
│  DeviceToken     │       │   Notification   │
│                  │       │                  │
│ fcm_token        │       │  title, body     │
│ platform         │       │  type, read      │
└──────────────────┘       └──────────────────┘

┌──────────────────┐
│ UserPreference   │
│                  │
│ notification_*   │
│ theme, format    │
└──────────────────┘
```

---

## 2. Entity Relationships Summary

| Relationship | Type | Description |
|-------------|------|-------------|
| Household → User | 1:N | A household has one or more users (Phase 1: always 1) |
| User → HealthProfile | 1:1 | One health profile per user |
| User → Reminder | 1:N | User owns many reminders |
| User → Document | 1:N | User owns many documents |
| User → Medicine | 1:N | User owns many medicines |
| Medicine → MedicineSchedule | 1:N | Medicine can have multiple schedule times |
| Medicine → MedicineStock | 1:1 | Optional stock tracking per medicine |
| MedicineSchedule → MedicineDose | 1:N | Each schedule generates dose logs |
| User → Doctor | 1:N | User can save multiple doctors |
| Doctor → Appointment | 1:N | Doctor has many appointments |
| User → Appointment | 1:N | User has many appointments |
| Appointment → Prescription | 0:1 | Appointment may have a linked prescription |
| User → Prescription | 1:N | User owns many prescriptions |
| Prescription → Medicine | N:M | Prescription linked to medicines (join table) |
| User → MedicalReport | 1:N | User owns many reports |
| User → Warranty | 1:N | User owns many warranties |
| User → Vehicle | 1:N | User owns many vehicles |
| User → DeviceToken | 1:N | User can have multiple devices |
| User → Notification | 1:N | User has notification history |
| User → UserPreference | 1:1 | One preference set per user |
| Reminder → linked entity | Polymorphic | Reminder can link to medicine, warranty, vehicle, document, appointment |

---

## 3. Complete Prisma Schema

```prisma
// ============================================================
// [APP_NAME] Database Schema — Phase 1
// PostgreSQL + Prisma
// ============================================================

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================
// CORE: Household & User
// ============================================================

model Household {
  id        String   @id @default(uuid())
  name      String?  // Optional household name (for future family feature)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  users User[]

  @@map("households")
}

model User {
  id           String   @id @default(uuid())
  householdId  String
  email        String   @unique
  passwordHash String
  name         String
  phone        String?
  avatarUrl    String?
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  household     Household      @relation(fields: [householdId], references: [id])
  healthProfile HealthProfile?
  preference    UserPreference?
  reminders     Reminder[]
  documents     Document[]
  medicines     Medicine[]
  doctors       Doctor[]
  appointments  Appointment[]
  prescriptions Prescription[]
  medicalReports MedicalReport[]
  warranties    Warranty[]
  vehicles      Vehicle[]
  deviceTokens  DeviceToken[]
  notifications Notification[]
  refreshTokens RefreshToken[]

  @@index([householdId])
  @@index([email])
  @@map("users")
}

model RefreshToken {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  revokedAt DateTime?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
  @@map("refresh_tokens")
}

// ============================================================
// HEALTH: Profile
// ============================================================

model HealthProfile {
  id              String   @id @default(uuid())
  userId          String   @unique
  bloodGroup      String?  // A+, A-, B+, B-, AB+, AB-, O+, O-
  allergies       String[] // Array of allergy strings
  heightCm        Float?
  weightKg        Float?
  emergencyName   String?
  emergencyPhone  String?
  medicalNotes    String?  // Free-text important medical info
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("health_profiles")
}

// ============================================================
// REMINDER ENGINE (Universal)
// ============================================================

enum ReminderStatus {
  ACTIVE
  COMPLETED
  SNOOZED
  CANCELLED
}

enum RecurrenceType {
  ONCE
  DAILY
  WEEKLY
  MONTHLY
  YEARLY
  CUSTOM
}

enum LinkedEntityType {
  MEDICINE
  WARRANTY
  VEHICLE
  DOCUMENT
  APPOINTMENT
  NONE
}

model Reminder {
  id              String           @id @default(uuid())
  userId          String
  title           String
  description     String?
  category        String?          // "health", "documents", "vehicle", etc.
  
  // Schedule
  dueDate         DateTime         // Next due date/time
  recurrenceType  RecurrenceType   @default(ONCE)
  recurrenceRule  Json?            // { interval: 1, daysOfWeek: [1,3,5], endDate: "..." }
  startDate       DateTime
  endDate         DateTime?
  
  // Notification
  notifyBefore    Int[]            @default([0]) // Minutes before due (0 = at due time)
  
  // Status
  status          ReminderStatus   @default(ACTIVE)
  completedAt     DateTime?
  snoozedUntil    DateTime?
  
  // Linked entity (polymorphic)
  linkedEntityType LinkedEntityType @default(NONE)
  linkedEntityId   String?
  
  // Metadata
  isSystemGenerated Boolean        @default(false) // Auto-created by modules
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  user    User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  actions ReminderAction[]

  @@index([userId, status])
  @@index([userId, dueDate])
  @@index([dueDate, status])
  @@index([linkedEntityType, linkedEntityId])
  @@map("reminders")
}

model ReminderAction {
  id         String   @id @default(uuid())
  reminderId String
  action     String   // "completed", "skipped", "snoozed", "dismissed"
  note       String?
  snoozedTo  DateTime?
  performedAt DateTime @default(now())

  reminder Reminder @relation(fields: [reminderId], references: [id], onDelete: Cascade)

  @@index([reminderId])
  @@map("reminder_actions")
}

// ============================================================
// DOCUMENT VAULT
// ============================================================

enum DocumentCategory {
  AADHAAR
  PAN
  PASSPORT
  DRIVING_LICENCE
  INSURANCE
  PROPERTY
  EDUCATION
  MEDICAL
  VEHICLE
  OTHER
}

model Document {
  id          String           @id @default(uuid())
  userId      String
  name        String
  category    DocumentCategory
  description String?
  issueDate   DateTime?
  expiryDate  DateTime?
  tags        String[]         // Array of tag strings
  notes       String?
  
  // File info
  fileName    String           // Original file name
  filePath    String           // Storage path (key)
  fileSize    Int              // Bytes
  mimeType    String           // "application/pdf", "image/jpeg", etc.
  
  // Soft delete
  deletedAt   DateTime?
  
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, category])
  @@index([userId, deletedAt])
  @@index([userId, name])
  @@map("documents")
}

// ============================================================
// MEDICINE
// ============================================================

enum MedicineForm {
  TABLET
  CAPSULE
  SYRUP
  INJECTION
  DROPS
  INHALER
  CREAM
  OTHER
}

enum MealRelation {
  BEFORE_FOOD
  AFTER_FOOD
  WITH_FOOD
  NO_PREFERENCE
}

model Medicine {
  id           String       @id @default(uuid())
  userId       String
  name         String
  dosage       String       // "5mg", "10ml", etc.
  form         MedicineForm
  mealRelation MealRelation @default(NO_PREFERENCE)
  instructions String?
  notes        String?
  startDate    DateTime
  endDate      DateTime?    // null = indefinite
  isActive     Boolean      @default(true)
  
  // Prescription link (optional)
  prescriptionId String?
  
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  user         User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  prescription Prescription?       @relation(fields: [prescriptionId], references: [id], onDelete: SetNull)
  schedules    MedicineSchedule[]
  stock        MedicineStock?

  @@index([userId, isActive])
  @@map("medicines")
}

model MedicineSchedule {
  id         String   @id @default(uuid())
  medicineId String
  time       String   // "08:00", "14:00", "21:00" (HH:mm format)
  label      String?  // "Morning", "Afternoon", "Evening", "Night"
  daysOfWeek Int[]    // [1,2,3,4,5,6,7] = Mon-Sun; empty = every day
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  medicine Medicine       @relation(fields: [medicineId], references: [id], onDelete: Cascade)
  doses    MedicineDose[]

  @@index([medicineId])
  @@map("medicine_schedules")
}

model MedicineDose {
  id         String   @id @default(uuid())
  scheduleId String
  userId     String   // Denormalized for efficient queries
  
  scheduledAt DateTime  // When the dose was supposed to be taken
  action      String    // "taken", "skipped", "missed"
  actionAt    DateTime? // When the action was performed
  note        String?
  
  createdAt  DateTime @default(now())

  schedule MedicineSchedule @relation(fields: [scheduleId], references: [id], onDelete: Cascade)

  @@index([scheduleId, scheduledAt])
  @@index([userId, scheduledAt])
  @@map("medicine_doses")
}

model MedicineStock {
  id             String  @id @default(uuid())
  medicineId     String  @unique
  currentQty     Int     // Current tablets/units remaining
  unitsPerDose   Int     @default(1)
  dosesPerDay    Int     @default(1)
  refillThreshold Int    @default(7) // Alert when qty falls to this
  lastUpdated    DateTime @default(now())

  medicine Medicine @relation(fields: [medicineId], references: [id], onDelete: Cascade)

  @@map("medicine_stocks")
}

// ============================================================
// PRESCRIPTION & MEDICAL REPORTS
// ============================================================

model Prescription {
  id         String   @id @default(uuid())
  userId     String
  doctorName String
  clinicName String?
  date       DateTime
  notes      String?
  
  // File
  fileName   String?
  filePath   String?
  fileSize   Int?
  mimeType   String?
  
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  medicines Medicine[]

  @@index([userId])
  @@map("prescriptions")
}

enum MedicalReportType {
  BLOOD_TEST
  XRAY
  CT_SCAN
  MRI
  ULTRASOUND
  ECG
  VACCINATION
  LAB_REPORT
  OTHER
}

model MedicalReport {
  id         String            @id @default(uuid())
  userId     String
  title      String
  type       MedicalReportType
  date       DateTime
  doctorLab  String?           // Doctor or lab name
  notes      String?
  
  // File
  fileName   String
  filePath   String
  fileSize   Int
  mimeType   String
  
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, type])
  @@index([userId, date])
  @@map("medical_reports")
}

// ============================================================
// DOCTOR & APPOINTMENT
// ============================================================

model Doctor {
  id             String  @id @default(uuid())
  userId         String
  name           String
  specialization String?
  hospital       String? // Hospital/clinic name
  phone          String?
  address        String?
  notes          String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  appointments Appointment[]

  @@index([userId])
  @@map("doctors")
}

enum AppointmentStatus {
  UPCOMING
  COMPLETED
  CANCELLED
}

model Appointment {
  id       String            @id @default(uuid())
  userId   String
  doctorId String?
  
  doctorName String          // Denormalized — in case doctor is deleted
  date       DateTime
  time       String          // "10:30" (HH:mm)
  purpose    String?
  notes      String?
  status     AppointmentStatus @default(UPCOMING)
  
  // Link to prescription (added after appointment)
  prescriptionId String?
  
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  user   User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  doctor Doctor? @relation(fields: [doctorId], references: [id], onDelete: SetNull)

  @@index([userId, status])
  @@index([userId, date])
  @@map("appointments")
}

// ============================================================
// WARRANTY
// ============================================================

model Warranty {
  id           String   @id @default(uuid())
  userId       String
  productName  String
  brand        String?
  model        String?
  purchaseDate DateTime
  expiryDate   DateTime
  seller       String?
  notes        String?
  
  // Invoice file (optional)
  invoiceFileName String?
  invoiceFilePath String?
  invoiceFileSize Int?
  invoiceMimeType String?
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, expiryDate])
  @@map("warranties")
}

// ============================================================
// VEHICLE
// ============================================================

enum VehicleType {
  CAR
  BIKE
  SCOOTER
  OTHER
}

model Vehicle {
  id               String      @id @default(uuid())
  userId           String
  name             String
  type             VehicleType
  registrationNo   String?
  insuranceExpiry  DateTime?
  pucExpiry        DateTime?
  nextServiceDate  DateTime?
  notes            String?
  createdAt        DateTime    @default(now())
  updatedAt        DateTime    @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("vehicles")
}

// ============================================================
// NOTIFICATIONS & DEVICE
// ============================================================

enum Platform {
  IOS
  ANDROID
}

model DeviceToken {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  platform  Platform
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("device_tokens")
}

model Notification {
  id        String   @id @default(uuid())
  userId    String
  title     String
  body      String
  type      String   // "medicine_dose", "reminder_due", "expiry_warning", etc.
  data      Json?    // Metadata for deep linking { entityType, entityId, screen }
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead])
  @@index([userId, createdAt])
  @@map("notifications")
}

// ============================================================
// USER PREFERENCES
// ============================================================

model UserPreference {
  id     String @id @default(uuid())
  userId String @unique
  
  // Notification preferences
  notificationsEnabled Boolean @default(true)
  medicinePush         Boolean @default(true)
  appointmentPush      Boolean @default(true)
  reminderPush         Boolean @default(true)
  warrantyPush         Boolean @default(true)
  vehiclePush          Boolean @default(true)
  documentPush         Boolean @default(true)
  
  // Quiet hours
  quietHoursEnabled    Boolean @default(false)
  quietHoursStart      String? // "22:00"
  quietHoursEnd        String? // "07:00"
  
  // App preferences
  theme                String  @default("system") // "light", "dark", "system"
  timeFormat           String  @default("12h")    // "12h", "24h"
  defaultReminderTime  String  @default("09:00")  // Default time for new reminders
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_preferences")
}
```

---

## 4. Design Decisions

### 4.1 UUID Primary Keys

All entities use UUID v4 primary keys instead of auto-increment integers.

**Rationale:**
- No information leakage (can't guess next ID or total count)
- Safe for client-side generation (offline support)
- No conflicts in future distributed scenarios
- No sequential enumeration attacks

### 4.2 Household Architecture

Every user belongs to a `Household`. In Phase 1, each user gets their own household (1:1). In the future, multiple users can share a household for family features.

All data queries will be scoped to `userId` (not `householdId`) in Phase 1. The household exists purely as forward-looking schema.

### 4.3 Polymorphic Reminder Links

Reminders use `linkedEntityType` + `linkedEntityId` to reference any entity. This avoids needing a separate reminder table for each module.

```
Reminder {
  linkedEntityType: "VEHICLE"
  linkedEntityId: "uuid-of-vehicle"
}
```

The trade-off is no foreign key constraint on `linkedEntityId`. Data integrity is enforced at the application layer.

### 4.4 Denormalized Fields

Some fields are intentionally denormalized:
- `Appointment.doctorName` — preserved even if doctor record is deleted
- `MedicineDose.userId` — avoids join through schedule+medicine for dose queries

### 4.5 Soft Delete

Only `Document` has soft delete (`deletedAt` field) because:
- Documents are high-value (accidental deletion is costly)
- 30-day recovery window provides safety

Other entities use hard delete (with cascading) because:
- Simpler queries
- Account deletion is cleaner
- Less storage waste

### 4.6 Array Fields

PostgreSQL natively supports arrays. Used for:
- `HealthProfile.allergies` — simple string list
- `Document.tags` — user-defined tags
- `MedicineSchedule.daysOfWeek` — day selection
- `Reminder.notifyBefore` — multiple notification times

This avoids unnecessary join tables for simple lists.

### 4.7 JSON Fields

Used sparingly for flexible structured data:
- `Reminder.recurrenceRule` — complex recurrence patterns that vary by type
- `Notification.data` — deep link metadata (varies by notification type)

---

## 5. Indexes Strategy

| Table | Index | Purpose |
|-------|-------|---------|
| users | email | Login lookup |
| users | householdId | Future: household queries |
| reminders | userId + status | Active reminders for user |
| reminders | userId + dueDate | Upcoming reminders |
| reminders | dueDate + status | Cron: find due reminders |
| documents | userId + category | Filter by category |
| documents | userId + deletedAt | Exclude soft-deleted |
| documents | userId + name | Search by name |
| medicines | userId + isActive | Active medicines list |
| medicine_doses | userId + scheduledAt | Dashboard: today's doses |
| medicine_doses | scheduleId + scheduledAt | History for specific schedule |
| appointments | userId + status | Upcoming appointments |
| appointments | userId + date | Calendar view |
| warranties | userId + expiryDate | Expiry queries |
| notifications | userId + isRead | Unread count |
| notifications | userId + createdAt | History feed |
| refresh_tokens | token | Token validation |

---

## 6. Data Size Estimates (Phase 1 — per user)

| Entity | Estimated records/user | Size/record |
|--------|----------------------|-------------|
| Reminders | 10-50 | ~500 bytes |
| Documents | 5-30 | ~300 bytes (metadata only) |
| Medicines | 3-10 | ~400 bytes |
| MedicineDoses | 30-300/month | ~200 bytes |
| Appointments | 2-10/year | ~300 bytes |
| Prescriptions | 5-20 | ~300 bytes |
| MedicalReports | 5-20 | ~300 bytes |
| Warranties | 5-20 | ~300 bytes |
| Vehicles | 1-5 | ~300 bytes |
| Notifications | 100-500/year | ~250 bytes |

**At 1000 users:** ~50MB of structured data + file storage (varies).

PostgreSQL handles this trivially.

---

## 7. Migration Strategy

- Prisma handles migrations via `prisma migrate`
- Each migration is versioned and tracked
- Development: `prisma migrate dev`
- Production: `prisma migrate deploy`
- Never modify a deployed migration — create a new one

---

## 8. Backup & Recovery

Phase 1:
- Daily automated PostgreSQL dumps (pg_dump)
- Store backups in separate storage (not same disk)
- Test restore procedure monthly

Future:
- Point-in-time recovery (PITR)
- Managed database (RDS/Supabase) with automated backups
