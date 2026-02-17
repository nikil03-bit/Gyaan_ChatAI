import requests
import time
import os

BASE_URL = "http://127.0.0.1:8000"

def test_flow():
    print("--- 1. Testing Registration ---")
    reg_data = {
        "name": "Test User",
        "email": f"test_{int(time.time())}@example.com",
        "password": "testpassword",
        "website_name": "TestTenant"
    }
    r = requests.post(f"{BASE_URL}/auth/register", json=reg_data)
    print(f"Status: {r.status_code}")
    if r.status_code != 200:
        print(r.text)
        return
    reg_res = r.json()
    token = reg_res["token"]
    tenant_id = reg_res["tenant"]["id"]
    bot_id = reg_res["bot"]["id"]
    widget_key = reg_res["bot"]["widget_key"]
    print(f"Registered: Tenant={tenant_id}, Bot={bot_id}, WidgetKey={widget_key}")

    print("\n--- 2. Testing Login ---")
    login_data = {
        "email": reg_data["email"],
        "password": reg_data["password"]
    }
    r = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    print(f"Status: {r.status_code}")
    if r.status_code != 200:
        print(r.text)
        return
    print("Login successful")

    print("\n--- 3. Testing Upload ---")
    # Create a dummy PDF file
    dummy_pdf = "test_doc.pdf"
    with open(dummy_pdf, "wb") as f:
        f.write(b"%PDF-1.4\n1 0 obj\n<< /Title (Test) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF")
    
    with open(dummy_pdf, "rb") as f:
        r = requests.post(
            f"{BASE_URL}/documents/upload",
            params={"tenant_id": tenant_id, "bot_id": bot_id},
            files={"file": (dummy_pdf, f, "application/pdf")}
        )
    print(f"Status: {r.status_code}")
    if r.status_code != 200:
        print(r.text)
        return
    upload_res = r.json()
    doc_id = upload_res["doc_id"]
    print(f"Upload started: DocID={doc_id}")

    print("\n--- 4. Checking Status ---")
    max_retries = 10
    for i in range(max_retries):
        r = requests.get(f"{BASE_URL}/documents/status", params={"tenant_id": tenant_id, "doc_id": doc_id})
        status_data = r.json()
        print(f"Status check {i+1}: {status_data['status']}")
        if status_data["status"] == "ready":
            break
        if status_data["status"] == "failed":
            print(f"Error: {status_data.get('error')}")
            break
        time.sleep(1)

    print("\n--- 5. Testing Chat ---")
    chat_data = {
        "tenant_id": tenant_id,
        "question": "What is in this document?"
    }
    r = requests.post(f"{BASE_URL}/chat/", json=chat_data)
    print(f"Status: {r.status_code}")
    print(r.json())

    print("\n--- 6. Testing Widget Chat ---")
    widget_data = {
        "widget_key": widget_key,
        "visitor_id": "test_visitor",
        "message": "Hello bot"
    }
    r = requests.post(f"{BASE_URL}/chat/widget", json=widget_data)
    print(f"Status: {r.status_code}")
    print(r.json())

    os.remove(dummy_pdf)

if __name__ == "__main__":
    test_flow()
