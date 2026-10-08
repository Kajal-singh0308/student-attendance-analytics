import os
from dotenv import load_dotenv

load_dotenv()  # reads .env if present (local dev)

SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkey_change_in_prod")
ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))
