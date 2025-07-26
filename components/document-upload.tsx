"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, File, Mail, CheckCircle, AlertCircle, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DocumentUploadProps {
  onDocsUploaded: (docs: any[]) => void
  uploadedDocs: any[]
}

export function DocumentUpload({ onDocsUploaded, uploadedDocs }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const { toast } = useToast()

const handleFileUpload = useCallback(
  async (files: FileList) => {
    setUploading(true)
    setUploadProgress(0)

    try {
      const newDocs = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setUploadProgress((i / files.length) * 100)

        const formData = new FormData()
        formData.append("file", file)

        const res = await fetch("http://localhost:5000/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!res.ok) throw new Error("Upload failed")

        const doc = await res.json()
        newDocs.push(doc)
      }

      setUploadProgress(100)
      onDocsUploaded([...uploadedDocs, ...newDocs])

      toast({
        title: "Documents uploaded successfully",
        description: `${files.length} document(s) processed and stored.`,
      })
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload failed",
        description: "There was an error uploading the document.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  },
  [uploadedDocs, onDocsUploaded, toast]
)

  const removeDocument = (docId: number) => {
    onDocsUploaded(uploadedDocs.filter((doc) => doc.id !== docId))
    toast({
      title: "Document removed",
      description: "Document has been removed from the system",
    })
  }

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return <FileText className="w-5 h-5 text-red-500" />
    if (type.includes("word")) return <File className="w-5 h-5 text-blue-500" />
    if (type.includes("email")) return <Mail className="w-5 h-5 text-green-500" />
    return <File className="w-5 h-5 text-gray-500" />
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Document Upload
          </CardTitle>
          <CardDescription>
            Upload policy documents, contracts, emails, and other relevant files. Supported formats: PDF, Word, TXT, EML
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
            onDrop={(e) => {
              e.preventDefault()
              const files = e.dataTransfer.files
              if (files.length > 0) {
                handleFileUpload(files)
              }
            }}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => {
              const input = document.createElement("input")
              input.type = "file"
              input.multiple = true
              input.accept = ".pdf,.doc,.docx,.txt,.eml"
              input.onchange = (e) => {
                const files = (e.target as HTMLInputElement).files
                if (files) handleFileUpload(files)
              }
              input.click()
            }}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">Drop files here or click to upload</p>
            <p className="text-sm text-gray-500">PDF, Word, Text, and Email files supported</p>
          </div>

          {uploading && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Processing documents...</span>
                <span className="text-sm text-gray-600">{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Uploaded Documents */}
      {uploadedDocs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Documents ({uploadedDocs.length})</CardTitle>
            <CardDescription>Documents are automatically processed and indexed for semantic search</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedDocs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getFileIcon(doc.type)}
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{(doc.size / 1024).toFixed(1)} KB</span>
                        <span>•</span>
                        <span>{doc.metadata.pages} pages</span>
                        <span>•</span>
                        <span>Confidence: {(doc.metadata.confidence * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Processed
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(doc.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Text Extraction</p>
                <p className="text-sm text-gray-600">OCR & parsing for all formats</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Semantic Indexing</p>
                <p className="text-sm text-gray-600">Vector embeddings for search</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Auto Classification</p>
                <p className="text-sm text-gray-600">Document type detection</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
