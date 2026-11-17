# Sweety — Blood Glucose Tracking Application

Sweety is a full-stack web application designed to help individuals with diabetes record, manage, and analyze their daily blood glucose measurements across four structured meal-related time slots.

---

## 1. Project Overview

Sweety enables users to:
- Register and authenticate securely using JWT and bcrypt password hashing.
- Record up to **four daily blood glucose readings** across predefined time slots:
  1. `Morning (fasting)`
  2. `After breakfast`
  3. `After lunch`
  4. `After dinner`
- View, filter, paginate, edit, and delete historical blood glucose readings.
- Enforce strict clinical/business validation rules (`40–600 mg/dL` whole numbers, no duplicate slots per date, max 4 readings per day, no future dates, and strict user ownership).
- Generate **Daily**, **Month-to-Date (MTD)**, and **Previous Monthly** statistical reports (highest, lowest, average rounded to one decimal place, total count, and interactive trend charts).

---

## 2. Technology Stack

### Frontend (`client/`)
- **React 18** + **Vite**
- **Tailwind CSS** (responsive UI styling)
- **React Router v6** (protected client-side routing)
- **Axios** (HTTP client with JWT interceptors)
- **Recharts** (glucose trend visualization)
- **Vitest + React Testing Library** (frontend component testing)

### Backend (`server/`)
- **Node.js** + **Express.js** (modular REST API)
- **Prisma ORM** (schema management, migrations, parameterized queries)
- **PostgreSQL** (relational database)
- **bcryptjs** & **jsonwebtoken (JWT)** (authentication & security)
- **Jest** + **Supertest** (automated API & business logic testing)

---

## 3. Repository Structure

```text
Sweety/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── api/            # Axios client & API service modules
│   │   ├── components/     # Navbar, StatCards, ReadingFormModal, TrendChart, etc.
│   │   ├── context/        # AuthContext (JWT session management)
│   │   ├── pages/          # Login, Register, Dashboard, History, Reports
│   │   └── test/           # React Testing Library unit/component tests
│   └── package.json
├── server/                 # Node.js + Express backend
│   ├── prisma/
│   │   ├── migrations/     # SQL schema migration history
│   │   ├── schema.prisma   # Prisma schema (User & Reading models)
│   │   └── seed.js         # Demo user & sample readings seed script
│   ├── src/
│   │   ├── config/         # Environment & Prisma client setup
│   │   ├── controllers/    # Express route controllers
│   │   ├── middleware/     # JWT auth & centralized error handling
│   │   ├── routes/         # /api/auth, /api/readings, /api/reports
│   │   ├── services/       # Core business logic & report calculations
│   │   ├── utils/          # Date & time-slot utilities
│   │   └── validators/     # Request & business rule validators (BR-01 to BR-07)
│   ├── tests/              # Jest + Supertest integration test suites
│   └── package.json
├── docs/
│   └── SPEC-SHEET.md       # Product & Technical Specification
├── docker-compose.yml      # Optional Docker Compose stack (PostgreSQL, API, Client)
├── .env.example            # Root environment variable template
└── README.md
```

---

## 4. Installation & Local Setup

### Prerequisites
- **Node.js** v18+ (tested with Node.js v20/v24)
- **PostgreSQL** v14+ (local instance or via Docker)

### Step 1: Clone the Repository & Install Dependencies
```bash
git clone <repository-url>
cd Sweety

# Install backend dependencies
npm install --prefix server

# Install frontend dependencies
npm install --prefix client
```

### Step 2: Environment Configuration
Copy the `.env.example` files and configure your PostgreSQL connection string:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Example `server/.env`:
```env
PORT=5000
NODE_ENV=development

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sweety?schema=public"

JWT_SECRET="replace-with-a-secure-jwt-secret-key"
JWT_EXPIRES_IN=1d

CLIENT_URL=http://localhost:5173
```

