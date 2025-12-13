# Test User Credentials

**⚠️ WARNING**: This file contains sensitive test credentials. **DO NOT** commit this file to public repositories!

All passwords meet the security requirements:
- ✅ At least 8 characters
- ✅ 1 uppercase letter
- ✅ 1 lowercase letter
- ✅ 1 digit
- ✅ 1 special character (!@#$%^&*(),.?":{}|<>)

---

## Test Users

### 1. Admin User
- **Role**: Admin
- **Email**: `admin@gsu.edu.tr`
- **Password**: `Admin123!`
- **Full Name**: Admin User
- **Student Number**: ADM001
- **Department**: Administration
- **Permissions**: Full system access, can approve/reject events, manage all clubs

---

### 2. Advisor
- **Role**: Advisor
- **Email**: `advisor@gsu.edu.tr`
- **Password**: `Advisor123!`
- **Full Name**: Dr. Ayşe Yılmaz
- **Student Number**: ADV001
- **Department**: Computer Engineering
- **Permissions**: Can approve/reject events, view all clubs and events

---

### 3. Club Manager #1
- **Role**: Club Manager
- **Email**: `club.manager@gsu.edu.tr`
- **Password**: `Manager123!`
- **Full Name**: Mehmet Demir
- **Student Number**: 2021001
- **Department**: Computer Engineering
- **Manages**: Computer Science Club, AI & Machine Learning Club
- **Permissions**: Create events for managed clubs, view registrations

---

### 4. Club Manager #2
- **Role**: Club Manager
- **Email**: `manager2@gsu.edu.tr`
- **Password**: `Manager456!`
- **Full Name**: Elif Şahin
- **Student Number**: 2021002
- **Department**: Industrial Engineering
- **Manages**: Robotics Club
- **Permissions**: Create events for managed clubs, view registrations

---

### 5. Student
- **Role**: Student
- **Email**: `student@gsu.edu.tr`
- **Password**: `Student123!`
- **Full Name**: Zeynep Kaya
- **Student Number**: 2022001
- **Department**: Electrical Engineering
- **Permissions**: View events, register for events, view clubs

---

## Test Clubs

### 1. Computer Science Club
- **Manager**: Mehmet Demir (club.manager@gsu.edu.tr)
- **Advisor**: Dr. Ayşe Yılmaz (advisor@gsu.edu.tr)
- **Email**: csclub@gsu.edu.tr
- **Description**: A club for computer science enthusiasts to learn, share, and collaborate on projects.

### 2. Robotics Club
- **Manager**: Elif Şahin (manager2@gsu.edu.tr)
- **Advisor**: Dr. Ayşe Yılmaz (advisor@gsu.edu.tr)
- **Email**: robotics@gsu.edu.tr
- **Description**: Building and programming robots, participating in competitions.

### 3. AI & Machine Learning Club
- **Manager**: Mehmet Demir (club.manager@gsu.edu.tr)
- **Advisor**: Dr. Ayşe Yılmaz (advisor@gsu.edu.tr)
- **Email**: aiclub@gsu.edu.tr
- **Description**: Exploring artificial intelligence and machine learning technologies.

---

## How to Seed the Database

1. Make sure your backend is running and database is accessible:
   ```bash
   cd backend
   docker-compose up -d
   ```

2. Run the seed script:
   ```bash
   python seed_test_users.py
   ```

3. The script will:
   - Delete any existing test users (to avoid conflicts)
   - Create 5 test users with different roles
   - Create 3 test clubs
   - Assign managers and advisors to clubs

---

## Testing Workflow

### 1. Test Student Registration and Login
```bash
# Register a new student (must have strong password)
Full Name: Ali Veli
Email: ali.veli@gsu.edu.tr
Student Number: 2023001
Password: TestPass123!
Confirm Password: TestPass123!

# Or login with existing student
Email: student@gsu.edu.tr
Password: Student123!
```

### 2. Test Club Manager Creating Event
```bash
# Login as club manager
Email: club.manager@gsu.edu.tr
Password: Manager123!

# Create an event
Title: Workshop on React.js
Description: Learn React.js fundamentals
Date: [Future date]
Expected Capacity: 50
Max Capacity: 60
Club: Computer Science Club
# System will recommend rooms based on capacity!
```

### 3. Test Advisor Approval
```bash
# Login as advisor
Email: advisor@gsu.edu.tr
Password: Advisor123!

# Go to Approval Panel
# Approve or reject pending events
# If rejecting, provide a reason
```

### 4. Test Event Registration
```bash
# Login as any student
Email: student@gsu.edu.tr
Password: Student123!

# Browse approved events
# Click on event to see details
# Click "Register for Event" button
# Check "My Registrations" to see registered events
```

---

## API Testing with curl

### Register a new user:
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@gsu.edu.tr",
    "password": "TestPass123!",
    "full_name": "Test User",
    "student_number": "2023999",
    "department": "Computer Engineering",
    "role": "student"
  }'
```

### Login:
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=student@gsu.edu.tr&password=Student123!"
```

### Create an event (requires club manager token):
```bash
curl -X POST http://localhost:8000/api/v1/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Python Workshop",
    "description": "Learn Python basics",
    "event_datetime": "2024-12-20T14:00:00Z",
    "expected_capacity": 30,
    "max_capacity": 40,
    "club_id": 1,
    "location": "Main Hall"
  }'
```

---

## Security Notes

⚠️ **Important Security Reminders**:

1. **These are test credentials only** - Never use these in production
2. **Password validation is enforced** at both frontend and backend
3. **Input sanitization** blocks SQL injection and XSS attempts
4. **Authorization checks** ensure users can only modify their own content
5. **All passwords are hashed** using bcrypt before storage

### Password Requirements Enforced:
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one digit (0-9)
- At least one special character (!@#$%^&*(),.?":{}|<>)

### Blocked Input Patterns:
- SQL keywords: SELECT, INSERT, UPDATE, DELETE, DROP, etc.
- SQL comment patterns: --, ;, /*, */
- Script tags: &lt;script&gt;, javascript:, onerror=, onload=
- Other injection patterns

---

## Quick Reference Table

| Role | Email | Password | Use Case |
|------|-------|----------|----------|
| Admin | admin@gsu.edu.tr | Admin123! | Full system access |
| Advisor | advisor@gsu.edu.tr | Advisor123! | Approve/reject events |
| Club Manager | club.manager@gsu.edu.tr | Manager123! | Create events for CS Club |
| Club Manager | manager2@gsu.edu.tr | Manager456! | Create events for Robotics |
| Student | student@gsu.edu.tr | Student123! | Register for events |

---

## Troubleshooting

### "Password must contain..." error
Make sure your password has:
- ✅ At least 8 characters
- ✅ One uppercase letter
- ✅ One lowercase letter
- ✅ One number
- ✅ One special character

**Good examples**: `Admin123!`, `Password1!`, `MyPass@2024`
**Bad examples**: `password` (no uppercase, no number, no special), `Pass1` (too short), `PASSWORD123` (no special char)

### "Input contains invalid characters" error
You may have entered SQL keywords or script tags. Avoid using:
- SQL keywords like SELECT, DELETE, DROP
- Special sequences like --, /*, */
- HTML/JS tags like &lt;script&gt;

### "You don't have permission" error
Check that you're logged in with the correct role:
- Creating events: Club Manager or Admin
- Approving events: Advisor or Admin
- Deleting events: Club Manager (own clubs only) or Admin

---

**Last Updated**: 2025-12-13
**Database Schema Version**: v2.0 (with event registration and password validation)
