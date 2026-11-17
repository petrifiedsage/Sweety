# SWEETY
## Blood Glucose Tracking Application
### Product & Technical Specification

**Document Version:** 1.0  
**Project Type:** Full-Stack Web Application  
**Assessment:** Kenpath – Junior Full Stack Developer (JavaScript & AI)  
**Technology:** React, Node.js, Express, PostgreSQL  
**Status:** Development Specification

---

# 1. Project Overview

## 1.1 Product Description

Sweety is a web-based blood glucose tracking application designed to help individuals with diabetes record and monitor their daily blood glucose readings.

Users can record up to four readings per day, corresponding to different meal-related time slots. The application provides tools to manage these readings and review glucose statistics through daily and monthly reports.

The system consists of a React frontend, a Node.js and Express backend, and a PostgreSQL relational database.

## 1.2 Problem Statement

Individuals monitoring their blood glucose levels need a simple and structured way to maintain daily records and review historical measurements.

Sweety addresses this by providing:

- Centralized storage of glucose readings.
- Structured recording based on daily time slots.
- Validation to prevent duplicate or invalid entries.
- Historical reading management.
- Statistical summaries across different date ranges.

## 1.3 Project Objectives

1. Provide secure user registration and authentication.
2. Allow users to create, view, edit and delete glucose readings.
3. Enforce all specified reading validation rules.
4. Generate daily, month-to-date and previous-month reports.
5. Protect user data through authentication and ownership checks.
6. Provide a clean, responsive and intuitive interface.
7. Maintain readable, modular and testable code.

## 1.4 Target Users

**Primary user:** An individual with diabetes who monitors and records blood glucose measurements.

**User capabilities:**
- Maintain a personal account.
- Record glucose measurements.
- Review historical records.
- Correct or remove incorrect entries.
- View statistical reports.

---

# 2. Scope of the Application

## 2.1 Mandatory Features

The following features are required by the assessment:

| Module | Functionality |
|---|---|
| Authentication | Sign up and log in |
| Reading management | Add readings |
| Reading management | View readings |
| Reading management | Edit readings |
| Reading management | Delete readings |
| Validation | Enforce five specified validation rules |
| Daily reporting | Daily statistics and reading list |
| MTD reporting | Statistics from the first day of the month to the selected date |
| Monthly reporting | Statistics for the entire previous month |

## 2.2 Optional Enhancements

These are explicitly identified as bonus features in the assessment:

- Pagination for reading history.
- Monthly glucose trend chart.
- Docker Compose setup.
- React Testing Library tests.
- Redis caching for reports.
- BullMQ background jobs.
- Doctor and patient account relationship.

**Implementation priority:** Complete all mandatory functionality before attempting optional features.

## 2.3 Out of Scope

Unless time permits, the initial version will not include:

- Integration with physical glucose monitoring devices.
- Automated medical diagnosis.
- Medication recommendations.
- Insulin dosage calculations.
- Doctor consultations.
- Medical record interoperability.
- Push notifications.
- AI-powered medical predictions.

---

# 3. Technology Stack

## 3.1 Frontend

| Technology | Purpose |
|---|---|
| React | UI development |
| Vite | Development server and build tooling |
| JavaScript | Application logic |
| Tailwind CSS | Styling and responsive layouts |
| React Router | Client-side routing |
| Axios | HTTP communication |
| Recharts | Optional glucose trend visualization |

## 3.2 Backend

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | REST API framework |
| Prisma ORM | Database access and schema management |
| bcrypt | Password hashing |
| JWT | Authentication |
| Zod or express-validator | Request validation |
| dotenv | Environment configuration |

## 3.3 Database

**PostgreSQL**

Used for storing:
- User accounts.
- Blood glucose readings.
- Reading timestamps and associated information.

## 3.4 Testing

| Tool | Purpose |
|---|---|
| Jest | Unit testing |
| Supertest | API integration testing |
| React Testing Library | Optional frontend component testing |

*The technologies above are our proposed implementation choices. The assessment requires React, Node.js, Express and PostgreSQL, but does not mandate the specific supporting libraries.*

---

# 4. Functional Requirements

## FR-01: User Registration

The application must allow a new user to register.

### Required fields

- Full name
- Email address
- Password

### Expected behaviour

