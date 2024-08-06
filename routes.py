from flask import Flask, jsonify, render_template_string, render_template, request
from flask_security import current_user, auth_required, roles_required, SQLAlchemyUserDatastore, roles_accepted
from flask_security.utils import hash_password
from extensions import db
from env import PUBLIC_ROLES
from models import SponsorData, InfluencerData
import datetime

def create_routes(app: Flask, user_datastore: SQLAlchemyUserDatastore, cache):

    @app.route('/cachedemo')
    @cache.cached(timeout=50)
    def cache():
        return jsonify({"time" : datetime.datetime.now()})

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
