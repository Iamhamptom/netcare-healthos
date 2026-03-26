"use client";
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Mic, MicOff, FileText, CheckCircle2, ArrowRight, Loader2, Edit3, Send, AlertTriangle, ClipboardList, Sparkles, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";

type Stage = "capture" | "processing" | "review" | "approved" | "sent";

interface SOAPNote { subjective: string; objective: string; assessment: string; plan: string; }
interface ICD10Code { code: string; description: string; isPrimary: boolean; isPMB?: boolean; }
interface TariffCode { code: string; description: string; amount?: string; }
interface Medication { name: string; dosage: string; duration?: string; nappiCode?: string; }

export default function IntakePage() {
  const [stage, setStage] = useState<Stage>("capture");
  const [inputMethod, setInputMethod] = useState<"text"|"photo"|"voice">("text");
  const [rawNotes, setRawNotes] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("M");
  const [processing, setProcessing] = useState(false);
  const [soap, setSOAP] = useState<SOAPNote|null>(null);
  const [icd10, setICD10] = useState<ICD10Code[]>([]);
  const [tariffs, setTariffs] = useState<TariffCode[]>([]);
  const [meds, setMeds] = useState<Medication[]>([]);
  const [followUp, setFollowUp] = useState("");
  const [redFlags, setRedFlags] = useState<string[]>([]);
  const [listening, setListening] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const processNotes = useCallback(async (notes: string) => {
    if (!notes.trim()) return;
    setProcessing(true); setError(""); setStage("processing");
    try {
      const res = await fetch("/api/imaging/analyze-notes", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes, patientAge: patientAge ? parseInt(patientAge) : undefined, patientGender }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "Processing failed"); setStage("capture"); return; }
      setSOAP(data.soap || null);
      setICD10(data.icd10Codes || []);
      setTariffs(data.tariffCodes || []);
      setMeds(data.medications || []);
      setFollowUp(data.followUp || "");
      setRedFlags(data.redFlags || []);
      setStage("review");
    } catch { setError("Connection error"); setStage("capture"); }
    finally { setProcessing(false); }
  }, [patientAge, patientGender]);

  const handlePhoto = useCallback(async (file: File) => {
    setProcessing(true); setStage("processing"); setError("");
    try {
      const buffer = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      const res = await fetch("/api/imaging/analyze-notes", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: "[Photo of handwritten clinical notes]", image: base64, patientAge: patientAge ? parseInt(patientAge) : undefined, patientGender }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "Failed to read notes"); setStage("capture"); return; }
      setSOAP(data.soap || null); setICD10(data.icd10Codes || []); setTariffs(data.tariffCodes || []); setMeds(data.medications || []);
      setFollowUp(data.followUp || ""); setRedFlags(data.redFlags || []); setStage("review");
    } catch { setError("Failed to process image"); setStage("capture"); }
    finally { setProcessing(false); }
  }, [patientAge, patientGender]);

  const startVoice = useCallback(() => {
    if (!("webkitSpeechRecognition" in window)) return;
    const SR = (window as Record<string,unknown>).webkitSpeechRecognition;
    const rec = new (SR as any)(); rec.lang = "en-ZA"; rec.continuous = true; rec.interimResults = true;
    rec.onresult = (e: any) => {
      let t = "";
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
      setRawNotes(t);
    };
    rec.onend = () => setListening(false);
    rec.start(); setListening(true);
  }, []);

  const sendToClerk = useCallback(async () => {
    setStage("sent");
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Clinical Intake</h1>
            <p className="text-xs text-zinc-500">Notes to SOAP to ICD-10 to Claim</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-8">
          {(["Capture","Process","Review","Approve","Send"] as const).map((s, i) => {
            const stages: Stage[] = ["capture","processing","review","approved","sent"];
            const active = stages.indexOf(stage) >= i;
            return (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${active ? "bg-blue-600" : "bg-zinc-800 text-zinc-600"}`}>{i+1}</div>
                <span className={`text-xs ${active ? "text-white" : "text-zinc-600"}`}>{s}</span>
                {i < 4 && <div className={`flex-1 h-px ${active ? "bg-blue-600" : "bg-zinc-800"}`} />}
              </div>
            );
          })}
        </div>

        {/* STAGE: CAPTURE */}
        {stage === "capture" && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="grid grid-cols-2 gap-2 col-span-3">
                <input value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="Patient name" className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm" />
                <div className="flex gap-2">
                  <input value={patientAge} onChange={e => setPatientAge(e.target.value)} placeholder="Age" className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm w-20" />
                  <select value={patientGender} onChange={e => setPatientGender(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm flex-1">
                    <option value="M">Male</option><option value="F">Female</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {([["text", FileText, "Type notes"], ["photo", Camera, "Photo of notes"], ["voice", Mic, "Dictate"]] as const).map(([method, Icon, label]) => (
                <button key={method} onClick={() => setInputMethod(method as any)}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition ${inputMethod === method ? "border-blue-500 bg-blue-500/10 text-blue-400" : "border-zinc-800 bg-zinc-900 text-zinc-400"}`}>
                  <Icon className="w-4 h-4" /><span className="text-xs">{label}</span>
                </button>
              ))}
            </div>

            {inputMethod === "text" && (
              <textarea value={rawNotes} onChange={e => setRawNotes(e.target.value)} rows={8}
                placeholder="Type or paste clinical notes here...&#10;&#10;e.g., 45yo M presenting with 3-day history of productive cough, fever 38.5C, right-sided pleuritic chest pain. O/E: decreased breath sounds right base. SpO2 94% on RA."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm resize-none focus:outline-none focus:border-blue-500/50" />
            )}

            {inputMethod === "photo" && (
              <div className="border-2 border-dashed border-zinc-700 rounded-xl p-8 text-center cursor-pointer hover:border-zinc-500 transition"
                onClick={() => fileRef.current?.click()}>
                <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handlePhoto(f); }} />
                <Camera className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
                <p className="text-zinc-300 text-sm font-medium">Take photo or upload image</p>
                <p className="text-zinc-600 text-xs mt-1">Handwritten notes, printed notes, lab reports</p>
              </div>
            )}

            {inputMethod === "voice" && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
                <button onClick={listening ? () => setListening(false) : startVoice}
                  className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 transition ${listening ? "bg-red-500 animate-pulse" : "bg-blue-600 hover:bg-blue-500"}`}>
                  {listening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
                <p className="text-sm text-zinc-300">{listening ? "Listening... speak now" : "Tap to start dictation"}</p>
                {rawNotes && <div className="mt-4 p-3 bg-zinc-800 rounded-lg text-left text-sm text-zinc-300">{rawNotes}</div>}
              </div>
            )}

            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>}

            <button onClick={() => processNotes(rawNotes)} disabled={!rawNotes.trim() || processing}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-xl font-medium flex items-center justify-center gap-2 transition">
              <Sparkles className="w-4 h-4" /> Process with AI <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STAGE: PROCESSING */}
        {stage === "processing" && (
          <div className="text-center py-16">
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Processing Clinical Notes</h3>
            <p className="text-zinc-500 text-sm">Converting to SOAP note, generating ICD-10 codes, suggesting tariffs...</p>
          </div>
        )}

        {/* STAGE: REVIEW */}
        {stage === "review" && soap && (
          <div className="space-y-4">
            {redFlags.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4 text-red-400" /><span className="text-sm font-semibold text-red-400">Clinical Red Flags</span></div>
                {redFlags.map((f, i) => <p key={i} className="text-sm text-red-300">- {f}</p>)}
              </div>
            )}

            {/* SOAP Note */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-blue-400 mb-3">SOAP Note</h3>
              {(["subjective","objective","assessment","plan"] as const).map(key => (
                <div key={key} className="mb-3">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{key}</label>
                  <p className="text-sm text-zinc-200 mt-1">{soap[key]}</p>
                </div>
              ))}
            </div>

            {/* ICD-10 Codes */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-emerald-400 mb-3">ICD-10 Codes (Auto-Generated)</h3>
              {icd10.map((c, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-zinc-800 last:border-0">
                  <span className="font-mono text-sm font-bold text-emerald-400">{c.code}</span>
                  <span className="text-sm text-zinc-300 flex-1">{c.description}</span>
                  {c.isPrimary && <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">PRIMARY</span>}
                  {c.isPMB && <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">PMB</span>}
                </div>
              ))}
            </div>

            {/* Tariffs + Meds */}
            <button onClick={() => setShowDetails(!showDetails)} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition">
              {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              Tariffs ({tariffs.length}) + Medications ({meds.length}) + Follow-up
            </button>
            {showDetails && (
              <div className="space-y-3">
                {tariffs.length > 0 && (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <h4 className="text-xs font-semibold text-purple-400 mb-2">Suggested Tariffs</h4>
                    {tariffs.map((t, i) => <div key={i} className="flex justify-between text-sm py-1"><span className="font-mono text-purple-300">{t.code}</span><span className="text-zinc-400">{t.description}</span>{t.amount && <span className="text-zinc-300">{t.amount}</span>}</div>)}
                  </div>
                )}
                {meds.length > 0 && (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <h4 className="text-xs font-semibold text-cyan-400 mb-2">Medications</h4>
                    {meds.map((m, i) => <div key={i} className="text-sm py-1"><span className="text-cyan-300">{m.name}</span> <span className="text-zinc-500">{m.dosage} {m.duration && `x ${m.duration}`}</span> {m.nappiCode && <span className="text-zinc-600 font-mono text-xs">NAPPI: {m.nappiCode}</span>}</div>)}
                  </div>
                )}
                {followUp && <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"><h4 className="text-xs font-semibold text-amber-400 mb-2">Follow-up</h4><p className="text-sm text-zinc-300">{followUp}</p></div>}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setStage("capture"); setSOAP(null); }} className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-medium flex items-center justify-center gap-2 transition">
                <RotateCcw className="w-4 h-4" /> Re-do
              </button>
              <button onClick={() => setStage("approved")} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-medium flex items-center justify-center gap-2 transition">
                <CheckCircle2 className="w-4 h-4" /> Doctor Approves
              </button>
            </div>
          </div>
        )}

        {/* STAGE: APPROVED */}
        {stage === "approved" && (
          <div className="text-center py-12">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Doctor Approved</h3>
            <p className="text-zinc-400 text-sm mb-6">SOAP note + ICD-10 codes approved. Ready to send to billing clerk.</p>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6 text-left">
              <p className="text-xs text-zinc-500 mb-1">Patient: <span className="text-white">{patientName || "Unnamed"}</span></p>
              <p className="text-xs text-zinc-500 mb-1">ICD-10: <span className="text-emerald-400 font-mono">{icd10.map(c=>c.code).join(", ")}</span></p>
              <p className="text-xs text-zinc-500">Tariff: <span className="text-purple-400 font-mono">{tariffs.map(t=>t.code).join(", ")}</span></p>
            </div>
            <button onClick={sendToClerk} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium flex items-center justify-center gap-2 mx-auto transition">
              <Send className="w-4 h-4" /> Send to Clerk for Claim Submission
            </button>
          </div>
        )}

        {/* STAGE: SENT */}
        {stage === "sent" && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-4"><Send className="w-7 h-7" /></div>
            <h3 className="text-lg font-semibold mb-2">Sent to Billing Clerk</h3>
            <p className="text-zinc-400 text-sm mb-6">Claim data sent with pre-filled ICD-10 codes, tariffs, and medications. The clerk will review and submit to the scheme.</p>
            <button onClick={() => { setStage("capture"); setRawNotes(""); setSOAP(null); setICD10([]); setTariffs([]); setMeds([]); setPatientName(""); setPatientAge(""); }}
              className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-medium flex items-center justify-center gap-2 mx-auto transition">
              <ClipboardList className="w-4 h-4" /> New Patient Intake
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