1. User enters registration details.
2. Frontend validates required fields.
3. Registration information is sent to the backend.
4. Backend validates the information.
5. Password is hashed using bcrypt.
6. User information is stored in PostgreSQL.
7. User receives registration confirmation.

### Validation

- Name cannot be empty.
- Email must have a valid format.
- Email must not already exist.
- Password cannot be empty.

### Security

Plain-text passwords must never be stored in the database.

---

## FR-02: User Login

Existing users must be able to authenticate using their registered email and password.

### Expected behaviour

1. User enters email and password.
2. Backend retrieves the corresponding account.
3. Password is compared against the stored bcrypt hash.
4. On successful authentication, a JWT is generated.
5. The frontend stores and uses the authentication credential.
6. User is redirected to the dashboard.

### Error handling

- Invalid email or password.
- Missing credentials.
- Unauthorized API requests.
- Expired or invalid authentication token.

### Security requirements

- Passwords must be hashed.
- Protected routes must require authentication.
- Users must only access their own readings.

---

## FR-03: Blood Glucose Reading Management

Users must be able to create, view, edit and delete glucose readings.

### Reading data structure

Each reading contains:

| Field | Description |
|---|---|
| Reading ID | Unique identifier |
| User ID | Owner of the reading |
| Date | Date of measurement |
| Time slot | Measurement category |
| Glucose value | Measured glucose level in mg/dL |
| Created at | Record creation timestamp |
| Updated at | Last modification timestamp |

### Supported time slots

The application must support exactly four predefined slots:

1. Morning (fasting)
2. After breakfast
3. After lunch
4. After dinner

### Add reading

Users can submit:
- Reading date.
- Time slot.
- Glucose value.

After successful validation, the record is stored in the database.

### View readings

Users must be able to view their own historical readings.

The interface should display:
- Date.
- Time slot.
- Glucose value.
- Edit action.
- Delete action.

### Edit reading

Users can modify:
- Reading date.
- Time slot.
- Glucose value.

All validation rules must be applied again during editing.

### Delete reading

Users can delete an existing reading.

A confirmation step is recommended to prevent accidental deletion.

---

# 5. Business Rules and Validation

These are critical assessment requirements.

## BR-01: Required glucose value

A reading cannot be submitted without a glucose value.

Error message:

"Please enter a glucose value."

## BR-02: Glucose value range

The value must be a whole number between 40 and 600 mg/dL, inclusive.

Valid examples:
- 40
- 95
- 120
- 250
- 600

Invalid examples:
- 39
- 601
- 120.5
- Negative values
- Non-numeric input

Error message:

"Value must be between 40 and 600 mg/dl."

## BR-03: One reading per slot per day

A user cannot record multiple readings for the same time slot on the same date.

Example:

If a user has already recorded an After lunch reading for 15 October 2026, another After lunch reading cannot be added for that date.

Error message:

"You already have an After lunch reading for this date."

## BR-04: Maximum four readings per day

A user cannot record more than four readings on a particular date.

Since there are four predefined slots, this also ensures that every slot can only be used once.

Error message:

"You can add only 4 readings per day."

## BR-05: No future dates

Users cannot record readings for future dates.

Error message:

"Date cannot be in the future."

## BR-06: User ownership

A user can only view, edit or delete readings belonging to their account.

Attempts to access another user's records must be rejected.

## BR-07: Editing existing readings

Editing a reading must not incorrectly trigger the duplicate-slot or maximum-four-readings rules against the record itself.

The updated record must still satisfy all business rules.

---

# 6. Reporting Module

The reporting module is one of the application's primary features.

Each report must calculate:

1. Highest glucose reading.
2. Lowest glucose reading.
3. Average glucose reading, rounded to one decimal place.
4. Total number of readings.

If no readings exist in the selected date range, the application must show a friendly empty state.

## FR-04A: Daily Report

### Date range

The selected calendar date.

### Example

Selected date: 15 October 2026.

Date range: 15 October 2026.

### Required information

- Highest reading.
- Lowest reading.
- Average reading.
- Total readings.
- Individual readings with their corresponding time slots.

### Example output

Highest: 160 mg/dL  
Lowest: 95 mg/dL  
Average: 122.5 mg/dL  
Total readings: 4

Reading history:

