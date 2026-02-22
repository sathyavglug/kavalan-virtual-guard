from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import bcrypt
from database import get_db_connection

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['full_name', 'email', 'phone', 'password']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({
                    'success': False,
                    'message': f'{field} is required'
                }), 400

        full_name = data['full_name'].strip()
        email = data['email'].strip().lower()
        phone = data['phone'].strip()
        password = data['password']
        date_of_birth = data.get('date_of_birth')
        region = data.get('region', '')
        preferred_language = data.get('preferred_language', 'English')

        # Validate email format
        if '@' not in email or '.' not in email:
            return jsonify({
                'success': False,
                'message': 'Invalid email format'
            }), 400

        # Validate phone
        if len(phone) < 10:
            return jsonify({
                'success': False,
                'message': 'Phone number must be at least 10 digits'
            }), 400

        # Validate password strength
        if len(password) < 6:
            return jsonify({
                'success': False,
                'message': 'Password must be at least 6 characters'
            }), 400

        conn = get_db_connection()
        if not conn:
            return jsonify({
                'success': False,
                'message': 'Database connection failed'
            }), 500

        cursor = conn.cursor(dictionary=True)

        # Check if email already exists
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({
                'success': False,
                'message': 'Email already registered. Please login instead.'
            }), 409

        # Check if phone already exists
        cursor.execute("SELECT id FROM users WHERE phone = %s", (phone,))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({
                'success': False,
                'message': 'Phone number already registered. Please login instead.'
            }), 409

        # Hash the password
        password_hash = bcrypt.hashpw(
            password.encode('utf-8'),
            bcrypt.gensalt()
        ).decode('utf-8')

        # Insert user
        cursor.execute("""
            INSERT INTO users (full_name, email, phone, password_hash,
                             date_of_birth, region, preferred_language)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (full_name, email, phone, password_hash,
              date_of_birth, region, preferred_language))

        conn.commit()
        user_id = cursor.lastrowid

        # Create JWT token
        access_token = create_access_token(identity=str(user_id))

        cursor.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': 'Registration successful! Welcome to KAVALAN 🛡️',
            'token': access_token,
            'user': {
                'id': user_id,
                'full_name': full_name,
                'email': email,
                'phone': phone,
                'preferred_language': preferred_language
            }
        }), 201

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Registration failed: {str(e)}'
        }), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login an existing user"""
    try:
        data = request.get_json()

        # Accept email or phone for login
        identifier = data.get('identifier', '').strip()
        password = data.get('password', '')

        if not identifier or not password:
            return jsonify({
                'success': False,
                'message': 'Email/Phone and password are required'
            }), 400

        conn = get_db_connection()
        if not conn:
            return jsonify({
                'success': False,
                'message': 'Database connection failed'
            }), 500

        cursor = conn.cursor(dictionary=True)

        # Check by email or phone
        cursor.execute("""
            SELECT id, full_name, email, phone, password_hash,
                   date_of_birth, region, preferred_language, profile_image
            FROM users
            WHERE email = %s OR phone = %s
        """, (identifier.lower(), identifier))

        user = cursor.fetchone()

        if not user:
            cursor.close()
            conn.close()
            return jsonify({
                'success': False,
                'message': 'No account found. Please register first.'
            }), 404

        # Verify password
        if not bcrypt.checkpw(
            password.encode('utf-8'),
            user['password_hash'].encode('utf-8')
        ):
            cursor.close()
            conn.close()
            return jsonify({
                'success': False,
                'message': 'Invalid password. Please try again.'
            }), 401

        # Create JWT token
        access_token = create_access_token(identity=str(user['id']))

        cursor.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': f"Welcome back, {user['full_name']}! 🛡️",
            'token': access_token,
            'user': {
                'id': user['id'],
                'full_name': user['full_name'],
                'email': user['email'],
                'phone': user['phone'],
                'date_of_birth': str(user['date_of_birth']) if user['date_of_birth'] else None,
                'region': user['region'],
                'preferred_language': user['preferred_language'],
                'profile_image': user['profile_image']
            }
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Login failed: {str(e)}'
        }), 500


@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get the current user's profile"""
    try:
        user_id = get_jwt_identity()

        conn = get_db_connection()
        if not conn:
            return jsonify({
                'success': False,
                'message': 'Database connection failed'
            }), 500

        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id, full_name, email, phone, date_of_birth,
                   region, preferred_language, profile_image,
                   home_latitude, home_longitude, created_at
            FROM users WHERE id = %s
        """, (user_id,))

        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404

        # Convert date objects to strings
        if user.get('date_of_birth'):
            user['date_of_birth'] = str(user['date_of_birth'])
        if user.get('created_at'):
            user['created_at'] = str(user['created_at'])

        return jsonify({
            'success': True,
            'user': user
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to get profile: {str(e)}'
        }), 500
