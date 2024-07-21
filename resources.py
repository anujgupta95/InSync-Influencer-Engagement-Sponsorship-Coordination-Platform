from flask_restful import Resource, Api, reqparse, fields, marshal_with
from flask_security import auth_required
from models import Campaign
from extensions import db
from datetime import date

api = Api(prefix='/api')

parser = reqparse.RequestParser()
parser.add_argument('name', type=str, required=True, help='Name cannot be blank')
parser.add_argument('description', type=str)
parser.add_argument('start_date', type=str, required=True, help='Start date cannot be blank')
parser.add_argument('end_date', type=str, required=True, help='End date cannot be blank')
parser.add_argument('budget', type=float, required=True, help='Budget cannot be blank')
parser.add_argument('visibility', type=str)
parser.add_argument('goals', type=str)

campaign_fields = {
    'id' : fields.Integer,
    'name' : fields.String,
    'description' : fields.String,
    'start_date' : fields.String,
    'end_date' : fields.String,
    'budget' : fields.Float,
    'visibility' : fields.String,
    'goals' : fields.String,
}

class Campaigns(Resource):
    @auth_required()
    @marshal_with(campaign_fields)
    def get(self):
        all_campaigns = Campaign.query.all()
        return all_campaigns
    
    @auth_required()
    def post(self):
        args = parser.parse_args()
        # campaign = Campaign(**args)
        campaign = Campaign(name=args.name, description=args.description,
                            start_date=date.fromisoformat(args.start_date), end_date=date.fromisoformat(args.end_date), 
                            budget=args.budget, visibility=args.visibility, goals=args.goals)
        db.session.add(campaign)
        db.session.commit()
        return {'message':'campaign created'}, 200


api.add_resource(Campaigns, '/campaign')


ad_request_fields = {
    'id' : fields.Integer,
    'campaign_id'  : fields.Integer,
    'influencer_id'  : fields.Integer,
    'messages' : fields.String,
    'requirements' : fields.String,
    'payment_amount' : fields.Float,
    'status' : fields.String
}
