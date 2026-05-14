from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.property_model import Property
from datetime import datetime
import re
from flask.views import MethodView

def split_property_images(images_str):
    """
    Helper function to split image strings by the custom delimiter or comma logic.
    Ensures base64 strings aren't split incorrectly.
    """
    if not images_str:
        return []
    if '|SPLIT|' in images_str:
        return images_str.split('|SPLIT|')
    
    # Complex Logic: Split by comma ONLY when followed by 'data:image/' 
    # This prevents accidental splitting inside a single long base64 string.
    return re.split(r',(?=data:image\/)', images_str)

class PropertyController(MethodView):
    """
    Class-Based View to manage property listings.
    Handles listing creation, bulk fetching, and individual property details.
    """

    @jwt_required()
    def post(self):
        """
        Creates a new property listing for the current Lister.
        """
        current_user_id = int(get_jwt_identity())
        data = request.get_json()

        # Validation: Ensure core data is present
        required_fields = ['title', 'address', 'city', 'locality', 'rent_amount', 'room_type']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"msg": f"Field '{field}' is required"}), 400

        try:
            # Instantiate new property with default 0 views and 0 rating
            new_property = Property(
                user_id=current_user_id,
                title=data.get('title'),
                description=data.get('description'),
                address=data.get('address'),
                city=data.get('city'),
                locality=data.get('locality'),
                rent_amount=data.get('rent_amount'),
                room_type=data.get('room_type'),
                amenities=data.get('amenities'),
                # Complex Logic: Handle ISO date parsing for availability
                available_from=datetime.fromisoformat(data.get('available_from')) if data.get('available_from') else None,
                images=data.get('images'),
                occupancy_count=data.get('occupancy_count', 1)
            )

            db.session.add(new_property)
            db.session.commit()

            return jsonify({"msg": "Property listed successfully", "property_id": new_property.id}), 201

        except Exception as e:
            db.session.rollback()
            return jsonify({"msg": f"An error occurred: {str(e)}"}), 500

    def get(self, property_id=None):
        """
        Handles both GET all (with filters) and GET individual property by ID.
        """
        if property_id:
            return self._get_single(property_id)
        return self._get_all()

    def _get_all(self):
        """
        Internal method to fetch all properties with optional query filters.
        """
        search = request.args.get('search')
        city = request.args.get('city')
        localities = request.args.get('localities')
        room_type = request.args.get('room_type')
        max_rent = request.args.get('max_rent')

        # Build dynamic query based on provided filters
        query = Property.query
        
        if search:
            search_filter = f"%{search}%"
            query = query.filter(
                (Property.title.ilike(search_filter)) |
                (Property.city.ilike(search_filter)) |
                (Property.locality.ilike(search_filter))
            )
            
        if city:
            query = query.filter(Property.city.ilike(f"%{city}%"))
            
        if localities:
            locality_list = localities.split(',')
            query = query.filter(Property.locality.in_(locality_list))
            
        if room_type:
            query = query.filter_by(room_type=room_type)
            
        if max_rent:
            query = query.filter(Property.rent_amount <= int(max_rent))

        properties = query.order_by(Property.created_at.desc()).all()
        
        result = []
        for prop in properties:
            owner = prop.owner
            owner_profile = owner.profile if owner else None
            
            result.append({
                "id": prop.id,
                "user_id": prop.user_id,
                "title": prop.title,
                "city": prop.city,
                "locality": prop.locality,
                "rent_amount": prop.rent_amount,
                "room_type": prop.room_type,
                "amenities": prop.amenities,
                "images": split_property_images(prop.images),
                "owner_name": owner.name if owner else "Unknown",
                "owner_pic": owner_profile.profile_pic if owner_profile else None,
                "rating": prop.rating or 0.0,
                "views": prop.views or 0,
                "occupancy_count": prop.occupancy_count or 1,
                "created_at": prop.created_at.isoformat()
            })

        return jsonify(result), 200

    def _get_single(self, property_id):
        """
        Internal method to fetch a single property and increment its view count.
        """
        prop = Property.query.get(property_id)
        if not prop:
            return jsonify({"msg": "Property not found"}), 404

        owner = prop.owner
        owner_profile = owner.profile if owner else None

        # Build response object
        result = {
            "id": prop.id,
            "user_id": prop.user_id,
            "title": prop.title,
            "description": prop.description,
            "address": prop.address,
            "city": prop.city,
            "locality": prop.locality,
            "rent_amount": prop.rent_amount,
            "room_type": prop.room_type,
            "amenities": prop.amenities,
            "available_from": prop.available_from.isoformat() if prop.available_from else None,
            "images": split_property_images(prop.images),
            "owner_name": owner.name if owner else "Unknown",
            "owner_pic": owner_profile.profile_pic if owner_profile else None,
            "rating": prop.rating or 0.0,
            "views": prop.views or 0,
            "occupancy_count": prop.occupancy_count or 1,
            "created_at": prop.created_at.isoformat()
        }

        # Logic: Increment views atomically and commit
        try:
            prop.views = (prop.views or 0) + 1
            db.session.commit()
        except:
            db.session.rollback()

        return jsonify(result), 200

    @jwt_required()
    def put(self, property_id):
        """
        Updates an existing property listing.
        Only the owner can update.
        """
        current_user_id = int(get_jwt_identity())
        prop = Property.query.get(property_id)

        if not prop:
            return jsonify({"msg": "Property not found"}), 404

        if prop.user_id != current_user_id:
            return jsonify({"msg": "You are not authorized to update this property"}), 403

        data = request.get_json()

        try:
            # Update fields if provided
            if 'title' in data: prop.title = data['title']
            if 'description' in data: prop.description = data['description']
            if 'address' in data: prop.address = data['address']
            if 'city' in data: prop.city = data['city']
            if 'locality' in data: prop.locality = data['locality']
            if 'rent_amount' in data: prop.rent_amount = data['rent_amount']
            if 'room_type' in data: prop.room_type = data['room_type']
            if 'amenities' in data: prop.amenities = data['amenities']
            if 'occupancy_count' in data: prop.occupancy_count = data['occupancy_count']
            
            if 'available_from' in data:
                prop.available_from = datetime.fromisoformat(data['available_from']) if data['available_from'] else None
            
            if 'images' in data:
                prop.images = data['images']

            db.session.commit()
            return jsonify({"msg": "Property updated successfully"}), 200

        except Exception as e:
            db.session.rollback()
            return jsonify({"msg": f"An error occurred: {str(e)}"}), 500

    @jwt_required()
    def delete(self, property_id):
        """
        Deletes a property listing.
        Only the owner can delete.
        """
        current_user_id = int(get_jwt_identity())
        prop = Property.query.get(property_id)

        if not prop:
            return jsonify({"msg": "Property not found"}), 404

        if prop.user_id != current_user_id:
            return jsonify({"msg": "You are not authorized to delete this property"}), 403

        try:
            db.session.delete(prop)
            db.session.commit()
            return jsonify({"msg": "Property deleted successfully"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"msg": f"An error occurred: {str(e)}"}), 500

    @jwt_required()
    def get_my_listings(self):
        """
        Fetches properties owned by the currently authenticated Lister.
        Enhanced to include more details for management.
        """
        current_user_id = int(get_jwt_identity())
        properties = Property.query.filter_by(user_id=current_user_id).order_by(Property.created_at.desc()).all()
        
        result = []
        for prop in properties:
            result.append({
                "id": prop.id,
                "title": prop.title,
                "rent_amount": prop.rent_amount,
                "city": prop.city,
                "locality": prop.locality,
                "images": split_property_images(prop.images),
                "room_type": prop.room_type,
                "views": prop.views or 0,
                "created_at": prop.created_at.isoformat()
            })

        return jsonify(result), 200

