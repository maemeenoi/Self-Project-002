#!/usr/bin/env python3
"""
Service Organization Test Suite

This script tests all reorganized services to ensure imports and basic functionality work correctly.
Run this after reorganizing the services folder structure.
"""

import sys
import os
import traceback
from typing import Dict, List, Any

# Add the project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class ServiceTester:
    def __init__(self):
        self.results = {
            'passed': [],
            'failed': [],
            'warnings': []
        }
    
    def test_import(self, module_path: str, expected_classes: List[str] = None, expected_functions: List[str] = None):
        """Test importing a module and check for expected classes/functions"""
        try:
            print(f"🔍 Testing import: {module_path}")
            
            # Import the module
            module = __import__(module_path, fromlist=[''])
            
            # Check expected classes
            if expected_classes:
                for cls_name in expected_classes:
                    if hasattr(module, cls_name):
                        print(f"  ✅ Class '{cls_name}' found")
                    else:
                        raise ImportError(f"Expected class '{cls_name}' not found in {module_path}")
            
            # Check expected functions
            if expected_functions:
                for func_name in expected_functions:
                    if hasattr(module, func_name):
                        print(f"  ✅ Function '{func_name}' found")
                    else:
                        raise ImportError(f"Expected function '{func_name}' not found in {module_path}")
            
            self.results['passed'].append(module_path)
            print(f"  ✅ {module_path} - PASSED\n")
            return True
            
        except Exception as e:
            self.results['failed'].append(f"{module_path}: {str(e)}")
            print(f"  ❌ {module_path} - FAILED: {str(e)}\n")
            return False
    
    def test_service_instantiation(self, module_path: str, class_name: str, instance_name: str = None):
        """Test creating an instance of a service class"""
        try:
            print(f"🏗️  Testing instantiation: {module_path}.{class_name}")
            
            module = __import__(module_path, fromlist=[class_name])
            service_class = getattr(module, class_name)
            
            # Try to instantiate
            instance = service_class()
            print(f"  ✅ {class_name} instantiated successfully")
            
            # Check for instance if specified
            if instance_name and hasattr(module, instance_name):
                global_instance = getattr(module, instance_name)
                print(f"  ✅ Global instance '{instance_name}' found")
            
            self.results['passed'].append(f"{module_path}.{class_name}")
            print(f"  ✅ {module_path}.{class_name} - PASSED\n")
            return True
            
        except Exception as e:
            self.results['failed'].append(f"{module_path}.{class_name}: {str(e)}")
            print(f"  ❌ {module_path}.{class_name} - FAILED: {str(e)}\n")
            return False
    
    def run_all_tests(self):
        """Run comprehensive test suite for all reorganized services"""
        
        print("=" * 80)
        print("🧪 SERVICE ORGANIZATION TEST SUITE")
        print("=" * 80)
        print()
        
        # Test 1: Main Services Package
        print("📦 TESTING MAIN SERVICES PACKAGE")
        print("-" * 40)
        self.test_import('services')
        
        # Test 2: Cloud Services
        print("☁️  TESTING CLOUD SERVICES")
        print("-" * 40)
        self.test_import('services.cloud')
        self.test_import('services.cloud.aws_service', ['AWSService'])
        self.test_import('services.cloud.azure_cost_service', ['AzureService'])
        self.test_import('services.cloud.azure_storage', ['UnifiedAzureBlobStorage'])
        self.test_import('services.cloud.gcp_service', ['GCPService'])
        self.test_import('services.cloud.cloud_api_service', 
                        expected_functions=['fetch_azure_forecast_data', 'fetch_aws_detailed_costs'])
        
        # Test 3: Integration Services
        print("🔌 TESTING INTEGRATION SERVICES")
        print("-" * 40)
        self.test_import('services.integrations')
        self.test_import('services.integrations.github_service', ['GitHubService'])
        self.test_import('services.integrations.github_service_optimized', ['OptimizedGitHubService'])
        self.test_import('services.integrations.jira_service', ['JiraService'])
        self.test_import('services.integrations.integration_service', ['IntegrationService'])
        
        # Test 4: AI Services
        print("🤖 TESTING AI SERVICES")
        print("-" * 40)
        self.test_import('services.ai')
        self.test_import('services.ai.azure_openai_service', ['AzureOpenAIService'])
        self.test_import('services.ai.transformation_ai_service', ['TransformationAIService'])
        
        # Test 5: Automation Services
        print("⚙️  TESTING AUTOMATION SERVICES")
        print("-" * 40)
        self.test_import('services.automation')
        self.test_import('services.automation.automated_baseline_service', ['AutomatedBaselineService'])
        self.test_import('services.automation.data_ingestion_service', ['DataIngestionService'])
        
        # Test 6: Core Services
        print("🔧 TESTING CORE SERVICES")
        print("-" * 40)
        self.test_import('services.core')
        self.test_import('services.core.encryption', 
                        ['EncryptionService'],
                        ['encrypt_integration_secrets', 'decrypt_integration_secrets'])
        
        # Test 7: Service Instantiation
        print("🏗️  TESTING SERVICE INSTANTIATION")
        print("-" * 40)
        
        # Cloud services
        self.test_service_instantiation('services.cloud.aws_service', 'AWSService')
        self.test_service_instantiation('services.cloud.azure_cost_service', 'AzureService')
        self.test_service_instantiation('services.cloud.gcp_service', 'GCPService')
        
        # Integration services
        self.test_service_instantiation('services.integrations.github_service', 'GitHubService')
        self.test_service_instantiation('services.integrations.jira_service', 'JiraService')
        self.test_service_instantiation('services.integrations.integration_service', 'IntegrationService')
        
        # AI services
        self.test_service_instantiation('services.ai.azure_openai_service', 'AzureOpenAIService', 'azure_openai_service')
        self.test_service_instantiation('services.ai.transformation_ai_service', 'TransformationAIService', 'transformation_ai_service')
        
        # Automation services
        self.test_service_instantiation('services.automation.automated_baseline_service', 'AutomatedBaselineService', 'baseline_service')
        self.test_service_instantiation('services.automation.data_ingestion_service', 'DataIngestionService')
        
        # Core services
        self.test_service_instantiation('services.core.encryption', 'EncryptionService')
        
        # Test 8: Cross-package imports (Critical for DRS widgets)
        print("🔗 TESTING CRITICAL CROSS-PACKAGE IMPORTS")
        print("-" * 40)
        
        # Test the imports that DRS widgets use
        try:
            from services.ai.transformation_ai_service import transformation_ai_service
            print("  ✅ DRS import: transformation_ai_service - PASSED")
            self.results['passed'].append('DRS transformation_ai_service import')
        except Exception as e:
            print(f"  ❌ DRS import: transformation_ai_service - FAILED: {e}")
            self.results['failed'].append(f'DRS transformation_ai_service import: {e}')
        
        try:
            from services.automation.automated_baseline_service import baseline_service
            print("  ✅ DRS import: baseline_service - PASSED")
            self.results['passed'].append('DRS baseline_service import')
        except Exception as e:
            print(f"  ❌ DRS import: baseline_service - FAILED: {e}")
            self.results['failed'].append(f'DRS baseline_service import: {e}')
        
        try:
            from services.ai.azure_openai_service import azure_openai_service
            print("  ✅ CTO import: azure_openai_service - PASSED")
            self.results['passed'].append('CTO azure_openai_service import')
        except Exception as e:
            print(f"  ❌ CTO import: azure_openai_service - FAILED: {e}")
            self.results['failed'].append(f'CTO azure_openai_service import: {e}')
        
        try:
            from services.core.encryption import encrypt_integration_secrets, decrypt_integration_secrets
            print("  ✅ Integration import: encryption functions - PASSED")
            self.results['passed'].append('Integration encryption functions import')
        except Exception as e:
            print(f"  ❌ Integration import: encryption functions - FAILED: {e}")
            self.results['failed'].append(f'Integration encryption functions import: {e}')
        
        print()
        
        # Print Summary
        self.print_summary()
    
    def print_summary(self):
        """Print test results summary"""
        print("=" * 80)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.results['passed']) + len(self.results['failed']) + len(self.results['warnings'])
        passed_count = len(self.results['passed'])
        failed_count = len(self.results['failed'])
        warning_count = len(self.results['warnings'])
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_count}")
        print(f"❌ Failed: {failed_count}")
        print(f"⚠️  Warnings: {warning_count}")
        print()
        
        if failed_count == 0:
            print("🎉 ALL TESTS PASSED! Service reorganization is successful!")
            print("   The reorganized services folder structure is working correctly.")
        else:
            print("❌ SOME TESTS FAILED. Issues found with service reorganization:")
            print("\nFailed tests:")
            for failure in self.results['failed']:
                print(f"  - {failure}")
        
        if warning_count > 0:
            print("\nWarnings:")
            for warning in self.results['warnings']:
                print(f"  - {warning}")
        
        print()
        print("=" * 80)
        
        return failed_count == 0

def main():
    """Run the service organization test suite"""
    tester = ServiceTester()
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()