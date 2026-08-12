# [APP_NAME] — Folder Structure

> Document version: 1.0
> Status: 📋 Review
> Last updated: 2026-08-12

---

## 1. Repository Structure (Monorepo)

```
life-management-app/
├── docs/                          # Architecture documents (this folder)
├── backend/                       # NestJS API server
├── mobile/                        # React Native application
├── .gitignore
├── README.md
└── .editorconfig                  # Consistent formatting across editors
```

**Note:** This is a simple monorepo without workspace tooling (no Turborepo, no Lerna). Both projects are independent — they share no runtime code. The monorepo is for organizational convenience only.

---

## 2. Backend Structure (NestJS)

```
backend/
├── src/
│   ├── main.ts                              # App bootstrap
│   ├── app.module.ts                        # Root module
│   │
│   ├── config/                              # Configuration
│   │   ├── app.config.ts                    # App-level config (port, env)
│   │   ├── auth.config.ts                   # JWT secrets, expiry
│   │   ├── database.config.ts               # Database URL
│   │   ├── storage.config.ts                # Storage provider config
│   │   └── notification.config.ts           # FCM config
│   │
│   ├── common/                              # Shared utilities & base classes
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts    # @CurrentUser() param decorator
│   │   │   └── api-response.decorator.ts    # Swagger response decorators
│   │   ├── dto/
│   │   │   ├── pagination.dto.ts            # Pagination query params
│   │   │   └── api-response.dto.ts          # Response envelope types
│   │   ├── filters/
│   │   │   └── global-exception.filter.ts   # Global error handler
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts            # JWT authentication guard
│   │   ├── interceptors/
│   │   │   ├── response.interceptor.ts      # Wrap responses in envelope
│   │   │   └── logging.interceptor.ts       # Request/response logging
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts           # Global validation pipe config
│   │   └── utils/
│   │       ├── pagination.util.ts           # Pagination helper
│   │       └── date.util.ts                 # Date calculation helpers
│   │
│   ├── modules/                             # Feature modules
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   └── jwt.strategy.ts          # Passport JWT strategy
│   │   │   ├── dto/
│   │   │   │   ├── register.dto.ts
│   │   │   │   ├── login.dto.ts
│   │   │   │   ├── refresh-token.dto.ts
│   │   │   │   ├── forgot-password.dto.ts
│   │   │   │   └── reset-password.dto.ts
│   │   │   └── guards/
│   │   │       └── local-auth.guard.ts
│   │   │
│   │   ├── dashboard/
│   │   │   ├── dashboard.module.ts
│   │   │   ├── dashboard.controller.ts
│   │   │   └── dashboard.service.ts         # Aggregates data from other services
│   │   │
│   │   ├── reminders/
│   │   │   ├── reminders.module.ts
│   │   │   ├── reminders.controller.ts
│   │   │   ├── reminders.service.ts
│   │   │   ├── reminder-scheduler.service.ts # Cron: find due reminders
│   │   │   └── dto/
│   │   │       ├── create-reminder.dto.ts
│   │   │       ├── update-reminder.dto.ts
│   │   │       └── snooze-reminder.dto.ts
│   │   │
│   │   ├── documents/
│   │   │   ├── documents.module.ts
│   │   │   ├── documents.controller.ts
│   │   │   ├── documents.service.ts
│   │   │   └── dto/
│   │   │       ├── create-document.dto.ts
│   │   │       ├── update-document.dto.ts
│   │   │       └── query-documents.dto.ts
│   │   │
│   │   ├── medicines/
│   │   │   ├── medicines.module.ts
│   │   │   ├── medicines.controller.ts
│   │   │   ├── medicines.service.ts
│   │   │   ├── medicine-stock.service.ts
│   │   │   └── dto/
│   │   │       ├── create-medicine.dto.ts
│   │   │       ├── update-medicine.dto.ts
│   │   │       ├── log-dose.dto.ts
│   │   │       └── update-stock.dto.ts
│   │   │
│   │   ├── health-profile/
│   │   │   ├── health-profile.module.ts
│   │   │   ├── health-profile.controller.ts
│   │   │   ├── health-profile.service.ts
│   │   │   └── dto/
│   │   │       └── update-health-profile.dto.ts
│   │   │
│   │   ├── prescriptions/
│   │   │   ├── prescriptions.module.ts
│   │   │   ├── prescriptions.controller.ts
│   │   │   ├── prescriptions.service.ts
│   │   │   └── dto/
│   │   │       ├── create-prescription.dto.ts
│   │   │       └── update-prescription.dto.ts
│   │   │
│   │   ├── medical-reports/
│   │   │   ├── medical-reports.module.ts
│   │   │   ├── medical-reports.controller.ts
│   │   │   ├── medical-reports.service.ts
│   │   │   └── dto/
│   │   │       ├── create-report.dto.ts
│   │   │       └── update-report.dto.ts
│   │   │
│   │   ├── doctors/
│   │   │   ├── doctors.module.ts
│   │   │   ├── doctors.controller.ts
│   │   │   ├── doctors.service.ts
│   │   │   └── dto/
│   │   │       ├── create-doctor.dto.ts
│   │   │       └── update-doctor.dto.ts
│   │   │
│   │   ├── appointments/
│   │   │   ├── appointments.module.ts
│   │   │   ├── appointments.controller.ts
│   │   │   ├── appointments.service.ts
│   │   │   └── dto/
│   │   │       ├── create-appointment.dto.ts
│   │   │       └── update-appointment.dto.ts
│   │   │
│   │   ├── warranties/
│   │   │   ├── warranties.module.ts
│   │   │   ├── warranties.controller.ts
│   │   │   ├── warranties.service.ts
│   │   │   └── dto/
│   │   │       ├── create-warranty.dto.ts
│   │   │       └── update-warranty.dto.ts
│   │   │
│   │   ├── vehicles/
│   │   │   ├── vehicles.module.ts
│   │   │   ├── vehicles.controller.ts
│   │   │   ├── vehicles.service.ts
│   │   │   └── dto/
│   │   │       ├── create-vehicle.dto.ts
│   │   │       └── update-vehicle.dto.ts
│   │   │
│   │   ├── notifications/
│   │   │   ├── notifications.module.ts
│   │   │   ├── notifications.controller.ts
│   │   │   ├── notifications.service.ts       # Notification CRUD & queries
│   │   │   ├── notification-sender.service.ts # FCM sending logic
│   │   │   └── dto/
│   │   │       └── register-device.dto.ts
│   │   │
│   │   └── profile/
│   │       ├── profile.module.ts
│   │       ├── profile.controller.ts
│   │       ├── profile.service.ts
│   │       └── dto/
│   │           ├── update-profile.dto.ts
│   │           ├── change-password.dto.ts
│   │           ├── update-preferences.dto.ts
│   │           └── delete-account.dto.ts
│   │
│   └── shared/                              # Shared services (cross-module)
│       ├── storage/
│       │   ├── storage.module.ts
│       │   ├── storage.service.ts           # Interface
│       │   ├── local-storage.service.ts     # Development
│       │   └── s3-storage.service.ts        # Production
│       │
│       ├── email/
│       │   ├── email.module.ts
│       │   └── email.service.ts             # Password reset emails
│       │
│       └── prisma/
│           ├── prisma.module.ts
│           └── prisma.service.ts            # Prisma client wrapper
│
├── prisma/
│   ├── schema.prisma                        # Database schema
│   ├── migrations/                          # Migration files
│   └── seed.ts                              # Optional dev seed data
│
├── test/
│   ├── app.e2e-spec.ts                      # E2E test setup
│   ├── auth.e2e-spec.ts
│   ├── reminders.e2e-spec.ts
│   ├── medicines.e2e-spec.ts
│   ├── documents.e2e-spec.ts
│   └── jest-e2e.json
│
├── .env.example                             # Environment template
├── .eslintrc.js
├── .prettierrc
├── nest-cli.json
├── package.json
├── tsconfig.json
├── tsconfig.build.json
└── README.md
```

