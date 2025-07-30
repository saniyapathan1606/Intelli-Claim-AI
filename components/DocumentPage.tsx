"use client"

import { useEffect, useState } from "react"
import { DocumentViewer } from "@/components/document-viewer"

export default function DocumentPage() {
  const [docs, setDocs] = useState<any[]>([])       // List of documents
  const [loading, setLoading] = useState(true)      // Loading state

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/documents`)
        if (!res.ok) throw new Error("Failed to fetch documents")
        const data = await res.json()
        setDocs(data)
      } catch (error) {
        console.error("Failed to fetch documents", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDocs()
  }, [])

  if (loading) return <div className="p-6">📄 Loading documents...</div>

  return <DocumentViewer uploadedDocs={docs} />
}
