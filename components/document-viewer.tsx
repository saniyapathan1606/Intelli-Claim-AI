"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Search, Eye, Download, HighlighterIcon as Highlight } from "lucide-react"

interface DocumentViewerProps {
  uploadedDocs: any[]
}

export function DocumentViewer({ uploadedDocs }: DocumentViewerProps) {
  const [selectedDoc, setSelectedDoc] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [highlightedText, setHighlightedText] = useState("")

  const handleSelectDocument = async (docId: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/documents/${docId}`)
      const fullDoc = await res.json()
      setSelectedDoc(fullDoc)
    } catch (error) {
      console.error("Error fetching document:", error)
    }
  }

  const highlightText = (text: string, highlight: string) => {
    if (!highlight) return text
    const parts = text.split(new RegExp(`(${highlight})`, "gi"))
    return parts
      .map((part, index) =>
        part.toLowerCase() === highlight.toLowerCase()
          ? `<mark key=${index} class="bg-yellow-200">${part}</mark>`
          : part,
      )
      .join("")
  }

  if (uploadedDocs.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h3>
          <p className="text-gray-500">Upload documents first to view and search through them</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Document Viewer & Search</CardTitle>
          <CardDescription>View uploaded documents and search through their content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Input
              placeholder="Search within documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button onClick={() => setHighlightedText(searchTerm)} disabled={!searchTerm}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Documents ({uploadedDocs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uploadedDocs.map((doc) => (
                <div
                  key={doc.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedDoc?.id === doc.id ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleSelectDocument(doc.id)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-sm truncate">{doc.name}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {doc.metadata.pages} pages • {(doc.size / 1024).toFixed(1)} KB
                  </div>
                  <Badge variant="outline" className="text-xs mt-1">
                    {(doc.metadata.confidence * 100).toFixed(0)}% confidence
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Document Content */}
        <div className="lg:col-span-2">
          {selectedDoc ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {selectedDoc.name}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Full View
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Uploaded: {new Date(selectedDoc.uploadedAt).toLocaleString()} • {selectedDoc.metadata.pages} pages •
                  Language: {selectedDoc.metadata.language.toUpperCase()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="content" className="w-full">
                  <TabsList>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="metadata">Metadata</TabsTrigger>
                    <TabsTrigger value="analysis">Analysis</TabsTrigger>
                  </TabsList>

                  <TabsContent value="content" className="mt-4">
                    <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                      <div
                        className="text-sm leading-relaxed whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{
                          __html: highlightText(selectedDoc.extractedText, highlightedText),
                        }}
                      />
                    </div>
                    {highlightedText && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                        <Highlight className="w-4 h-4" />
                        Highlighting: "{highlightedText}"
                        <Button variant="ghost" size="sm" onClick={() => setHighlightedText("")}>
                          Clear
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="metadata" className="mt-4">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">File Size:</span>
                          <span className="ml-2">{(selectedDoc.size / 1024).toFixed(1)} KB</span>
                        </div>
                        <div>
                          <span className="font-medium">Pages:</span>
                          <span className="ml-2">{selectedDoc.metadata.pages}</span>
                        </div>
                        <div>
                          <span className="font-medium">Language:</span>
                          <span className="ml-2">{selectedDoc.metadata.language.toUpperCase()}</span>
                        </div>
                        <div>
                          <span className="font-medium">Confidence:</span>
                          <span className="ml-2">{(selectedDoc.metadata.confidence * 100).toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="font-medium">Type:</span>
                          <span className="ml-2">{selectedDoc.type}</span>
                        </div>
                        <div>
                          <span className="font-medium">Status:</span>
                          <Badge variant="outline" className="ml-2">
                            {selectedDoc.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="analysis" className="mt-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Document Classification</h4>
                        <div className="flex gap-2">
                          <Badge>Policy Document</Badge>
                          <Badge variant="outline">Insurance</Badge>
                          <Badge variant="outline">Terms & Conditions</Badge>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Key Entities Detected</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="bg-blue-50 p-2 rounded">
                            <span className="font-medium">Coverage Types:</span>
                            <div className="text-xs mt-1">Medical, Surgical, Emergency</div>
                          </div>
                          <div className="bg-green-50 p-2 rounded">
                            <span className="font-medium">Locations:</span>
                            <div className="text-xs mt-1">Mumbai, Delhi, Pune, Bangalore</div>
                          </div>
                          <div className="bg-purple-50 p-2 rounded">
                            <span className="font-medium">Amounts:</span>
                            <div className="text-xs mt-1">₹50,000, ₹1,00,000, ₹5,00,000</div>
                          </div>
                          <div className="bg-orange-50 p-2 rounded">
                            <span className="font-medium">Time Periods:</span>
                            <div className="text-xs mt-1">6 months, 1 year, 2 years</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Readability Score</h4>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: "78%" }}></div>
                          </div>
                          <span className="text-sm">78/100</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Good readability for legal documents</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a document</h3>
                <p className="text-gray-500">Choose a document from the list to view its content and metadata</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
