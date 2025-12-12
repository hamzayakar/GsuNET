# GSUNET Backend API

FastAPI backend for GSUNET - Galatasaray University Club Management System

## Features

- **Authentication**: JWT-based authentication with role-based access control
- **Event Management**: Full CRUD operations with approval workflow
- **Club Management**: Manage university clubs and memberships
- **Room Recommendation**: Smart room suggestion based on capacity requirements
- **Sponsorship Module**: Track and manage sponsorships
- **Notifications**: User notification system

## Tech Stack

- **Framework**: FastAPI 0.104+
- **Database**: PostgreSQL 15
- **ORM**: SQLAlchemy 2.0
- **Authentication**: JWT (python-jose)
- **Password Hashing**: bcrypt (passlib)
- **Caching**: Redis

## Setup Instructions

### 1. Prerequisites

- Python 3.10+
- Docker & Docker Compose (for database)

### 2. Start Database

```bash
# From the project root directory
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- PgAdmin on port 5050 (http://localhost:5050)
- Redis on port 6379

### 3. Create Virtual Environment

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

### 5. Run the Server

```bash
# Using the run script
./run.sh

# Or manually
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Database Connection

**Connection String:**
```
postgresql://gsu_user:gsu_password@localhost:5432/gsunet_db
```

**PgAdmin Access:**
- URL: http://localhost:5050
- Email: admin@gsunet.com
- Password: admin

## API Endpoints

### Authentication (`/api/v1/auth`)

- `POST /register` - Register new user
- `POST /login` - Login and get JWT token
- `GET /me` - Get current user info

### Events (`/api/v1/events`)

- `GET /` - List events (query: status, club_id)
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

## User Roles

- **student**: Regular student user
- **club_manager**: Can manage club content and events
- **advisor**: Can approve/reject events
- **admin**: Full system access

## Database Models

### Core Models
- **User**: User authentication and profiles
- **Club**: University club information
- **Event**: Club events with approval workflow
- **Room**: Venues for events
- **EventRegistration**: User event registrations
- **Notification**: User notifications
- **Sponsorship**: Club sponsorship tracking

## Development

### Database Migrations

```bash
# Create a new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Testing

```bash
pytest tests/ -v
```

## Project Structure

```
backend/
├── app/
│   ├── core/           # Core configuration and security
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── security.py
│   │   └── dependencies.py
│   ├── models/         # SQLAlchemy models
│   │   ├── user.py
│   │   ├── club.py
│   │   ├── event.py
│   │   ├── room.py
│   │   └── ...
│   ├── routes/         # API routes
│   │   ├── auth.py
│   │   ├── events.py
│   │   ├── clubs.py
│   │   └── rooms.py
│   ├── schemas/        # Pydantic schemas
│   └── main.py         # FastAPI app
├── requirements.txt
├── run.sh
└── README.md
```

## Security

- All passwords are hashed using bcrypt
- JWT tokens expire after 7 days
- Role-based access control (RBAC)
- HTTPS recommended for production
- SQL injection prevention via ORM

## Environment Variables

Create a `.env` file for production:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/gsunet_db
SECRET_KEY=your-super-secret-key-change-in-production
DEBUG=False
```

## License

This project is part of INF-493/IND-496 course project at Galatasaray University.
