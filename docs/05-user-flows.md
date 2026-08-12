# [APP_NAME] — Core User Flows

> Document version: 1.0
> Status: 📋 Review
> Last updated: 2026-08-12

---

## 1. Authentication Flows

### 1.1 Registration

```
User opens app (first time)
    → Welcome screen displayed
    → Taps "Get Started"
    → Register screen
    → Enters: name, email, password, confirm password
    → Accepts terms
    → Taps "Create Account"
    → [Loading state on button]
    → API: POST /auth/register
    │
    ├── Success:
    │   → Server creates user + household
    │   → Returns access_token + refresh_token
    │   → Mobile stores tokens securely (Keychain / EncryptedSharedPrefs)
    │   → Navigate to Dashboard (replace auth stack)
    │   → Show welcome toast: "Welcome to [APP_NAME]!"
    │
    └── Error:
        ├── 409 Email exists → Inline error: "This email is already registered"
        ├── 422 Validation → Show field-level errors
        └── 5xx Server → Toast: "Something went wrong. Please try again."
```

### 1.2 Login

```
User opens app
    → Auth check: no valid token
    → Welcome screen → Taps "Login"
    → Login screen
    → Enters: email, password
    → Taps "Login"
    → [Loading]
    → API: POST /auth/login
    │
    ├── Success:
    │   → Returns access_token + refresh_token
    │   → Store tokens securely
    │   → Navigate to Dashboard (replace auth stack)
    │
    └── Error:
        ├── 401 → "Invalid email or password" (generic — no enumeration)
        └── 429 → "Too many attempts. Try again in X minutes."
```

### 1.3 Silent Token Refresh

```
API call returns 401 (access token expired)
    → Interceptor catches 401
    → Reads refresh_token from secure storage
    → API: POST /auth/refresh { refreshToken }
    │
    ├── Success:
    │   → New access_token + refresh_token returned
    │   → Store new tokens
    │   → Retry original request with new access_token
    │
    └── Failure (refresh token also expired/invalid):
        → Clear all tokens
        → Navigate to Login screen
        → Toast: "Session expired. Please log in again."
```

### 1.4 Forgot Password

```
Login screen → Taps "Forgot Password?"
    → ForgotPassword screen
    → Enters email
    → Taps "Send Reset Link"
    → API: POST /auth/forgot-password { email }
    │
    → Always show: "If this email is registered, a reset link has been sent."
    → (No email enumeration — same message whether email exists or not)
    → User checks email
    → Clicks link in email
    → Deep link opens app → ResetPassword screen
    → Enters new password + confirm
    → Taps "Reset Password"
    → API: POST /auth/reset-password { token, newPassword }
    │
    ├── Success → Navigate to Login + toast: "Password reset successful"
    └── Error → "This link has expired. Please request a new one."
```

### 1.5 Logout

```
Profile → Taps "Logout"
    → Confirmation dialog: "Are you sure you want to log out?"
    → Taps "Logout"
    → API: POST /auth/logout { refreshToken }
    → Clear all local tokens
    → Clear TanStack Query cache
    → Navigate to Welcome screen (replace entire stack)
```

---

## 2. Dashboard Flow

### 2.1 App Open (Returning User)

```
User opens app
    → Auth check: valid access token exists
    → Navigate to Dashboard
    → Show cached data immediately (TanStack Query cache)
    → Background refetch: GET /dashboard
    → Update UI with fresh data
    │
    Dashboard sections populated:
    ├── Today: medicines due, reminders due, appointments
    ├── Attention Required: expiring items, low stock
    └── Upcoming: next 7 days preview
```

### 2.2 Quick Action

```
Dashboard → Taps Quick Action (e.g., "Add Medicine")
    → Modal slides up: CreateMedicine
    → User fills form
    → Submits
    → Modal dismisses
    → Dashboard invalidates & refreshes
    → New item appears in relevant section
```

---

## 3. Reminder Flows

### 3.1 Create Custom Reminder

```
User taps "Add Reminder" (Dashboard or Manage tab)
    → CreateReminder modal
    → Enters:
    │   ├── Title: "Renew Passport"
    │   ├── Category: Documents
    │   ├── Date: 2027-03-15
    │   ├── Time: 09:00
    │   ├── Recurrence: One-time
    │   └── Notification: 1 day before
    → Taps "Save"
    → API: POST /reminders
    │
    ├── Success:
    │   → Server creates reminder
    │   → Returns reminder with next_due date
    │   → Mobile schedules local notification (if within scheduling window)
    │   → Modal dismisses
    │   → Toast: "Reminder created"
    │   → Dashboard & Manage list refresh
    │
    └── Error:
        → Show error, stay on form
```

