from . import api_bp
from app.controllers.auth_controller import register, login, get_me

# Auth Routes
api_bp.route('/auth/register', methods=['POST'])(register)
api_bp.route('/auth/login', methods=['POST'])(login)
api_bp.route('/auth/me',methods = ['GET'])(get_me)

from app.controllers.user_controller import get_all_users

# Admin Routes
api_bp.route('/admin/users', methods=['GET'])(get_all_users)
