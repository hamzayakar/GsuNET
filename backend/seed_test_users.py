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
from datetime import datetime, timedelta, timezone, time
import random

# Add the parent directory to the path to import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, Base, engine
from app.models import (
    User, UserRole, Club, Event, EventStatus, Room,
    EventRegistration, Notification, NotificationType,
    ClubJoinRequest, JoinRequestStatus, RoomSchedule, BlockType,
    SponsorshipRequest, SponsorshipMatch, SponsorshipStatus, SponsorshipType
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

    # 2 Sponsors (Review6: AI-powered sponsor matching system)
    users_data.extend([
        {
            "email": "sponsor1@techcorp.com",
            "password": "Sponsor123!",
            "full_name": "Tech Corp Inc.",
            "student_number": "SPONSOR001",
            "department": "Corporate Sponsorship",
            "role": UserRole.SPONSOR
        },
        {
            "email": "sponsor2@innovate.com",
            "password": "Sponsor456!",
            "full_name": "Innovate Solutions Ltd.",
            "student_number": "SPONSOR002",
            "department": "Corporate Sponsorship",
            "role": UserRole.SPONSOR
        },
    ])

    # Save original for credentials file
    users_original = copy.deepcopy(users_data)

    users = {}
    users_by_role = {'admin': [], 'advisor': [], 'club_manager': [], 'student': [], 'sponsor': []}

    for user_data in users_data:
        password = user_data.pop("password")
        user = User(**user_data, password_hash=hash_password(password))
        db.add(user)
        users[user.email] = user
        users_by_role[user.role.value].append(user)

    db.commit()

    print(f"   ✅ Created {len(users)} users (2 admins, 5 advisors, 15 managers, 38 students, 2 sponsors)")
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
            "manager_id": managers[0].id,
            "advisor_id": advisors[0].id
        },
        {
            "name": "Robotics Club",
            "description": "Building and programming robots, participating in competitions.",
            "contact_email": "robotics@gsu.edu.tr",
            "manager_id": managers[1].id,
            "advisor_id": advisors[1].id
        },
        {
            "name": "AI & Machine Learning Club",
            "description": "Exploring artificial intelligence and machine learning technologies.",
            "contact_email": "aiclub@gsu.edu.tr",
            "manager_id": managers[2].id,
            "advisor_id": advisors[0].id
        },
        {
            "name": "Photography Club",
            "description": "Capturing moments, learning photography techniques, organizing photo walks.",
            "contact_email": "photo@gsu.edu.tr",
            "manager_id": managers[3].id,
            "advisor_id": advisors[2].id
        },
        {
            "name": "Music Club",
            "description": "For music lovers. Jam sessions, concerts, music theory workshops.",
            "contact_email": "music@gsu.edu.tr",
            "manager_id": managers[4].id,
            "advisor_id": advisors[2].id
        },
        {
            "name": "Theater Club",
            "description": "Drama, acting, stage performances, and theatrical productions.",
            "contact_email": "theater@gsu.edu.tr",
            "manager_id": managers[5].id,
            "advisor_id": advisors[3].id
        },
        {
            "name": "Sports Club",
            "description": "Organizing sports events, tournaments, and promoting active lifestyle.",
            "contact_email": "sports@gsu.edu.tr",
            "manager_id": managers[6].id,
            "advisor_id": advisors[3].id
        },
        {
            "name": "Literature Club",
            "description": "Book discussions, creative writing, poetry readings, and literary events.",
            "contact_email": "literature@gsu.edu.tr",
            "manager_id": managers[7].id,
            "advisor_id": advisors[4].id
        },
        {
            "name": "Chess Club",
            "description": "Strategic thinking through chess. Tournaments, training, and friendly matches.",
            "contact_email": "chess@gsu.edu.tr",
            "manager_id": managers[8].id,
            "advisor_id": advisors[4].id
        },
        {
            "name": "Environmental Club",
            "description": "Promoting sustainability, organizing clean-up drives, and environmental awareness campaigns.",
            "contact_email": "environment@gsu.edu.tr",
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


def update_clubs_with_sponsorship_needs(db, clubs_list):
    """Update clubs with sponsorship needs and budget expectations (Review6: TWO-WAY MATCHING)"""
    print("💰 Adding sponsorship needs to clubs...")

    sponsorship_needs_data = {
        "Computer Science Club": {
            "sponsorship_needs": "We need funding for hackathon prizes, workshop equipment, and tech conference tickets. Looking for cloud computing credits and development tools.",
            "sponsorship_budget_expectation": "20,000 - 35,000 TL"
        },
        "Robotics Club": {
            "sponsorship_needs": "Robot parts, sensors, microcontrollers, 3D printing materials, competition entry fees.",
            "sponsorship_budget_expectation": "25,000 - 40,000 TL"
        },
        "AI & Machine Learning Club": {
            "sponsorship_needs": "GPU access for training, cloud computing credits, AI/ML conference tickets, dataset licenses.",
            "sponsorship_budget_expectation": "30,000 - 50,000 TL"
        },
        "Photography Club": {
            "sponsorship_needs": "Camera equipment, lenses, lighting gear, photo editing software licenses, exhibition venue.",
            "sponsorship_budget_expectation": "15,000 - 25,000 TL"
        },
        "Music Club": {
            "sponsorship_needs": "Musical instruments, sound system, recording equipment, concert venue rental.",
            "sponsorship_budget_expectation": "18,000 - 30,000 TL"
        },
        "Theater Club": {
            "sponsorship_needs": "Stage props, costumes, lighting equipment, theater rental for performances.",
            "sponsorship_budget_expectation": "12,000 - 22,000 TL"
        },
        "Sports Club": {
            "sponsorship_needs": "Sports equipment, tournament organization, team jerseys, facility rental.",
            "sponsorship_budget_expectation": "10,000 - 20,000 TL"
        },
        "Literature Club": {
            "sponsorship_needs": "Books for club library, author visit fees, poetry event venue, printing costs for literary magazine.",
            "sponsorship_budget_expectation": "8,000 - 15,000 TL"
        },
        "Chess Club": {
            "sponsorship_needs": "Chess boards, clocks, tournament entry fees, online training platform subscriptions.",
            "sponsorship_budget_expectation": "5,000 - 12,000 TL"
        },
        "Environmental Club": {
            "sponsorship_needs": "Eco-friendly materials, campaign materials, tree planting supplies, awareness event organization.",
            "sponsorship_budget_expectation": "10,000 - 18,000 TL"
        }
    }

    for club in clubs_list:
        if club.name in sponsorship_needs_data:
            club.sponsorship_needs = sponsorship_needs_data[club.name]["sponsorship_needs"]
            club.sponsorship_budget_expectation = sponsorship_needs_data[club.name]["sponsorship_budget_expectation"]

    db.commit()
    print(f"   ✅ Updated {len(clubs_list)} clubs with sponsorship needs")


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

    # Realistic event start times (avoiding class hours when possible)
    # Weekday evening slots, weekend day slots
    realistic_times = [
        (17, 0),   # 17:00 - After classes
        (17, 30),  # 17:30
        (18, 0),   # 18:00 - Popular evening slot
        (18, 30),  # 18:30
        (19, 0),   # 19:00 - Evening events
        (19, 30),  # 19:30
        (10, 0),   # 10:00 - Weekend morning (Sat/Sun)
        (11, 0),   # 11:00
        (14, 0),   # 14:00 - Afternoon
        (15, 0),   # 15:00
        (16, 0),   # 16:00
    ]

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
            rejection_reason = None
        else:
            status = EventStatus.APPROVED
            approved_by = random.choice(advisors).id
            rejection_reason = None

        # Date calculation with realistic times
        # Pick a realistic time slot
        hour, minute = random.choice(realistic_times)

        if status == EventStatus.COMPLETED:
            # Past events (15-60 days ago)
            days_ago = random.randint(15, 60)
            base_date = datetime.now(timezone.utc).replace(hour=hour, minute=minute, second=0, microsecond=0)
            event_datetime = base_date - timedelta(days=days_ago)
        else:
            # Future events (3-60 days from now)
            days_ahead = random.randint(3, 60)
            base_date = datetime.now(timezone.utc).replace(hour=hour, minute=minute, second=0, microsecond=0)
            event_datetime = base_date + timedelta(days=days_ahead)

        expected_capacity = random.choice([10, 15, 20, 30, 40, 50, 80, 100, 150, 200])
        max_capacity = int(expected_capacity * random.uniform(1.2, 1.5))

        room = get_room_for_capacity(max_capacity)

        # Determine event duration (30-240 minutes)
        # Workshops/talks: 60-120 min, competitions/performances: 120-180 min, bootcamps: 180-240 min
        if 'Workshop' in title or 'Talk' in title or 'Session' in title:
            duration = random.choice([60, 90, 120])
        elif 'Bootcamp' in title or 'Hackathon' in title or 'Tournament' in title:
            duration = random.choice([120, 180, 240])
        else:
            duration = random.choice([90, 120, 150])

        # Calculate end_time from event_datetime + duration
        end_time = event_datetime + timedelta(minutes=duration)

        # Skip events that would cross midnight after Istanbul timezone conversion
        # (Schedule TIME field can't handle next-day times)
        ISTANBUL_OFFSET = timedelta(hours=3)
        event_time_istanbul = event_datetime + ISTANBUL_OFFSET
        end_time_istanbul = end_time + ISTANBUL_OFFSET

        if end_time_istanbul.date() > event_time_istanbul.date():
            # Skip this event - would cross midnight in Istanbul time
            continue

        event_dict = {
            "title": title,
            "description": description,
            "event_datetime": event_datetime,
            "duration": duration,
            "end_time": end_time,
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

    # Create RoomSchedule entries for approved/completed events
    # Note: Events that would cross midnight are already filtered out above
    schedule_count = 0
    ISTANBUL_OFFSET = timedelta(hours=3)  # UTC+3
    for event in events:
        if event.status in [EventStatus.APPROVED, EventStatus.COMPLETED] and event.room_id:
            # Convert UTC to Istanbul time for schedule display (time only)
            event_time_istanbul = event.event_datetime + ISTANBUL_OFFSET
            end_time_istanbul = event.end_time + ISTANBUL_OFFSET

            schedule = RoomSchedule(
                room_id=event.room_id,
                title=event.title,
                description=event.description,
                block_type=BlockType.EVENT,
                start_time=event_time_istanbul.time(),
                end_time=end_time_istanbul.time(),
                is_recurring=False,
                specific_date=event.event_datetime.date(),  # Keep UTC date for matching
                event_id=event.id,
                created_by=event.approved_by_id
            )
            db.add(schedule)
            schedule_count += 1

    db.commit()

    print(f"   ✅ Created {len(events)} events")
    print(f"   📅 Created {schedule_count} event schedule blocks for weekly view")
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


def create_weekly_schedules(db, rooms, users_by_role):
    """Create realistic weekly class schedules for all rooms"""
    print("📅 Creating weekly class schedules...")

    admin = users_by_role['admin'][0]
    schedules_created = 0

    # Define class schedule templates (realistic university schedule)
    # Format: (room_name, day_of_week, start_time, end_time, class_name)
    # day_of_week: 0=Monday, 1=Tuesday, 2=Wednesday, 3=Thursday, 4=Friday, 5=Saturday, 6=Sunday

    schedules_data = [
        # D101 - Small Classroom (20 capacity) - Heavy schedule
        ("D101 - Small Classroom", 0, time(9, 0), time(11, 0), "Calculus I", BlockType.CLASS),
        ("D101 - Small Classroom", 0, time(14, 0), time(16, 0), "Linear Algebra", BlockType.CLASS),
        ("D101 - Small Classroom", 1, time(10, 0), time(12, 0), "Physics I", BlockType.CLASS),
        ("D101 - Small Classroom", 1, time(14, 0), time(17, 0), "Engineering Mathematics", BlockType.CLASS),
        ("D101 - Small Classroom", 2, time(9, 0), time(11, 0), "Calculus I", BlockType.CLASS),
        ("D101 - Small Classroom", 3, time(13, 0), time(15, 0), "Statistics", BlockType.CLASS),
        ("D101 - Small Classroom", 4, time(9, 0), time(12, 0), "Differential Equations", BlockType.CLASS),

        # D102 - Study Room (15 capacity) - Light schedule, some empty slots
        ("D102 - Study Room", 0, time(13, 0), time(15, 0), "French Literature", BlockType.CLASS),
        ("D102 - Study Room", 2, time(10, 0), time(12, 0), "Advanced French", BlockType.CLASS),
        ("D102 - Study Room", 3, time(14, 0), time(16, 0), "Business French", BlockType.CLASS),
        ("D102 - Study Room", 4, time(18, 0), time(20, 0), "Graduate Seminar - Linguistics", BlockType.CLASS),

        # D103 - Meeting Room (10 capacity) - Very light, mostly empty
        ("D103 - Meeting Room", 1, time(16, 0), time(18, 0), "Tutorial Session", BlockType.CLASS),
        ("D103 - Meeting Room", 3, time(9, 0), time(11, 0), "Office Hours - Prof. Smith", BlockType.RESERVED),

        # D201 - Medium Classroom (50 capacity) - Moderate schedule
        ("D201 - Medium Classroom", 0, time(9, 0), time(11, 0), "Introduction to Programming", BlockType.CLASS),
        ("D201 - Medium Classroom", 0, time(14, 0), time(16, 0), "Data Structures", BlockType.CLASS),
        ("D201 - Medium Classroom", 1, time(10, 0), time(12, 0), "Algorithms", BlockType.CLASS),
        ("D201 - Medium Classroom", 2, time(9, 0), time(11, 0), "Introduction to Programming", BlockType.CLASS),
        ("D201 - Medium Classroom", 2, time(14, 0), time(17, 0), "Software Engineering", BlockType.CLASS),
        ("D201 - Medium Classroom", 3, time(10, 0), time(12, 0), "Database Systems", BlockType.CLASS),
        ("D201 - Medium Classroom", 4, time(9, 0), time(11, 0), "Operating Systems", BlockType.CLASS),
        ("D201 - Medium Classroom", 4, time(18, 0), time(20, 0), "Graduate - Machine Learning", BlockType.CLASS),

        # D202 - Computer Lab (40 capacity)
        ("D202 - Computer Lab", 0, time(10, 0), time(13, 0), "Programming Lab", BlockType.CLASS),
        ("D202 - Computer Lab", 1, time(9, 0), time(12, 0), "Web Development Lab", BlockType.CLASS),
        ("D202 - Computer Lab", 2, time(13, 0), time(16, 0), "Database Lab", BlockType.CLASS),
        ("D202 - Computer Lab", 3, time(10, 0), time(13, 0), "Mobile App Development", BlockType.CLASS),
        ("D202 - Computer Lab", 4, time(14, 0), time(17, 0), "Network Security Lab", BlockType.CLASS),

        # D203 - Workshop Room (35 capacity)
        ("D203 - Workshop Room", 0, time(14, 0), time(17, 0), "Electronics Workshop", BlockType.CLASS),
        ("D203 - Workshop Room", 1, time(13, 0), time(16, 0), "Circuit Design", BlockType.CLASS),
        ("D203 - Workshop Room", 2, time(9, 0), time(12, 0), "Robotics Lab", BlockType.CLASS),
        ("D203 - Workshop Room", 4, time(10, 0), time(13, 0), "Embedded Systems", BlockType.CLASS),

        # Main Hall (250 capacity) - Large lectures, some empty slots
        ("Main Hall", 0, time(10, 0), time(12, 0), "Introduction to Business", BlockType.CLASS),
        ("Main Hall", 1, time(9, 0), time(11, 0), "Economics 101", BlockType.CLASS),
        ("Main Hall", 2, time(14, 0), time(16, 0), "Psychology 101", BlockType.CLASS),
        ("Main Hall", 3, time(10, 0), time(12, 0), "Sociology Fundamentals", BlockType.CLASS),

        # Conference Hall (150 capacity) - Moderate schedule
        ("Conference Hall", 0, time(13, 0), time(15, 0), "Law and Ethics", BlockType.CLASS),
        ("Conference Hall", 1, time(14, 0), time(16, 0), "International Relations", BlockType.CLASS),
        ("Conference Hall", 2, time(10, 0), time(12, 0), "Political Science", BlockType.CLASS),
        ("Conference Hall", 3, time(13, 0), time(15, 0), "Public Policy", BlockType.CLASS),
        ("Conference Hall", 3, time(18, 0), time(20, 0), "Graduate - Policy Analysis", BlockType.CLASS),
        ("Conference Hall", 4, time(9, 0), time(11, 0), "Constitutional Law", BlockType.CLASS),

        # Auditorium A (300 capacity) - Very light, special lectures
        ("Auditorium A", 0, time(16, 0), time(18, 0), "Guest Lecture Series", BlockType.CLASS),
        ("Auditorium A", 2, time(18, 0), time(20, 0), "Graduate - Research Methods", BlockType.CLASS),

        # Sports Hall (500 capacity) - Mostly empty, PE classes
        ("Sports Hall", 1, time(10, 0), time(12, 0), "Physical Education", BlockType.CLASS),
        ("Sports Hall", 3, time(14, 0), time(16, 0), "Sports Activities", BlockType.CLASS),
        ("Sports Hall", 4, time(10, 0), time(12, 0), "Physical Education", BlockType.CLASS),
    ]

    for room_name, day_of_week, start_time, end_time, title, block_type in schedules_data:
        # Find room by name
        room = rooms.get(room_name)
        if not room:
            print(f"   ⚠️  Warning: Room '{room_name}' not found, skipping...")
            continue

        # Create schedule block
        schedule = RoomSchedule(
            room_id=room.id,
            title=title,
            description=f"Regular class - {title}",
            block_type=block_type,
            start_time=start_time,
            end_time=end_time,
            is_recurring=True,
            day_of_week=day_of_week,
            created_by=admin.id
        )
        db.add(schedule)
        schedules_created += 1

    db.commit()

    print(f"   ✅ Created {schedules_created} recurring class schedules")
    print(f"      📊 Coverage:")
    print(f"         - Small rooms (D101-D103): Heavy to light schedules")
    print(f"         - Medium rooms (D201-D203): Moderate schedules with labs")
    print(f"         - Large halls: Light schedules, special lectures")
    print(f"         - Sports Hall: PE classes only")
    print(f"      ⏰ Time slots: 09:00-20:00 (including graduate classes 18:00-20:00)")
    print(f"      🗓️  Days: Monday-Friday (weekends free for events)")

    return schedules_created


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

            # Link event for event-related notifications
            event_id = None
            if notif_type in [NotificationType.EVENT_REMINDER, NotificationType.EVENT_CANCELLED, NotificationType.EVENT_UPDATED, NotificationType.EVENT_CREATED]:
                approved_events = [e for e in events if e.status == EventStatus.APPROVED]
                if approved_events:
                    event = random.choice(approved_events)
                    event_id = event.id
                    # Make message more specific
                    if "an event" in message:
                        message = message.replace("an event", f"'{event.title}'")

            notifications.append(Notification(
                user_id=student.id,
                event_id=event_id,
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

            # Link event for event-related notifications (especially approval/rejection)
            event_id = None
            if notif_type in [NotificationType.EVENT_APPROVED, NotificationType.EVENT_REJECTED]:
                # Find events created by this manager's club
                manager_events = [e for e in events if e.club.manager_id == manager.id]
                if manager_events:
                    event = random.choice(manager_events)
                    event_id = event.id
                    # Make message specific to the event
                    message = message.replace("Your event", f"Your event '{event.title}'")

            notifications.append(Notification(
                user_id=manager.id,
                event_id=event_id,
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
| Sponsor | sponsor1@techcorp.com | Sponsor123! |

---

## All Test Users

### Admins (2)

"""

    # Group by role
    admins = [u for u in users_original if u['role'] == UserRole.ADMIN]
    advisors = [u for u in users_original if u['role'] == UserRole.ADVISOR]
    managers = [u for u in users_original if u['role'] == UserRole.CLUB_MANAGER]
    students = [u for u in users_original if u['role'] == UserRole.STUDENT]
    sponsors = [u for u in users_original if u['role'] == UserRole.SPONSOR]

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

    content += f"\n### Sponsors ({len(sponsors)}) - Review6: AI-Powered Sponsor Matching\n\n"
    for i, user in enumerate(sponsors, 1):
        content += f"{i}. **{user['full_name']}** - `{user['email']}` / `{user['password']}`\n"

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


def create_sponsorships(db, clubs_list, users_by_role):
    """Create sponsorship requests and AI matches (Review6: AI-powered sponsor matching)"""
    print("🤝 Creating sponsorship applications and matches...")

    sponsors = users_by_role.get('sponsor', [])
    if not sponsors or len(sponsors) < 2:
        print("   ⚠️  No sponsor users found, skipping sponsorship creation")
        return []

    # Sponsorship Request 1: APPROVED with AI matches
    approved_sponsorship = SponsorshipRequest(
        sponsor_id=sponsors[0].id,
        company_name="Tech Corp Inc.",
        contact_info="contact@techcorp.com | +90 212 555 0001 | www.techcorp.com",
        vision="Empowering the next generation of tech innovators through education and hands-on experience.",
        sponsorship_goals="We want to sponsor hackathons, coding workshops, AI/ML projects, and robotics competitions. Interested in supporting tech-focused student clubs.",
        sponsorship_type=SponsorshipType.CORPORATE,
        budget_range="25,000 - 40,000 TL",
        status=SponsorshipStatus.APPROVED,
        approved_at=datetime.now(timezone.utc)
    )
    db.add(approved_sponsorship)
    db.flush()  # Get ID for matches

    # Create AI matches for approved sponsorship (simulate AI matching)
    # Top 3 matches based on TWO-WAY MATCHING algorithm
    matches_data = [
        {
            "club_name": "Robotics Club",
            "rank": 1,
            "reasoning": "🥇 **Perfect Match (95% compatibility)**\n\n**Topic Alignment (40%):** Excellent - Sponsor focuses on tech innovation, robotics is core tech. Keywords match: 'robotics competitions', 'hands-on experience'.\n\n**Budget Compatibility (50%):** Perfect - Sponsor budget 25-40K TL perfectly covers club's 25-40K TL needs. No mismatch.\n\n**Activity Level (10%):** High - Club actively participates in competitions, high member engagement."
        },
        {
            "club_name": "AI & Machine Learning Club",
            "rank": 2,
            "reasoning": "🥈 **Excellent Match (92% compatibility)**\n\n**Topic Alignment (40%):** Excellent - Direct match with sponsor's AI/ML project interests. Perfect keyword alignment.\n\n**Budget Compatibility (50%):** Good - Club needs 30-50K TL, sponsor offers 25-40K TL. Slight stretch but viable with negotiation.\n\n**Activity Level (10%):** High - Active in workshops and projects."
        },
        {
            "club_name": "Computer Science Club",
            "rank": 3,
            "reasoning": "🥉 **Strong Match (88% compatibility)**\n\n**Topic Alignment (40%):** Strong - Hackathons and coding workshops align with sponsor goals. Tech-focused club.\n\n**Budget Compatibility (50%):** Excellent - Club needs 20-35K TL, sponsor offers 25-40K TL. Perfect overlap.\n\n**Activity Level (10%):** High - Regular hackathons and workshops."
        }
    ]

    for match_data in matches_data:
        # Find club by name
        club = next((c for c in clubs_list if c.name == match_data["club_name"]), None)
        if club:
            match = SponsorshipMatch(
                sponsorship_request_id=approved_sponsorship.id,
                club_id=club.id,
                match_rank=match_data["rank"],
                ai_reasoning=match_data["reasoning"]
            )
            db.add(match)

    # Sponsorship Request 2: PENDING (awaiting admin approval)
    pending_sponsorship = SponsorshipRequest(
        sponsor_id=sponsors[1].id,
        company_name="Innovate Solutions Ltd.",
        contact_info="info@innovate.com | +90 212 555 0002 | www.innovate.com",
        vision="Fostering creativity and innovation in arts and sports through strategic partnerships.",
        sponsorship_goals="Looking to sponsor music concerts, theater performances, photography exhibitions, and sports tournaments. Focus on creative and athletic clubs.",
        sponsorship_type=SponsorshipType.CORPORATE,
        budget_range="15,000 - 25,000 TL",
        status=SponsorshipStatus.PENDING
    )
    db.add(pending_sponsorship)

    # Sponsorship Request 3: REJECTED (example of rejection)
    rejected_sponsorship = SponsorshipRequest(
        sponsor_id=sponsors[0].id,
        company_name="Small Startup Co.",
        contact_info="contact@smallstartup.com | +90 212 555 0003",
        vision="Supporting student initiatives with minimal budget.",
        sponsorship_goals="General support for any club activities.",
        sponsorship_type=SponsorshipType.INDIVIDUAL,
        budget_range="1,000 - 3,000 TL",
        status=SponsorshipStatus.REJECTED,
        rejection_reason="Budget too small to meet any club's needs. Minimum club budget expectations start at 5,000 TL. Please consider reapplying with increased budget allocation.",
        approved_at=datetime.now(timezone.utc) - timedelta(days=2)
    )
    db.add(rejected_sponsorship)

    db.commit()

    total_matches = len(matches_data)
    print(f"   ✅ Created 3 sponsorship requests (1 approved with {total_matches} AI matches, 1 pending, 1 rejected)")

    return [approved_sponsorship, pending_sponsorship, rejected_sponsorship]


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
        db.query(SponsorshipMatch).delete()  # Review6: Clean sponsorship matches before requests (FK dependency)
        db.query(SponsorshipRequest).delete()  # Review6: Clean sponsorship requests before clubs (FK dependency)
        db.query(RoomSchedule).delete()  # Clean schedules before events (FK dependency)
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
        update_clubs_with_sponsorship_needs(db, clubs_list)  # Review6: Add sponsorship needs
        create_club_memberships(db, clubs_list, users_by_role)
        create_follows(db, clubs_list, users_by_role)
        create_weekly_schedules(db, rooms, users_by_role)  # Create weekly class schedules BEFORE events
        events = create_events(db, clubs_list, rooms, users_by_role)
        create_registrations(db, events, users_by_role)
        create_notifications(db, users_by_role, events)
        sponsorships = create_sponsorships(db, clubs_list, users_by_role)  # Review6: Create sponsorships

        # 3. Create credentials file
        create_credentials_file(users_original, clubs_list)

        # 4. Summary
        print("\n✨ Database seeding completed successfully!\n")
        print("📊 Summary:")
        print(f"  - Users: {len(users)} (2 admins, 5 advisors, 15 managers, 38 students, 2 sponsors)")
        print(f"  - Rooms: {len(rooms)}")
        print(f"  - Clubs: {len(clubs_list)}")
        print(f"  - Events: {len(events)}")
        print(f"  - Club Join Requests: {db.query(ClubJoinRequest).count()}")
        print(f"  - Event Registrations: {db.query(EventRegistration).count()}")
        print(f"  - Follow Relationships: {db.execute(text('SELECT COUNT(*) FROM user_club_association')).scalar()}")
        print(f"  - Notifications: {db.query(Notification).count()}")
        print(f"  - Sponsorship Requests: {db.query(SponsorshipRequest).count()} (1 approved, 1 pending, 1 rejected)")
        print(f"  - AI Sponsorship Matches: {db.query(SponsorshipMatch).count()} matches for approved sponsorship")
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
