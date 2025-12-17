"""
Comprehensive seed script for populating database with test data

Run this script with: python seed_test_users.py

Creates:
- 60 test users (2 admins, 5 advisors, 15 club managers, 38 students)
- 10 rooms (various capacities)
- 10 clubs (each with manager, advisor, members, followers)
- 20+ events (approved, pending, rejected, cancelled, completed)
- Club join requests (approved, pending, rejected)
- Event registrations
- Follow relationships
- Notifications
"""
import sys
import os
import copy
from datetime import datetime, timedelta, timezone
import random

# Add the parent directory to the path to import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, Base, engine
from app.models import (
    User, UserRole, Club, Event, EventStatus, Room,
    EventRegistration, Notification, NotificationType,
    ClubJoinRequest, JoinRequestStatus
)
from passlib.context import CryptContext
from sqlalchemy import text

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)


def create_users(db):
    """Create 60 diverse test users"""
    print("👥 Creating users...")

    departments = [
        "Computer Engineering", "Electrical Engineering", "Industrial Engineering",
        "Business Administration", "Law", "Economics", "Mathematics",
        "Physics", "Chemistry", "Sociology"
    ]

    first_names = [
        "Ahmet", "Mehmet", "Ayşe", "Fatma", "Ali", "Zeynep", "Can", "Elif",
        "Cem", "Deniz", "Ece", "Emre", "Gül", "Hakan", "İrem", "Kerem",
        "Merve", "Onur", "Pelin", "Selin", "Tolga", "Yasemin", "Burak", "Ceren"
    ]

    last_names = [
        "Yılmaz", "Kaya", "Demir", "Şahin", "Çelik", "Yıldız", "Arslan", "Özkan",
        "Aydın", "Öztürk", "Koç", "Erdoğan", "Aksoy", "Keskin", "Kurt", "Polat"
    ]

    users_data = []

    # 2 Admins
    users_data.extend([
        {
            "email": "admin@gsu.edu.tr",
            "password": "Admin123!",
            "full_name": "Admin User",
            "student_number": "ADM001",
            "department": "Administration",
            "role": UserRole.ADMIN
        },
        {
            "email": "admin2@gsu.edu.tr",
            "password": "Admin456!",
            "full_name": "Aylin Yıldırım",
            "student_number": "ADM002",
            "department": "Administration",
            "role": UserRole.ADMIN
        },
    ])

    # 5 Advisors
    for i in range(5):
        first = random.choice(first_names)
        last = random.choice(last_names)
        dept = departments[i % len(departments)]
        users_data.append({
            "email": f"advisor{i+1}@gsu.edu.tr",
            "password": f"Advisor{i+1}23!",
            "full_name": f"Dr. {first} {last}",
            "student_number": f"ADV{i+1:03d}",
            "department": dept,
            "role": UserRole.ADVISOR
        })

    # 15 Club Managers
    for i in range(15):
        first = random.choice(first_names)
        last = random.choice(last_names)
        dept = random.choice(departments)
        year = random.choice([2020, 2021, 2022])
        users_data.append({
            "email": f"manager{i+1}@gsu.edu.tr",
            "password": f"Manager{i+1}23!",
            "full_name": f"{first} {last}",
            "student_number": f"{year}{i+1:03d}",
            "department": dept,
            "role": UserRole.CLUB_MANAGER
        })

    # 38 Students
    for i in range(38):
        first = random.choice(first_names)
        last = random.choice(last_names)
        dept = random.choice(departments)
        year = random.choice([2021, 2022, 2023, 2024])
        users_data.append({
            "email": f"student{i+1}@gsu.edu.tr",
            "password": f"Student{i+1}23!",
            "full_name": f"{first} {last}",
            "student_number": f"{year}{100+i:03d}",
            "department": dept,
            "role": UserRole.STUDENT
        })

    # Save original for credentials file
    users_original = copy.deepcopy(users_data)

    users = {}
    users_by_role = {'admin': [], 'advisor': [], 'club_manager': [], 'student': []}

    for user_data in users_data:
        password = user_data.pop("password")
        user = User(**user_data, password_hash=hash_password(password))
        db.add(user)
        users[user.email] = user
        users_by_role[user.role.value].append(user)

    db.commit()

    print(f"   ✅ Created {len(users)} users (2 admins, 5 advisors, 15 managers, 38 students)")
    return users, users_by_role, users_original


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


