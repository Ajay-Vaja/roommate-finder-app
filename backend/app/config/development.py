import os

class Config:
    """
    This class stores all the 'Secret Settings' for our app while developing.
    It helps the app handle security, database rules, and email settings.
    """
    
    # Keys used to lock and unlock secure data (like user logins)
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-123'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key-123'

    # Helps the database run faster by not tracking every tiny change
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Email Settings: Used for sending things like OTP codes to users
    MAIL_SERVER = os.environ.get('MAIL_SERVER') or 'smtp.gmail.com'
    MAIL_PORT = int(os.environ.get('MAIL_PORT') or 587)
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'true').lower() == 'true'
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME') or 'your-email@gmail.com'
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD') or 'your-app-password'
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER') or 'your-email@gmail.com'
