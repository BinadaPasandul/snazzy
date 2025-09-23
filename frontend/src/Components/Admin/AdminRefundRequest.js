import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import AdminChatPopup from "./AdminChatPopup"; 


const AdminRefundRequests = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chatPaymentId, setChatPaymentId] = useState(null); // track which payment's chat is open

  const fetchRefunds = async () => {
    try {
      const res = await api.get("/refund/all");
      setRefunds(res.data.refunds);
    } catch (err) {
      console.error("Error fetching refunds:", err);
      setError("Failed to fetch refund requests");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId, action) => {
    try {
      await api.put(`/refund/handle/${requestId}`, { action });
      fetchRefunds(); 
    } catch (err) {
      console.error("Error handling refund:", err);
      alert("Failed to update refund status");
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  if (loading) return <p className="p-4">Loading refund requests...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Refund Requests</h1>

      {refunds.length === 0 ? (
        <p>No refund requests found</p>
      ) : (
        <table className="w-full border border-gray-300 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">User</th>
              <th className="p-2 border">Payment</th>
              <th className="p-2 border">Reason</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Created At</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {refunds.map((req) => (
              <tr key={req._id} className="text-center">
                <td className="p-2 border">{req.userId}</td>
                <td className="p-2 border">{req.paymentId?._id}</td>
                <td className="p-2 border">{req.reason || "—"}</td>
                <td className="p-2 border font-semibold">
                  {req.status === "pending" && (
                    <span className="text-yellow-600">Pending</span>
                  )}
                  {req.status === "approved" && (
                    <span className="text-green-600">Approved</span>
                  )}
                  {req.status === "rejected" && (
                    <span className="text-red-600">Rejected</span>
                  )}
                </td>
                <td className="p-2 border">
                  {new Date(req.createdAt).toLocaleString()}
                </td>
                <td className="p-2 border">
                  <div className="flex gap-2 justify-center">
                    {req.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleAction(req._id, "approve")}
                          className="px-3 py-1 bg-green-500 text-white rounded"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(req._id, "reject")}
                          className="px-3 py-1 bg-red-500 text-white rounded"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {/* Chat button */}
                    <button
                      onClick={() => setChatPaymentId(req.paymentId?._id)}
                      className="px-3 py-1 bg-blue-500 text-white rounded"
                    >
                      Chat
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Chat popup */}
      {chatPaymentId && (
        <AdminChatPopup
          paymentId={chatPaymentId}
          onClose={() => setChatPaymentId(null)}
        />
      )}
    </div>
  );
};

export default AdminRefundRequests;
