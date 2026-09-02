import requests
import time

BASE_URL = "http://localhost:8000/api/v1"

def upload_file(feed_type, filepath):
    url = f"{BASE_URL}/ingestion/{feed_type}"
    with open(filepath, 'rb') as f:
        files = {'file': f}
        r = requests.post(url, files=files)
        print(f"[{feed_type}] Status: {r.status_code}")
        try:
            print(r.json())
        except:
            print(r.text)

print("1. Uploading Synthetic Data...")
upload_file('payments', 'data/synthetic/payments.csv')
upload_file('settlements', 'data/synthetic/settlements.csv')
upload_file('bank-credits', 'data/synthetic/bank_credits.csv')
upload_file('refunds', 'data/synthetic/refunds.csv')

print("\n2. Triggering Reconciliation Engine...")
r = requests.post(f"{BASE_URL}/reconciliation/run")
print("Status:", r.status_code)
print(r.json())

print("\n3. Fetching Queue Data...")
r = requests.get(f"{BASE_URL}/review/queue")
print(f"Cases in queue: {r.json().get('total_cases', 0)}")

print("\n4. Fetching Dashboard Stats...")
r = requests.get(f"{BASE_URL}/reconciliation/stats")
print(r.json())
