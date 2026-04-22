from app.models.user_model import User
from app.extensions import db
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash

def register_user(data):
    if User.query.filter_by(email=data['email']).first():
        return {"msg": "User already exists"}, 409
        
    try:
        new_user = User(
            name=data.get('name', ''),
            email=data['email'],
            password_hash=generate_password_hash(data['password'])
        )
        db.session.add(new_user)
        db.session.commit()
        return {"msg": "User created successfully"}, 201
    except Exception as e:
        db.session.rollback()
        return {"msg": "Internal server error"}, 500

def authenticate_user(email, password):
    user = User.query.filter_by(email=email).first()
    
    if not user or not check_password_hash(user.password_hash, password):
        return {"msg": "Invalid credentials"}, 401
        
    access_token = create_access_token(identity=str(user.id))
    return {
        "access_token": access_token, 
        "user": {"id": user.id, "name": user.name, "email": user.email}
    }, 200
