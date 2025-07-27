import { type NextRequest, NextResponse } from "next/server";
import { askGemini } from "@/lib/gemini"; // mocked version

export async function POST(request: NextRequest) {
  try {
    const { query, documents } = await request.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // 1. Extract info
    const extractionPrompt = `Extract structured info (age, gender, procedure, location, policy age) from the query:\n"${query}"`;
    const parsedInfo = await askGemini(extractionPrompt);

    // 2. Find relevant clauses
    const joinedDocs = documents?.map((d: any) => d.extractedText).join("\n\n") || "";
    const clausePrompt = `Read the documents and find clauses relevant to this insurance claim query:\nQuery: "${query}"\n\nDocuments:\n${joinedDocs}`;
    const relevantClauses = await askGemini(clausePrompt);

    // 3. Make decision
    const decisionPrompt = `Based on the parsed query and relevant policy clauses, make a claim decision.\n\nQuery: ${query}\nExtracted Info: ${JSON.stringify(
      parsedInfo
    )}\nRelevant Clauses: ${JSON.stringify(relevantClauses)}`;
    const decision = await askGemini(decisionPrompt);

    return NextResponse.json({
      query,
      extractedInfo: parsedInfo,
      relevantClauses,
      decision,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("❌ Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err?.message || err },
      { status: 500 }
    );
  }
}
