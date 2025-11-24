#!/usr/bin/env python3
"""
Verify the comprehensive Jira staging CSV structure
Download and inspect the latest staging CSV to confirm column structure
"""

import asyncio
import sys
import os
import csv
from io import StringIO
from decouple import config

# Add the services directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'services'))

from services.azure_storage import UnifiedAzureBlobStorage

async def verify_jira_staging_csv():
    """Download and verify the staging CSV structure"""
    
    try:
        # Initialize storage client
        storage = UnifiedAzureBlobStorage()
        
        # The latest blob from our test
        blob_name = "company_20/company_20/jira/batch_335_20251030_221215.csv"
        
        print(f"🔍 Downloading staging CSV: {blob_name}")
        
        # Download the blob content
        blob_client = storage.blob_service_client.get_blob_client(
            container="staging",
            blob=blob_name
        )
        
        # Download as text
        blob_data = blob_client.download_blob().readall().decode('utf-8')
        
        # Parse CSV to get headers
        csv_reader = csv.reader(StringIO(blob_data))
        headers = next(csv_reader)
        
        print(f"✅ Successfully downloaded staging CSV")
        print(f"📊 Total columns: {len(headers)}")
        print(f"📝 Column structure:")
        
        # Show first 20 columns
        print("\n🔍 First 20 columns:")
        for i, header in enumerate(headers[:20]):
            print(f"  {i+1:2d}. {header}")
        
        print(f"\n... and {len(headers)-20} more columns")
        
        # Show all columns as comma-separated list
        print(f"\n📋 All columns:")
        print(", ".join(headers))
        
        # Count records
        total_records = sum(1 for line in StringIO(blob_data)) - 1  # subtract header
        print(f"\n📈 Total records: {total_records}")
        
        # Show sample data from first record
        csv_reader = csv.reader(StringIO(blob_data))
        next(csv_reader)  # skip header
        first_record = next(csv_reader, None)
        
        if first_record:
            print(f"\n🔍 Sample data (first 10 fields):")
            for i, value in enumerate(first_record[:10]):
                print(f"  {headers[i]}: {value}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(verify_jira_staging_csv())