import random
import string
from datetime import datetime, timedelta
from flask_mail import Message
from app.extensions import mail, db
from app.models.user_model import OTP

def generate_otp(length=6):
    """
    Generates a random numerical string of the specified length.
    Default length is 6 digits.
    """
    return ''.join(random.choices(string.digits, k=length))

def send_otp_email(email, otp_code):
    """
    Constructs and sends a premium HTML email containing the registration OTP.
    Includes a fallback plain text version for older email clients.
    """
    msg = Message(
        'Verify Your FindMyStay Account',
        recipients=[email]
    )
    
    # Premium HTML Template for branding consistency
    msg.html = f"""
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8b5cf6; margin: 0; font-size: 28px;">FindMyStay</h1>
            <p style="color: #64748b; font-size: 16px; margin-top: 5px;">Find your perfect living partner</p>
        </div>
        
        <div style="padding: 20px; background-color: #f8fafc; border-radius: 12px; text-align: center;">
            <h2 style="color: #1e293b; margin-top: 0;">Verify Your Email</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                Thank you for joining us! Please use the following One-Time Password (OTP) to complete your registration.
            </p>
            
            <div style="margin: 30px 0; padding: 15px; background: linear-gradient(135deg, #8b5cf6, #3b82f6); border-radius: 12px; display: inline-block;">
                <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #ffffff; font-family: monospace;">{otp_code}</span>
            </div>
            
            <p style="color: #94a3b8; font-size: 14px; margin-bottom: 0;">
                This code will expire in <strong>10 minutes</strong>.
            </p>
        </div>
        
        <div style="margin-top: 30px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px;">
            <p style="color: #94a3b8; font-size: 12px; line-height: 1.5;">
                If you didn't request this code, you can safely ignore this email.<br>
                &copy; 2026 FindMyStay. All rights reserved.
            </p>
        </div>
    </div>
    """
    
    # Fallback plain text version
    msg.body = f"Your FindMyStay verification code is: {otp_code}. It expires in 10 minutes."
    
    try:
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

def send_forgot_password_email(email, otp_code):
    """
    Sends a specialized HTML email for the password reset flow.
    """
    msg = Message(
        'Reset Your FindMyStay Password',
        recipients=[email]
    )
    
    # Reusing the premium branding for the reset flow
    msg.html = f"""
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8b5cf6; margin: 0; font-size: 28px;">FindMyStay</h1>
            <p style="color: #64748b; font-size: 16px; margin-top: 5px;">Find your perfect living partner</p>
        </div>
        
        <div style="padding: 20px; background-color: #f8fafc; border-radius: 12px; text-align: center;">
            <h2 style="color: #1e293b; margin-top: 0;">Reset Your Password</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password. Please use the following One-Time Password (OTP) to proceed.
            </p>
            
            <div style="margin: 30px 0; padding: 15px; background: linear-gradient(135deg, #8b5cf6, #3b82f6); border-radius: 12px; display: inline-block;">
                <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #ffffff; font-family: monospace;">{otp_code}</span>
            </div>
            
            <p style="color: #94a3b8; font-size: 14px; margin-bottom: 0;">
                This code will expire in <strong>10 minutes</strong>.
            </p>
        </div>
        
        <div style="margin-top: 30px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px;">
            <p style="color: #94a3b8; font-size: 12px; line-height: 1.5;">
                If you didn't request a password reset, you can safely ignore this email.<br>
                &copy; 2026 FindMyStay. All rights reserved.
            </p>
        </div>
    </div>
    """
    
    # Fallback plain text version
    msg.body = f"Your FindMyStay password reset code is: {otp_code}. It expires in 10 minutes."
    
    try:
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

def save_otp(email, otp_code, user_data):
    """
    Persists the OTP code and associated user data in the database.
    Sets a 10-minute expiration timer and cleans up old codes for the same email.
    """
    # Clean up old OTP records to maintain database efficiency
    OTP.query.filter_by(email=email).delete()
    
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    new_otp = OTP()
    new_otp.email = email
    new_otp.otp_code = otp_code
    new_otp.user_data = user_data
    new_otp.expires_at = expires_at
    
    db.session.add(new_otp)
    db.session.commit()

def verify_otp_logic(email, otp_code):
    """
    Validates a provided OTP against the database record.
    Returns (True, user_data) if valid, or (False, error_msg) if invalid or expired.
    Automatically deletes the record after successful verification (one-time use).
    """
    otp_record = OTP.query.filter_by(email=email, otp_code=otp_code).first()
    
    if not otp_record:
        return False, "Invalid OTP code"
    
    # Check if the code has passed its 10-minute lifespan
    if otp_record.is_expired():
        db.session.delete(otp_record)
        db.session.commit()
        return False, "OTP has expired"
    
    # Success: capture user data, then delete the code to prevent reuse
    user_data = otp_record.user_data
    db.session.delete(otp_record)
    db.session.commit()
    
    return True, user_data