---

## 3. Backend Architecture Rules

| Rule | Description |
|------|-------------|
| One module = one domain | Each module handles one business domain |
| Module encapsulation | Controllers call only their own service |
| Cross-module communication | Via DI — import the other module, inject its service |
| No controller-to-controller | Controllers never call other controllers |
| DTOs at boundary | All inputs validated through DTOs |
| Service layer = business logic | Controllers are thin (validate, delegate, respond) |
| Shared services | StorageService, PrismaService used by multiple modules |
| Config module | All configuration via NestJS ConfigModule |
| No hardcoded values | Environment-specific values come from .env |

---

## 4. Mobile Structure (React Native CLI)

```
mobile/
├── android/                                 # Native Android project
├── ios/                                     # Native iOS project
│
├── src/
│   ├── App.tsx                              # Root component
│   ├── index.ts                             # App entry point
│   │
│   ├── app/                                 # App-level configuration
│   │   ├── navigation/
│   │   │   ├── RootNavigator.tsx            # Auth check + stack selection
│   │   │   ├── AuthNavigator.tsx            # Auth stack
│   │   │   ├── MainNavigator.tsx            # Bottom tabs
│   │   │   ├── HomeStack.tsx
│   │   │   ├── HealthStack.tsx
│   │   │   ├── VaultStack.tsx
│   │   │   ├── ManageStack.tsx
│   │   │   ├── ProfileStack.tsx
│   │   │   └── types.ts                     # Navigation param types
│   │   │
│   │   ├── providers/
│   │   │   ├── QueryProvider.tsx            # TanStack Query setup
│   │   │   ├── ThemeProvider.tsx            # Theme context
│   │   │   └── NotificationProvider.tsx     # Notification handling
│   │   │
│   │   └── config/
│   │       ├── env.ts                       # Environment variables
│   │       └── constants.ts                 # App constants
│   │
│   ├── features/                            # Feature modules
│   │   ├── auth/
│   │   │   ├── screens/
│   │   │   │   ├── WelcomeScreen.tsx
│   │   │   │   ├── LoginScreen.tsx
│   │   │   │   ├── RegisterScreen.tsx
│   │   │   │   ├── ForgotPasswordScreen.tsx
│   │   │   │   └── ResetPasswordScreen.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useLogin.ts
│   │   │   │   ├── useRegister.ts
│   │   │   │   └── useAuth.ts              # Auth state hook
│   │   │   ├── services/
│   │   │   │   └── auth.service.ts         # Auth API calls
│   │   │   └── store/
│   │   │       └── auth.store.ts           # Zustand: tokens, user
│   │   │
│   │   ├── dashboard/
│   │   │   ├── screens/
│   │   │   │   ├── DashboardScreen.tsx
│   │   │   │   ├── AllUpcomingScreen.tsx
│   │   │   │   └── NotificationHistoryScreen.tsx
│   │   │   ├── components/
│   │   │   │   ├── TodaySection.tsx
│   │   │   │   ├── AttentionSection.tsx
│   │   │   │   ├── UpcomingSection.tsx
│   │   │   │   └── QuickActions.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useDashboard.ts
│   │   │   └── services/
│   │   │       └── dashboard.service.ts
│   │   │
│   │   ├── reminders/
│   │   │   ├── screens/
│   │   │   │   ├── ReminderListScreen.tsx
│   │   │   │   ├── ReminderDetailScreen.tsx
│   │   │   │   ├── CreateReminderScreen.tsx
│   │   │   │   └── EditReminderScreen.tsx
│   │   │   ├── components/
│   │   │   │   ├── ReminderCard.tsx
│   │   │   │   ├── ReminderForm.tsx
│   │   │   │   └── RecurrencePicker.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useReminders.ts
│   │   │   │   ├── useReminderDetail.ts
│   │   │   │   └── useReminderMutations.ts
│   │   │   └── services/
│   │   │       └── reminders.service.ts
│   │   │
│   │   ├── documents/
│   │   │   ├── screens/
│   │   │   │   ├── VaultHomeScreen.tsx
│   │   │   │   ├── DocumentDetailScreen.tsx
│   │   │   │   ├── CreateDocumentScreen.tsx
│   │   │   │   ├── EditDocumentScreen.tsx
│   │   │   │   └── DocumentViewerScreen.tsx
│   │   │   ├── components/
│   │   │   │   ├── DocumentCard.tsx
│   │   │   │   ├── DocumentForm.tsx
│   │   │   │   ├── CategoryFilter.tsx
│   │   │   │   └── FileUploader.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useDocuments.ts
│   │   │   │   └── useDocumentMutations.ts
│   │   │   └── services/
│   │   │       └── documents.service.ts
│   │   │
│   │   ├── medicines/
│   │   │   ├── screens/
│   │   │   │   ├── MedicineListScreen.tsx
│   │   │   │   ├── MedicineDetailScreen.tsx
│   │   │   │   ├── CreateMedicineScreen.tsx
│   │   │   │   ├── EditMedicineScreen.tsx
│   │   │   │   ├── MedicineHistoryScreen.tsx
│   │   │   │   └── MedicineStockScreen.tsx
│   │   │   ├── components/
│   │   │   │   ├── MedicineCard.tsx
│   │   │   │   ├── DoseActionCard.tsx
│   │   │   │   ├── MedicineForm/
│   │   │   │   │   ├── BasicInfoStep.tsx
│   │   │   │   │   ├── ScheduleStep.tsx
│   │   │   │   │   └── OptionalStep.tsx
│   │   │   │   ├── AdherenceCalendar.tsx
│   │   │   │   └── StockIndicator.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useMedicines.ts
│   │   │   │   ├── useMedicineDetail.ts
│   │   │   │   ├── useTodayDoses.ts
│   │   │   │   └── useMedicineMutations.ts
│   │   │   └── services/
│   │   │       └── medicines.service.ts
│   │   │
│   │   ├── health/
│   │   │   ├── screens/
│   │   │   │   ├── HealthHomeScreen.tsx
│   │   │   │   └── HealthProfileScreen.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useHealthProfile.ts
│   │   │   └── services/
│   │   │       └── health-profile.service.ts
│   │   │
│   │   ├── prescriptions/
│   │   │   ├── screens/
│   │   │   │   ├── PrescriptionListScreen.tsx
│   │   │   │   ├── PrescriptionDetailScreen.tsx
│   │   │   │   └── CreatePrescriptionScreen.tsx
│   │   │   ├── components/
│   │   │   │   └── PrescriptionCard.tsx
│   │   │   ├── hooks/
│   │   │   │   └── usePrescriptions.ts
│   │   │   └── services/
│   │   │       └── prescriptions.service.ts
│   │   │
│   │   ├── medical-reports/
│   │   │   ├── screens/
│   │   │   │   ├── ReportListScreen.tsx
│   │   │   │   ├── ReportDetailScreen.tsx
│   │   │   │   └── CreateReportScreen.tsx
│   │   │   ├── components/
│   │   │   │   └── ReportCard.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useMedicalReports.ts
│   │   │   └── services/
│   │   │       └── medical-reports.service.ts
│   │   │
│   │   ├── doctors/
│   │   │   ├── screens/
│   │   │   │   ├── DoctorListScreen.tsx
│   │   │   │   ├── DoctorDetailScreen.tsx
│   │   │   │   └── CreateDoctorScreen.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useDoctors.ts
│   │   │   └── services/
│   │   │       └── doctors.service.ts
│   │   │
│   │   ├── appointments/
│   │   │   ├── screens/
│   │   │   │   ├── AppointmentListScreen.tsx
│   │   │   │   ├── AppointmentDetailScreen.tsx
│   │   │   │   └── CreateAppointmentScreen.tsx
│   │   │   ├── components/
│   │   │   │   └── AppointmentCard.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAppointments.ts
│   │   │   └── services/
│   │   │       └── appointments.service.ts
│   │   │
│   │   ├── warranties/
│   │   │   ├── screens/
│   │   │   │   ├── WarrantyListScreen.tsx
│   │   │   │   ├── WarrantyDetailScreen.tsx
│   │   │   │   ├── CreateWarrantyScreen.tsx
│   │   │   │   └── EditWarrantyScreen.tsx
│   │   │   ├── components/
│   │   │   │   ├── WarrantyCard.tsx
│   │   │   │   └── ExpiryCountdown.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useWarranties.ts
│   │   │   └── services/
│   │   │       └── warranties.service.ts
│   │   │
│   │   ├── vehicles/
│   │   │   ├── screens/
│   │   │   │   ├── VehicleListScreen.tsx
│   │   │   │   ├── VehicleDetailScreen.tsx
│   │   │   │   ├── CreateVehicleScreen.tsx
│   │   │   │   └── EditVehicleScreen.tsx
│   │   │   ├── components/
│   │   │   │   └── VehicleCard.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useVehicles.ts
│   │   │   └── services/
│   │   │       └── vehicles.service.ts
│   │   │
│   │   └── profile/
│   │       ├── screens/
│   │       │   ├── ProfileHomeScreen.tsx
│   │       │   ├── EditProfileScreen.tsx
│   │       │   ├── NotificationSettingsScreen.tsx
│   │       │   ├── AppSettingsScreen.tsx
│   │       │   ├── ChangePasswordScreen.tsx
│   │       │   ├── PrivacySecurityScreen.tsx
│   │       │   ├── DeleteAccountScreen.tsx
│   │       │   └── AboutScreen.tsx
│   │       ├── hooks/
│   │       │   ├── useProfile.ts
│   │       │   └── usePreferences.ts
│   │       └── services/
│   │           └── profile.service.ts
│   │
│   ├── shared/                              # Shared/reusable code
│   │   ├── components/                      # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── BottomSheet.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── LoadingSkeleton.tsx
│   │   │   ├── ErrorState.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── DatePicker.tsx
│   │   │   ├── TimePicker.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Divider.tsx
│   │   │   └── Icon.tsx
│   │   │
│   │   ├── hooks/                           # Shared hooks
│   │   │   ├── useDebounce.ts
│   │   │   ├── useKeyboard.ts
│   │   │   ├── useRefreshOnFocus.ts
│   │   │   └── useNetworkStatus.ts
│   │   │
│   │   ├── services/                        # Shared services
│   │   │   ├── api.ts                       # Axios instance + interceptors
│   │   │   ├── secure-storage.ts            # Keychain/EncryptedSharedPrefs
│   │   │   ├── notification.service.ts      # Local notification scheduling
│   │   │   └── file-picker.service.ts       # Document/image picker
│   │   │
│   │   ├── types/                           # Shared TypeScript types
│   │   │   ├── api.types.ts                 # Response envelope, pagination
│   │   │   ├── entities.types.ts            # Entity interfaces
│   │   │   └── navigation.types.ts          # Navigation param types
│   │   │
│   │   ├── utils/                           # Utility functions
│   │   │   ├── date.ts                      # Date formatting/calculations
│   │   │   ├── validation.ts                # Zod schemas
│   │   │   └── format.ts                    # Number, string formatting
│   │   │
│   │   └── theme/                           # Design system
│   │       ├── colors.ts
│   │       ├── typography.ts
│   │       ├── spacing.ts
│   │       ├── shadows.ts
│   │       └── index.ts
│   │
│   └── assets/                              # Static assets
│       ├── images/
│       ├── icons/
│       └── fonts/
│
├── __tests__/                               # Test files
│   ├── features/
│   │   ├── auth/
│   │   ├── medicines/
│   │   └── ...
│   └── shared/
│       └── components/
│
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── babel.config.js
├── metro.config.js
├── react-native.config.js
├── tsconfig.json
├── package.json
├── Gemfile                                  # iOS CocoaPods
└── README.md
```

