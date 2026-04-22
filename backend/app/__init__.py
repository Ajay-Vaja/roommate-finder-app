from flask import Flask
from .extensions import db, migrate, jwt

def create_app(config_name='development'):
    app = Flask(__name__)
    
    if config_name == 'development':
        from .config.development import Config
        app.config.from_object(Config)
        # Using SQLite for development scaffold
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///dev.db'
    
    # Init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Register blueprints
    from .routes import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')
    
    return app
