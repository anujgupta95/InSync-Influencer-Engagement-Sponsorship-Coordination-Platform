#!/bin/bash

# Check if the virtual environment directory exists
sudo apt-get install -y redis-server
if [ ! -d "./.venv" ]; then
    echo "Virtual environment not found. Creating one..."
    python3 -m venv .venv
    source "./.venv/bin/activate"
    echo "Installing dependencies..."
    pip install -r requirements.txt
    echo "Dependencies installed."
    mkdir -p ./downloads 
fi
echo "Virtual environment found. Activating..."
source "./.venv/bin/activate"
echo "Everything setted up. You are good to go"

