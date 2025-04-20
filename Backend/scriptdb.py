import pymysql
import os
import hashlib
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# DB config
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

try:
    connection = pymysql.connect(**DB_CONFIG)
    with connection.cursor() as cursor:
        print("✅ Connected to DB")

        # Step 1: Get users like 'aryan%'
        cursor.execute("""
            SELECT username FROM users 
            WHERE username LIKE 'aryan%';
        """)
        users = cursor.fetchall()
        print(f"📋 Found {len(users)} users matching 'aryan%'")

        # Step 2: Delete users except 'aryan_main' and 'aryan_temp'
        for user in users:
            username = user['username']
            if username not in ['aryan_main', 'aryan_temp']:
                try:
                    cursor.execute("DELETE FROM users WHERE username = %s;", (username,))
                    print(f"🗑️ Deleted: {username}")
                except pymysql.Error as e:
                    print(f"⚠️ Cannot delete {username}: {e}")

        # Step 3: Update all remaining users to have password = username
        # (assuming you store plain text passwords, adjust if you use hashing)
        cursor.execute("""
            UPDATE users 
            SET password = username
        """)
        affected_rows = cursor.rowcount
        print(f"🔑 Updated {affected_rows} user passwords to match their usernames")

        # Verify the changes
        cursor.execute("""
            SELECT username, password FROM users 
            WHERE username LIKE 'aryan%'
            ORDER BY username;
        """)
        remaining_users = cursor.fetchall()
        print("\n🔍 Remaining aryan users after cleanup:")
        for u in remaining_users:
            pwd_status = "✅" if u['password'] == u['username'] else "❌"
            print(f"   • {u['username']} (password match: {pwd_status})")

        connection.commit()
        print("\n✅ Changes committed successfully")

except pymysql.Error as error:
    print(f"❌ Database error: {error}")
finally:
    if 'connection' in locals() and connection:
        connection.close()
        print("Connection closed.")