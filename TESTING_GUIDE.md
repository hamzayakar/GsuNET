# GSUNET Testing Guide

## ✅ All 4 Tasks Completed + White Page Errors Fixed

This guide covers testing for all implemented features:

1. **Event Creation Form** (Enhanced with 24-hour rule and conflict detection) ✅
2. **Admin Sponsorship Tracking** (Comprehensive tracking page) ✅ **FIXED**
3. **Sponsor Application Details** (Detail modal for sponsors) ✅ **FIXED**
4. **ChatGPT API Integration** (AI-powered sponsor matching) ✅

### 🔧 Recent Fixes (Latest Commit)
**Fixed white page errors** that were preventing:
- Admin sponsorship tracking page from loading
- Sponsor application creation from saving

**Root cause:** API response handling inconsistency + missing backend endpoints
**Solution:**
- Fixed all sponsorshipsAPI methods to return `response.data` consistently
- Added `/api/v1/sponsorships/all` endpoint for admin to view all applications
- Added `/api/v1/sponsorships/{id}/matches` endpoint to fetch AI matching results

---

## 🚀 Quick Start - Running the Application

### Backend
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm run dev
```

The app will be available at `http://localhost:5173` (frontend) and `http://localhost:8000` (backend API).

---

## 📋 Task 1: Event Creation Form Testing

### What Was Implemented:
1. **Date-gated capacity fields** - Capacity inputs disabled until event date/time is selected
2. **24-hour rule** - Rooms with capacity < 25% of max_capacity are disabled for events <24 hours away
3. **Conflict detection** - Visual display of scheduling conflicts
4. **Admin override** - Conflicted rooms can still be selected (admin/advisor decision)

### How to Test:

#### Step 1: Login as Club Manager
```
Email: ahmet.kaya@gsu.edu.tr
Password: Manager123!
```

#### Step 2: Navigate to Club Management
- Click on your profile dropdown
- Select "Club Management"
- Click on the "Create Event" tab

#### Step 3: Test Date-Gated Capacities
1. Try to enter capacity values → Should be **DISABLED**
2. Fill in "Event Title" and "Description"
3. Select "Date & Time" → Capacity fields should now be **ENABLED**
4. Enter expected/max capacity values

#### Step 4: Test 24-Hour Rule
**Case A: Event more than 24 hours away**
1. Select a date 2+ days in the future
2. Enter max capacity: 100
3. Select duration: 2 hours
4. Observe rooms → Should show all rooms with capacity ≥ 100

**Case B: Event less than 24 hours away**
1. Select tomorrow's date at the current time
2. Enter max capacity: 100
3. Observe rooms → Should show:
   - ✅ **Available Rooms** (capacity ≥ 100)
   - 🚫 **Disabled Rooms** (capacity < 25, with reason: "Not recommended for last-minute events")

#### Step 5: Test Conflict Detection
1. Select a weekday during class hours (e.g., Monday 14:00)
2. Duration: 2 hours
3. Max capacity: 50
4. Observe three sections:
   - ✅ **Available Rooms** - No conflicts, select from dropdown
   - ⚠️ **Rooms with Conflicts** - Shows conflict details (CLASS/EVENT with time range)
   - 🚫 **Disabled Rooms** - 24-hour rule violations

