"""
Comprehensive seed script for populating database with test data

Run this script with: python seed_test_users.py

Creates:
- 5 test users (admin, advisor, club managers, student)
- 10 rooms (various capacities)
- 3 clubs
- 8-9 events (approved, pending, rejected, completed)
- Event registrations
- Follow relationships
- Notifications
"""
import sys
import os
import copy
from datetime import datetime, timedelta, timezone

# Add the parent directory to the path to import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, Base, engine
from app.models import (
    User, UserRole, Club, Event, EventStatus, Room,
    EventRegistration, Notification, NotificationType
)
from passlib.context import CryptContext
from sqlalchemy import text

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)


def create_users(db):
    """Create test users"""
    print("👥 Creating users...")

    users_data = [
        {
            "email": "admin@gsu.edu.tr",
            "password": "Admin123!",
            "full_name": "Admin User",
            "student_number": "ADM001",
            "department": "Administration",
            "role": UserRole.ADMIN
        },
        {
            "email": "advisor@gsu.edu.tr",
            "password": "Advisor123!",
            "full_name": "Dr. Ayşe Yılmaz",
            "student_number": "ADV001",
            "department": "Computer Engineering",
            "role": UserRole.ADVISOR
        },
        {
            "email": "club.manager@gsu.edu.tr",
            "password": "Manager123!",
            "full_name": "Mehmet Demir",
            "student_number": "2021001",
            "department": "Computer Engineering",
            "role": UserRole.CLUB_MANAGER
        },
        {
            "email": "student@gsu.edu.tr",
            "password": "Student123!",
            "full_name": "Zeynep Kaya",
            "student_number": "2022001",
            "department": "Electrical Engineering",
            "role": UserRole.STUDENT
        },
        {
            "email": "manager2@gsu.edu.tr",
            "password": "Manager456!",
            "full_name": "Elif Şahin",
            "student_number": "2021002",
            "department": "Industrial Engineering",
            "role": UserRole.CLUB_MANAGER
        },
        {
            "email": "student2@gsu.edu.tr",
            "password": "Test123!",
            "full_name": "Can Yılmaz",
            "student_number": "2023001",
            "department": "Business Administration",
            "role": UserRole.STUDENT
        },
        {
            "email": "student3@gsu.edu.tr",
            "password": "Test456!",
            "full_name": "Deniz Özkan",
            "student_number": "2023002",
            "department": "Law",
            "role": UserRole.STUDENT
        },
        {
            "email": "student4@gsu.edu.tr",
            "password": "Test789!",
            "full_name": "Ece Arslan",
            "student_number": "2022002",
            "department": "Economics",
            "role": UserRole.STUDENT
        }
    ]

    # Save original for credentials file
    users_original = copy.deepcopy(users_data)

    users = {}
    for user_data in users_data:
        password = user_data.pop("password")
        user = User(**user_data, password_hash=hash_password(password))
        db.add(user)
        users[user.email] = user

    db.commit()

    print(f"   ✅ Created {len(users)} users")
    return users, users_original


def create_rooms(db):
    """Create test rooms with various capacities"""
    print("🏢 Creating rooms...")

    rooms_data = [
        # Small rooms (10-30 capacity)
        {"name": "D101 - Small Classroom", "capacity": 20, "location": "D Block - 1st Floor", "is_available": True},
        {"name": "D102 - Study Room", "capacity": 15, "location": "D Block - 1st Floor", "is_available": True},
        {"name": "D103 - Meeting Room", "capacity": 10, "location": "D Block - 1st Floor", "is_available": True},

        # Medium rooms (30-100 capacity)
        {"name": "D201 - Medium Classroom", "capacity": 50, "location": "D Block - 2nd Floor", "is_available": True},
        {"name": "D202 - Computer Lab", "capacity": 40, "location": "D Block - 2nd Floor", "is_available": True},
        {"name": "D203 - Workshop Room", "capacity": 35, "location": "D Block - 2nd Floor", "is_available": True},

        # Large rooms (100-300 capacity)
        {"name": "Main Hall", "capacity": 250, "location": "Main Building", "is_available": True},
        {"name": "Conference Hall", "capacity": 150, "location": "Main Building", "is_available": True},
        {"name": "Auditorium A", "capacity": 300, "location": "Auditorium Complex", "is_available": True},

        # Very large (300+)
        {"name": "Sports Hall", "capacity": 500, "location": "Sports Complex", "is_available": True},
    ]

    rooms = {}
    for room_data in rooms_data:
        room = Room(**room_data)
        db.add(room)
        rooms[room_data["name"]] = room

    db.commit()

    print(f"   ✅ Created {len(rooms)} rooms")
    return rooms


