from flask_admin.contrib.sqla import ModelView

class UserModelView(ModelView):
    # What columns to show in the main list
    column_list = ('id', 'name', 'email', 'role', 'status', 'last_login', 'created_at')
    
    # Add a search bar that searches by name and email!
    column_searchable_list = ['name', 'email']
    
    # Add a filter sidebar
    column_filters = ['role', 'status', 'age']
    
    # DO NOT show the password_hash when editing or creating a user
    form_excluded_columns = ['password_hash']
    
    # Give the page a nice title
    name = "Registered Users"
