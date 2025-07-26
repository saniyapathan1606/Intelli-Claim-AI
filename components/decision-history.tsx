"use client"

import React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, XCircle, Search, Filter, Download, Eye, Calendar, DollarSign } from "lucide-react"

interface DecisionHistoryProps {
  decisions: any[]
}

export function DecisionHistory({ decisions }: DecisionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedDecision, setSelectedDecision] = useState<any>(null)

  const filteredDecisions = decisions.filter((decision) => {
    const matchesSearch =
      decision.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
      decision.justification.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || decision.decision === filterStatus
    return matchesSearch && matchesFilter
  })

  const getDecisionIcon = (decision: string) => {
    return decision === "approved" ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    )
  }

  const getDecisionColor = (decision: string) => {
    return decision === "approved"
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-red-100 text-red-800 border-red-200"
  }

  const exportToCSV = () => {
    const csvContent = [
      ["Timestamp", "Query", "Decision", "Amount", "Confidence", "Justification"],
      ...filteredDecisions.map((d) => [
        new Date(d.timestamp).toLocaleString(),
        d.query,
        d.decision,
        d.amount || 0,
        (d.confidence * 100).toFixed(1) + "%",
        d.justification,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "decision-history.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  if (decisions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <Search className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No decisions yet</h3>
          <p className="text-gray-500">Process some queries to see the decision history here</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Decision History ({decisions.length})</span>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </CardTitle>
          <CardDescription>Track all processed queries and their outcomes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search decisions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Decisions</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{decisions.length}</div>
              <div className="text-sm text-blue-600">Total Decisions</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {decisions.filter((d) => d.decision === "approved").length}
              </div>
              <div className="text-sm text-green-600">Approved</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {decisions.filter((d) => d.decision === "rejected").length}
              </div>
              <div className="text-sm text-red-600">Rejected</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                ₹
                {decisions
                  .filter((d) => d.amount > 0)
                  .reduce((sum, d) => sum + d.amount, 0)
                  .toLocaleString()}
              </div>
              <div className="text-sm text-purple-600">Total Approved Amount</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Decision List */}
      <div className="space-y-4">
        {filteredDecisions.map((decision) => (
          <Card key={decision.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getDecisionIcon(decision.decision)}
                    <Badge className={getDecisionColor(decision.decision)}>{decision.decision.toUpperCase()}</Badge>
                    {decision.amount > 0 && (
                      <div className="flex items-center gap-1 text-green-600 font-semibold">
                        <DollarSign className="w-3 h-3" />₹{decision.amount.toLocaleString()}
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <Calendar className="w-3 h-3" />
                      {new Date(decision.timestamp).toLocaleString()}
                    </div>
                  </div>

                  <p className="text-gray-900 mb-2 font-medium">{decision.query}</p>
                  <p className="text-gray-600 text-sm mb-3">{decision.justification}</p>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Confidence: {(decision.confidence * 100).toFixed(1)}%</span>
                    <span>Processing: {decision.processingTime}</span>
                    <span>Clauses: {decision.relevantClauses.length}</span>
                  </div>
                </div>

                <Button variant="ghost" size="sm" onClick={() => setSelectedDecision(decision)}>
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDecisions.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No matching decisions</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </CardContent>
        </Card>
      )}

      {/* Decision Detail Modal */}
      {selectedDecision && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Decision Details</CardTitle>
                <Button variant="ghost" onClick={() => setSelectedDecision(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Query</h4>
                  <p className="bg-gray-50 p-3 rounded">{selectedDecision.query}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Extracted Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(selectedDecision.parsedQuery).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 p-2 rounded">
                        <span className="font-medium capitalize">{key}: </span>
                        <span>{value as string}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Relevant Clauses</h4>
                  <div className="space-y-2">
                    {selectedDecision.relevantClauses.map((clause: any, index: number) => (
                      <div key={index} className="border p-3 rounded">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="outline">{clause.clauseId}</Badge>
                          <span className="text-sm text-gray-500">
                            {(clause.relevanceScore * 100).toFixed(0)}% match
                          </span>
                        </div>
                        <p className="text-sm">{clause.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
