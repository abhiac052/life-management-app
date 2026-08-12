# [APP_NAME]

> Personal & Family Life Management Platform

**"Never forget an important life responsibility again."**

## Status

🏗️ **Pre-development** — Architecture & design phase

## Overview

A mobile-first application that helps individuals manage important responsibilities, documents, health records, medicines, assets, and recurring tasks from one secure place.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native CLI + TypeScript |
| Backend | NestJS + TypeScript |
| Database | PostgreSQL + Prisma |
| Storage | Abstract StorageService (local / S3-compatible) |
| Notifications | Local Notifications + Firebase Cloud Messaging |

## Project Structure

```
life-management-app/
├── docs/           # Architecture & design documents
├── backend/        # NestJS API server
├── mobile/         # React Native application
└── shared/         # Shared types/constants (if needed)
```

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

## Development

Setup instructions will be added after the architecture phase is complete.

## License

Private — All rights reserved.
