#!/bin/bash

source "./.venv/bin/activate"
redis-server &
echo "Starting server."
python3 app.py

echo "Server started successfully."