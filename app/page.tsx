"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, Search, Brain, CheckCircle, XCircle, History } from "lucide-react"
import { DocumentUpload } from "@/components/document-upload"
import { QueryProcessor } from "@/components/query-processor"
import { DecisionHistory } from "@/components/decision-history"
import { DocumentViewer } from "@/components/document-viewer"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("upload")
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([])
  const [decisions, setDecisions] = useState<any[]>([])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">IntelliClaim AI</h1>
          <p className="text-lg text-gray-600 mb-4">Advanced LLM-Powered Document Processing & Decision Engine</p>
          <div className="flex justify-center gap-2 flex-wrap">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Brain className="w-3 h-3 mr-1" />
              Semantic Search
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Auto Decision
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <FileText className="w-3 h-3 mr-1" />
              Multi-Format
            </Badge>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              <History className="w-3 h-3 mr-1" />
              Audit Trail
            </Badge>
          </div>
        </div>

        {/* Main Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Docs
            </TabsTrigger>
            <TabsTrigger value="query" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Process Query
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Decision History
            </TabsTrigger>
            <TabsTrigger value="viewer" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Document Viewer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <DocumentUpload onDocsUploaded={setUploadedDocs} uploadedDocs={uploadedDocs} />
          </TabsContent>

          <TabsContent value="query">
            <QueryProcessor
              uploadedDocs={uploadedDocs}
              onDecisionMade={(decision) => setDecisions((prev) => [decision, ...prev])}
            />
          </TabsContent>

          <TabsContent value="history">
            <DecisionHistory decisions={decisions} />
          </TabsContent>

          <TabsContent value="viewer">
            <DocumentViewer uploadedDocs={uploadedDocs} />
          </TabsContent>
        </Tabs>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Documents</p>
                  <p className="text-2xl font-bold">{uploadedDocs.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Decisions Made</p>
                  <p className="text-2xl font-bold">{decisions.length}</p>
                </div>
                <Brain className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {decisions.filter((d) => d.decision === "approved").length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">
                    {decisions.filter((d) => d.decision === "rejected").length}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
