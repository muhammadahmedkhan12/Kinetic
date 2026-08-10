import os
from dotenv import load_dotenv
from google import genai

env_path = 'd:/Python/.venv/project/.env'
print("Loading from:", env_path)
load_dotenv(env_path)

key = os.environ.get("GEMINI_API_KEY", "")
print("Key:", repr(key))

try:
    client = genai.Client(api_key=key)
    res = client.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents="Hi, state your name in 3 words."
    )
    print("Success! Gemini output:", res.text)
except Exception as e:
    print("Failed with error:", type(e), e)
