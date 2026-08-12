# [APP_NAME] — Mobile Navigation Map

> Document version: 1.0
> Status: 📋 Review
> Last updated: 2026-08-12

---

## 1. Navigation Architecture

### Library: React Navigation v6+

```
NavigationContainer
├── AuthStack (unauthenticated)
└── MainStack (authenticated)
    └── BottomTabNavigator
        ├── HomeStack
        ├── HealthStack
        ├── VaultStack
        ├── ManageStack
        └── ProfileStack
```

---

## 2. Bottom Tab Structure

| Tab | Icon | Label | Primary Purpose |
|-----|------|-------|-----------------|
| 🏠 | home | Home | Dashboard, today's items, attention required |
| ❤️ | heart | Health | Medicines, health profile, prescriptions, reports, doctors |
| 📁 | folder | Vault | Documents and important files |
| 📋 | clipboard | Manage | Warranties, vehicles, reminders |
| 👤 | user | Profile | Account, settings, preferences |

### Tab Design Rationale

The spec suggested this structure, and it works well because:

1. **Home** — answers "what needs attention now?" (highest frequency)
2. **Health** — groups all health-related items (medicines are daily interaction)
3. **Vault** — dedicated space for documents (clear mental model)
4. **Manage** — life items that are checked periodically (warranties, vehicles, custom reminders)
5. **Profile** — low-frequency settings and account management

---

## 3. Full Navigation Tree

### Auth Stack (Unauthenticated)

```
AuthStack
├── Welcome          — App intro / value proposition
├── Login            — Email + password
├── Register         — Create account
├── ForgotPassword   — Enter email for reset
└── ResetPassword    — Enter new password (from deep link)
```

---

### Home Stack

```
HomeStack
├── Dashboard                    — Main dashboard (Tab root)
├── ReminderDetail              — View single reminder
├── CreateReminder              — Add new reminder (Quick Action)
├── NotificationHistory         — All recent notifications
└── AllUpcoming                 — Full upcoming items list
```

---

### Health Stack

```
HealthStack
├── HealthHome                  — Health module landing (Tab root)
│   ├── Today's Medicines       — Section: doses due today
│   ├── Upcoming Appointments   — Section: next appointments
│   └── Quick Stats             — Active medicines count, next appointment
│
├── Medicines
│   ├── MedicineList            — All medicines (active/inactive toggle)
│   ├── MedicineDetail          — Single medicine details + history
│   ├── CreateMedicine          — Add new medicine + schedule
│   ├── EditMedicine            — Modify medicine
│   ├── MedicineHistory         — Dose log (calendar/list view)
│   └── MedicineStock           — Stock overview & low stock items
│
├── Prescriptions
│   ├── PrescriptionList        — All prescriptions
│   ├── PrescriptionDetail      — View prescription + linked medicines
│   └── CreatePrescription      — Add new prescription
│
├── Reports
│   ├── ReportList              — All medical reports
│   ├── ReportDetail            — View report
│   └── CreateReport            — Upload new report
│
├── Doctors
│   ├── DoctorList              — All doctors
│   ├── DoctorDetail            — Doctor info + appointment history
│   └── CreateDoctor            — Add new doctor
│
├── Appointments
│   ├── AppointmentList         — All appointments (upcoming/past)
│   ├── AppointmentDetail       — View appointment
│   └── CreateAppointment       — Add new appointment
│
└── HealthProfile
    └── HealthProfileEdit       — View/edit health profile
```

---

### Vault Stack

```
VaultStack
├── VaultHome                   — Document grid/list (Tab root)
│   ├── Category filter         — Filter by category
│   ├── Search bar              — Search by name/tags
│   └── Sort options            — By date, name, category
│
├── DocumentDetail              — View document + metadata
├── CreateDocument              — Upload new document
├── EditDocument                — Edit metadata
└── DocumentViewer              — Full-screen file viewer (PDF/image)
```

---

### Manage Stack

```
ManageStack
├── ManageHome                  — Module landing (Tab root)
│   ├── Reminders section       — Active reminders count
│   ├── Warranties section      — Active/expiring count
│   └── Vehicles section        — Vehicle count
│
├── Reminders
│   ├── ReminderList            — All reminders (active/completed)
│   ├── ReminderDetail          — View reminder + history
│   ├── CreateReminder          — Add new reminder
│   └── EditReminder            — Modify reminder
│
├── Warranties
│   ├── WarrantyList            — All warranties (active/expired)
│   ├── WarrantyDetail          — View warranty + invoice
│   ├── CreateWarranty          — Add new warranty
│   └── EditWarranty            — Modify warranty
│
└── Vehicles
    ├── VehicleList             — All vehicles
    ├── VehicleDetail           — View vehicle + expiry dates
    ├── CreateVehicle           — Add new vehicle
    └── EditVehicle             — Modify vehicle
```

---

### Profile Stack

```
ProfileStack
├── ProfileHome                 — Account overview (Tab root)
├── EditProfile                 — Edit name, phone, avatar
├── NotificationSettings        — Per-module notification toggles, quiet hours
├── AppSettings                 — Theme, time format, defaults
├── ChangePassword              — Update password
├── PrivacySecurity             — Privacy info, data info
├── DeleteAccount               — Account deletion flow (with confirmation)
└── About                       — App version, legal, support
```

---

## 4. Navigation Patterns

### Modal Screens (presented over current stack)

| Screen | Trigger |
|--------|---------|
| CreateReminder | Quick action from Dashboard or Manage |
| CreateMedicine | Quick action from Dashboard or Health |
| CreateDocument | Quick action from Dashboard or Vault |
| MedicineDoseAction | Notification tap or medicine dose card |
| ImageViewer | Tap on document/prescription/report image |

### Deep Linking Routes

| Notification Type | Opens |
|-------------------|-------|
| Medicine dose due | HealthStack → MedicineDetail |
| Appointment reminder | HealthStack → AppointmentDetail |
| Expiry warning | ManageStack → relevant detail screen |
| Custom reminder due | HomeStack → ReminderDetail |
| Document expiry | VaultStack → DocumentDetail |

---

## 5. Navigation Flow Diagram

```
App Launch
    │
    ├── Has valid token? ─── YES ──→ MainStack (Dashboard)
    │
    └── NO ──→ AuthStack (Welcome)
                    │
                    ├── Login ──→ MainStack (Dashboard)
                    └── Register ──→ MainStack (Dashboard)


Push Notification Tap
    │
    ├── App in foreground ──→ Navigate to relevant screen
    ├── App in background ──→ Resume + navigate to relevant screen
    └── App killed ──→ Launch + authenticate + navigate to relevant screen
```

---

## 6. Screen Transition Types

| Transition | Usage |
|------------|-------|
| Stack push (slide from right) | Navigating deeper into content |
| Modal (slide from bottom) | Creation forms, quick actions |
| Tab switch (no animation) | Switching between main sections |
| Replace (no back) | Auth → Main after login |

---

## 7. Navigation Guards

| Guard | Behavior |
|-------|----------|
| Auth guard | Redirect to AuthStack if no valid token |
| Token refresh | Silent refresh before API calls; redirect to login if refresh fails |
| Unsaved changes | Prompt user before leaving a form with unsaved data |

---

## 8. Tab Badge Indicators

| Tab | Badge Logic |
|-----|-------------|
| Home | Count of attention-required items |
| Health | Count of pending medicine doses today |
| Vault | None (no urgency) |
| Manage | Count of items expiring within 7 days |
| Profile | None |

Badges should be lightweight — fetched with dashboard data, not separate API calls.
