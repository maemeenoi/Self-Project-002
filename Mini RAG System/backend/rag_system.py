from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
from langchain.schema import Document
import os
import pickle
from typing import List, Optional
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RAGSystem:
    def __init__(self):
        # Use HuggingFace embeddings (free alternative to OpenAI)
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        self.vectordb = None
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500, 
            chunk_overlap=100,
            length_function=len
        )
        
    def load_pdf(self, pdf_path: str) -> List[Document]:
        """Load PDF document and return pages"""
        try:
            loader = PyPDFLoader(pdf_path)
            pages = loader.load()
            logger.info(f"Loaded {len(pages)} pages from {pdf_path}")
            return pages
        except Exception as e:
            logger.error(f"Error loading PDF: {str(e)}")
            raise
    
    def create_chunks(self, documents: List[Document]) -> List[Document]:
        """Split documents into chunks"""
        try:
            chunks = self.text_splitter.split_documents(documents)
            logger.info(f"Created {len(chunks)} chunks")
            return chunks
        except Exception as e:
            logger.error(f"Error creating chunks: {str(e)}")
            raise
    
    def create_vectordb(self, chunks: List[Document]) -> FAISS:
        """Create vector database from chunks"""
        try:
            self.vectordb = FAISS.from_documents(chunks, self.embeddings)
            logger.info("Vector database created successfully")
            return self.vectordb
        except Exception as e:
            logger.error(f"Error creating vector database: {str(e)}")
            raise
    
    def save_vectordb(self, path: str):
        """Save vector database to disk"""
        if self.vectordb is None:
            raise ValueError("No vector database to save")
        
        try:
            self.vectordb.save_local(path)
            logger.info(f"Vector database saved to {path}")
        except Exception as e:
            logger.error(f"Error saving vector database: {str(e)}")
            raise
    
    def load_vectordb(self, path: str):
        """Load vector database from disk"""
        try:
            self.vectordb = FAISS.load_local(path, self.embeddings, allow_dangerous_deserialization=True)
            logger.info(f"Vector database loaded from {path}")
        except Exception as e:
            logger.error(f"Error loading vector database: {str(e)}")
            raise
    
    def similarity_search(self, query: str, k: int = 3) -> List[Document]:
        """Search for similar documents"""
        if self.vectordb is None:
            raise ValueError("No vector database available")
        
        try:
            docs = self.vectordb.similarity_search(query, k=k)
            logger.info(f"Found {len(docs)} similar documents")
            return docs
        except Exception as e:
            logger.error(f"Error during similarity search: {str(e)}")
            raise
    
    def process_pdf(self, pdf_path: str) -> bool:
        """Complete pipeline: load PDF, create chunks, and build vector database"""
        try:
            # Load PDF
            pages = self.load_pdf(pdf_path)
            
            # Create chunks
            chunks = self.create_chunks(pages)
            
            # Create vector database
            self.create_vectordb(chunks)
            
            return True
        except Exception as e:
            logger.error(f"Error processing PDF: {str(e)}")
            return False
    
    def get_context(self, query: str, k: int = 3) -> str:
        """Get relevant context for a query"""
        if self.vectordb is None:
            return ""
        
        try:
            docs = self.similarity_search(query, k=k)
            context = "\n\n".join([doc.page_content for doc in docs])
            return context
        except Exception as e:
            logger.error(f"Error getting context: {str(e)}")
            return ""
