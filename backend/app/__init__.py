from flask import Flask
from .extensions import db, migrate, jwt
from flask_cors import CORS
from flask_admin import Admin
def create_app(config_name='development'):
    app = Flask(__name__)
    
    if config_name == 'development':
        from .config.development import Config
        app.config.from_object(Config)
        
        # Allow React to talk to Flask
        CORS(app)
        # Using SQLite for development scaffold
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///dev.db'
    
    # Init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Register blueprints
    from .routes import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')
    # Initialize Admin panel with native dark theme
    app.config['FLASK_ADMIN_SWATCH'] = 'darkly'
    from .models.user_model import User
    from .admin_views import UserModelView
    admin = Admin(app, name='Roommate Finder Admin', template_mode='bootstrap4', url='/admin')
    admin.add_view(UserModelView(User, db.session))
    
    return app
