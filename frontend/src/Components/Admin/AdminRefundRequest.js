import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import api from "../../utils/api";
import AdminChatPopup from "./AdminChatPopup";
import "./AdminRefundRequest.css";
import Nav from "../Navbar/nav";
import Footer from "../Footer/Footer";

const AdminRefundRequests = () => {
  const [refunds, setRefunds] = useState([]);
  const [filteredRefunds, setFilteredRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chatPaymentId, setChatPaymentId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const now = new Date();
  const [reportType, setReportType] = useState("month");
  const [selMonth, setSelMonth] = useState(now.getMonth() + 1);
  const [selYear, setSelYear] = useState(now.getFullYear());

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
    const confirmAction = window.confirm(
      `Are you sure you want to ${action} this refund request?`
    );
    if (!confirmAction) return;
    try {
      await api.put(`/refund/handle/${requestId}`, { action });
      fetchRefunds();
    } catch (err) {
      console.error("Error handling refund:", err);
      alert("Failed to update refund status");
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (value.trim() === "") setFilteredRefunds(refunds);
    else {
      const filtered = refunds.filter((r) =>
        r.paymentId?._id.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredRefunds(filtered);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  useEffect(() => {
    handleSearch(searchTerm);
  }, [refunds]);

  if (loading)
    return (
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

  if (error)
    return (
      <div>
        <Nav />
        <div className="om-container">
          <div className="empty-state-container">
            <p className="empty-state" style={{ color: "#ef4444" }}>
              {error}
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );

  const refundStats = {
    total: refunds.length,
    pending: refunds.filter((r) => r.status === "pending").length,
    approved: refunds.filter((r) => r.status === "approved").length,
    rejected: refunds.filter((r) => r.status === "rejected").length,
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
            />
            {/* Report selectors */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginLeft: 12,
              }}
            >
              <select
                style={{
                  padding: "6px 10px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  backgroundColor: "#ffffff",
                  color: "#111827",
                  fontSize: "0.9rem",
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>

              {reportType === "month" ? (
                <>
                  <select
                    style={{
                      padding: "6px 10px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      backgroundColor: "#ffffff",
                      color: "#111827",
                      fontSize: "0.9rem",
                      outline: "none",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                    }}
                    value={selMonth}
                    onChange={(e) => setSelMonth(Number(e.target.value))}
                  >
                    {Array.from({ length: 12 }).map((_, idx) => (
                      <option key={idx + 1} value={idx + 1}>
                        {new Date(2000, idx).toLocaleString("default", {
                          month: "long",
                        })}
                      </option>
                    ))}
                  </select>

                  <input
                    style={{
                      padding: "6px 10px",
                      marginTop: "20px",
                      width: "80px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      backgroundColor: "#ffffff",
                      color: "#111827",
                      fontSize: "0.9rem",
                      outline: "none",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                    }}
                    type="number"
                    value={selYear}
                    onChange={(e) => setSelYear(Number(e.target.value))}
                  />
                </>
              ) : (
                <input
                  style={{
                    padding: "6px 10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    backgroundColor: "#ffffff",
                    color: "#111827",
                    fontSize: "0.9rem",
                    outline: "none",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  type="number"
                  value={selYear}
                  onChange={(e) => setSelYear(Number(e.target.value))}
                />
              )}
            </div>

            <button
              style={{ marginLeft: 12 }}
              className="btn btn-primary"
              onClick={async () => {
                try {
                  const formatCurrency = (n) => `$${Number(n || 0).toFixed(2)}`;
                  const fetchMonthly = async (y, m) => {
                    const r = await api.get(
                      `/reports/monthly?year=${y}&month=${m}`
                    );
                    return r.data;
                  };

                  let generatedAt = new Date().toISOString();
                  let context = { year: selYear, month: selMonth };
                  let totals = null;
                  const isYear = reportType === "year";

                  if (!isYear) {
                    const {
                      generatedAt: g,
                      context: c,
                      totals: t,
                    } = await fetchMonthly(selYear, selMonth);
                    generatedAt = g;
                    context = c;
                    totals = t;
                  } else {
                    // ✅ Fixed yearly logic
                    const months = await Promise.all(
                      Array.from({ length: 12 }, (_, i) =>
                        fetchMonthly(selYear, i + 1)
                      )
                    );

                    const sum = (arr, key) =>
                      arr.reduce(
                        (acc, m) => acc + Number(m.totals?.[key] || 0),
                        0
                      );

                    const totalPaymentsAmount = sum(
                      months,
                      "totalPaymentsAmount"
                    );
                    const totalPaymentsCount = sum(
                      months,
                      "totalPaymentsCount"
                    );
                    const refundApprovedCount = sum(
                      months,
                      "refundApprovedCount"
                    );
                    const refundRejectedCount = sum(
                      months,
                      "refundRejectedCount"
                    );
                    const refundTotalCount = sum(months, "refundTotalCount");
                    const totalApprovedRefundAmount = sum(
                      months,
                      "totalApprovedRefundAmount"
                    );
                    const netIncome = sum(months, "netIncome");

                    // 🟢 Correctly calculate previous year's total
                    const prevYear = selYear - 1;
                    const prevYearMonths = await Promise.all(
                      Array.from({ length: 12 }, (_, i) =>
                        fetchMonthly(prevYear, i + 1)
                      )
                    );
                    const lastNetIncome = sum(prevYearMonths, "netIncome");

                    const incomeDelta = Number(
                      (netIncome - lastNetIncome).toFixed(2)
                    );

                    totals = {
                      totalPaymentsAmount,
                      totalPaymentsCount,
                      refundApprovedCount,
                      refundRejectedCount,
                      refundTotalCount,
                      totalApprovedRefundAmount,
                      netIncome,
                      lastNetIncome,
                      incomeDelta,
                    };
                  }

                  // === PDF Generation ===
                  const doc = new jsPDF();

                  doc.setFillColor(17, 24, 39);
                  doc.rect(0, 0, 210, 26, "F");
                  doc.setTextColor(255, 255, 255);
                  doc.setFontSize(16);
                  doc.text("SNAZZY — Sales Report", 14, 16);
                  doc.setFontSize(10);
                  doc.text(
                    `Generated: ${new Date(generatedAt).toLocaleString()}`,
                    14,
                    22
                  );

                  const monthName = new Date(
                    context.year,
                    context.month - 1
                  ).toLocaleString("default", { month: "long" });
                  doc.setFillColor(59, 130, 246);
                  doc.setTextColor(255, 255, 255);
                  doc.roundedRect(160, 10, 36, 10, 2, 2, "F");
                  doc.setFontSize(10);
                  if (isYear)
                    doc.text(`${selYear}`, 178, 17, { align: "center" });
                  else
                    doc.text(
                      `${monthName.slice(0, 3)} ${context.year}`,
                      178,
                      17,
                      {
                        align: "center",
                      }
                    );

                  doc.setTextColor(17, 24, 39);

                  let y = 36;
                  doc.setFontSize(12);
                  doc.text("Overview", 14, y);
                  y += 4;
                  doc.line(14, y, 196, y);
                  y += 6;

                  const card = (x, yPos, title, value, color) => {
                    doc.setDrawColor(229, 231, 235);
                    doc.roundedRect(x, yPos, 88, 22, 2, 2);
                    doc.setFontSize(9);
                    doc.setTextColor(100, 116, 139); // slate-500
                    doc.text(title, x + 6, yPos + 8);
                    doc.setFontSize(12);
                    if (color === "green") doc.setTextColor(34, 197, 94);
                    else if (color === "red") doc.setTextColor(239, 68, 68);
                    else doc.setTextColor(17, 24, 39);
                    doc.text(value, x + 6, yPos + 16);
                    doc.setTextColor(17, 24, 39);
                  };

                  card(
                    14,
                    y,
                    "Total Payments Amount",
                    formatCurrency(totals.totalPaymentsAmount)
                  );
                  card(
                    108,
                    y,
                    "Total Payments Count",
                    String(totals.totalPaymentsCount)
                  );
                  y += 26;
                  card(
                    14,
                    y,
                    "Refunds Approved (count)",
                    String(totals.refundApprovedCount)
                  );
                  card(
                    108,
                    y,
                    "Refunds Rejected (count)",
                    String(totals.refundRejectedCount)
                  );
                  y += 26;
                  card(
                    14,
                    y,
                    "Total Refund Requests",
                    String(totals.refundTotalCount)
                  );
                  card(
                    108,
                    y,
                    "Approved Refunds Amount",
                    formatCurrency(totals.totalApprovedRefundAmount)
                  );
                  y += 30;

                  doc.setFontSize(12);
                  doc.text(
                    isYear ? "Income (Yearly)" : "Income (Monthly)",
                    14,
                    y
                  );
                  y += 4;
                  doc.line(14, y, 196, y);
                  y += 8;

                  card(
                    14,
                    y,
                    isYear
                      ? "Net Income (this year)"
                      : "Net Income (this month)",
                    formatCurrency(totals.netIncome)
                  );
                  card(
                    108,
                    y,
                    isYear
                      ? "Net Income (last year)"
                      : "Net Income (last month)",
                    formatCurrency(totals.lastNetIncome)
                  );
                  y += 26;

                  const delta = Number(totals.incomeDelta || 0);
                  const deltaIsPositive = delta > 0;
                  const deltaIsNegative = delta < 0;
                  const deltaSign = deltaIsPositive
                    ? "+"
                    : deltaIsNegative
                    ? "-"
                    : "";
                  const deltaColor = deltaIsPositive
                    ? "green"
                    : deltaIsNegative
                    ? "red"
                    : null;
                  const deltaDisplay = `${deltaSign}$${Math.abs(delta).toFixed(
                    2
                  )}`;
                  card(
                    14,
                    y,
                    isYear ? "Compare to Last Year" : "Compare to Last Month",
                    deltaDisplay,
                    deltaColor
                  );

                  const filename = isYear
                    ? `Sales_Report_${selYear}.pdf`
                    : `Sales_Report_${context.year}_${context.month}.pdf`;
                  doc.save(filename);
                } catch (err) {
                  console.error("Report generation failed", err);
                  alert("Failed to generate report. Please try again.");
                }
              }}
            >
              Generate Sales Report (PDF)
            </button>
          </div>
        </div>

        {/* Refund Stats */}
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
                <div className="om-stat-value om-warn">
                  {refundStats.pending}
                </div>
              </div>
              <div className="om-stat-icon">⏳</div>
            </div>
            <div className="om-stat">
              <div className="om-stat-info">
                <div className="om-stat-label">Approved</div>
                <div className="om-stat-value om-success">
                  {refundStats.approved}
                </div>
              </div>
              <div className="om-stat-icon">✅</div>
            </div>
            <div className="om-stat">
              <div className="om-stat-info">
                <div className="om-stat-label">Rejected</div>
                <div className="om-stat-value om-danger">
                  {refundStats.rejected}
                </div>
              </div>
              <div className="om-stat-icon">❌</div>
            </div>
          </div>
        )}

        {/* Refund Table */}
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
                        <span
                          className={`om-badge ${
                            req.status === "pending"
                              ? "om-warn"
                              : req.status === "approved"
                              ? "om-success"
                              : "om-danger"
                          }`}
                        >
                          {req.status}
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
                {refunds.length > 0
                  ? "No refund requests match your search."
                  : "No refund requests found"}
              </p>
            </div>
          )}
        </div>

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
