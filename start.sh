#!/bin/bash

# Check if the virtual environment directory exists
source "./.venv/bin/activate"
mkdir -p ./downloads
redis-server &
celery -A app:celery_app worker -l INFO &
celery -A app:celery_app beat -l INFO &
sleep 5
echo "Starting server."
python3 app.py &

echo "Server started successfully."