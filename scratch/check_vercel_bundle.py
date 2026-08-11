import re
import requests

html = requests.get("https://kinetic-seven-rho.vercel.app/#/admin/login").text
js_files = re.findall(r'src="(/assets/[^"]+\.js)"', html)
if not js_files:
    # Fetch root index.html
    html = requests.get("https://kinetic-seven-rho.vercel.app").text
    js_files = re.findall(r'src="(/assets/[^"]+\.js)"', html)

print("Found JS files:", js_files)

for js_path in js_files:
    full_url = f"https://kinetic-seven-rho.vercel.app{js_path}"
    js_content = requests.get(full_url).text
    print(f"\n--- Checking {js_path} ---")
    if "railway" in js_content:
        matches = re.findall(r'https://[a-zA-Z0-9\.-]*railway[a-zA-Z0-9\.-]*', js_content)
        print("Embedded Railway URLs found:", set(matches))
    else:
        print("No Railway URL embedded in bundle!")
