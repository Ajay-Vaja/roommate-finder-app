"""
This controller handles everything related to a user's Persona and Profile.
It manages onboarding (first setup), viewing profiles, and updating 
lifestyle habits or property details.
"""

from datetime import datetime
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

# Project Imports
from app.extensions import db
from app.models.user_model import User
from app.models.profile_model import Profile
from app.models.property_model import Property
from app.services.notification_service import create_notification

# ==========================================
# ONBOARDING (First Time Setup)
# ==========================================

@jwt_required()
def complete_profile():
    """
    Saves all the choices a user makes during their first setup (Onboarding).
    This includes lifestyle habits, seeker needs, and property listings.
    """
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    data = request.get_json()
    
    try:
        # 1. Update or Create the Profile record
        profile = Profile.query.filter_by(user_id=user.id).first()
        if not profile:
            profile = Profile(user_id=user.id)
            db.session.add(profile)
        
        # Save lifestyle habits (Sleep, Cleanliness, etc.)
        lifestyle = data.get('lifestyle', {})
        profile.sleep_schedule = lifestyle.get('sleep_schedule')
        profile.cleanliness = lifestyle.get('cleanliness')
        profile.guests_policy = lifestyle.get('guests_policy')
        profile.smoking = lifestyle.get('smoking')
        profile.drinking = lifestyle.get('drinking')
        profile.pets = lifestyle.get('pets')
        profile.food_habits = lifestyle.get('food_habits')
        profile.noise_level = lifestyle.get('noise_level')
        profile.work_from_home = lifestyle.get('work_from_home')
        profile.occupancy_count = lifestyle.get('occupancy_count', 1)
        
        # Save Seeker-specific needs if the user is looking for a room
        if user.user_type == 'Seeker':
            reqs = data.get('requirements', {})
            profile.preferred_city = reqs.get('preferred_city')
            profile.min_budget = reqs.get('min_budget')
            profile.max_budget = reqs.get('max_budget')
            profile.preferred_areas = reqs.get('preferred_areas')
            profile.room_type_pref = reqs.get('room_type_pref')
            move_in_str = reqs.get('move_in_date')
            if move_in_str:
                profile.move_in_date = datetime.fromisoformat(move_in_str.replace('Z', '+00:00'))
        
        # 2. Save Property details if the user is a Lister (Owner)
        if user.user_type == 'Lister' and 'property' in data:
            prop_data = data['property']
            property_obj = Property.query.filter_by(user_id=user.id).first()
            if not property_obj:
                property_obj = Property(user_id=user.id)
                db.session.add(property_obj)
            
            property_obj.title = prop_data.get('title', '')
            property_obj.description = prop_data.get('description', '')
            property_obj.address = prop_data.get('address', '')
            property_obj.city = prop_data.get('city', '')
            property_obj.locality = prop_data.get('locality', '')
            property_obj.rent_amount = prop_data.get('rent_amount', 0)
            property_obj.room_type = prop_data.get('room_type', 'Private')
            property_obj.amenities = prop_data.get('amenities', '')
            
        # 3. Mark the profile as finished
        user.is_profile_complete = True
        db.session.commit()

        # Send a notification to the Admin
        create_notification(user.id, f"User {user.name} has completed their onboarding profile.", "onboarding")

        return jsonify({"msg": "Profile completed successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": str(e)}), 500