### 3.2 Reminder Due — Notification Flow

```
Notification fires (local or FCM)
    → User sees notification: "Renew Passport — Due today"
    → User taps notification
    │
    ├── App in foreground → Navigate to ReminderDetail
    ├── App in background → Resume + navigate to ReminderDetail
    └── App killed → Launch → Auth check → Navigate to ReminderDetail
    
    → ReminderDetail screen
    → User sees: title, description, due date, actions
    → User taps "Complete"
    → API: POST /reminders/:id/complete
    → Reminder marked complete
    → If recurring: next occurrence calculated & scheduled
    → If one-time: reminder moves to completed list
```

### 3.3 Snooze Reminder

```
ReminderDetail → User taps "Snooze"
    → Bottom sheet: "Snooze for: 15 min | 30 min | 1 hour | Custom"
    → User selects "1 hour"
    → API: POST /reminders/:id/snooze { duration: 60 }
    → New notification scheduled for +1 hour
    → UI updates: "Snoozed until 10:00 AM"
```

---

## 4. Medicine Flows

### 4.1 Create Medicine + Schedule

```
User taps "Add Medicine" (Health tab or Dashboard)
    → CreateMedicine modal (multi-step)
    
    Step 1: Basic Info
    → Enters: name ("Amlodipine"), dosage ("5mg"), form ("Tablet")
    → Taps "Next"
    
    Step 2: Schedule
    → Frequency: "Daily"
    → Times: Morning (8:00 AM)
    → Days: All days
    → Meal relation: "After food"
    → Taps "Next"
    
    Step 3: Optional
    → Start date: Today
    → End date: None (indefinite)
    → Stock tracking: ON
    │   → Current quantity: 30
    │   → Tablets per dose: 1
    │   → Refill threshold: 7
    → Notes: "For blood pressure"
    → Taps "Save"
    
    → API: POST /medicines
    → Server creates medicine + schedule + reminder entries
    → Mobile schedules local notifications for each dose time
    → Modal dismisses
    → Medicine appears in Health Home → Today's Medicines
```

### 4.2 Daily Medicine Dose — Take

```
8:00 AM — Local notification fires
    → "Time to take Amlodipine 5mg — After food"
    → User taps notification
    → App opens → MedicineDetail (or dose action sheet)
    → User taps "Taken"
    → API: POST /medicines/:id/doses { action: "taken", scheduledAt: "08:00" }
    → Dose logged
    → Stock decremented (30 → 29)
    → Notification cleared
    → Dashboard today section updates: "1/1 medicines taken ✓"
```

### 4.3 Daily Medicine Dose — Skip

```
Notification fires → User opens app
    → Taps "Skip"
    → Optional: reason field (or just skip)
    → API: POST /medicines/:id/doses { action: "skipped", scheduledAt: "08:00" }
    → Dose logged as skipped
    → Stock NOT decremented
    → Notification cleared
```

### 4.4 Daily Medicine Dose — Snooze

```
Notification fires → User taps "Snooze" (from notification or app)
    → Snooze options: 15 min, 30 min, 1 hour
    → User selects 30 min
    → New local notification scheduled for 8:30 AM
    → Original notification cleared
    → At 8:30 AM: notification fires again
```

### 4.5 Low Stock Alert

```
Background check (on dose taken):
    → Current stock: 7 tablets
    → Refill threshold: 7
    → Trigger: stock ≤ threshold
    → Create attention item
    → Dashboard → Attention Required: "Amlodipine supply: ~7 days remaining"
    → Optional push notification (if first time reaching threshold)
```

### 4.6 View Medicine Adherence

```
Health → MedicineList → Tap medicine → MedicineDetail → "View History"
    → MedicineHistory screen
    → Calendar view:
    │   ├── Green days: all doses taken
    │   ├── Yellow days: partial (some taken, some skipped)
    │   ├── Red days: all missed
    │   └── Gray days: no data / medicine not active
    → List view: chronological log of each dose action
    → Filter by date range
```

---

## 5. Document Flows

### 5.1 Upload Document