Example `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Database Setup & Migrations
Ensure your PostgreSQL server is running and a database named `sweety` exists (or allow Prisma to create it):

```bash
cd server
npx prisma generate
npx prisma migrate dev --name init
```

### Step 4: Seed Demo Data
Populate the database with the demo account and sample readings spanning today, the current month, and the previous calendar month:

```bash
npm run seed --prefix server
```

#### Demo Account Credentials
| Field | Value |
|---|---|
| **Email** | `demo@sweety.test` |
| **Password** | `Demo@1234` |

*(You can also click the **"Fill Demo Account"** button directly on the Login page.)*

---

## 5. Running the Application

### Start the Backend Server
```bash
npm run dev --prefix server
```
The API will be available at `http://localhost:5000/api` (health check: `GET http://localhost:5000/api/health`).

### Start the Frontend Development Server
```bash
npm run dev --prefix client
```
Open `http://localhost:5173` in your browser.

---

## 6. Running Automated Tests

### Backend Tests (Jest + Supertest)
Covers authentication, all 7 business validation rules (`BR-01` through `BR-07`), CRUD ownership isolation, and daily/MTD/monthly reporting calculations:
```bash
npm test --prefix server
```

### Frontend Component Tests (Vitest + React Testing Library)
Covers reading form rendering, required-field validation, range validation, API error display, and form submission:
```bash
npm test --prefix client
```

---

## 7. REST API Reference

Base URL: `/api`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register a new user account |
| `POST` | `/auth/login` | Public | Authenticate user and receive JWT |
| `GET` | `/auth/me` | Bearer JWT | Get current authenticated user |
| `POST` | `/readings` | Bearer JWT | Record a new blood glucose reading |
| `GET` | `/readings` | Bearer JWT | List user's readings (supports `date`, `from`, `to`, `page`, `limit`) |
| `GET` | `/readings/:id` | Bearer JWT | Retrieve a single reading by ID |
| `PUT` | `/readings/:id` | Bearer JWT | Update an existing reading |
| `DELETE` | `/readings/:id` | Bearer JWT | Delete an existing reading |
| `GET` | `/reports/daily?date=YYYY-MM-DD` | Bearer JWT | Daily statistics and slot reading list |
| `GET` | `/reports/month-to-date?date=YYYY-MM-DD` | Bearer JWT | Month-to-date statistics (`YYYY-MM-01` to `date`) |
| `GET` | `/reports/monthly?date=YYYY-MM-DD` | Bearer JWT | Full previous calendar month statistics |

---

## 8. Assumptions & Technical Decisions

1. **Data Isolation:** Every user manages an isolated collection of readings; ownership is verified on all individual reading operations (`BR-06`).
2. **Local Calendar Date Convention:** Dates are submitted and evaluated as `YYYY-MM-DD` strings in the user's local calendar date and normalized to UTC midnight (`@db.Date`) in PostgreSQL to prevent timezone offset drift.
3. **Fixed Predefined Time Slots:** The four slots (`MORNING_FASTING`, `AFTER_BREAKFAST`, `AFTER_LUNCH`, `AFTER_DINNER`) are fixed. The API accepts either the enum code or the display label and returns both (`time_slot` and `time_slot_label`).
4. **Validation Precedence (`BR-04` vs `BR-03`):** Because there are exactly 4 valid time slots per day, checking `dailyCount >= 4` (`BR-04`) prior to duplicate-slot (`BR-03`) guarantees that attempting to add a 5th reading on a full day returns `"You can add only 4 readings per day."`, while adding a duplicate slot when fewer than 4 readings exist returns `"You already have an <slot> reading for this date."`.
5. **Report Calculation Rules:** Report averages are computed across all individual readings in the date range (not an average of daily averages) and rounded to 1 decimal place. Empty periods return `total_readings: 0` and `null` for `highest`, `lowest`, and `average`.

---

## 9. Bonus Features Included & Future Improvements

### Included Bonus Enhancements
- **Reading History Pagination:** Server-side and client-side pagination (`page` & `limit`) with date-range filtering.
- **Glucose Trend Visualization:** Interactive `Recharts` trend chart on the Reports page for Month-to-Date and Previous Monthly views.
- **Frontend Component Tests:** Automated `React Testing Library` suite for `ReadingFormModal`.
- **Docker Compose Setup:** `docker-compose.yml` for containerized PostgreSQL and application services.

### Future Improvements
- Redis caching for historical monthly reports.
- BullMQ scheduled daily reminder notifications.
- Doctor / caregiver read-only sharing permissions and PDF export.
