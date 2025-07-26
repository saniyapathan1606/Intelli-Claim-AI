"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  Brain,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  MapPin,
  Calendar,
  User,
  DollarSign,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface QueryProcessorProps {
  uploadedDocs: any[]
  onDecisionMade: (decision: any) => void
}

export function QueryProcessor({ uploadedDocs, onDecisionMade }: QueryProcessorProps) {
  const [query, setQuery] = useState("")
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [processingStep, setProcessingStep] = useState("")
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  const sampleQueries = [
    "46-year-old male, knee surgery in Pune, 3-month-old insurance policy",
    "Female, 35 years, cardiac procedure, Mumbai, policy active for 2 years",
    "Dental treatment for 28-year-old, Delhi, new policy purchased last month",
    "Emergency surgery, 52-year-old male, Bangalore, premium policy holder",
  ]

  const processQuery = async () => {
    if (!query.trim()) {
      toast({
        title: "Query required",
        description: "Please enter a query to process",
        variant: "destructive",
      })
      return
    }

    if (uploadedDocs.length === 0) {
      toast({
        title: "No documents",
        description: "Please upload documents first",
        variant: "destructive",
      })
      return
    }

    setProcessing(true)
    setProgress(0)
    setResult(null)

    try {
      // Step 1: Parse Query
      setProcessingStep("Parsing query and extracting entities...")
      setProgress(20)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Step 2: Semantic Search
      setProcessingStep("Performing semantic search across documents...")
      setProgress(40)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Step 3: Evaluate Rules
      setProcessingStep("Evaluating policy rules and conditions...")
      setProgress(60)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Step 4: Generate Decision
      setProcessingStep("Generating decision and justification...")
      setProgress(80)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Step 5: Complete
      setProcessingStep("Finalizing response...")
      setProgress(100)
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Mock result based on query
      const isApproved = Math.random() > 0.3 // 70% approval rate for demo
      const mockResult = {
        id: Date.now(),
        query: query,
        timestamp: new Date().toISOString(),
        parsedQuery: {
          age: "46",
          gender: "male",
          procedure: "knee surgery",
          location: "Pune",
          policyAge: "3 months",
          patientType: "adult",
        },
        decision: isApproved ? "approved" : "rejected",
        confidence: 0.87 + Math.random() * 0.1,
        amount: isApproved ? Math.floor(Math.random() * 50000) + 10000 : 0,
        justification: isApproved
          ? "Claim approved based on policy coverage for orthopedic procedures. Patient meets age and location criteria."
          : "Claim rejected due to insufficient policy maturity period. Minimum 6-month waiting period required for surgical procedures.",
        relevantClauses: [
          {
            clauseId: "C-001",
            document: "Policy Terms & Conditions",
            text: "Orthopedic procedures including knee surgery are covered under Section 4.2 after completion of waiting period.",
            relevanceScore: 0.94,
            page: 12,
          },
          {
            clauseId: "C-015",
            document: "Coverage Guidelines",
            text: "Surgical procedures require minimum 6-month policy maturity for coverage eligibility.",
            relevanceScore: 0.89,
            page: 8,
          },
          {
            clauseId: "C-023",
            document: "Geographic Coverage",
            text: "Treatment in Tier-1 and Tier-2 cities including Pune is covered under standard rates.",
            relevanceScore: 0.82,
            page: 15,
          },
        ],
        processingTime: "3.2s",
        documentsSearched: uploadedDocs.length,
      }

      setResult(mockResult)
      onDecisionMade(mockResult)

      toast({
        title: "Query processed successfully",
        description: `Decision: ${mockResult.decision.toUpperCase()}`,
      })
    } catch (error) {
      toast({
        title: "Processing failed",
        description: "There was an error processing your query",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
      setProcessingStep("")
      setProgress(0)
    }
  }

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
    }
  }

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Query Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Natural Language Query Processing
          </CardTitle>
          <CardDescription>
            Enter your query in plain English. The system will parse, search, and make decisions automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Enter your query here... (e.g., 46-year-old male, knee surgery in Pune, 3-month-old insurance policy)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={3}
            className="resize-none"
          />

          <div className="flex items-center justify-between">
            <Button
              onClick={processQuery}
              disabled={processing || uploadedDocs.length === 0}
              className="flex items-center gap-2"
            >
              <Brain className="w-4 h-4" />
              {processing ? "Processing..." : "Process Query"}
            </Button>
            <div className="text-sm text-gray-500">{uploadedDocs.length} documents available for search</div>
          </div>

          {processing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{processingStep}</span>
                <span className="text-gray-600">{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sample Queries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sample Queries</CardTitle>
          <CardDescription>Click on any sample query to try it out</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sampleQueries.map((sample, index) => (
              <Button
                key={index}
                variant="outline"
                className="text-left h-auto p-3 justify-start bg-transparent"
                onClick={() => setQuery(sample)}
              >
                <div className="text-sm">{sample}</div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getDecisionIcon(result.decision)}
              Decision Result
            </CardTitle>
            <CardDescription>
              Processed in {result.processingTime} • Confidence: {(result.confidence * 100).toFixed(1)}%
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Decision Summary */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge className={getDecisionColor(result.decision)}>{result.decision.toUpperCase()}</Badge>
                {result.amount > 0 && (
                  <div className="flex items-center gap-1 text-lg font-semibold text-green-600">
                    <DollarSign className="w-4 h-4" />₹{result.amount.toLocaleString()}
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-500">{new Date(result.timestamp).toLocaleString()}</div>
            </div>

            {/* Parsed Query */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Extracted Information
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <User className="w-4 h-4 text-blue-500" />
                  <div>
                    <div className="text-xs text-gray-500">Age & Gender</div>
                    <div className="font-medium">
                      {result.parsedQuery.age}, {result.parsedQuery.gender}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <FileText className="w-4 h-4 text-purple-500" />
                  <div>
                    <div className="text-xs text-gray-500">Procedure</div>
                    <div className="font-medium">{result.parsedQuery.procedure}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <MapPin className="w-4 h-4 text-green-500" />
                  <div>
                    <div className="text-xs text-gray-500">Location</div>
                    <div className="font-medium">{result.parsedQuery.location}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <Calendar className="w-4 h-4 text-orange-500" />
                  <div>
                    <div className="text-xs text-gray-500">Policy Age</div>
                    <div className="font-medium">{result.parsedQuery.policyAge}</div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Justification */}
            <div>
              <h4 className="font-semibold mb-2">Justification</h4>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{result.justification}</p>
            </div>

            {/* Relevant Clauses */}
            <div>
              <h4 className="font-semibold mb-3">Relevant Policy Clauses</h4>
              <div className="space-y-3">
                {result.relevantClauses.map((clause: any, index: number) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{clause.clauseId}</Badge>
                        <span className="text-sm font-medium">{clause.document}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Page {clause.page}</span>
                        <Badge variant="secondary">{(clause.relevanceScore * 100).toFixed(0)}% match</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{clause.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* JSON Export */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Structured Response (JSON)</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const jsonData = {
                      decision: result.decision,
                      amount: result.amount,
                      justification: result.justification,
                      confidence: result.confidence,
                      parsedQuery: result.parsedQuery,
                      relevantClauses: result.relevantClauses,
                    }
                    navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2))
                    toast({
                      title: "JSON copied to clipboard",
                      description: "The structured response has been copied",
                    })
                  }}
                >
                  Copy JSON
                </Button>
              </div>
              <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
                {JSON.stringify(
                  {
                    decision: result.decision,
                    amount: result.amount,
                    justification: result.justification,
                    confidence: result.confidence,
                    parsedQuery: result.parsedQuery,
                    relevantClauses: result.relevantClauses.map((c: any) => ({
                      clauseId: c.clauseId,
                      document: c.document,
                      relevanceScore: c.relevanceScore,
                    })),
                  },
                  null,
                  2,
                )}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
