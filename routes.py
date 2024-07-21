from flask import Flask, jsonify, render_template_string, render_template, request
from flask_security import current_user, auth_required, roles_required, SQLAlchemyUserDatastore
from flask_security.utils import hash_password
from extensions import db
from env import PUBLIC_ROLES

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
        
        if role=="sponsor":
            active = False
        elif role=='influencer':
            active = True
        
        try:
            user_datastore.create_user(
                email = email, 
                password = hash_password(password),
                roles = [role],
                active = active,
                name = name
            )
            db.session.commit() 
        except:
            db.session.rollback()
            return jsonify({"error":"error while creating user"}), 409
        
        return jsonify({"message":"User created"}), 200
    
    @app.route('/sponsor/dashboard')
    @auth_required('session', 'token')
    @roles_required('sponsor')
    def sponsor_dashboard():
        return render_template_string(
            '''
                <h1> Hello {{current_user.name}}</h1>
                <p> Email : {{current_user.email}} </p>
                <p> Roles : {{current_user.roles[0].name}} </p>
                <a href='/logout'> Logout </a>
            '''
        )

