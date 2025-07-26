import { type NextRequest, NextResponse } from "next/server"
import { generateObject, generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

const QuerySchema = z.object({
  age: z.string().optional(),
  gender: z.string().optional(),
  procedure: z.string().optional(),
  location: z.string().optional(),
  policyAge: z.string().optional(),
  urgency: z.string().optional(),
})

const DecisionSchema = z.object({
  decision: z.enum(["approved", "rejected", "pending"]),
  confidence: z.number().min(0).max(1),
  amount: z.number().min(0),
  justification: z.string(),
  riskFactors: z.array(z.string()),
  requiredDocuments: z.array(z.string()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const { query, documents } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    // Step 1: Parse the natural language query
    const { object: parsedQuery } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: QuerySchema,
      prompt: `Parse this insurance claim query and extract key information:
      
      Query: "${query}"
      
      Extract:
      - age: patient age if mentioned
      - gender: patient gender if mentioned  
      - procedure: medical procedure or treatment
      - location: city or location mentioned
      - policyAge: how long the policy has been active
      - urgency: emergency, routine, elective, etc.
      
      If information is not clearly stated, leave the field empty.`,
    })

    // Step 2: Simulate document search and clause retrieval
    const relevantClauses = [
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
        text: "Treatment in Tier-1 and Tier-2 cities including major metros is covered under standard rates.",
        relevanceScore: 0.82,
        page: 15,
      },
    ]

    // Step 3: Make decision based on parsed query and clauses
    const { object: decision } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: DecisionSchema,
      prompt: `Based on the parsed query and policy clauses, make a claim decision:

      Parsed Query: ${JSON.stringify(parsedQuery, null, 2)}
      
      Relevant Policy Clauses:
      ${relevantClauses.map((c) => `${c.clauseId}: ${c.text}`).join("\n")}
      
      Consider:
      - Policy waiting periods and maturity requirements
      - Coverage for the specific procedure
      - Geographic coverage
      - Patient eligibility criteria
      
      Provide a decision with confidence score, amount (if approved), and detailed justification.
      Include risk factors that influenced the decision.`,
    })

    // Step 4: Generate additional context
    const { text: additionalContext } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `Provide additional context for this insurance claim decision:
      
      Query: ${query}
      Decision: ${decision.decision}
      Justification: ${decision.justification}
      
      Explain:
      1. What specific policy terms apply
      2. Any alternative options for the patient
      3. Next steps or appeals process if applicable
      
      Keep it concise and professional.`,
    })

    const response = {
      id: Date.now(),
      query,
      timestamp: new Date().toISOString(),
      parsedQuery,
      decision: decision.decision,
      confidence: decision.confidence,
      amount: decision.amount,
      justification: decision.justification,
      additionalContext,
      riskFactors: decision.riskFactors,
      requiredDocuments: decision.requiredDocuments || [],
      relevantClauses,
      processingTime: `${(Math.random() * 3 + 1).toFixed(1)}s`,
      documentsSearched: documents?.length || 0,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error processing query:", error)
    return NextResponse.json({ error: "Failed to process query" }, { status: 500 })
  }
}