| Time slot | Value |
|---|---:|
| Morning (fasting) | 95 |
| After breakfast | 120 |
| After lunch | 160 |
| After dinner | 115 |

## FR-04B: Month-to-Date Report

### Date range

From the first day of the selected month through the selected date, inclusive.

### Example

Selected date: 15 October 2026.

Date range: 1 October – 15 October 2026.

### Required information

- Highest reading in the period.
- Lowest reading in the period.
- Average reading in the period.
- Total readings in the period.

## FR-04C: Previous Monthly Report

### Date range

The entire previous calendar month.

### Example

Selected date: 15 October 2026.

Date range: 1 September – 30 September 2026.

### Required information

- Highest reading.
- Lowest reading.
- Average reading.
- Total readings.

## Reporting Calculation Rules

For a set of readings:

**Maximum:** Highest glucose value.

**Minimum:** Lowest glucose value.

**Average:**

Sum of all readings divided by the number of readings.

The average must be rounded to one decimal place.

**Total:** Number of readings included in the selected report.

Reports must be calculated using only the authenticated user's records.

---

# 7. Database Specification

## 7.1 Users Table

| Column | Data type | Constraints |
|---|---|---|
| id | UUID | Primary key |
| name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| created_at | TIMESTAMP | Default current timestamp |
| updated_at | TIMESTAMP | Updated automatically |

## 7.2 Readings Table

| Column | Data type | Constraints |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | Foreign key |
| reading_date | DATE | NOT NULL |
| time_slot | VARCHAR(30) | NOT NULL |
| glucose_value | INTEGER | NOT NULL |
| created_at | TIMESTAMP | Default current timestamp |
| updated_at | TIMESTAMP | Updated automatically |

### Database constraints

- User email must be unique.
- Every reading must reference an existing user.
- Glucose value must be between 40 and 600.
- Reading date and time slot must be unique for each user.
- Time slot must belong to the predefined four values.

### Relationships

One user can have multiple readings.

One reading belongs to exactly one user.

Relationship: Users (1) → Readings (Many).

### Important implementation note

The maximum-four-per-day rule must also be enforced in backend logic. A unique database constraint on user, date and slot prevents duplicate slots, but does not alone express every possible daily-limit rule.

---

# 8. REST API Specification

Base URL: `/api`

## Authentication APIs

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /auth/register | Register new user |
| POST | /auth/login | Authenticate user |
| GET | /auth/me | Retrieve current user |

## Reading APIs

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /readings | Create a reading |
| GET | /readings | Retrieve user's readings |
| GET | /readings/:id | Retrieve a specific reading |
| PUT | /readings/:id | Update a reading |
| DELETE | /readings/:id | Delete a reading |

## Reporting APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /reports/daily?date=YYYY-MM-DD | Daily report |
| GET | /reports/month-to-date?date=YYYY-MM-DD | Month-to-date report |
| GET | /reports/monthly?date=YYYY-MM-DD | Previous monthly report |

### API response conventions

Successful requests should return structured JSON responses.

Failed requests should return:
- Appropriate HTTP status codes.
- A readable error message.
- Validation details where applicable.

Suggested status codes:

| Status | Meaning |
|---|---|
| 200 | Successful request |
| 201 | Resource created |
| 400 | Invalid input |
| 401 | Authentication required |
| 403 | Forbidden |
| 404 | Resource not found |
| 409 | Duplicate or conflicting record |
| 500 | Internal server error |

### Example: Create Reading

Request:

`POST /api/readings`

```json
{
  "reading_date": "2026-10-15",
  "time_slot": "AFTER_LUNCH",
  "glucose_value": 160
}
```

### Example: Report Response

```json
{
  "date_range": {
    "from": "2026-10-15",
    "to": "2026-10-15"
  },
  "statistics": {
    "highest": 160,
    "lowest": 95,
    "average": 122.5,
    "total_readings": 4
  }
}
```

---

# 9. Frontend Specification

## 9.1 Application Pages

### A. Registration Page

Components:
- Application logo/name.
- Full name input.
- Email input.
- Password input.
- Register button.
- Login navigation.

### B. Login Page

Components:
- Email input.
- Password input.
- Login button.
- Registration navigation.
- Error messages.

### C. Dashboard

The main application landing page after login.

