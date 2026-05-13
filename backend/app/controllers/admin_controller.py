from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user_model import User
from app.services.notification_service import (
    get_admin_notifications, 
    mark_notification_as_read, 
    mark_all_notifications_as_read
)

def check_admin(user_id):
    user = User.query.get(user_id)
    return user and user.role == 'Admin'

@jwt_required()
def get_notifications():
    current_user_id = get_jwt_identity()
    if not check_admin(current_user_id):
        return jsonify({"msg": "Admin access required"}), 403
        
    notifications = get_admin_notifications()
    return jsonify(notifications), 200

@jwt_required()
def mark_read(notification_id):
    current_user_id = get_jwt_identity()
    if not check_admin(current_user_id):
        return jsonify({"msg": "Admin access required"}), 403
        
    mark_notification_as_read(notification_id)
    return jsonify({"msg": "Notification marked as read"}), 200

@jwt_required()
def mark_all_read():
    current_user_id = get_jwt_identity()
    if not check_admin(current_user_id):
        return jsonify({"msg": "Admin access required"}), 403
        
    mark_all_notifications_as_read()
    return jsonify({"msg": "All notifications marked as read"}), 200
