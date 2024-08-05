from flask_security import SQLAlchemyUserDatastore
from flask_security.utils import hash_password
from extensions import db
from env import ADMIN_EMAIL, ADMIN_PASSWORD
from models import SponsorData, InfluencerData

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
            roles=['sponsor'],
            sponsor_data=SponsorData(company_name="IEASP", industry="Marketing", budget=1000000)
        )
        
    if not user_datastore.find_user(email='influencer@app.com'):
        user_datastore.create_user(
            email='influencer@app.com',
            password=hash_password(ADMIN_PASSWORD), 
            name="Influencer", 
            active=True,
            roles=['influencer'],
            influencer_data=InfluencerData(category="Social Media", niche="Gaming", followers=85652)
        )

    db.session.commit()