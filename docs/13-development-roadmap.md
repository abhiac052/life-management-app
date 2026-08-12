# [APP_NAME] — Development Roadmap

> Document version: 1.0
> Status: 📋 Review
> Last updated: 2026-08-12

---

## 1. Implementation Strategy

Build the system **bottom-up, module by module**:
1. Infrastructure first (project setup, database, auth)
2. Core shared services (storage, notifications)
3. Feature modules (one at a time, fully working)
4. Integration (dashboard pulls from all modules)
5. Polish (offline support, error handling, testing)

Each module should be **independently functional** before moving to the next.

---

## 2. Phase 1 Sprint Breakdown

### Sprint 1: Foundation (Week 1-2)

**Goal:** Both projects running locally, auth flow working end-to-end.

| # | Task | Project |
|---|------|---------|
| 1 | Initialize NestJS project with TypeScript | Backend |
| 2 | Configure Prisma + PostgreSQL connection | Backend |
| 3 | Set up project structure (modules, common, shared) | Backend |
| 4 | Implement global exception filter, response interceptor, validation pipe | Backend |
| 5 | Create database schema + run first migration | Backend |
| 6 | Implement Auth module (register, login, refresh, logout) | Backend |
| 7 | Implement forgot password + reset password | Backend |
| 8 | Set up rate limiting (@nestjs/throttler) | Backend |
| 9 | Initialize React Native CLI project (no Expo) | Mobile |
| 10 | Configure React Navigation (all stacks scaffolded) | Mobile |
| 11 | Set up Axios instance with interceptors | Mobile |
| 12 | Set up Zustand auth store + secure storage | Mobile |
| 13 | Build Auth screens (Welcome, Login, Register, Forgot Password) | Mobile |
| 14 | Implement token refresh interceptor | Mobile |
| 15 | E2E test: Register → Login → Refresh → Logout | Both |

**Deliverable:** User can create account, login, and maintain a session.

---

### Sprint 2: Profile & Core Services (Week 3)

**Goal:** User profile working, shared storage service ready.

| # | Task | Project |
|---|------|---------|
| 1 | Implement Profile module (CRUD, change password) | Backend |
| 2 | Implement UserPreference module | Backend |
| 3 | Implement StorageService (interface + local implementation) | Backend |
| 4 | Implement email service (for password reset) | Backend |
| 5 | Build Profile screens (view, edit, settings, change password) | Mobile |
| 6 | Build Notification Settings screen | Mobile |
| 7 | Set up TanStack Query with auth-aware configuration | Mobile |
| 8 | Build shared components (Button, Input, Card, EmptyState, LoadingSkeleton) | Mobile |
| 9 | Set up theme system (colors, typography, spacing) | Mobile |
| 10 | Implement account deletion (backend + mobile) | Both |

**Deliverable:** Complete profile management, core UI component library ready.

---

### Sprint 3: Reminder Engine (Week 4)

**Goal:** Universal reminder engine working with custom reminders.

| # | Task | Project |
|---|------|---------|
| 1 | Implement Reminder CRUD service | Backend |
| 2 | Implement recurrence calculation (next occurrence) | Backend |
| 3 | Implement reminder actions (complete, skip, snooze) | Backend |
| 4 | Implement ReminderSchedulerService (cron for due reminders) | Backend |
| 5 | Set up Firebase Admin SDK for FCM | Backend |
| 6 | Implement NotificationSender service | Backend |
| 7 | Implement Device Token registration endpoint | Backend |
| 8 | Set up @notifee/react-native for local notifications | Mobile |
| 9 | Build Reminder screens (list, detail, create, edit) | Mobile |
| 10 | Build RecurrencePicker component | Mobile |
| 11 | Implement local notification scheduling for reminders | Mobile |
| 12 | Implement FCM token registration on login | Mobile |
| 13 | Test: Create reminder → notification fires → complete | Both |

**Deliverable:** Users can create, receive, and act on reminders.

---

### Sprint 4: Document Vault (Week 5)

**Goal:** Upload, view, and manage documents.

| # | Task | Project |
|---|------|---------|
| 1 | Implement Document module (CRUD + upload) | Backend |
| 2 | Implement file validation (type, size, magic bytes) | Backend |
| 3 | Implement signed URL generation | Backend |
| 4 | Implement storage quota checking | Backend |
| 5 | Implement soft delete + restore | Backend |
| 6 | Wire document expiry to reminder engine | Backend |
| 7 | Build Vault screens (home, detail, create, viewer) | Mobile |
| 8 | Build FileUploader component (camera/gallery/files picker) | Mobile |
| 9 | Build DocumentViewer (PDF + image viewing) | Mobile |
| 10 | Build CategoryFilter + SearchBar for vault | Mobile |
| 11 | Test: Upload → View → Share → Delete → Restore | Both |

**Deliverable:** Functional document vault with upload, view, search.

---

### Sprint 5: Medicine Manager (Week 6-7)

**Goal:** Full medicine management with scheduling and dose tracking.

