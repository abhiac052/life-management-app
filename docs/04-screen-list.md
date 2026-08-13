# [APP_NAME] — Complete Screen List

> Document version: 1.0
> Status: 📋 Review
> Last updated: 2026-08-12

---

## Summary

| Stack | Screen Count |
|-------|-------------|
| Auth | 5 |
| Home | 5 |
| Health | 21 |
| Vault | 5 |
| Manage | 13 |
| Profile | 8 |
| **Total** | **~57** |

---

## Auth Stack (5 screens)

### A1. Welcome

| | |
|---|---|
| **Purpose** | First impression — communicate value, guide to login/register |
| **Key Elements** | App logo, tagline, illustration/animation, "Get Started" button, "Already have an account? Login" link |
| **State** | Static — no loading states |

### A2. Register

| | |
|---|---|
| **Purpose** | Create a new account |
| **Key Elements** | Name field, email field, password field (with visibility toggle), confirm password, "Create Account" button, "Already have an account?" link, terms checkbox |
| **Validation** | Email format, password min 8 chars + complexity, passwords match |
| **Loading** | Button shows spinner during API call |
| **Error** | Inline field errors, toast for server errors (e.g., "Email already exists") |

### A3. Login

| | |
|---|---|
| **Purpose** | Authenticate existing user |
| **Key Elements** | Email field, password field (with visibility toggle), "Login" button, "Forgot Password?" link, "Create Account" link |
| **Validation** | Email format, password required |
| **Loading** | Button spinner |
| **Error** | "Invalid credentials" — generic (no email enumeration) |

### A4. ForgotPassword

| | |
|---|---|
| **Purpose** | Request password reset email |
| **Key Elements** | Email field, "Send Reset Link" button, back to login link |
| **Success** | "If this email exists, a reset link has been sent" (no enumeration) |

### A5. ResetPassword

| | |
|---|---|
| **Purpose** | Set new password via deep link token |
| **Key Elements** | New password field, confirm password field, "Reset Password" button |
| **Entry** | Universal Link / App Link from email (`https://{APP_DOMAIN}/reset-password?token=xxx`). The OS routes this HTTPS URL directly to the app (iOS Universal Links / Android App Links). Falls back to a web page if the app is not installed. |
| **Success** | Redirect to Login with success message |
| **Error** | "Link expired or invalid" |

---

## Home Stack (5 screens)

### H1. Dashboard

| | |
|---|---|
| **Purpose** | Central hub — "What needs my attention?" |
| **Sections** | 1. Today (medicines, reminders, appointments due today) |
| | 2. Attention Required (expiring items, low stock alerts) |
| | 3. Upcoming (next 7 days preview) |
| | 4. Quick Actions (FAB or action row) |
| **Key Elements** | Section cards, item pills/rows, pull-to-refresh, empty states per section |
| **Loading** | Skeleton screens for each section |
| **Offline** | Shows cached data with "Last updated X ago" indicator |

### H2. AllUpcoming

| | |
|---|---|
| **Purpose** | Full upcoming items for next 30 days |
| **Key Elements** | Grouped by date, item type icons, filter by category, scroll |
| **Entry** | "See All" link from Dashboard upcoming section |

### H3. NotificationHistory

| | |
|---|---|
| **Purpose** | View all past notifications |
| **Key Elements** | Chronological list, read/unread state, tap to navigate to source, "Mark all read" |
| **Entry** | Bell icon on Dashboard header |

### H4. ReminderDetail

| | |
|---|---|
| **Purpose** | View a single reminder with its history |
| **Key Elements** | Title, description, schedule info, next due date, action buttons (Complete/Skip/Snooze), history log |
| **Actions** | Edit, Delete, Complete, Skip, Snooze |

### H5. CreateReminder (Modal)

| | |
|---|---|
| **Purpose** | Create a new custom reminder |
| **Key Elements** | Title, description (optional), category picker, date/time picker, recurrence selector (one-time/daily/weekly/monthly/yearly/custom), end date (optional), notification time |
| **Validation** | Title required, date must be future |
| **Success** | Toast + dismiss modal |

---

## Health Stack (17 screens)

### HE1. HealthHome

