import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Simulate file processing
    const fileBuffer = await file.arrayBuffer()
    const fileContent = new TextDecoder().decode(fileBuffer)

    // Extract text content (in real implementation, use proper PDF/Word parsers)
    let extractedText = fileContent

    // If it's a binary file, simulate extracted text
    if (file.type.includes("pdf") || file.type.includes("word")) {
      extractedText = `Sample extracted text from ${file.name}. 

      POLICY TERMS AND CONDITIONS
      
      Section 1: Coverage Details
      This policy provides comprehensive medical coverage including:
      - Hospitalization expenses up to ₹5,00,000 per year
      - Surgical procedures including orthopedic surgeries
      - Emergency treatments and ambulance charges
      
      Section 2: Waiting Periods
      - General treatments: No waiting period
      - Surgical procedures: 6 months waiting period
      - Pre-existing conditions: 2 years waiting period
      
      Section 3: Geographic Coverage
      Treatment is covered in the following locations:
      - Tier 1 cities: Mumbai, Delhi, Bangalore, Chennai, Pune, Hyderabad
      - Tier 2 cities: Ahmedabad, Surat, Jaipur, Lucknow, Kanpur
      
      Section 4: Exclusions
      - Cosmetic surgeries
      - Dental treatments (unless due to accident)
      - Alternative medicine treatments
      
      Section 5: Claim Process
      Claims must be submitted within 30 days of discharge with required documents.`
    }

    // Analyze document content using AI
    const { text: analysis } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `Analyze this document and extract key information:

      Document: ${extractedText}
      
      Identify:
      1. Document type (policy, contract, terms, etc.)
      2. Key coverage amounts and limits
      3. Waiting periods and restrictions
      4. Geographic coverage areas
      5. Important clauses and conditions
      
      Provide a structured analysis.`,
    })

    const processedDocument = {
      id: Date.now(),
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      status: "processed",
      extractedText,
      analysis,
      metadata: {
        pages: Math.floor(Math.random() * 50) + 1,
        language: "en",
        confidence: 0.95 + Math.random() * 0.05,
        wordCount: extractedText.split(" ").length,
        processingTime: `${(Math.random() * 2 + 0.5).toFixed(1)}s`,
      },
    }

    return NextResponse.json(processedDocument)
  } catch (error) {
    console.error("Error processing document:", error)
    return NextResponse.json({ error: "Failed to process document" }, { status: 500 })
  }
}
