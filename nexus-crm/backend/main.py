# nexus-crm/backend/main.py
from fastapi import FastAPI

app = FastAPI(title="NexusCRM API")

@app.get("/")
async def read_root():
    return {"message": "Welcome to NexusCRM API"}
