import os
import json
import threading

# Find root project path dynamically relative to this file (placed in project/admin-portal/shared_utils.py)
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(CURRENT_DIR)
SHARED_DIR = os.path.join(BASE_DIR, "shared_data")
CLASSES_PATH = os.path.join(SHARED_DIR, "classes.json")
BOOKINGS_PATH = os.path.join(SHARED_DIR, "bookings.json")

# Ensure shared directory exists
os.makedirs(SHARED_DIR, exist_ok=True)

# Thread-safe lock for process-level safety
_file_lock = threading.Lock()

DEFAULT_CLASSES = [
    {"id": 1, "name": "Strength & Conditioning", "day": "Mon / Wed / Fri", "time": "06:00 AM - 07:00 AM", "trainer": "Alex Johnson", "capacity": 20},
    {"id": 2, "name": "HIIT Fat Burn", "day": "Tue / Thu", "time": "07:00 AM - 07:45 AM", "trainer": "Sarah Connor", "capacity": 25},
    {"id": 3, "name": "Boxing Fundamentals", "day": "Mon / Wed", "time": "05:00 PM - 06:00 PM", "trainer": "Mike Tyson", "capacity": 15},
    {"id": 4, "name": "Powerlifting Club", "day": "Tue / Thu / Sat", "time": "08:00 AM - 09:30 AM", "trainer": "John Smith", "capacity": 12},
    {"id": 5, "name": "Yoga & Recovery", "day": "Wed / Fri", "time": "06:30 PM - 07:30 PM", "trainer": "Sarah Connor", "capacity": 30},
    {"id": 6, "name": "CrossFit WOD", "day": "Mon - Fri", "time": "12:00 PM - 01:00 PM", "trainer": "Alex Johnson", "capacity": 20}
]

def load_classes():
    with _file_lock:
        if not os.path.exists(CLASSES_PATH):
            save_classes_unsafe(DEFAULT_CLASSES)
            return DEFAULT_CLASSES
        try:
            with open(CLASSES_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return DEFAULT_CLASSES

def save_classes(classes_list):
    with _file_lock:
        save_classes_unsafe(classes_list)

def save_classes_unsafe(classes_list):
    try:
        with open(CLASSES_PATH, "w", encoding="utf-8") as f:
            json.dump(classes_list, f, indent=4)
    except Exception as e:
        print(f"[SHARED DATA] Error writing classes: {str(e)}")

def load_bookings():
    with _file_lock:
        if not os.path.exists(BOOKINGS_PATH):
            save_bookings_unsafe({})
            return {}
        try:
            with open(BOOKINGS_PATH, "r", encoding="utf-8") as f:
                # Convert string keys back to int IDs
                data = json.load(f)
                return {int(k): set(v) for k, v in data.items()}
        except Exception:
            return {}

def save_bookings(bookings_dict):
    with _file_lock:
        save_bookings_unsafe(bookings_dict)

def save_bookings_unsafe(bookings_dict):
    try:
        # Convert set to list for JSON serialization, and convert keys to string
        serializable = {str(k): list(v) for k, v in bookings_dict.items()}
        with open(BOOKINGS_PATH, "w", encoding="utf-8") as f:
            json.dump(serializable, f, indent=4)
    except Exception as e:
        print(f"[SHARED DATA] Error writing bookings: {str(e)}")
