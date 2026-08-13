# [APP_NAME] — API Architecture & Contracts

> Document version: 1.0
> Status: 📋 Review
> Last updated: 2026-08-12

---

## 1. API Design Principles

| Principle | Implementation |
|-----------|---------------|
| RESTful conventions | Standard HTTP methods, resource-based URLs |
| Consistent response format | All responses use same envelope structure |
| Versioned | `/api/v1/` prefix |
| Authenticated | JWT Bearer token (except auth endpoints) |
| Validated | All inputs validated before processing |
| Paginated | List endpoints support cursor/offset pagination |
| Error-rich | Meaningful error codes and messages |

---

## 2. Base URL

```
Development:  http://localhost:3000/api/v1
Staging:      https://staging-api.example.com/api/v1
Production:   https://api.example.com/api/v1
```

---

## 3. Response Envelope

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-08-12T12:00:00.000Z"
  }
}
```

### Success Response (Paginated List)

```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3,
    "timestamp": "2026-08-12T12:00:00.000Z"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  },
  "meta": {
    "timestamp": "2026-08-12T12:00:00.000Z"
  }
}
```

### Standard Error Codes

| Code | HTTP Status | Meaning |
|------|-------------|---------|
| VALIDATION_ERROR | 400 | Input validation failed |
| UNAUTHORIZED | 401 | Missing or invalid token |
| FORBIDDEN | 403 | Authenticated but not authorized |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Duplicate resource (e.g., email exists) |
| FILE_TOO_LARGE | 413 | Upload exceeds size limit |
| UNSUPPORTED_FILE | 415 | File type not allowed |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |
| QUOTA_EXCEEDED | 507 | Storage quota full |

---

## 4. Authentication Headers

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

File uploads use `multipart/form-data`.

---

## 5. API Endpoints

### 5.1 Authentication (`/api/v1/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /auth/register | ❌ | Create account |
| POST | /auth/login | ❌ | Login |
| POST | /auth/refresh | ❌ | Refresh access token |
| POST | /auth/forgot-password | ❌ | Request reset email |
| POST | /auth/reset-password | ❌ | Reset password with token |
| POST | /auth/logout | ✅ | Revoke refresh token |

#### POST /auth/register

```json
// Request
{
  "name": "Abhishek Choudhary",
  "email": "abhishek@example.com",
  "password": "SecureP@ss123"
}

// Response 201
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "Abhishek Choudhary",
      "email": "abhishek@example.com"
    },
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG..."
  }
}
```

#### POST /auth/login

```json
// Request
{
  "email": "abhishek@example.com",
  "password": "SecureP@ss123"
}

// Response 200
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "Abhishek Choudhary",
      "email": "abhishek@example.com",
      "avatarUrl": null
    },
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG..."
  }
}

// Error 401
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid email or password"
  }
}
```

#### POST /auth/refresh

```json
// Request
{
  "refreshToken": "eyJhbG..."
}

// Response 200
{
  "success": true,
  "data": {
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG..."  // Rotated
  }
}
```

#### POST /auth/forgot-password

```json
// Request
{ "email": "abhishek@example.com" }

// Response 200 (ALWAYS — no email enumeration)
{
  "success": true,
  "data": {
    "message": "If this email is registered, a reset link has been sent."
  }
}
```

#### POST /auth/reset-password

```json
// Request
{
  "token": "reset-token-from-email",
  "password": "NewSecureP@ss456"
}

// Response 200
{
  "success": true,
  "data": {
    "message": "Password reset successful"
  }
}
```

#### POST /auth/logout

