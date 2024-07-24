from flask_restful import Resource, Api, reqparse, fields, marshal_with
from flask_security import auth_required, current_user, roles_required
from flask import request, jsonify
from models import Campaign, AdRequest, Role, User, SponsorData, InfluencerData
from extensions import db
from datetime import date, datetime
from env import ALL_ROLES

api = Api(prefix='/api')

class CampaignResource(Resource):
    
    parser = reqparse.RequestParser()
    campaign_fields = {
        'id' : fields.Integer,
        'name' : fields.String,
        'description' : fields.String,
        'start_date' : fields.String,
        'end_date' : fields.String,
        'budget' : fields.Float,
        'visibility' : fields.String,
        'goals' : fields.String
    }

    parser.add_argument('name', type=str, required=True, help='Name cannot be blank')
    parser.add_argument('description', type=str)
    parser.add_argument('start_date', type=str, required=True, help='Start date cannot be blank')
    parser.add_argument('end_date', type=str, required=True, help='End date cannot be blank')
    parser.add_argument('budget', type=float, required=True, help='Budget cannot be blank')
    parser.add_argument('visibility', type=str)
    parser.add_argument('goals', type=str)

    @auth_required()
    @marshal_with(campaign_fields)
    def get(self, campaign_id=None):
        if current_user.has_role('admin'):
            if campaign_id is None:
                # Admin can see all campaigns
                return Campaign.query.all()
            else:
                # Admin can see a specific campaign
                campaign = Campaign.query.get(campaign_id)
                if not campaign:
                    return {'message': 'Campaign not found'}, 404
                return campaign
        elif current_user.has_role('sponsor'):
            if campaign_id is None:
                # Sponsors can see their own campaigns
                campaigns =  Campaign.query.filter_by(user_id=current_user.id).all()
                campaigns_list = [campaign.to_dict() for campaign in campaigns]
                return campaigns_list
            else:
                campaign = Campaign.query.filter_by(user_id=current_user.id, id=campaign_id).first()
                if not campaign:
                    return {'message': 'Campaign not found or not authorized'}, 404
                return campaign
        else:
            # Influencers can only see public campaigns
            if campaign_id is None:
                return Campaign.query.filter_by(visibility='public').all()
            else:
                campaign = Campaign.query.filter_by(id=campaign_id, visibility='public').first()
                if not campaign:
                    return {'message': 'Campaign not found or not authorized'}, 404
                return campaign
    
    @auth_required()
    @roles_required('sponsor')
    def post(self):
        args = self.parser.parse_args()
        campaign = Campaign(
            user_id=current_user.id,
            name=args.name,
            description=args.description,
            start_date=date.fromisoformat(args.start_date),
            end_date=date.fromisoformat(args.end_date),
            budget=args.budget,
            visibility=args.visibility,
            goals=args.goals
        )
        db.session.add(campaign)
        db.session.commit()
        return {'message': 'Campaign created'}, 201
    

    ##Kuch to lafda lag rha h baad m modify kr lena
    @auth_required()
    @roles_required('sponsor')
    def put(self, campaign_id=None):
        if campaign_id is None:
            campaign_id = request.get_json()['id']
        args = self.parser.parse_args()
        campaign = Campaign.query.filter_by(user_id=current_user.id, id=campaign_id).first()
        if not campaign:
            return {'message': 'Campaign not found or not authorized'}, 404
        
        for key, value in args.items():
            if value is not None:
                # Convert date fields to date objects
                if key in ['start_date', 'end_date'] and isinstance(value, str):
                    try:
                        value = datetime.strptime(value, '%Y-%m-%d').date()
                    except ValueError:
                        return {'message': f"Invalid date format for {key}, expected YYYY-MM-DD"}, 400
                
                setattr(campaign, key, value)

        db.session.commit()
        return {'message': 'Campaign updated'}, 200
    
    @auth_required()
    @roles_required('sponsor')
    def delete(self, campaign_id=None):
        campaign = Campaign.query.filter_by(user_id=current_user.id, id=campaign_id).first()
        if not campaign:
            return {'message': 'Campaign not found or not authorized'}, 404
        db.session.delete(campaign)
        db.session.commit()
        return {'message': 'Campaign deleted'}, 200
    
