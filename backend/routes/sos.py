from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import get_db_connection
from datetime import datetime

sos_bp = Blueprint('sos', __name__, url_prefix='/api/sos')


@sos_bp.route('/trigger', methods=['POST'])
@jwt_required()
def trigger_sos():
    """Trigger an SOS alert - saves log, returns emergency contacts to notify"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}

        latitude = data.get('latitude')
        longitude = data.get('longitude')

        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'message': 'Database connection failed'}), 500

        cursor = conn.cursor(dictionary=True)

        # Create SOS log
        cursor.execute("""
            INSERT INTO sos_logs (user_id, latitude, longitude, status)
            VALUES (%s, %s, %s, 'ACTIVE')
        """, (user_id, latitude, longitude))

        sos_id = cursor.lastrowid

        # Get user info
        cursor.execute(
            "SELECT full_name, phone FROM users WHERE id = %s", (user_id,)
        )
        user = cursor.fetchone()

        # Get emergency contacts
        cursor.execute("""
            SELECT contact_name, phone, relation, has_whatsapp
            FROM emergency_contacts
            WHERE user_id = %s
        """, (user_id,))
        contacts = cursor.fetchall()

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': '🆘 SOS Alert Triggered! Emergency contacts are being notified.',
            'sos_id': sos_id,
            'user_name': user['full_name'] if user else 'User',
            'contacts_notified': len(contacts),
            'contacts': contacts,
            'location': {
                'latitude': float(latitude) if latitude else None,
                'longitude': float(longitude) if longitude else None
            },
            'emergency_numbers': {
                'india_emergency': '112',
                'women_helpline': '1091',
                'police': '100',
                'ambulance': '108'
            }
        }), 201

    except Exception as e:
        return jsonify({'success': False, 'message': f'Failed to trigger SOS: {str(e)}'}), 500


@sos_bp.route('/resolve/<int:sos_id>', methods=['PUT'])
@jwt_required()
def resolve_sos(sos_id):
    """Mark an SOS alert as resolved"""
    try:
        user_id = get_jwt_identity()

        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'message': 'Database connection failed'}), 500

        cursor = conn.cursor()
        cursor.execute("""
            UPDATE sos_logs
            SET status = 'RESOLVED', resolved_at = %s
            WHERE id = %s AND user_id = %s AND status = 'ACTIVE'
        """, (datetime.utcnow(), sos_id, user_id))

        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            return jsonify({'success': False, 'message': 'No active SOS alert found'}), 404

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': 'SOS Alert resolved. Stay safe! ✅'
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'message': f'Failed to resolve SOS: {str(e)}'}), 500


@sos_bp.route('/cancel/<int:sos_id>', methods=['PUT'])
@jwt_required()
def cancel_sos(sos_id):
    """Cancel an accidental SOS alert"""
    try:
        user_id = get_jwt_identity()

        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'message': 'Database connection failed'}), 500

        cursor = conn.cursor()
        cursor.execute("""
            UPDATE sos_logs
            SET status = 'CANCELLED', resolved_at = %s
            WHERE id = %s AND user_id = %s AND status = 'ACTIVE'
        """, (datetime.utcnow(), sos_id, user_id))

        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            return jsonify({'success': False, 'message': 'No active SOS alert found'}), 404

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': 'SOS Alert cancelled.'
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'message': f'Failed to cancel SOS: {str(e)}'}), 500


@sos_bp.route('/history', methods=['GET'])
@jwt_required()
def sos_history():
    """Get SOS alert history for the current user"""
    try:
        user_id = get_jwt_identity()

        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'message': 'Database connection failed'}), 500

        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id, latitude, longitude, status, triggered_at, resolved_at
            FROM sos_logs
            WHERE user_id = %s
            ORDER BY triggered_at DESC
            LIMIT 50
        """, (user_id,))

        logs = cursor.fetchall()
        for log in logs:
            if log.get('triggered_at'):
                log['triggered_at'] = str(log['triggered_at'])
            if log.get('resolved_at'):
                log['resolved_at'] = str(log['resolved_at'])
            if log.get('latitude') is not None:
                log['latitude'] = float(log['latitude'])
            if log.get('longitude') is not None:
                log['longitude'] = float(log['longitude'])

        cursor.close()
        conn.close()

        return jsonify({
            'success': True,
            'history': logs,
            'count': len(logs)
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'message': f'Failed to get history: {str(e)}'}), 500


@sos_bp.route('/active', methods=['GET'])
@jwt_required()
def active_sos():
    """Check if user has any active SOS"""
    try:
        user_id = get_jwt_identity()

        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'message': 'Database connection failed'}), 500

        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id, latitude, longitude, triggered_at
            FROM sos_logs
            WHERE user_id = %s AND status = 'ACTIVE'
            ORDER BY triggered_at DESC
            LIMIT 1
        """, (user_id,))

        active = cursor.fetchone()
        cursor.close()
        conn.close()

        if active:
            if active.get('triggered_at'):
                active['triggered_at'] = str(active['triggered_at'])
            if active.get('latitude') is not None:
                active['latitude'] = float(active['latitude'])
            if active.get('longitude') is not None:
                active['longitude'] = float(active['longitude'])

        return jsonify({
            'success': True,
            'has_active_sos': active is not None,
            'active_sos': active
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'message': f'Failed to check SOS: {str(e)}'}), 500
