from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from datetime import datetime, date
import os

# Initialize Flask app
app = Flask(__name__)
app.config.from_pyfile('config.py')

# Database setup
db = SQLAlchemy(app)


# Database models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)


class BookedDate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, unique=True, nullable=False)
    notes = db.Column(db.String(200))


# Create database tables
with app.app_context():
    db.create_all()


# Admin login required decorator
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)

    return decorated_function


# Routes
@app.route('/')
def index():

    return render_template('index.html')


@app.route('/calendar')
def calendar():
    # Get all booked dates
    booked_dates = BookedDate.query.all()
    booked_dates_str = [d.date.strftime('%Y-%m-%d') for d in booked_dates]
    return render_template('calendar.html', booked_dates=booked_dates_str)


@app.route('/admin')
@admin_required
def admin():
    booked_dates = BookedDate.query.order_by(BookedDate.date.asc()).all()
    return render_template('admin.html', booked_dates=booked_dates)


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        user = User.query.filter_by(username=username).first()

        if user and check_password_hash(user.password_hash, password):
            session['logged_in'] = True
            return redirect(url_for('admin'))
        else:
            flash('Invalid credentials', 'error')
    return render_template('login.html')


@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    return redirect(url_for('login'))


@app.route('/api/book-date', methods=['POST'])
@admin_required
def book_date():
    try:
        date_str = request.json.get('date')
        notes = request.json.get('notes', '')

        if not date_str:
            return jsonify({'success': False, 'error': 'Date is required'}), 400

        date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()

        # Check if date is already booked
        existing = BookedDate.query.filter_by(date=date_obj).first()
        if existing:
            return jsonify({'success': False, 'error': 'Date already booked'}), 400

        # Add new booked date
        new_date = BookedDate(date=date_obj, notes=notes)
        db.session.add(new_date)
        db.session.commit()

        return jsonify({'success': True})
    except ValueError:
        return jsonify({'success': False, 'error': 'Invalid date format'}), 400


@app.route('/api/unbook-date', methods=['POST'])
@admin_required
def unbook_date():
    try:
        date_str = request.json.get('date')

        if not date_str:
            return jsonify({'success': False, 'error': 'Date is required'}), 400

        date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()

        # Find and remove the booked date
        booked_date = BookedDate.query.filter_by(date=date_obj).first()
        if booked_date:
            db.session.delete(booked_date)
            db.session.commit()

        return jsonify({'success': True})
    except ValueError:
        return jsonify({'success': False, 'error': 'Invalid date format'}), 400


# Initialize admin user if not exists
def create_admin_user():
    with app.app_context():
        if not User.query.first():
            admin_user = User(
                username=app.config['ADMIN_USERNAME'],
                password_hash=generate_password_hash(app.config['ADMIN_PASSWORD'])
            )
            db.session.add(admin_user)
            db.session.commit()
            print("Admin user created")


@app.route('/api/booked-dates')
def get_booked_dates():
    booked_dates = BookedDate.query.all()
    dates = [date.date.strftime('%Y-%m-%d') for date in booked_dates]
    return jsonify({'booked_dates': dates})


# Add these routes to your Flask app

@app.route('/api/add-admin', methods=['POST'])
@admin_required
def add_admin():
    username = request.json.get('username')
    password = request.json.get('password')

    if not username or not password:
        return jsonify({'success': False, 'error': 'Username and password are required'}), 400

    # Check if username already exists
    if User.query.filter_by(username=username).first():
        return jsonify({'success': False, 'error': 'Username already exists'}), 400

    # Create new admin user
    new_user = User(
        username=username,
        password_hash=generate_password_hash(password)
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'success': True})


@app.route('/api/change-password', methods=['POST'])
@admin_required
def change_password():
    username = request.json.get('username')
    current_password = request.json.get('current_password')
    new_password = request.json.get('new_password')

    if not username or not current_password or not new_password:
        return jsonify({'success': False, 'error': 'All fields are required'}), 400

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'success': False, 'error': 'User not found'}), 404

    if not check_password_hash(user.password_hash, current_password):
        return jsonify({'success': False, 'error': 'Current password is incorrect'}), 401

    # Update password
    user.password_hash = generate_password_hash(new_password)
    db.session.commit()

    return jsonify({'success': True})


if __name__ == '__main__':
    create_admin_user()
    app.run(debug=True)
