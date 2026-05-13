from flask import Flask
from flask_cors import CORS
from flask_admin import Admin

# Import our setup tools (Database, Migrations, Security, etc.)
from .extensions import db, migrate, jwt, mail

# Import application components (Routes, Models, and Admin Views)
from .config.development import Config
from .routes import api_bp
from .models.user_model import User
from .admin_views import UserModelView

def create_app(config_name='development'):
    """
    This function is the 'Main Creator' for our backend app. 
    It sets up the database, links all the features together, and gets the server ready to run.
    """
    # Create the main Flask application object
    app = Flask(__name__)
    
    # Configure the app settings (like passwords and database links)
    if config_name == 'development':
        app.config.from_object(Config)
        
        # Allow our React frontend to talk to this backend
        CORS(app)
        
        # Set where our development database file is stored
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///dev.db'
    
    # Connect our tools (Database, JWT security, Mail, etc.) to the app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mail.init_app(app)
    
    # Register our API routes so the frontend knows which URLs to call
    app.register_blueprint(api_bp, url_prefix='/api')
    
    # Setup the Admin Dashboard with a nice Dark Theme
    app.config['FLASK_ADMIN_SWATCH'] = 'darkly'
    admin = Admin(app, name='FindMyStay Admin', template_mode='bootstrap4', url='/admin')
    
    # Add a special management page for 'Users' in the Admin panel
    admin.add_view(UserModelView(User, db.session))
    
    # Return the finished app so it can be started
    return app