| | |
|---|---|
| **Purpose** | Health module landing — quick overview |
| **Sections** | 1. Today's Medicines (doses pending/taken) |
| | 2. Next Appointment (upcoming) |
| | 3. Quick navigation cards (Medicines, Doctors, Reports, Prescriptions, Health Profile) |
| **Key Elements** | Medicine dose cards with Take/Skip buttons, appointment card, navigation grid |

### HE2. MedicineList

| | |
|---|---|
| **Purpose** | View all medicines |
| **Key Elements** | Active/Inactive tab toggle, medicine cards (name, dosage, frequency, next dose), FAB to add, search |
| **Empty State** | "No medicines added yet. Add your first medicine." |

### HE3. MedicineDetail

| | |
|---|---|
| **Purpose** | Full medicine information + today's dose actions |
| **Key Elements** | Name, dosage, form, schedule, meal relation, start/end dates, stock info, prescription link, history preview, dose action buttons |
| **Actions** | Edit, Archive/Activate, Delete, View History |

### HE4. CreateMedicine (Modal)

| | |
|---|---|
| **Purpose** | Add a new medicine with schedule |
| **Form Steps** | Step 1: Basic info (name, dosage, form) |
| | Step 2: Schedule (frequency, times, days, meal relation) |
| | Step 3: Optional (start/end date, stock tracking, link prescription, notes) |
| **Key Elements** | Multi-step form, time pickers, day selectors, toggle for stock tracking |
| **Validation** | Name required, at least one schedule time required |

### HE5. EditMedicine

| | |
|---|---|
| **Purpose** | Modify existing medicine |
| **Key Elements** | Same form as Create, pre-populated |
| **Note** | Changing schedule should reschedule notifications |

### HE6. MedicineHistory

| | |
|---|---|
| **Purpose** | Dose adherence log |
| **Key Elements** | Calendar view (color-coded days: green=all taken, yellow=partial, red=all missed), list view toggle, date range filter |
| **Entry** | From MedicineDetail |

### HE7. MedicineStock

| | |
|---|---|
| **Purpose** | Overview of all medicine stock levels |
| **Key Elements** | List of medicines with stock enabled, remaining quantity, estimated days, low stock indicators |
| **Entry** | From HealthHome or MedicineList |

### HE8. PrescriptionList

| | |
|---|---|
| **Purpose** | All stored prescriptions |
| **Key Elements** | Cards with doctor name, date, thumbnail, linked medicines count |
| **Empty State** | "Store your prescriptions here for easy access." |

### HE9. PrescriptionDetail

| | |
|---|---|
| **Purpose** | View prescription with file and linked medicines |
| **Key Elements** | Doctor, clinic, date, notes, file preview, linked medicines list, download/share |
| **Actions** | Edit, Delete, Share |

### HE10. CreatePrescription (Modal)

| | |
|---|---|
| **Purpose** | Add a new prescription |
| **Key Elements** | Doctor picker (or free text), clinic, date, notes, file upload (camera/gallery/files), link medicines (optional) |

### HE11. ReportList

| | |
|---|---|
| **Purpose** | All medical reports |
| **Key Elements** | Filter by type (blood, X-ray, MRI, etc.), cards with title, type, date, thumbnail |

### HE12. ReportDetail

| | |
|---|---|
| **Purpose** | View medical report |
| **Key Elements** | Title, type, date, doctor/lab, notes, file viewer, download/share |

### HE13. CreateReport (Modal)

| | |
|---|---|
| **Purpose** | Upload a new medical report |
| **Key Elements** | Title, type picker, date, doctor/lab (optional), notes, file upload |

### HE14. DoctorList

| | |
|---|---|
| **Purpose** | All saved doctors |
| **Key Elements** | Cards with name, specialization, clinic, phone (tap to call) |

### HE15. DoctorDetail

| | |
|---|---|
| **Purpose** | Doctor info + appointment history |
| **Key Elements** | Full details, appointment list for this doctor, "Book Appointment" action |

### HE16. CreateDoctor

| | |
|---|---|
| **Purpose** | Add a new doctor |
| **Key Elements** | Name, specialization picker, hospital/clinic, phone, address, notes |

### HE17. EditDoctor

| | |
|---|---|
| **Purpose** | Modify existing doctor record |
| **Key Elements** | Same form as CreateDoctor, pre-populated |
| **Entry** | Edit action from DoctorDetail |

