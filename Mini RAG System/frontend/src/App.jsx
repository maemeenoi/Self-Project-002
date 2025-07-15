import { useState, useEffect, useRef } from "react"
import axios from "axios"

function App() {
  // State management
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [useContext, setUseContext] = useState(true)
  const [vectorDbStatus, setVectorDbStatus] = useState({ has_vectordb: false })
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [availableModels, setAvailableModels] = useState([])
  const [stats, setStats] = useState({ totalMessages: 0, contextUsed: 0 })
  const [activeTab, setActiveTab] = useState("chat")

  // Refs
  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)

  // API Base URL
  const API_BASE = "http://localhost:8000"

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize data on component mount
  useEffect(() => {
    checkVectorDbStatus()
    fetchAvailableModels()

    // Add welcome message
    setMessages([
      {
        type: "system",
        content:
          "🤖 Welcome to Mini RAG System! Upload a PDF to get started with context-aware AI responses.",
        timestamp: new Date().toLocaleTimeString(),
      },
    ])
  }, [])

  // Check vector database status
  const checkVectorDbStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE}/vectordb-status`)
      setVectorDbStatus(response.data)
    } catch (error) {
      console.error("Error checking vector DB status:", error)
    }
  }

  // Fetch available models
  const fetchAvailableModels = async () => {
    try {
      const response = await axios.get(`${API_BASE}/models`)
      setAvailableModels(response.data.models || [])
    } catch (error) {
      console.error("Error fetching models:", error)
    }
  }

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.name.endsWith(".pdf")) {
      alert("Please upload a PDF file")
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await axios.post(`${API_BASE}/upload-pdf`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          setUploadProgress(percentCompleted)
        },
      })

      if (response.data.success) {
        setMessages((prev) => [
          ...prev,
          {
            type: "system",
            content: `✅ PDF "${file.name}" uploaded and processed successfully! You can now ask questions about the document.`,
            timestamp: new Date().toLocaleTimeString(),
          },
        ])
        checkVectorDbStatus()
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          type: "error",
          content: `❌ Error uploading PDF: ${
            error.response?.data?.detail || error.message
          }`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ])
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Handle asking question
  const handleAsk = async () => {
    if (!input.trim()) return

    const userMessage = {
      type: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const endpoint = useContext ? "/ask-with-context" : "/ask"
      const payload = useContext
        ? { message: input, use_context: useContext }
        : { message: input }

      const response = await axios.post(`${API_BASE}${endpoint}`, payload)

      const aiMessage = {
        type: "ai",
        content: response.data.response,
        timestamp: new Date().toLocaleTimeString(),
        contextUsed: response.data.context_used,
        contextLength: response.data.context_length,
      }

      setMessages((prev) => [...prev, aiMessage])

      // Update stats
      setStats((prev) => ({
        totalMessages: prev.totalMessages + 1,
        contextUsed: prev.contextUsed + (response.data.context_used ? 1 : 0),
      }))
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          type: "error",
          content: `❌ Error: ${error.response?.data?.error || error.message}`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ])
    } finally {
      setIsLoading(false)
      setInput("")
    }
  }

  // Clear vector database
  const clearVectorDb = async () => {
    if (
      !confirm(
        "Are you sure you want to clear the vector database? This will remove all uploaded documents."
      )
    ) {
      return
    }

    try {
      await axios.delete(`${API_BASE}/clear-vectordb`)
      setMessages((prev) => [
        ...prev,
        {
          type: "system",
          content:
            "🗑️ Vector database cleared successfully. Upload new documents to continue.",
          timestamp: new Date().toLocaleTimeString(),
        },
      ])
      checkVectorDbStatus()
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          type: "error",
          content: `❌ Error clearing database: ${
            error.response?.data?.detail || error.message
          }`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ])
    }
  }

  // Clear chat history
  const clearChat = () => {
    setMessages([
      {
        type: "system",
        content: "🧹 Chat history cleared.",
        timestamp: new Date().toLocaleTimeString(),
      },
    ])
    setStats({ totalMessages: 0, contextUsed: 0 })
  }

  // Handle enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleAsk()
    }
  }

  // Message component
  const Message = ({ message }) => {
    const messageStyles = {
      user: "bg-blue-100 border-l-4 border-blue-500 ml-12",
      ai: "bg-green-100 border-l-4 border-green-500 mr-12",
      system: "bg-gray-100 border-l-4 border-gray-500",
      error: "bg-red-100 border-l-4 border-red-500",
    }

    return (
      <div className={`p-4 mb-4 rounded-lg ${messageStyles[message.type]}`}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold">
                {message.type === "user"
                  ? "👤 You"
                  : message.type === "ai"
                  ? "🤖 Gemini"
                  : message.type === "system"
                  ? "🔧 System"
                  : "❌ Error"}
              </span>
              <span className="text-xs text-gray-500">{message.timestamp}</span>
            </div>
            <div className="whitespace-pre-wrap text-gray-800">
              {message.content}
            </div>
            {message.contextUsed !== undefined && (
              <div className="mt-2 text-xs text-gray-600">
                {message.contextUsed
                  ? `✅ Context used (${message.contextLength} chars)`
                  : "❌ No context used"}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            🚀 Mini RAG System
          </h1>
          <p className="text-gray-600">
            Retrieval-Augmented Generation with Google Gemini
          </p>
        </div>

        {/* Status Bar */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalMessages}
              </div>
              <div className="text-sm text-gray-600">Total Messages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.contextUsed}
              </div>
              <div className="text-sm text-gray-600">Context Used</div>
            </div>
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${
                  vectorDbStatus.has_vectordb
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {vectorDbStatus.has_vectordb ? "✅" : "❌"}
              </div>
              <div className="text-sm text-gray-600">Vector DB</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {availableModels.length}
              </div>
              <div className="text-sm text-gray-600">AI Models</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-white rounded-lg shadow-lg mb-6">
          <button
            className={`flex-1 py-3 px-6 text-center font-medium rounded-l-lg transition-colors ${
              activeTab === "chat"
                ? "bg-blue-500 text-white"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("chat")}
          >
            💬 Chat
          </button>
          <button
            className={`flex-1 py-3 px-6 text-center font-medium transition-colors ${
              activeTab === "upload"
                ? "bg-blue-500 text-white"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("upload")}
          >
            📄 Upload
          </button>
          <button
            className={`flex-1 py-3 px-6 text-center font-medium rounded-r-lg transition-colors ${
              activeTab === "settings"
                ? "bg-blue-500 text-white"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("settings")}
          >
            ⚙️ Settings
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Chat Tab */}
          {activeTab === "chat" && (
            <div className="flex flex-col h-96">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message, index) => (
                  <Message key={index} message={message} />
                ))}
                {isLoading && (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-gray-600">
                      AI is thinking...
                    </span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t p-4">
                <div className="flex items-center gap-2 mb-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={useContext}
                      onChange={(e) => setUseContext(e.target.checked)}
                      className="rounded"
                    />
                    Use RAG Context
                  </label>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      vectorDbStatus.has_vectordb
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {vectorDbStatus.has_vectordb
                      ? "Documents loaded"
                      : "No documents"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything..."
                    className="flex-1 border rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="2"
                  />
                  <button
                    onClick={handleAsk}
                    disabled={isLoading || !input.trim()}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? "..." : "Send"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === "upload" && (
            <div className="p-6">
              <div className="text-center">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">
                    Upload PDF Documents
                  </h3>
                  <p className="text-gray-600">
                    Upload PDF files to enable context-aware AI responses
                  </p>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="text-4xl mb-4">📄</div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isUploading ? "Uploading..." : "Select PDF File"}
                  </button>
                  <p className="text-sm text-gray-600 mt-2">
                    Only PDF files are supported
                  </p>
                </div>

                {isUploading && (
                  <div className="mb-6">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Processing: {uploadProgress}%
                    </p>
                  </div>
                )}

                <div className="text-left bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">How it works:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Upload a PDF document</li>
                    <li>• The system processes and creates embeddings</li>
                    <li>• Ask questions about the document content</li>
                    <li>• Get accurate, context-aware responses</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">
                    System Settings
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Vector Database</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Status: {vectorDbStatus.has_vectordb ? "Active" : "Empty"}
                    </p>
                    <button
                      onClick={clearVectorDb}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                    >
                      Clear Database
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Chat History</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Messages: {stats.totalMessages}
                    </p>
                    <button
                      onClick={clearChat}
                      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                    >
                      Clear Chat
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Available Models</h4>
                  <div className="text-sm text-gray-600">
                    {availableModels.length > 0 ? (
                      <ul className="list-disc list-inside">
                        {availableModels.slice(0, 3).map((model, index) => (
                          <li key={index}>{model}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>Loading models...</p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">System Information</h4>
                  <div className="text-sm text-gray-600 grid grid-cols-2 gap-2">
                    <div>Backend: FastAPI</div>
                    <div>Frontend: React</div>
                    <div>AI Model: Gemini 2.0</div>
                    <div>Vector DB: FAISS</div>
                    <div>Embeddings: HuggingFace</div>
                    <div>Status: Online</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>🚀 Mini RAG System - Powered by Google Gemini & LangChain</p>
        </div>
      </div>
    </div>
  )
}

export default App
