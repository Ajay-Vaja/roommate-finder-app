from app.models.user_model import User
from app.extensions import db
from flask_jwt_extended import create_access_token

def register_user(data):
    if User.query.filter_by(email=data['email']).first():
        return {"msg": "User already exists"}, 409
        
    try:
        new_user = User(
            name=data.get('name', ''),
            email=data['email'],
            age = data.get('age'),
            occpation = data.get('occupation'),
            budget = data.get('budget')

        )
        new_user.set_password(data['password'])
        db.session.add(new_user)
        db.session.commit()
        return {'msg': 'User added successfully'}, 201
    except Exception as e:
        db.session.rollback()
        return {"msg": "Internal server error"}, 500

def authenticate_user(email, password):
    user = User.query.filter_by(email=email).first()
    
    if not user or not user.check_password(password):
        return {"msg": "Invalid credentials"}, 401
        
    access_token = create_access_token(identity=str(user.id))
    return {
        "access_token": access_token, 
        "user": {"id": user.id, "name": user.name, "email": user.email}
    }, 200


def get_user_by_id(user_id):
    user = User.query.get(user_id)
    if not user:
        return {'msg': "User Not found"},404

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "created_at": user.created_at
    },200


    
