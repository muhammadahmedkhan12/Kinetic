# ⚡ KINETIC — Luxury Gym & High-Performance Fitness Management Platform

[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20TypeScript-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/Mobile-Progressive%20Web%20App-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Gemini AI](https://img.shields.io/badge/AI%20Assistant-Google%20Gemini-4285F4?logo=google&logoColor=white)](https://aistudio.google.com/)
[![License](https://img.shields.io/badge/License-MIT-gold.svg)](LICENSE)

> **KINETIC** is an enterprise-grade, full-stack fitness club management ecosystem engineered for modern fitness clubs and luxury wellness centers. It unifies high-level administrative operations and an empowering mobile member experience into one seamless platform.

---

## 🌟 Key Highlights & Ecosystem Features

### 🖥️ 1. Executive Admin Command Center
- **Live Business Intelligence**: Real-time KPI dashboard tracking total active members, certified trainers, scheduled classes, equipment health, and monthly gross revenue.
- **Member Directory & Credential Lifecycle**: View active subscriptions, overdue statuses, generated member credentials, and profile metrics.
- **Payment Verification Workflow**: Review member-submitted bank transfer receipts and PDF invoices in a unified approval queue with instant activation.
- **Facility & Equipment Registry**: Manage gym assets, maintenance logs, machinery locations, and status flags across multiple facility zones.
- **Class Scheduling & Trainer Management**: Coordinate group classes, seat capacity limits, instructor assignments, and live booking counts.

---

### 📱 2. Member Mobile App (Progressive Web App)
- **Standalone Mobile Installation**: Installable as a native app icon on iOS and Android via PWA Service Worker (`sw.js`) with zero browser chrome or URL bars.
- **Digital Gate Pass**: Instant turnstile check-in mechanism and attendance log tracking.
- **Class Booking Engine**: Browse upcoming strength, HIIT, and recovery sessions with one-tap reservations and real-time seat tracking.
- **Weight Progress & Body Analytics**: Interactive weight logging tool calculating BMI, progress trends, and weight delta over time.
- **Tiered Subscriptions & Invoicing**: Compare membership tiers (Starter, Pro, Elite) with built-in bank transfer receipt upload (PNG/JPG/PDF).
- **Modular Profile & Security**: Onboarding wizard for fitness goals, height adjustments, and self-service password management.

---

### 🤖 3. PULSE AI — Personal Fitness Assistant
- **Context-Aware Coaching**: Powered by Google Gemini AI with intelligent local fallback heuristics.
- **Deep Personalization**: Directly analyzes the member's BMI, weight trend, target goals (e.g. *Muscle Gain*, *Fat Loss*), and registered class history.
- **Structured Mobile Routines**: Delivers structured push/pull/legs workouts, rotator cuff & injury recovery protocols, and calculated daily protein/calorie targets.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Tailwind CSS, Vite, Lucide & Material Symbols, PWA WebAPK |
| **Backend** | Python 3.10+, FastAPI, Uvicorn, Pydantic V2, Pytest |
| **Database & ORM** | SQLAlchemy ORM, Microsoft Azure SQL Server, SQLite Fallback Engine |
| **AI Integration** | Google GenAI SDK (`gemini-2.5-flash`, `gemini-2.0-flash`), Google AI Studio |
| **Security & Auth** | OAuth2 Password Bearer, JWT Tokens (HS256), Werkzeug / Passlib Password Hashing |
| **Deployment** | Vercel (Frontend & PWA), Railway (Backend REST API), Microsoft Azure (SQL Database) |

---

## 📂 Repository Structure

```text
Kinetic/
├── react-frontend/               # Modern React + Vite Single-Page Application & PWA
│   ├── public/                   # Static assets, PWA icons, manifest.json, sw.js
│   ├── src/
│   │   ├── api/                  # Axios HTTP client configuration & interceptors
│   │   ├── components/           # Modular Admin & Member UI components
│   │   │   ├── admin/            # Overview, Members, Schedule, Analytics, Assets
│   │   │   ├── member/           # Home, Billing, Classes, Weight, Profile, AI Coach
│   │   │   └── common/           # Toast, Modals, Navbar, Spinners
│   │   ├── context/              # AuthContext & ToastContext providers
│   │   ├── pages/                # AdminDashboardPage, MemberAppPage, AdminLoginPage
│   │   └── types/                # TypeScript interface definitions
│   └── vite.config.ts            # Vite build pipeline & proxy rules
│
├── fastapi-backend/              # High-performance FastAPI REST API
│   ├── app/
│   │   ├── core/                 # App configuration, security JWT, database engine
│   │   ├── models/               # SQLAlchemy DB entities (User, Payment, Membership, etc.)
│   │   ├── routers/              # API endpoints (auth, admin, member, classes, ai_coach)
│   │   ├── schemas/              # Pydantic validation & response schemas
│   │   └── services/             # Core business logic & Gemini AI assistant engine
│   ├── tests/                    # Pytest test suites for authentication and business rules
│   └── main.py                   # FastAPI application entrypoint
│
├── .env.example                  # Template for environment configuration
├── .gitignore                    # Git untracking rules for secrets & build artifacts
└── README.md                     # Project documentation
```

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- **Node.js**: `v18.x` or higher
- **Python**: `v3.10` or higher
- **Git**

---

### 2. Backend Setup (`fastapi-backend`)

1. Navigate to the backend directory:
   ```bash
   cd fastapi-backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   # On Windows:
   .venv\Scripts\activate
   # On macOS/Linux:
   source .venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   - Copy `.env.example` in the project root to `.env`:
     ```bash
     cp ../.env.example ../.env
     ```
   - Add your **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey) and database connection details.

5. Start the development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   * Interactive Swagger Docs: `http://localhost:8000/docs`
   * ReDoc Documentation: `http://localhost:8000/redoc`

---

### 3. Frontend Setup (`react-frontend`)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd react-frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   * Member App: `http://localhost:5173/#/app`
   * Admin Portal: `http://localhost:5173/#/admin/dashboard`

---

### 4. Running Backend Tests

Run the comprehensive Pytest test suite:
```bash
cd fastapi-backend
pytest -v
```

---

## 🔒 Security & Best Practices

- **Zero-Secret Commits**: All secret keys, database passwords, and API credentials are kept out of source control using `.gitignore` and `.env.example`.
- **Role-Based Access Control (RBAC)**: Distinct permissions for `admin` and `member` roles enforced at the API gateway.
- **Cryptographic Password Security**: Passwords hashed using PBKDF2/SHA256 with salting.
- **CORS Protection**: Explicit domain allowlists for API requests.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