@jwt_required()
def get_onboarding_data():
    """
    Fetches the data needed for the onboarding screen so the user 
    can see what they have already filled in.
    """
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
    
    profile = Profile.query.filter_by(user_id=user.id).first()
    property_obj = Property.query.filter_by(user_id=user.id).first()
    
    data = {
        "user_type": user.user_type,
        "lifestyle": {
            "sleep_schedule": profile.sleep_schedule if profile else "Moderate",
            "cleanliness": profile.cleanliness if profile else "Moderate",
            "guests_policy": profile.guests_policy if profile else "Occasionally",
            "smoking": profile.smoking if profile else "No",
            "drinking": profile.drinking if profile else "No",
            "pets": profile.pets if profile else "No",
            "food_habits": profile.food_habits if profile else "Veg",
            "noise_level": profile.noise_level if profile else "Moderate",
            "work_from_home": profile.work_from_home if profile else "No",
            "occupancy_count": (profile.occupancy_count if (profile and profile.occupancy_count is not None) else 1)
        },
        "requirements": {
            "preferred_city": profile.preferred_city if profile else "",
            "min_budget": profile.min_budget if profile else "",
            "max_budget": profile.max_budget if profile else "",
            "preferred_areas": profile.preferred_areas if profile else "",
            "room_type_pref": profile.room_type_pref if profile else "Private",
            "move_in_date": profile.move_in_date.isoformat() if profile and profile.move_in_date else ""
        },
        "property": {
            "title": property_obj.title if property_obj else "",
            "description": property_obj.description if property_obj else "",
            "address": property_obj.address if property_obj else "",
            "city": property_obj.city if property_obj else "",
            "locality": property_obj.locality if property_obj else "",
            "rent_amount": property_obj.rent_amount if property_obj else "",
            "room_type": property_obj.room_type if property_obj else "Private",
            "amenities": property_obj.amenities if property_obj else ""
        }
    }
    return jsonify(data), 200


# ==========================================
# PROFILE MANAGEMENT (View & Edit)
# ==========================================

@jwt_required()
def get_profile():
    """
    Fetches the full profile details for the main Profile page.
    """
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
    
    profile = Profile.query.filter_by(user_id=user.id).first()
    properties = Property.query.filter_by(user_id=user.id).all()
    
    return jsonify({
        "user": {
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "gender": user.gender,
            "age": user.age,
            "occupation": user.occupation,
            "user_type": user.user_type,
            "role": user.role,
            "is_verified": user.is_verified,
            "is_profile_complete": user.is_profile_complete,
            "profile_pic": profile.profile_pic if profile else None
        },
        "lifestyle": {
            "sleep_schedule": profile.sleep_schedule if profile else "Moderate",
            "cleanliness": profile.cleanliness if profile else "Moderate",
            "guests_policy": profile.guests_policy if profile else "Occasionally",
            "smoking": profile.smoking if profile else "No",
            "drinking": profile.drinking if profile else "No",
            "pets": profile.pets if profile else "No",
            "food_habits": profile.food_habits if profile else "Veg",
            "noise_level": profile.noise_level if profile else "Moderate",
            "work_from_home": profile.work_from_home if profile else "No",
            "occupancy_count": (profile.occupancy_count if (profile and profile.occupancy_count is not None) else 1)
        },
        "requirements": {
            "preferred_city": profile.preferred_city if profile else "",
            "min_budget": profile.min_budget if profile else "",
            "max_budget": profile.max_budget if profile else "",
            "preferred_areas": profile.preferred_areas if profile else "",
            "room_type_pref": profile.room_type_pref if profile else "Private",
            "move_in_date": profile.move_in_date.isoformat() if profile and profile.move_in_date else ""
        } if user.user_type == 'Seeker' else None,
        "properties": [{
            "id": p.id,
            "title": p.title,
            "description": p.description,
            "address": p.address,
            "city": p.city,
            "locality": p.locality,
            "rent_amount": p.rent_amount,
            "room_type": p.room_type,
            "amenities": p.amenities
        } for p in properties] if user.user_type == 'Lister' else []
    }), 200

