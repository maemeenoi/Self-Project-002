#!/usr/bin/env python3
"""
DRS Business Executive Dashboard API Test Suite
Tests all 9 DRS KPI endpoints with authentication and data validation

Run with:
    python tests/test_drs_endpoints.py
"""

import json
import sys
import time
import subprocess
import os
from datetime import datetime
from typing import Dict, Any, Optional
from dataclasses import dataclass


def run_curl_command(url: str, headers: Dict[str, str] = None, timeout: int = 30) -> tuple[bool, Dict[str, Any]]:
    """Run curl command and return JSON response"""
    try:
        cmd = ["curl", "-s", "-w", "%{http_code}", url]
        
        if headers:
            for key, value in headers.items():
                cmd.extend(["-H", f"{key}: {value}"])
        
        cmd.extend(["--connect-timeout", str(timeout)])
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        
        if result.returncode != 0:
            return False, {"error": f"Curl failed with code {result.returncode}: {result.stderr}"}
        
        # Split response body and status code
        output = result.stdout
        if len(output) >= 3:
            http_code = output[-3:]  # Last 3 characters are HTTP status
            response_body = output[:-3]  # Everything else is the response
            
            try:
                response_data = json.loads(response_body) if response_body.strip() else {}
                return http_code == "200", response_data
            except json.JSONDecodeError as e:
                return False, {"error": f"JSON decode error: {e}", "raw_response": response_body}
        else:
            return False, {"error": "Invalid response format", "raw_response": output}
            
    except subprocess.TimeoutExpired:
        return False, {"error": f"Request timed out after {timeout} seconds"}
    except Exception as e:
        return False, {"error": f"Request failed: {e}"}


@dataclass
class TestConfig:
    """Configuration for DRS API tests"""
    base_url: str = "http://localhost:8000"
    test_user_email: str = "ceo@acme.com"
    test_user_password: str = "123password"
    company_id: int = 11
    timeout: int = 30


