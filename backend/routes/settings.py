"""
KAVALAN Settings Route
Manages user app preferences and settings
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import get_db_connection

settings_bp = Blueprint('settings', __name__, url_prefix='/api/settings')


@settings_bp.route('', methods=['GET'])
@jwt_required()
def get_settings():
    """Get user settings/preferences"""
    user_id = get_jwt_identity()
    connection = get_db_connection()

    if not connection:
        return jsonify({'success': False, 'message': 'Database error'}), 500

    try:
        cursor = connection.cursor(dictionary=True)

        # Check if settings table exists and get settings
        cursor.execute("""
            SELECT * FROM user_settings WHERE user_id = %s
        """, (user_id,))
        settings = cursor.fetchone()

        if not settings:
            # Create default settings
            cursor.execute("""
                INSERT INTO user_settings (user_id) VALUES (%s)
            """, (user_id,))
            connection.commit()

            cursor.execute("""
                SELECT * FROM user_settings WHERE user_id = %s
            """, (user_id,))
            settings = cursor.fetchone()

        cursor.close()
        connection.close()

        return jsonify({
            'success': True,
            'settings': {
                'sos_sound_enabled': bool(settings['sos_sound_enabled']),
                'sos_vibration_enabled': bool(settings['sos_vibration_enabled']),
                'auto_location_sharing': bool(settings['auto_location_sharing']),
                'shake_to_sos': bool(settings['shake_to_sos']),
                'floating_bubble_enabled': bool(settings['floating_bubble_enabled']),
                'notification_sound': settings['notification_sound'] or 'default',
                'theme': settings['theme'] or 'dark',
                'font_size': settings['font_size'] or 'medium',
                'auto_recording': bool(settings['auto_recording']),
                'geofence_alerts': bool(settings['geofence_alerts']),
                'check_in_reminders': bool(settings['check_in_reminders']),
                'check_in_interval_minutes': settings['check_in_interval_minutes'] or 30,
            }
        })

    except Exception as e:
        print(f"[KAVALAN] Settings error: {e}")
        if connection and connection.is_connected():
            connection.close()
        return jsonify({'success': False, 'message': 'Failed to load settings'}), 500


@settings_bp.route('', methods=['PUT'])
@jwt_required()
def update_settings():
    """Update user settings/preferences"""
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data:
        return jsonify({'success': False, 'message': 'No data provided'}), 400

    connection = get_db_connection()
    if not connection:
        return jsonify({'success': False, 'message': 'Database error'}), 500

    try:
        cursor = connection.cursor()

        # Build dynamic update query from allowed fields
        allowed_fields = [
            'sos_sound_enabled', 'sos_vibration_enabled', 'auto_location_sharing',
            'shake_to_sos', 'floating_bubble_enabled', 'notification_sound',
            'theme', 'font_size', 'auto_recording', 'geofence_alerts',
            'check_in_reminders', 'check_in_interval_minutes'
        ]

        updates = []
        values = []
        for field in allowed_fields:
            if field in data:
                updates.append(f'{field} = %s')
                values.append(data[field])

        if not updates:
            return jsonify({'success': False, 'message': 'No valid settings provided'}), 400

        values.append(user_id)
        query = f"UPDATE user_settings SET {', '.join(updates)} WHERE user_id = %s"
        cursor.execute(query, tuple(values))
        connection.commit()
        cursor.close()
        connection.close()

        return jsonify({
            'success': True,
            'message': 'Settings updated successfully! ⚙️'
        })

    except Exception as e:
        print(f"[KAVALAN] Settings update error: {e}")
        if connection and connection.is_connected():
            connection.close()
        return jsonify({'success': False, 'message': 'Failed to update settings'}), 500


@settings_bp.route('/reset', methods=['POST'])
@jwt_required()
def reset_settings():
    """Reset all settings to defaults"""
    user_id = get_jwt_identity()
    connection = get_db_connection()

    if not connection:
        return jsonify({'success': False, 'message': 'Database error'}), 500

    try:
        cursor = connection.cursor()
        cursor.execute("DELETE FROM user_settings WHERE user_id = %s", (user_id,))
        cursor.execute("INSERT INTO user_settings (user_id) VALUES (%s)", (user_id,))
        connection.commit()
        cursor.close()
        connection.close()

        return jsonify({
            'success': True,
            'message': 'Settings reset to defaults ⚙️'
        })

    except Exception as e:
        print(f"[KAVALAN] Settings reset error: {e}")
        if connection and connection.is_connected():
            connection.close()
        return jsonify({'success': False, 'message': 'Failed to reset settings'}), 500
