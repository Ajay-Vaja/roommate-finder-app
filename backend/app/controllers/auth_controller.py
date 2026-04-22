from flask import request, jsonify
from app.services.auth_service import register_user, authenticate_user

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
