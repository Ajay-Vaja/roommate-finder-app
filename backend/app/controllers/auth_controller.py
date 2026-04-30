from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.auth_service import register_user, authenticate_user, get_user_by_id

def register():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"msg": "Missing required fields"}), 400
        
    result, status_code = register_user(data)
    return jsonify(result), status_code

def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"msg": "Missing email or password"}), 400
        
    result, status_code = authenticate_user(data.get('email'), data.get('password'))
    return jsonify(result), status_code

@jwt_required()
def get_me():
    # Because of @jwt_required, Flask will automatically block anyone without a token!
    # get_jwt_identity() grabs the ID from the token.

    current_user_id = get_jwt_identity()

    result, status_code = get_user_by_id(current_user_id)
    return jsonify(result), status_code