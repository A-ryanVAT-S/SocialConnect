import pymysql

# Database configuration
DB_CONFIG = {
    "host": "mysql-316d4840-dbms-project-xyz987.j.aivencloud.com",
    "port": 12923,
    "user": "avnadmin",
    "password": "AVNS_zeewNcxzmGFkSFWEXeO",
    "db": "socialConnect",
    "charset": "utf8mb4",
    "connect_timeout": 10,
    "read_timeout": 10,
    "write_timeout": 10,
    "cursorclass": pymysql.cursors.DictCursor
}

try:
    connection = pymysql.connect(**DB_CONFIG)
    
    with connection.cursor() as cursor:
        # Check if the column 'status' exists
        check_column_query = """
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'follow_requests' 
        AND COLUMN_NAME = 'status' 
        AND TABLE_SCHEMA = 'socialConnect';
        """
        cursor.execute(check_column_query)
        result = cursor.fetchone()

        # If column doesn't exist, add it
        if not result:
            alter_query = """
            ALTER TABLE follow_requests 
            ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'pending';
            """
            cursor.execute(alter_query)
            print("Column 'status' added to follow_requests table.")

        # Update existing NULL statuses
        update_query = """
        UPDATE follow_requests 
        SET status = 'pending' 
        WHERE status IS NULL;
        """
        cursor.execute(update_query)

        connection.commit()
        print("Updated existing rows with NULL status to 'pending'.")

except pymysql.Error as e:
    print(f"Database error: {e}")
except Exception as e:
    print(f"Unexpected error: {e}")
finally:
    if 'connection' in locals() and connection.open:
        connection.close()
        print("Connection closed.")
