from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import User, Property, SavedProperty

@jwt_required()
def toggle_save_property(property_id):
    """
    Toggles the saved status of a property for the current user.
    Only users with role 'Seeker' can save properties.
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"msg": "User not found"}), 404
        
    if user.user_type != 'Seeker':
        return jsonify({"msg": "Only seekers can save properties"}), 403

    prop = Property.query.get(property_id)
    if not prop:
        return jsonify({"msg": "Property not found"}), 404

    # Check if already saved
    existing = SavedProperty.query.filter_by(user_id=user_id, property_id=property_id).first()
    
    if existing:
        db.session.delete(existing)
        db.session.commit()
        return jsonify({"msg": "Property unsaved", "saved": False}), 200
    else:
        new_save = SavedProperty(user_id=user_id, property_id=property_id)
        db.session.add(new_save)
        db.session.commit()
        return jsonify({"msg": "Property saved", "saved": True}), 201

import re

def split_property_images(images_str):
    if not images_str:
        return []
    if '|SPLIT|' in images_str:
        return images_str.split('|SPLIT|')
    return re.split(r',(?=data:image\/)', images_str)

@jwt_required()
def get_saved_properties():
    """
    Fetches all properties saved by the current user.
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"msg": "User not found"}), 404

    saved_items = SavedProperty.query.filter_by(user_id=user_id).all()
    
    properties = []
    for item in saved_items:
        p = item.property
        properties.append({
            "id": p.id,
            "title": p.title,
            "address": p.address,
            "city": p.city,
            "locality": p.locality,
            "rent_amount": p.rent_amount,
            "room_type": p.room_type,
            "images": split_property_images(p.images),
            "views": p.views,
            "rating": p.rating,
            "saved_at": item.created_at.isoformat()
        })
        
    return jsonify(properties), 200