def create_clubs(db, users_by_role):
    """Create 10 diverse clubs with managers and advisors"""
    print("📋 Creating clubs...")

    managers = users_by_role['club_manager']
    advisors = users_by_role['advisor']

    clubs_data = [
        {
            "name": "Computer Science Club",
            "description": "A club for computer science enthusiasts to learn, share, and collaborate on projects.",
            "contact_email": "csclub@gsu.edu.tr",
            "logo_url": "https://via.placeholder.com/100/0000FF/FFFFFF?text=CS",
            "manager_id": managers[0].id,
            "advisor_id": advisors[0].id
        },
        {
            "name": "Robotics Club",
            "description": "Building and programming robots, participating in competitions.",
            "contact_email": "robotics@gsu.edu.tr",
            "logo_url": "https://via.placeholder.com/100/FF0000/FFFFFF?text=ROBOT",
            "manager_id": managers[1].id,
            "advisor_id": advisors[1].id
        },
        {
            "name": "AI & Machine Learning Club",
            "description": "Exploring artificial intelligence and machine learning technologies.",
            "contact_email": "aiclub@gsu.edu.tr",
            "logo_url": "https://via.placeholder.com/100/00FF00/FFFFFF?text=AI",
            "manager_id": managers[2].id,
            "advisor_id": advisors[0].id
        },
        {
            "name": "Photography Club",
            "description": "Capturing moments, learning photography techniques, organizing photo walks.",
            "contact_email": "photo@gsu.edu.tr",
            "logo_url": "https://via.placeholder.com/100/FFA500/FFFFFF?text=PHOTO",
            "manager_id": managers[3].id,
            "advisor_id": advisors[2].id
        },
        {
            "name": "Music Club",
            "description": "For music lovers. Jam sessions, concerts, music theory workshops.",
            "contact_email": "music@gsu.edu.tr",
            "logo_url": "https://via.placeholder.com/100/800080/FFFFFF?text=MUSIC",
            "manager_id": managers[4].id,
            "advisor_id": advisors[2].id
        },
        {
            "name": "Theater Club",
            "description": "Drama, acting, stage performances, and theatrical productions.",
            "contact_email": "theater@gsu.edu.tr",
            "logo_url": "https://via.placeholder.com/100/FF1493/FFFFFF?text=THEATER",
            "manager_id": managers[5].id,
            "advisor_id": advisors[3].id
        },
        {
            "name": "Sports Club",
            "description": "Organizing sports events, tournaments, and promoting active lifestyle.",
            "contact_email": "sports@gsu.edu.tr",
            "logo_url": "https://via.placeholder.com/100/1E90FF/FFFFFF?text=SPORTS",
            "manager_id": managers[6].id,
            "advisor_id": advisors[3].id
        },
        {
            "name": "Literature Club",
            "description": "Book discussions, creative writing, poetry readings, and literary events.",
            "contact_email": "literature@gsu.edu.tr",
            "logo_url": "https://via.placeholder.com/100/8B4513/FFFFFF?text=LIT",
            "manager_id": managers[7].id,
            "advisor_id": advisors[4].id
        },
        {
            "name": "Chess Club",
            "description": "Strategic thinking through chess. Tournaments, training, and friendly matches.",
            "contact_email": "chess@gsu.edu.tr",
            "logo_url": "https://via.placeholder.com/100/000000/FFFFFF?text=CHESS",
            "manager_id": managers[8].id,
            "advisor_id": advisors[4].id
        },
        {
            "name": "Environmental Club",
            "description": "Promoting sustainability, organizing clean-up drives, and environmental awareness campaigns.",
            "contact_email": "environment@gsu.edu.tr",
            "logo_url": "https://via.placeholder.com/100/228B22/FFFFFF?text=ENV",
            "manager_id": managers[9].id,
            "advisor_id": advisors[0].id
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


def create_club_memberships(db, clubs_list, users_by_role):
    """Create club join requests (approved, pending, rejected)"""
    print("👤 Creating club memberships...")

    students = users_by_role['student']
    managers = users_by_role['club_manager']

    join_requests = []

    # For each club, create 5-15 approved members, 2-3 pending, 1-2 rejected
    for club in clubs_list:
        # Approved members (5-15 students + some managers)
        approved_count = random.randint(5, 15)
        selected_students = random.sample(students, min(approved_count, len(students)))

        for student in selected_students:
            join_requests.append(ClubJoinRequest(
                user_id=student.id,
                club_id=club.id,
                message=f"I'm interested in joining {club.name}!",
                status=JoinRequestStatus.APPROVED
            ))

        # Some managers are also members of other clubs
        if len(managers) > 10:
            approved_managers = random.sample(managers[10:], min(2, len(managers) - 10))
            for manager in approved_managers:
                # Don't add manager to their own club
                if manager.id != club.manager_id:
                    join_requests.append(ClubJoinRequest(
                        user_id=manager.id,
                        club_id=club.id,
                        message="Interested in cross-club collaboration",
                        status=JoinRequestStatus.APPROVED
                    ))

        # Pending requests (2-3)
        pending_count = random.randint(2, 3)
        remaining_students = [s for s in students if s not in selected_students]
        if remaining_students:
            pending_students = random.sample(remaining_students, min(pending_count, len(remaining_students)))
            for student in pending_students:
                join_requests.append(ClubJoinRequest(
                    user_id=student.id,
                    club_id=club.id,
                    message="Looking forward to being part of the club!",
                    status=JoinRequestStatus.PENDING
                ))

        # Rejected requests (1-2)
        rejected_count = random.randint(1, 2)
        if len(students) > (approved_count + pending_count):
            other_students = [s for s in students if s not in selected_students and s not in (pending_students if remaining_students else [])]
            if other_students:
                rejected_students = random.sample(other_students, min(rejected_count, len(other_students)))
                for student in rejected_students:
                    join_requests.append(ClubJoinRequest(
                        user_id=student.id,
                        club_id=club.id,
                        message="Want to join!",
                        status=JoinRequestStatus.REJECTED,
                        rejection_reason="Club capacity reached for this semester. Please apply next semester."
                    ))

    for req in join_requests:
        db.add(req)

    db.commit()

    print(f"   ✅ Created {len(join_requests)} club join requests")
    return join_requests


def create_follows(db, clubs_list, users_by_role):
    """Create follow relationships - lots of students following clubs"""
    print("🔗 Creating follow relationships...")

    students = users_by_role['student']
    managers = users_by_role['club_manager']
    advisors = users_by_role['advisor']

    follow_count = 0

    # Each student follows 3-7 random clubs
    for student in students:
        num_follows = random.randint(3, 7)
        clubs_to_follow = random.sample(clubs_list, min(num_follows, len(clubs_list)))
        for club in clubs_to_follow:
            student.followed_clubs.append(club)
            follow_count += 1

    # Managers follow 2-4 clubs (including their own)
    for manager in managers:
        num_follows = random.randint(2, 4)
        clubs_to_follow = random.sample(clubs_list, min(num_follows, len(clubs_list)))
        for club in clubs_to_follow:
            if club not in manager.followed_clubs:
                manager.followed_clubs.append(club)
                follow_count += 1

    # Advisors follow all clubs they advise + 2-3 others
    for advisor in advisors:
        # Follow all clubs they advise
        for club in clubs_list:
            if club.advisor_id == advisor.id:
                advisor.followed_clubs.append(club)
                follow_count += 1

        # Follow 2-3 random others
        other_clubs = [c for c in clubs_list if c.advisor_id != advisor.id]
        if other_clubs:
            num_follows = random.randint(2, 3)
            clubs_to_follow = random.sample(other_clubs, min(num_follows, len(other_clubs)))
            for club in clubs_to_follow:
                if club not in advisor.followed_clubs:
                    advisor.followed_clubs.append(club)
                    follow_count += 1

    db.commit()

    print(f"   ✅ Created {follow_count} follow relationships")


def create_events(db, clubs_list, rooms, users_by_role):
    """Create 20+ diverse events"""
    print("🎉 Creating events...")

    advisors = users_by_role['advisor']
    random.shuffle(advisors)

    events_data = []

    # Function to get random room for capacity
    def get_room_for_capacity(capacity):
        suitable_rooms = [r for r in rooms.values() if r.capacity >= capacity]
        return random.choice(suitable_rooms) if suitable_rooms else list(rooms.values())[0]

    event_titles = [
        ("Python Workshop for Beginners", "Learn Python basics with hands-on projects. Perfect for beginners!"),
        ("AI & Machine Learning Symposium", "Guest speakers from industry and academia discuss the latest in AI and ML."),
        ("Robotics Competition Preparation", "Prepare for the upcoming robotics competition with hands-on practice."),
        ("Web Development Workshop", "Learn modern web development with React and Node.js"),
        ("Mobile App Development Bootcamp", "2-day intensive bootcamp on iOS and Android development"),
        ("Tech Talk: Cloud Computing", "Introduction to cloud platforms (AWS, Azure, GCP)"),
        ("Photography Walk: Campus Beauty", "Explore and capture the beautiful corners of our campus"),
        ("Portrait Photography Workshop", "Learn professional portrait photography techniques"),
        ("Open Mic Night", "Showcase your musical talent in a friendly environment"),
        ("Classical Music Concert", "Evening of classical music performances"),
        ("Shakespeare Workshop", "Exploring Hamlet - reading and discussion"),
        ("Annual Theater Performance", "Our spring play: 'A Midsummer Night's Dream'"),
        ("Basketball Tournament", "Inter-department basketball championship"),
        ("Yoga and Meditation Session", "Relax and recharge with guided yoga"),
        ("Book Club: 1984 Discussion", "Monthly book club meeting"),
        ("Creative Writing Workshop", "Improve your writing skills with exercises and feedback"),
        ("Chess Tournament Finals", "Annual chess championship - final rounds"),
        ("Simultaneous Chess Exhibition", "Play against a chess master simultaneously"),
        ("Beach Cleanup Drive", "Help clean our local beach - make an impact!"),
        ("Sustainability Workshop", "Learn about sustainable living and green practices"),
        ("Code Review Session", "Small group code review and pair programming"),
        ("Tech Career Fair 2025", "Annual tech career fair with 50+ companies"),
        ("Hackathon 2025", "24-hour coding challenge with amazing prizes"),
        ("Data Science Bootcamp", "Introduction to data analysis and visualization"),
    ]

    # Distribute events across clubs
    for i, (title, description) in enumerate(event_titles):
        club = clubs_list[i % len(clubs_list)]

        # Determine status
        if i % 7 == 0:
            status = EventStatus.PENDING
            approved_by = None
        elif i % 11 == 0:
            status = EventStatus.REJECTED
            approved_by = random.choice(advisors).id
            rejection_reason = random.choice([
                "Event content does not align with university policies. Please submit a revised proposal.",
                "Insufficient safety protocols for the planned activity.",
                "Conflicts with another major university event on the same date.",
                "Budget proposal needs more detail. Please resubmit with itemized costs."
            ])
        elif i % 13 == 0:
            status = EventStatus.CANCELLED
            approved_by = random.choice(advisors).id
            rejection_reason = None
        elif i % 17 == 0:
            status = EventStatus.COMPLETED
            approved_by = random.choice(advisors).id
            event_date = datetime.now(timezone.utc) - timedelta(days=random.randint(15, 60))
            rejection_reason = None
        else:
            status = EventStatus.APPROVED
            approved_by = random.choice(advisors).id
            rejection_reason = None

        # Date calculation
        if status == EventStatus.COMPLETED:
            event_datetime = datetime.now(timezone.utc) - timedelta(days=random.randint(15, 60))
        else:
            event_datetime = datetime.now(timezone.utc) + timedelta(days=random.randint(3, 60))

        expected_capacity = random.choice([10, 15, 20, 30, 40, 50, 80, 100, 150, 200])
        max_capacity = int(expected_capacity * random.uniform(1.2, 1.5))

        room = get_room_for_capacity(max_capacity)

        event_dict = {
            "title": title,
            "description": description,
            "event_datetime": event_datetime,
            "location": room.location,
            "expected_capacity": expected_capacity,
            "max_capacity": max_capacity,
            "status": status,
            "club_id": club.id,
            "room_id": room.id if status != EventStatus.PENDING else None,
            "approved_by_id": approved_by
        }

        if status == EventStatus.REJECTED:
            event_dict["rejection_reason"] = rejection_reason

        events_data.append(event_dict)

    events = []
    for event_data in events_data:
        event = Event(**event_data)
        db.add(event)
        events.append(event)

    db.commit()

    print(f"   ✅ Created {len(events)} events")
    return events


def create_registrations(db, events, users_by_role):
    """Create event registrations - students register for events"""
    print("✅ Creating event registrations...")

    students = users_by_role['student']
    managers = users_by_role['club_manager']

    registrations = []

    # Only register for approved and completed events
    registrable_events = [e for e in events if e.status in [EventStatus.APPROVED, EventStatus.COMPLETED, EventStatus.CANCELLED]]

    for event in registrable_events:
        # Random number of registrations (20-80% of expected capacity)
        min_reg = int(event.expected_capacity * 0.2)
        max_reg = min(int(event.expected_capacity * 0.8), len(students))

        # Skip if not enough students
        if min_reg > max_reg:
            max_reg = min(event.expected_capacity, len(students))
            min_reg = min(min_reg, max_reg)

        num_registrations = random.randint(min_reg, max_reg) if max_reg > 0 else 0

        selected_users = random.sample(students, min(num_registrations, len(students)))

        # Add some managers too
        if len(managers) > 5:
            selected_users.extend(random.sample(managers[:5], min(2, len(managers))))

        for user in selected_users:
            attended = event.status == EventStatus.COMPLETED and random.choice([True, True, False])  # 66% attended

            registrations.append(EventRegistration(
                user_id=user.id,
                event_id=event.id,
                attended=attended
            ))

    for reg in registrations:
        db.add(reg)

    db.commit()

    print(f"   ✅ Created {len(registrations)} event registrations")
    return registrations


def create_notifications(db, users_by_role, events):
    """Create diverse notifications for users"""
    print("🔔 Creating notifications...")

    students = users_by_role['student'][:10]  # First 10 students
    managers = users_by_role['club_manager'][:5]  # First 5 managers

    notification_templates = [
        ("Welcome to GSUNET!", "Welcome to Galatasaray University Event Network. Start exploring events!", NotificationType.CLUB_UPDATE, False),
        ("Event Approved", "Your event has been approved and is now open for registration!", NotificationType.EVENT_APPROVED, False),
        ("Event Rejected", "Your event proposal needs revision. Check the rejection reason.", NotificationType.EVENT_REJECTED, False),
        ("Event Reminder", "Don't forget: Your registered event starts in 3 days!", NotificationType.EVENT_REMINDER, True),
        ("New Event", "A new event has been created by a club you follow!", NotificationType.EVENT_CREATED, False),
        ("Event Updated", "An event you registered for has been updated.", NotificationType.EVENT_UPDATED, True),
        ("Event Cancelled", "Unfortunately, an event you registered for has been cancelled.", NotificationType.EVENT_CANCELLED, False),
    ]

    notifications = []

    # Create notifications for students
    for student in students:
        num_notifications = random.randint(2, 5)
        for _ in range(num_notifications):
            template = random.choice(notification_templates)
            title, message, notif_type, read = template

            # Add event ID metadata for some notifications
            if notif_type in [NotificationType.EVENT_REMINDER, NotificationType.EVENT_CANCELLED]:
                approved_events = [e for e in events if e.status == EventStatus.APPROVED]
                if approved_events:
                    event = random.choice(approved_events)
                    message = f"{message} ||EVENT:{event.id}||"

            notifications.append(Notification(
                user_id=student.id,
                title=title,
                message=message,
                notification_type=notif_type,
                read=read
            ))

    # Create notifications for managers
    for manager in managers:
        num_notifications = random.randint(1, 4)
        for _ in range(num_notifications):
            template = random.choice(notification_templates[1:])  # Exclude welcome
            title, message, notif_type, read = template

            notifications.append(Notification(
                user_id=manager.id,
                title=title,
                message=message,
                notification_type=notif_type,
                read=read
            ))

    for notif in notifications:
        db.add(notif)

    db.commit()

    print(f"   ✅ Created {len(notifications)} notifications")


def create_credentials_file(users_original, clubs_list):
    """Create TEST_CREDENTIALS.md file with all credentials and info"""
    credentials_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'TEST_CREDENTIALS.md')

    current_date = datetime.now().strftime("%Y-%m-%d %H:%M")
    total_users = len(users_original)

    content = f"""# Test User Credentials

**Generated automatically by seed_test_users.py**
**Last Updated**: {current_date}
**Total Users**: {total_users}

All passwords meet the security requirements:
- ✅ At least 8 characters
- ✅ 1 uppercase letter
- ✅ 1 lowercase letter
- ✅ 1 digit
- ✅ 1 special character (!@#$%^&*(),.?":{{}}|<>)

---

## Quick Access - Key Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gsu.edu.tr | Admin123! |
| Advisor | advisor1@gsu.edu.tr | Advisor123! |
| Club Manager | manager1@gsu.edu.tr | Manager123! |
| Student | student1@gsu.edu.tr | Student123! |

---

## All Test Users

### Admins (2)

"""

    # Group by role
    admins = [u for u in users_original if u['role'] == UserRole.ADMIN]
    advisors = [u for u in users_original if u['role'] == UserRole.ADVISOR]
    managers = [u for u in users_original if u['role'] == UserRole.CLUB_MANAGER]
    students = [u for u in users_original if u['role'] == UserRole.STUDENT]

    for i, user in enumerate(admins, 1):
        content += f"{i}. **{user['full_name']}** - `{user['email']}` / `{user['password']}`\n"

    content += f"\n### Advisors ({len(advisors)})\n\n"
    for i, user in enumerate(advisors, 1):
        content += f"{i}. **{user['full_name']}** ({user['department']}) - `{user['email']}` / `{user['password']}`\n"

    content += f"\n### Club Managers ({len(managers)})\n\n"
    for i, user in enumerate(managers, 1):
        content += f"{i}. **{user['full_name']}** ({user['department']}) - `{user['email']}` / `{user['password']}`\n"

    content += f"\n### Students ({len(students)})\n\n"
    for i, user in enumerate(students, 1):
        content += f"{i}. **{user['full_name']}** ({user['department']}) - `{user['email']}` / `{user['password']}`\n"

    content += """\n---

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

## How to Use

1. **Reset database** (if needed):
   ```bash
   cd backend
   python seed_test_users.py
   ```

2. **Start the backend**:
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn app.main:app --reload
   ```

3. **Start the frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

4. **Login** at `http://localhost:5173/login` with any credentials above

---

## Password Requirements

When creating new users, passwords must contain:
- ✅ Minimum 8 characters
- ✅ At least one uppercase letter (A-Z)
- ✅ At least one lowercase letter (a-z)
- ✅ At least one digit (0-9)
- ✅ At least one special character (!@#$%^&*(),.?":{}|<>)

**Good examples**: `Admin123!`, `Password1!`, `MyPass@2024`
**Bad examples**: `password`, `Pass1`, `PASSWORD123`

---

**Database Version**: v4.0 (60 users, 10 clubs, comprehensive test data)
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
        db.query(ClubJoinRequest).delete()
        db.query(Event).delete()
        db.query(Room).delete()
        db.query(Club).delete()
        # Clear follow relationships (many-to-many)
        db.execute(text("DELETE FROM user_club_association"))
        db.query(User).delete()
        db.commit()
        print("   ✅ Database cleaned\n")

        # 2. Create data in proper order (FK dependencies)
        users, users_by_role, users_original = create_users(db)
        rooms = create_rooms(db)
        clubs, clubs_list = create_clubs(db, users_by_role)
        create_club_memberships(db, clubs_list, users_by_role)
        create_follows(db, clubs_list, users_by_role)
        events = create_events(db, clubs_list, rooms, users_by_role)
        create_registrations(db, events, users_by_role)
        create_notifications(db, users_by_role, events)

        # 3. Create credentials file
        create_credentials_file(users_original, clubs_list)

        # 4. Summary
        print("\n✨ Database seeding completed successfully!\n")
        print("📊 Summary:")
        print(f"  - Users: {len(users)} (2 admins, 5 advisors, 15 managers, 38 students)")
        print(f"  - Rooms: {len(rooms)}")
        print(f"  - Clubs: {len(clubs_list)}")
        print(f"  - Events: {len(events)}")
        print(f"  - Club Join Requests: {db.query(ClubJoinRequest).count()}")
        print(f"  - Event Registrations: {db.query(EventRegistration).count()}")
        print(f"  - Follow Relationships: {db.execute(text('SELECT COUNT(*) FROM user_club_association')).scalar()}")
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
