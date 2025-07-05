import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

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

    const handleAmenityChange = (amenity) => {
    const updatedAmenities = {
      ...participant.amenities,
      [amenity]: !participant.amenities[amenity],
    };
    setParticipant((prev) => ({
      ...prev,
      amenities: updatedAmenities,
    }));
  };

    const saveAmenities = async () => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/participants/participant/${participantId}/amenities`,
        {
          amenities: participant.amenities,
        }
      );
      setParticipant(response.data);
      toast.success("Approved");
    } catch (error) {
      console.error("Error updating amenities:", error);
      toast.error("Error updating amenities:", error);
    }
  };

  return (
    <div className="container mx-auto my-10 px-4 md:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-md p-6 md:p-8 lg:p-10 text-center">
        {/* Avatar */}
        {/* <div className="mb-6">
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
        </div> */}

        {/* Name & ID */}
        <h2 className="text-3xl font-bold mb-1">
          {participant.firstName}  
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

    {
      participant.amenities.length>0 &&(
            <div className="bg-muted rounded-lg p-6 md:p-8 lg:p-10">
            <h3 className="text-xl font-bold mb-4">Event Amenities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {participant.amenities &&
                Object.keys(participant.amenities).map((amenity, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {participant.amenities[amenity] ? (
                      <div className="flex items-center gap-2 border border-green-200   bg-green-200 rounded-sm p-1 px-2">
                        <input
                          type="checkbox"
                          checked
                          className="peer h-4 w-4 shrink-0 rounded-sm border border-blue-200 ring-offset-background bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <span className="text-black font-bold">{amenity}</span>
                      </div>
                    ) : (
                      <>
                        <input
                          type="checkbox"
                          checked={participant.amenities[amenity]}
                          onChange={() => handleAmenityChange(amenity)}
                          className="peer h-4 w-4 shrink-0 rounded-sm border border-blue-500 ring-offset-background bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          id={`amenity-${index}`}
                        />
                        <label
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          htmlFor={`amenity-${index}`}
                        >
                          {amenity}
                        </label>
                      </>
                    )}
                  </div>
                ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={saveAmenities}
                className="border p-2 px-7 bg-black text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
      )
    }

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
