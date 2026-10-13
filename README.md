# WarrantyVault — Warranty & Repair Tracker

A full-stack enterprise web application designed to track, manage, and safeguard product warranties, store proof-of-purchase receipts, monitor service repair tickets, and send automated notifications prior to warranty expiration.

---

## 🛠️ Technology Stack

- **Backend**: Java 21, Spring Boot 3.3.4, Spring Security 6 (Stateless JWT), Spring Data JPA, Hibernate, JJWT 0.12.6, SpringDoc OpenAPI 2.6.0.
- **Frontend**: React 19, Vite, Material UI (MUI v6), Emotion, Axios, React Router v7.
- **Database**: MySQL 8.0+ (Production/Local) and H2 in-memory (Automated Testing).
- **Deployment**: Docker, Render (Backend API), Vercel (Frontend SPA).

---

## 🚀 Local Development Setup (Windows PowerShell)

### Prerequisites
- **Java 21 JDK** installed (e.g. `C:\Program Files\Java\jdk-21`)
- **Node.js 20+** and `npm` installed
- **MySQL 8.0+** running locally (or using Docker)

---

### Step 1: Start the Backend (Spring Boot)

Open Windows PowerShell and navigate to the `backend` folder:

```powershell
# 1. Set JAVA_HOME to JDK 21 (if not in system environment)
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"

# 2. Navigate to backend directory
cd backend

# 3. (Optional) Run the automated test suite
.\mvnw.cmd test

# 4. Start the Spring Boot Application
.\mvnw.cmd spring-boot:run
```

The backend server will start at:
- **REST API Base**: `http://localhost:8080/api/v1`
- **Swagger / OpenAPI Documentation**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI JSON Spec**: `http://localhost:8080/api-docs`

---

### Step 2: Start the Frontend (React + Vite)

Open a second Windows PowerShell terminal window:

```powershell
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies (if not already installed)
npm.cmd install

# 3. Start development server
npm.cmd run dev
```

The frontend client will start at:
- **Web App**: `http://localhost:5173`

---

## 🧪 Testing & Verification

### Run Backend Tests
The backend includes 11 comprehensive integration and unit tests covering JWT authentication, password hashing, leap-year warranty calculation math, multi-user data isolation, repair state machines, and scheduler duplicate suppression:

```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
cd backend
.\mvnw.cmd test
```

### Build Production Backend Package
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
cd backend
.\mvnw.cmd clean package -DskipTests
# Executable JAR created at: backend/target/warrantyvault-backend-1.0.0.jar
```

### Build Production Frontend Bundle
```powershell
cd frontend
npm.cmd run build
# Production static assets created in: frontend/dist/
```

---

## 🗄️ Database Setup

The database schema and initialization script is located in [`database/schema.sql`](database/schema.sql).

### Automatic Creation:
With `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` configured, Spring Boot Hibernate (`ddl-auto: update`) automatically provisions and updates all tables and relationships on startup.

### Manual Creation:
```powershell
mysql -u root -p < ".\database\schema.sql"
```

---

## ☁️ Production Deployment

### 1. Backend on Render (Docker)
1. Push your repository to GitHub.
2. In Render, select **New Web Service** and link your repo.
3. Choose **Docker** environment using `./backend/Dockerfile` as the Dockerfile path and `./backend` as context (or use `render.yaml`).
4. Set the following environment variables in Render:
   - `DB_URL`: External MySQL JDBC URL (e.g. Aiven, Railway, AWS RDS)
   - `DB_USERNAME`: Database user
   - `DB_PASSWORD`: Database password
   - `JWT_SECRET`: Random 256-bit string
   - `FRONTEND_URL`: Your Vercel frontend URL (e.g. `https://your-app.vercel.app`)

   The included `render.yaml` mounts a persistent disk at `/app/uploads` so receipt files survive service restarts.

### 2. Frontend on Vercel
1. In Vercel, import your repository.
2. Set **Root Directory** to `frontend`.
3. Set **Framework Preset** to `Vite`.
4. Add the environment variable:
   - `VITE_API_BASE_URL`: `https://your-render-backend.onrender.com/api/v1`
5. Deploy. Vercel SPA routing is already configured in `frontend/vercel.json`.

---

## 🔑 Key Features
- **Stateless JWT Security**: BCrypt password hashing, claim isolation, and auto-refresh on authentication.
- **Calendar-Accurate Warranty Calculations**: Accurately computes month-end dates, leap year boundaries (e.g. Jan 31 + 1 mo = Feb 29 on leap year, Feb 28 on standard years), and days remaining.
- **Strict Data Ownership**: Users cannot view, modify, or delete any products or repair records belonging to other users.
- **Receipt Vault**: Securely uploads and streams PDF/image invoices associated with products.
- **Repair Tracking**: Service logs with warranty claims, actual repair costs, and automatic notification generation upon completion.
- **Proactive Expiry Scanner**: Automated scheduled service that alerts users at 30, 15, 7, and 1-day windows with duplicate-alert suppression.
