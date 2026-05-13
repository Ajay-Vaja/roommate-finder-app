"""
This file defines all the 'Waiters' (Routes) for the app. 
It connects the URLs (like /login) to the correct 'Chefs' (Controllers) 
that handle the work.
"""

from flask_jwt_extended import jwt_required
from . import api_bp

# Import the Controllers (The Chefs)
from app.controllers.auth_controller import (
    register, verify_otp, login, get_me, forgot_password, reset_password, refresh
)
from app.controllers.user_controller import get_all_users, delete_user
from app.controllers.profile_controller import (
    complete_profile, get_onboarding_data, get_profile, update_profile, get_public_profile
)
from app.controllers.admin_controller import get_notifications, mark_read, mark_all_read
from app.controllers.property_controller import PropertyController
from app.controllers.visit_controller import VisitRequestController
from app.controllers.saved_property_controller import toggle_save_property, get_saved_properties

# ==========================================
# AUTHENTICATION (Login & Signup)
# ==========================================

# Create a new account
api_bp.route('/auth/register', methods=['POST'])(register)

# Confirm email using the code sent
api_bp.route('/auth/verify-otp', methods=['POST'])(verify_otp)

# Login to get a security token
api_bp.route('/auth/login', methods=['POST'])(login)

# Get details of the logged-in user
api_bp.route('/auth/me', methods=['GET'])(get_me)

# Ask for a password reset email
api_bp.route('/auth/forgot-password', methods=['POST'])(forgot_password)

# Set a new password using the reset code
api_bp.route('/auth/reset-password', methods=['POST'])(reset_password)

# Get a fresh token using a refresh token
api_bp.route('/auth/refresh', methods=['POST'])(refresh)


# ==========================================
# USER & PROFILE (Personal Info)
# ==========================================

# Get the full profile of the logged-in user
api_bp.route('/user/profile', methods=['GET'])(get_profile)

# View someone else's public profile
api_bp.route('/user/profile/<int:user_id>', methods=['GET'])(get_public_profile)

# Update your own profile details
api_bp.route('/user/profile/update', methods=['PUT'])(update_profile)

# Save onboarding choices (lifestyle, habits, etc.)
api_bp.route('/user/complete-profile', methods=['POST'])(complete_profile)

# Get choices for onboarding (tags, cities, etc.)
api_bp.route('/user/onboarding-data', methods=['GET'])(get_onboarding_data)


# ==========================================
# ADMIN (Management)
# ==========================================

# See all users (Admin only)
api_bp.route('/admin/users', methods=['GET'])(get_all_users)

# Delete a user (Admin only)
api_bp.route('/admin/users/<int:user_id>', methods=['DELETE'])(delete_user)
 
# View admin notifications
api_bp.route('/admin/notifications', methods=['GET'])(get_notifications)

# Mark one notification as seen
api_bp.route('/admin/notifications/<int:notification_id>/read', methods=['PUT'])(mark_read)

# Mark all notifications as seen
api_bp.route('/admin/notifications/mark-all-read', methods=['PUT'])(mark_all_read)


# ==========================================
# PROPERTIES (Rooms & Flats)
# ==========================================

# We use a 'Controller Object' to handle property actions
property_view = PropertyController.as_view('property_api')

# Post a new property
api_bp.route('/properties', methods=['POST'])(property_view)

# Search all properties
api_bp.route('/properties', methods=['GET'])(property_view)

# View details of a specific property
api_bp.route('/properties/<int:property_id>', methods=['GET'])(property_view)

# View properties listed by you
api_bp.route('/user/properties', methods=['GET'])(PropertyController().get_my_listings)

# Bookmark/Like a property
api_bp.route('/properties/<int:property_id>/save', methods=['POST'])(toggle_save_property)

# Get all bookmarked properties
api_bp.route('/user/saved-properties', methods=['GET'])(get_saved_properties)


# ==========================================
# VISITS (Meeting Requests)
# ==========================================

# We use a 'Controller Object' to handle visit requests
visit_view = VisitRequestController.as_view('visit_api')

# Request to visit a property (Seeker)
api_bp.route('/visits', methods=['POST'])(visit_view)

# View all your visit requests
api_bp.route('/visits', methods=['GET'])(visit_view)

# Accept or Reject a visit request (Lister)
api_bp.route('/visits/<int:request_id>', methods=['PATCH'])(visit_view)