| # | Task | Project |
|---|------|---------|
| 1 | Implement Medicine module (CRUD) | Backend |
| 2 | Implement MedicineSchedule management | Backend |
| 3 | Implement dose logging endpoint | Backend |
| 4 | Implement adherence calculation | Backend |
| 5 | Implement MedicineStock service (tracking + low stock detection) | Backend |
| 6 | Implement GET /medicines/today endpoint | Backend |
| 7 | Build Medicine screens (list, detail, create multi-step, edit, history) | Mobile |
| 8 | Build DoseActionCard component (Taken/Skip/Snooze) | Mobile |
| 9 | Build AdherenceCalendar component | Mobile |
| 10 | Build StockIndicator component | Mobile |
| 11 | Implement local notification scheduling for medicine doses | Mobile |
| 12 | Implement dose action from notification | Mobile |
| 13 | Implement offline dose tracking (queue + sync) | Mobile |
| 14 | Test: Create medicine → Receive notification → Take → Check history | Both |

**Deliverable:** Complete medicine tracking with notifications and adherence view.

---

### Sprint 6: Health Module (Week 8)

**Goal:** Health profile, prescriptions, medical reports, doctors, appointments.

| # | Task | Project |
|---|------|---------|
| 1 | Implement HealthProfile module (GET/PUT) | Backend |
| 2 | Implement Prescription module (CRUD + file upload) | Backend |
| 3 | Implement MedicalReport module (CRUD + file upload) | Backend |
| 4 | Implement Doctor module (CRUD) | Backend |
| 5 | Implement Appointment module (CRUD + status transitions) | Backend |
| 6 | Wire appointment reminders to reminder engine | Backend |
| 7 | Build HealthHome screen | Mobile |
| 8 | Build HealthProfile edit screen | Mobile |
| 9 | Build Prescription screens (list, detail, create) | Mobile |
| 10 | Build MedicalReport screens (list, detail, create) | Mobile |
| 11 | Build Doctor screens (list, detail, create) | Mobile |
| 12 | Build Appointment screens (list, detail, create) | Mobile |
| 13 | Schedule local notifications for appointments | Mobile |
| 14 | Test: Full health workflow — appointment → prescription → medicine | Both |

**Deliverable:** Complete health module with all sub-features.

---

### Sprint 7: Warranties & Vehicles (Week 9)

**Goal:** Warranty tracking and basic vehicle management.

| # | Task | Project |
|---|------|---------|
| 1 | Implement Warranty module (CRUD + invoice upload) | Backend |
| 2 | Implement expiry calculation (purchase date + duration) | Backend |
| 3 | Wire warranty expiry to reminder engine | Backend |
| 4 | Implement Vehicle module (CRUD) | Backend |
| 5 | Wire vehicle dates (insurance, PUC, service) to reminder engine | Backend |
| 6 | Build Warranty screens (list, detail, create, edit) | Mobile |
| 7 | Build ExpiryCountdown component | Mobile |
| 8 | Build Vehicle screens (list, detail, create, edit) | Mobile |
| 9 | Build ManageHome screen (summary of reminders + warranties + vehicles) | Mobile |
| 10 | Test: Add warranty → Expiry notification → View | Both |
| 11 | Test: Add vehicle → All reminders created → Notification | Both |

**Deliverable:** Warranty and vehicle tracking with automatic expiry reminders.

---

### Sprint 8: Dashboard & Notifications (Week 10)

**Goal:** Dashboard aggregation, notification system, everything connected.

| # | Task | Project |
|---|------|---------|
| 1 | Implement Dashboard endpoint (aggregates all modules) | Backend |
| 2 | Implement Notification module (CRUD, read/unread, count) | Backend |
| 3 | Implement daily expiry check cron (warranties, vehicles, documents) | Backend |
| 4 | Build Dashboard screen (today, attention, upcoming, quick actions) | Mobile |
| 5 | Build NotificationHistory screen | Mobile |
| 6 | Implement notification deep linking (tap → correct screen) | Mobile |
| 7 | Implement tab badges (attention count, pending doses) | Mobile |
| 8 | Implement pull-to-refresh on all list screens | Mobile |
| 9 | Implement TanStack Query cache for offline dashboard | Mobile |
| 10 | Test: Full day simulation — medicines + reminders + expiry warnings | Both |

**Deliverable:** Dashboard shows everything that needs attention. Notifications work end-to-end.

---

### Sprint 9: Polish & Quality (Week 11-12)

**Goal:** Production-ready quality — error handling, empty states, loading states, testing.

| # | Task | Project |
|---|------|---------|
| 1 | Add comprehensive error handling to all endpoints | Backend |
| 2 | Add request logging (structured, no sensitive data) | Backend |
| 3 | Write unit tests for critical services (auth, reminders, medicines) | Backend |
| 4 | Write E2E tests for critical flows | Backend |
| 5 | Set up S3 storage implementation | Backend |
| 6 | Implement all empty states across screens | Mobile |
| 7 | Implement all loading skeletons | Mobile |
| 8 | Implement all error states with retry | Mobile |
| 9 | Implement form validation with user-friendly messages | Mobile |
| 10 | Implement unsaved changes warnings | Mobile |
| 11 | Implement confirmation dialogs for destructive actions | Mobile |
| 12 | Performance audit: list virtualization, image optimization | Mobile |
| 13 | Accessibility audit: labels, touch targets, contrast | Mobile |
| 14 | Fix bugs found during testing | Both |
| 15 | Security audit: verify all checklist items | Both |

