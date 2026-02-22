import mysql.connector
from mysql.connector import Error
from config import Config


def get_db_connection():
    """Create and return a MySQL database connection"""
    try:
        connection = mysql.connector.connect(
            host=Config.MYSQL_HOST,
            port=Config.MYSQL_PORT,
            user=Config.MYSQL_USER,
            password=Config.MYSQL_PASSWORD,
            database=Config.MYSQL_DATABASE
        )
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None


def init_database():
    """Initialize the database and create tables if they don't exist"""
    try:
        # First connect without database to create it if needed
        connection = mysql.connector.connect(
            host=Config.MYSQL_HOST,
            port=Config.MYSQL_PORT,
            user=Config.MYSQL_USER,
            password=Config.MYSQL_PASSWORD
        )
        cursor = connection.cursor()

        # Create database
        cursor.execute(
            f"CREATE DATABASE IF NOT EXISTS {Config.MYSQL_DATABASE}"
        )
        cursor.execute(f"USE {Config.MYSQL_DATABASE}")

        # Create users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                full_name VARCHAR(100) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                phone VARCHAR(15) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                date_of_birth DATE,
                region VARCHAR(100),
                preferred_language VARCHAR(50) DEFAULT 'English',
                profile_image VARCHAR(500),
                home_latitude DECIMAL(10, 8),
                home_longitude DECIMAL(11, 8),
                is_verified BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        """)

        # Create emergency_contacts table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS emergency_contacts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                contact_name VARCHAR(100) NOT NULL,
                phone VARCHAR(15) NOT NULL,
                relation VARCHAR(50),
                has_whatsapp BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

        # Create sos_logs table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sos_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                latitude DECIMAL(10, 8),
                longitude DECIMAL(11, 8),
                status ENUM('ACTIVE', 'RESOLVED', 'CANCELLED') DEFAULT 'ACTIVE',
                triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                resolved_at TIMESTAMP NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

        # Create user_settings table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL UNIQUE,
                sos_sound_enabled BOOLEAN DEFAULT TRUE,
                sos_vibration_enabled BOOLEAN DEFAULT TRUE,
                auto_location_sharing BOOLEAN DEFAULT TRUE,
                shake_to_sos BOOLEAN DEFAULT FALSE,
                floating_bubble_enabled BOOLEAN DEFAULT FALSE,
                notification_sound VARCHAR(50) DEFAULT 'default',
                theme VARCHAR(20) DEFAULT 'dark',
                font_size VARCHAR(20) DEFAULT 'medium',
                auto_recording BOOLEAN DEFAULT FALSE,
                geofence_alerts BOOLEAN DEFAULT TRUE,
                check_in_reminders BOOLEAN DEFAULT FALSE,
                check_in_interval_minutes INT DEFAULT 30,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

        connection.commit()
        cursor.close()
        connection.close()
        print("[OK] Database initialized successfully!")
        return True

    except Error as e:
        print(f"[ERROR] Error initializing database: {e}")
        return False