### HE18. AppointmentList

| | |
|---|---|
| **Purpose** | All appointments |
| **Key Elements** | Upcoming/Past tabs, cards with doctor, date, time, purpose, status badge |

### HE19. AppointmentDetail

| | |
|---|---|
| **Purpose** | View appointment details |
| **Key Elements** | Doctor, date, time, purpose, notes, reminder info, status, linked prescription |
| **Actions** | Edit, Cancel, Mark Complete, Add Prescription |

### HE20. CreateAppointment (Modal)

| | |
|---|---|
| **Purpose** | Schedule a new appointment |
| **Key Elements** | Doctor picker (or free text), date, time, purpose, notes, reminder settings (default: 1 day + 1 hour before) |

### HE21. HealthProfileEdit

| | |
|---|---|
| **Purpose** | View/edit personal health information |
| **Key Elements** | Blood group picker, allergies list (add/remove), height/weight inputs, emergency contact (name + phone), medical notes |
| **Note** | All fields optional — user chooses what to fill |

---

## Vault Stack (5 screens)

### V1. VaultHome

| | |
|---|---|
| **Purpose** | Browse and find documents |
| **Key Elements** | Search bar (always visible), category chips (horizontal scroll), document grid/list toggle, sort (date/name/category), FAB to upload, document cards (thumbnail, name, category, expiry badge) |
| **Empty State** | "Your digital vault is empty. Upload your first document." |

### V2. DocumentDetail

| | |
|---|---|
| **Purpose** | View document metadata and file |
| **Key Elements** | File preview (image inline / PDF first page), name, category, description, issue date, expiry date, tags, notes, reminder status |
| **Actions** | Edit, View Full (opens viewer), Share, Download, Delete |

### V3. CreateDocument (Modal)

| | |
|---|---|
| **Purpose** | Upload a new document |
| **Key Elements** | File picker (camera/gallery/files), name, category picker, description (optional), issue date (optional), expiry date (optional), tags input, notes (optional), "Set expiry reminder" toggle |
| **Validation** | File required, name required, category required |

### V4. EditDocument

| | |
|---|---|
| **Purpose** | Edit document metadata |
| **Key Elements** | Same as Create minus file upload (file cannot be changed — delete and re-upload) |

### V5. DocumentViewer

| | |
|---|---|
| **Purpose** | Full-screen file viewing |
| **Key Elements** | Pinch-to-zoom for images, PDF page navigation, share button, download button |
| **Entry** | From DocumentDetail "View" action |

---

## Manage Stack (13 screens)

### M1. ManageHome

| | |
|---|---|
| **Purpose** | Manage module landing |
| **Sections** | 1. Reminders (active count, next due) |
| | 2. Warranties (active count, next expiring) |
| | 3. Vehicles (count, next expiry) |
| **Key Elements** | Summary cards with "View All" links, quick status indicators |

### M2. ReminderList

| | |
|---|---|
| **Purpose** | All custom reminders |
| **Key Elements** | Active/Completed tabs, cards with title, next due, recurrence icon, category badge |
| **Empty State** | "No reminders yet. Never forget an important responsibility." |

### M3. ReminderDetail

| | |
|---|---|
| **Purpose** | (Same as H4 — shared screen) |

### M4. CreateReminder

| | |
|---|---|
| **Purpose** | (Same as H5 — shared modal) |

### M5. EditReminder

| | |
|---|---|
| **Purpose** | Modify existing reminder |
| **Key Elements** | Same form as Create, pre-populated |

### M6. WarrantyList

| | |
|---|---|
| **Purpose** | All warranties |
| **Key Elements** | Active/Expiring Soon/Expired tabs, cards with product, brand, expiry date, days remaining badge |
| **Empty State** | "Track your product warranties. Never miss a claim window." |

### M7. WarrantyDetail

| | |
|---|---|
| **Purpose** | Full warranty information |
| **Key Elements** | Product name, brand, model, purchase date, warranty expiry, days remaining (countdown), seller, invoice file (if uploaded), notes, reminder status |
| **Actions** | Edit, Delete, View Invoice |

### M8. CreateWarranty (Modal)