**Deliverable:** Production-quality application ready for deployment.

---

### Sprint 10: Deployment & Launch Prep (Week 13)

**Goal:** App deployed, builds working, ready for initial users.

| # | Task | Project |
|---|------|---------|
| 1 | Set up production PostgreSQL | Backend |
| 2 | Set up production server (VPS) with Nginx | Backend |
| 3 | Configure SSL/TLS certificate | Backend |
| 4 | Deploy backend + run migrations | Backend |
| 5 | Configure S3 bucket for production | Backend |
| 6 | Set up Firebase project (production) | Backend |
| 7 | Configure environment variables (production) | Backend |
| 8 | Set up automated database backups | Backend |
| 9 | Generate Android release build (signed APK/AAB) | Mobile |
| 10 | Generate iOS release build | Mobile |
| 11 | Test on real devices (Android + iOS) | Mobile |
| 12 | Fix platform-specific issues | Mobile |
| 13 | Create basic landing page (optional) | — |
| 14 | Set up basic monitoring/alerting | Both |

**Deliverable:** Application live and accessible to initial users.

---

## 3. Timeline Summary

| Sprint | Duration | Focus |
|--------|----------|-------|
| Sprint 1 | Week 1-2 | Foundation + Auth |
| Sprint 2 | Week 3 | Profile + Core Services |
| Sprint 3 | Week 4 | Reminder Engine |
| Sprint 4 | Week 5 | Document Vault |
| Sprint 5 | Week 6-7 | Medicine Manager |
| Sprint 6 | Week 8 | Health Module |
| Sprint 7 | Week 9 | Warranties & Vehicles |
| Sprint 8 | Week 10 | Dashboard & Notifications |
| Sprint 9 | Week 11-12 | Polish & Quality |
| Sprint 10 | Week 13 | Deployment |
| **Total** | **~13 weeks** | **Full Phase 1** |

---

## 4. Development Principles

### Build Order Rationale

1. **Auth first** — everything depends on it
2. **Profile next** — simple CRUD, establishes patterns
3. **Reminder Engine** — shared infrastructure other modules need
4. **Documents** — establishes storage patterns
5. **Medicines** — most complex module, builds on reminder + storage
6. **Health** — builds on medicine + document patterns
7. **Warranties/Vehicles** — simpler modules using established patterns
8. **Dashboard** — aggregator that needs all other modules to exist
9. **Polish** — can't polish what doesn't exist yet

### Each Sprint Includes

- Backend implementation
- Mobile implementation
- Integration testing
- Bug fixes from previous sprint

### Quality Gates (Must Pass Before Next Sprint)

- [ ] All new endpoints tested manually (Postman/Insomnia)
- [ ] All new screens navigable and functional
- [ ] No crashes on basic happy-path usage
- [ ] TypeScript: zero compilation errors
- [ ] ESLint: zero errors (warnings acceptable during development)

---

## 5. Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Medicine notification unreliable | High (core value prop) | Test extensively on multiple devices; use @notifee (reliable); schedule 7 days ahead |
| File upload issues on slow networks | Medium | Show progress, allow retry, handle timeout gracefully |
| Database performance with dose history | Low initially | Indexes in place; can add archival later if needed |
| iOS build complexity | Medium | Set up iOS early (Sprint 1); don't defer native issues |
| Token refresh race condition | Medium | Queue refresh calls; only one refresh in flight at a time |
| Scope creep | High | Stick to documented features; no "nice-to-have" additions until Phase 1 is complete |

---

## 6. Definition of Done (Phase 1)

Phase 1 is complete when:

- [ ] User can register, login, and maintain session
- [ ] User can manage profile and preferences
- [ ] User can create/manage custom reminders with notifications
- [ ] User can upload, search, and view documents
- [ ] User can add medicines with schedules and receive notifications
- [ ] User can log doses and view adherence
- [ ] User can store prescriptions and medical reports
- [ ] User can manage doctors and appointments
- [ ] User can track warranties with expiry alerts
- [ ] User can manage vehicles with date tracking
- [ ] Dashboard shows actionable overview of all modules
- [ ] Notifications work (local + push)
- [ ] Account deletion works completely
- [ ] App works on Android and iOS
- [ ] No critical bugs
- [ ] Basic security measures in place

---

## 7. Post-Phase 1 Priorities

After Phase 1 ships and gets initial user feedback:

1. **Bug fixes and stability** (immediate)
2. **User feedback features** (based on what users actually need)
3. **Data export** (privacy commitment)
4. **Biometric lock** (frequently requested for sensitive apps)
5. **Phase 2 planning** (family features — based on validation)
