# test-build-fixes-001

A simple task management web app with user authentication, full CRUD for tasks, and an admin dashboard for system management. Built with Next.js 14 App Router, Prisma, and SQLite.

## Features
- User registration and login with JWT
- Task CRUD with status and priority
- Task list pagination, filtering, and sorting
- Admin dashboard with user management and system stats
- Health endpoint for monitoring
- Tailwind CSS UI scaffold
- Jest + Playwright testing setup

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Prisma ORM (SQLite)
- Tailwind CSS
- Jest + React Testing Library
- Playwright

## Prerequisites
- Node.js 18+
- npm 9+

## Quick Start
### macOS/Linux
```bash
bash install.sh
npm run dev
```

### Windows PowerShell
```powershell
./install.ps1
npm run dev
```

## Environment Variables
Create a `.env` file from `.env.example`:
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-min-32-chars-change-in-production"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

## Project Structure
```
src/
  app/                # App Router pages and API routes
  components/         # Reusable UI components
  providers/          # React context providers
  lib/                # Utilities and Prisma client
  types/              # Shared TypeScript types
prisma/               # Prisma schema
```

## API Endpoints
- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/:id`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `GET /api/admin/users`
- `PUT /api/admin/users/:id/role`
- `GET /api/admin/stats`

## Available Scripts
- `npm run dev` - Start dev server
- `npm run build` - Build (includes `prisma generate`)
- `npm run start` - Start production server
- `npm run lint` - Lint
- `npm run test` - Run Jest tests
- `npm run test:e2e` - Run Playwright tests

## Testing
- Unit/Integration: `npm run test`
- E2E: `npm run test:e2e`

## Notes
- SQLite is used for local development. Swap `DATABASE_URL` for Postgres in production.
- JWT secrets must be long and secure in production.
