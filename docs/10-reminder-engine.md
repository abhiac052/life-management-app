# [APP_NAME] — Universal Reminder Engine Architecture

> Document version: 1.0
> Status: 📋 Review
> Last updated: 2026-08-12

---

## 1. Design Philosophy

> **ONE engine. ALL modules plug into it.**

The Reminder Engine is NOT a "reminders feature" — it's a shared infrastructure service that:

- Medicines use for dose notifications
- Warranties use for expiry alerts
- Vehicles use for insurance/PUC/service reminders
- Documents use for expiry notifications
- Appointments use for pre-appointment alerts
- Users use for custom personal reminders

Each module creates reminders through the same interface. The engine handles scheduling, notifications, recurrence, and actions uniformly.

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Reminder Engine (Backend)                      │
│                                                                  │
│  ┌───────────────┐  ┌───────────────────┐  ┌────────────────┐  │
│  │   CRUD API    │  │  Scheduler (Cron)  │  │  Notification  │  │
│  │               │  │                    │  │    Sender      │  │
│  │  Create       │  │  Every 1 minute:   │  │                │  │
│  │  Update       │  │  Find due items    │  │  FCM Push      │  │
│  │  Delete       │  │  Generate notifs   │  │                │  │
│  │  Complete     │  │  Advance recurrence│  │                │  │
│  │  Skip/Snooze  │  │                    │  │                │  │
│  └───────┬───────┘  └─────────┬─────────┘  └───────▲────────┘  │
│          │                    │                      │           │
│          └────────────────────┼──────────────────────┘           │
│                               │                                   │
└───────────────────────────────┼───────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Module Integration Points                      │
│                                                                  │
│  Medicine Module ──► createReminder({ linkedEntity: MEDICINE })  │
│  Warranty Module ──► createReminder({ linkedEntity: WARRANTY })  │
│  Vehicle Module  ──► createReminder({ linkedEntity: VEHICLE })   │
│  Document Module ──► createReminder({ linkedEntity: DOCUMENT })  │
│  Appointment Mod ──► createReminder({ linkedEntity: APPOINTMENT})│
│  User (custom)   ──► createReminder({ linkedEntity: NONE })      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Dual Notification Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Notification Decision Tree                 │
│                                                              │
│  Is it time-critical? (medicine dose, appointment soon)      │
│      │                                                       │
│      ├── YES → LOCAL NOTIFICATION (device-scheduled)         │
│      │         • Fires even without internet                 │
│      │         • Scheduled by mobile app                     │
│      │         • Exact time delivery                         │
│      │                                                       │
│      └── NO → FCM PUSH (server-triggered)                   │
│               • Expiry warnings (days before)                │
│               • Attention items (stock low)                  │
│               • Daily digest (future)                        │
│               • Triggered by backend cron                    │
└─────────────────────────────────────────────────────────────┘
```

### Who Schedules What?

| Reminder Type | Scheduled By | Mechanism |
|--------------|--------------|-----------|
| Medicine dose (8:00 AM daily) | Mobile app | Local notification |
| Appointment (1 hour before) | Mobile app | Local notification |
| Custom reminder (specific time) | Mobile app | Local notification |
| Warranty expiry (30 days before) | Backend cron | FCM push |
| Vehicle insurance (30 days before) | Backend cron | FCM push |
| Document expiry (90 days before) | Backend cron | FCM push |
| Low medicine stock | Backend (on dose taken) | FCM push |
| Snoozed reminder (re-fire) | Mobile app | Local notification |

---

## 4. Recurrence Engine

### Supported Recurrence Types

| Type | Behavior | Example |
|------|----------|---------|
| ONCE | Fire once at dueDate | "Renew passport on 2027-03-01" |
| DAILY | Every day at specified time | "Take medicine at 8:00 AM" |
| WEEKLY | Specific days each week | "Gym every Mon/Wed/Fri" |
| MONTHLY | Same date each month | "Pay rent on the 1st" |
| YEARLY | Same date each year | "Birthday reminder" |
| CUSTOM | Complex rule (stored in JSON) | "Every 2 weeks on Tuesday" |

### Recurrence Rule Schema

```json
// DAILY — no extra config needed
{ "recurrenceType": "DAILY" }

// WEEKLY — specify days
{
  "recurrenceType": "WEEKLY",
  "recurrenceRule": {
    "daysOfWeek": [1, 3, 5]  // Mon, Wed, Fri (ISO: 1=Mon, 7=Sun)
  }
}

// MONTHLY — specify day of month
{
  "recurrenceType": "MONTHLY",
  "recurrenceRule": {
    "dayOfMonth": 15
  }
}

