"use client"

import { useEffect, useState } from "react"
import { DocumentViewer } from "@/components/document-viewer"

export default function DocumentPage() {
  const [docs, setDocs] = useState<any[]>([])      // to store list of documents
  const [loading, setLoading] = useState(true)     // to show loading spinner

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await fetch("http://localhost:5000/documents") // 👈 fetch from Flask
        const data = await res.json()
        setDocs(data)    // set the documents
      } catch (error) {
        console.error("Failed to fetch documents", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDocs()
  }, [])

  if (loading) return <div className="p-6">📄 Loading documents...</div>

  return <DocumentViewer uploadedDocs={docs} />  // ✅ pass fetched data here
}