def create_clubs(db, users):
    """Create test clubs"""
    print("📋 Creating clubs...")

    manager1 = users["club.manager@gsu.edu.tr"]
    manager2 = users["manager2@gsu.edu.tr"]
    advisor = users["advisor@gsu.edu.tr"]

    clubs_data = [
        {
            "name": "Computer Science Club",
            "description": "A club for computer science enthusiasts to learn, share, and collaborate on projects.",
            "contact_email": "csclub@gsu.edu.tr",
            "manager_id": manager1.id,
            "advisor_id": advisor.id
        },
        {
            "name": "Robotics Club",
            "description": "Building and programming robots, participating in competitions.",
            "contact_email": "robotics@gsu.edu.tr",
            "manager_id": manager2.id,
            "advisor_id": advisor.id
        },
        {
            "name": "AI & Machine Learning Club",
            "description": "Exploring artificial intelligence and machine learning technologies.",
            "contact_email": "aiclub@gsu.edu.tr",
            "manager_id": manager1.id,
            "advisor_id": advisor.id
        }
    ]

    clubs = {}
    clubs_list = []
    for club_data in clubs_data:
        club = Club(**club_data)
        db.add(club)
        clubs[club_data["name"]] = club
        clubs_list.append(club)

    db.commit()

    print(f"   ✅ Created {len(clubs)} clubs")
    return clubs, clubs_list


