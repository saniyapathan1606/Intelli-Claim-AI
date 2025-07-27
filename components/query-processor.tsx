"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
    setProgress(20)
    setResult(null)
    setProcessingStep("Sending query to Gemini for processing...")

    try {
      const res = await fetch("/api/process-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, documents: uploadedDocs }),
      })

      if (!res.ok) throw new Error("Query processing failed")

      const resultData = await res.json()
      setResult(resultData)
      onDecisionMade(resultData)

      toast({
        title: "Query processed successfully",
        description: `Decision: ${resultData.decision?.decision?.toUpperCase?.() || "Unknown"}`,
      })
    } catch (error) {
      console.error("Error:", error)
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
            placeholder="Enter your query here..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <div className="flex items-center justify-between">
            <Button onClick={processQuery} disabled={processing} className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              {processing ? "Processing..." : "Process Query"}
            </Button>
            <div className="text-sm text-gray-500">{uploadedDocs.length} docs available</div>
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

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getDecisionIcon(result.decision?.decision)} Decision Result
            </CardTitle>
            <CardDescription>
              Confidence: {(result.decision?.confidence * 100).toFixed(1)}%
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge className={getDecisionColor(result.decision?.decision)}>
                  {result.decision?.decision?.toUpperCase()}
                </Badge>
                {result.decision?.amount > 0 && (
                  <div className="flex items-center gap-1 text-lg font-semibold text-green-600">
                    <DollarSign className="w-4 h-4" />₹{result.decision.amount.toLocaleString()}
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-500">{new Date(result.timestamp).toLocaleString()}</div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Brain className="w-4 h-4" /> Extracted Info
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <User className="w-4 h-4 text-blue-500" />
                  <div>
                    <div className="text-xs text-gray-500">Age & Gender</div>
                    <div className="font-medium">
                      {result.extractedInfo?.age}, {result.extractedInfo?.gender}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <FileText className="w-4 h-4 text-purple-500" />
                  <div>
                    <div className="text-xs text-gray-500">Procedure</div>
                    <div className="font-medium">{result.extractedInfo?.procedure}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <MapPin className="w-4 h-4 text-green-500" />
                  <div>
                    <div className="text-xs text-gray-500">Location</div>
                    <div className="font-medium">{result.extractedInfo?.location}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <Calendar className="w-4 h-4 text-orange-500" />
                  <div>
                    <div className="text-xs text-gray-500">Policy Age</div>
                    <div className="font-medium">{result.extractedInfo?.policyAge}</div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2">Justification</h4>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                {result.decision?.justification}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Relevant Clauses</h4>
              {Array.isArray(result.relevantClauses) ? (
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
                          <Badge variant="secondary">
                            {(clause.relevanceScore * 100).toFixed(0)}% match
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{clause.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 bg-gray-50 p-3 rounded-lg">
                  <p>{result.relevantClauses || "No structured clauses returned."}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