```json
// Request
{
  "refreshToken": "eyJhbG..."
}

// Response 200
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

### 5.2 Dashboard (`/api/v1/dashboard`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /dashboard | ✅ | Get dashboard data |

#### GET /dashboard

```json
// Response 200
{
  "success": true,
  "data": {
    "today": {
      "medicines": [
        {
          "id": "uuid",
          "name": "Amlodipine",
          "dosage": "5mg",
          "schedules": [
            { "time": "08:00", "label": "Morning", "status": "taken" },
            { "time": "21:00", "label": "Night", "status": "pending" }
          ]
        }
      ],
      "reminders": [
        {
          "id": "uuid",
          "title": "Pay electricity bill",
          "dueDate": "2026-08-12T09:00:00Z",
          "category": "bills",
          "status": "ACTIVE"
        }
      ],
      "appointments": [
        {
          "id": "uuid",
          "doctorName": "Dr. Sharma",
          "time": "10:30",
          "purpose": "Follow-up"
        }
      ]
    },
    "attentionRequired": [
      {
        "type": "warranty_expiring",
        "title": "Samsung Refrigerator warranty expires in 7 days",
        "entityId": "uuid",
        "entityType": "warranty",
        "urgency": "high"
      },
      {
        "type": "medicine_low_stock",
        "title": "Amlodipine: ~3 days supply remaining",
        "entityId": "uuid",
        "entityType": "medicine",
        "urgency": "medium"
      }
    ],
    "upcoming": [
      {
        "date": "2026-08-15",
        "items": [
          { "type": "reminder", "title": "Car insurance renewal", "id": "uuid" },
          { "type": "appointment", "title": "Dr. Sharma", "id": "uuid" }
        ]
      }
    ],
    "stats": {
      "activeReminders": 12,
      "activeMedicines": 3,
      "documentsStored": 15,
      "unreadNotifications": 4
    }
  }
}
```

---

### 5.3 Reminders (`/api/v1/reminders`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /reminders | ✅ | List reminders (filterable) |
| POST | /reminders | ✅ | Create reminder |
| GET | /reminders/:id | ✅ | Get reminder details |
| PATCH | /reminders/:id | ✅ | Update reminder |
| DELETE | /reminders/:id | ✅ | Delete reminder |
| POST | /reminders/:id/complete | ✅ | Mark complete |
| POST | /reminders/:id/skip | ✅ | Mark skipped |
| POST | /reminders/:id/snooze | ✅ | Snooze reminder |
| GET | /reminders/:id/history | ✅ | Get action history |

#### POST /reminders

```json
// Request
{
  "title": "Renew Passport",
  "description": "Indian passport expires March 2027",
  "category": "documents",
  "startDate": "2026-08-12T00:00:00Z",  // required; use current date if creating immediately
  "dueDate": "2027-03-01T09:00:00Z",
  "recurrenceType": "ONCE",
  "notifyBefore": [1440, 60]  // 1 day + 1 hour before (in minutes)
}

// Response 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Renew Passport",
    "description": "Indian passport expires March 2027",
    "category": "documents",
    "dueDate": "2027-03-01T09:00:00Z",
    "recurrenceType": "ONCE",
    "status": "ACTIVE",
    "notifyBefore": [1440, 60],
    "linkedEntityType": "NONE",
    "createdAt": "2026-08-12T12:00:00Z"
  }
}
```

#### POST /reminders/:id/snooze

```json
// Request
{
  "duration": 60  // minutes
}

// Response 200
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "ACTIVE",
    "snoozedUntil": "2026-08-12T11:00:00Z"
  }
}
// Note: status remains ACTIVE — snooze is not a lifecycle state.
// snoozedUntil indicates when the reminder will re-fire.
```

#### GET /reminders?status=ACTIVE&page=1&limit=20

Valid `status` filter values: `ACTIVE` | `PAUSED` | `CANCELLED` | `EXPIRED`

- `ACTIVE` — reminder is live and will fire on `dueDate`
- `PAUSED` — user has temporarily suspended the reminder
- `CANCELLED` — reminder has been permanently stopped
- `EXPIRED` — one-time reminder was completed, or recurring reminder passed its `endDate`

```json
// Response 200
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "total": 12,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

### 5.4 Documents (`/api/v1/documents`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /documents | ✅ | List documents (filter, search) |
| POST | /documents | ✅ | Upload document (multipart) |
| GET | /documents/:id | ✅ | Get document metadata |
| PATCH | /documents/:id | ✅ | Update metadata |
| DELETE | /documents/:id | ✅ | Soft delete document |
| GET | /documents/:id/download-url | ✅ | Get signed download URL |
| POST | /documents/:id/restore | ✅ | Restore soft-deleted document |

