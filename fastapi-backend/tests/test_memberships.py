from datetime import date, timedelta
from app.services.membership_service import activate_approved_membership

def test_list_plans(client):
    res = client.get("/api/v1/membership-plans")
    assert res.status_code == 200
    plans = res.json()
    assert len(plans) >= 1

def test_renewal_date_math_null_safe(db_session):
    # Test activate_approved_membership handles first time vs renewal date extension
    member = activate_approved_membership(db_session, user_id=2, plan_id=1)
    assert member.status == "active"
    
    initial_end = member.end_date
    # Renew early
    member_renewed = activate_approved_membership(db_session, user_id=2, plan_id=1)
    assert member_renewed.status == "active"
    # End date should be extended
    assert member_renewed.end_date >= initial_end
