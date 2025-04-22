"use client"

import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { CheckCircle } from "lucide-react"

function IdCreated() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const eventId = params.get("eventid")
  const eventName = params.get("eventName")

  useEffect(() => {
    // Redirect back to the event page after 5 seconds
    const timer = setTimeout(() => {
      navigate(`/event/${eventId}`)
    }, 5000)

    return () => clearTimeout(timer)
  }, [navigate, eventId])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">ID Card Created Successfully!</h1>
        <p className="text-gray-600 mb-6">
          Your ID card for {eventName} has been created and saved. The secure form link has been invalidated.
        </p>
        <p className="text-sm text-gray-500 mb-4">You will be redirected to the event page in a few seconds...</p>
        <button
          onClick={() => navigate(`/event/${eventId}`)}
          className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
        >
          Return to Event
        </button>
      </div>
    </div>
  )
}

export default IdCreated
