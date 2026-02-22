"""
KAVALAN AI Chat Route
Provides AI-powered safety conversation using Google Gemini API
Falls back to rule-based responses if API key is not configured
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import get_db_connection
import os
import json
import requests as http_requests

chat_bp = Blueprint('chat', __name__, url_prefix='/api/chat')

# KAVALAN System Prompt for Gemini
KAVALAN_SYSTEM_PROMPT = """You are KAVALAN, an intelligent women safety AI agent. Your primary purpose is to protect, assist, and empower women and girls in emergency and non-emergency situations across India.

IDENTITY & ROLE:
- Name: KAVALAN AI
- Role: Personal Safety Agent for Women
- Personality: Calm, trustworthy, fast, empathetic, non-judgmental
- Tone: Warm but alert. Simple language. Never panic the user.
- Language: Always respond in the user's chosen language

CAPABILITIES YOU CAN SUGGEST:
1. SOS Alert - Send alerts to emergency contacts with live location
2. Share Live Location - Share GPS with trusted contacts  
3. Safe Route - Find safest route avoiding isolated areas
4. Fake Call - Simulate incoming call to escape situations
5. Police Station - Find nearest police station
6. Safe Message - Send "I am safe" to contacts
7. Safety Tips - Provide safety advice

BEHAVIOR RULES:
- Always prioritize user safety above all else
- If user says help, danger, emergency, scared, attack, save me in ANY language - respond with SOS guidance immediately
- Keep responses SHORT during emergencies (max 2 sentences)
- Keep responses WARM and HELPFUL during normal usage (max 3-4 sentences)
- Never judge the user's situation
- Always mention relevant emergency numbers: 112 (India Emergency), 1091 (Women Helpline), 100 (Police), 108 (Ambulance)

RESPONSE FORMAT:
- Use emojis sparingly but effectively
- For emergencies: Immediate action, nearest help, calm reassurance
- For normal chat: Warm greeting, helpful response, offer safety feature

SAFETY KEYWORDS (detect in ANY language):
English: help, danger, emergency, scared, attack, save me, follow
Tamil: உதவி, ஆபத்து, பயமாக இருக்கு, காப்பாற்று
Hindi: bachao, madad, khatara, darr lag raha hai
Telugu: sahayam, bhayam, rakshinchandhi
Kannada: sahaya, aapaththu, bhaya
Malayalam: sakhyam, aapatthu, rakshanam

