# IT-HELPDESK-TICKET-MANAGEMENT-SYSTEM

> **TechDesk** is an enterprise IT Helpdesk platform streamlining technical support with automated SLA tracking, breach escalation, RBAC, analytics, and a knowledge base. Built using Java, Spring Boot, Spring Security (JWT), MySQL, and a React.js frontend.

[![Java](https://img.shields.io/badge/Java-17%2B%20%2F%2021%20%2F%2024-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Spring Security](https://img.shields.io/badge/Spring%20Security-6.x%20(JWT)-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white)](https://spring.io/projects/spring-security)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)

A modern, production-grade IT Service Management (ITSM) web application designed for enterprise environments. Employees can report technical incidents, IT support specialists can triage and resolve issues with activity audit trails and internal diagnostic notes, and administrators can monitor company-wide SLAs and user permissions.

Inspired by industry-leading service platforms like **Linear**, **Jira Service Management**, and **Freshservice**.

---

## 📑 Table of Contents

- [System Architecture](#system-architecture)
- [Key Features by Role](#key-features-by-role)
- [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
- [Database Design & Schema](#database-design--schema)
- [REST API Endpoints](#rest-api-endpoints)
- [Quick Start Guide](#quick-start-guide)
- [Default Demo Credentials](#default-demo-credentials)
- [Project Directory Structure](#project-directory-structure)
- [Enterprise Architecture Highlights for Portfolio](#enterprise-architecture-highlights-for-portfolio)

---

## 🏛️ System Architecture

The application adopts a decoupled full-stack architecture adhering to clean separation of concerns:

```
[ React 18 Single Page Application ]
       │  (Axios HTTP Client + Bearer Token Interceptor)
       ▼
[ Spring Security 6 Filter Chain (Stateless JWT Auth + CORS) ]
       │
[ Spring Boot 3 REST Controllers ]
       │  (DTO Validation: @Valid, @NotNull, @NotBlank)
       ▼
[ Service Layer (Transactional Business Logic & History Auditing) ]
       │
[ Spring Data JPA / Hibernate ORM ]
       │  (Connection Pooling via HikariCP)
       ▼
[ MySQL 8.0 Database (it_helpdesk_db) ]
```

---

## 🚀 Key Features by Role

### 1. Employee (`ROLE_EMPLOYEE`)
- **Self-Registration & Authentication**: Secure account creation with BCrypt salted password hashing.
- **Personal Dashboard**: Real-time counter of personal active, in-progress, resolved, and critical tickets.
- **Ticket Submission**: Log issues with title, categorized taxonomy (Hardware, Network, Software, Cloud), priority, and rich description.
- **Automated Sequential Identifiers**: Unique enterprise tracking codes (e.g. `HD-1001`, `HD-1002`).
- **Ticket Tracking & Comments**: Add public comments, review resolution notes, and close resolved tickets.

### 2. IT Support Agent (`ROLE_AGENT`)
- **Agent Workspace**: Dedicated triage desk showing personal active queue, unassigned incoming pool, and SLA statistics.
- **One-Click Ticket Pickup**: Instant "Take Ticket" capability from unassigned queue.
- **Lifecycle Management**: Move tickets across states (`OPEN` -> `ASSIGNED` -> `IN_PROGRESS` -> `ON_HOLD` -> `RESOLVED` -> `CLOSED`).
- **Internal Staff Diagnostics**: Post internal notes visible strictly to support engineers and admins (hidden from employees).
- **Resolution Tracking**: Mandatory resolution root-cause notes before transitioning to `RESOLVED`.
- **Priority Escalation**: Re-evaluate urgency level (Low, Medium, High, Critical).

### 3. Administrator (`ROLE_ADMIN`)
- **Executive Operations Console**: Real-time KPI counters, average resolution turnaround velocity (hours), and category load progress bars.
- **User Directory Management**: Provision new support agents or employees, filter directory by role, and activate/deactivate accounts.
- **Taxonomy Administration**: Add, configure, and deactivate ticket issue categories.
- **Global Dispatch Desk**: Company-wide ticket assignment and reassignment across all engineers.
- **SLA & Performance Reporting**: Resolution clearance rates, queue depth analytics, and printable export summaries.

---

## 🛡️ Role-Based Access Control (RBAC)

| Feature | Employee | Support Agent | Administrator |
| :--- | :---: | :---: | :---: |
| Self Registration & Login | ✅ | ✅ | ✅ |
| Submit New Ticket | ✅ | ✅ | ✅ |
| View Own Tickets | ✅ | ✅ | ✅ |
| View All Company Tickets | ❌ | ✅ | ✅ |
| Self-Assign / Reassign Specialist | ❌ | ✅ | ✅ |
| Change Ticket Priority | ❌ | ✅ | ✅ |
| Post Internal Staff Notes | ❌ | ✅ | ✅ |
| Mark Ticket Resolved (with Notes) | ❌ | ✅ | ✅ |
| Close Resolved Ticket | ✅ (Own) | ✅ | ✅ |
| Provision User Accounts | ❌ | ❌ | ✅ |
| Enable/Disable User Accounts | ❌ | ❌ | ✅ |
| Category Management | ❌ | ❌ | ✅ |
| Executive KPI & SLA Analytics | ❌ | Performance | Full SLAs |

---

## 🗄️ Database Design & Schema

Normalized MySQL schema with foreign keys, cascading rules, and indexes:

1. **`roles`**: System authority definitions (`ROLE_ADMIN`, `ROLE_AGENT`, `ROLE_EMPLOYEE`).
2. **`users`**: Employee accounts with encrypted passwords, department, contact info, and active flag.
3. **`ticket_categories`**: Dynamic ticketing classifications.
4. **`tickets`**: Core incident entity tracking code, priority, status, category, creator, assignee, and resolution notes.
5. **`ticket_comments`**: Threaded communication log with `is_internal` visibility flag.
6. **`ticket_assignments`**: Delegation history tracking assigner, assignee, and timestamp.
7. **`ticket_history`**: Immutable audit log recording all lifecycle transitions (`CREATED`, `ASSIGNED`, `STATUS_CHANGE`, `PRIORITY_CHANGE`, `COMMENT_ADDED`).

The raw SQL schema and seed data are available in:
- `database/schema.sql`
- `database/data.sql`

---

## 🔌 REST API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/login`: Authenticate username/email and password, returns JWT token & user profile.
- `POST /api/auth/register`: Employee self-registration.
- `GET /api/auth/me`: Fetch authenticated user context from token.

### Tickets (`/api/tickets`)
- `GET /api/tickets`: Query tickets (supports `status`, `priority`, `categoryId`, `query`, `assignedToMe`).
- `POST /api/tickets`: Create new ticket.
- `GET /api/tickets/{id}`: Detailed ticket view including comment thread and activity audit trail.
- `POST /api/tickets/{id}/assign`: Assign ticket to an IT support agent.
- `PATCH /api/tickets/{id}/status`: Update ticket status (requires resolution notes when marking `RESOLVED`).
- `PATCH /api/tickets/{id}/priority`: Update ticket priority.
- `POST /api/tickets/{id}/comments`: Post a comment or internal staff note.

### User Management (`/api/users`)
- `GET /api/users`: List all users (Admin only, supports `?role=ROLE_AGENT`).
- `GET /api/users/agents`: List active IT support agents (Authenticated).
- `POST /api/users`: Provision user account (Admin only).
- `PATCH /api/users/{id}/status`: Toggle user activation state (Admin only).

### Categories & Analytics
- `GET /api/categories`: List active ticketing categories.
- `POST /api/categories`: Create new category (Admin only).
- `GET /api/analytics/dashboard`: Aggregate KPI metrics and turnaround time.

---

## ⚙️ Quick Start Guide

### Prerequisites
- **Java 17+** (Java 17, 21, or 24 supported)
- **Apache Maven 3.9+**
- **Node.js 18+** and **npm**
- **MySQL 8.0+** running locally on port `3306`

### 1. Database Setup
Create the MySQL database:
```sql
CREATE DATABASE it_helpdesk_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Update your MySQL credentials in `backend/src/main/resources/application.properties` if needed:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/it_helpdesk_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=root
```

### 2. Start the Spring Boot Backend
Open a terminal in the `backend` folder:
```powershell
cd backend
mvn spring-boot:run
```
The backend starts at `http://localhost:8080`.
> **Note**: On initial startup, `DataInitializer` automatically seeds default roles, categories, sample users, and realistic demo tickets with comments and history.

### 3. Start the React Frontend
Open a separate terminal in the `frontend` folder:
```powershell
cd frontend
npm install
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

---

## 🔑 Default Demo Credentials

For demonstration and interview evaluations, convenient **One-Click Demo Sign-in** buttons are provided directly on the Login page:

| Role | Username | Password | Full Name | Department |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `password123` | Alex Mercer | IT Operations |
| **Support Agent** | `agent.sarah` | `password123` | Sarah Jenkins | IT Support Tier 2 |
| **Support Agent** | `agent.marcus` | `password123` | Marcus Chen | Network & Infrastructure |
| **Employee** | `emp.david` | `password123` | David Miller | Finance & Accounting |
| **Employee** | `emp.elena` | `password123` | Elena Rodriguez | Product & Design |
| **Employee** | `emp.priya` | `password123` | Priya Sharma | Human Resources |

---

## 📁 Project Directory Structure

```
it-helpdesk-system/
├── database/
│   ├── schema.sql                     # Complete DDL tables script
│   └── data.sql                       # Initial taxonomy and role seed script
│
├── backend/
│   ├── pom.xml                        # Maven dependencies (Spring Boot, Security, JPA, JWT)
│   └── src/
│       ├── main/
│       │   ├── java/com/helpdesk/
│       │   │   ├── config/            # DataInitializer (Automatic demo seeder)
│       │   │   ├── controller/        # REST Controllers (Auth, Ticket, User, Category, Analytics)
│       │   │   ├── dto/               # Request/Response Data Transfer Objects & Validation
│       │   │   ├── entity/            # JPA Entities & Enums (Ticket, User, Role, Category, etc.)
│       │   │   ├── exception/         # Centralized GlobalExceptionHandler
│       │   │   ├── repository/        # Spring Data JPA Repositories
│       │   │   ├── security/          # JWT Utils, Filter, UserDetailsService, SecurityConfig
│       │   │   ├── service/           # Business Logic Layer
│       │   │   └── HelpdeskApplication.java
│       │   └── resources/
│       │       └── application.properties
│       └── test/
│
└── frontend/
    ├── package.json                   # React 18, React Router v6, Axios, Bootstrap 5
    ├── vite.config.js                 # Vite dev server with reverse proxy to backend
    ├── index.html
    └── src/
        ├── components/                # Navbar, Sidebar, StatusBadge, PriorityBadge, Spinner
        ├── context/                   # AuthContext (JWT session management)
        ├── layouts/                   # MainLayout (Responsive sidebar + navbar)
        ├── pages/
        │   ├── auth/                  # LoginPage, RegisterPage
        │   ├── employee/              # EmployeeDashboard, CreateTicketPage
        │   ├── agent/                 # AgentDashboard (Triage desk & queue)
        │   ├── admin/                 # AdminDashboard, UserManagement, Categories, Reports
        │   ├── tickets/               # TicketListPage, TicketDetailPage (Timeline & Comments)
        │   └── profile/               # UserProfilePage
        ├── routes/                    # AppRoutes (Role-based Protected Routes)
        ├── services/                  # Axios service modules (api, auth, ticket, user, etc.)
        └── styles/
            └── custom.css             # Enterprise SaaS theme inspired by Linear & Jira
```

---

## 🌟 Enterprise Architecture Highlights for Portfolio

When presenting this project in a Java Full Stack Developer interview, key technical highlights include:

1. **Stateless Security Architecture**: Token-based authentication using **Spring Security 6** and `jjwt` with HMAC-SHA256 signature verification. No server session storage required, allowing horizontal scalability.
2. **Role-Based Access Control (RBAC)**: Enforced symmetrically on both the server (`@PreAuthorize`, SecurityFilterChain rules, service checks) and the client (`ProtectedRoute`, conditional UI rendering).
3. **Internal Diagnostic Segregation**: Regular employees are mathematically prevented by the backend service from viewing or posting internal support staff notes (`is_internal = true`).
4. **Complete Audit Trail**: Every incident records state changes, assignment delegations, and resolution timestamps into an immutable `ticket_history` log for compliance and turnaround analytics.
5. **Real Enterprise UI/UX**: Designed without generic AI templates or emojis; uses Bootstrap 5 with custom CSS variables, subtle slate/navy palette, status badges, and sticky responsive navigation inspired by Jira and Linear.