@jwt_required()
def update_profile():
    """
    Updates the user's personal info and habits.
    Users can update just one field or many at once.
    """
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
        
    data = request.get_json()
    
    try:
        # Update Basic Info
        user_data = data.get('user', {})
        if 'name' in user_data: user.name = user_data['name']
        if 'phone' in user_data: user.phone = user_data['phone']
        if 'occupation' in user_data: user.occupation = user_data['occupation']
        if 'age' in user_data: user.age = user_data['age']
        
        # Update Lifestyle Habits
        profile = Profile.query.filter_by(user_id=user.id).first()
        if not profile:
            profile = Profile(user_id=user.id)
            db.session.add(profile)
            
        if 'profile_pic' in data:
            profile.profile_pic = data['profile_pic']

        lifestyle = data.get('lifestyle', {})
        if 'sleep_schedule' in lifestyle: profile.sleep_schedule = lifestyle['sleep_schedule']
        if 'cleanliness' in lifestyle: profile.cleanliness = lifestyle['cleanliness']
        if 'guests_policy' in lifestyle: profile.guests_policy = lifestyle['guests_policy']
        if 'smoking' in lifestyle: profile.smoking = lifestyle['smoking']
        if 'drinking' in lifestyle: profile.drinking = lifestyle['drinking']
        if 'pets' in lifestyle: profile.pets = lifestyle['pets']
        if 'food_habits' in lifestyle: profile.food_habits = lifestyle['food_habits']
        if 'noise_level' in lifestyle: profile.noise_level = lifestyle['noise_level']
        if 'work_from_home' in lifestyle: profile.work_from_home = lifestyle['work_from_home']
        if 'occupancy_count' in lifestyle: profile.occupancy_count = lifestyle['occupancy_count']
        
        # Update Seeker Needs (if applicable)
        if user.user_type == 'Seeker' and 'requirements' in data:
            reqs = data['requirements']
            if 'preferred_city' in reqs: profile.preferred_city = reqs['preferred_city']
            if 'min_budget' in reqs: profile.min_budget = reqs['min_budget']
            if 'max_budget' in reqs: profile.max_budget = reqs['max_budget']
            if 'preferred_areas' in reqs: profile.preferred_areas = reqs['preferred_areas']
            if 'room_type_pref' in reqs: profile.room_type_pref = reqs['room_type_pref']
            if 'move_in_date' in reqs and reqs['move_in_date']:
                try:
                    profile.move_in_date = datetime.fromisoformat(reqs['move_in_date'].replace('Z', '+00:00'))
                except ValueError:
                    pass

        db.session.commit()

        # Notify Admin if photo was updated
        if 'profile_pic' in data:
            create_notification(user.id, f"User {user.name} has updated their profile photo.", "photo_update")

        return jsonify({"msg": "Profile updated successfully"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": str(e)}), 500

@jwt_required()
def get_public_profile(user_id):
    """
    Shows a limited version of a profile to other users.
    Useful when someone wants to see who the Host is.
    """
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
    
    profile = Profile.query.filter_by(user_id=user.id).first()
    property_obj = Property.query.filter_by(user_id=user.id).first()
    
    return jsonify({
        "user": {
            "name": user.name,
            "gender": user.gender,
            "age": user.age,
            "occupation": user.occupation,
            "user_type": user.user_type,
            "is_verified": user.is_verified,
            "profile_pic": profile.profile_pic if profile else None
        },
        "lifestyle": {
            "sleep_schedule": profile.sleep_schedule if profile else "Moderate",
            "cleanliness": profile.cleanliness if profile else "Moderate",
            "guests_policy": profile.guests_policy if profile else "Occasionally",
            "smoking": profile.smoking if profile else "No",
            "drinking": profile.drinking if profile else "No",
            "pets": profile.pets if profile else "No",
            "food_habits": profile.food_habits if profile else "Veg",
            "noise_level": profile.noise_level if profile else "Moderate",
            "work_from_home": profile.work_from_home if profile else "No",
            "occupancy_count": (profile.occupancy_count if (profile and profile.occupancy_count is not None) else 1)
        },
        "preferences": {
            "city": profile.preferred_city if profile else "Any",
            "budget": f"₹{profile.min_budget} - ₹{profile.max_budget}" if profile and profile.min_budget else "Flexible",
            "areas": profile.preferred_areas if profile else "Not specified",
            "room_type": profile.room_type_pref if profile else "Any"
        } if user.user_type == 'Seeker' else None,
        "property": {
            "id": property_obj.id,
            "title": property_obj.title,
            "description": property_obj.description,
            "city": property_obj.city,
            "locality": property_obj.locality,
            "rent_amount": property_obj.rent_amount,
            "room_type": property_obj.room_type,
            "amenities": property_obj.amenities
        } if user.user_type == 'Lister' and property_obj else None
    }), 200