---

## 5. Mobile Architecture Rules

| Rule | Description |
|------|-------------|
| Feature-first organization | Code grouped by feature, not by type |
| Screen = thin | Screens compose components, call hooks, handle navigation |
| Components = pure UI | Reusable, receive data via props |
| Hooks = logic | Custom hooks encapsulate data fetching & mutations |
| Services = API layer | All HTTP calls isolated in service files |
| No business logic in components | Logic lives in hooks or services |
| Types co-located or shared | Feature-specific types in feature, shared types in shared/ |
| No cross-feature imports | Features don't import from each other directly |
| Shared only for truly reusable code | Don't put feature-specific code in shared/ |

---

## 6. Feature Module Pattern

Every feature follows the same internal structure:

```
feature-name/
├── screens/          # Screen components (one per screen)
├── components/       # Feature-specific UI components
├── hooks/            # Data fetching, mutations, logic
├── services/         # API call functions
├── store/            # Zustand store (only if needed — rare)
└── types/            # Feature-specific types (only if needed)
```

Not every feature needs all folders. Simpler features (like `health-profile`) may only have `screens/`, `hooks/`, and `services/`.

---

## 7. Naming Conventions

### Backend (NestJS)

| Type | Convention | Example |
|------|-----------|---------|
| Module file | `{feature}.module.ts` | `reminders.module.ts` |
| Controller | `{feature}.controller.ts` | `reminders.controller.ts` |
| Service | `{feature}.service.ts` | `reminders.service.ts` |
| DTO | `{action}-{feature}.dto.ts` | `create-reminder.dto.ts` |
| Class names | PascalCase | `RemindersController` |
| Method names | camelCase | `createReminder()` |
| Routes | kebab-case, plural | `/api/v1/reminders` |

