from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import get_db_connection
from datetime import datetime
import bcrypt

profile_bp = Blueprint('profile', __name__, url_prefix='/api/profile')


@profile_bp.route('', methods=['GET'])
@jwt_required()
def get_profile():
    """Get profile details for the current user"""
    try:
        user_id = get_jwt_identity()

        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'message': 'Database connection failed'}), 500

        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id, full_name, email, phone, date_of_birth,
                   region, preferred_language, profile_image,
                   home_latitude, home_longitude, is_verified, created_at
            FROM users WHERE id = %s
        """, (user_id,))

        user = cursor.fetchone()

        # Get contact count
        cursor.execute("SELECT COUNT(*) as count FROM emergency_contacts WHERE user_id = %s", (user_id,))
        contact_count = cursor.fetchone()['count']

        # Get SOS count
        cursor.execute("SELECT COUNT(*) as count FROM sos_logs WHERE user_id = %s", (user_id,))
        sos_count = cursor.fetchone()['count']

        cursor.close()
        conn.close()

        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404

        # Convert date objects
        if user.get('date_of_birth'):
            user['date_of_birth'] = str(user['date_of_birth'])
        if user.get('created_at'):
            user['created_at'] = str(user['created_at'])

        # Convert Decimal to float for latitude/longitude
        if user.get('home_latitude') is not None:
            user['home_latitude'] = float(user['home_latitude'])
        if user.get('home_longitude') is not None:
            user['home_longitude'] = float(user['home_longitude'])

        user['emergency_contacts_count'] = contact_count
        user['sos_alerts_count'] = sos_count

        return jsonify({
            'success': True,
            'user': user
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'message': f'Failed to get profile: {str(e)}'}), 500


@profile_bp.route('', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'message': 'Database connection failed'}), 500

        cursor = conn.cursor(dictionary=True)

        # Build update fields dynamically
        updatable_fields = {
            'full_name': data.get('full_name'),
            'phone': data.get('phone'),
            'date_of_birth': data.get('date_of_birth'),
            'region': data.get('region'),
            'preferred_language': data.get('preferred_language'),
            'home_latitude': data.get('home_latitude'),
            'home_longitude': data.get('home_longitude'),
        }

        # Filter out None values
        updates = {k: v for k, v in updatable_fields.items() if v is not None}

        if not updates:
            return jsonify({'success': False, 'message': 'No fields to update'}), 400

        set_clause = ', '.join([f"{k} = %s" for k in updates.keys()])
        values = list(updates.values()) + [user_id]

        cursor.execute(f"UPDATE users SET {set_clause} WHERE id = %s", values)
        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': 'Profile updated successfully ✅'
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'message': f'Failed to update profile: {str(e)}'}), 500


@profile_bp.route('/password', methods=['PUT'])
@jwt_required()
def change_password():
    """Change user password"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        current_password = data.get('current_password', '')
        new_password = data.get('new_password', '')

        if not current_password or not new_password:
            return jsonify({'success': False, 'message': 'Current and new passwords are required'}), 400

        if len(new_password) < 6:
            return jsonify({'success': False, 'message': 'New password must be at least 6 characters'}), 400

        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'message': 'Database connection failed'}), 500

        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT password_hash FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()

        if not user:
            cursor.close()
            conn.close()
            return jsonify({'success': False, 'message': 'User not found'}), 404

        # Verify current password
        if not bcrypt.checkpw(current_password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            cursor.close()
            conn.close()
            return jsonify({'success': False, 'message': 'Current password is incorrect'}), 401

        # Hash new password
        new_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        cursor.execute("UPDATE users SET password_hash = %s WHERE id = %s", (new_hash, user_id))
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': 'Password changed successfully 🔒'
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'message': f'Failed to change password: {str(e)}'}), 500


@profile_bp.route('/home-location', methods=['PUT'])
@jwt_required()
def update_home_location():
    """Update user home geofence location"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        latitude = data.get('latitude')
        longitude = data.get('longitude')

        if latitude is None or longitude is None:
            return jsonify({'success': False, 'message': 'Latitude and longitude are required'}), 400

        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'message': 'Database connection failed'}), 500

        cursor = conn.cursor()
        cursor.execute(
            "UPDATE users SET home_latitude = %s, home_longitude = %s WHERE id = %s",
            (latitude, longitude, user_id)
        )
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': 'Home location updated successfully 🏠'
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'message': f'Failed to update location: {str(e)}'}), 500
