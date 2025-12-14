# Test User Credentials

**Generated automatically by seed_test_users.py**

All passwords meet the security requirements:
- ✅ At least 8 characters
- ✅ 1 uppercase letter
- ✅ 1 lowercase letter
- ✅ 1 digit
- ✅ 1 special character (!@#$%^&*(),.?":{}|<>)

---

## Test Users

### 1. Admin
- **Role**: admin
- **Email**: `admin@gsu.edu.tr`
- **Password**: `Admin123!`
- **Full Name**: Admin User
- **Student Number**: ADM001
- **Department**: Administration

### 2. Advisor
- **Role**: advisor
- **Email**: `advisor@gsu.edu.tr`
- **Password**: `Advisor123!`
- **Full Name**: Dr. Ayşe Yılmaz
- **Student Number**: ADV001
- **Department**: Computer Engineering

### 3. Club Manager
- **Role**: club_manager
- **Email**: `club.manager@gsu.edu.tr`
- **Password**: `Manager123!`
- **Full Name**: Mehmet Demir
- **Student Number**: 2021001
- **Department**: Computer Engineering

### 4. Student
- **Role**: student
- **Email**: `student@gsu.edu.tr`
- **Password**: `Student123!`
- **Full Name**: Zeynep Kaya
- **Student Number**: 2022001
- **Department**: Electrical Engineering

### 5. Club Manager
- **Role**: club_manager
- **Email**: `manager2@gsu.edu.tr`
- **Password**: `Manager456!`
- **Full Name**: Elif Şahin
- **Student Number**: 2021002
- **Department**: Industrial Engineering

---

## Test Clubs

### 1. Computer Science Club
- **Description**: A club for computer science enthusiasts to learn, share, and collaborate on projects.
- **Contact Email**: csclub@gsu.edu.tr
- **Manager**: Mehmet Demir
- **Advisor**: Dr. Ayşe Yılmaz

### 2. Robotics Club
- **Description**: Building and programming robots, participating in competitions.
- **Contact Email**: robotics@gsu.edu.tr
- **Manager**: Elif Şahin
- **Advisor**: Dr. Ayşe Yılmaz

### 3. AI & Machine Learning Club
- **Description**: Exploring artificial intelligence and machine learning technologies.
- **Contact Email**: aiclub@gsu.edu.tr
- **Manager**: Mehmet Demir
- **Advisor**: Dr. Ayşe Yılmaz

---

## Quick Reference Table

| Role | Email | Password | Name |
|------|-------|----------|------|
| admin | admin@gsu.edu.tr | Admin123! | Admin User |
| advisor | advisor@gsu.edu.tr | Advisor123! | Dr. Ayşe Yılmaz |
| club_manager | club.manager@gsu.edu.tr | Manager123! | Mehmet Demir |
| student | student@gsu.edu.tr | Student123! | Zeynep Kaya |
| club_manager | manager2@gsu.edu.tr | Manager456! | Elif Şahin |

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