#### POST /documents (multipart/form-data)

```
Fields:
  - file: (binary)
  - name: "Passport - Abhishek"
  - category: "PASSPORT"
  - description: "Indian passport scan"  (optional)
  - issueDate: "2020-06-20"  (optional)
  - expiryDate: "2030-06-20"  (optional)
  - tags: '["travel","identity"]'  (JSON string array, optional)
  - notes: "..."  (optional)
  - setExpiryReminder: true  (optional)
  - reminderDaysBefore: 90  (optional, default 30)
```

```json
// Response 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Passport - Abhishek",
    "category": "PASSPORT",
    "description": "Indian passport scan",
    "issueDate": "2020-06-20",
    "expiryDate": "2030-06-20",
    "tags": ["travel", "identity"],
    "fileName": "passport-scan.pdf",
    "fileSize": 2048576,
    "mimeType": "application/pdf",
    "createdAt": "2026-08-12T12:00:00Z"
  }
}
```

#### GET /documents?category=PASSPORT&search=passport&page=1&limit=20

Query params: `category`, `search` (name/tags), `page`, `limit`, `sortBy` (date/name), `sortOrder` (asc/desc)

#### GET /documents/:id/download-url

```json
// Response 200
{
  "success": true,
  "data": {
    "url": "https://storage.example.com/...",
    "expiresAt": "2026-08-12T12:15:00Z"
  }
}
```

---

### 5.5 Medicines (`/api/v1/medicines`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /medicines | ✅ | List medicines |
| POST | /medicines | ✅ | Create medicine + schedules |
| GET | /medicines/:id | ✅ | Get medicine detail |
| PATCH | /medicines/:id | ✅ | Update medicine |
| DELETE | /medicines/:id | ✅ | Delete medicine |
| PATCH | /medicines/:id/archive | ✅ | Archive/activate medicine |
| POST | /medicines/:id/doses | ✅ | Log dose action |
| GET | /medicines/:id/doses | ✅ | Get dose history |
| GET | /medicines/:id/adherence | ✅ | Get adherence summary |
| PATCH | /medicines/:id/stock | ✅ | Update stock |
| GET | /medicines/today | ✅ | Today's dose schedule |

#### POST /medicines

```json
// Request
{
  "name": "Amlodipine",
  "dosage": "5mg",
  "form": "TABLET",
  "mealRelation": "AFTER_FOOD",
  "instructions": "Take with water",
  "startDate": "2026-08-12",
  "endDate": null,
  "schedules": [
    { "time": "08:00", "label": "Morning", "daysOfWeek": [] },
    { "time": "21:00", "label": "Night", "daysOfWeek": [] }
  ],
  "stock": {
    "currentQty": 60,
    "unitsPerDose": 1,
    "dosesPerDay": 2,
    "refillThreshold": 14
  },
  "prescriptionId": null
}

// Response 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Amlodipine",
    "dosage": "5mg",
    "form": "TABLET",
    "mealRelation": "AFTER_FOOD",
    "isActive": true,
    "schedules": [
      { "id": "uuid", "time": "08:00", "label": "Morning", "daysOfWeek": [] },
      { "id": "uuid", "time": "21:00", "label": "Night", "daysOfWeek": [] }
    ],
    "stock": {
      "currentQty": 60,
      "unitsPerDose": 1,
      "dosesPerDay": 2,
      "refillThreshold": 14,
      "estimatedDaysRemaining": 30
    },
    "createdAt": "2026-08-12T12:00:00Z"
  }
}
```

#### POST /medicines/:id/doses

```json
// Request
{
  "scheduleId": "uuid",
  "scheduledAt": "2026-08-12T08:00:00Z",
  "action": "taken",
  "note": null
}

// Response 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "action": "taken",
    "scheduledAt": "2026-08-12T08:00:00Z",
    "actionAt": "2026-08-12T08:05:00Z",
    "stockRemaining": 59
  }
}
```

#### GET /medicines/today

