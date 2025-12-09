
import requests

try:
    r = requests.get("http://127.0.0.1:8000/api/complaints")
    print(f"Status Code: {r.status_code}")
    if r.status_code == 200:
        data = r.json()
        print(f"Count: {len(data)}")
        if len(data) > 0:
            print("first item keys:", data[0].keys())
    else:
        print("Error content:", r.text)
except Exception as e:
    print("Failed to connect:", e)
