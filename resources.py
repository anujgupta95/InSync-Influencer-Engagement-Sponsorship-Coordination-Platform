from flask_restful import Resource, Api, reqparse, fields, marshal_with # type: ignore
from flask_security import auth_required, current_user, roles_required, roles_accepted
from flask import request, jsonify
from models import Campaign, AdRequest, Role, User, SponsorData, InfluencerData, UserRoles
from extensions import db, cache
from datetime import date, datetime
from env import ADMIN_EMAIL, ALL_ROLES
from sqlalchemy import or_

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
        'goals' : fields.String,
        'flagged' :fields.Boolean
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
    # @cache.cached(timeout=1, query_string=True)
    def get(self, campaign_id=None):
        if current_user.has_role('sponsor'):
            if campaign_id is None:
                campaigns =  Campaign.query.filter_by(user_id=current_user.id, flagged=False).all()
                return [campaign.to_dict() for campaign in campaigns]

            campaign = Campaign.query.filter_by(user_id=current_user.id, id=campaign_id, flagged=False).first()
            if not campaign:
                return {'message': 'Campaign not found or not authorized'}, 404
            return campaign.to_dict()
        
        else:
            if campaign_id is None:
                campaigns =  Campaign.query.filter_by(visibility='public', flagged=False).all()
                return [campaign.to_dict() for campaign in campaigns]
            
            campaign = Campaign.query.filter_by(id=campaign_id, flagged=False).first()
            if not campaign:
                return {'message': 'Campaign not found or not authorized'}, 404
            if campaign.visibility == 'public':
                return campaign.to_dict()
            if AdRequest.query.filter_by(user_id=current_user.id, campaign_id=campaign.id, flagged=False).first():
                return campaign.to_dict()
            return {'message': 'Campaign not found or not authorized'}, 404
                
    
    @auth_required()
    @roles_required('sponsor')
    def post(self):
        print("hello from post resources")
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
        return {'message': 'Campaign created successfully!'}, 201
    
    @auth_required()
    @roles_required('sponsor')
    def put(self, campaign_id=None):
        if campaign_id is None:
            campaign_id = request.get_json()['id']
        args = self.parser.parse_args()
        campaign = Campaign.query.filter_by(user_id=current_user.id, id=campaign_id, flagged=False).first()
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
        campaign = Campaign.query.filter_by(user_id=current_user.id, id=campaign_id, flagged=False).first()
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
        'user_id': fields.Integer,
        'messages': fields.String,
        'requirements': fields.String,
        'payment_amount': fields.Float,
        'revised_payment_amount': fields.Float,
        'negotiation_notes': fields.String,
        'status': fields.String
    }

    parser.add_argument('campaign_id', type=int)
    parser.add_argument('user_id', type=int)
    parser.add_argument('messages', type=str)
    parser.add_argument('requirements', type=str)
    parser.add_argument('payment_amount', type=float)
    parser.add_argument('revised_payment_amount', type=float)
    parser.add_argument('negotiation_notes', type=str)
    parser.add_argument('status', type=str)

    @auth_required()
    @marshal_with(ad_request_fields)
    def get(self, ad_request_id=None, campaign_id=None):          
        if current_user.has_role('sponsor'):
            if campaign_id is not None:
                if Campaign.query.filter_by(id=campaign_id, flagged=False).first() in current_user.campaigns:
                    ad_requests = AdRequest.query.filter_by(campaign_id=campaign_id).all()
                    print(ad_requests)
                    return [ad_request.to_dict() for ad_request in ad_requests]
                return {'error': 'Campaign not found or not authorized'}, 404
            
            if ad_request_id is None:
                # campaign_ids = [campaign.id for campaign in current_user.campaigns]
                # ad_requests = AdRequest.query.filter(AdRequest.campaign_id.in_(campaign_ids)).all()
                ad_requests = AdRequest.query.join(Campaign).filter(Campaign.user_id == current_user.id, Campaign.flagged==False).all()
                return [ad_request.to_dict() for ad_request in ad_requests]
            else:
                ad_request = AdRequest.query.join(Campaign).filter(Campaign.user_id == current_user.id, 
                                                AdRequest.id == ad_request_id, Campaign.flagged==False).first()
                if not ad_request:
                    return {'error': 'Ad request not found or not authorized'}, 404
                return ad_request.to_dict()
        else:  # Influencer
            if campaign_id:
                if Campaign.query.filter_by(id=campaign_id, flagged=False).first():
                    ad_request = AdRequest.query.filter(AdRequest.campaign_id == campaign_id, AdRequest.user_id == current_user.id).first()
                    if not ad_request:
                        ad_request = AdRequest.query.filter(AdRequest.campaign_id == campaign_id, 
                                                            or_(AdRequest.user_id == 0,AdRequest.user_id.is_(None))).first()
                     
                    if not ad_request:
                        return {'error': 'Ad request not found or not authorized'}, 404
                    
                    return ad_request.to_dict()
                return {'error': 'Ad request not found or not authorized'}, 404
            
            if ad_request_id is None:
                ad_requests = AdRequest.query.filter_by(user_id=current_user.id).all()
                return [ad_request.to_dict() for ad_request in ad_requests]
            else:
                # ad_request = AdRequest.query.filter_by(user_id=current_user.id, id=ad_request_id).first()
                ad_request = AdRequest.query.filter(AdRequest.id==ad_request_id,
                                                    or_(AdRequest.user_id == 0,AdRequest.user_id == current_user.id,AdRequest.user_id.is_(None))).first()
                if not ad_request:
                    return {'error': 'Ad request not found or not authorized'}, 404
                return ad_request.to_dict()

    @auth_required()
    @roles_required('sponsor')
    def post(self):
        args = self.parser.parse_args() 
        campaign = Campaign.query.filter_by(id=args.campaign_id, flagged=False).first()
        if not campaign:
            return {'error': 'Campaign does not exist'}, 400
        if AdRequest.query.filter_by(campaign_id=campaign.id, user_id=args.user_id).first():
            return {'error': 'This user has already an active request for this campaign'}, 400
        
        ad_request = AdRequest(
            campaign_id=campaign.id,
            user_id=args.user_id,
            messages=args.messages,
            requirements=args.requirements,
            payment_amount=args.payment_amount,
            status="pending",
        )
        db.session.add(ad_request)
        db.session.commit()
        return {'message': 'Ad request created'}, 201

    @auth_required()
    @roles_accepted('influencer', 'sponsor')
    def put(self, ad_request_id):
        args = self.parser.parse_args()
        ad_request = AdRequest.query.get(ad_request_id)
        if not ad_request:
            return {'message': 'Ad request not found or not authorized'}, 404
        
        if current_user.has_role('influencer'):
            new_ad_request_flag = False
            if ad_request.user_id in [0, None]:
                new_ad_request = AdRequest(
                    campaign_id=ad_request.campaign_id,
                    user_id=current_user.id,
                    messages=ad_request.messages,
                    requirements=ad_request.requirements,
                    payment_amount=ad_request.payment_amount
                )
                db.session.add(new_ad_request)
                ad_request = new_ad_request
                new_ad_request_flag = True

            notes = f"Influencer ID: {current_user.id} | Influencer Name: {current_user.name} | Date & Time: {str(datetime.now()).split('.')[0]}\n"
            if ad_request.status in ['pending', 'negotiating']:
                if args.status in ['accepted', 'rejected']:
                    notes += f"Ad Request {args.status.capitalize()}\n\n"
                    ad_request.status = args.status
                    ad_request.revised_payment_amount = args.revised_payment_amount if args.revised_payment_amount else ad_request.payment_amount
                    
                if ad_request.status == 'negotiating':
                    if 'revised_payment_amount' in args:
                        ad_request.revised_payment_amount = args.revised_payment_amount
                        notes += f"Revised Amount: {args.revised_payment_amount}\n"

                    if 'negotiation_notes' in args:
                        notes += f"{args.negotiation_notes}\n\n"
                    
                elif args.status == 'negotiating' and ad_request.status == 'pending':
                    notes += "Started Negotiation\n\n"
                    ad_request.status = 'negotiating'

                ad_request.negotiation_notes += notes
            if new_ad_request_flag:
                db.session.commit()
                print(new_ad_request.id)
                return {'message': f'Public Ad Request {args.status}', "id":new_ad_request.id}, 200
            
        elif current_user.has_role('sponsor'):
            ad_req = request.get_json()
            if("id" in ad_req):
                ad_request = AdRequest.query.get(ad_request_id)
                ad_request.user_id = ad_req['user_id']
                ad_request.messages = ad_req['messages']
                ad_request.requirements = ad_req['requirements']
                ad_request.payment_amount = ad_req['payment_amount']
                ad_request.revised_payment_amount = None
                ad_request.negotiation_notes = ''
                ad_request.status = "pending"
            else:
                if 'negotiation_notes' in args:
                    notes = f"Sponsor ID: {current_user.id} | Sponsor Name: {current_user.name} | Date & Time: {str(datetime.now()).split('.')[0]}\n"
                    notes += f"Revised Amount: {args.revised_payment_amount}\n"
                    notes += f"{args.negotiation_notes}\n\n"
                    ad_request.negotiation_notes += notes
                if 'revised_payment_amount' in args:
                    ad_request.revised_payment_amount = args.revised_payment_amount
        db.session.commit()
        return {'message': 'Ad request updated'}, 200
    
    @auth_required()
    @roles_required('sponsor')
    def delete(self, ad_request_id):
        campaign_ids = [campaign.id for campaign in current_user.campaigns]
        ad_request = AdRequest.query.filter(AdRequest.campaign_id.in_(campaign_ids), AdRequest.id==ad_request_id).first()
        if not ad_request:
            return {'message': 'Ad request not found or not authorized'}, 404
        db.session.delete(ad_request)
        db.session.commit()
        return {'message': 'Ad request deleted'}, 200