```json
// Response 200
{
  "success": true,
  "data": [
    {
      "medicineId": "uuid",
      "name": "Amlodipine",
      "dosage": "5mg",
      "form": "TABLET",
      "mealRelation": "AFTER_FOOD",
      "doses": [
        { "scheduleId": "uuid", "time": "08:00", "label": "Morning", "status": "taken", "actionAt": "2026-08-12T08:05:00Z" },
        { "scheduleId": "uuid", "time": "21:00", "label": "Night", "status": "pending" }
      ]
    }
  ]
}
```

#### GET /medicines/:id/adherence?from=2026-07-01&to=2026-07-31

```json
// Response 200
{
  "success": true,
  "data": {
    "period": { "from": "2026-07-01", "to": "2026-07-31" },
    "summary": {
      "totalDoses": 62,
      "taken": 55,
      "skipped": 4,
      "missed": 3,
      "adherenceRate": 88.7
    },
    "daily": [
      { "date": "2026-07-01", "status": "full", "taken": 2, "total": 2 },
      { "date": "2026-07-02", "status": "partial", "taken": 1, "total": 2 },
      { "date": "2026-07-03", "status": "missed", "taken": 0, "total": 2 }
    ]
  }
}
```

---

### 5.6 Health Profile (`/api/v1/health-profile`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /health-profile | ✅ | Get health profile |
| PUT | /health-profile | ✅ | Create or update health profile |

#### PUT /health-profile

```json
// Request
{
  "bloodGroup": "B+",
  "allergies": ["Penicillin", "Dust"],
  "heightCm": 175,
  "weightKg": 72,
  "emergencyName": "Priya Choudhary",
  "emergencyPhone": "+919876543210",
  "medicalNotes": "Type 2 Diabetes, Hypertension"
}

// Response 200
{
  "success": true,
  "data": { ... }  // Full health profile object
}
```

---

### 5.7 Prescriptions (`/api/v1/prescriptions`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /prescriptions | ✅ | List prescriptions |
| POST | /prescriptions | ✅ | Create prescription (multipart) |
| GET | /prescriptions/:id | ✅ | Get prescription detail |
| PATCH | /prescriptions/:id | ✅ | Update prescription |
| DELETE | /prescriptions/:id | ✅ | Delete prescription |
| GET | /prescriptions/:id/download-url | ✅ | Get file download URL |

#### POST /prescriptions (multipart/form-data)

```
Fields:
  - file: (binary, optional)
  - doctorName: "Dr. Sharma"
  - clinicName: "City Hospital"
  - date: "2026-08-10"
  - notes: "Blood pressure medication review"
  - medicineIds: '["uuid1","uuid2"]'  (optional, JSON array)
```

---

### 5.8 Medical Reports (`/api/v1/medical-reports`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /medical-reports | ✅ | List reports (filter by type) |
| POST | /medical-reports | ✅ | Upload report (multipart) |
| GET | /medical-reports/:id | ✅ | Get report detail |
| PATCH | /medical-reports/:id | ✅ | Update report metadata |
| DELETE | /medical-reports/:id | ✅ | Delete report |
| GET | /medical-reports/:id/download-url | ✅ | Get file download URL |

#### POST /medical-reports (multipart/form-data)

```
Fields:
  - file: (binary)
  - title: "CBC Blood Test"
  - type: "BLOOD_TEST"
  - date: "2026-08-01"
  - doctorLab: "PathLab Diagnostics"
  - notes: "Routine check"
```

---

### 5.9 Doctors (`/api/v1/doctors`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /doctors | ✅ | List doctors |
| POST | /doctors | ✅ | Add doctor |
| GET | /doctors/:id | ✅ | Get doctor detail |
| PATCH | /doctors/:id | ✅ | Update doctor |
| DELETE | /doctors/:id | ✅ | Delete doctor |

#### POST /doctors

```json
// Request
{
  "name": "Dr. Sharma",
  "specialization": "Cardiologist",
  "hospital": "City Hospital",
  "phone": "+919876543210",
  "address": "123 Medical Complex, Mumbai",
  "notes": "Very good with blood pressure management"
}

// Response 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Dr. Sharma",
    "specialization": "Cardiologist",
    "hospital": "City Hospital",
    "phone": "+919876543210",
    "address": "123 Medical Complex, Mumbai",
    "notes": "Very good with blood pressure management",
    "createdAt": "2026-08-12T12:00:00Z"
  }
}
```

