from flask import jsonify
from flask_jwt_extended import jwt_required
from app.models.user_model import User

@jwt_required()
def get_all_users():
    users = User.query.all()
    user_data = []
    for user in users:
        user_data.append({
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'age': user.age,
            'gender': user.gender,
            'occupation': user.occpation,
            'budget': user.budget,
            'role': 'User',
            'status': 'Active'
        })
    return jsonify(user_data), 200
