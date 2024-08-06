#!/bin/bash

# Function to kill process by name
kill_process() {
    pkill -f "$1" && echo "$1 process terminated." || echo "$1 process not found."
}

# Kill the Flask server
kill_process 'flask run'

# Kill Celery worker and beat processes
kill_process 'celery -A app:celery_app worker'
kill_process 'celery -A app:celery_app beat'
kill_process 'celery'

# Shut down Redis server
echo "Shutting down Redis server..."
redis-cli shutdown
echo "Both Flask and Redis servers have been shut down."

# Deactivate the virtual environment
echo "Deactivating the virtual environment..."
deactivate