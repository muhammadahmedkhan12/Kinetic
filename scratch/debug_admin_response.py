import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"
login_res = requests.post(f"{BASE_URL}/auth/token", data={"username": "admin@kineticgym.com", "password": "Admin@123"})
token = login_res.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

summary = requests.get(f"{BASE_URL}/admin/dashboard-summary", headers=headers).json()
members = summary.get("members", [])
print("Existing Member IDs:", [m["user_id"] for m in members])

if members:
    m_id = members[0]["user_id"]
    res = requests.get(f"{BASE_URL}/admin/members/{m_id}", headers=headers)
    print(f"Raw JSON response for member #{m_id}:")
    print(res.json())
