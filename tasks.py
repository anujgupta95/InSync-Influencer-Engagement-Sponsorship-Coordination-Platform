import base64
from celery import shared_task
from flask import jsonify, make_response, render_template
import flask_excel as excel
from models import Role, User, Campaign, UserRoles
from extensions.helpers import send_report
from datetime import datetime as dt, timedelta
from env import LOGIN_INACTIVITY_HOURS

@shared_task()
def daily_reminder():
    inactive_users = []
    for user in User.query.all():
        if user.has_role('influencer') and (dt.now() - user.last_login_at) > timedelta(hours=LOGIN_INACTIVITY_HOURS):
            send_report(to=user.email, 
                       subject=f"Hey {user.name}, Check the new exiciting campaigns!", 
                       message=f'''Hey {user.name},\n Checkout new campaigns and grab the deal before anyone else.''',
            )

    return {"message": "Reminder sent successfully"}, 200    

@shared_task(ignore_result=None)
def send_campaigns_csv(user_id, to):
    campaigns = Campaign.query.filter_by(user_id=user_id).all()
    column_names = ['id', 'name', 'description', 'start_date', 'end_date', 'budget', 'visibility', 'goals']
    csv_out = excel.make_response_from_query_sets(campaigns, column_names, 'csv', status=200)
    file_path = f'./downloads/campaigns_{user_id}.csv'

    with open(file_path, 'wb') as file:
        file.write(csv_out.data)
    send_report(to, subject="Campaigns CSV", message="PFA campaigns CSV", file=file_path)
    return {"message": "CSV Sent Successfully"}, 200

@shared_task()
def monthly_report(time):
    sponsors = User.query.join(UserRoles).join(Role).filter(Role.name == 'sponsor').all()
    for sponsor in sponsors:
        now = time - timedelta(days=5)
        year = now.year
        month = now.month
        start_date = dt(year, month, 1)
        end_date = dt(year, month + 1, 1) - timedelta(days=1) if month < 12 else dt(year + 1, 1, 1) - timedelta(days=1)
        
        sponsor_data = sponsor.sponsor_data
        influencers = User.query.join(UserRoles).join(Role).filter(Role.name == 'influencer').all()

        campaigns = Campaign.query.filter(Campaign.user_id == sponsor.id,Campaign.start_date >= start_date,Campaign.start_date <= end_date).all()
        campaign_dict = {campaign.id: campaign.name for campaign in campaigns}
        influencer_dict = {influencer.id: influencer.name for influencer in influencers}

        ad_requests = []
        report_data = []
        for campaign in campaigns:
            total_ads = 0
            budget_used = 0
            for ad_request in campaign.ad_requests:
                if ad_request.user_id not in [None,0]:
                    total_ads += 1
                    budget_used += ad_request.revised_payment_amount or ad_request.payment_amount
                ad_requests.append(ad_request)

            report_data.append({
                'campaign_name': campaign.name,
                'total_ads': total_ads,
                'budget_used': budget_used
            })
        
        with open('static/bg.jpg', "rb") as image_file:
            bg_img= base64.b64encode(image_file.read()).decode('utf-8')

        html = render_template('monthly_report.html',
            start_date=start_date.strftime('%Y-%m-%d'), end_date=end_date.strftime('%Y-%m-%d'), report_data=report_data,
            user=sponsor, sponsor_data=sponsor_data, campaigns=campaigns, ad_requests=ad_requests,
            campaign_dict=campaign_dict,influencer_dict=influencer_dict, bg_img=bg_img
        )

        # Save the HTML report to a file
        report_path = f'downloads/monthly_report_{sponsor.id}.html'
        with open(report_path, 'w') as file:
            file.write(html)

        send_report(to=sponsor.email, subject='Monthly Report', message='Please find the attached monthly report.',file=report_path)

    return {"message": "Monthly Reports sent successfully"}, 200   