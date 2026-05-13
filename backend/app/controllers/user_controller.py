from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user_model import User
from app.models.profile_model import Profile
from app.models.property_model import Property
from app.extensions import db

@jwt_required()
def get_all_users():
    """
    Admin-only endpoint to retrieve all users in the system.
    Provides detailed profile, location, and status information for the admin dashboard.
    """
    current_user_id = get_jwt_identity()
    requester = User.query.get(current_user_id)
    
    # Security Check: Only allow Admins to access the user list
    if not requester or requester.role != 'Admin':
        return jsonify({'message': 'Unauthorized: Admin access required'}), 403
        
    users = User.query.all()
    user_data = []
    
    for user in users:
        # Construct base user information
        data = {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'age': user.age,
            'gender': user.gender,
            'occupation': user.occupation,
            'user_type': user.user_type,
            'role': user.role,
            'status': user.status,
            'last_login': user.last_login.isoformat() + 'Z' if user.last_login else None,
            'created_at': user.created_at.isoformat() + 'Z' if user.created_at else None,
            'is_profile_complete': user.is_profile_complete or (user.profile is not None),
            'is_verified': user.is_verified,
            'profile_pic': user.profile.profile_pic if user.profile else None
        }
        
        # Determine consistent location string based on available data
        location = "Not specified"
        
        # Priority 1: Check Profile (Preferred City)
        if user.profile and user.profile.preferred_city:
            location = user.profile.preferred_city
        
        # Priority 2: Check Properties (City) - common for Listers
        if location == "Not specified" and user.properties:
            # Get the city from the first property listed
            location = user.properties[0].city
            
        data['location'] = location

        # Include detailed profile if it exists (lifestyle habits, budget, etc.)
        if user.profile:
            data['profile'] = {
                'current_city': user.profile.preferred_city,
                'preferred_areas': user.profile.preferred_areas,
                'sleep_schedule': user.profile.sleep_schedule,
                'cleanliness': user.profile.cleanliness,
                'guests_policy': user.profile.guests_policy,
                'smoking': user.profile.smoking,
                'drinking': user.profile.drinking,
                'pets': user.profile.pets,
                'food_habits': user.profile.food_habits,
                'noise_level': user.profile.noise_level,
                'work_from_home': user.profile.work_from_home,
                'budget_range': f"₹{user.profile.min_budget} - ₹{user.profile.max_budget}" if user.profile.min_budget else "Not specified",
                'room_type': user.profile.room_type_pref,
                'amenities': getattr(user.profile, 'amenities', None),
                'move_in_date': user.profile.move_in_date.isoformat() if user.profile.move_in_date else None
            }
        
        user_data.append(data)
        
    return jsonify(user_data), 200

@jwt_required()
def delete_user(user_id):
    """
    Admin-only endpoint to permanently delete a user from the system.
    This also removes all associated profiles and properties (cascading).
    """
    current_user_id = get_jwt_identity()
    requester = User.query.get(current_user_id)
    
    # Security Check: Only allow Admins to delete users
    if not requester or requester.role != 'Admin':
        return jsonify({'message': 'Unauthorized: Admin access required'}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
        
    try:
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error deleting user: {str(e)}'}), 500