// YEARLY — month + day
{
  "recurrenceType": "YEARLY",
  "recurrenceRule": {
    "month": 3,
    "dayOfMonth": 15
  }
}

// CUSTOM — interval-based
{
  "recurrenceType": "CUSTOM",
  "recurrenceRule": {
    "interval": 2,         // Every 2...
    "unit": "weeks",       // ...weeks
    "daysOfWeek": [2]      // on Tuesday
  }
}
```

### Next Occurrence Calculation

When a recurring reminder is completed/skipped:

```
1. Take current dueDate
2. Based on recurrenceType + recurrenceRule, calculate next occurrence
3. If next occurrence > endDate → mark reminder as COMPLETED (permanently)
4. Otherwise → update dueDate to next occurrence, set status back to ACTIVE
```

This logic lives in `ReminderService.advanceToNextOccurrence()`.

---

## 5. Backend Scheduler (Cron)

### Job: `ReminderSchedulerService`

```typescript
@Injectable()
export class ReminderSchedulerService {
  
  // Runs every minute
  @Cron(CronExpression.EVERY_MINUTE)
  async processReminders() {
    const now = new Date();
    
    // Find reminders due for FCM notification
    // (Only server-triggered types: expiry warnings, stock alerts)
    const dueReminders = await this.findDueForServerNotification(now);
    
    for (const reminder of dueReminders) {
      await this.sendNotification(reminder);
      await this.markNotified(reminder);
    }
  }
  
  // Runs daily at 2:00 AM
  @Cron('0 2 * * *')
  async dailyExpiryCheck() {
    // Find items expiring within notification windows
    // Warranty: 30 days, 7 days
    // Vehicle insurance: 30 days, 7 days
    // Vehicle PUC: 15 days, 7 days
    // Documents: configured days before
    
    const expiringItems = await this.findExpiringItems();
    
    for (const item of expiringItems) {
      // Create notification record
      // Send FCM push to user's devices
      await this.notifyExpiry(item);
    }
  }
}
```

### Why Cron, Not Real-Time Event?

- Simple to implement and reason about
- No need for message queues or event bus in Phase 1
- A 1-minute check interval is sufficient for server-triggered notifications
- Local notifications handle real-time precision (exact time delivery on device)

---

## 6. Mobile Local Notification Scheduling

### When to Schedule

| Event | Action |
|-------|--------|
| Medicine created | Schedule notifications for all dose times |
| Medicine updated | Cancel old, schedule new notifications |
| Medicine archived/deleted | Cancel all its notifications |
| Appointment created | Schedule notifications (1 day + 1 hour before) |
| Custom reminder created | Schedule notification at (dueDate - notifyBefore) |
| Reminder snoozed | Schedule new notification at snooze time |
| App opened | Re-sync and verify scheduled notifications |

### Scheduling Strategy

Local notifications have OS limits:
- **iOS:** 64 pending local notifications max
- **Android:** No hard limit, but battery optimization can affect delivery

**Strategy:** Schedule only the next 7 days of notifications. On each app open, re-calculate and reschedule the next 7 days.

```typescript
// On app open / medicine change
async function syncLocalNotifications(medicines: Medicine[]) {
  // 1. Cancel all existing medicine notifications
  await cancelAllMedicineNotifications();
  
  // 2. Calculate next 7 days of doses
  const upcoming = calculateUpcomingDoses(medicines, 7);
  
  // 3. Schedule each one
  for (const dose of upcoming) {
    await scheduleLocalNotification({
      id: `medicine_${dose.medicineId}_${dose.scheduledAt}`,
      title: `Time for ${dose.medicineName}`,
      body: `${dose.dosage} — ${dose.mealRelation}`,
      fireDate: dose.scheduledAt,
      data: { type: 'medicine_dose', medicineId: dose.medicineId, scheduleId: dose.scheduleId }
    });
  }
}
```

### Library

`@notifee/react-native` — reliable local notifications for both iOS and Android with:
- Exact scheduling
- Notification categories (actions from notification: "Taken", "Skip", "Snooze")
- Background handling
- Notification channels (Android)

---

## 7. Module Integration API

### How Modules Create Reminders

```typescript
// Warranty module creates an expiry reminder
class WarrantyService {
  constructor(private reminderService: ReminderService) {}
  
