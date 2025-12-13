"""
Seed script to populate database with test users for each role

Run this script with: python seed_test_users.py

IMPORTANT: All passwords meet the security requirements:
- At least 8 characters
- 1 uppercase letter
- 1 lowercase letter
- 1 digit
- 1 special character
"""
import sys
import os

# Add the parent directory to the path to import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, Base, engine
from app.models.user import User, UserRole
from app.models.club import Club
from passlib.context import CryptContext

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)


def create_credentials_file(users_data, clubs_data):
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
    for i, user_data in enumerate(users_data, 1):
        role_names = {
            'admin': 'Admin',
            'advisor': 'Advisor',
            'club_manager': 'Club Manager',
            'student': 'Student'
        }

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
    for i, club_data in enumerate(clubs_data, 1):
        content += f"""### {i}. {club_data['name']}
- **Description**: {club_data['description']}
- **Contact Email**: {club_data['contact_email']}
- **Manager**: {club_data.get('manager_name', 'Not assigned')}
- **Advisor**: {club_data.get('advisor_name', 'Not assigned')}

"""

    content += """---

## Quick Reference Table

| Role | Email | Password | Name |
|------|-------|----------|------|
"""

    for user_data in users_data:
        content += f"| {user_data['role'].value} | {user_data['email']} | {user_data['password']} | {user_data['full_name']} |\n"

    content += """
---

## How to Use

1. **Start the backend**:
   ```bash
   cd backend
   docker-compose up -d
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
**Database Schema Version**: v2.0 (with event registration and password validation)
"""

    with open(credentials_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"\n📄 Created {credentials_path}")
    return credentials_path


def create_test_users():
    """Create test users for each role"""
    # Create all tables if they don't exist
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully\n")

    db = SessionLocal()

    try:
        # Delete clubs first to avoid foreign key constraints
        existing_clubs = db.query(Club).all()
        if existing_clubs:
            print(f"Found {len(existing_clubs)} existing clubs. Deleting them first...")
            for club in existing_clubs:
                db.delete(club)
            db.commit()

        # Now check if users already exist
        existing_users = db.query(User).filter(
            User.email.in_([
                'admin@gsu.edu.tr',
                'advisor@gsu.edu.tr',
                'club.manager@gsu.edu.tr',
                'student@gsu.edu.tr',
                'manager2@gsu.edu.tr'
            ])
        ).all()

        if existing_users:
            print(f"Found {len(existing_users)} existing test users. Deleting them now...")
            for user in existing_users:
                db.delete(user)
            db.commit()

        # Test users with strong passwords
        test_users = [
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
            }
        ]

        created_users = []
        for user_data in test_users:
            # Hash the password
            password = user_data.pop("password")
            password_hash = hash_password(password)

            # Create user
            user = User(
                **user_data,
                password_hash=password_hash
            )
            db.add(user)
            created_users.append(user)

        db.commit()

        print("\n✅ Successfully created test users:")
        print("-" * 60)
        for i, user in enumerate(created_users):
            print(f"{i+1}. {user.full_name} ({user.role.value})")
            print(f"   Email: {user.email}")
            print(f"   Department: {user.department}")
        print("-" * 60)

        # Create test clubs
        print("\n📋 Creating test clubs...")

        # Get club managers
        manager1 = db.query(User).filter(User.email == "club.manager@gsu.edu.tr").first()
        manager2 = db.query(User).filter(User.email == "manager2@gsu.edu.tr").first()
        advisor = db.query(User).filter(User.email == "advisor@gsu.edu.tr").first()

        test_clubs = [
            {
                "name": "Computer Science Club",
                "description": "A club for computer science enthusiasts to learn, share, and collaborate on projects.",
                "contact_email": "csclub@gsu.edu.tr",
                "manager_id": manager1.id if manager1 else None,
                "advisor_id": advisor.id if advisor else None
            },
            {
                "name": "Robotics Club",
                "description": "Building and programming robots, participating in competitions.",
                "contact_email": "robotics@gsu.edu.tr",
                "manager_id": manager2.id if manager2 else None,
                "advisor_id": advisor.id if advisor else None
            },
            {
                "name": "AI & Machine Learning Club",
                "description": "Exploring artificial intelligence and machine learning technologies.",
                "contact_email": "aiclub@gsu.edu.tr",
                "manager_id": manager1.id if manager1 else None,
                "advisor_id": advisor.id if advisor else None
            }
        ]

        for club_data in test_clubs:
            club = Club(**club_data)
            db.add(club)

        db.commit()

        print("✅ Successfully created test clubs:")
        print("-" * 60)
        clubs = db.query(Club).all()
        for i, club in enumerate(clubs):
            print(f"{i+1}. {club.name}")
            if club.manager:
                print(f"   Manager: {club.manager.full_name}")
            if club.advisor:
                print(f"   Advisor: {club.advisor.full_name}")
        print("-" * 60)

        # Prepare club data for credentials file
        clubs_data = []
        for club in clubs:
            clubs_data.append({
                'name': club.name,
                'description': club.description,
                'contact_email': club.contact_email,
                'manager_name': club.manager.full_name if club.manager else 'Not assigned',
                'advisor_name': club.advisor.full_name if club.advisor else 'Not assigned'
            })

        # Create TEST_CREDENTIALS.md file
        create_credentials_file(test_users, clubs_data)

        print("\n✨ Database seeding completed successfully!")
        print("\n📝 Check TEST_CREDENTIALS.md for login details")

    except Exception as e:
        print(f"\n❌ Error creating test users: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("🌱 Seeding database with test users and clubs...")
    create_test_users()
