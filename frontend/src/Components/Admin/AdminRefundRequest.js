import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import AdminChatPopup from "./AdminChatPopup";
import "./AdminRefundRequest.css"; 
import Nav from "../Navbar/nav";
import Footer from '../Footer/Footer';


const AdminRefundRequests = () => {
  const [refunds, setRefunds] = useState([]);
  const [filteredRefunds, setFilteredRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chatPaymentId, setChatPaymentId] = useState(null); // track which payment's chat is open
  const [searchTerm, setSearchTerm] = useState(""); // search term for payment ID

  const fetchRefunds = async () => {
    try {
      const res = await api.get("/refund/all");
      setRefunds(res.data.refunds);
      setFilteredRefunds(res.data.refunds);
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

  // Filter refunds based on search term
  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
    if (searchValue.trim() === "") {
      setFilteredRefunds(refunds);
    } else {
      const filtered = refunds.filter(refund => 
        refund.paymentId?._id.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredRefunds(filtered);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  // Update filtered refunds when refunds or search term changes
  useEffect(() => {
    handleSearch(searchTerm);
  }, [refunds]);

  if (loading) return (
    <div>
      <Nav />
      <div className="om-container">
        <div className="empty-state-container">
          <p className="empty-state">Loading refund requests...</p>
        </div>
      </div>
      <Footer />
    </div>
  );
  
  if (error) return (
    <div>
      <Nav />
      <div className="om-container">
        <div className="empty-state-container">
          <p className="empty-state" style={{color: '#ef4444'}}>{error}</p>
        </div>
      </div>
      <Footer />
    </div>
  );

  // Calculate refund statistics
  const refundStats = {
    total: refunds.length,
    pending: refunds.filter(r => r.status === "pending").length,
    approved: refunds.filter(r => r.status === "approved").length,
    rejected: refunds.filter(r => r.status === "rejected").length,
  };

  return (
    <div>
      <Nav />
      <div className="om-container">
        <div className="om-header">
          <h2 className="om-title">Refund Requests Manager</h2>
          <div className="om-search">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by Payment ID..."
              aria-label="Search refund requests"
            />
          </div>
        </div>

        {refunds.length > 0 && (
          <div className="om-stats">
            <div className="om-stat">
              <div className="om-stat-info">
                <div className="om-stat-label">Total Refunds</div>
                <div className="om-stat-value">{refundStats.total}</div>
              </div>
              <div className="om-stat-icon">📋</div>
            </div>
            <div className="om-stat">
              <div className="om-stat-info">
                <div className="om-stat-label">Pending Requests</div>
                <div className="om-stat-value om-warn">{refundStats.pending}</div>
              </div>
              <div className="om-stat-icon">⏳</div>
            </div>
            <div className="om-stat">
              <div className="om-stat-info">
                <div className="om-stat-label">Approved</div>
                <div className="om-stat-value om-success">{refundStats.approved}</div>
              </div>
              <div className="om-stat-icon">✅</div>
            </div>
            <div className="om-stat">
              <div className="om-stat-info">
                <div className="om-stat-label">Rejected</div>
                <div className="om-stat-value om-danger">{refundStats.rejected}</div>
              </div>
              <div className="om-stat-icon">❌</div>
            </div>
          </div>
        )}

        {/* Refunds Table */}
        <div className="orders-section">
          <div className="orders-header">
            <h2 className="orders-title">Refund Requests Management</h2>
            <div className="orders-info">
              <span className="orders-count">
                {filteredRefunds.length} of {refunds.length} refunds
              </span>
            </div>
          </div>

          {filteredRefunds.length > 0 ? (
            <div className="om-table-container">
              <table className="om-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Payment ID</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th>Actions</th>
                    <th>Chat</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRefunds.map((req) => (
                    <tr key={req._id}>
                      <td className="om-mono">{req.userId}</td>
                      <td className="om-mono">{req.paymentId?._id}</td>
                      <td>
                        <div className="om-subtext">{req.reason || "—"}</div>
                      </td>
                      <td>
                        <span className={`om-badge ${req.status === "pending" ? "om-warn" : req.status === "approved" ? "om-success" : "om-danger"}`}>
                          {req.status === "pending" && "Pending"}
                          {req.status === "approved" && "Approved"}
                          {req.status === "rejected" && "Rejected"}
                        </span>
                      </td>
                      <td>
                        <div className="om-subtext">
                          {new Date(req.createdAt).toLocaleString()}
                        </div>
                      </td>
                      <td>
                        <div className="admin-refund-actions">
                          {req.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleAction(req._id, "approve")}
                                className="btn btn-edit"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleAction(req._id, "reject")}
                                className="btn btn-delete"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() => setChatPaymentId(req.paymentId?._id)}
                          className="btn btn-primary"
                        >
                          Chat
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state-container">
              <p className="empty-state">
                {refunds.length > 0 ? "No refund requests match your search." : "No refund requests found"}
              </p>
            </div>
          )}
        </div>

        {/* Chat popup */}
        {chatPaymentId && (
          <AdminChatPopup
            paymentId={chatPaymentId}
            onClose={() => setChatPaymentId(null)}
          />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AdminRefundRequests;