You are talking to: {user_name}. Their preferred language is: {language}. Region: {region}."""

# Safety keywords for emergency detection
SAFETY_KEYWORDS = [
    'help', 'danger', 'emergency', 'scared', 'attack', 'save me', 'follow',
    'உதவி', 'ஆபத்து', 'பயமாக இருக்கு', 'காப்பாற்று',
    'bachao', 'madad', 'khatara', 'darr',
    'sahayam', 'bhayam', 'sahaya', 'sakhyam', 'sahajya', 'bipad',
    'dhoka', 'bipada', 'khatre'
]


def get_rule_based_response(message, user_name):
    """Fallback rule-based responses when API key is not available"""
    lower = message.lower().strip()

    # Emergency detection
    is_emergency = any(kw in lower for kw in SAFETY_KEYWORDS)
    if is_emergency:
        return {
            'text': f'🆘 SOS Alert activated {user_name}! All your emergency contacts are being notified with your live location right now. Stay calm, help is on the way.\n\n📞 Emergency: 112\n📞 Women Helpline: 1091\n📞 Police: 100',
            'is_emergency': True
        }

    # Safe / reached
    if any(w in lower for w in ['safe', 'reached', 'home']):
        if 'route' in lower or 'path' in lower:
            return {'text': '🗺️ I can help you find the safest route! Please tell me your destination and I\'ll calculate a route avoiding isolated, dark, and low-crowd areas.', 'is_emergency': False}
        if 'tip' in lower:
            return {'text': '🛡️ Safety Tips:\n\n1. Stay alert — Avoid using headphones in isolated areas\n2. Share your live location with trusted contacts while traveling\n3. Trust your instincts — If something feels off, leave immediately\n4. Save emergency numbers — 112, 1091, 100\n5. Keep your phone charged and carry a power bank\n6. Travel in well-lit, crowded areas when possible\n7. Use KAVALAN SOS button if you feel threatened', 'is_emergency': False}
        if 'reached' in lower or 'home' in lower:
            return {'text': f'Great news, {user_name}! ✅ Sending "I reached safely" message to your family now. Location sharing stopped. Stay safe! 🌙', 'is_emergency': False}
        return {'text': f'So glad you\'re safe, {user_name}! ✅ Sending "I reached safely" message to all your emergency contacts now. Take care! 🌟', 'is_emergency': False}

    # Fake call
    if any(w in lower for w in ['fake call', 'call me', 'uncomfortable', 'unsafe']):
        return {'text': '📞 Incoming fake call triggered! Answer it naturally and walk to a safe, crowded area. Your location sharing has been activated for your contacts.', 'is_emergency': False}

    # Location
    if 'stop' in lower and 'location' in lower:
        return {'text': '📍 Location sharing stopped. Your contacts can no longer see your live location. Stay safe! 🛡️', 'is_emergency': False}
    if any(w in lower for w in ['location', 'gps', 'track', 'share']):
        return {'text': f'📍 Live location sharing activated, {user_name}! Your trusted contacts can now see your real-time location. Stay safe!\n\nTo stop sharing, just say "stop sharing location".', 'is_emergency': False}

    # Police
    if any(w in lower for w in ['police', 'station', 'emergency number', 'helpline']):
        return {'text': '🏛️ Here are your emergency numbers:\n\n📞 India Emergency: 112\n📞 Women Helpline: 1091\n📞 Police: 100\n📞 Ambulance: 108\n\nFor your nearest police station, please enable GPS.', 'is_emergency': False}

    # Route
    if any(w in lower for w in ['route', 'path', 'way', 'navigate', 'direction']):
        return {'text': '🗺️ I can help you find the safest route! Please tell me your destination and I\'ll calculate a route avoiding isolated areas.', 'is_emergency': False}

    # Tips
    if any(w in lower for w in ['tip', 'advice', 'precaution']):
        return {'text': '🛡️ Safety Tips:\n\n1. Stay alert — Avoid using headphones in isolated areas\n2. Share your live location with trusted contacts\n3. Trust your instincts — If something feels off, leave immediately\n4. Save emergency numbers — 112, 1091, 100\n5. Keep your phone charged\n6. Travel in well-lit, crowded areas\n7. Use KAVALAN SOS button if you feel threatened', 'is_emergency': False}

    # Greeting
    if any(w in lower for w in ['hi', 'hello', 'hey', 'vanakkam', 'namaste']):
        return {'text': f'Hello {user_name}! 🛡️ I\'m KAVALAN, your personal safety companion. I\'m here to keep you safe. You can ask me to:\n\n• 🆘 Trigger SOS Alert\n• 📍 Share Live Location\n• 🗺️ Find Safe Route\n• 📞 Fake Call\n• 🏛️ Nearest Police Station\n• ✅ Send "I\'m Safe" message\n\nWhat can I help you with?', 'is_emergency': False}

    # SOS
    if any(w in lower for w in ['sos', 'alert']):
        return {
            'text': f'🆘 SOS Alert activated {user_name}! All your emergency contacts are being notified right now. Stay calm, help is coming.\n\n📞 Emergency: 112\n📞 Women Helpline: 1091',
            'is_emergency': True
        }

    # Fallback
    return {'text': 'I\'m here to keep you safe 🛡️. You can ask me to:\n\n• Share your location\n• Find a safe route\n• Send help alert\n• Trigger a fake call\n• Safety tips\n\nOr just talk to me. What do you need?', 'is_emergency': False}


def get_gemini_response(message, user_name, language='English', region='India'):
    """Get response from Google Gemini API"""
    api_key = os.getenv('GEMINI_API_KEY', '')
    if not api_key:
        return None

    system_prompt = KAVALAN_SYSTEM_PROMPT.format(
        user_name=user_name,
        language=language,
        region=region
    )

    try:
        url = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}'
        
        payload = {
            'contents': [
                {
                    'role': 'user',
                    'parts': [{'text': f'{system_prompt}\n\nUser message: {message}'}]
                }
            ],
            'generationConfig': {
                'temperature': 0.7,
                'topP': 0.95,
                'maxOutputTokens': 500
            },
            'safetySettings': [
                {'category': 'HARM_CATEGORY_HARASSMENT', 'threshold': 'BLOCK_NONE'},
                {'category': 'HARM_CATEGORY_HATE_SPEECH', 'threshold': 'BLOCK_NONE'},
                {'category': 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'threshold': 'BLOCK_NONE'},
                {'category': 'HARM_CATEGORY_DANGEROUS_CONTENT', 'threshold': 'BLOCK_NONE'}
            ]
        }

        response = http_requests.post(url, json=payload, timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            if 'candidates' in data and len(data['candidates']) > 0:
                text = data['candidates'][0]['content']['parts'][0]['text']
                # Detect if response indicates emergency
                is_emergency = any(kw in message.lower() for kw in SAFETY_KEYWORDS)
                return {'text': text, 'is_emergency': is_emergency}

        return None
    except Exception as e:
        print(f"[KAVALAN] Gemini API error: {e}")
        return None


@chat_bp.route('/message', methods=['POST'])
@jwt_required()
def send_message():
    """Process a chat message and return KAVALAN AI response"""
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data or 'message' not in data:
        return jsonify({'success': False, 'message': 'Message is required'}), 400

    message = data['message'].strip()
    if not message:
        return jsonify({'success': False, 'message': 'Message cannot be empty'}), 400

    # Get user details
    connection = get_db_connection()
    if not connection:
        return jsonify({'success': False, 'message': 'Database error'}), 500

    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            'SELECT full_name, preferred_language, region FROM users WHERE id = %s',
            (user_id,)
        )
        user = cursor.fetchone()
        cursor.close()
        connection.close()

        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404

        user_name = user['full_name']
        language = user.get('preferred_language', 'English')
        region = user.get('region', 'India')

        # Try Gemini first, fallback to rule-based
        response = get_gemini_response(message, user_name, language, region)
        ai_source = 'gemini'

        if not response:
            response = get_rule_based_response(message, user_name)
            ai_source = 'local'

        return jsonify({
            'success': True,
            'response': {
                'text': response['text'],
                'is_emergency': response.get('is_emergency', False),
                'source': ai_source
            }
        })

    except Exception as e:
        print(f"[KAVALAN] Chat error: {e}")
        if connection and connection.is_connected():
            connection.close()
        return jsonify({'success': False, 'message': 'Failed to process message'}), 500


@chat_bp.route('/history', methods=['GET'])
@jwt_required()
def get_chat_info():
    """Get basic chat info - AI status"""
    api_key = os.getenv('GEMINI_API_KEY', '')
    return jsonify({
        'success': True,
        'ai_enabled': bool(api_key),
        'ai_model': 'Gemini 2.0 Flash' if api_key else 'Local KAVALAN AI',
        'features': [
            'Emergency Detection',
            'Multi-language Support',
            'Safety Tips',
            'Location Sharing',
            'Fake Call Trigger',
            'Safe Route Finding'
        ]
    })
