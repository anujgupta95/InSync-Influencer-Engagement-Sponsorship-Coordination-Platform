from flask_security import SQLAlchemyUserDatastore
from flask_security.utils import hash_password
from extensions import db
from env import ADMIN_EMAIL, ADMIN_PASSWORD

def create_data(user_datastore : SQLAlchemyUserDatastore):
    print("###### Creating Data ######")

    #Create Roles
    user_datastore.find_or_create_role(name='admin', description='Administrator')
    user_datastore.find_or_create_role(name='sponsor', description='Sponsor')
    user_datastore.find_or_create_role(name='influencer', description='Influencer')
    
    #Create User Data
    if not user_datastore.find_user(email=ADMIN_EMAIL):
        user_datastore.create_user(
            email=ADMIN_EMAIL, 
            password=hash_password(ADMIN_PASSWORD), 
            name="Admin", 
            active=True,
            roles=['admin']
        )
    
    if not user_datastore.find_user(email='sponsor@app.com'):
        user_datastore.create_user(
            email='sponsor@app.com', 
            password=hash_password(ADMIN_PASSWORD), 
            name="Sponsor", 
            active=True,
            roles=['sponsor']
        )
        
    if not user_datastore.find_user(email='influencer@app.com'):
        user_datastore.create_user(
            email='influencer@app.com',
            password=hash_password(ADMIN_PASSWORD), 
            name="Influencer", 
            active=True,
            roles=['influencer']
        )

    db.session.commit()