'use client'

import { useState } from 'react'
import { Upload, FileText, X } from 'lucide-react'

interface FileUploadProps {
  onUpload: (data: any) => void
}

export default function FileUpload({ onUpload }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelection(files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelection(files[0])
    }
  }

  const handleFileSelection = (file: File) => {
    // Validate file type
    const allowedTypes = ['text/csv', 'application/json', 'application/vnd.ms-excel']
    const allowedExtensions = ['.csv', '.json', '.xlsx']
    
    const isValidType = allowedTypes.includes(file.type) || 
      allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
    
    if (!isValidType) {
      alert('Please upload a CSV, JSON, or Excel file')
      return
    }

    setUploadedFile(file)
  }

  const processFile = async () => {
    if (!uploadedFile) return

    setIsProcessing(true)
    
    try {
      // In a real app, this would send the file to the backend
      // For now, we'll simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock processed data
      const mockData = {
        fileName: uploadedFile.name,
        recordsProcessed: 1250,
        totalCost: 125430.50,
        dateRange: '2024-01-01 to 2024-06-30'
      }
      
      onUpload(mockData)
      setUploadedFile(null)
    } catch (error) {
      console.error('File processing error:', error)
      alert('Error processing file. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-4">
      {!uploadedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Upload Cost Data
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Drag and drop your CSV, JSON, or Excel file here, or click to browse
          </p>
          <input
            type="file"
            onChange={handleFileInput}
            accept=".csv,.json,.xlsx,.xls"
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="btn-primary cursor-pointer inline-block"
          >
            Choose File
          </label>
          <p className="text-xs text-gray-500 mt-2">
            Supported formats: CSV, JSON, Excel (max 10MB)
          </p>
        </div>
      ) : (
        <div className="border border-gray-300 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">{uploadedFile.name}</h4>
                <p className="text-sm text-gray-500">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={() => setUploadedFile(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              <strong>File Format:</strong> {uploadedFile.type || 'Unknown'}
            </div>
            
            <button
              onClick={processFile}
              disabled={isProcessing}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : 'Process & Upload'}
            </button>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-3"></div>
            <span className="text-sm text-blue-700">
              Processing file and normalizing to FOCUS schema...
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