class UserResource(Resource):

    parser = reqparse.RequestParser()
    parser.add_argument('name', type=str, required=True, help='Name cannot be blank')
    parser.add_argument('request_role_update', type=str, help='Requested role change')
    parser.add_argument('sponsor_data', type=dict, location='json')
    parser.add_argument('influencer_data', type=dict, location='json')

    @auth_required()
    # @cache.cached(timeout=10, query_string=True)
    def get(self, user_id=None, all=""):
        if not current_user.is_authenticated:
            return {'error': 'Please login first'}, 401
        
        if current_user.has_role('sponsor'):
            if all=="all":
                all_users = User.query.filter_by(active=True, flagged=False).all()
                users = [user.to_dict() for user in all_users if user.has_role('influencer')]
                return users
            if user_id is None:
                return current_user.to_dict()
            
            user = User.query.filter_by(id=user_id, flagged=False).first()
            if not user or user.roles[0]!='influencer' or not user.active:
                return {'error': 'Influencer not found'}, 404
            return user.to_dict()

        # if user_id is None:
        user = User.query.get(current_user.id)
            
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
        return jsonify(user_dict)
    

    @auth_required()
    def put(self, user_id=None):
        args = self.parser.parse_args()

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
            user.roles = [Role.query.get(2)]
        
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
    @auth_required()
    @roles_required('admin')
    def get(self, entity_type):
        if entity_type == "users":
            users = User.query.all()
            return [user.to_dict() for user in users]
        elif entity_type == 'inactive_sponsors':
            all_users = User.query.filter_by(active=False).all()
            users = [user for user in all_users if user.has_role('sponsor')]
            return [user.to_dict() for user in users]
        elif entity_type == 'campaigns':
            campaigns = Campaign.query.all()
            return [campaign.to_dict() for campaign in campaigns]
        elif entity_type == 'ad_requests':
            ad_requests = AdRequest.query.filter().all()
            return [ad_request.to_dict() for ad_request in ad_requests]
        elif entity_type == "all_data":
            users = User.query.filter(User.email != ADMIN_EMAIL).all()
            campaigns = Campaign.query.all()
            ad_requests = AdRequest.query.all()
            
            return {
                'users': [user.to_dict() for user in users],
                'campaigns': [campaign.to_dict() for campaign in campaigns],
                'ad_requests': [ad_request.to_dict() for ad_request in ad_requests],
            }
        return {'error': 'Invalid entity type'}, 400
    
    @auth_required()
    @roles_required('admin')
    def put(self, entity_type, id, action):
        if entity_type == "sponsor":
            sponsor = User.query.get(id)
            if sponsor and action == "active":
                sponsor.influencer_data = None
                sponsor.active = True
                db.session.commit()
                return {'message': "Sponsor activated successfully!"}, 200
            else:
                return {'error': 'Sponsor not found'}, 404
                
        elif entity_type == 'user':
            user = User.query.get(id)
            if not user:
                return {'error': 'User not found'}, 404

            if action == 'flag':
                user.flagged = True
                user.active = False
                db.session.commit()
                return {'message': "User flagged successfully!"}, 200
            elif action == 'unflag':
                user.flagged = False
                user.active = True
                db.session.commit()
                return {'message': "User unflagged successfully!"}, 200
            else:
                return {'error': 'Invalid action'}, 400
            
        elif entity_type == 'campaign':
            campaign = Campaign.query.get(id)
            if not campaign:
                return {'error': 'Campaign not found'}, 404

            if action == 'flag':
                campaign.flagged = True
                db.session.commit()
                return {'message': "Campaign flagged successfully!"}, 200
            elif action == 'unflag':
                campaign.flagged = False
                db.session.commit()
                return {'message': "Campaign unflagged successfully!"}, 200
            else:
                return {'error': 'Invalid action'}, 400
        else:
            return {'error': 'Invalid entity type'}, 400   

api.add_resource(CampaignResource, '/campaign', '/campaign/<int:campaign_id>')
api.add_resource(AdRequestResource, '/ad-request', '/ad-request/<int:ad_request_id>', '/ad-request/c/<int:campaign_id>')
api.add_resource(UserResource, '/user', '/user/<int:user_id>', '/users/<string:all>')
api.add_resource(AdminResource, '/admin/<string:entity_type>', '/admin/<string:entity_type>/<int:id>//<string:action>')