| | |
|---|---|
| **Purpose** | Add a new warranty |
| **Key Elements** | Product name, brand (optional), model (optional), purchase date, warranty period picker (months) OR expiry date, seller (optional), invoice upload (optional), notes (optional) |
| **Auto-calculate** | Expiry from purchase date + duration |

### M9. EditWarranty

| | |
|---|---|
| **Purpose** | Modify existing warranty |
| **Key Elements** | Same form as Create, pre-populated |

### M10. VehicleList

| | |
|---|---|
| **Purpose** | All vehicles |
| **Key Elements** | Cards with vehicle name, type icon, registration, nearest expiry badge |
| **Empty State** | "Add your vehicles to track insurance, PUC, and service dates." |

### M11. VehicleDetail

| | |
|---|---|
| **Purpose** | Full vehicle information |
| **Key Elements** | Name, type, registration, insurance expiry (with countdown), PUC expiry (with countdown), next service date, notes, reminder statuses |
| **Actions** | Edit, Delete |

### M12. CreateVehicle (Modal)

| | |
|---|---|
| **Purpose** | Add a new vehicle |
| **Key Elements** | Name, registration number, type picker (car/bike/scooter/other), insurance expiry date, PUC expiry date, next service date, notes |
| **Auto-reminders** | Automatically creates reminders for each date field |

### M13. EditVehicle

| | |
|---|---|
| **Purpose** | Modify existing vehicle |
| **Key Elements** | Same form as Create, pre-populated |

---

## Profile Stack (7 screens)

### P1. ProfileHome

| | |
|---|---|
| **Purpose** | Account overview and settings hub |
| **Key Elements** | Avatar, name, email, menu list (Edit Profile, Notifications, App Settings, Change Password, Privacy & Security, About), account deletion link at bottom |

### P2. EditProfile

| | |
|---|---|
| **Purpose** | Edit personal information |
| **Key Elements** | Avatar picker (camera/gallery), name, phone (optional) |
| **Note** | Email shown but not editable (separate flow if needed) |

### P3. NotificationSettings

| | |
|---|---|
| **Purpose** | Control notification preferences |
| **Key Elements** | Master toggle, per-module toggles (Medicines, Appointments, Reminders, Warranties, Vehicles, Documents), quiet hours (start/end time) |

### P4. AppSettings

| | |
|---|---|
| **Purpose** | App behavior preferences |
| **Key Elements** | Theme (Light/Dark/System), time format (12h/24h), default reminder time, dashboard sections visibility |

### P5. ChangePassword

| | |
|---|---|
| **Purpose** | Update password |
| **Key Elements** | Current password, new password, confirm new password |
| **Validation** | Current password must be correct, new password meets complexity |

### P6. PrivacySecurity

| | |
|---|---|
| **Purpose** | Privacy information and data management |
| **Key Elements** | Data storage explanation, what data is stored, privacy policy link, data export info (coming soon), account deletion button |

### P7. DeleteAccount

| | |
|---|---|
| **Purpose** | Permanently delete account |
| **Key Elements** | Warning message (irreversible), explanation of what gets deleted, password confirmation field, "Delete My Account" button (danger color), 2-step confirmation |
| **Flow** | Enter password → Confirm dialog → Processing → Logout + navigate to Welcome |

### P8. About

| | |
|---|---|
| **Purpose** | App information |
| **Key Elements** | App version, build number, legal links (Terms, Privacy Policy), support contact, open source licenses |

---

## Screen Count Reconciliation

| Stack | Screens |
|-------|---------|
| Auth | A1–A5 = 5 |
| Home | H1–H5 = 5 |
| Health | HE1–HE21 = 21 |
| Vault | V1–V5 = 5 |
| Manage | M1–M13 = 13 (M3, M4 shared with Home) |
| Profile | P1–P8 = 8 |
| **Unique screens** | **~50** (excluding shared) |

---

## Common UI Patterns (all screens)

| Pattern | Implementation |
|---------|---------------|
| Loading | Skeleton screens (not spinners) for list/detail screens |
| Empty state | Illustration + message + CTA |
| Error state | Retry button + error message |
| Pull-to-refresh | All list screens |
| Confirmation dialog | All destructive actions (delete, archive, cancel) |
| Toast notifications | Success/error feedback for actions |
| Form unsaved warning | Prompt when leaving dirty form |
| Accessibility | All touchable areas ≥ 44pt, labels for screen readers |
