# db.py
import firebase_admin
from firebase_admin import credentials, db
import threading

# Use a thread-safe singleton so Firebase initializes only once
_init_lock = threading.Lock()
_initialized = False

def init_db(service_account_path: str, database_url: str):
    global _initialized
    with _init_lock:
        if not _initialized:
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred, {
                "databaseURL": database_url
            })
            _initialized = True


# Basic DB helpers

def write(path: str, data):
    """Writes (replaces) a node's value."""
    ref = db.reference(path)
    ref.set(data)


def update(path: str, data: dict):
    """Updates fields under a path without overwriting everything."""
    ref = db.reference(path)
    ref.update(data)


def read(path: str):
    """Reads a node's value."""
    ref = db.reference(path)
    return ref.get()


def push(path: str, data):
    """Creates a new auto-ID child."""
    ref = db.reference(path)
    return ref.push(data)
