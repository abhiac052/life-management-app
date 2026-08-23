# Life Management App

> Personal & Family Life Management Platform

**"Never forget an important life responsibility again."**

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native CLI + TypeScript |
| Backend | NestJS + TypeScript |
| Database | PostgreSQL + Prisma |
| Storage | Local / S3-compatible |
| Notifications | Local Notifications + Firebase Cloud Messaging |

## Project Structure

```
life-management-app/
├── docs/       # Architecture & design documents
├── backend/    # NestJS API server
├── mobile/     # React Native application
└── shared/     # Shared types/constants
```

---

## Prerequisites

Make sure these are installed on your machine:

- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/) v14+
- [Android Studio](https://developer.android.com/studio) (for Android emulator)
- [Xcode](https://developer.apple.com/xcode/) (for iOS simulator, Mac only)
- [JDK 17](https://www.oracle.com/java/technologies/downloads/) (for Android builds)

---

## 1. Backend Setup

### Install dependencies
```bash
cd backend
npm install
```

### Configure environment
```bash
cp .env.example .env
```

Edit `.env` and set your PostgreSQL credentials:
```env
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/life_management_dev
JWT_ACCESS_SECRET=any-random-secret
JWT_REFRESH_SECRET=another-random-secret
```

### Create the database
```bash
createdb life_management_dev
```

### Run migrations
```bash
npx prisma migrate deploy
```

### Start the backend
```bash
npm run start:dev
```

Backend runs at `http://localhost:3000/api/v1`

---

## 2. Mobile Setup

### Install dependencies
```bash
cd mobile
npm install
```

### Android — Run on emulator
```bash
# Start Android emulator from Android Studio first, then:
npx react-native run-android
```

### Android — Run on physical device
1. Enable Developer Options on your phone (tap Build Number 7 times)
2. Enable USB Debugging
3. Connect via USB
4. Update `src/shared/services/api.ts` — replace `10.0.2.2` with your Mac's local IP:
   ```bash
   ipconfig getifaddr en0   # get your Mac IP
   ```
5. Run:
   ```bash
   npx react-native run-android --device
   ```

### iOS — Run on simulator
```bash
npx react-native run-ios
```

---

## 3. Build APK (Android)

### Debug APK (for quick testing)
```bash
cd mobile

# Bundle JS
npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output android/app/src/main/assets/index.android.bundle \
  --assets-dest android/app/src/main/res

# Build APK
cd android && ./gradlew assembleDebug
```

APK output: `android/app/build/outputs/apk/debug/app-debug.apk`

> **Note:** Debug APK requires Metro bundler running on the same network. For a standalone APK use `assembleRelease` with a signed keystore.

---

## Architecture Documents

See [`docs/`](./docs/) for complete architecture documentation:

1. [Phase 1 Feature List](./docs/01-phase1-features.md)
2. [Product Architecture](./docs/02-product-architecture.md)
3. [Navigation Map](./docs/03-navigation-map.md)
4. [Screen List](./docs/04-screen-list.md)
5. [User Flows](./docs/05-user-flows.md)
6. [Database Schema](./docs/06-database-schema.md)
7. [API Architecture](./docs/07-api-architecture.md)
8. [Folder Structure](./docs/08-folder-structure.md)
9. [Authentication Architecture](./docs/09-auth-architecture.md)
10. [Reminder Engine Architecture](./docs/10-reminder-engine.md)
11. [Document Storage Architecture](./docs/11-document-storage.md)
12. [Security Model](./docs/12-security-model.md)
13. [Development Roadmap](./docs/13-development-roadmap.md)

---

## License

Private — All rights reserved.
