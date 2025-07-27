// lib/gemini.ts

// This mocked version helps you test your frontend/backend logic without hitting the Gemini API.

export async function askGemini(prompt: string) {
  console.warn("⚠️ Using mocked Gemini response.");

  // Simulate some basic parsing based on the prompt
  if (prompt.includes("Extract structured info")) {
    return {
      age: "46",
      gender: "Male",
      procedure: "Knee surgery",
      location: "Pune",
      policyAge: "3 months",
    };
  }

  if (prompt.includes("find clauses relevant")) {
    return [
      {
        clauseId: "C1",
        document: "policy_doc_1.pdf",
        page: 3,
        text: "Surgery is covered after 3 months of policy issuance.",
        relevanceScore: 0.87,
      },
      {
        clauseId: "C2",
        document: "policy_doc_2.pdf",
        page: 5,
        text: "Knee replacements are eligible for reimbursement under premium policies.",
        relevanceScore: 0.76,
      },
    ];
  }

  if (prompt.includes("make a claim decision")) {
    return {
      decision: "approved",
      confidence: 0.91,
      amount: 120000,
      justification:
        "The surgery occurred after the waiting period and the procedure is covered under the policy clauses.",
    };
  }

  return "Mocked Gemini response for prompt: " + prompt;
}