### Mobile (React Native)

| Type | Convention | Example |
|------|-----------|---------|
| Screen file | `{Name}Screen.tsx` | `MedicineListScreen.tsx` |
| Component file | `{Name}.tsx` | `MedicineCard.tsx` |
| Hook file | `use{Name}.ts` | `useMedicines.ts` |
| Service file | `{feature}.service.ts` | `medicines.service.ts` |
| Store file | `{feature}.store.ts` | `auth.store.ts` |
| Type file | `{feature}.types.ts` | `api.types.ts` |
| Component names | PascalCase | `MedicineCard` |
| Hook names | camelCase with `use` prefix | `useMedicines` |
| Service functions | camelCase | `getMedicines()` |

---

## 8. Import Path Strategy

### Backend
Use NestJS module system — no path aliases needed. Imports are relative within a module, absolute (via module imports) across modules.

### Mobile
Configure path aliases in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@app/*": ["src/app/*"],
      "@features/*": ["src/features/*"],
      "@shared/*": ["src/shared/*"],
      "@assets/*": ["src/assets/*"]
    }
  }
}
```

Usage:
```typescript
import { Button } from '@shared/components/Button';
import { useMedicines } from '@features/medicines/hooks/useMedicines';
import { theme } from '@shared/theme';
```

---

## 9. Environment Files

### Backend `.env.example`
```env
# App
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/life_management_dev

# Auth
JWT_ACCESS_SECRET=your-access-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Storage
STORAGE_PROVIDER=local
STORAGE_LOCAL_PATH=./uploads
# S3 (production)
# STORAGE_PROVIDER=s3
# S3_BUCKET=your-bucket
# S3_REGION=ap-south-1
# S3_ACCESS_KEY=your-key
# S3_SECRET_KEY=your-secret

# FCM
FCM_PROJECT_ID=your-project-id
FCM_PRIVATE_KEY=your-private-key
FCM_CLIENT_EMAIL=your-client-email

# Email (password reset)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your-user
SMTP_PASS=your-pass
EMAIL_FROM=noreply@app-name.com

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

### Mobile `.env.example`
```env
API_BASE_URL=http://localhost:3000/api/v1
```
