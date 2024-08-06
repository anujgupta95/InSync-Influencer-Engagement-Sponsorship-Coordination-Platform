#!/bin/bash

# Check if the virtual environment directory exists
if [ ! -d "./.venv" ]; then
    echo "Virtual environment not found. Creating one..."
    python3 -m venv .venv
    source "./.venv/bin/activate"
    echo "Installing dependencies..."
    pip install -r requirements.txt
else
    echo "Virtual environment found. Activating..."
    source "./.venv/bin/activate"
fi

mkdir -p ./downloads
redis-server &
celery -A app:celery_app worker -l INFO &
celery -A app:celery_app beat -l INFO &
sleep 5
echo "Starting server."
python3 app.py

echo "Server started successfully."