---

### 5.10 Appointments (`/api/v1/appointments`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /appointments | ✅ | List appointments (filter by status) |
| POST | /appointments | ✅ | Create appointment |
| GET | /appointments/:id | ✅ | Get appointment detail |
| PATCH | /appointments/:id | ✅ | Update appointment |
| DELETE | /appointments/:id | ✅ | Delete appointment |
| PATCH | /appointments/:id/complete | ✅ | Mark completed |
| PATCH | /appointments/:id/cancel | ✅ | Mark cancelled |

#### POST /appointments

```json
// Request
{
  "doctorId": "uuid",          // optional — can use doctorName instead
  "doctorName": "Dr. Sharma",  // required
  "date": "2026-08-20",
  "time": "10:30",
  "purpose": "Blood pressure follow-up",
  "notes": "Bring previous reports",
  "reminderMinutesBefore": [1440, 60]  // 1 day + 1 hour
}

// Response 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "doctorId": "uuid",
    "doctorName": "Dr. Sharma",
    "date": "2026-08-20",
    "time": "10:30",
    "purpose": "Blood pressure follow-up",
    "status": "UPCOMING",
    "prescriptionId": null,
    "createdAt": "2026-08-12T12:00:00Z"
  }
}
```

#### PATCH /appointments/:id

Updates appointment fields. Also used to attach a prescription after the visit.

```json
// Request (all fields optional — send only what is changing)
{
  "purpose": "Updated purpose",
  "notes": "Bring previous reports",
  "prescriptionId": "uuid"  // attach prescription created after the appointment
}
```

---

### 5.11 Warranties (`/api/v1/warranties`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /warranties | ✅ | List warranties (filter by status) |
| POST | /warranties | ✅ | Create warranty (multipart for invoice) |
| GET | /warranties/:id | ✅ | Get warranty detail |
| PATCH | /warranties/:id | ✅ | Update warranty |
| DELETE | /warranties/:id | ✅ | Delete warranty |
| GET | /warranties/:id/invoice-url | ✅ | Get invoice download URL |

#### POST /warranties (multipart/form-data)

```
Fields:
  - invoice: (binary, optional)
  - productName: "Samsung Refrigerator"
  - brand: "Samsung"
  - model: "RT28T3523S8"
  - purchaseDate: "2026-08-12"
  - warrantyMonths: 24  (OR expiryDate — one of the two)
  - expiryDate: "2028-08-12"
  - seller: "Croma Electronics"
  - notes: ""
```

#### GET /warranties?status=active&page=1&limit=20

Query params: `status` (active/expiring/expired), `page`, `limit`, `sortBy` (expiryDate/purchaseDate)

"expiring" = expires within 30 days.

---

### 5.12 Vehicles (`/api/v1/vehicles`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /vehicles | ✅ | List vehicles |
| POST | /vehicles | ✅ | Add vehicle |
| GET | /vehicles/:id | ✅ | Get vehicle detail |
| PATCH | /vehicles/:id | ✅ | Update vehicle |
| DELETE | /vehicles/:id | ✅ | Delete vehicle |

#### POST /vehicles

```json
// Request
{
  "name": "Honda City",
  "type": "CAR",
  "registrationNo": "MH-02-AB-1234",
  "insuranceExpiry": "2027-03-15",
  "pucExpiry": "2027-01-10",
  "nextServiceDate": "2026-11-01",
  "notes": "Petrol, 2022 model"
}

// Response 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Honda City",
    "type": "CAR",
    "registrationNo": "MH-02-AB-1234",
    "insuranceExpiry": "2027-03-15",
    "pucExpiry": "2027-01-10",
    "nextServiceDate": "2026-11-01",
    "notes": "Petrol, 2022 model",
    "createdAt": "2026-08-12T12:00:00Z"
  }
}
```

---

