from fastapi import FastAPI, File, UploadFile, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
import os
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from rag_system import RAGSystem
import tempfile
import shutil
from typing import Optional

# Load .env
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

# Configure Gemini
genai.configure(api_key=api_key)

# Initialize RAG system
rag_system = RAGSystem()

# Create uploads directory
UPLOAD_DIR = "uploads"
VECTORDB_DIR = "vectordb"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(VECTORDB_DIR, exist_ok=True)

# FastAPI app setup
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class Prompt(BaseModel):
    message: str

class RAGPrompt(BaseModel):
    message: str
    use_context: bool = True

@app.post("/ask")
async def ask_gemini(prompt: Prompt):
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(prompt.message)
        return {"response": response.text}
    except Exception as e:
        return {"error": str(e), "message": "Failed to generate response"}

@app.get("/models")
async def list_models():
    try:
        models = genai.list_models()
        return {"models": [model.name for model in models if 'generateContent' in model.supported_generation_methods]}
    except Exception as e:
        return {"error": str(e)}

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    """Upload and process PDF for RAG"""
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    try:
        # Save uploaded file
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Process PDF with RAG system
        success = rag_system.process_pdf(file_path)
        
        if success:
            # Save vector database
            rag_system.save_vectordb(VECTORDB_DIR)
            return {"message": f"PDF {file.filename} processed successfully", "success": True}
        else:
            raise HTTPException(status_code=500, detail="Failed to process PDF")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ask-with-context")
async def ask_with_context(prompt: RAGPrompt):
    """Ask question with RAG context"""
    try:
        # Try to load existing vector database
        if os.path.exists(VECTORDB_DIR):
            try:
                rag_system.load_vectordb(VECTORDB_DIR)
            except:
                pass
        
        context = ""
        if prompt.use_context and rag_system.vectordb is not None:
            context = rag_system.get_context(prompt.message, k=3)
        
        # Create enhanced prompt with context
        if context:
            enhanced_prompt = f"""
Context from documents:
{context}

Question: {prompt.message}

Please answer the question based on the provided context. If the context doesn't contain relevant information, you can provide a general answer but mention that it's not based on the uploaded documents.
"""
        else:
            enhanced_prompt = prompt.message
        
        # Generate response with Gemini
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(enhanced_prompt)
        
        return {
            "response": response.text,
            "context_used": bool(context),
            "context_length": len(context) if context else 0
        }
        
    except Exception as e:
        return {"error": str(e), "message": "Failed to generate response"}

@app.get("/vectordb-status")
async def vectordb_status():
    """Check if vector database is available"""
    has_vectordb = os.path.exists(VECTORDB_DIR) and rag_system.vectordb is not None
    return {
        "has_vectordb": has_vectordb,
        "vectordb_path": VECTORDB_DIR if has_vectordb else None
    }

@app.delete("/clear-vectordb")
async def clear_vectordb():
    """Clear the vector database"""
    try:
        if os.path.exists(VECTORDB_DIR):
            shutil.rmtree(VECTORDB_DIR)
        if os.path.exists(UPLOAD_DIR):
            shutil.rmtree(UPLOAD_DIR)
        
        # Recreate directories
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        os.makedirs(VECTORDB_DIR, exist_ok=True)
        
        # Reset RAG system
        rag_system.vectordb = None
        
        return {"message": "Vector database cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))