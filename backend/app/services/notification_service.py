from app.models.notification_model import Notification
from app.extensions import db

def create_notification(user_id, message, n_type):
    """
    Creates a new notification for the admin.
    """
    try:
        new_notification = Notification(
            user_id=user_id,
            message=message,
            type=n_type
        )
        db.session.add(new_notification)
        db.session.commit()
        return True
    except Exception as e:
        db.session.rollback()
        print(f"Error creating notification: {e}")
        return False

def get_admin_notifications():
    """
    Fetches all notifications for the admin panel.
    """
    notifications = Notification.query.order_by(Notification.created_at.desc()).all()
    return [n.to_dict() for n in notifications]

def mark_notification_as_read(notification_id):
    """
    Marks a specific notification as read.
    """
    notification = Notification.query.get(notification_id)
    if notification:
        notification.is_read = True
        db.session.commit()
        return True
    return False

def mark_all_notifications_as_read():
    """
    Marks all notifications as read.
    """
    Notification.query.filter_by(is_read=False).update({Notification.is_read: True})
    db.session.commit()
    return True
