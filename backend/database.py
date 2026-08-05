import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Load .env file if present
load_dotenv()

# Read DATABASE_URL from environment (e.g. Supabase connection string)
# Fallback to local SQLite if not provided
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'castingai.db')}"

# PostgreSQL / Supabase connection handling
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # Supabase uses Postgres: automatically adjust URI scheme if needed
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    import time
    max_retries = 3
    retry_delay = 2
    for attempt in range(1, max_retries + 1):
        try:
            # Add connect_timeout to pooler connection args
            engine = create_engine(DATABASE_URL, pool_pre_ping=True, connect_args={"connect_timeout": 5})
            with engine.connect() as conn:
                print("[DATABASE] Successfully connected to PostgreSQL/Supabase!")
                break
        except Exception as e:
            print(f"[DATABASE] Connection attempt {attempt}/{max_retries} failed: {e}")
            if attempt == max_retries:
                print("[DATABASE] All connection attempts failed. Falling back to local SQLite database 'castingai.db'.")
                BASE_DIR = os.path.abspath(os.path.dirname(__file__))
                DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'castingai.db')}"
                engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
            else:
                time.sleep(retry_delay)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Auto-migrate role column if table exists
try:
    from sqlalchemy import text
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'Chief Quality Engineer'"))
        conn.commit()
except Exception:
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