Suggested components:

1. Welcome section.
2. Selected-date control.
3. Daily statistics cards.
4. Add reading action.
5. Daily reading history.
6. Reporting navigation.

Suggested statistics cards:
- Highest reading.
- Lowest reading.
- Average reading.
- Total readings.

### D. Add/Edit Reading Form

Fields:
- Date picker.
- Time-slot selector.
- Glucose-value input.
- Save button.
- Cancel button.

The form must display validation errors clearly.

### E. Reading History

Displays existing readings with:
- Date.
- Time slot.
- Glucose value.
- Edit action.
- Delete action.

### F. Reports Page

Contains three reporting views:
- Daily.
- Month-to-date.
- Previous month.

Each view displays the relevant statistics.

## 9.2 UI/UX Requirements

- Clean and minimal visual design.
- Responsive desktop and mobile layouts.
- Clear visual hierarchy.
- Consistent form styling.
- Readable error and success messages.
- Loading indicators during API calls.
- Empty states when no records exist.
- Confirmation before destructive actions.

The UI should prioritize usability over visual complexity.

---

# 10. Backend Architecture

The backend should follow a modular architecture.

Recommended structure:

server/
- src/
  - config/
  - controllers/
  - middleware/
  - routes/
  - services/
  - validators/
  - utils/
- prisma/
- tests/

### Responsibilities

**Routes:** Define API endpoints.

**Controllers:** Handle incoming requests and responses.

**Services:** Implement business logic and database operations.

**Middleware:** Handle authentication and request processing.

**Validators:** Validate incoming request data.

**Config:** Manage database and application configuration.

### Important design principle

Business logic should not be placed entirely inside route handlers.

Keep controllers thin and move reusable logic into service functions.

---

# 11. Security Requirements

1. Hash passwords with bcrypt.
2. Never return password hashes through APIs.
3. Protect authenticated endpoints with JWT verification.
4. Validate ownership before accessing individual readings.
5. Validate all user input on the backend.
6. Use parameterized database operations through the ORM.
7. Keep secrets in environment variables.
8. Avoid exposing sensitive information in error responses.
9. Configure appropriate CORS policies.
10. Use HTTPS in production.

Since this application handles health-related information, user data isolation is particularly important.

---

# 12. Testing Strategy

Testing must cover the critical business logic and API behaviour.

## Authentication Tests

- Successful registration.
- Duplicate email registration.
- Successful login.
- Incorrect password.
- Missing credentials.
- Access to protected routes without a valid token.

## Reading Management Tests

- Create a valid reading.
- Reject empty glucose value.
- Reject values below 40.
- Reject values above 600.
- Reject decimal values.
- Reject duplicate slots.
- Reject more than four readings per day.
- Reject future dates.
- Successfully edit a reading.
- Successfully delete a reading.
- Prevent access to another user's records.

## Reporting Tests

- Correct daily statistics.
- Correct month-to-date statistics.
- Correct previous-month statistics.
- Correct average rounding.
- Correct reading count.
- Empty report behaviour.
- Date boundary handling.

## Frontend Tests (Optional Bonus)

- Reading form renders correctly.
- Required-field validation.
- Invalid-value validation.
- API error display.
- Successful form submission.

---

# 13. Seed Data Requirements

A database seed script must create:

**Demo user**
- Name: Demo User
- Email: demo@sweety.test
- Password: Configured for local demonstration and documented in README.

**Sample readings**

The seed should include readings across multiple dates and time slots.

Recommended coverage:
- Four readings on one date.
- One or two readings on another date.
- Readings across multiple days in the previous month.
- Multiple readings within the current month.

This allows reviewers to test the daily, month-to-date and monthly reports.

All seeded readings must belong to the demo account.

---

# 14. Environment Configuration

Create a `.env.example` file containing all required configuration variables.

Suggested variables:

```env
PORT=5000
NODE_ENV=development

DATABASE_URL=

JWT_SECRET=
JWT_EXPIRES_IN=1d

CLIENT_URL=http://localhost:5173
```

Never commit actual credentials or secrets to GitHub.

---

# 15. Project Deliverables

The following items must be submitted to Kenpath:

