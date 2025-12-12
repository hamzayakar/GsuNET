# GSUNET - Galatasaray University Club Management System

## 📋 Project Overview

GSUNET is a fullstack web application designed to automate and streamline club and event management at Galatasaray University. The platform provides:

- **Event Management**: Create, approve, and manage university club events
- **Smart Room Recommendations**: AI-powered room allocation based on capacity
- **Role-Based Access Control**: Different permissions for students, club managers, advisors, and admins
- **Mobile-First Design**: Responsive interface optimized for both mobile and desktop
- **Real-time Approval Workflow**: Advisor/admin approval system for event requests

## 🏗️ Tech Stack

### Backend
- **Framework**: FastAPI 0.104+
- **Database**: PostgreSQL 15
- **ORM**: SQLAlchemy 2.0
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Caching**: Redis
- **API Documentation**: Auto-generated Swagger UI

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **State Management**: React Context API

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database Admin**: PgAdmin 4
- **Version Control**: Git

## 🚀 Quick Start Guide

### Prerequisites

Make sure you have the following installed:
- **Docker & Docker Compose** (for database and Redis)
- **Python 3.10+** (for backend)
- **Node.js 18+** (for frontend)
- **Git**

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Six_Seven
```

### 2. Start Docker Services

From the project root directory:

```bash
docker-compose up -d
```

This starts:
- PostgreSQL on port **5432**
- PgAdmin on port **5050** (http://localhost:5050)
- Redis on port **6379**

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
./run.sh
# Or manually:
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at:
- **API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 4. Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at:
- **App**: http://localhost:5173

## 📊 Database Connection

**PostgreSQL Connection String:**
```
postgresql://gsu_user:gsu_password@localhost:5432/gsunet_db
```

**PgAdmin Access:**
- URL: http://localhost:5050
- Email: admin@gsunet.com
- Password: admin

## 🎯 Key Features

### 1. User Authentication
- Register with email, full name, and student number
- Login with JWT token-based authentication
- Role-based access control (student, club_manager, advisor, admin)

### 2. Event Management
- Club managers can create event requests
- Events start in "pending" status
- Advisors/admins can approve or reject events
- Approved events appear in the main feed

### 3. Smart Room Recommendation
- Input expected attendee count
- System suggests rooms with adequate capacity
- Sorted by size for optimal space utilization

### 4. Club Management
- Browse all university clubs
- View club details and their events
- Track club membership count

### 5. Responsive Design
- **Mobile**: Bottom navigation bar (Instagram-style)
- **Desktop**: Top navigation bar
- Tailwind CSS breakpoints for seamless responsiveness

## 🗂️ Project Structure

```
Six_Seven/
├── backend/
│   ├── app/
│   │   ├── core/              # Core configuration
│   │   │   ├── config.py      # App settings
│   │   │   ├── database.py    # Database connection
│   │   │   ├── security.py    # JWT & password hashing
│   │   │   └── dependencies.py # Auth dependencies
│   │   ├── models/            # SQLAlchemy models
│   │   │   ├── user.py
│   │   │   ├── club.py
│   │   │   ├── event.py
│   │   │   ├── room.py
│   │   │   └── ...
│   │   ├── routes/            # API endpoints
│   │   │   ├── auth.py        # Authentication
│   │   │   ├── events.py      # Event management
│   │   │   ├── clubs.py       # Club management
│   │   │   └── rooms.py       # Room recommendations
│   │   ├── schemas/           # Pydantic schemas
│   │   └── main.py            # FastAPI app entry
│   ├── requirements.txt
│   └── run.sh
│
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── EventCard.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/             # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Home.jsx       # Event feed
│   │   │   ├── Clubs.jsx
│   │   │   ├── ClubDetail.jsx
│   │   │   └── ApprovalPanel.jsx
│   │   ├── context/           # React Context
│   │   │   └── AuthContext.jsx
│   │   ├── services/          # API services
│   │   │   └── api.js
│   │   ├── App.jsx            # Main app & routing
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

## 🔐 API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /register` - Register new user
- `POST /login` - Login and get JWT token
- `GET /me` - Get current user info

### Events (`/api/v1/events`)
- `GET /` - List events (filter by status, club_id)
- `POST /` - Create event (requires auth)
- `GET /{id}` - Get event by ID
- `PUT /{id}` - Update event
- `PUT /{id}/approve` - Approve/reject event (advisor/admin only)
- `DELETE /{id}` - Delete event

### Clubs (`/api/v1/clubs`)
- `GET /` - List all clubs
- `POST /` - Create club (admin only)
- `GET /{id}` - Get club by ID
- `PUT /{id}` - Update club
- `DELETE /{id}` - Delete club (admin only)

### Rooms (`/api/v1/rooms`)
- `GET /` - List all rooms
- `POST /` - Create room (admin only)
- `GET /recommend?capacity={num}` - Get room recommendations
- `GET /{id}` - Get room by ID
- `PUT /{id}` - Update room (admin only)
- `DELETE /{id}` - Delete room (admin only)

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| **student** | View events, register for events, view clubs |
| **club_manager** | Create event requests, manage club content |
| **advisor** | Approve/reject events, all club_manager permissions |
| **admin** | Full system access, manage users, clubs, rooms |

## 🔧 Development

### Backend Testing

```bash
cd backend
pytest tests/ -v
```

### Database Migrations

```bash
# Create a new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Frontend Development

```bash
cd frontend
npm run dev    # Start dev server
npm run build  # Production build
npm run preview # Preview production build
```

## 🎨 Design System

### Colors (Galatasaray University Branding)

- **Primary Red**: `#a90432` (Galatasaray red)
- **Primary Dark**: `#8a0329`
- **Primary Light**: `#c20541`
- **Secondary Yellow**: `#fbc02d` (Galatasaray yellow)
- **Secondary Dark**: `#f9a825`
- **Secondary Light**: `#fdd835`

### Responsive Breakpoints

```javascript
// Tailwind CSS breakpoints
sm: '640px'   // Small devices
md: '768px'   // Medium devices (tablets)
lg: '1024px'  // Large devices (desktops)
xl: '1280px'  // Extra large devices
```

## 🔒 Security Features

- Passwords hashed with bcrypt
- JWT tokens expire after 7 days
- Role-based access control (RBAC)
- SQL injection prevention via ORM
- CORS configuration for frontend-backend communication
- Token-based authentication with Bearer scheme

## 🐛 Troubleshooting

### Docker Issues

```bash
# Stop all containers
docker-compose down

# Remove volumes and restart
docker-compose down -v
docker-compose up -d
```

### Backend Port Already in Use

```bash
# Find process using port 8000
lsof -i :8000

# Kill process
kill -9 <PID>
```

### Frontend Port Already in Use

Vite will automatically use the next available port (5174, 5175, etc.)

### Database Connection Error

Make sure Docker containers are running:
```bash
docker ps
```

You should see:
- `gsunet-postgres`
- `gsunet-pgadmin`
- `gsunet-redis`

## 📝 License

This project is part of INF-493/IND-496 course project at Galatasaray University.

## 👨‍💻 Contributors

- **Backend Developer**: Mert (Database & FastAPI)
- **Frontend Developer**: Edipcan (React & UI/UX)

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)

---

**Made with ❤️ at Galatasaray University**