class DRSAPITester:
    """Comprehensive tester for all DRS API endpoints"""
    
    def __init__(self, config: TestConfig):
        self.config = config
        self.auth_token: Optional[str] = None
        self.test_results: Dict[str, Any] = {}
        
    def login(self) -> bool:
        """Authenticate and get JWT token"""
        print("🔐 Authenticating...")
        
        login_url = f"{self.config.base_url}/auth/login"
        
        # Use curl for login
        try:
            login_data = json.dumps({
                "email": self.config.test_user_email,
                "password": self.config.test_user_password
            })
            
            cmd = [
                "curl", "-s", "-w", "%{http_code}",
                "-X", "POST",
                "-H", "Content-Type: application/json",
                "-d", login_data,
                "--connect-timeout", str(self.config.timeout),
                login_url
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=self.config.timeout)
            
            if result.returncode != 0:
                print(f"❌ Curl command failed: {result.stderr}")
                return False
            
            output = result.stdout
            if len(output) >= 3:
                http_code = output[-3:]
                response_body = output[:-3]
                
                if http_code == "200":
                    auth_data = json.loads(response_body)
                    self.auth_token = auth_data.get("access_token")
                    print(f"✅ Authentication successful for {auth_data['user']['email']}")
                    print(f"   Company: {auth_data['company']['name']} (ID: {auth_data['user']['companyId']})")
                    return True
                else:
                    print(f"❌ Authentication failed: HTTP {http_code}")
                    print(f"   Response: {response_body}")
                    return False
            else:
                print(f"❌ Invalid response format: {output}")
                return False
                
        except Exception as e:
            print(f"❌ Authentication error: {e}")
            return False
    
    def _make_request(self, endpoint: str) -> tuple[bool, Dict[str, Any]]:
        """Make authenticated request to DRS endpoint"""
        if not self.auth_token:
            return False, {"error": "No auth token"}
            
        url = f"{self.config.base_url}/api/drs/{endpoint}?company_id={self.config.company_id}"
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        return run_curl_command(url, headers, self.config.timeout)
    
    def test_executive_summary(self) -> Dict[str, Any]:
        """Test Executive Summary endpoint"""
        print("📊 Testing Executive Summary...")
        success, data = self._make_request("executive-summary")
        
        result = {
            "endpoint": "executive-summary",
            "success": success,
            "data": data,
            "timestamp": datetime.now().isoformat()
        }
        
        if success and data.get("success"):
            summary = data.get("data", {})
            print(f"   ✅ Revenue Impact: ${summary.get('revenue_impact', 0):,.2f}")
            print(f"   ✅ Cost Savings: {summary.get('cost_savings_percent', 0)}%")
            print(f"   ✅ Global Regions: {summary.get('global_regions', 0)}")
            print(f"   ✅ Active Initiatives: {summary.get('active_initiatives', 0)}")
        else:
            print(f"   ❌ Failed: {data}")
            
        return result
    
    def test_revenue_impact(self) -> Dict[str, Any]:
        """Test Revenue Impact endpoint"""
        print("💰 Testing Revenue Impact...")
        success, data = self._make_request("revenue-impact")
        
        result = {
            "endpoint": "revenue-impact", 
            "success": success,
            "data": data,
            "timestamp": datetime.now().isoformat()
        }
        
        if success and data.get("success"):
            impact = data.get("data", {})
            print(f"   ✅ Cloud Enabled Revenue: ${impact.get('cloud_enabled_revenue', 0):,.2f}")
            print(f"   ✅ Growth vs Baseline: {impact.get('growth_percent', 0)}%")
            print(f"   ✅ Currency: {impact.get('currency', 'N/A')}")
        else:
            print(f"   ❌ Failed: {data}")
            
        return result
    
    def test_time_to_market(self) -> Dict[str, Any]:
        """Test Time to Market endpoint"""
        print("⚡ Testing Time to Market...")
        success, data = self._make_request("time-to-market")
        
        result = {
            "endpoint": "time-to-market",
            "success": success, 
            "data": data,
            "timestamp": datetime.now().isoformat()
        }
        
        if success and data.get("success"):
            ttm = data.get("data", {})
            print(f"   ✅ Current TTM: {ttm.get('current_ttm_days', 0)} days")
            print(f"   ✅ Improvement: {ttm.get('improvement_percent', 0)}%")
            print(f"   ✅ Baseline: {ttm.get('baseline_ttm_days', 0)} days")
        else:
            print(f"   ❌ Failed: {data}")
            
        return result
    
    def test_operating_efficiency(self) -> Dict[str, Any]:
        """Test Operating Efficiency endpoint"""
        print("⚙️ Testing Operating Efficiency...")
        success, data = self._make_request("operating-efficiency")
        
        result = {
            "endpoint": "operating-efficiency",
            "success": success,
            "data": data, 
            "timestamp": datetime.now().isoformat()
        }
        
        if success and data.get("success"):
            efficiency = data.get("data", {})
            print(f"   ✅ Efficiency: {efficiency.get('efficiency_percent', 0)}%")
            print(f"   ✅ Annual Savings: ${efficiency.get('annual_savings', 0):,.2f}")
            print(f"   ✅ Current Cost: ${efficiency.get('current_cost', 0):,.2f}")
        else:
            print(f"   ❌ Failed: {data}")
            
        return result
    
    def test_market_agility(self) -> Dict[str, Any]:
        """Test Market Agility endpoint"""
        print("🎯 Testing Market Agility...")
        success, data = self._make_request("market-agility")
        
        result = {
            "endpoint": "market-agility",
            "success": success,
            "data": data,
            "timestamp": datetime.now().isoformat()
        }
        
        if success and data.get("success"):
            agility = data.get("data", {})
            print(f"   ✅ Agility Score: {agility.get('agility_score', 0)}/10")
            print(f"   ✅ Score Delta: {agility.get('score_delta', 0)}")
            components = agility.get("components", {})
            print(f"   ✅ Components: Delivery={components.get('delivery_responsiveness', 0)}, "
                  f"Cadence={components.get('release_cadence', 0)}, "
                  f"Flexibility={components.get('cloud_flexibility', 0)}")
        else:
            print(f"   ❌ Failed: {data}")
            
        return result
    
    def test_strategic_initiatives(self) -> Dict[str, Any]:
        """Test Strategic Initiatives endpoint"""
        print("🎯 Testing Strategic Initiatives...")
        success, data = self._make_request("strategic-initiatives")
        
        result = {
            "endpoint": "strategic-initiatives",
            "success": success,
            "data": data,
            "timestamp": datetime.now().isoformat()
        }
        
        if success and data.get("success"):
            initiatives_data = data.get("data", {})
            initiatives = initiatives_data.get("initiatives", [])
            print(f"   ✅ Total Initiatives: {initiatives_data.get('total_count', 0)}")
            print(f"   ✅ High Impact: {initiatives_data.get('high_impact_count', 0)}")
            
            for i, init in enumerate(initiatives[:3]):  # Show first 3
                print(f"   ✅ Initiative {i+1}: {init.get('name', 'N/A')} "
                      f"({init.get('progress_percent', 0)}% complete)")
        else:
            print(f"   ❌ Failed: {data}")
            
        return result
    
    def test_financial_impact(self) -> Dict[str, Any]:
        """Test Financial Impact endpoint"""
        print("💵 Testing Financial Impact...")
        success, data = self._make_request("financial-impact")
        
        result = {
            "endpoint": "financial-impact",
            "success": success,
            "data": data,
            "timestamp": datetime.now().isoformat()
        }
        
        if success and data.get("success"):
            financial = data.get("data", {})
            print(f"   ✅ Total Business Value: ${financial.get('total_business_value', 0):,.2f}")
            print(f"   ✅ 3-Year ROI: {financial.get('three_year_roi_percent', 0)}%")
            print(f"   ✅ Payback Period: {financial.get('payback_period_months', 'N/A')} months")
            print(f"   ✅ Annual Savings: ${financial.get('annual_savings', 0):,.2f}")
        else:
            print(f"   ❌ Failed: {data}")
            
        return result
    
    def test_competitive_advantages(self) -> Dict[str, Any]:
        """Test Competitive Advantages endpoint"""
        print("🏆 Testing Competitive Advantages...")
        success, data = self._make_request("competitive-advantages")
        
        result = {
            "endpoint": "competitive-advantages",
            "success": success,
            "data": data,
            "timestamp": datetime.now().isoformat()
        }
        
        if success and data.get("success"):
            advantages_data = data.get("data", {})
            advantages = advantages_data.get("advantages", [])
            print(f"   ✅ Advantages analyzed: {len(advantages)}")
            
            for adv in advantages:
                print(f"   ✅ {adv.get('name', 'N/A')}: {adv.get('score', 0)}/10 "
                      f"({adv.get('strength', 'N/A')})")
        else:
            print(f"   ❌ Failed: {data}")
            
        return result
    
    def test_risk_mitigation(self) -> Dict[str, Any]:
        """Test Risk Mitigation endpoint"""
        print("🛡️ Testing Risk Mitigation...")
        success, data = self._make_request("risk-mitigation")
        
        result = {
            "endpoint": "risk-mitigation",
            "success": success,
            "data": data,
            "timestamp": datetime.now().isoformat()
        }
        
        if success and data.get("success"):
            risk_data = data.get("data", {})
            risk_areas = risk_data.get("risk_areas", [])
            print(f"   ✅ Risk areas assessed: {len(risk_areas)}")
            
            for risk in risk_areas:
                print(f"   ✅ {risk.get('area', 'N/A')}: {risk.get('score', 0)}/10 "
                      f"({risk.get('mitigation_level', 'N/A')})")
        else:
            print(f"   ❌ Failed: {data}")
            
        return result
    
    def test_transformation_impact(self) -> Dict[str, Any]:
        """Test Transformation Impact endpoint"""
        print("🚀 Testing Transformation Impact...")
        success, data = self._make_request("transformation-impact")
        
        result = {
            "endpoint": "transformation-impact",
            "success": success,
            "data": data,
            "timestamp": datetime.now().isoformat()
        }
        
        if success and data.get("success"):
            transformation = data.get("data", {})
            outcomes = transformation.get("transformation_outcomes", [])
            score = transformation.get("overall_transformation_score", 0)
            
            print(f"   ✅ Overall Score: {score}/10")
            for outcome in outcomes:
                print(f"   ✅ {outcome.get('outcome', 'N/A')}: {outcome.get('value', 'N/A')} "
                      f"({outcome.get('trend', 'N/A')})")
        else:
            print(f"   ❌ Failed: {data}")
            
        return result
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Run all DRS endpoint tests"""
        print("=" * 80)
        print("🧪 DRS BUSINESS EXECUTIVE DASHBOARD - API TEST SUITE")
        print("=" * 80)
        print(f"Target: {self.config.base_url}")
        print(f"Company ID: {self.config.company_id}")
        print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 80)
        
        # Authenticate first
        if not self.login():
            return {"error": "Authentication failed", "results": []}
        
        print()
        
        # Test all endpoints
        test_methods = [
            self.test_executive_summary,
            self.test_revenue_impact,
            self.test_time_to_market,
            self.test_operating_efficiency,
            self.test_market_agility,
            self.test_strategic_initiatives,
            self.test_financial_impact,
            self.test_competitive_advantages,
            self.test_risk_mitigation,
            self.test_transformation_impact
        ]
        
        results = []
        successful_tests = 0
        
        for test_method in test_methods:
            try:
                result = test_method()
                results.append(result)
                
                if result["success"]:
                    successful_tests += 1
                    
                time.sleep(0.5)  # Small delay between tests
                
            except Exception as e:
                error_result = {
                    "endpoint": test_method.__name__.replace("test_", ""),
                    "success": False,
                    "error": str(e),
                    "timestamp": datetime.now().isoformat()
                }
                results.append(error_result)
                print(f"   ❌ Exception in {test_method.__name__}: {e}")
        
        # Summary
        print()
        print("=" * 80)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 80)
        print(f"Total Tests: {len(test_methods)}")
        print(f"Successful: {successful_tests}")
        print(f"Failed: {len(test_methods) - successful_tests}")
        print(f"Success Rate: {(successful_tests / len(test_methods) * 100):.1f}%")
        
        # Detailed failures
        failed_tests = [r for r in results if not r["success"]]
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for failed in failed_tests:
                print(f"   - {failed['endpoint']}: {failed.get('error', failed.get('data', {}).get('error', 'Unknown error'))}")
        
        print("=" * 80)
        
        return {
            "total_tests": len(test_methods),
            "successful": successful_tests,
            "failed": len(test_methods) - successful_tests,
            "success_rate": successful_tests / len(test_methods) * 100,
            "results": results,
            "timestamp": datetime.now().isoformat()
        }
    
    def save_results(self, filename: str = None) -> str:
        """Save test results to JSON file"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"tests/drs_test_results_{timestamp}.json"
        
        with open(filename, 'w') as f:
            json.dump(self.test_results, f, indent=2)
        
        return filename


def main():
    """Main test execution"""
    config = TestConfig()
    
    # Allow command line overrides
    if len(sys.argv) > 1:
        config.base_url = sys.argv[1]
    if len(sys.argv) > 2:
        config.company_id = int(sys.argv[2])
    
    tester = DRSAPITester(config)
    
    try:
        # Run all tests
        test_results = tester.run_all_tests()
        tester.test_results = test_results
        
        # Save results
        results_file = tester.save_results()
        print(f"\n📄 Results saved to: {results_file}")
        
        # Exit with appropriate code
        if test_results["success_rate"] == 100:
            print("\n🎉 All tests passed!")
            sys.exit(0)
        else:
            print(f"\n⚠️  Some tests failed. Success rate: {test_results['success_rate']:.1f}%")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n\n⏹️  Tests interrupted by user")
        sys.exit(130)
    except Exception as e:
        print(f"\n❌ Test suite error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()