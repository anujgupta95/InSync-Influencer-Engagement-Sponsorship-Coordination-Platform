from env import DISCORD_WEBHOOK_URL, SENDER_EMAIL_MAIL, SENDER_EMAIL_PASSWORD
import requests
import os
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email.mime.text import MIMEText
from email.utils import formatdate
import smtplib
from email import encoders

def send_report(to, subject, message, file=None):
    send_to_discord(f"To: {to}\nMessage: {message}", file)
    send_email(to, subject, message, file)
    if file and os.path.exists(file):
        os.remove(file)

def send_email(to, subject, body, attachment_path):
    smtp_server = "smtp.gmail.com"
    smtp_port = 587
    try:
        msg = MIMEMultipart()
        msg['From'] = SENDER_EMAIL_MAIL
        msg['To'] = to
        msg['Date'] = formatdate(localtime=True)
        msg['Subject'] = subject
        msg.attach(MIMEText(body))

        if attachment_path:
            part = MIMEBase('application', 'octet-stream')
            part.set_payload(open(attachment_path, 'rb').read())
            encoders.encode_base64(part)
            part.add_header('Content-Disposition', f'attachment; filename="{os.path.basename(attachment_path)}"')
            msg.attach(part)

        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(SENDER_EMAIL_MAIL, SENDER_EMAIL_PASSWORD)
            server.sendmail(SENDER_EMAIL_MAIL, to, msg.as_string())
        print("Email sent successfully")

    except smtplib.SMTPAuthenticationError as e:
        print(f"SMTP Authentication Error: {e}")
    except smtplib.SMTPException as e:
        print(f"SMTP Error: {e}")
    except Exception as e:
        print(f"General Error: {e}")

def send_to_discord(message, image_path=None):
    webhook_url = DISCORD_WEBHOOK_URL
    if image_path:
        with open(image_path, 'rb') as image_file:
            files = {'file': image_file}
            data = {'content': message}
            requests.post(webhook_url, data=data, files=files)
    else:
        requests.post(webhook_url, data={'content': message})