  async createWarranty(userId: string, dto: CreateWarrantyDto) {
    // 1. Create warranty
    const warranty = await this.prisma.warranty.create({ ... });
    
    // 2. Create system-generated reminders
    await this.reminderService.createSystemReminder({
      userId,
      title: `${warranty.productName} warranty expires soon`,
      linkedEntityType: 'WARRANTY',
      linkedEntityId: warranty.id,
      dueDate: subDays(warranty.expiryDate, 30), // 30 days before
      recurrenceType: 'ONCE',
      notifyBefore: [0],
      isSystemGenerated: true,
    });
    
    await this.reminderService.createSystemReminder({
      userId,
      title: `${warranty.productName} warranty expires in 7 days`,
      linkedEntityType: 'WARRANTY',
      linkedEntityId: warranty.id,
      dueDate: subDays(warranty.expiryDate, 7), // 7 days before
      recurrenceType: 'ONCE',
      notifyBefore: [0],
      isSystemGenerated: true,
    });
    
    return warranty;
  }
}
```

### When Modules Delete Their Entity

```typescript
// If a warranty is deleted, clean up its reminders
async deleteWarranty(userId: string, warrantyId: string) {
  await this.prisma.warranty.delete({ where: { id: warrantyId, userId } });
  await this.reminderService.deleteLinkedReminders('WARRANTY', warrantyId);
}
```

---

## 8. Reminder Actions

### Complete

```
User marks reminder as complete
    → Create ReminderAction { action: "completed" }
    → If ONCE: set status = COMPLETED
    → If recurring: calculate next occurrence, update dueDate
    → Cancel/reschedule local notification
```

### Skip

```
User skips a reminder occurrence
    → Create ReminderAction { action: "skipped" }
    → If ONCE: set status = COMPLETED (treated as dismissed)
    → If recurring: calculate next occurrence, update dueDate
    → Cancel current notification
```

### Snooze

```
User snoozes for X minutes
    → Create ReminderAction { action: "snoozed", snoozedTo: now + X }
    → Set status = SNOOZED, snoozedUntil = now + X
    → Schedule new local notification for snoozedUntil
    → When snoozed notification fires:
        → User takes action (complete/skip/snooze again)
        → If no action: status reverts to ACTIVE at next check
```

---

## 9. Dashboard Integration

The Dashboard calls `ReminderService.getOverview(userId)` which returns:

```typescript
interface DashboardReminders {
  today: Reminder[];          // Due today, not yet completed
  overdue: Reminder[];        // Past due, not completed
  upcoming: Reminder[];       // Next 7 days
  attentionCount: number;     // Items needing immediate attention
}
```

This query is optimized with indexes on `(userId, dueDate, status)`.

---

## 10. Edge Cases

| Case | Handling |
|------|----------|
| User creates reminder in the past | Reject — dueDate must be in future (for one-time); for recurring, start from next valid occurrence |
| Recurring reminder with no end date | Runs indefinitely until user cancels or archives |
| All occurrences completed (end date reached) | Status → COMPLETED permanently |
| Device timezone changes | Local notifications use device time; server stores UTC; next app open reconciles |
| Multiple devices | Local notifications scheduled independently per device; server is source of truth for state |
| App not opened for days | Local notifications still fire (scheduled up to 7 days ahead); on next open, missed items shown as overdue |
| Notification permission denied | App works without notifications; reminders still visible in-app; prompt user to enable |

---

## 11. Data Flow Example: Medicine Dose

```
1. User creates medicine with schedule: 8:00 AM daily
2. Mobile app schedules local notifications for next 7 days at 8:00 AM
3. Backend creates NO reminder for this (medicine doses are local-only)

4. At 8:00 AM:
   → Device fires local notification: "Time for Amlodipine 5mg"
   → Notification actions: [Taken] [Skip] [Snooze]
   
5. User taps "Taken":
   → App marks dose: POST /medicines/:id/doses { action: "taken" }
   → Stock decremented
   → If stock ≤ threshold: Backend sends FCM "Stock running low"
   
6. If user doesn't respond within 30 minutes:
   → Follow-up local notification (optional, configurable)
   → If still no action by end of day: dose marked as "missed"
```

**Key insight:** Medicine dose reminders do NOT use the Reminder table. They use `MedicineSchedule` directly + local notifications. The Reminder Engine is for module-level alerts (warranty expiry, etc.), not high-frequency per-dose tracking.

---

## 12. Performance Considerations

| Concern | Solution |
|---------|----------|
| Cron hitting many reminders | Index on (dueDate, status); batch processing |
| Many users' reminders due same time | Process in batches of 100; FCM supports batch sends |
| Mobile notification limit (iOS: 64) | Schedule only 7 days ahead; prioritize medicines > appointments > custom |
| Database growth from ReminderActions | Older actions can be archived/summarized (future optimization) |
| Dashboard query performance | Composite index; limit results; cache with TanStack Query |
