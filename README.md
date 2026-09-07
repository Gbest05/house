# Accommodation Sourcing Management System

> **Case Study: Saapade, Ogun State, Nigeria**  
> A full-stack, production-ready accommodation sourcing and property management platform designed to help polytechnic students, residents, and real estate agents securely connect, discover verified housing, and eliminate rental scams.

---

## 📌 Project Overview

In semi-urban academic hubs such as **Saapade, Ogun State** (home to **Gateway ICT Polytechnic Saapade - GAPOSA**), securing off-campus housing is fraught with fraud, exorbitant agent charges, non-existent listings, and lack of verified pricing.

This web application implements a modern real-estate marketplace featuring:
- **Role-Based Access Control (RBAC)**: Administrator, Verified Real Estate Agent, and Student/Tenant.
- **Listing Verification Workflow**: All properties submitted by agents are queued as `Pending Review`. Only admin-approved properties receive the green **✓ Verified Property** checkmark.
- **Interactive OpenStreetMap with Leaflet**: Spatial awareness of accommodations near Gateway Poly campus and surrounding towns (Ode Remo, Iperu Remo, Isara Remo).
- **Direct Inquiry & Lead Management**: In-app tenant inquiries with status tracking (`New`, `Contacted`, `Resolved`), internal agent inspection notes, and direct WhatsApp/Phone call links.
- **Community Anti-Scam Reporting**: Users can report suspicious or already-occupied rooms; administrators investigate and suspend fraudulent listings.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18 + Vite | High-performance SPA with client-side routing |
| **Styling & UI** | Tailwind CSS + Lucide Icons | Responsive modern real estate layout |
| **Mapping** | Leaflet + React-Leaflet | OpenStreetMap integration with custom markers and popups |
| **Backend API** | Python 3.12 + Flask | RESTful API organized with modular Blueprints |
| **Database** | SQLite3 | Relational schema with foreign keys, indexes, and WAL mode |
| **Authentication** | JWT (PyJWT) + Bcrypt | Secure token authentication & password hashing |
| **Image Handling** | Cloudinary + Local Fallback | Cloudinary storage with local fallback in `backend/uploads/` |
| **Deployment** | Render Ready | Configured with `render.yaml`, `Procfile`, and production Gunicorn |

---

## 🔑 Demo Accounts (Pre-Seeded)

The system database is seeded with realistic Saapade listings and demo accounts for each role. You can log in using these credentials or use the **1-Click Demo Buttons** on the Login page:

| Role | Email | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@saapadeaccommodation.ng` | `Admin123!` | Moderates listings, approves agents, manages fraud reports |
| **Verified Agent** | `adebayo@gatewayrealty.ng` | `Agent123!` | Gateway Prime Properties agent managing listings and inquiries |
| **Verified Agent 2** | `bolanle@remolodgings.ng` | `Agent123!` | Remo Student Lodgings & Real Estate agent |
| **Pending Agent** | `chidi@primeproperties.ng` | `Agent123!` | Test admin approval of pending agent accreditation |
| **Student / Tenant** | `student@student.gaposa.edu.ng` | `Student123!` | Searches rooms, saves favorites, submits inquiries |

---

## 📂 Project Structure

```text
accomodation/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Flask app factory, CORS, Blueprint registration
│   │   ├── config.py            # Environment configurations, database paths
│   │   ├── db.py                # SQLite connection manager & query helpers
│   │   ├── schema.sql           # Database schema DDL (11 tables + indexes)
│   │   ├── routes/
│   │   │   ├── auth.py          # /api/auth (Login, Register, Agent Register, Profile)
│   │   │   ├── properties.py    # /api/properties (Filter, Search, CRUD, Availability)
│   │   │   ├── favorites.py     # /api/favorites (Add, Remove, Prevent Duplicates)
│   │   │   ├── inquiries.py     # /api/inquiries (Submit, User History, Agent Inbox)
│   │   │   ├── reports.py       # /api/reports (Report scam listings, Admin resolution)
│   │   │   ├── admin.py         # /api/admin (Stats, Property/Agent verification)
│   │   │   ├── notifications.py # /api/notifications (User/Agent/Admin notifications)
│   │   │   └── uploads.py       # /api/uploads (Cloudinary / Local static upload handler)
│   │   └── utils/
│   │       ├── auth_decorators.py # @jwt_required, @role_required, bcrypt hashing
│   │       ├── cloudinary_helper.py # Cloudinary upload with local disk fallback
│   │       └── seed.py          # Relational seed data for Saapade and environs
│   ├── instance/
│   │   └── accommodation.db     # SQLite database file
│   ├── uploads/                 # Local uploaded property images
│   ├── requirements.txt         # Production dependencies
│   ├── run.py                   # Development and deployment server entry point
│   ├── test_api.py              # Automated test suite
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/                 # Axios services with auth interceptor
│   │   ├── context/             # AuthContext (state, role helpers, demo logins)
│   │   ├── components/          # Navbar, Footer, PropertyCard, PropertyMap, ImageGallery, FilterSidebar, Modals
│   │   ├── pages/               # Landing, Discovery, Details, Dashboards (User, Agent, Admin)
│   │   ├── utils/               # Formatters (₦ Naira, dates), constants (Saapade coords, locations)
│   │   ├── App.jsx              # Application router and protected routes
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Tailwind directives and Leaflet custom styling
│   ├── index.html
│   ├── vite.config.js           # Vite config with API proxy
│   ├── tailwind.config.js       # Custom palette (Emerald brand & Slate)
│   └── package.json
├── render.yaml                  # Render PaaS deployment configuration
├── Procfile                     # Gunicorn web command
├── README.md
└── .gitignore
```

---

## 🚀 Step-by-Step Running Guide (Local Machine)

### 1. Backend Setup

From the root project directory:

```bash
# Navigate to backend
cd backend

# Create virtual environment (using python or uv)
python -m venv .venv

# Activate virtual environment
# Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# Windows (cmd):
.\.venv\Scripts\activate.bat
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server (Auto-seeds database on first launch)
python run.py
```

The Flask API will start at: `http://127.0.0.1:5050`  
Health check endpoint: `http://127.0.0.1:5050/api/health`

To run the automated backend test suite:
```bash
python test_api.py
```

---

### 2. Frontend Setup

Open a separate terminal in the `frontend/` directory:

```bash
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```

The web application will open at: `http://localhost:3000` (or `http://localhost:5173`).  
API calls made to `/api/*` are automatically proxied to the Flask server at port `5000`.

---

## 🌐 Deployment on Render

This repository is ready for continuous deployment on [Render](https://render.com):

1. Push your repository to GitHub.
2. In Render, select **New Blueprint Instance** and point to your GitHub repository.
3. Render will read `render.yaml` and configure:
   - **Backend Web Service**: Running Python 3.12 with Gunicorn.
   - **Frontend Static Site**: Building React with Vite and publishing `./frontend/dist`.
4. Add Cloudinary credentials (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) under Environment Variables in Render if desired (or rely on the built-in local upload fallback).

---

## 🎓 ND Computer Science Academic Notes

- **Relational Integrity**: Uses SQLite with strict foreign key enforcement (`PRAGMA foreign_keys = ON;`), cascading deletes where appropriate, and multi-column indexes for search optimization.
- **RESTful Architecture**: Clean HTTP verbs (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) with JSON error contracts and HTTP status codes (`200`, `201`, `400`, `401`, `403`, `404`, `409`).
- **Security Protocols**: Salted bcrypt password hashing, stateless JWT session authentication, and defensive role-based authorization guards on both client and server layers.
