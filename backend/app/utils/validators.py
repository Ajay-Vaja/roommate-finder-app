import re

def validate_password(password):
    """
    Validates password strength:
    - At least 8 characters
    - Contains at least one symbol (special character)
    - Not in a list of common passwords
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long."
    
    # Check for symbols
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False, "Password must contain at least one special character."
    
    # Common passwords to check against
    common_passwords = [
        "password", "password123", "12345678", "123456789", 
        "qwertyuiop", "admin123", "welcome123", "roommate123"
    ]
    
    if password.lower() in common_passwords:
        return False, "This password is too common. Please choose a stronger one."
    
    return True, ""