```
User taps "Upload Document" (Vault or Dashboard quick action)
    → CreateDocument modal
    → Taps file picker
    → OS picker: Camera / Photo Library / Files
    → Selects file (e.g., passport scan.pdf)
    → File appears as thumbnail preview
    → Enters:
    │   ├── Name: "Passport - Abhishek"
    │   ├── Category: Passport
    │   ├── Expiry date: 2035-06-20
    │   ├── Tags: "travel", "identity"
    │   └── Set expiry reminder: ON (3 months before)
    → Taps "Upload"
    → [Upload progress indicator]
    → API: POST /documents (multipart form)
    │   → Server validates file type & size
    │   → Uploads to StorageService
    │   → Stores metadata in DB
    │   → Creates expiry reminder if requested
    │
    ├── Success:
    │   → Modal dismisses
    │   → Toast: "Document uploaded"
    │   → Vault refreshes — new document appears
    │
    └── Error:
        ├── 413 File too large → "File exceeds 10MB limit"
        ├── 415 Invalid type → "Only PDF, JPG, and PNG files are supported"
        └── 507 Quota exceeded → "Storage full. Delete some documents to free space."
```

### 5.2 Find Document

```
User goes to Vault tab
    → Sees document grid (most recent first)
    → Types "passport" in search bar
    → Filtered results show matching documents
    → Taps on "Passport - Abhishek"
    → DocumentDetail screen
    → Taps "View"
    → DocumentViewer (full-screen PDF/image)
```

### 5.3 Share/Download Document

```
DocumentDetail → Taps "Share"
    → API: GET /documents/:id/download-url
    → Server returns signed URL (temporary, e.g., 15 min)
    → OS share sheet opens
    → User can: AirDrop, WhatsApp, Save to Files, Email, etc.
```

### 5.4 Delete Document

```
DocumentDetail → Taps "Delete"
    → Confirmation dialog: "This will move the document to trash. You can recover it within 30 days."
    → User confirms
    → API: DELETE /documents/:id
    → Soft delete (marked deleted, file retained for 30 days)
    → Document removed from Vault list
    → Toast: "Document deleted"
```

---

## 6. Warranty Flows

### 6.1 Add Warranty

```
User taps "Add Warranty" (Manage or Dashboard)
    → CreateWarranty modal
    → Enters:
    │   ├── Product: "Samsung Refrigerator"
    │   ├── Brand: "Samsung"
    │   ├── Model: "RT28T3523S8"
    │   ├── Purchase date: 2026-08-12
    │   ├── Warranty: 24 months
    │   ├── Seller: "Croma Electronics"
    │   └── Invoice: [uploads invoice.pdf]
    → Taps "Save"
    → API: POST /warranties
    │   → Server calculates expiry: 2028-08-12
    │   → Creates warranty record
    │   → Auto-creates reminders: 30 days before + 7 days before expiry
    │   → Uploads invoice via StorageService
    │
    → Modal dismisses
    → Toast: "Warranty added — expires 12 Aug 2028"
    → Warranty appears in Manage → Warranties (Active)
```

### 6.2 Warranty Expiry Notification

```
Backend daily cron → Checks warranties expiring within notification windows
    → Finds: Samsung Refrigerator expires in 30 days
    → Sends FCM push: "Samsung Refrigerator warranty expires in 30 days"
    → User taps notification
    → Opens WarrantyDetail
    → User sees: expiry countdown, product info, invoice
    → User can take action (e.g., make a claim, extend warranty)
```

---

## 7. Appointment Flows

### 7.1 Book Appointment

```
User taps "Add Appointment" (Health tab)
    → CreateAppointment modal
    → Enters:
    │   ├── Doctor: Dr. Sharma (from saved doctors, or type new)
    │   ├── Date: 2026-08-20
    │   ├── Time: 10:30 AM
    │   ├── Purpose: "Follow-up — blood pressure review"
    │   └── Reminder: 1 day before + 1 hour before (defaults)
    → Taps "Save"
    → API: POST /appointments
    │   → Creates appointment
    │   → Creates reminder entries (1 day before, 1 hour before)
    │   → If doctor is new: also creates doctor record
    │
    → Modal dismisses
    → Appointment appears in:
    │   ├── Dashboard → Today (if today) or Upcoming
    │   ├── Health Home → Next Appointment card
    │   └── Appointments list
```

### 7.2 Appointment Reminder + Completion

```
Day before (FCM push): "Appointment with Dr. Sharma tomorrow at 10:30 AM"
1 hour before (local notification): "Dr. Sharma in 1 hour — Blood pressure review"

After appointment:
    → User opens AppointmentDetail
    → Taps "Mark Complete"
    → API: PATCH /appointments/:id { status: "completed" }
    → Optional: "Add prescription from this visit?" prompt
    │
    ├── Yes → Opens CreatePrescription (pre-filled with doctor)
    └── No → Done, appointment moved to Past
```