class AdRequestResource(Resource):

    parser = reqparse.RequestParser()
    ad_request_fields = {
        'id': fields.Integer,
        'campaign_id': fields.Integer,
        'influencer_id': fields.Integer,
        'messages': fields.String,
        'requirements': fields.String,
        'payment_amount': fields.Float,
        'revised_payment_amount': fields.Float,
        'negotiation_notes': fields.String,
        'status': fields.String
    }

    parser.add_argument('campaign_id', type=int, required=True, help='Campaign ID cannot be blank')
    parser.add_argument('influencer_id', type=int, required=True, help='Influencer ID cannot be blank')
    parser.add_argument('messages', type=str)
    parser.add_argument('requirements', type=str)
    parser.add_argument('payment_amount', type=float, required=True, help='Payment amount cannot be blank')
    parser.add_argument('revised_payment_amount', type=float)
    parser.add_argument('negotiation_notes', type=str)
    parser.add_argument('status', type=str)

    @auth_required()
    @marshal_with(ad_request_fields)
    def get(self, ad_request_id=None):
        if current_user.has_role('admin'):
            if ad_request_id is None:
                return AdRequest.query.all()
            else:
                ad_request = AdRequest.query.get(ad_request_id)
                if not ad_request:
                    return {'message': 'Ad request not found'}, 404
                return ad_request
        elif current_user.has_role('sponsor'):
            if ad_request_id is None:
                return AdRequest.query.filter_by(campaign_id=Campaign.query.filter_by(user_id=current_user.id).subquery()).all()
            else:
                ad_request = AdRequest.query.filter_by(campaign_id=Campaign.query.filter_by(user_id=current_user.id).subquery(), id=ad_request_id).first()
                if not ad_request:
                    return {'message': 'Ad request not found or not authorized'}, 404
                return ad_request
        else:  # Influencer
            if ad_request_id is None:
                return AdRequest.query.filter_by(influencer_id=current_user.id).all()
            else:
                ad_request = AdRequest.query.filter_by(influencer_id=current_user.id, id=ad_request_id).first()
                if not ad_request:
                    return {'message': 'Ad request not found or not authorized'}, 404
                return ad_request

    @auth_required()
    @roles_required('sponsor')
    def post(self):
        args = self.parser.parse_args()
        ad_request = AdRequest(
            campaign_id=args.campaign_id,
            influencer_id=args.influencer_id,
            messages=args.messages,
            requirements=args.requirements,
            payment_amount=args.payment_amount,
            status=args.status
        )
        db.session.add(ad_request)
        db.session.commit()
        return {'message': 'Ad request created'}, 201

    @auth_required()
    @roles_required('influencer')
    def put(self, ad_request_id):
        args = self.parser.parse_args()
        ad_request = AdRequest.query.filter_by(influencer_id=current_user.id, id=ad_request_id).first()
        if not ad_request:
            return {'message': 'Ad request not found or not authorized'}, 404
        for key, value in args.items():
            if value is not None:
                setattr(ad_request, key, value)
        db.session.commit()
        return {'message': 'Ad request updated'}, 200

    @auth_required()
    @roles_required('influencer')
    def delete(self, ad_request_id):
        ad_request = AdRequest.query.filter_by(influencer_id=current_user.id, id=ad_request_id).first()
        if not ad_request:
            return {'message': 'Ad request not found or not authorized'}, 404
        db.session.delete(ad_request)
        db.session.commit()
        return {'message': 'Ad request deleted'}, 200

