import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import AdminChatPopup from "./AdminChatPopup";
import "./AdminRefundRequest.css"; 
import Nav from "../Navbar/nav";
import Footer from '../Footer/Footer';


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

  if (loading) return <div className="admin-refund-loading">Loading refund requests...</div>;
  if (error) return <div className="admin-refund-error">{error}</div>;

  return (

    <div><Nav/>
    <div className="admin-refund-container">
      <div className="admin-refund-header">
        <h1 className="admin-refund-title">Refund Requests</h1>
      </div>

      {refunds.length === 0 ? (
        <div className="admin-refund-empty">No refund requests found</div>
      ) : (
        <div className="admin-refund-table-container">
          <table className="admin-refund-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Payment</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
                <th>Chat</th>
              </tr>
            </thead>
            <tbody>
              {refunds.map((req) => (
                <tr key={req._id}>
                  <td>
                    <div className="admin-refund-user-id">{req.userId}</div>
                  </td>
                  <td>
                    <div className="admin-refund-payment-id">{req.paymentId?._id}</div>
                  </td>
                  <td>
                    <div className="admin-refund-reason">{req.reason || "—"}</div>
                  </td>
                  <td>
                    <span className={`admin-refund-status ${req.status}`}>
                      {req.status === "pending" && "Pending"}
                      {req.status === "approved" && "Approved"}
                      {req.status === "rejected" && "Rejected"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-refund-date">
                      {new Date(req.createdAt).toLocaleString()}
                    </div>
                  </td>
                  <td>
                    <div className="admin-refund-actions">
                      {req.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleAction(req._id, "approve")}
                            className="admin-refund-btn approve"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(req._id, "reject")}
                            className="admin-refund-btn reject"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="admin-refund-chat">
                      <button
                        onClick={() => setChatPaymentId(req.paymentId?._id)}
                        className="admin-refund-btn chat"
                      >
                        Chat
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Chat popup */}
      {chatPaymentId && (
        <AdminChatPopup
          paymentId={chatPaymentId}
          onClose={() => setChatPaymentId(null)}
        />
      )}
    </div>
    <Footer/>
    </div>
  );
};

export default AdminRefundRequests;
