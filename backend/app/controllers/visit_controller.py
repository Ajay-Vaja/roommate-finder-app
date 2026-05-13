from flask import request, jsonify
from flask.views import MethodView
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.visit_request_model import VisitRequest
from app.models.property_model import Property
from app.models.user_model import User

class VisitRequestController(MethodView):
    """
    Class-Based View to handle the lifecycle of visit requests.
    Supports creating, fetching, and updating statuses.
    """

    @jwt_required()
    def post(self):
        """
        Creates a new visit request from a Seeker to a Lister.
        """
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        property_id = data.get('property_id')
        message = data.get('message', '')

        # Basic validation: ensure property exists
        prop = Property.query.get(property_id)
        if not prop:
            return jsonify({"msg": "Property not found"}), 404

        # Logic: Prevent seekers from booking their own properties (if they switch roles)
        if prop.user_id == current_user_id:
            return jsonify({"msg": "You cannot book a visit for your own property"}), 400

        try:
            # Create the request record in 'Pending' state by default
            new_request = VisitRequest(
                seeker_id=current_user_id,
                property_id=property_id,
                message=message
            )
            db.session.add(new_request)
            db.session.commit()
            
            return jsonify({"msg": "Visit request sent successfully", "id": new_request.id}), 201
            
        except Exception as e:
            db.session.rollback()
            return jsonify({"msg": f"Failed to send request: {str(e)}"}), 500

    @jwt_required()
    def get(self):
        """
        Fetches visit requests. 
        - If Seeker: Returns requests they sent.
        - If Lister: Returns requests received for their properties.
        """
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if user.user_type == 'Lister':
            # Logic: Join VisitRequest with Property to find requests belonging to this Lister
            # We filter properties by the current lister's ID
            requests = db.session.query(VisitRequest).join(Property).filter(Property.user_id == current_user_id).all()
        else:
            # If Seeker, just find requests they initiated
            requests = VisitRequest.query.filter_by(seeker_id=current_user_id).all()

        results = []
        for req in requests:
            prop = Property.query.get(req.property_id)
            seeker = User.query.get(req.seeker_id)
            
            results.append({
                "id": req.id,
                "status": req.status,
                "message": req.message,
                "property_title": prop.title if prop else "Unknown",
                "property_id": req.property_id,
                "seeker_name": seeker.name if seeker else "Unknown",
                "created_at": req.created_at.isoformat()
            })
            
        return jsonify(results), 200

    @jwt_required()
    def patch(self, request_id):
        """
        Updates the status of a visit request (Accept/Reject).
        Only accessible by the property owner (Lister).
        """
        current_user_id = get_jwt_identity()
        data = request.get_json()
        new_status = data.get('status') # 'Accepted' or 'Rejected'

        if new_status not in ['Accepted', 'Rejected']:
            return jsonify({"msg": "Invalid status"}), 400

        # Fetch the request
        visit_req = VisitRequest.query.get(request_id)
        if not visit_req:
            return jsonify({"msg": "Request not found"}), 404

        # Security Check: Ensure the current user is the owner of the property
        prop = Property.query.get(visit_req.property_id)
        if prop.user_id != current_user_id:
            return jsonify({"msg": "Unauthorized to manage this request"}), 403

        try:
            visit_req.status = new_status
            db.session.commit()
            return jsonify({"msg": f"Request {new_status.lower()} successfully"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"msg": str(e)}), 500