| Deliverable | Requirement |
|---|---|
| GitHub repository | Public repository |
| Git commits | Regular meaningful commits |
| README.md | Installation and setup instructions |
| Database | PostgreSQL schema and setup |
| Environment file | `.env.example` |
| Seed script | Demo user and sample readings |
| Tests | Meaningful backend tests |
| Demonstration | Screenshots or 2–3 minute recording |

The README must explain:
- Project overview.
- Technology stack.
- Installation instructions.
- Database setup.
- Environment configuration.
- Running the backend.
- Running the frontend.
- Running tests.
- Seed data instructions.
- Assumptions.
- Future improvements.

---

# 16. Development Roadmap

## Phase 1 – Project Foundation

- Initialize React application.
- Initialize Express backend.
- Configure PostgreSQL.
- Configure Prisma.
- Establish project structure.
- Verify frontend/backend connectivity.

## Phase 2 – Authentication

- Create User model.
- Implement registration.
- Implement login.
- Implement bcrypt hashing.
- Implement JWT authentication.
- Protect private routes.

## Phase 3 – Reading Management

- Create Reading model.
- Implement CRUD endpoints.
- Implement all five assessment validation rules.
- Implement ownership checks.
- Connect frontend forms.

## Phase 4 – Reporting

- Implement daily report.
- Implement month-to-date report.
- Implement previous-month report.
- Verify calculations and date boundaries.
- Display report results in React.

## Phase 5 – Testing and Quality

- Write authentication tests.
- Write reading validation tests.
- Write CRUD tests.
- Write report calculation tests.
- Handle edge cases.

## Phase 6 – Submission Preparation

- Prepare README.
- Create `.env.example`.
- Implement seed script.
- Review Git commit history.
- Capture screenshots or screen recording.
- Verify a fresh installation.

---

# 17. Acceptance Criteria

The application is considered ready for submission when all the following are satisfied.

### Authentication
- [ ] User can register.
- [ ] User can log in.
- [ ] Passwords are hashed.
- [ ] Protected routes require authentication.
- [ ] Users cannot access another user's data.

### Reading Management
- [ ] User can add readings.
- [ ] User can view readings.
- [ ] User can edit readings.
- [ ] User can delete readings.
- [ ] Only four predefined time slots are accepted.
- [ ] Only one reading per slot per date is allowed.
- [ ] Maximum four readings per day.
- [ ] Values must be whole numbers between 40 and 600.
- [ ] Future dates are rejected.

### Reports
- [ ] Daily report works.
- [ ] Month-to-date report works.
- [ ] Previous-month report works.
- [ ] Highest reading is correct.
- [ ] Lowest reading is correct.
- [ ] Average is rounded to one decimal place.
- [ ] Total reading count is correct.
- [ ] Empty states are displayed.
- [ ] Daily report lists individual readings and their slots.

### Submission
- [ ] Public GitHub repository.
- [ ] Regular commits.
- [ ] Complete README.
- [ ] `.env.example`.
- [ ] Working seed script.
- [ ] Meaningful tests.
- [ ] Screenshots or demonstration recording.

---

# 18. Assumptions and Technical Decisions

The following decisions clarify details not explicitly defined in the assessment.

1. Each user maintains an independent collection of readings.
2. A date is interpreted using the application's configured local date convention. The initial implementation should use a documented timezone policy.
3. The four time slots are fixed and cannot be customized by users.
4. The selected date determines the reporting periods.
5. The previous-month report always covers the entire previous calendar month.
6. Report averages use all readings within the selected period, not daily averages.
7. Empty reports return zero readings and null statistical values rather than misleading measurements.
8. Editing a reading must validate the updated record without counting the existing record as a duplicate of itself.
9. Deleting a reading immediately removes it from subsequent reports.
10. Report statistics are recalculated from the authenticated user's database records.

## Future Improvements

If additional development time is available:

- Monthly glucose trend visualization.
- Pagination.
- Docker deployment.
- Automated daily reminders.
- Redis report caching.
- Doctor and patient accounts.

---

# 19. Definition of Done

Sweety is complete when a new user can register, log in, record glucose measurements, manage their history, and generate accurate daily and monthly reports without violating the specified business rules.

The application must be reproducible from the README instructions, use secure password handling, isolate user data, and include meaningful tests.

**Primary development principle: Functional correctness first, reliability second, visual polish third.**