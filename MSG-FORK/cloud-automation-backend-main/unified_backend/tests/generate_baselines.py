#!/usr/bin/env python3
"""
Generate baseline data for DRS testing
This script will populate baseline metrics for company 11 using their existing cloud data
"""

import json
import subprocess
from datetime import datetime


def run_curl_post(url: str, token: str, data: dict = None) -> tuple[bool, dict]:
    """Run curl POST command"""
    try:
        cmd = [
            "curl", "-s", "-w", "%{http_code}",
            "-X", "POST",
            "-H", "Content-Type: application/json",
            "-H", f"Authorization: Bearer {token}",
            url
        ]
        
        if data:
            cmd.extend(["-d", json.dumps(data)])
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        
        if result.returncode != 0:
            return False, {"error": f"Curl failed: {result.stderr}"}
        
        output = result.stdout
        if len(output) >= 3:
            http_code = output[-3:]
            response_body = output[:-3]
            
            try:
                response_data = json.loads(response_body) if response_body.strip() else {}
                return http_code == "200", response_data
            except json.JSONDecodeError:
                return False, {"error": "Invalid JSON response", "raw": response_body}
        
        return False, {"error": "Invalid response format"}
        
    except Exception as e:
        return False, {"error": str(e)}


def get_auth_token() -> str:
    """Get authentication token"""
    print("🔐 Getting authentication token...")
    
    login_data = {
        "email": "ceo@acme.com",
        "password": "123password"
    }
    
    cmd = [
        "curl", "-s", "-w", "%{http_code}",
        "-X", "POST",
        "-H", "Content-Type: application/json",
        "-d", json.dumps(login_data),
        "http://localhost:8000/auth/login"
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode == 0:
        output = result.stdout
        if len(output) >= 3:
            http_code = output[-3:]
            response_body = output[:-3]
            
            if http_code == "200":
                auth_data = json.loads(response_body)
                return auth_data.get("access_token", "")
    
    raise Exception("Failed to authenticate")


def main():
    """Generate baseline data for company 11"""
    print("=" * 70)
    print("🎯 DRS BASELINE DATA GENERATOR")
    print("=" * 70)
    print("This will generate baseline metrics for Acme Coperations (Company 11)")
    print("using their existing cloud provider data from FinancialFact table")
    print("")
    
    try:
        # Get auth token
        token = get_auth_token()
        print("✅ Authentication successful")
        print("")
        
        # Company 11 details
        company_id = 11
        base_url = "http://localhost:8000"
        
        # Step 1: Clear existing baselines (optional)
        print("🧹 Clearing existing baselines...")
        success, result = run_curl_post(
            f"{base_url}/api/drs/baseline/clear-baselines?company_id={company_id}",
            token
        )
        
        if success and result.get("success"):
            print("✅ Existing baselines cleared")
        else:
            print("⚠️  No existing baselines to clear (or error occurred)")
        print("")
        
        # Step 2: Generate new baselines
        print("📊 Generating baseline metrics from historical data...")
        success, result = run_curl_post(
            f"{base_url}/api/drs/baseline/generate-baselines?company_id={company_id}&baseline_period_months=12",
            token
        )
        
        if success and result.get("success"):
            baselines = result.get("data", {}).get("baselines_created", [])
            print(f"✅ Generated {len(baselines)} baseline metrics:")
            
            for baseline in baselines:
                metric = baseline.get("metric_code", "Unknown")
                value = baseline.get("value", 0)
                unit = baseline.get("unit", "")
                method = baseline.get("method", "unknown")
                
                print(f"   📈 {metric}: {value:,.2f} {unit} (method: {method})")
        else:
            print(f"❌ Failed to generate baselines: {result}")
            return False
        print("")
        
        # Step 3: Generate sample initiatives
        print("🚀 Generating sample strategic initiatives...")
        success, result = run_curl_post(
            f"{base_url}/api/drs/baseline/generate-sample-initiatives?company_id={company_id}",
            token
        )
        
        if success and result.get("success"):
            initiatives = result.get("data", {}).get("initiatives", [])
            print(f"✅ Generated {len(initiatives)} sample initiatives:")
            
            for initiative in initiatives:
                name = initiative.get("name", "Unknown")
                provider = initiative.get("provider", "Unknown")
                target_savings = initiative.get("target_savings", 0)
                progress = initiative.get("progress", 0)
                
                print(f"   🎯 {name}")
                print(f"      Provider: {provider}")
                print(f"      Target Savings: ${target_savings:,.2f}")
                print(f"      Progress: {progress}%")
        else:
            print(f"❌ Failed to generate initiatives: {result}")
        print("")
        
        # Step 4: View generated baselines
        print("👀 Viewing generated baselines...")
        cmd = [
            "curl", "-s", "-w", "%{http_code}",
            "-H", f"Authorization: Bearer {token}",
            f"{base_url}/api/drs/baseline/view-baselines?company_id={company_id}"
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            output = result.stdout
            http_code = output[-3:]
            response_body = output[:-3]
            
            if http_code == "200":
                view_data = json.loads(response_body)
                baselines = view_data.get("data", {}).get("baselines", [])
                
                print(f"📋 Summary of {len(baselines)} baseline metrics:")
                for baseline in baselines:
                    metric = baseline.get("metric_code", "Unknown")
                    value = baseline.get("value", 0)
                    unit = baseline.get("unit", "")
                    period = baseline.get("period", "Unknown")
                    
                    print(f"   📊 {metric}: {value:,.2f} {unit}")
                    print(f"      Period: {period}")
        
        print("")
        print("=" * 70)
        print("🎉 BASELINE GENERATION COMPLETE!")
        print("=" * 70)
        print("You can now run the DRS test suite to see all endpoints working:")
        print("   python3 tests/test_drs_endpoints.py")
        print("")
        print("Or test individual DRS endpoints like:")
        print("   • Revenue Impact")
        print("   • Time to Market")  
        print("   • Operating Efficiency")
        print("   • Strategic Initiatives")
        print("=" * 70)
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)