def create_events(db, clubs, rooms, users):
    """Create test events with various statuses"""
    print("🎉 Creating events...")

    advisor = users["advisor@gsu.edu.tr"]
    cs_club = clubs["Computer Science Club"]
    robotics_club = clubs["Robotics Club"]
    ai_club = clubs["AI & Machine Learning Club"]

    events_data = [
        # APPROVED - Near future
        {
            "title": "Python Workshop for Beginners",
            "description": "Learn Python basics with hands-on projects. Perfect for beginners!",
            "event_datetime": datetime.now(timezone.utc) + timedelta(days=7),
            "location": "D201 - Medium Classroom",
            "expected_capacity": 40,
            "max_capacity": 50,
            "status": EventStatus.APPROVED,
            "club_id": cs_club.id,
            "room_id": rooms["D201 - Medium Classroom"].id,
            "approved_by_id": advisor.id
        },
        # APPROVED - Far future
        {
            "title": "AI & Machine Learning Symposium",
            "description": "Guest speakers from industry and academia discuss the latest in AI and ML.",
            "event_datetime": datetime.now(timezone.utc) + timedelta(days=30),
            "location": "Main Hall",
            "expected_capacity": 200,
            "max_capacity": 250,
            "status": EventStatus.APPROVED,
            "club_id": ai_club.id,
            "room_id": rooms["Main Hall"].id,
            "approved_by_id": advisor.id
        },
        # APPROVED - Very near (almost full)
        {
            "title": "Robotics Competition Preparation",
            "description": "Prepare for the upcoming robotics competition with hands-on practice.",
            "event_datetime": datetime.now(timezone.utc) + timedelta(days=3),
            "location": "D203 - Workshop Room",
            "expected_capacity": 30,
            "max_capacity": 35,
            "status": EventStatus.APPROVED,
            "club_id": robotics_club.id,
            "room_id": rooms["D203 - Workshop Room"].id,
            "approved_by_id": advisor.id
        },
        # APPROVED - Another one
        {
            "title": "Web Development Workshop",
            "description": "Learn modern web development with React and Node.js",
            "event_datetime": datetime.now(timezone.utc) + timedelta(days=14),
            "location": "D202 - Computer Lab",
            "expected_capacity": 35,
            "max_capacity": 40,
            "status": EventStatus.APPROVED,
            "club_id": cs_club.id,
            "room_id": rooms["D202 - Computer Lab"].id,
            "approved_by_id": advisor.id
        },
        # PENDING - Waiting for approval
        {
            "title": "Mobile App Development Bootcamp",
            "description": "2-day intensive bootcamp on iOS and Android development",
            "event_datetime": datetime.now(timezone.utc) + timedelta(days=21),
            "location": "D202 - Computer Lab",
            "expected_capacity": 35,
            "max_capacity": 40,
            "status": EventStatus.PENDING,
            "club_id": cs_club.id,
            "room_id": rooms["D202 - Computer Lab"].id
        },
        # PENDING - Near date
        {
            "title": "Tech Talk: Cloud Computing",
            "description": "Introduction to cloud platforms (AWS, Azure, GCP)",
            "event_datetime": datetime.now(timezone.utc) + timedelta(days=5),
            "location": "D201 - Medium Classroom",
            "expected_capacity": 45,
            "max_capacity": 50,
            "status": EventStatus.PENDING,
            "club_id": ai_club.id,
            "room_id": rooms["D201 - Medium Classroom"].id
        },
        # REJECTED
        {
            "title": "Unauthorized Party Event",
            "description": "This was rejected for policy violations",
            "event_datetime": datetime.now(timezone.utc) + timedelta(days=10),
            "location": "Main Hall",
            "expected_capacity": 100,
            "max_capacity": 150,
            "status": EventStatus.REJECTED,
            "rejection_reason": "Event content does not align with university policies. Please submit an academic or professional event.",
            "club_id": cs_club.id,
            "approved_by_id": advisor.id
        },
        # COMPLETED - Past event
        {
            "title": "Introduction to Programming - Fall 2024",
            "description": "Completed introductory programming workshop from last semester",
            "event_datetime": datetime.now(timezone.utc) - timedelta(days=30),
            "location": "D201 - Medium Classroom",
            "expected_capacity": 40,
            "max_capacity": 50,
            "status": EventStatus.COMPLETED,
            "club_id": cs_club.id,
            "room_id": rooms["D201 - Medium Classroom"].id,
            "approved_by_id": advisor.id
        },
        # EDGE CASE - Very large event
        {
            "title": "Tech Career Fair 2025",
            "description": "Annual tech career fair with 50+ companies",
            "event_datetime": datetime.now(timezone.utc) + timedelta(days=45),
            "location": "Sports Hall",
            "expected_capacity": 400,
            "max_capacity": 500,
            "status": EventStatus.APPROVED,
            "club_id": cs_club.id,
            "room_id": rooms["Sports Hall"].id,
            "approved_by_id": advisor.id
        },
        # EDGE CASE - Small intimate event
        {
            "title": "Code Review Session",
            "description": "Small group code review and pair programming",
            "event_datetime": datetime.now(timezone.utc) + timedelta(days=4),
            "location": "D103 - Meeting Room",
            "expected_capacity": 8,
            "max_capacity": 10,
            "status": EventStatus.APPROVED,
            "club_id": ai_club.id,
            "room_id": rooms["D103 - Meeting Room"].id,
            "approved_by_id": advisor.id
        },
        # Another REJECTED for testing
        {
            "title": "Overnight Hackathon",
            "description": "24-hour coding marathon",
            "event_datetime": datetime.now(timezone.utc) + timedelta(days=15),
            "location": "Conference Hall",
            "expected_capacity": 80,
            "max_capacity": 100,
            "status": EventStatus.REJECTED,
            "rejection_reason": "Overnight events require special safety protocols. Please submit a revised proposal with security arrangements.",
            "club_id": robotics_club.id,
            "approved_by_id": advisor.id
        }
    ]

    events = []
    for event_data in events_data:
        event = Event(**event_data)
        db.add(event)
        events.append(event)

    db.commit()

    print(f"   ✅ Created {len(events)} events")
    return events


