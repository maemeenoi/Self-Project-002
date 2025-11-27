#!/usr/bin/env python3
"""
Show exactly what data the automated baseline system analyzes
This demonstrates how it pulls from FinancialFact and WorkflowFact tables
"""

import json
import subprocess
import sys
from datetime import datetime


def get_auth_token():
    """Get authentication token"""
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


def analyze_company_data(token: str, company_id: int = 11):
    """Analyze what data the baseline system sees"""
    
    print("=" * 80)
    print("🔍 AUTOMATED BASELINE SYSTEM - DATA SOURCE ANALYSIS")
    print("=" * 80)
    print(f"Analyzing Company ID: {company_id}")
    print(f"This shows exactly what data the AI pulls from your tables")
    print("")
    
    # 1. Company Type Detection
    print("🤖 COMPANY TYPE DETECTION:")
    print("   Based on FinancialFact spending patterns...")
    
    try:
        cmd = [
            "curl", "-s", "-w", "%{http_code}",
            "-H", f"Authorization: Bearer {token}",
            f"http://localhost:8000/api/drs/auto-baseline/company-type/{company_id}"
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        output = result.stdout
        http_code = output[-3:]
        response_body = output[:-3]
        
        if http_code == "200":
            type_data = json.loads(response_body)
            detected_type = type_data["data"]["detected_type"]
            benchmarks = type_data["data"]["benchmarks"]
            
            print(f"   ✅ Detected Type: {detected_type.upper()}")
            print(f"   📊 Revenue Multiplier: {benchmarks['revenue_multiplier']}x")
            print(f"   ⏱️  TTM Baseline: {benchmarks['ttm_baseline_days']} days")
            print(f"   💰 Cost Efficiency Target: {benchmarks['cost_efficiency_target']*100}%")
        else:
            print(f"   ❌ Error getting company type: {response_body}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("")
    
    # 2. Show what baselines were calculated
    print("📊 CALCULATED BASELINES:")
    print("   From actual FinancialFact + WorkflowFact data...")
    
    try:
        cmd = [
            "curl", "-s", "-w", "%{http_code}",
            "-H", f"Authorization: Bearer {token}",
            f"http://localhost:8000/api/drs/baseline/view-baselines?company_id={company_id}"
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        output = result.stdout
        http_code = output[-3:]
        response_body = output[:-3]
        
        if http_code == "200":
            baseline_data = json.loads(response_body)
            baselines = baseline_data["data"]["baselines"]
            
            for baseline in baselines:
                metric = baseline["metric_code"]
                value = baseline["value"]
                unit = baseline["unit"]
                period = baseline["period"]
                
                print(f"   📈 {metric}: {value:,.2f} {unit}")
                print(f"      Period: {period}")
                
                # Explain what data was used
                if metric == "REVENUE_BASELINE":
                    print(f"      💡 Source: FinancialFact EffectiveCost × Industry Multiplier")
                elif metric == "OPS_COST_BASELINE":
                    print(f"      💡 Source: FinancialFact historical spending trends")
                elif metric == "TTM_BASELINE":
                    print(f"      💡 Source: WorkflowFact CycleTimeHours OR industry default")
                    
                print("")
        else:
            print(f"   ❌ Error getting baselines: {response_body}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # 3. Show current DRS results
    print("🎯 CURRENT DRS RESULTS:")
    print("   How the baselines enable executive metrics...")
    
    try:
        cmd = [
            "curl", "-s", "-w", "%{http_code}",
            "-H", f"Authorization: Bearer {token}",
            f"http://localhost:8000/api/drs/executive-summary?company_id={company_id}"
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        output = result.stdout
        http_code = output[-3:]
        response_body = output[:-3]
        
        if http_code == "200":
            summary_data = json.loads(response_body)
            summary = summary_data["data"]
            
            print(f"   💰 Revenue Impact: ${summary['revenue_impact']:,.2f}")
            print(f"   ⚡ Cost Savings: {summary['cost_savings_percent']}%")
            print(f"   🌍 Global Regions: {summary['global_regions']}")
            print(f"   🎯 Active Initiatives: {summary['active_initiatives']}")
        else:
            print(f"   ❌ Error getting summary: {response_body}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("")
    print("=" * 80)
    print("📋 DATA SOURCE SUMMARY")
    print("=" * 80)
    print("✅ FinancialFact Table:")
    print("   • EffectiveCost → Revenue & Cost baselines")
    print("   • ServiceName → Company type detection")
    print("   • Region → Global scale analysis")
    print("   • Provider → Multi-cloud strategy")
    print("   • BillingPeriodStart → Trend analysis")
    print("")
    print("✅ WorkflowFact Table:")
    print("   • CycleTimeHours → Time to market baseline")
    print("   • CreatedAt → Delivery frequency")
    print("   • Status → Completion analysis")
    print("   • Labels → Work type classification")
    print("")
    print("🚀 Result: Professional executive dashboard with ZERO manual setup!")
    print("   The AI learns your business patterns automatically.")
    print("=" * 80)


def main():
    try:
        token = get_auth_token()
        analyze_company_data(token, 11)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()