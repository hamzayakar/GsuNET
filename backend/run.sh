#!/bin/bash
# Script to run the FastAPI backend server

# Activate virtual environment
source venv/bin/activate

# Install requirements if needed
pip install -r requirements.txt

# Run uvicorn server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
