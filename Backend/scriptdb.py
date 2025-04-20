import pymysql
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
# Database configuration
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
        # Check if 'group_name' column exists in 'tweet' table
        check_column_query = """
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'tweet' 
        AND COLUMN_NAME = 'group_name' 
        AND TABLE_SCHEMA = 'socialConnect';
        """
        cursor.execute(check_column_query)
        column_result = cursor.fetchone()

        if not column_result:
            alter_column_query = """
            ALTER TABLE tweet 
            ADD COLUMN group_name VARCHAR(50) NULL;
            """
            cursor.execute(alter_column_query)
            print("Column 'group_name' added to 'tweet' table.")
        else:
            print("Column 'group_name' already exists.")

        # Try adding the foreign key constraint
        try:
            add_fk_query = """
            ALTER TABLE tweet 
            ADD CONSTRAINT fk_tweet_group 
            FOREIGN KEY (group_name) REFERENCES group_(grpname) ON DELETE CASCADE;
            """
            cursor.execute(add_fk_query)
            print("Foreign key constraint 'fk_tweet_group' added.")
        except pymysql.err.InternalError as fk_error:
            if "Duplicate" in str(fk_error) or "errno 1061" in str(fk_error):
                print("Foreign key constraint 'fk_tweet_group' already exists.")
            else:
                raise fk_error

        connection.commit()

except pymysql.Error as e:
    print(f"Database error: {e}")
except Exception as e:
    print(f"Unexpected error: {e}")
finally:
    if 'connection' in locals() and connection.open:
        connection.close()
        print("Connection closed.")
