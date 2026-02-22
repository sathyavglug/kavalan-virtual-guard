from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from database import init_database
from routes.auth import auth_bp
from routes.contacts import contacts_bp
from routes.profile import profile_bp
from routes.sos import sos_bp
from routes.chat import chat_bp
from routes.settings import settings_bp


def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for React frontend
    CORS(app, origins=["http://localhost:5173", "http://localhost:3000"],
         supports_credentials=True)

    # Initialize JWT
    JWTManager(app)

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(contacts_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(sos_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(settings_bp)

    # Health check route
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return {'status': 'ok', 'message': 'KAVALAN API is running 🛡️'}

    return app


if __name__ == '__main__':
    # Initialize database tables
    print("[KAVALAN] Backend Server Starting...")
    init_database()

    # Create and run app
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
