// src/page/index.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";
import complaintsData from "./sampleComplaints";

export default function LoginPage() {
  const navigate = useNavigate();

  // All complaints
  const [complaints, setComplaints] = useState(complaintsData);

  // Filters
const [timeRange, setTimeRange] = useState("all");

  const [fraudTypeFilter, setFraudTypeFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("");
  const [idSearch, setIdSearch] = useState("");

  // Modal for "View Docs"
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // ---------- FILTER LOGIC ----------
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      // fraud type
      if (fraudTypeFilter !== "All" && c.fraud_type !== fraudTypeFilter) {
        return false;
      }

      // location (district / taluka / state text search)
      if (locationFilter.trim() !== "") {
        const loc = (
          c.victim_district +
          " " +
          c.victim_taluka +
          " " +
          c.victim_state
        ).toLowerCase();
        if (!loc.includes(locationFilter.toLowerCase())) return false;
      }

      // complaint id search
      if (
        idSearch.trim() !== "" &&
        !c.complaint_id.toLowerCase().includes(idSearch.toLowerCase())
      ) {
        return false;
      }

      // simple time range (based on date difference)
      if (timeRange !== "all") {
        const now = new Date("2025-10-04T00:00:00"); // fixed "today" for demo
        const t = new Date(c.complaint_timestamp.replace(" ", "T"));
        const diffMs = now - t;
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (timeRange === "24h" && diffDays > 1) return false;
        if (timeRange === "7d" && diffDays > 7) return false;
        if (timeRange === "30d" && diffDays > 30) return false;
      }

      return true;
    });
  }, [complaints, timeRange, fraudTypeFilter, locationFilter, idSearch]);

  // ---------- BUTTON HANDLERS ----------

  const handleAction = (complaint) => {
    // go to CIPHER dashboard for this complaint
    navigate(`/dashboard/${complaint.complaint_id}`, {
      state: { complaint },
    });
  };

  const handleReject = (complaint) => {
    if (!window.confirm(`Reject complaint ${complaint.complaint_id}?`)) return;
    setComplaints((prev) =>
      prev.filter((c) => c.complaint_id !== complaint.complaint_id)
    );
  };

  const handleViewDocs = (complaint) => {
    setSelectedComplaint(complaint);
  };

  const closeDocs = () => setSelectedComplaint(null);

  // ---------- RENDER ----------
  return (
    <div className="login-root">
      {/* HEADER */}
      <header className="login-header">
        <div className="login-header-left">
          <div className="logo-badge">!</div>
          <div>
            <div className="app-title">Cybercrime Predictive Dashboard</div>
            <div className="app-subtitle">LEA Officer · Chennai Region</div>
          </div>
        </div>

        <div className="login-header-center">
          <span className="live-dot" />
          <span className="live-text">Live Mode</span>
        </div>

        <div className="login-header-right">
          <span className="header-date">2 Oct 2025, 11:59</span>
          <div className="bell-badge">
            🔔
            <span className="bell-count">15</span>
          </div>
          <div className="user-chip">Officer</div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="login-content">
        {/* SIDEBAR FILTERS */}
        <aside className="login-filters">
          <h2 className="filters-title">Filters</h2>

          <div className="filter-block">
            <label className="filter-label">Time Range</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="filter-select"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All</option>
            </select>
          </div>

          <div className="filter-block">
            <label className="filter-label">Fraud Type</label>
            <select
              value={fraudTypeFilter}
              onChange={(e) => setFraudTypeFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Types</option>
              <option value="OTP Fraud">OTP Fraud</option>
              <option value="UPI Phishing">UPI Phishing</option>
              <option value="ATM Skimming">ATM Skimming</option>
              <option value="Loan App Fraud">Loan App Fraud</option>
              <option value="Debit Card Fraud">Debit Card Fraud</option>
              <option value="Impersonation / Digital Arrest">
                Impersonation / Digital Arrest
              </option>
            </select>
          </div>

          <div className="filter-block">
            <label className="filter-label">Location</label>
            <input
              type="text"
              placeholder="District / City"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-block">
            <label className="filter-label">Complaint ID</label>
            <input
              type="text"
              placeholder="Search by ID"
              value={idSearch}
              onChange={(e) => setIdSearch(e.target.value)}
              className="filter-input"
            />
          </div>
        </aside>

        {/* RIGHT SIDE – COMPLAINTS LIST */}
        <main className="login-main">
          <div className="login-main-header">
            <h2>Dashboard</h2>
          </div>

          <div className="complaints-list">
            {filteredComplaints.length === 0 ? (
              <div className="no-results">
                No complaints match the current filters.
              </div>
            ) : (
              filteredComplaints.map((c) => (
                <article
                  className="complaint-card"
                  key={c.complaint_id}
                >
                  <div className="complaint-card-top">
                    <div className="complaint-id-chip">
                      {c.complaint_id}
                    </div>
                    <div className="complaint-card-actions">
                      <button
                        className="btn-secondary"
                        onClick={() => handleViewDocs(c)}
                      >
                        View Docs
                      </button>
                      <button
                        className="btn-primary"
                        onClick={() => handleAction(c)}
                      >
                        Action
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => handleReject(c)}
                      >
                        Reject
                      </button>
                    </div>
                  </div>

                  <div className="complaint-title">
                    {c.fraud_type} reported – {c.bank_name}
                  </div>

                  <div className="complaint-meta-row">
                    <div className="meta-item">
                      <span className="meta-label">Time</span>
                      <span className="meta-value">
                        {new Date(
                          c.complaint_timestamp.replace(" ", "T")
                        ).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Location</span>
                      <span className="meta-value">
                        {c.victim_district} – {c.victim_taluka}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Reported Amount</span>
                      <span className="meta-value">
                        ₹
                        {new Intl.NumberFormat("en-IN").format(
                          c.reported_loss_amount
                        )}
                      </span>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </main>
      </div>

      {/* VIEW DOCS MODAL */}
      {selectedComplaint && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h3>Complaint Details – {selectedComplaint.complaint_id}</h3>
              <button onClick={closeDocs} className="modal-close">
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>
                <strong>Fraud Type:</strong> {selectedComplaint.fraud_type}
              </p>
              <p>
                <strong>Bank:</strong> {selectedComplaint.bank_name}
              </p>
              <p>
                <strong>Amount:</strong> ₹
                {new Intl.NumberFormat("en-IN").format(
                  selectedComplaint.reported_loss_amount
                )}
              </p>
              <p>
                <strong>Location:</strong>{" "}
                {selectedComplaint.victim_village},{" "}
                {selectedComplaint.victim_taluka},{" "}
                {selectedComplaint.victim_district},{" "}
                {selectedComplaint.victim_state} –{" "}
                {selectedComplaint.victim_pincode}
              </p>
              <p>
                <strong>Channel:</strong> {selectedComplaint.channel}
              </p>
              <p>
                <strong>Device:</strong> {selectedComplaint.device_type}
              </p>
              <p>
                <strong>Timestamp:</strong>{" "}
                {selectedComplaint.complaint_timestamp}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