#### Step 6: Test Conflict Override
1. Click "Override" button on a conflicted room
2. Room should be selected (highlighted in yellow)
3. You can still submit the event (admin can approve knowing there's a conflict)

### Expected Behavior:
- ✅ Capacity fields disabled until date selected
- ✅ Visual warning when event is <24 hours away
- ✅ Disabled rooms shown with clear explanation
- ✅ Conflicts displayed with type, title, and time range
- ✅ Can override conflicts (special cases)
- ✅ Submit button works even with conflicts

---

## 📋 Task 2: Admin Sponsorship Tracking

### What Was Implemented:
- Comprehensive admin page to view all sponsorship applications
- Filter by status (All / Pending / Approved / Rejected)
- View detailed application information
- **See AI matching results with ChatGPT reasoning** (for approved applications)
- View sponsor details

### How to Test:

#### Step 1: Login as Admin
```
Email: zeynep.yilmaz@gsu.edu.tr
Password: Admin123!
```

#### Step 2: Navigate to Sponsorship Tracking
- Click "Admin Panel ▾" in navbar
- Select "Sponsorship Tracking"

#### Step 3: View Applications List
You should see a table with columns:
- ID
- Company Name
- Sponsor (Name + Email)
- Type (individual/corporate)
- Budget
- Status
- Submitted Date
- Actions

#### Step 4: Filter Applications
- Click tabs: **All**, **Pending**, **Approved**, **Rejected**
- Count updates dynamically

#### Step 5: View Application Details
1. Click "View Details" on any application
2. Modal opens with:
   - Status badge
   - Company information
   - Sponsor information
   - Vision/Mission
   - Sponsorship Goals
   - Budget range
   - Rejection reason (if rejected)

#### Step 6: View AI Matching Results (Approved Applications Only)
1. Click "View Details" on an **APPROVED** application
2. Scroll down to "🤖 AI Matching Results" section
3. You should see:
   - Ranked matches (e.g., Rank #1, #2, #3)
   - Club name and ID
   - **🧠 ChatGPT Reasoning** - AI explanation for the match
   - Club description and manager info

### Expected Behavior:
- ✅ Table shows all applications
- ✅ Filters work correctly
- ✅ Detail modal shows complete information
- ✅ AI matching results visible for approved applications
- ✅ ChatGPT reasoning displayed clearly

---

## 📋 Task 3: Sponsor Application Detail View

### What Was Implemented:
- "View Details" button in sponsor's application list
- Modal showing full application details
- All fields visible (company, contact, vision, goals, type, budget)
- Rejection reason shown if rejected

### How to Test:

#### Step 1: Create Sponsor User (if not exists)
Run in backend directory:
```bash
python seed_test_users.py
```

Or create manually in admin panel with role "sponsor".

#### Step 2: Login as Sponsor
```
Email: sponsor@example.com
Password: Sponsor123!
```

#### Step 3: Create Sponsorship Application
1. Navigate to "Sponsorship Management"
2. Fill out the application form:
   - Company Name: "Tech Corp"
   - Contact Info: "contact@techcorp.com, +90 123 456 7890"
   - Vision: "We aim to support education and innovation..."
   - Sponsorship Goals: "We want to sponsor tech events, hackathons..."
   - Type: Corporate
   - Budget Range: "10,000 - 20,000 TL"
3. Submit

#### Step 4: View Your Applications
1. Switch to "My Applications" tab
2. You should see your application in the table

#### Step 5: Test Detail View
1. Click "View Details" button
2. Modal opens showing:
   - Status badge (Pending/Approved/Rejected)
   - All form fields you entered
   - Submission date
   - Rejection reason (if applicable)

### Expected Behavior:
- ✅ "View Details" button visible in applications table
- ✅ Modal opens on click
- ✅ All application data displayed
- ✅ Clean, readable formatting
- ✅ Close button works

---

## 📋 Task 4: ChatGPT API Integration Testing

### What the System Does:
When an admin **approves** a sponsorship request, the system:
1. Calls ChatGPT API with sponsor data + all club data
2. AI analyzes topic alignment, budget compatibility, and club activity
3. Returns top 3-5 club matches with reasoning
4. Stores matches in database
5. Club managers and sponsors can view matches

### Prerequisites:
**⚠️ IMPORTANT**: You need an OpenAI API key for this to work!

#### Step 1: Set Up OpenAI API Key
1. Get your API key from https://platform.openai.com/api-keys
2. Add to `backend/.env`:
```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
```
3. Restart the backend server

#### Step 2: Verify Backend Has the Key
```bash
cd backend
grep OPENAI_API_KEY .env
```

Should show your key (or check `.env.example` for format).

### Testing the ChatGPT Integration:

#### Test Method 1: Via Admin Approval

**Step 1: Create a Sponsor Application** (as sponsor user)
```
Email: sponsor@example.com
Password: Sponsor123!
```

1. Go to "Sponsorship Management"
2. Create application:
   - Company: "AI Innovations Ltd"
   - Vision: "We focus on artificial intelligence and machine learning research"
   - Goals: "We want to sponsor AI/ML workshops, hackathons, and tech talks"
   - Budget: "15,000 - 30,000 TL"

**Step 2: Approve as Admin**
```
Email: zeynep.yilmaz@gsu.edu.tr
Password: Admin123!
```

1. Go to "Admin Panel ▾" → "Approval Panel"
2. Switch to "Sponsorships" tab
3. Find the pending application
4. Click "Approve"

**What Happens:**
1. Backend receives approval
2. Calls OpenAI API: `POST https://api.openai.com/v1/chat/completions`
3. Sends prompt with sponsor data + all club data
4. ChatGPT analyzes and returns top matches
5. Matches saved to database
6. Response: "Application approved and matched with X clubs"

**Step 3: View AI Matching Results**
1. Stay logged in as admin
2. Go to "Sponsorship Tracking"
3. Filter by "Approved"
4. Click "View Details" on the approved application
5. Scroll to "🤖 AI Matching Results"
6. You should see:
   - Rank #1, #2, #3, etc.
   - Club names
   - **ChatGPT reasoning for each match**

#### Test Method 2: Check Backend Logs

**Step 1: Watch Backend Logs**
```bash
cd backend
uvicorn app.main:app --reload --log-level debug
```

**Step 2: Approve a Sponsorship**
(Follow steps from Method 1)

**Expected Log Output:**
```
INFO: Calling OpenAI API for sponsor matching...
DEBUG: Prompt sent to ChatGPT: ...
INFO: OpenAI API response received
DEBUG: Matched 3 clubs: [1, 5, 7]
INFO: Sponsorship matches created successfully
```

#### Test Method 3: API Testing (Manual)

**Using cURL:**
```bash
# 1. Login as admin to get token
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "zeynep.yilmaz@gsu.edu.tr", "password": "Admin123!"}'

# Copy the access_token from response

# 2. Approve sponsorship (replace {id} with actual ID)
curl -X POST http://localhost:8000/api/v1/sponsorships/{id}/approve \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"

# 3. View matches
curl -X GET http://localhost:8000/api/v1/sponsorships/{id}/matches \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### What ChatGPT Looks At:

**Sponsor Data:**
- Company name
- Vision/mission
- Sponsorship goals
- Budget range
- Type (individual/corporate)

**Club Data (for each club):**
- Name
- Description
- Event count (activity level)
- Member count
- Follower count
- **Sponsorship needs** (what club is looking for)
- **Budget expectation** (club's expected range)

### AI Scoring Criteria:
- **Budget Compatibility: 50%** (VETO power - if budgets don't align, no match)
- **Topic/Vision Alignment: 40%** (semantic similarity of goals)
- **Club Activity Level: 10%** (events, members, followers)

### Example ChatGPT Response:
```
Rank #1 - AI Club

Topic: ⭐⭐⭐⭐⭐ Perfect match - Both focus on AI/ML
Budget: ⭐⭐⭐⭐ Compatible! Sponsor offers 15-30K, club expects 15-30K
Activity: ⭐⭐⭐⭐ Very active (12 events, 45 members)

Reasoning: AI Innovations Ltd's focus on AI/ML research perfectly aligns
with AI Club's mission. Budget ranges are identical, showing serious
commitment from both sides. The club's high activity level (12 events)
demonstrates they can utilize the sponsorship effectively.
```

### Troubleshooting:

**❌ Error: "OPENAI_API_KEY not found"**
- Solution: Add key to `backend/.env`
- Restart backend server

**❌ Error: "OpenAI API request failed"**
- Check your API key is valid
- Check you have credits in your OpenAI account
- Check network connectivity

**❌ No matches returned**
- Check if clubs exist in database
- Run: `cd backend && python seed_test_users.py` to create clubs
- Check if clubs have `sponsorship_needs` and `sponsorship_budget_expectation` fields set

**❌ Error: "Rate limit exceeded"**
- OpenAI free tier has limits
- Wait a few minutes and try again
- Or upgrade your OpenAI plan

### Verifying It Works:

**✅ Success Indicators:**
1. No error messages on approval
2. "Matched with X clubs" success message
3. Matches visible in admin tracking page
4. ChatGPT reasoning text is present and makes sense
5. Rankings (1-5) are assigned correctly

**🔍 Check Database:**
```bash
# Connect to database
docker exec -it gsunet_db psql -U postgres -d gsunet

# Check matches
SELECT * FROM sponsorship_matches;

# Should show:
# - sponsorship_request_id
# - club_id
# - match_rank (1-5)
# - ai_reasoning (ChatGPT's explanation)
```

---

## 🎯 Summary of All Changes

### Backend Changes:
- ✅ `backend/app/routes/rooms.py`: Enhanced recommend endpoint with 24-hour rule
- ✅ `backend/app/schemas/room.py`: Added `DisabledRoom` schema
- ✅ `backend/app/schemas/__init__.py`: Exported new schema
- ✅ `backend/app/core/openai_service.py`: AI matching (already exists)
- ✅ `backend/app/routes/sponsorships.py`: Approval triggers AI matching (already exists)

### Frontend Changes:
- ✅ `frontend/src/services/api.js`: Updated `recommendEnhanced` with `maxCapacity` param
- ✅ `frontend/src/pages/ClubManagement.jsx`: Enhanced event form with all features
- ✅ `frontend/src/pages/SponsorshipManagement.jsx`: Added detail modal
- ✅ `frontend/src/pages/AdminSponsorshipTracking.jsx`: **NEW** - Comprehensive admin page
- ✅ `frontend/src/App.jsx`: Added route for admin tracking
- ✅ `frontend/src/components/Navbar.jsx`: Added link in admin menu

---

## 🚨 What to Reset / Restart

### After Code Changes:

**Backend:**
```bash
# Stop server (Ctrl+C if running)
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
# Stop dev server (Ctrl+C if running)
cd frontend
npm run dev
```

### Database Reset (if needed):
```bash
# Drop and recreate database
docker-compose down
docker-compose up -d db redis
cd backend
alembic upgrade head
python seed_test_users.py
```

### Clear Browser Cache:
- Hard refresh: `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
- Or open DevTools → Application → Clear storage

---

## ✅ Final Checklist

Before testing, ensure:
- [ ] Backend running on `http://localhost:8000`
- [ ] Frontend running on `http://localhost:5173`
- [ ] Database seeded with test users (`python seed_test_users.py`)
- [ ] OpenAI API key in `backend/.env` (for ChatGPT testing)
- [ ] At least 2-3 clubs exist in database
- [ ] Clubs have `sponsorship_needs` and `sponsorship_budget_expectation` fields

---

## 📞 Need Help?

If something doesn't work:
1. Check backend logs for errors
2. Check browser console (F12) for frontend errors
3. Verify database has data
4. Ensure all services are running
5. Try clearing cache and hard refresh

**Common Issues:**
- "Room recommendations not showing" → Make sure capacity is > 0
- "Can't see sponsorship tracking" → Log in as admin
- "ChatGPT not working" → Check API key in `.env`
- "No clubs in matching" → Run seed script to create clubs
