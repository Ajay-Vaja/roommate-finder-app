import sys
from app import create_app, db
from app.models.user_model import User
from werkzeug.security import generate_password_hash

def create_admin_account(email, password, name="System Admin"):
    app = create_app()
    with app.app_context():
        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            print(f"Error: User with email {email} already exists.")
            return

        # Create new Admin user
        new_admin = User(
            email=email,
            password_hash=generate_password_hash(password),
            name=name,
            gender='Other', # Required field
            user_type='Seeker', # Default type
            role='Admin',
            is_profile_complete=True  # Admins don't need onboarding
        )

        try:
            db.session.add(new_admin)
            db.session.commit()
            print(f"SUCCESS: Admin account created for {email}")
        except Exception as e:
            db.session.rollback()
            print(f"FAILED: Could not create admin. Error: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python create_admin.py <email> <password> [name]")
    else:
        email = sys.argv[1]
        password = sys.argv[2]
        name = sys.argv[3] if len(sys.argv) > 3 else "System Admin"
        create_admin_account(email, password, name)
