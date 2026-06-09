"use client";

import { useState } from "react";

export default function NewPrescription() {
  const [patientName, setPatientName] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [drugs, setDrugs] = useState([{ drug_name: "", dosage: "" }]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Dynamic row management
  const addDrugRow = () => {
    setDrugs([...drugs, { drug_name: "", dosage: "" }]);
  };

  const removeDrugRow = (index) => {
    const newDrugs = drugs.filter((_, i) => i !== index);
    // Enforce at least one row
    setDrugs(newDrugs.length === 0 ? [{ drug_name: "", dosage: "" }] : newDrugs);
  };

  const handleDrugChange = (index, field, value) => {
    const newDrugs = [...drugs];
    newDrugs[index][field] = value;
    setDrugs(newDrugs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    // Filter out rows with empty drug names
    const validDrugs = drugs.filter(d => d.drug_name.trim() !== "");
    if (validDrugs.length === 0) {
      setError("Please add at least one medication with a valid name.");
      return;
    }

    setIsLoading(true);

    const payload = {
      patient_name: patientName,
      doctor_name: doctorName,
      date: date,
      items: validDrugs
    };

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${backendUrl}/api/prescriptions/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save prescription and run interaction check.");
      }

      const data = await response.json();
      setResult(data);
      
      // Clear form on successful check
      setPatientName("");
      setDoctorName("");
      setDrugs([{ drug_name: "", dosage: "" }]);
    } catch (err) {
      setError(err.message || "An unexpected error occurred connecting to the backend.");
    } finally {
      setIsLoading(false);
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
        <h2 className="card-title">Prescription Details Form</h2>
        <form onSubmit={handleSubmit}>
          
          {/* Metadata Section */}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="patient_name">Patient Name</label>
              <input
                id="patient_name"
                className="form-input"
                type="text"
                required
                placeholder="e.g. John Doe"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="doctor_name">Prescribing Doctor</label>
              <input
                id="doctor_name"
                className="form-input"
                type="text"
                required
                placeholder="e.g. Dr. Robert Chen"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="date">Date</label>
              <input
                id="date"
                className="form-input"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Medications Section */}
          <div style={{ marginBottom: "1.5rem" }}>
            <h3 className="form-label" style={{ marginBottom: "0.75rem" }}>Prescribed Medications</h3>
            <table className="drugs-table">
              <thead>
                <tr>
                  <th>Drug Name</th>
                  <th>Dosage / Directions</th>
                  <th style={{ width: "80px", textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {drugs.map((drug, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        className="form-input"
                        type="text"
                        required={index === 0}
                        placeholder="e.g. Metformin"
                        value={drug.drug_name}
                        onChange={(e) => handleDrugChange(index, "drug_name", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="form-input"
                        type="text"
                        placeholder="e.g. 500mg once daily"
                        value={drug.dosage}
                        onChange={(e) => handleDrugChange(index, "dosage", e.target.value)}
                      />
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        type="button"
                        className="btn btn-danger"
                        style={{ padding: "0.5rem 0.75rem" }}
                        onClick={() => removeDrugRow(index)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <button
              type="button"
              className="btn btn-secondary"
              onClick={addDrugRow}
            >
              + Add Medication
            </button>
          </div>

          <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span> Checking Interactions...
                </>
              ) : (
                "Save & Run Check"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error State Banner */}
      {error && (
        <div className="error-banner">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="card">
          <div className="skeleton skeleton-text" style={{ width: "40%", height: "1.5rem", marginBottom: "1.5rem" }}></div>
          <div className="skeleton skeleton-text" style={{ width: "90%", height: "1.2rem", marginBottom: "1rem" }}></div>
          <div className="skeleton skeleton-text" style={{ width: "80%", height: "1.2rem", marginBottom: "1rem" }}></div>
          <div className="skeleton skeleton-text" style={{ width: "60%", height: "1.2rem" }}></div>
        </div>
      )}

      {/* Interaction Check Results Section */}
      {result && result.interaction_details && (
        <div className="card" style={{ borderLeft: "4px solid " + (result.severity === "None" ? "var(--severity-none)" : "var(--primary)") }}>
          <div className="result-header">
            <div>
              <h3 className="card-title" style={{ marginBottom: "0.25rem" }}>Interaction Analysis Result</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                Patient: <strong>{result.patient_name}</strong> | Doctor: <strong>{result.doctor_name}</strong>
              </p>
            </div>
            <span className={`badge ${getSeverityClass(result.severity)}`}>
              {result.severity}
            </span>
          </div>

          <p style={{ fontSize: "1.05rem", lineHeight: "1.6", marginBottom: "1.5rem" }}>
            {result.interaction_details.summary}
          </p>

          {/* Render individual interactions list */}
          {result.interaction_details.details && result.interaction_details.details.length > 0 ? (
            <div>
              <h4 className="form-label" style={{ marginBottom: "1rem" }}>Interactions Identified ({result.interaction_details.details.length})</h4>
              {result.interaction_details.details.map((item, idx) => (
                <div
                  key={idx}
                  className={`interaction-item ${item.severity?.toLowerCase() === "severe" ? "severe" : item.severity?.toLowerCase() === "moderate" ? "moderate" : "mild"}`}
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
                    <strong>Recommended Action:</strong> {item.recommendation}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            result.severity !== "Error" && (
              <div style={{ background: "rgba(16, 185, 129, 0.05)", border: "1px dashed var(--severity-none)", borderRadius: "8px", padding: "1.25rem", textAlign: "center", color: "var(--severity-none)" }}>
                ✔ No drug-drug interactions detected for this prescription. Safe to proceed with dispensing.
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
