"use client";

import { useState, useEffect } from "react";

export default function PrescriptionsList() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal detail states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  const fetchPrescriptions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${backendUrl}/api/prescriptions/`);
      if (!response.ok) {
        throw new Error("Failed to fetch prescriptions list.");
      }
      const data = await response.json();
      setPrescriptions(data);
    } catch (err) {
      setError(err.message || "Could not connect to the backend server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleRowClick = async (id) => {
    setIsModalOpen(true);
    setIsModalLoading(true);
    setModalError(null);
    setSelectedPrescription(null);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${backendUrl}/api/prescriptions/${id}/`);
      if (!response.ok) {
        throw new Error("Failed to fetch prescription details.");
      }
      const data = await response.json();
      setSelectedPrescription(data);
    } catch (err) {
      setModalError(err.message);
    } finally {
      setIsModalLoading(false);
    }
  };

  const getSeverityClass = (sev) => {
    switch (sev?.toLowerCase()) {
      case "severe": return "badge-severe";
      case "moderate": return "badge-moderate";
      case "mild": return "badge-mild";
      case "error": return "badge-error";
      default: return "badge-none";
    }
  };

  return (
    <div className="result-section">
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 className="card-title" style={{ margin: 0 }}>Prescription History</h2>
          <button className="btn btn-secondary" onClick={fetchPrescriptions} style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
            🔄 Refresh
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="error-banner">
            <strong>Connection Error:</strong> {error}
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading ? (
          <div>
            <div className="skeleton skeleton-text" style={{ height: "2.5rem", marginBottom: "1rem" }}></div>
            <div className="skeleton skeleton-text" style={{ height: "2rem", marginBottom: "0.75rem" }}></div>
            <div className="skeleton skeleton-text" style={{ height: "2rem", marginBottom: "0.75rem" }}></div>
            <div className="skeleton skeleton-text" style={{ height: "2rem", marginBottom: "0.75rem" }}></div>
          </div>
        ) : prescriptions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-secondary)" }}>
            <p style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>No prescriptions found in the database.</p>
            <p style={{ fontSize: "0.9rem" }}>Go to <strong>New Prescription</strong> to add your first check.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Prescribing Doctor</th>
                  <th>Date</th>
                  <th>Medication Count</th>
                  <th>Severity Level</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((p) => (
                  <tr key={p.id} className="history-row" onClick={() => handleRowClick(p.id)}>
                    <td style={{ fontWeight: 500 }}>{p.patient_name}</td>
                    <td>{p.doctor_name}</td>
                    <td>{p.date}</td>
                    <td>{p.items ? p.items.length : 0} drugs</td>
                    <td>
                      <span className={`badge ${getSeverityClass(p.severity)}`}>
                        {p.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal Popup */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsModalOpen(false)}>
              &times;
            </button>

            {isModalLoading && (
              <div style={{ padding: "2rem 0", textAlign: "center" }}>
                <span className="spinner" style={{ width: "40px", height: "40px" }}></span>
                <p style={{ marginTop: "1rem", color: "var(--text-secondary)" }}>Retrieving interaction profile...</p>
              </div>
            )}

            {modalError && (
              <div style={{ marginTop: "1.5rem" }}>
                <div className="error-banner">
                  <strong>Error:</strong> {modalError}
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
                  <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                    Close Profile
                  </button>
                </div>
              </div>
            )}

            {selectedPrescription && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <div>
                    <h2 className="card-title" style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>
                      Prescription Profile
                    </h2>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                      ID: Rx-{selectedPrescription.id} | Date: {selectedPrescription.date}
                    </p>
                  </div>
                  <span className={`badge ${getSeverityClass(selectedPrescription.severity)}`} style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}>
                    {selectedPrescription.severity}
                  </span>
                </div>

                {/* Patient Metadata Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", background: "rgba(255,255,255,0.02)", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem", border: "1px solid var(--border-color)" }}>
                  <div>
                    <span className="form-label" style={{ fontSize: "0.75rem" }}>Patient</span>
                    <p style={{ fontSize: "1.05rem", fontWeight: 500, marginTop: "0.25rem" }}>{selectedPrescription.patient_name}</p>
                  </div>
                  <div>
                    <span className="form-label" style={{ fontSize: "0.75rem" }}>Prescriber</span>
                    <p style={{ fontSize: "1.05rem", fontWeight: 500, marginTop: "0.25rem" }}>{selectedPrescription.doctor_name}</p>
                  </div>
                </div>

                {/* Drugs List */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <h3 className="form-label" style={{ marginBottom: "0.75rem" }}>Prescribed Medications</h3>
                  <table className="drugs-table" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th>Medication Name</th>
                        <th>Dosage / Directions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPrescription.items && selectedPrescription.items.map((item) => (
                        <tr key={item.id}>
                          <td style={{ padding: "0.5rem 1rem", fontWeight: 500 }}>{item.drug_name}</td>
                          <td style={{ padding: "0.5rem 1rem", color: "var(--text-secondary)" }}>{item.dosage}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Clinical AI Results Section */}
                <div className="modal-section">
                  <h3 className="form-label" style={{ marginBottom: "0.75rem" }}>Clinical AI Assessment</h3>
                  <p style={{ fontSize: "1.05rem", lineHeight: "1.6", marginBottom: "1.5rem", color: "var(--text-primary)" }}>
                    {selectedPrescription.interaction_result}
                  </p>

                  {selectedPrescription.interaction_details && selectedPrescription.interaction_details.details && selectedPrescription.interaction_details.details.length > 0 ? (
                    <div>
                      <h4 className="form-label" style={{ marginBottom: "0.75rem", fontSize: "0.75rem" }}>Interactions Map</h4>
                      {selectedPrescription.interaction_details.details.map((item, idx) => (
                        <div
                          key={idx}
                          className={`interaction-item ${item.severity?.toLowerCase() === "severe" ? "severe" : item.severity?.toLowerCase() === "moderate" ? "moderate" : "mild"}`}
                          style={{ margin: "0 0 1rem 0" }}
                        >
                          <div className="interaction-drugs">
                            <span>⚠️ {item.drugs?.join(" + ")}</span>
                            <span className={`badge ${getSeverityClass(item.severity)}`} style={{ fontSize: "0.65rem", padding: "0.1rem 0.5rem" }}>
                              {item.severity}
                            </span>
                          </div>
                          <p className="interaction-text">
                            <strong>Mechanism:</strong> {item.mechanism}
                          </p>
                          <p className="interaction-recommendation">
                            <strong>Action:</strong> {item.recommendation}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    selectedPrescription.severity !== "Error" && (
                      <div style={{ background: "rgba(16, 185, 129, 0.05)", border: "1px dashed var(--severity-none)", borderRadius: "8px", padding: "1rem", textAlign: "center", color: "var(--severity-none)", fontSize: "0.95rem" }}>
                        ✔ No drug-drug interactions identified for this prescription.
                      </div>
                    )
                  )}
                </div>

                {/* Bottom Close Button */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem", borderTop: "1px solid var(--border-color)", paddingTop: "1.5rem" }}>
                  <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                    Close Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
