import os, json
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from azure.storage.blob import BlobServiceClient
from dotenv import load_dotenv
import io

load_dotenv()
app = FastAPI()

# GitHub token
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

# Azure blob setup
AZURE_CONN = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
CONTAINER = os.getenv("AZURE_BLOB_CONTAINER", "staging")

# Initialize blob service with error handling
blob_service = None
container_client = None

try:
    if AZURE_CONN:
        blob_service = BlobServiceClient.from_connection_string(AZURE_CONN)
        container_client = blob_service.get_container_client(CONTAINER)
        print(f"✅ Connected to Azure Blob Storage, container: {CONTAINER}")
    else:
        print("⚠️ Azure connection string not found in environment variables")
except Exception as e:
    print(f"❌ Error connecting to Azure Blob Storage: {e}")

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Azure Blob Storage API",
        "status": "running",
        "azure_connected": container_client is not None
    }

@app.post("/github/prs-to-blob/{owner}/{repo}")
async def prs_to_blob(owner: str, repo: str):
    """Fetch GitHub PRs and save to Azure Blob Storage."""
    if not container_client:
        return {"error": "Azure Blob Storage not configured"}
    
    url = f"https://api.github.com/repos/{owner}/{repo}/pulls"
    headers = {"Authorization": f"Bearer {GITHUB_TOKEN}", "Accept": "application/vnd.github+json"}

    async with httpx.AsyncClient() as client:
        resp = await client.get(url, headers=headers)
        resp.raise_for_status()
        pulls = resp.json()

    blob_name = f"github_{owner}_{repo}_prs.json"
    container_client.upload_blob(name=blob_name, data=json.dumps(pulls, indent=2), overwrite=True)

    return {"message": f"Saved {len(pulls)} PRs into {blob_name}"}

@app.get("/list-blobs")
async def list_blobs():
    """List all blobs in the container."""
    if not container_client:
        return {"error": "Azure Blob Storage not configured"}
    
    try:
        blob_list = container_client.list_blobs()
        blobs = [blob.name for blob in blob_list]
        return {"blobs": blobs, "count": len(blobs)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing blobs: {str(e)}")

@app.get("/view-json/{blob_name}")
async def view_json_file(blob_name: str):
    """Get JSON content from blob storage and return as JSON response."""
    if not container_client:
        return {"error": "Azure Blob Storage not configured"}
    
    try:
        blob_client = container_client.get_blob_client(blob_name)
        
        if not blob_client.exists():
            raise HTTPException(status_code=404, detail=f"File '{blob_name}' not found")
        
        # Download and parse JSON
        blob_data = blob_client.download_blob()
        content = blob_data.readall().decode('utf-8')
        
        # Try to parse as JSON
        try:
            json_data = json.loads(content)
            return JSONResponse(content=json_data)
        except json.JSONDecodeError:
            # If not valid JSON, return as text
            return {"content": content, "type": "text"}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading file: {str(e)}")

@app.get("/download-file/{blob_name}")
async def download_file(blob_name: str):
    """Download a file directly from blob storage."""
    if not container_client:
        return {"error": "Azure Blob Storage not configured"}
    
    try:
        blob_client = container_client.get_blob_client(blob_name)
        
        # Check if blob exists
        if not blob_client.exists():
            raise HTTPException(status_code=404, detail=f"File '{blob_name}' not found")
        
        # Get blob data
        blob_data = blob_client.download_blob()
        content = blob_data.readall()
        
        # Return as streaming response
        return StreamingResponse(
            io.BytesIO(content),
            media_type="application/octet-stream",
            headers={"Content-Disposition": f"attachment; filename={blob_name}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error downloading file: {str(e)}")