### 5.13 Notifications (`/api/v1/notifications`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /notifications | ✅ | List notifications (paginated) |
| PATCH | /notifications/:id/read | ✅ | Mark as read |
| POST | /notifications/read-all | ✅ | Mark all as read |
| GET | /notifications/unread-count | ✅ | Get unread count |

#### GET /notifications?page=1&limit=20

```json
// Response 200
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Time for Amlodipine",
      "body": "5mg — After food",
      "type": "medicine_dose",
      "data": { "entityType": "medicine", "entityId": "uuid", "screen": "MedicineDetail" },
      "isRead": false,
      "createdAt": "2026-08-12T08:00:00Z"
    }
  ],
  "meta": { "total": 120, "page": 1, "limit": 20, "totalPages": 6 }
}
```

---

### 5.14 User Profile (`/api/v1/profile`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /profile | ✅ | Get current user profile |
| PATCH | /profile | ✅ | Update profile |
| PATCH | /profile/password | ✅ | Change password |
| GET | /profile/preferences | ✅ | Get preferences |
| PUT | /profile/preferences | ✅ | Update preferences |
| DELETE | /profile/account | ✅ | Delete account |

#### PUT /profile/preferences

```json
// Request (all fields optional — send only what is changing)
{
  "timezone": "Asia/Kolkata",
  "notificationsEnabled": true,
  "medicinePush": true,
  "appointmentPush": true,
  "reminderPush": true,
  "warrantyPush": true,
  "vehiclePush": true,
  "documentPush": true,
  "quietHoursEnabled": false,
  "quietHoursStart": "22:00",
  "quietHoursEnd": "07:00",
  "theme": "system",
  "timeFormat": "12h",
  "defaultReminderTime": "09:00"
}
```

#### PATCH /profile

```json
// Request
{
  "name": "Abhishek C.",
  "phone": "+919876543210"
}
```

#### PATCH /profile/password

```json
// Request
{
  "currentPassword": "OldP@ss123",
  "newPassword": "NewP@ss456"
}
```

#### DELETE /profile/account

```json
// Request
{
  "password": "CurrentP@ss123",
  "confirmation": "DELETE"
}

// Response 200
{
  "success": true,
  "data": {
    "message": "Account deleted successfully"
  }
}
```

---

### 5.15 Device Tokens (`/api/v1/devices`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /devices/register | ✅ | Register FCM token |
| DELETE | /devices/:token | ✅ | Unregister token |

#### POST /devices/register

```json
// Request
{
  "token": "fcm-device-token-string",
  "platform": "ANDROID"
}
```

---

## 6. Query Parameters Convention

| Parameter | Usage | Example |
|-----------|-------|---------|
| page | Page number (1-based) | ?page=2 |
| limit | Items per page (max 50) | ?limit=20 |
| sortBy | Sort field | ?sortBy=createdAt |
| sortOrder | asc or desc | ?sortOrder=desc |
| search | Text search | ?search=passport |
| status | Filter by status | ?status=ACTIVE |
| from | Date range start | ?from=2026-07-01 |
| to | Date range end | ?to=2026-07-31 |

---

## 7. Rate Limiting

| Endpoint Group | Limit |
|---------------|-------|
| Auth (login, register) | 5 requests / 15 minutes / IP |
| Auth (forgot password) | 3 requests / hour / IP |
| General API | 100 requests / minute / user |
| File upload | 10 requests / minute / user |

---

## 8. API Versioning Strategy

- Use URL prefix versioning: `/api/v1/`
- Breaking changes = new version (`/api/v2/`)
- Non-breaking additions (new fields, new endpoints) don't require version bump
- Deprecation period: maintain old version for 6 months after new version ships

---

## 9. Endpoint Count Summary

| Module | Endpoints |
|--------|-----------|
| Auth | 6 |
| Dashboard | 1 |
| Reminders | 9 |
| Documents | 7 |
| Medicines | 11 |
| Health Profile | 2 |
| Prescriptions | 6 |
| Medical Reports | 6 |
| Doctors | 5 |
| Appointments | 7 |
| Warranties | 6 |
| Vehicles | 5 |
| Notifications | 4 |
| Profile | 6 |
| Devices | 2 |
| **Total** | **83** |
