from extensions import db, security
from flask_security import UserMixin, RoleMixin
from flask_security.models import fsqla_v3 as fsq
from env import VISIBILITY_TYPES, REQUEST_STATUS
from datetime import datetime as dt

fsq.FsModels.set_db_info(db)

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, nullable=False, unique=True)
    password = db.Column(db.String, nullable=False)
    name = db.Column(db.String, nullable=False)
    active = db.Column(db.Boolean)
    fs_uniquifier = db.Column(db.String, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=dt.now())
    updated_at = db.Column(db.DateTime, nullable=False, default=dt.now(), onupdate=dt.now())
    roles = db.relationship('Role', secondary = 'user_roles', backref='users')

class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False, unique=True)
    description = db.Column(db.String)

class UserRoles(db.Model):
    __tablename__ = 'user_roles'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'))

class Campaign(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    description = db.Column(db.String)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    budget = db.Column(db.Float)
    visibility = db.Column(db.Enum(*VISIBILITY_TYPES, name='visibility_types'), default='private', nullable=False)
    goals =  db.Column(db.Text)
    created_at = db.Column(db.DateTime, nullable=False, default=dt.now())
    updated_at = db.Column(db.DateTime, nullable=False, default=dt.now(), onupdate=dt.now())
    ad_requests = db.relationship('AdRequest', backref='campaign')

class AdRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    campaign_id  = db.Column(db.Integer, db.ForeignKey('campaign.id'))
    influencer_id  = db.Column(db.Integer, db.ForeignKey('user.id'))
    messages = db.Column(db.String)
    requirements = db.Column(db.String)
    payment_amount = db.Column(db.Float)
    status= db.Column(db.Enum(*REQUEST_STATUS, name='request_status'), default='pending', nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=dt.now())
    updated_at = db.Column(db.DateTime, nullable=False, default=dt.now(), onupdate=dt.now())

class CampaignAdRequests(db.Model):
    __tablename__ = 'campaign_ad_requests'
    id = db.Column(db.Integer, primary_key=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaign.id'))
    ad_request_id = db.Column(db.Integer, db.ForeignKey('ad_request.id'))
