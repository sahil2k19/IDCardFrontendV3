"use client"
import { useNavigate } from "react-router-dom"
import { XCircle } from "lucide-react"

function TokenExpired() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Secure Link Expired</h1>
        <p className="text-gray-600 mb-6">
          This secure link has already been used or has expired. Each secure link can only be used once to create an ID
          card.
        </p>
        <button
          onClick={() => navigate("/")}
          className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
        >
          Return to Home
        </button>
      </div>
    </div>
  )
}

export default TokenExpired
