from celery import shared_task
import flask_excel as excel
from models import User

@shared_task(ignore_result = False)
def create_csv():
    users = User.query.with_entities(User.id, User.email, User.name).all()
    csv_out = excel.make_response_from_query_sets(users, ["id", "email", "name"], 'csv', file_name="users.csv")

    with open('./downloads/users.csv', 'wb') as file:
        file.write(csv_out.data)
    return "Created CSV Successfully"

@shared_task()
def daily_reminder(xyz):
    print("in daily reminder", xyz)
    return "in daily reminder"