"use client";

import { useEffect, useState } from "react";
import type { IntakeAnalysis } from "@/lib/intake-analyzer";

interface PrintData {
  analysis: IntakeAnalysis;
  transcript: string;
  patientName: string;
  date: string;
}

export default function IntakePrintPage() {
  const [data, setData] = useState<PrintData | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("intake-print-data");
      if (raw) {
        setData(JSON.parse(raw));
        // Auto-print after render
        setTimeout(() => window.print(), 500);
      }
    } catch {
      // ignore
    }
  }, []);

  if (!data) {
    return (
      <div style={{ padding: 40, fontFamily: "system-ui" }}>
        <h1>No intake data found</h1>
        <p>Please export from the intake page first.</p>
      </div>
    );
  }

  const { analysis: a, transcript, patientName, date } = data;
  const formattedDate = new Date(date).toLocaleDateString("en-ZA", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        body { margin: 0; background: white; color: #1a1a1a; font-family: system-ui, -apple-system, sans-serif; }
        .page { max-width: 800px; margin: 0 auto; padding: 40px; }
        .header { border-bottom: 2px solid #0d9488; padding-bottom: 16px; margin-bottom: 24px; }
        .header h1 { font-size: 20px; color: #0d9488; margin: 0 0 4px; }
        .header p { font-size: 12px; color: #666; margin: 0; }
        .meta { display: flex; gap: 24px; margin-bottom: 24px; font-size: 13px; }
        .meta-item { display: flex; flex-direction: column; }
        .meta-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #999; margin-bottom: 2px; }
        .section { margin-bottom: 20px; }
        .section-title { font-size: 14px; font-weight: 600; color: #0d9488; border-bottom: 1px solid #e5e5e5; padding-bottom: 6px; margin-bottom: 10px; }
        .red-flag { background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 10px 14px; margin-bottom: 16px; }
        .red-flag-title { font-size: 13px; font-weight: 600; color: #dc2626; margin-bottom: 4px; }
        .red-flag-item { font-size: 12px; color: #991b1b; }
        .summary-box { background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 6px; padding: 14px; margin-bottom: 16px; }
        .summary-chief { font-size: 15px; font-weight: 600; margin-bottom: 6px; }
        .summary-text { font-size: 13px; color: #374151; line-height: 1.5; }
        .code-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f3f4f6; font-size: 12px; }
        .code-label { font-weight: 600; color: #0d9488; font-family: monospace; }
        .code-conf { color: #9ca3af; }
        .symptom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .symptom-card { border: 1px solid #e5e7eb; border-radius: 6px; padding: 8px 10px; font-size: 12px; }
        .symptom-name { font-weight: 600; }
        .symptom-detail { color: #6b7280; margin-top: 2px; }
        .badge { display: inline-block; padding: 1px 6px; border-radius: 10px; font-size: 10px; font-weight: 600; }
        .badge-mild { background: #dcfce7; color: #166534; }
        .badge-moderate { background: #fef3c7; color: #92400e; }
        .badge-severe { background: #fee2e2; color: #991b1b; }
        .transcript { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 14px; font-size: 12px; line-height: 1.6; color: #4b5563; white-space: pre-wrap; max-height: 300px; overflow: hidden; }
        .vitals-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
        .vital-card { text-align: center; border: 1px solid #e5e7eb; border-radius: 6px; padding: 8px; }
        .vital-value { font-size: 18px; font-weight: 700; }
        .vital-label { font-size: 10px; color: #9ca3af; margin-top: 2px; }
        .action-item { display: flex; align-items: flex-start; gap: 6px; font-size: 12px; margin-bottom: 6px; }
        .action-check { color: #0d9488; flex-shrink: 0; }
        .print-btn { position: fixed; top: 16px; right: 16px; padding: 8px 20px; background: #0d9488; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
        .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e5e5; font-size: 10px; color: #9ca3af; text-align: center; }
      `}</style>

      <button className="print-btn no-print" onClick={() => window.print()}>
        Print / Save PDF
      </button>

      <div className="page">
        <div className="header">
          <h1>Clinical Intake Summary</h1>
          <p>AI-Generated Voice Intake Report — Netcare Health OS</p>
        </div>

        <div className="meta">
          <div className="meta-item">
            <span className="meta-label">Patient</span>
            <span>{patientName}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Date</span>
            <span>{formattedDate}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Generated By</span>
            <span>AI Voice Intake</span>
          </div>
        </div>

        {a.redFlags.length > 0 && (
          <div className="red-flag">
            <div className="red-flag-title">Red Flags Detected</div>
            {a.redFlags.map((flag, i) => (
              <div key={i} className="red-flag-item">{flag}</div>
            ))}
          </div>
        )}

        <div className="summary-box">
          <div className="summary-chief">{a.chiefComplaint}</div>
          <div className="summary-text">{a.clinicalSummary}</div>
          {a.historyOfPresentIllness && (
            <div className="summary-text" style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #d1fae5" }}>
              {a.historyOfPresentIllness}
            </div>
          )}
        </div>

        {a.icd10Suggestions.length > 0 && (
          <div className="section">
            <div className="section-title">ICD-10 Codes</div>
            {a.icd10Suggestions.map((c, i) => (
              <div key={i} className="code-row">
                <span><span className="code-label">{c.code}</span> {c.description}</span>
                <span className="code-conf">{c.confidence}%</span>
              </div>
            ))}
          </div>
        )}

        {a.symptoms.length > 0 && (
          <div className="section">
            <div className="section-title">Symptoms</div>
            <div className="symptom-grid">
              {a.symptoms.map((s, i) => (
                <div key={i} className="symptom-card">
                  <div className="symptom-name">
                    {s.name}{" "}
                    <span className={`badge badge-${s.severity}`}>{s.severity}</span>
                  </div>
                  {s.duration && <div className="symptom-detail">Duration: {s.duration}</div>}
                  {s.location && <div className="symptom-detail">Location: {s.location}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {a.medications.length > 0 && (
          <div className="section">
            <div className="section-title">Medications</div>
            {a.medications.map((m, i) => (
              <div key={i} className="code-row">
                <span style={{ fontWeight: 600 }}>{m.name}</span>
                <span>{m.dosage} — {m.frequency}</span>
              </div>
            ))}
          </div>
        )}

        {a.allergies.length > 0 && (
          <div className="section">
            <div className="section-title">Allergies</div>
            {a.allergies.map((al, i) => (
              <div key={i} className="code-row">
                <span>{al.name} {al.reaction && <span style={{ color: "#9ca3af" }}>({al.reaction})</span>}</span>
                <span className={`badge badge-${al.severity}`}>{al.severity}</span>
              </div>
            ))}
          </div>
        )}

        {Object.values(a.vitalsMentioned).some(v => v != null) && (
          <div className="section">
            <div className="section-title">Vitals Mentioned</div>
            <div className="vitals-grid">
              {a.vitalsMentioned.bloodPressureSys != null && (
                <div className="vital-card">
                  <div className="vital-value">{a.vitalsMentioned.bloodPressureSys}/{a.vitalsMentioned.bloodPressureDia || "?"}</div>
                  <div className="vital-label">Blood Pressure</div>
                </div>
              )}
              {a.vitalsMentioned.heartRate != null && (
                <div className="vital-card">
                  <div className="vital-value">{a.vitalsMentioned.heartRate}</div>
                  <div className="vital-label">Heart Rate</div>
                </div>
              )}
              {a.vitalsMentioned.temperature != null && (
                <div className="vital-card">
                  <div className="vital-value">{a.vitalsMentioned.temperature}</div>
                  <div className="vital-label">Temp</div>
                </div>
              )}
              {a.vitalsMentioned.painLevel != null && (
                <div className="vital-card">
                  <div className="vital-value">{a.vitalsMentioned.painLevel}/10</div>
                  <div className="vital-label">Pain</div>
                </div>
              )}
              {a.vitalsMentioned.oxygenSat != null && (
                <div className="vital-card">
                  <div className="vital-value">{a.vitalsMentioned.oxygenSat}%</div>
                  <div className="vital-label">SpO2</div>
                </div>
              )}
            </div>
          </div>
        )}

        {a.recommendedActions.length > 0 && (
          <div className="section">
            <div className="section-title">Recommended Actions</div>
            {a.recommendedActions.map((action, i) => (
              <div key={i} className="action-item">
                <span className="action-check">&#10003;</span>
                <span>{action}</span>
              </div>
            ))}
          </div>
        )}

        <div className="section">
          <div className="section-title">Full Transcript</div>
          <div className="transcript">{transcript}</div>
        </div>

        <div className="footer">
          Generated by Netcare Health OS AI Voice Intake — {formattedDate}
          <br />This is an AI-generated document. Clinical review required before any treatment decisions.
        </div>
      </div>
    </>
  );
}
