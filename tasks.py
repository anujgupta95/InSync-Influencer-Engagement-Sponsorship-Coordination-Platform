from celery import shared_task
import flask_excel as excel
from models import User, Campaign
from extensions.helpers import send_email
from datetime import datetime as dt, timedelta
from env import LOGIN_INACTIVITY_HOURS

@shared_task()
def daily_reminder():
    inactive_users = []
    for user in User.query.all():
        if user.has_role('influencer') and (dt.now() - user.last_login_at) > timedelta(hours=LOGIN_INACTIVITY_HOURS):
            send_email(user.email, 
                       subject=f"Hey {user.name}, Check the new exiciting campaigns!", 
                       message=f'''Hey {user.name},\n Checkout new campaigns and grab the deal before anyone else.''',
            )

    return "Reminder sent successfully"

@shared_task(ignore_result=None)
def send_campaigns_csv(user_id, to):
    campaigns = Campaign.query.filter_by(user_id=user_id).all()
    column_names = ['id', 'name', 'description', 'start_date', 'end_date', 'budget', 'visibility', 'goals']
    csv_out = excel.make_response_from_query_sets(campaigns, column_names, 'csv', status=200)
    file_path = f'./downloads/campaigns_{user_id}.csv'

    with open(file_path, 'wb') as file:
        file.write(csv_out.data)
    send_email(to, subject="Campaigns CSV", message="PFA campaigns CSV", file=file_path)
    return {"message": "CSV Sent Successfully"}, 200