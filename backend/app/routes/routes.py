from . import api_bp
from app.controllers.auth_controller import register, login

# Auth Routes
api_bp.route('/auth/register', methods=['POST'])(register)
api_bp.route('/auth/login', methods=['POST'])(login)
