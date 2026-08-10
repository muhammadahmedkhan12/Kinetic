def test_login_success_email(client):
    res = client.post("/api/v1/auth/token", data={"username": "member@test.com", "password": "password123"})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "member"

def test_login_success_phone(client):
    res = client.post("/api/v1/auth/token", data={"username": "03009998877", "password": "password123"})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data

def test_login_blocked_pending_account(client):
    res = client.post("/api/v1/auth/token", data={"username": "pending@test.com", "password": "password123"})
    assert res.status_code == 403
    assert "Access pending" in res.json()["detail"]

def test_signup_creates_pending_user(client):
    payload = {
        "name": "New Signup",
        "email": "newmember@test.com",
        "password": "Password123!",
        "phone": "03112223344"
    }
    res = client.post("/api/v1/auth/signup", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["is_approved"] == 0