---

## 8. Vehicle Flows

### 8.1 Add Vehicle

```
User taps "Add Vehicle" (Manage tab)
    → CreateVehicle modal
    → Enters:
    │   ├── Name: "Honda City"
    │   ├── Type: Car
    │   ├── Registration: MH-02-AB-1234
    │   ├── Insurance expiry: 2027-03-15
    │   ├── PUC expiry: 2027-01-10
    │   ├── Next service: 2026-11-01
    │   └── Notes: "Petrol, 2022 model"
    → Taps "Save"
    → API: POST /vehicles
    │   → Creates vehicle
    │   → Auto-creates reminders for each date:
    │       ├── Insurance: 30 days + 7 days before expiry
    │       ├── PUC: 15 days + 7 days before expiry
    │       └── Service: 7 days before
    │
    → Modal dismisses
    → Vehicle appears in Manage → Vehicles
    → Dashboard will show upcoming vehicle dates
```

---

## 9. Profile Flows

### 9.1 Account Deletion

```
Profile → Privacy & Security → "Delete My Account"
    → DeleteAccount screen
    → Shows warning:
    │   "This will permanently delete:
    │    • All your documents
    │    • All medicines and health records
    │    • All reminders
    │    • All warranties and vehicle data
    │    • Your account and profile
    │    This action cannot be undone."
    │
    → User enters password (verification)
    → Taps "Delete My Account" (red button)
    → Confirmation dialog: "Are you absolutely sure?"
    → User taps "Yes, delete everything"
    → API: DELETE /account
    │   → Server verifies password
    │   → Cascading hard delete:
    │       ├── All user documents (DB + storage)
    │       ├── All reminders
    │       ├── All medicines + logs
    │       ├── All health records
    │       ├── All warranties
    │       ├── All vehicles
    │       ├── All notifications
    │       ├── User profile
    │       └── User account
    │   → Revoke all tokens
    │
    → Mobile:
    │   → Clear secure storage
    │   → Clear cache
    │   → Navigate to Welcome screen
    │   → Toast: "Account deleted"
```

---

## 10. Offline Flows

### 10.1 Medicine Dose While Offline

```
Phone has no internet → Local notification fires for medicine
    → User opens app
    → Sees medicine detail (cached)
    → Taps "Taken"
    → Action stored in local queue (MMKV or AsyncStorage)
    → UI immediately updates (optimistic)
    → [No API call — queued]
    
    Later, internet returns:
    → Background sync picks up queued actions
    → API: POST /medicines/:id/doses { action: "taken", ... }
    → Queue cleared
    → TanStack Query refreshes
```

### 10.2 Dashboard While Offline

```
User opens app (no internet)
    → TanStack Query serves cached dashboard data
    → UI renders with stale data
    → Shows subtle indicator: "Offline — showing cached data"
    → Pull-to-refresh shows: "No internet connection"
    → When internet returns: auto-refetch, indicator disappears
```

---

## 11. First-Time User Experience

```
After registration → Dashboard (empty)
    → Empty state for each section:
    │   ├── Today: "Nothing for today. Add medicines or reminders to get started."
    │   ├── Attention: "All clear! Nothing needs your attention."
    │   └── Upcoming: "No upcoming events yet."
    │
    → Quick Actions prominently visible
    → Optional: subtle onboarding hints (tooltips) pointing to Quick Actions
    → User's first action creates first real data
    → Dashboard populates progressively as user adds data
```

---

## Flow Summary

| Flow | Screens Involved | API Calls |
|------|-----------------|-----------|
| Registration | Welcome → Register → Dashboard | POST /auth/register |
| Login | Welcome → Login → Dashboard | POST /auth/login |
| Create Reminder | Dashboard/Manage → CreateReminder modal | POST /reminders |
| Reminder Complete | Notification → ReminderDetail | POST /reminders/:id/complete |
| Create Medicine | Health → CreateMedicine modal | POST /medicines |
| Take Dose | Notification → MedicineDetail | POST /medicines/:id/doses |
| Upload Document | Vault → CreateDocument modal | POST /documents |
| Find Document | Vault → Search → DocumentDetail → Viewer | GET /documents, GET /documents/:id |
| Add Warranty | Manage → CreateWarranty modal | POST /warranties |
| Book Appointment | Health → CreateAppointment modal | POST /appointments |
| Add Vehicle | Manage → CreateVehicle modal | POST /vehicles |
| Delete Account | Profile → Privacy → DeleteAccount | DELETE /account |
