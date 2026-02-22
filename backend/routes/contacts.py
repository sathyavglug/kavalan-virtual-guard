from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import get_db_connection

contacts_bp = Blueprint('contacts', __name__, url_prefix='/api/contacts')


@contacts_bp.route('', methods=['GET'])
@jwt_required()
def get_contacts():
    """Get all emergency contacts for the current user"""
    try:
        user_id = get_jwt_identity()

        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'message': 'Database connection failed'}), 500

        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id, contact_name, phone, relation, has_whatsapp, created_at
            FROM emergency_contacts
            WHERE user_id = %s
            ORDER BY created_at ASC
        """, (user_id,))

        contacts = cursor.fetchall()
        for c in contacts:
            if c.get('created_at'):
                c['created_at'] = str(c['created_at'])

        cursor.close()
        conn.close()

        return jsonify({
            'success': True,
            'contacts': contacts,
            'count': len(contacts),
            'max_contacts': 10
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'message': f'Failed to get contacts: {str(e)}'}), 500


@contacts_bp.route('', methods=['POST'])
@jwt_required()
def add_contact():
    """Add a new emergency contact"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        contact_name = data.get('contact_name', '').strip()
        phone = data.get('phone', '').strip()
        relation = data.get('relation', '').strip()
        has_whatsapp = data.get('has_whatsapp', False)

        if not contact_name or not phone:
            return jsonify({'success': False, 'message': 'Contact name and phone are required'}), 400

        if len(phone) < 10:
            return jsonify({'success': False, 'message': 'Phone number must be at least 10 digits'}), 400

        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'message': 'Database connection failed'}), 500

        cursor = conn.cursor(dictionary=True)

        # Check current contact count (max 10)
        cursor.execute("SELECT COUNT(*) as count FROM emergency_contacts WHERE user_id = %s", (user_id,))
        result = cursor.fetchone()
        if result['count'] >= 10:
            cursor.close()
            conn.close()
            return jsonify({
                'success': False,
                'message': 'Maximum 10 emergency contacts allowed'
            }), 400

        # Check for duplicate phone
        cursor.execute(
            "SELECT id FROM emergency_contacts WHERE user_id = %s AND phone = %s",
            (user_id, phone)
        )
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({'success': False, 'message': 'This phone number is already in your contacts'}), 409

        cursor.execute("""
            INSERT INTO emergency_contacts (user_id, contact_name, phone, relation, has_whatsapp)
            VALUES (%s, %s, %s, %s, %s)
        """, (user_id, contact_name, phone, relation, has_whatsapp))

        conn.commit()
        contact_id = cursor.lastrowid
        cursor.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': f'{contact_name} added as emergency contact ✅',
            'contact': {
                'id': contact_id,
                'contact_name': contact_name,
                'phone': phone,
                'relation': relation,
                'has_whatsapp': has_whatsapp
            }
        }), 201

    except Exception as e:
        return jsonify({'success': False, 'message': f'Failed to add contact: {str(e)}'}), 500


@contacts_bp.route('/<int:contact_id>', methods=['PUT'])
@jwt_required()
def update_contact(contact_id):
    """Update an emergency contact"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'message': 'Database connection failed'}), 500

        cursor = conn.cursor(dictionary=True)

        # Verify ownership
        cursor.execute(
            "SELECT id FROM emergency_contacts WHERE id = %s AND user_id = %s",
            (contact_id, user_id)
        )
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({'success': False, 'message': 'Contact not found'}), 404

        contact_name = data.get('contact_name', '').strip()
        phone = data.get('phone', '').strip()
        relation = data.get('relation', '').strip()
        has_whatsapp = data.get('has_whatsapp', False)

        if not contact_name or not phone:
            return jsonify({'success': False, 'message': 'Contact name and phone are required'}), 400

        cursor.execute("""
            UPDATE emergency_contacts
            SET contact_name = %s, phone = %s, relation = %s, has_whatsapp = %s
            WHERE id = %s AND user_id = %s
        """, (contact_name, phone, relation, has_whatsapp, contact_id, user_id))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': 'Contact updated successfully ✅'
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'message': f'Failed to update contact: {str(e)}'}), 500


@contacts_bp.route('/<int:contact_id>', methods=['DELETE'])
@jwt_required()
def delete_contact(contact_id):
    """Delete an emergency contact"""
    try:
        user_id = get_jwt_identity()

        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'message': 'Database connection failed'}), 500

        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT contact_name FROM emergency_contacts WHERE id = %s AND user_id = %s",
            (contact_id, user_id)
        )
        contact = cursor.fetchone()
        if not contact:
            cursor.close()
            conn.close()
            return jsonify({'success': False, 'message': 'Contact not found'}), 404

        cursor.execute(
            "DELETE FROM emergency_contacts WHERE id = %s AND user_id = %s",
            (contact_id, user_id)
        )

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': f'{contact["contact_name"]} removed from emergency contacts'
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'message': f'Failed to delete contact: {str(e)}'}), 500