def create_registrations(db, events, users):
    """Create event registrations"""
    print("✅ Creating event registrations...")

    student = users["student@gsu.edu.tr"]
    manager1 = users["club.manager@gsu.edu.tr"]
    manager2 = users["manager2@gsu.edu.tr"]
    advisor = users["advisor@gsu.edu.tr"]

    # Find specific events
    python_workshop = next((e for e in events if "Python" in e.title), None)
    ai_symposium = next((e for e in events if "Symposium" in e.title), None)
    robotics_prep = next((e for e in events if "Robotics" in e.title), None)
    completed_event = next((e for e in events if e.status == EventStatus.COMPLETED), None)

    registrations = []

    # Python Workshop - 3 registrations
    if python_workshop:
        registrations.extend([
            EventRegistration(user_id=student.id, event_id=python_workshop.id, attended=False),
            EventRegistration(user_id=manager2.id, event_id=python_workshop.id, attended=False),
            EventRegistration(user_id=advisor.id, event_id=python_workshop.id, attended=False),
        ])

    # AI Symposium - 4 registrations
    if ai_symposium:
        registrations.extend([
            EventRegistration(user_id=student.id, event_id=ai_symposium.id, attended=False),
            EventRegistration(user_id=manager1.id, event_id=ai_symposium.id, attended=False),
            EventRegistration(user_id=manager2.id, event_id=ai_symposium.id, attended=False),
            EventRegistration(user_id=advisor.id, event_id=ai_symposium.id, attended=False),
        ])

    # Robotics Prep - 2 registrations (almost full!)
    if robotics_prep:
        registrations.extend([
            EventRegistration(user_id=student.id, event_id=robotics_prep.id, attended=False),
            EventRegistration(user_id=manager2.id, event_id=robotics_prep.id, attended=False),
        ])

    # Completed Event - attended=True
    if completed_event:
        registrations.extend([
            EventRegistration(user_id=student.id, event_id=completed_event.id, attended=True),
            EventRegistration(user_id=manager1.id, event_id=completed_event.id, attended=True),
        ])

    for reg in registrations:
        db.add(reg)

    db.commit()

    print(f"   ✅ Created {len(registrations)} event registrations")


def create_follows(db, clubs_list, users):
    """Create follow relationships"""
    print("🔗 Creating follow relationships...")

    student = users["student@gsu.edu.tr"]
    manager2 = users["manager2@gsu.edu.tr"]
    advisor = users["advisor@gsu.edu.tr"]

    # Student follows all clubs
    for club in clubs_list:
        student.followed_clubs.append(club)

    # Manager2 follows first two clubs
    if len(clubs_list) >= 2:
        manager2.followed_clubs.append(clubs_list[0])
        manager2.followed_clubs.append(clubs_list[1])

    # Advisor follows all clubs
    for club in clubs_list:
        advisor.followed_clubs.append(club)

    db.commit()

    follow_count = len(student.followed_clubs) + len(manager2.followed_clubs) + len(advisor.followed_clubs)
    print(f"   ✅ Created {follow_count} follow relationships")


def create_notifications(db, users, events):
    """Create test notifications"""
    print("🔔 Creating notifications...")

    student = users["student@gsu.edu.tr"]
    manager1 = users["club.manager@gsu.edu.tr"]

    notifications = [
        # Student notifications
        Notification(
            user_id=student.id,
            title="Welcome to GSUNET!",
            message="Welcome to Galatasaray University Event Network. Start exploring events!",
            notification_type=NotificationType.CLUB_UPDATE,
            read=False
        ),
        Notification(
            user_id=student.id,
            title="Event Approved",
            message="The event 'Python Workshop for Beginners' has been approved and is now open for registration!",
            notification_type=NotificationType.EVENT_APPROVED,
            read=False
        ),
        Notification(
            user_id=student.id,
            title="Event Reminder",
            message="Don't forget: 'Robotics Competition Preparation' starts in 3 days!",
            notification_type=NotificationType.EVENT_REMINDER,
            read=True  # Already read
        ),

        # Club Manager notifications
        Notification(
            user_id=manager1.id,
            title="Event Rejected",
            message="Your event 'Unauthorized Party Event' has been rejected. Reason: Event content does not align with university policies.",
            notification_type=NotificationType.EVENT_REJECTED,
            read=False
        ),
        Notification(
            user_id=manager1.id,
            title="Event Approved",
            message="Your event 'Web Development Workshop' has been approved!",
            notification_type=NotificationType.EVENT_APPROVED,
            read=True
        ),
    ]

    for notif in notifications:
        db.add(notif)

    db.commit()

    print(f"   ✅ Created {len(notifications)} notifications")


