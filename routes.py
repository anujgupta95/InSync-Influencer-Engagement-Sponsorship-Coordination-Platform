import base64
from flask import Flask, jsonify, render_template, request, make_response
from flask_security import current_user, auth_required, roles_required, SQLAlchemyUserDatastore
from flask_security.utils import hash_password
from extensions import db
from env import PUBLIC_ROLES
from models import Campaign, Role, SponsorData, InfluencerData, User, UserRoles
from datetime import datetime as dt, timedelta
import flask_excel as excel
from tasks import send_campaigns_csv

def create_routes(app: Flask, user_datastore: SQLAlchemyUserDatastore, cache):

    @app.route('/')
    def home():
        return render_template('index.html')
    
    @app.route('/<path:path>')
    def catch_all(path):
        if not path.startswith('api'):
            return render_template('index.html')
        else:
            return jsonify({"error": "Not Found"}), 404
    
    @app.errorhandler(404)
    def not_found(e):
        return render_template('error.html')
    
    @app.route('/check_login')
    @auth_required('session', 'token')
    def is_login():
        return jsonify({
            "loggedIn": True,
            "id": current_user.id,
            "role": current_user.roles[0].name,
            "message": "User is Logged in"
        })

    @app.route('/signup', methods=["POST"])
    def signup():
        data = request.get_json()

        email = data.get('email')
        password = data.get('password')
        role = data.get('role')
        name = data.get('name')

        if not email or not password or role not in PUBLIC_ROLES:
            return jsonify({"error": "Invalid Input"}), 400

        if user_datastore.find_user(email=email):
            return jsonify({"error": "User already exists"}), 409

        try:
            sponsor_data = None
            influencer_data = None

            if role == "sponsor":
                sponsor_data_dict = data.get('sponsor_data', {})
                company_name = sponsor_data_dict.get('company_name', "")
                industry = sponsor_data_dict.get('industry', "")
                budget = sponsor_data_dict.get('budget', 0)
                sponsor_data = SponsorData(
                    company_name=company_name,
                    industry=industry,
                    budget=budget
                )
            elif role == 'influencer':
                influencer_data_dict = data.get('influencer_data', {})
                category = influencer_data_dict.get('category', "")
                niche = influencer_data_dict.get('niche', "")
                followers = influencer_data_dict.get('followers', 0)
                influencer_data = InfluencerData(
                    category=category,
                    niche=niche,
                    followers=followers
                )

            user_datastore.create_user(
                email=email,
                password=hash_password(password),
                roles=[role],
                active=True if role == 'influencer' else False,
                name=name,
                sponsor_data=sponsor_data,
                influencer_data=influencer_data
            )
            
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"Error while creating user: {str(e)}"}), 500
        db.session.commit()
        return jsonify({"message": "User created"}), 200
    
    @app.route('/export/campaigns')
    @auth_required()
    @roles_required('sponsor')
    def export_campaigns():
        medium = request.args.get('medium')
        if medium is None:
            campaigns = Campaign.query.filter_by(user_id=current_user.id).all()
            column_names = ['id', 'name', 'description', 'start_date', 'end_date', 'budget', 'visibility', 'goals']
            return excel.make_response_from_query_sets(campaigns, column_names, 'csv', status=200)
        else:
            task = send_campaigns_csv.delay(current_user.id, current_user.email)
            return "CSV will be sent to your email shortly", 200
        

    # @app.route('/generate-monthly-report', methods=['GET'])
    # @auth_required('session', 'token')
    # @roles_required('sponsor')
    # def generate_monthly_report(sponsor_id=None):
    #     try:
    #         user = User.query.get(current_user.id)
    #         now = dt.now()
    #         year = now.year
    #         month = now.month
    #         start_date = dt(year, month, 1)
    #         end_date = dt(year, month + 1, 1) - timedelta(days=1) if month < 12 else dt(year + 1, 1, 1) - timedelta(days=1)
            
    #         sponsor = user.sponsor_data
    #         influencers = User.query.join(UserRoles).join(Role).filter(Role.name == 'influencer').all()

    #         campaigns = Campaign.query.filter(Campaign.user_id == user.id,Campaign.start_date >= start_date,Campaign.start_date <= end_date).all()
    #         campaign_dict = {campaign.id: campaign.name for campaign in campaigns}
    #         influencer_dict = {influencer.id: influencer.name for influencer in influencers}

    #         ad_requests = []
    #         report_data = []
    #         for campaign in campaigns:
    #             total_ads = 0
    #             budget_used = 0
    #             for ad_request in campaign.ad_requests:
    #                 if ad_request.user_id not in [None,0]:
    #                     total_ads += 1
    #                     budget_used += ad_request.revised_payment_amount or ad_request.payment_amount
    #                 ad_requests.append(ad_request)

    #             report_data.append({
    #                 'campaign_name': campaign.name,
    #                 'total_ads': total_ads,
    #                 'budget_used': budget_used
    #             })
            
    #         with open('static/bg.jpg', "rb") as image_file:
    #             bg_img= base64.b64encode(image_file.read()).decode('utf-8')

    #         html = render_template(
    #             'monthly_report.html',
    #             start_date=start_date.strftime('%d-%b-%Y'), end_date=end_date.strftime('%d-%b-%Y'), report_data=report_data,
    #             user=user, sponsor=sponsor, campaigns=campaigns, ad_requests=ad_requests,
    #             campaign_dict=campaign_dict,influencer_dict=influencer_dict, bg_img=bg_img
    #         )

    #         response = make_response(html)
    #         response.headers['Content-Type'] = 'text/html'
    #         response.headers['Content-Disposition'] = 'attachment; filename=monthly_report.html'
    #         return html
    #         return response
            
    #     except Exception as e:
    #         # Handle exceptions and return an error message
    #         return jsonify({"error": str(e)}), 500