class UserResource(Resource):

    parser = reqparse.RequestParser()
    parser.add_argument('name', type=str, required=True, help='Name cannot be blank')
    # parser.add_argument('role', type=str, required=True, help='Role cannot be null')
    parser.add_argument('request_role_update', type=str, help='Requested role change')

    # Define optional nested structures for role-specific data
    parser.add_argument('sponsor_data', type=dict, location='json')
    parser.add_argument('influencer_data', type=dict, location='json')

    @auth_required()
    def get(self, user_id=None):
        if not current_user.is_authenticated:
            return {'error': 'Please login first'}, 401
        
        if user_id is None:
            user = User.query.get(current_user.id)
        else:
            user = User.query.get(user_id)
        if not user:
            return {'error': 'User not found'}, 404
        
        user_dict = {
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'role': user.roles[0].name,
            'campaigns': [campaign.name for campaign in user.campaigns],
            'sponsor_data': user.sponsor_data.to_dict() if user.sponsor_data else None,
            'influencer_data': user.influencer_data.to_dict() if user.influencer_data else None
        }
        print("User Data:", user_dict)
        return jsonify(user_dict)

    @auth_required()
    def put(self, user_id=None):
        args = self.parser.parse_args()
        print(args)

        if user_id is None:
            user = User.query.get(current_user.id)
        else:
            user = User.query.get(user_id)
        
        if not user:
            return {'error': 'User not found'}, 404

        if args.name:
            user.name = args.name

        if args.request_role_update and args.request_role_update == 'sponsor':
            if 'sponsor' in [role.name for role in user.roles]:
                return {'error': 'You are already a sponsor'}, 400
            
            user.active = False
            # influencer_data = InfluencerData.query.filter_by(user_id=user.id).first()
            # db.session.delete(influencer_data)
            # user.roles = [Role.query.filter_by(name='sponsor').first()]
            user.roles = []
        
        if args.sponsor_data:
            if user.sponsor_data:
                user.sponsor_data.company_name = args.sponsor_data.get('company_name')
                user.sponsor_data.industry = args.sponsor_data.get('industry')
                user.sponsor_data.budget = args.sponsor_data.get('budget')
            else:
                new_sponsor_data = SponsorData(**args.sponsor_data, user=user)
                db.session.add(new_sponsor_data)

        if args.influencer_data:
            if user.influencer_data:
                user.influencer_data.category = args.influencer_data.get('category')
                user.influencer_data.niche = args.influencer_data.get('niche')
                user.influencer_data.followers = args.influencer_data.get('followers')
            else:
                new_influencer_data = InfluencerData(**args.influencer_data, user=user)
                db.session.add(new_influencer_data)

        db.session.commit()
        return {'message': 'User details updated successfully'}, 200 

class AdminResource(Resource):

    parser = reqparse.RequestParser()
    user_fields = {
        'id': fields.Integer,
        'email': fields.String,
        'name': fields.String,
        'active': fields.Boolean,
        'created_at': fields.String,
        'updated_at': fields.String,
    }

    parser.add_argument('active', type=bool)
    parser.add_argument('flagged', type=bool)

    @auth_required()
    @roles_required('admin')
    @marshal_with(user_fields)
    def get(self):
        # List all users for admin
        users = User.query.all()
        return users

    @auth_required()
    @roles_required('admin')
    def put(self):
        data = request.get_json()
        if 'user_id' in data:
            user_id = data['user_id']
        if 'campaign_id' in data:
            campaign_id = data['campaign_id']
        args = self.parser.parse_args()
        print(args)
        user = User.query.get(user_id)
        if not user:
            return {'message': 'User not found'}, 404
        
        if args.active is not None:
            user.active = args.active
        if args.flagged is not None:
            user.flagged = args.flagged

        db.session.commit()
        return {'message': 'User status updated successfully'}, 200


api.add_resource(CampaignResource, '/campaign', '/campaign/<int:campaign_id>')
api.add_resource(AdRequestResource, '/ad_request', '/ad_request/<int:ad_request_id>')
api.add_resource(UserResource, '/user', '/user/<int:user_id>')
api.add_resource(AdminResource, '/admin')
