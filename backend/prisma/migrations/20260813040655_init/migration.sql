-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "RecurrenceType" AS ENUM ('ONCE', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "LinkedEntityType" AS ENUM ('MEDICINE', 'WARRANTY', 'VEHICLE', 'DOCUMENT', 'APPOINTMENT', 'NONE');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('AADHAAR', 'PAN', 'PASSPORT', 'DRIVING_LICENCE', 'INSURANCE', 'PROPERTY', 'EDUCATION', 'MEDICAL', 'VEHICLE', 'OTHER');

-- CreateEnum
CREATE TYPE "MedicineForm" AS ENUM ('TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'DROPS', 'INHALER', 'CREAM', 'OTHER');

-- CreateEnum
CREATE TYPE "MealRelation" AS ENUM ('BEFORE_FOOD', 'AFTER_FOOD', 'WITH_FOOD', 'NO_PREFERENCE');

-- CreateEnum
CREATE TYPE "MedicalReportType" AS ENUM ('BLOOD_TEST', 'XRAY', 'CT_SCAN', 'MRI', 'ULTRASOUND', 'ECG', 'VACCINATION', 'LAB_REPORT', 'OTHER');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('UPCOMING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('CAR', 'BIKE', 'SCOOTER', 'OTHER');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('IOS', 'ANDROID');

-- CreateTable
CREATE TABLE "households" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "households_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bloodGroup" TEXT,
    "allergies" TEXT[],
    "heightCm" DOUBLE PRECISION,
    "weightKg" DOUBLE PRECISION,
    "emergencyName" TEXT,
    "emergencyPhone" TEXT,
    "medicalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "recurrenceType" "RecurrenceType" NOT NULL DEFAULT 'ONCE',
    "recurrenceRule" JSONB,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "notifyBefore" INTEGER[] DEFAULT ARRAY[0]::INTEGER[],
    "status" "ReminderStatus" NOT NULL DEFAULT 'ACTIVE',
    "snoozedUntil" TIMESTAMP(3),
    "linkedEntityType" "LinkedEntityType" NOT NULL DEFAULT 'NONE',
    "linkedEntityId" TEXT,
    "isSystemGenerated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminder_actions" (
    "id" TEXT NOT NULL,
    "reminderId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "note" TEXT,
    "snoozedTo" TIMESTAMP(3),
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reminder_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "DocumentCategory" NOT NULL,
    "description" TEXT,
    "issueDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "tags" TEXT[],
    "notes" TEXT,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicines" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "form" "MedicineForm" NOT NULL,
    "mealRelation" "MealRelation" NOT NULL DEFAULT 'NO_PREFERENCE',
    "instructions" TEXT,
    "notes" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "prescriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medicines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicine_schedules" (
    "id" TEXT NOT NULL,
    "medicineId" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "label" TEXT,
    "daysOfWeek" INTEGER[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medicine_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicine_doses" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "action" TEXT NOT NULL,
    "actionAt" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medicine_doses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicine_stocks" (
    "id" TEXT NOT NULL,
    "medicineId" TEXT NOT NULL,
    "currentQty" INTEGER NOT NULL,
    "unitsPerDose" INTEGER NOT NULL DEFAULT 1,
    "dosesPerDay" INTEGER NOT NULL DEFAULT 1,
    "refillThreshold" INTEGER NOT NULL DEFAULT 7,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medicine_stocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "doctorName" TEXT NOT NULL,
    "clinicName" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "fileName" TEXT,
    "filePath" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_reports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "MedicalReportType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "doctorLab" TEXT,
    "notes" TEXT,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctors" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "specialization" TEXT,
    "hospital" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "doctorId" TEXT,
    "doctorName" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "purpose" TEXT,
    "notes" TEXT,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'UPCOMING',
    "prescriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warranties" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "purchaseDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "seller" TEXT,
    "notes" TEXT,
    "invoiceFileName" TEXT,
    "invoiceFilePath" TEXT,
    "invoiceFileSize" INTEGER,
    "invoiceMimeType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warranties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "VehicleType" NOT NULL,
    "registrationNo" TEXT,
    "insuranceExpiry" TIMESTAMP(3),
    "pucExpiry" TIMESTAMP(3),
    "nextServiceDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "medicinePush" BOOLEAN NOT NULL DEFAULT true,
    "appointmentPush" BOOLEAN NOT NULL DEFAULT true,
    "reminderPush" BOOLEAN NOT NULL DEFAULT true,
    "warrantyPush" BOOLEAN NOT NULL DEFAULT true,
    "vehiclePush" BOOLEAN NOT NULL DEFAULT true,
    "documentPush" BOOLEAN NOT NULL DEFAULT true,
    "quietHoursEnabled" BOOLEAN NOT NULL DEFAULT false,
    "quietHoursStart" TEXT,
    "quietHoursEnd" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'system',
    "timeFormat" TEXT NOT NULL DEFAULT '12h',
    "defaultReminderTime" TEXT NOT NULL DEFAULT '09:00',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_householdId_idx" ON "users"("householdId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON "refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "refresh_tokens_tokenHash_idx" ON "refresh_tokens"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "health_profiles_userId_key" ON "health_profiles"("userId");

-- CreateIndex
CREATE INDEX "reminders_userId_status_idx" ON "reminders"("userId", "status");

-- CreateIndex
CREATE INDEX "reminders_userId_dueDate_idx" ON "reminders"("userId", "dueDate");

-- CreateIndex
CREATE INDEX "reminders_dueDate_status_idx" ON "reminders"("dueDate", "status");

-- CreateIndex
CREATE INDEX "reminders_linkedEntityType_linkedEntityId_idx" ON "reminders"("linkedEntityType", "linkedEntityId");

-- CreateIndex
CREATE INDEX "reminder_actions_reminderId_idx" ON "reminder_actions"("reminderId");

-- CreateIndex
CREATE INDEX "documents_userId_category_idx" ON "documents"("userId", "category");

-- CreateIndex
CREATE INDEX "documents_userId_deletedAt_idx" ON "documents"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "documents_userId_name_idx" ON "documents"("userId", "name");

-- CreateIndex
CREATE INDEX "medicines_userId_isActive_idx" ON "medicines"("userId", "isActive");

-- CreateIndex
CREATE INDEX "medicine_schedules_medicineId_idx" ON "medicine_schedules"("medicineId");

-- CreateIndex
CREATE INDEX "medicine_doses_scheduleId_scheduledAt_idx" ON "medicine_doses"("scheduleId", "scheduledAt");

-- CreateIndex
CREATE INDEX "medicine_doses_userId_scheduledAt_idx" ON "medicine_doses"("userId", "scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "medicine_stocks_medicineId_key" ON "medicine_stocks"("medicineId");

-- CreateIndex
CREATE INDEX "prescriptions_userId_idx" ON "prescriptions"("userId");

-- CreateIndex
CREATE INDEX "medical_reports_userId_type_idx" ON "medical_reports"("userId", "type");

-- CreateIndex
CREATE INDEX "medical_reports_userId_date_idx" ON "medical_reports"("userId", "date");

-- CreateIndex
CREATE INDEX "doctors_userId_idx" ON "doctors"("userId");

-- CreateIndex
CREATE INDEX "appointments_userId_status_idx" ON "appointments"("userId", "status");

-- CreateIndex
CREATE INDEX "appointments_userId_date_idx" ON "appointments"("userId", "date");

-- CreateIndex
CREATE INDEX "warranties_userId_idx" ON "warranties"("userId");

-- CreateIndex
CREATE INDEX "warranties_userId_expiryDate_idx" ON "warranties"("userId", "expiryDate");

-- CreateIndex
CREATE INDEX "vehicles_userId_idx" ON "vehicles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "device_tokens_token_key" ON "device_tokens"("token");

-- CreateIndex
CREATE INDEX "device_tokens_userId_idx" ON "device_tokens"("userId");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_profiles" ADD CONSTRAINT "health_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminder_actions" ADD CONSTRAINT "reminder_actions_reminderId_fkey" FOREIGN KEY ("reminderId") REFERENCES "reminders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicines" ADD CONSTRAINT "medicines_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicines" ADD CONSTRAINT "medicines_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "prescriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicine_schedules" ADD CONSTRAINT "medicine_schedules_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "medicines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicine_doses" ADD CONSTRAINT "medicine_doses_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "medicine_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicine_stocks" ADD CONSTRAINT "medicine_stocks_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "medicines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_reports" ADD CONSTRAINT "medical_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "prescriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warranties" ADD CONSTRAINT "warranties_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_tokens" ADD CONSTRAINT "device_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
