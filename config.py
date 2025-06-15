import os

# Secret key for session management
SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key-here'

# Database configuration
SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(os.path.abspath(os.path.dirname(__file__)), 'instance', 'bookings.db')
SQLALCHEMY_TRACK_MODIFICATIONS = False

# Admin credentials
ADMIN_USERNAME = 'admin'
ADMIN_PASSWORD = 'securepassword123'  # Change this in production