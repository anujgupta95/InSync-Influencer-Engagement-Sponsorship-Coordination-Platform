from env import DISCORD_WEBHOOK_URL
import requests
import os

def send_email(to, subject, message, file=None):
    send_to_discord(f"To: {to}\nMessage: {message}", file)
    if file and os.path.exists(file):
        os.remove(file)


def send_to_discord(message, image_path=None):
    webhook_url = DISCORD_WEBHOOK_URL
    if image_path:
        with open(image_path, 'rb') as image_file:
            files = {'file': image_file}
            data = {'content': message}
            requests.post(webhook_url, data=data, files=files)
    else:
        requests.post(webhook_url, data={'content': message})