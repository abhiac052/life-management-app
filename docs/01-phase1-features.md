# [APP_NAME] — Phase 1 Feature List

> Document version: 1.0
> Status: ✅ Approved
> Last updated: 2026-08-12

## Architecture Decisions

| Decision | Phase 1 | Future |
|----------|---------|--------|
| Architecture | Modular monolith | Microservices if needed |
| Backend | NestJS + TypeScript | — |
| Mobile | React Native CLI + TypeScript | — |
| Database | PostgreSQL + Prisma | — |
| Storage | Abstract StorageService (local dev / S3 prod) | R2 or other |
| Notifications | Local notifications + FCM | Email, SMS |
| Search | Name/category/tags/keyword filter | Full-text, Elasticsearch |
| Family | DB schema family-ready (household_id) | Family UI, sharing |
| Auth | Email/password + JWT | Google, Apple, OTP |

---

## IN SCOPE — Phase 1

### 1. Authentication & Account

| Feature | Details |
|---------|---------|
| Sign up | Email + password |
| Login | Email + password → access token + refresh token |
| Logout | Invalidate refresh token |
| Forgot password | Email-based reset link |
| Password reset | Token-verified new password |
| Token refresh | Silent refresh via refresh token |
| Session management | Single/multi-device (configurable) |
| Account deletion | Hard delete with cascading removal of all user data |
| Secure token storage | Keychain (iOS) / Encrypted SharedPreferences (Android) |

**Out of scope:** Google Sign-In, Apple Sign-In, OTP/phone auth, MFA.

---

### 2. User Profile

| Feature | Details |
|---------|---------|
| View/edit profile | Name, email, phone (optional), avatar (optional) |
| User preferences | Notification settings, time format, reminder defaults |
| App settings | Theme preference (light/dark), language (English only Phase 1) |

**Out of scope:** Multiple profiles, family member profiles.

---

### 3. Dashboard

| Feature | Details |
|---------|---------|
| Today section | Medicines due, reminders due, appointments today |
| Upcoming section | Next 7–30 days: renewals, appointments, expiries, reminders |
| Attention required | Items needing action soon (expiring warranties, low medicine stock, document expiries) |
| Quick actions | Add Reminder, Add Medicine, Upload Document, Add Warranty, Add Vehicle, Add Appointment |
| Pull-to-refresh | Refresh dashboard data |
| Empty states | Meaningful guidance when sections are empty |
| Offline cache | Dashboard data cached locally for immediate display |

**Out of scope:** Widgets, family dashboard, analytics/statistics, AI-powered insights.

---

### 4. Universal Reminder Engine

| Feature | Details |
|---------|---------|
| Reminder types | One-time, Daily, Weekly, Monthly, Yearly, Custom recurring |
| Reminder fields | Title, description, due date/time, recurrence rule, category, linked entity (optional) |
| Actions | Complete, Skip, Snooze (15min, 30min, 1hr, custom) |
| Reminder history | Log of all actions taken on a reminder |
| Module integration | Medicines, warranties, vehicles, appointments, documents all plug into this engine |
| Local notifications | Device-scheduled for time-critical reminders |
| FCM notifications | Server-triggered for expiry warnings and attention items |
| Notification preferences | Per-category enable/disable, quiet hours |
| Start/end dates | Reminders can have bounded recurrence |

**Out of scope:** Location-based reminders, smart suggestions, shared/family reminders, complex RRULE patterns beyond basic recurrence.

---

### 5. Document Vault

| Feature | Details |
|---------|---------|
| Upload document | PDF, JPG, JPEG, PNG |
| Document fields | Name, category, description, issue date, expiry date, tags, notes, file |
| Categories | Aadhaar, PAN, Passport, Driving Licence, Insurance, Property, Education, Medical, Vehicle, Other |
| Custom tags | User-defined tags |
| View document | In-app viewer (images inline, PDF viewer) |
| Download/share | Export to device / share via OS sheet |
| Search & filter | By name, category, tags, keyword |
| Expiry reminder | Optional — links to reminder engine |
| Delete/archive | Soft delete with recovery period |
| File size limit | 10MB per file (configurable) |
| Storage quota | Defined per user (e.g., 500MB free tier) |

**Out of scope:** OCR, document scanning via camera, full-text content search, shared documents, versioning, folder hierarchy.

---

### 6. Health Profile

| Feature | Details |
|---------|---------|
| Blood group | Optional |
| Allergies | Free-text list |
| Height / Weight | Optional, single entry (not historical tracking) |
| Emergency contact | Name + phone |
| Important medical notes | Free text (e.g., "Diabetic", "Penicillin allergy") |

**Out of scope:** Health metrics history, vitals tracking, BMI calculation, health goals, health score.

---

### 7. Medicine Manager

| Feature | Details |
|---------|---------|
| Add medicine | Name, dosage, form (tablet/capsule/syrup/injection/other), frequency, instructions |
| Schedule | Morning/Afternoon/Evening/Night/Custom time, multiple times per day, specific days of week |
| Meal relation | Before food / After food / With food / No preference |
| Start/end date | Bounded or indefinite |
| Local notifications | Device-level scheduled reminders per dose |
| Dose actions | Taken, Skipped, Snoozed |
| Medicine history | Log of all dose actions with timestamps |
| Adherence view | Simple calendar/list view showing taken/skipped/missed |
| Stock tracking | Optional: current quantity, tablets per dose, doses per day, refill threshold |
| Low stock alert | "Supply may be running low" notification when threshold reached |
| Link to prescription | Optional association with a stored prescription |
| Active/inactive | Archive medicines no longer being taken |

