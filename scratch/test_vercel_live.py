import requests

res = requests.get("https://kinetic-seven-rho.vercel.app/app")
print("Status Code:", res.status_code)
print("Headers:", dict(res.headers))
print("Response Snippet:", res.text[:500])

res_admin = requests.get("https://kinetic-seven-rho.vercel.app/admin/login")
print("\nAdmin Status Code:", res_admin.status_code)
print("Admin Response Snippet:", res_admin.text[:500])
