"""
Seed script to create test users for all 4 roles

Run this script to populate the database with test users:
    python seed_test_users.py

Make sure:
1. Docker containers are running (docker-compose up -d)
2. You're in the backend directory
3. Virtual environment is activated (if using venv)
"""

import sys
from pathlib import Path

# Add the app directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User, UserRole

# Test users data
TEST_USERS = [
    {
        "email": "ayse.yilmaz@gsu.edu.tr",
        "full_name": "Ayşe Yılmaz",
        "password": "student123",
        "student_number": "20210001",
        "department": "Bilgisayar Mühendisliği",
        "role": UserRole.STUDENT
    },
    {
        "email": "mehmet.kaya@gsu.edu.tr",
        "full_name": "Mehmet Kaya",
        "password": "manager123",
        "student_number": "20190045",
        "department": "Endüstri Mühendisliği",
        "role": UserRole.CLUB_MANAGER
    },
    {
        "email": "zeynep.demir@gsu.edu.tr",
        "full_name": "Dr. Zeynep Demir",
        "password": "advisor123",
        "student_number": None,
        "department": "Bilgisayar Mühendisliği",
        "role": UserRole.ADVISOR
    },
    {
        "email": "ali.yildiz@gsu.edu.tr",
        "full_name": "Ali Yıldız",
        "password": "admin123",
        "student_number": None,
        "department": "IT Department",
        "role": UserRole.ADMIN
    }
]


def create_test_users():
    """Create test users in the database"""

    print("🚀 Starting test user creation...")
    print(f"📊 Creating {len(TEST_USERS)} test users\n")

    # Create database tables if they don't exist
    Base.metadata.create_all(bind=engine)

    # Create database session
    db: Session = SessionLocal()

    try:
        created_count = 0
        skipped_count = 0

        for user_data in TEST_USERS:
            # Check if user already exists
            existing_user = db.query(User).filter(User.email == user_data["email"]).first()

            if existing_user:
                print(f"⏭️  Skipped: {user_data['full_name']} ({user_data['email']}) - Already exists")
                skipped_count += 1
                continue

            # Create new user
            password = user_data.pop("password")  # Remove password from dict
            hashed_password = get_password_hash(password)

            new_user = User(
                **user_data,
                password_hash=hashed_password
            )

            db.add(new_user)
            db.commit()
            db.refresh(new_user)

            print(f"✅ Created: {new_user.full_name} ({new_user.email}) - Role: {new_user.role.value}")
            created_count += 1

        print(f"\n{'='*60}")
        print(f"📈 Summary:")
        print(f"   ✅ Created: {created_count} users")
        print(f"   ⏭️  Skipped: {skipped_count} users (already exist)")
        print(f"{'='*60}\n")

        if created_count > 0:
            print("🎉 Test users created successfully!")
            print("📄 See TEST_USERS.md for credentials\n")
            print("🔑 Quick Reference:")
            print("   Student:      ayse.yilmaz@gsu.edu.tr    / student123")
            print("   Club Manager: mehmet.kaya@gsu.edu.tr    / manager123")
            print("   Advisor:      zeynep.demir@gsu.edu.tr   / advisor123")
            print("   Admin:        ali.yildiz@gsu.edu.tr     / admin123")
        else:
            print("ℹ️  All test users already exist in the database")

    except Exception as e:
        print(f"\n❌ Error creating test users: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    create_test_users()