def create_credentials_file(users_original, clubs_list):
    """Create TEST_CREDENTIALS.md file with all credentials and info"""
    credentials_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'TEST_CREDENTIALS.md')

    content = """# Test User Credentials

**Generated automatically by seed_test_users.py**

All passwords meet the security requirements:
- ✅ At least 8 characters
- ✅ 1 uppercase letter
- ✅ 1 lowercase letter
- ✅ 1 digit
- ✅ 1 special character (!@#$%^&*(),.?":{}|<>)

---

## Test Users

"""

    # Add user credentials
    role_names = {
        'admin': 'Admin',
        'advisor': 'Advisor',
        'club_manager': 'Club Manager',
        'student': 'Student'
    }

    for i, user_data in enumerate(users_original, 1):
        content += f"""### {i}. {role_names.get(user_data['role'].value, user_data['role'].value)}
- **Role**: {user_data['role'].value}
- **Email**: `{user_data['email']}`
- **Password**: `{user_data['password']}`
- **Full Name**: {user_data['full_name']}
- **Student Number**: {user_data['student_number']}
- **Department**: {user_data['department']}

"""

    content += """---

## Test Clubs

"""

    # Add club information
    for i, club in enumerate(clubs_list, 1):
        manager_name = club.manager.full_name if club.manager else 'Not assigned'
        advisor_name = club.advisor.full_name if club.advisor else 'Not assigned'

        content += f"""### {i}. {club.name}
- **Description**: {club.description}
- **Contact Email**: {club.contact_email}
- **Manager**: {manager_name}
- **Advisor**: {advisor_name}

"""

    content += """---

## Quick Reference Table

| Role | Email | Password | Name |
|------|-------|----------|------|
"""

    for user_data in users_original:
        content += f"| {user_data['role'].value} | {user_data['email']} | {user_data['password']} | {user_data['full_name']} |\n"

    content += """
---

## How to Use

1. **Start the backend**:
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn app.main:app --reload
   ```

2. **Start the frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Login** at `http://localhost:5173/login` with any credentials above

---

## Password Requirements

When creating new users, passwords must contain:
- ✅ Minimum 8 characters
- ✅ At least one uppercase letter (A-Z)
- ✅ At least one lowercase letter (a-z)
- ✅ At least one digit (0-9)
- ✅ At least one special character (!@#$%^&*(),.?":{}|<>)

**Good examples**: `Admin123!`, `Password1!`, `MyPass@2024`

**Bad examples**:
- `password` (no uppercase, no number, no special char)
- `Pass1` (too short, no special char)
- `PASSWORD123` (no lowercase, no special char)

---

**Last Updated**: Auto-generated on database seed
**Database Schema Version**: v3.0 (comprehensive test data)
"""

    with open(credentials_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"\n📄 Created {credentials_path}")


def create_test_data():
    """Create comprehensive test data"""
    print("🌱 Seeding database with comprehensive test data...\n")

    # Create tables
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully\n")

    db = SessionLocal()

    try:
        # 1. Clean existing data
        print("🗑️  Cleaning existing data...")
        db.query(EventRegistration).delete()
        db.query(Notification).delete()
        db.query(Event).delete()
        db.query(Room).delete()
        db.query(Club).delete()
        # Clear follow relationships (many-to-many)
        db.execute(text("DELETE FROM user_club_association"))
        db.query(User).delete()
        db.commit()
        print("   ✅ Database cleaned\n")

        # 2. Create data in proper order (FK dependencies)
        users, users_original = create_users(db)
        rooms = create_rooms(db)
        clubs, clubs_list = create_clubs(db, users)
        events = create_events(db, clubs, rooms, users)
        create_registrations(db, events, users)
        create_follows(db, clubs_list, users)
        create_notifications(db, users, events)

        # 3. Create credentials file
        create_credentials_file(users_original, clubs_list)

        # 4. Summary
        print("\n✨ Database seeding completed successfully!\n")
        print("📊 Summary:")
        print(f"  - Users: {len(users)}")
        print(f"  - Rooms: {len(rooms)}")
        print(f"  - Clubs: {len(clubs_list)}")
        print(f"  - Events: {len(events)}")
        print(f"  - Registrations: {db.query(EventRegistration).count()}")
        print(f"  - Notifications: {db.query(Notification).count()}")
        print(f"\n📝 Check TEST_CREDENTIALS.md for login details")

    except Exception as e:
        print(f"\n❌ Error creating test data: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    create_test_data()
