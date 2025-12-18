# Terminal 1 - Backend
cd backend && source venv/bin/activate && pip install -r requirements.txt && uvicorn app.main:app --reload

# Terminal 2 - Worker  
cd backend && source venv/bin/activate && python -m app.worker

# Terminal 3 (Windows CMD) - Frontend
cd D:\Six_Seven\frontend && npm run dev

# Separate terminal - Docker
docker-compose up -d

# Separate terminal - Seed DB
cd backend && source venv/bin/activate && python seed_test_users.py
