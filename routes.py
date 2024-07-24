from flask import Flask, jsonify, render_template_string, render_template, request
from flask_security import current_user, auth_required, roles_required, SQLAlchemyUserDatastore, roles_accepted
from flask_security.utils import hash_password
from extensions import db
from env import PUBLIC_ROLES
from models import SponsorData, InfluencerData

def create_routes(app: Flask, user_datastore: SQLAlchemyUserDatastore):

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
            "roles": current_user.roles[0].name,
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
            user = user_datastore.create_user(
                email=email, 
                password=hash_password(password),
                roles=[role],
                active=True if role == 'influencer' else False,
                name=name
            )
            
            # Create the role-specific data
            if role == "sponsor":
                company_name = data.get('company_name')
                industry = data.get('industry')
                budget = data.get('budget')

                sponsor_data = SponsorData(
                    company_name=company_name, 
                    industry=industry, 
                    budget=budget,
                    user=user  # Link sponsor data to the user
                )
                db.session.add(sponsor_data)
            
            elif role == 'influencer':
                category = data.get('category')
                niche = data.get('niche')
                followers = data.get('followers')

                influencer_data = InfluencerData(
                    category=category, 
                    niche=niche, 
                    followers=followers,
                    user=user  # Link influencer data to the user
                )
                db.session.add(influencer_data)

            # Commit the session after creating both user and role-specific data
            db.session.commit()

        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"Error while creating user: {str(e)}"}), 500
        
        return jsonify({"message": "User created"}), 200