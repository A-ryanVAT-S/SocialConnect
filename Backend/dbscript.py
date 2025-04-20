import pymysql
import os
from pymysql.constants import CLIENT
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
# Database Configuration for Aiven MySQL
DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": int(os.getenv("DB_PORT")),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "db": os.getenv("DB_NAME"),
    "charset": "utf8mb4",
    "connect_timeout": 10,
    "read_timeout": 10,
    "write_timeout": 10,
    "cursorclass": pymysql.cursors.DictCursor
}
def initialize_database():
    """Initialize database by creating it if it doesn't exist"""
    try:
        # Connect to server first
        connection = pymysql.connect(**DB_CONFIG)
        try:
            with connection.cursor() as cursor:
                # Create database if it doesn't exist
                cursor.execute("CREATE DATABASE IF NOT EXISTS socialConnect")
            connection.commit()
        finally:
            connection.close()
        
        # Connect to socialConnect database
        config = DB_CONFIG.copy()
        config["db"] = "socialConnect"
        connection = pymysql.connect(**config)
        
        try:
            with connection.cursor() as cursor:
                # Use the socialConnect database
                cursor.execute("USE socialConnect")
                
                # Create tables
                cursor.execute("""
                -- Users table
                CREATE TABLE IF NOT EXISTS users (
                    username VARCHAR(50) PRIMARY KEY,
                    location VARCHAR(100),
                    bio TEXT,
                    mailid VARCHAR(100) UNIQUE NOT NULL,
                    website VARCHAR(200),
                    fname VARCHAR(50),
                    lname VARCHAR(50),
                    photo LONGTEXT,
                    dateofbirth DATE,
                    joined_from DATE
                )
                """)
                
                cursor.execute("""
                -- Tweet table
                CREATE TABLE IF NOT EXISTS tweet (
                    tweetid INT PRIMARY KEY,
                    content_ TEXT,
                    photo LONGTEXT,
                    time_ TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    author VARCHAR(50),
                    FOREIGN KEY (author) REFERENCES users(username) ON DELETE CASCADE
                )
                """)
                
                cursor.execute("""
                -- Like table
                CREATE TABLE IF NOT EXISTS like_ (
                    username VARCHAR(50),
                    tweetid INT,
                    PRIMARY KEY (username, tweetid),
                    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE,
                    FOREIGN KEY (tweetid) REFERENCES tweet(tweetid) ON DELETE CASCADE
                )
                """)
                
                cursor.execute("""
                -- Comment table
                CREATE TABLE IF NOT EXISTS comment_ (
                    _id INT AUTO_INCREMENT PRIMARY KEY,
                    time_ TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    tweetid INT,
                    username VARCHAR(50),
                    content_ TEXT,
                    FOREIGN KEY (tweetid) REFERENCES tweet(tweetid) ON DELETE CASCADE,
                    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
                )
                """)
                
                cursor.execute("""
                -- Follow table
                CREATE TABLE IF NOT EXISTS follows (
                    follower VARCHAR(50),
                    follows VARCHAR(50),
                    PRIMARY KEY (follower, follows),
                    FOREIGN KEY (follower) REFERENCES users(username) ON DELETE CASCADE,
                    FOREIGN KEY (follows) REFERENCES users(username) ON DELETE CASCADE
                )
                """)
                
                cursor.execute("""
                -- Poll table
                CREATE TABLE IF NOT EXISTS poll (
                    id_ INT PRIMARY KEY,
                    content_ TEXT,
                    poll_by VARCHAR(50),
                    time_ TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (poll_by) REFERENCES users(username) ON DELETE CASCADE
                )
                """)
                
                cursor.execute("""
                -- Poll option table
                CREATE TABLE IF NOT EXISTS poll_option (
                    poll_id INT,
                    option_ VARCHAR(200),
                    PRIMARY KEY (poll_id, option_),
                    FOREIGN KEY (poll_id) REFERENCES poll(id_) ON DELETE CASCADE
                )
                """)
                
                cursor.execute("""
                -- Vote table
                CREATE TABLE IF NOT EXISTS vote (
                    username VARCHAR(50),
                    poll_id INT,
                    poll_option_ VARCHAR(200), 
                    PRIMARY KEY (username, poll_id),
                    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE,
                    FOREIGN KEY (poll_id) REFERENCES poll(id_) ON DELETE CASCADE
                )
                """)
                
                cursor.execute("""
                -- Group table
                CREATE TABLE IF NOT EXISTS group_ (
                    grpname VARCHAR(50) PRIMARY KEY,
                    admin VARCHAR(50),
                    photo LONGTEXT,
                    bio TEXT,
                    FOREIGN KEY (admin) REFERENCES users(username) ON DELETE CASCADE
                )
                """)
                
                cursor.execute("""
                -- Group members table
                CREATE TABLE IF NOT EXISTS group_members (
                    grp_name VARCHAR(50),
                    grpmem VARCHAR(50),
                    PRIMARY KEY (grp_name, grpmem),
                    FOREIGN KEY (grp_name) REFERENCES group_(grpname) ON DELETE CASCADE,
                    FOREIGN KEY (grpmem) REFERENCES users(username) ON DELETE CASCADE
                )
                """)
                
                cursor.execute("""
                -- Chat table
                CREATE TABLE IF NOT EXISTS chat (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    sender VARCHAR(50),
                    receiver VARCHAR(50),
                    msg TEXT,
                    time_ TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (sender) REFERENCES users(username) ON DELETE CASCADE,
                    FOREIGN KEY (receiver) REFERENCES users(username) ON DELETE CASCADE
                )
                """)
                
                cursor.execute("""
                -- Group chat table
                CREATE TABLE IF NOT EXISTS group_chat (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    grp_name VARCHAR(50),
                    sender VARCHAR(50),
                    message TEXT,
                    time_ TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (grp_name) REFERENCES group_(grpname) ON DELETE CASCADE,
                    FOREIGN KEY (sender) REFERENCES users(username) ON DELETE CASCADE
                )
                """)
                
                cursor.execute("""
                -- Group membership requests table
                CREATE TABLE IF NOT EXISTS group_requests (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    grp_name VARCHAR(50),
                    username VARCHAR(50),
                    request_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                    FOREIGN KEY (grp_name) REFERENCES group_(grpname) ON DELETE CASCADE,
                    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE,
                    UNIQUE KEY (grp_name, username)
                )
                """)
                
                cursor.execute("""
                -- Follow requests table
                CREATE TABLE IF NOT EXISTS follow_requests (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    requester VARCHAR(50),
                    target VARCHAR(50),
                    request_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                    FOREIGN KEY (requester) REFERENCES users(username) ON DELETE CASCADE,
                    FOREIGN KEY (target) REFERENCES users(username) ON DELETE CASCADE,
                    UNIQUE KEY (requester, target)
                )
                """)
            
            connection.commit()
            print("Database and tables initialized successfully!")
            
        finally:
            connection.close()
            
    except pymysql.MySQLError as err:
        print(f"Database initialization error: {err}")
        raise

if __name__ == "__main__":
    initialize_database()