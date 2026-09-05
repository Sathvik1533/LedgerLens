#!/usr/bin/env python3
"""
LedgerLens Service Readiness Waiter
===================================
Polls backend and frontend services until both are fully initialized and ready
to handle browser interactions.

Strict Validation:
- Backend: /api/v1/health -> 200 JSON with status == 'healthy', database_status == 'connected'
- Backend: /api/v1/readiness -> 200 JSON with status == 'ready', database == 'connected', rag_engine == 'ready'
- Frontend: Root path -> 200 HTML containing id="root", rejecting 502 / proxy errors.
"""

import sys
import time
import argparse
import httpx

def check_backend(base_url: str) -> tuple[bool, str]:
    try:
        # 1. Health check
        health_res = httpx.get(f"{base_url}/api/v1/health", timeout=3.0)
        if health_res.status_code != 200:
            return False, f"Health endpoint returned HTTP {health_res.status_code}"
        try:
            h_data = health_res.json()
        except Exception:
            return False, "Health endpoint did not return JSON"
        
        if h_data.get("status") != "healthy":
            return False, f"Health status is {h_data.get('status')} (expected 'healthy')"
        if h_data.get("database_status") != "connected":
            return False, f"Database status is {h_data.get('database_status')} (expected 'connected')"

        # 2. Readiness check
        ready_res = httpx.get(f"{base_url}/api/v1/readiness", timeout=3.0)
        if ready_res.status_code != 200:
            return False, f"Readiness endpoint returned HTTP {ready_res.status_code}"
        try:
            r_data = ready_res.json()
        except Exception:
            return False, "Readiness endpoint did not return JSON"

        if r_data.get("status") != "ready":
            return False, f"Readiness status is {r_data.get('status')} (expected 'ready')"
        if r_data.get("database") != "connected":
            return False, f"Readiness database is {r_data.get('database')} (expected 'connected')"
        if r_data.get("rag_engine") != "ready":
            return False, f"RAG engine is {r_data.get('rag_engine')} (expected 'ready')"

        return True, "Backend healthy, database connected, RAG ready"
    except httpx.ConnectError:
        return False, "Connection refused (backend not yet listening)"
    except Exception as e:
        return False, f"Backend probe failed: {e}"

def check_frontend(base_url: str) -> tuple[bool, str]:
    try:
        res = httpx.get(base_url, timeout=3.0, follow_redirects=True)
        if res.status_code != 200:
            return False, f"Frontend returned HTTP {res.status_code}"
        content = res.text
        if "502 Bad Gateway" in content or "504 Gateway Time-out" in content:
            return False, "Frontend returned gateway error"
        if 'id="root"' not in content and "id='root'" not in content:
            return False, "Frontend response missing #root element"
        return True, "Frontend serving index HTML with #root mounted"
    except httpx.ConnectError:
        return False, "Connection refused (frontend dev server not yet listening)"
    except Exception as e:
        return False, f"Frontend probe failed: {e}"

def wait_for_services(backend_url: str = None, frontend_url: str = None, timeout: int = 90, interval: float = 2.0) -> bool:
    print("=" * 70)
    print("  WAITING FOR SERVICE READINESS")
    print("=" * 70)
    if backend_url:
        print(f"Backend Target  : {backend_url}")
    if frontend_url:
        print(f"Frontend Target : {frontend_url}")
    print(f"Max Timeout     : {timeout}s (polling every {interval}s)")

    start_time = time.time()
    backend_ready = backend_url is None
    frontend_ready = frontend_url is None

    while time.time() - start_time < timeout:
        elapsed = time.time() - start_time

        if not backend_ready and backend_url:
            ok, msg = check_backend(backend_url)
            if ok:
                backend_ready = True
                print(f"[{elapsed:5.1f}s] ✓ Backend Ready: {msg}")
            else:
                print(f"[{elapsed:5.1f}s] ⏳ Backend Pending: {msg}")

        if not frontend_ready and frontend_url:
            ok, msg = check_frontend(frontend_url)
            if ok:
                frontend_ready = True
                print(f"[{elapsed:5.1f}s] ✓ Frontend Ready: {msg}")
            else:
                print(f"[{elapsed:5.1f}s] ⏳ Frontend Pending: {msg}")

        if backend_ready and frontend_ready:
            print("\n" + "=" * 70)
            print(f"  ALL REQUIRED SERVICES READY in {elapsed:.1f}s")
            print("=" * 70 + "\n")
            return True

        time.sleep(interval)

    print(f"\n❌ TIMEOUT: Services failed to become ready within {timeout}s", file=sys.stderr)
    return False

def main():
    parser = argparse.ArgumentParser(description="Wait for LedgerLens services to become healthy and ready")
    parser.add_argument("--backend", default=None, help="Backend URL to check (e.g. http://127.0.0.1:8000)")
    parser.add_argument("--frontend", default=None, help="Frontend URL to check (e.g. http://127.0.0.1:5173)")
    parser.add_argument("--timeout", type=int, default=90, help="Maximum seconds to wait")
    parser.add_argument("--interval", type=float, default=2.0, help="Polling interval in seconds")
    args = parser.parse_args()

    if not args.backend and not args.frontend:
        # Default to both local services if neither specified
        args.backend = "http://127.0.0.1:8000"
        args.frontend = "http://127.0.0.1:5173"

    success = wait_for_services(
        backend_url=args.backend,
        frontend_url=args.frontend,
        timeout=args.timeout,
        interval=args.interval
    )
    if not success:
        sys.exit(1)

if __name__ == "__main__":
    main()
