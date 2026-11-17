# Sweety — Blood Glucose Tracker

Sweety is a full-stack web application for recording and tracking daily blood glucose levels across four meal-related time slots (`Morning (fasting)`, `After breakfast`, `After lunch`, and `After dinner`).

---

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, React Router, Axios, Recharts
- **Backend:** Node.js, Express, Prisma ORM, JWT, bcryptjs
- **Database:** PostgreSQL
- **Testing:** Jest & Supertest (Backend), Vitest & React Testing Library (Frontend)

---

## Quick Start (Docker Compose)

Run the entire stack (PostgreSQL, Backend API, Demo Seed, and Frontend) with a single command:

```bash
docker compose up --build
```

- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:5000/api`

---

## Manual Local Setup

### 1. Install Dependencies
```bash
npm install --prefix server
npm install --prefix client
```

### 2. Configure Environment Variables
Copy the example environment files:
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```
Update `DATABASE_URL` in `server/.env` with your local PostgreSQL credentials:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sweety?schema=public"
JWT_SECRET="replace-with-a-secure-jwt-secret-key"
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
```

### 3. Setup Database & Seed Demo Data
```bash
npm run prisma:generate --prefix server
npm run prisma:push --prefix server
npm run seed --prefix server
```

### 4. Start the Application
```bash
# Terminal 1 — Backend (http://localhost:5000)
npm run dev --prefix server

# Terminal 2 — Frontend (http://localhost:5173)
npm run dev --prefix client
```

---

## Demo Account

| Field | Value |
|---|---|
| **Email** | `demo@sweety.test` |
| **Password** | `Demo@1234` |

*(You can also use the **One-Click Demo Login** button on the sign-in page.)*

---

## Running Tests

```bash
# Backend API & Business Rule Tests (Jest + Supertest)
npm test --prefix server

# Frontend Component Tests (Vitest + React Testing Library)
npm test --prefix client
```

---

## Key Features & Validation Rules

- **Authentication:** Secure JWT login/registration with `bcrypt` password hashing and password complexity check (at least 1 capital letter and 1 number).
- **Blood Glucose Logging (CRUD):** Add, view, filter, edit, and delete readings.
- **Business Rules Enforced:**
  1. Glucose value is required (`"Please enter a glucose value."`).
  2. Whole numbers between `40` and `600 mg/dL` (`"Value must be between 40 and 600 mg/dl."`).
  3. One reading per time slot per day (`"You already have an <slot> reading for this date."`).
  4. Maximum 4 readings per day (`"You can add only 4 readings per day."`).
  5. Future dates are rejected (`"Date cannot be in the future."`).
  6. Strict user ownership isolation.
- **Reports:** Daily, This Month (Month-to-Date), and Last Month (Previous Month) statistics (highest, lowest, average rounded to 1 decimal place, total count, healthy range breakdown, and glucose trend chart).