**Out of scope:** Drug interaction warnings, medical advice, AI dosage suggestions, pharmacy integration, barcode scanning.

---

### 8. Prescription Vault

| Feature | Details |
|---------|---------|
| Add prescription | Doctor name, hospital/clinic, date, notes, file upload |
| Link to medicines | Optional association |
| View/download | Same document infrastructure as Document Vault |

**Out of scope:** OCR prescription reading, automatic medicine extraction from prescriptions.

---

### 9. Medical Reports

| Feature | Details |
|---------|---------|
| Upload report | Blood reports, X-rays, CT/MRI, vaccination records, lab reports, other |
| Report fields | Title, type, date, doctor/lab (optional), notes, file |
| Storage | Uses same StorageService as Document Vault |
| View/download | In-app viewing |

**Out of scope:** Report value tracking over time, health trends, automatic categorization.

---

### 10. Doctor & Appointment Management

| Feature | Details |
|---------|---------|
| Add doctor | Name, specialization, hospital/clinic, phone, address, notes |
| Add appointment | Doctor, date, time, purpose, notes |
| Appointment reminder | Integrated with reminder engine (default: 1 day before + 1 hour before) |
| Appointment status | Upcoming, Completed, Cancelled |
| Link to prescriptions | Optional — after appointment, user can attach prescription |

**Out of scope:** Doctor search/discovery, online booking, telemedicine, clinic integration.

---

### 11. Warranty Tracker

| Feature | Details |
|---------|---------|
| Add warranty | Product name, brand, model, purchase date, warranty duration/expiry, seller, notes |
| Invoice upload | Optional file (uses StorageService) |
| Expiry calculation | Auto-calculate from purchase date + duration |
| Expiry reminder | Integrated with reminder engine (default: 30 days, 7 days before expiry) |
| Status | Active, Expiring Soon, Expired |

**Out of scope:** Warranty claim tracking, product recall alerts, brand integrations.

---

### 12. Vehicle Management (Basic)

| Feature | Details |
|---------|---------|
| Add vehicle | Name, registration number, type (car/bike/scooter/other) |
| Tracking fields | Insurance expiry, PUC expiry, next service date, notes |
| Expiry reminders | Each date field integrates with reminder engine |
| Multiple vehicles | User can add more than one |

**Out of scope:** Fuel tracking, expense tracking, service history, repair log, mileage, tyre/battery management.

---

### 13. Notifications System

| Feature | Details |
|---------|---------|
| Local notifications | Scheduled on-device for medicines, appointments, time-critical reminders |
| FCM push | Server-triggered for expiry warnings, attention items |
| Notification preferences | Global enable/disable, per-module toggle, quiet hours |
| Notification history | In-app list of recent notifications |
| Deep linking | Tapping notification opens relevant screen |

**Out of scope:** Email notifications, SMS, in-app real-time messaging, notification grouping/channels beyond OS defaults.

---

### 14. Privacy & Data

| Feature | Details |
|---------|---------|
| Account deletion | Complete removal of all user data |
| Export-friendly schema | Data model designed so per-user extraction is straightforward |
| Data isolation | All queries scoped to authenticated user's household_id |
| Soft delete | Where appropriate (documents, reminders) with configurable retention |

**Out of scope:** Full "Export My Data" UI, GDPR compliance dashboard, data portability format (JSON/ZIP export).

---

### 15. Offline Support (Minimal)

| Feature | Details |
|---------|---------|
| Dashboard cache | TanStack Query cache for immediate display |
| Reminder cache | Locally scheduled notifications persist without network |
| Graceful degradation | Error states when network unavailable, retry on reconnection |
| Queued actions | Mark medicine as taken / skip while offline, sync on reconnect |

**Out of scope:** Full offline-first architecture, background sync service, conflict resolution.

---

## OUT OF SCOPE — Phase 1

| Category | Deferred Items |
|----------|---------------|
| Family | Multiple members, invitations, shared access, family dashboard, permission controls |
| Finance | Subscriptions, EMI, bills, insurance payments, financial obligations |
| Home | Appliance maintenance, pest control, home management |
| Advanced Vehicles | Fuel, expenses, service history, repairs |
| Advanced Health | Vitals tracking, health timeline, vaccination scheduler |
| AI | Any AI-powered feature (suggestions, insights, categorization) |
| Communication | Email notifications, SMS, in-app chat |
| Integration | Calendar sync, Google Drive, iCloud, third-party APIs |
| Monetization | Payment integration, subscription management, premium features |
| Admin | Admin panel, analytics dashboard, user management |
| Infrastructure | Microservices, Redis, Elasticsearch, Kubernetes, event bus, multiple databases |

---

## Phase 1 Module Count: 12

1. Auth
2. Profile
3. Dashboard
4. Reminder Engine
5. Document Vault
6. Health Profile
7. Medicine Manager
8. Prescriptions
9. Medical Reports
10. Doctors & Appointments
11. Warranty Tracker
12. Vehicle Management

---

## Phase 1 Success Criteria

A user should be able to:

1. Create an account and log in securely
2. See what needs attention today on the dashboard
3. Create and manage reminders for any life responsibility
4. Upload and find important documents quickly
5. Track medicines with scheduled notifications
6. Mark doses as taken/skipped and see history
7. Get warned when medicine stock is low
8. Store prescriptions and medical reports
9. Manage doctor appointments with reminders
10. Track product warranties and get expiry alerts
11. Track vehicle important dates with reminders
12. Delete their account and all associated data
