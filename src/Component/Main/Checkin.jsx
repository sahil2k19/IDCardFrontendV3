import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function Checkin() {
  const { participantId } = useParams();
  const [participant, setParticipant] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    const doCheckin = async () => {
      try {
        // this GET also sets checkin: true on the server
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/participants/participant/${participantId}/checkin`
        );
        setParticipant(data);
      } catch (err) {
        console.error("Check‑in error:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    doCheckin();
  }, [participantId]);

  if (loading) return <div>Loading...</div>;
  if (error)   return <div>Error during check‑in.</div>;

  return (
    <div className="container mx-auto my-10 px-4 md:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-md p-6 md:p-8 lg:p-10 text-center">
        {/* Avatar */}
        <div className="mb-6">
          <span className="inline-block rounded-full w-24 h-24 border-4 border-green-500 overflow-hidden">
            <img
              className="w-full h-full object-cover"
              src={
                participant.profilePicture ||
                "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/corporate-user-icon.png"
              }
              alt="Participant"
            />
          </span>
        </div>

        {/* Name & ID */}
        <h2 className="text-3xl font-bold mb-1">
          {participant.firstName} {participant.lastName}
        </h2>
        <p className="text-lg mb-4">ID: {participant.participantId}</p>

        {/* Additional details */}
        <div className="text-left mx-auto mb-6 max-w-xs space-y-1">
          {participant.designation && (
            <p><strong>Designation:</strong> {participant.designation}</p>
          )}
          {participant.institute && (
            <p><strong>Institute:</strong> {participant.institute}</p>
          )}
        </div>

        {/* Check‑in badge */}
        {participant.checkin ? (
          <div className="inline-block bg-green-100 border border-green-500 text-green-800 rounded-lg px-6 py-4">
            <p className="font-semibold text-xl">✔️ Checked In Successfully!</p>
          </div>
        ) : (
          <div className="inline-block bg-yellow-100 border border-yellow-500 text-yellow-800 rounded-lg px-6 py-4">
            <p className="font-semibold text-xl">⚠️ Check‑in Pending</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Checkin;
