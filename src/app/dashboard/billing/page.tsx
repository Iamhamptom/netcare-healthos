"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Receipt, CreditCard, DollarSign, AlertCircle,
  Plus, Search, FileText, ChevronDown, ChevronUp,
  Banknote, Building2, ArrowUpRight,
} from "lucide-react";

interface Invoice {
  id: string;
  invoiceNo: string;
  patientName: string;
  lineItems: string;
  subtotal: number;
  tax: number;
  total: number;
  amountPaid: number;
  balance: number;
  medicalAidClaim: number;
  patientPortion: number;
  claimStatus: string;
  status: string;
  createdAt: string;
}

interface Payment {
  id: string;
  amount: number;
  method: string;
  reference: string;
  patientName: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  draft: "rgba(253,252,240,0.3)",
  sent: "#E8C84A",
  paid: "#10b981",
  partial: "#D4AF37",
  overdue: "#ef4444",
  cancelled: "#8A0303",
};

const methodIcons: Record<string, typeof CreditCard> = {
  cash: Banknote,
  card: CreditCard,
  eft: ArrowUpRight,
  medical_aid: Building2,
};

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [tab, setTab] = useState<"invoices" | "payments">("invoices");
  const [showNew, setShowNew] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Invoice form
  const [invForm, setInvForm] = useState({
    patientName: "", description: "", icd10Code: "", unitPrice: "",
    medicalAidClaim: "", notes: "",
  });

  // Payment form
  const [payForm, setPayForm] = useState({
    amount: "", method: "cash", reference: "", patientName: "",
    invoiceId: "", notes: "",
  });

  useEffect(() => {
    fetch("/api/invoices").then(r => r.json()).then(d => setInvoices(d.invoices || []));
    fetch("/api/payments").then(r => r.json()).then(d => {
      setPayments(d.payments || []);
      setTodayRevenue(d.todayRevenue || 0);
    });
  }, []);

  async function createInvoice(e: React.FormEvent) {
    e.preventDefault();
    const price = parseFloat(invForm.unitPrice) || 0;
    const tax = Math.round(price * 0.15 * 100) / 100;
    const maClaim = parseFloat(invForm.medicalAidClaim) || 0;

    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientName: invForm.patientName,
        lineItems: [{ description: invForm.description, icd10Code: invForm.icd10Code, quantity: 1, unitPrice: price, total: price }],
        subtotal: price,
        tax,
        total: price + tax,
        medicalAidClaim: maClaim,
        patientPortion: (price + tax) - maClaim,
        notes: invForm.notes,
      }),
    });
    const data = await res.json();
    setInvoices(prev => [data.invoice, ...prev]);
    setInvForm({ patientName: "", description: "", icd10Code: "", unitPrice: "", medicalAidClaim: "", notes: "" });
    setShowNew(false);
  }

  async function recordPayment(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: parseFloat(payForm.amount),
        method: payForm.method,
        reference: payForm.reference,
        patientName: payForm.patientName,
        invoiceId: payForm.invoiceId || null,
        notes: payForm.notes,
      }),
    });
    const data = await res.json();
    setPayments(prev => [data.payment, ...prev]);
    setPayForm({ amount: "", method: "cash", reference: "", patientName: "", invoiceId: "", notes: "" });
    setShowPayment(false);
    // Refresh invoices if linked
    if (payForm.invoiceId) {
      const d = await fetch("/api/invoices").then(r => r.json());
      setInvoices(d.invoices || []);
    }
  }

  const totalOutstanding = invoices.reduce((s, inv) => s + (inv.balance || 0), 0);
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);

  const filteredInvoices = search
    ? invoices.filter(i => i.patientName.toLowerCase().includes(search.toLowerCase()) || i.invoiceNo.toLowerCase().includes(search.toLowerCase()))
    : invoices;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Receipt className="w-5 h-5 text-[var(--gold)]" />
          <h2 className="text-lg font-semibold">Billing & Payments</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setShowNew(!showNew); setShowPayment(false); }} className="flex items-center gap-2 px-4 py-2 bg-[var(--gold)] rounded-lg text-[13px] font-medium text-[var(--obsidian)]">
            <FileText className="w-4 h-4" /> New Invoice
          </button>
          <button onClick={() => { setShowPayment(!showPayment); setShowNew(false); }} className="flex items-center gap-2 px-4 py-2 bg-[var(--teal)]/10 text-[var(--teal)] rounded-lg text-[13px] font-medium hover:bg-[var(--teal)]/20">
            <Plus className="w-4 h-4" /> Record Payment
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Today's Revenue" value={`R${todayRevenue.toLocaleString()}`} icon={DollarSign} color="#10b981" />
        <KPICard label="Total Collected" value={`R${totalPaid.toLocaleString()}`} icon={CreditCard} color="#D4AF37" />
        <KPICard label="Outstanding" value={`R${totalOutstanding.toLocaleString()}`} icon={AlertCircle} color="#ef4444" />
        <KPICard label="Invoices" value={String(invoices.length)} icon={Receipt} color="#2DD4BF" />
      </div>

      {/* New invoice form */}
      <AnimatePresence>
        {showNew && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={createInvoice}
            className="rounded-xl glass-panel p-5 space-y-4 overflow-hidden"
          >
            <h3 className="text-sm font-medium text-[var(--ivory)]">Create Invoice</h3>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Patient name" required value={invForm.patientName} onChange={e => setInvForm({ ...invForm, patientName: e.target.value })} className="input-glass" />
              <input type="text" placeholder="Service description" required value={invForm.description} onChange={e => setInvForm({ ...invForm, description: e.target.value })} className="input-glass" />
              <input type="text" placeholder="ICD-10 code (optional)" value={invForm.icd10Code} onChange={e => setInvForm({ ...invForm, icd10Code: e.target.value })} className="input-glass" />
              <input type="number" placeholder="Amount (R)" required step="0.01" value={invForm.unitPrice} onChange={e => setInvForm({ ...invForm, unitPrice: e.target.value })} className="input-glass" />
              <input type="number" placeholder="Medical aid claim portion (R)" step="0.01" value={invForm.medicalAidClaim} onChange={e => setInvForm({ ...invForm, medicalAidClaim: e.target.value })} className="input-glass" />
              <input type="text" placeholder="Notes (optional)" value={invForm.notes} onChange={e => setInvForm({ ...invForm, notes: e.target.value })} className="input-glass" />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="px-5 py-2 bg-[var(--gold)] rounded-lg text-[13px] font-medium text-[var(--obsidian)]">Create Invoice</button>
              <button type="button" onClick={() => setShowNew(false)} className="px-5 py-2 text-[13px] text-[var(--text-secondary)]">Cancel</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Record payment form */}
      <AnimatePresence>
        {showPayment && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={recordPayment}
            className="rounded-xl glass-panel p-5 space-y-4 overflow-hidden"
          >
            <h3 className="text-sm font-medium text-[var(--ivory)]">Record Payment</h3>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Patient name" required value={payForm.patientName} onChange={e => setPayForm({ ...payForm, patientName: e.target.value })} className="input-glass" />
              <input type="number" placeholder="Amount (R)" required step="0.01" value={payForm.amount} onChange={e => setPayForm({ ...payForm, amount: e.target.value })} className="input-glass" />
              <select value={payForm.method} onChange={e => setPayForm({ ...payForm, method: e.target.value })} className="input-glass">
                <option value="cash">Cash</option>
                <option value="card">Card (Yoco)</option>
                <option value="eft">EFT</option>
                <option value="medical_aid">Medical Aid</option>
              </select>
              <input type="text" placeholder="Reference (optional)" value={payForm.reference} onChange={e => setPayForm({ ...payForm, reference: e.target.value })} className="input-glass" />
              <select value={payForm.invoiceId} onChange={e => setPayForm({ ...payForm, invoiceId: e.target.value })} className="input-glass">
                <option value="">Link to invoice (optional)</option>
                {invoices.filter(i => i.balance > 0).map(i => (
                  <option key={i.id} value={i.id}>{i.invoiceNo} — {i.patientName} (R{i.balance})</option>
                ))}
              </select>
              <input type="text" placeholder="Notes (optional)" value={payForm.notes} onChange={e => setPayForm({ ...payForm, notes: e.target.value })} className="input-glass" />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="px-5 py-2 bg-[var(--teal)] rounded-lg text-[13px] font-medium text-[var(--obsidian)]">Record Payment</button>
              <button type="button" onClick={() => setShowPayment(false)} className="px-5 py-2 text-[13px] text-[var(--text-secondary)]">Cancel</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-[var(--border)]">
        <button onClick={() => setTab("invoices")} className={`pb-2 text-[13px] font-medium border-b-2 transition-colors ${tab === "invoices" ? "border-[var(--gold)] text-[var(--gold)]" : "border-transparent text-[var(--text-secondary)]"}`}>
          Invoices ({invoices.length})
        </button>
        <button onClick={() => setTab("payments")} className={`pb-2 text-[13px] font-medium border-b-2 transition-colors ${tab === "payments" ? "border-[var(--gold)] text-[var(--gold)]" : "border-transparent text-[var(--text-secondary)]"}`}>
          Payments ({payments.length})
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
        <input
          type="text"
          placeholder="Search by patient or invoice number..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-[var(--charcoal)]/20 border border-[var(--border)] rounded-lg text-[13px] text-[var(--ivory)] focus:outline-none focus:border-[var(--gold)]/30"
        />
      </div>

      {/* Invoice list */}
      {tab === "invoices" && (
        <div className="rounded-xl glass-panel overflow-hidden">
          {filteredInvoices.length === 0 ? (
            <div className="p-8 text-center text-[13px] text-[var(--text-tertiary)]">No invoices yet</div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {filteredInvoices.map(inv => (
                <div key={inv.id}>
                  <button
                    onClick={() => setExpanded(expanded === inv.id ? null : inv.id)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-white/[0.02] text-left"
                  >
                    <div className="w-9 h-9 rounded-full bg-[var(--gold)]/10 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-[var(--gold)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-[var(--ivory)]">{inv.patientName}</div>
                      <div className="text-[11px] text-[var(--text-tertiary)]">{inv.invoiceNo} · {new Date(inv.createdAt).toLocaleDateString("en-ZA")}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[14px] font-semibold text-[var(--ivory)]">R{inv.total.toLocaleString()}</div>
                      {inv.balance > 0 && <div className="text-[11px] text-[#ef4444]">R{inv.balance.toLocaleString()} due</div>}
                    </div>
                    <span className="text-[10px] font-medium px-2 py-1 rounded-full" style={{ color: statusColors[inv.status], backgroundColor: `${statusColors[inv.status]}15` }}>
                      {inv.status}
                    </span>
                    {expanded === inv.id ? <ChevronUp className="w-4 h-4 text-[var(--text-tertiary)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)]" />}
                  </button>
                  <AnimatePresence>
                    {expanded === inv.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-[var(--border)]"
                      >
                        <div className="p-4 bg-white/[0.01] space-y-3">
                          <div className="text-[11px] text-[var(--text-secondary)]">
                            {((() => { try { return JSON.parse(inv.lineItems); } catch { return []; } })()).map((item: { description: string; icd10Code: string; total: number }, i: number) => (
                              <div key={i} className="flex justify-between py-1">
                                <span>{item.description} {item.icd10Code && <span className="text-[var(--text-tertiary)]">({item.icd10Code})</span>}</span>
                                <span>R{item.total.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                          <div className="divider-shine" />
                          <div className="grid grid-cols-3 gap-4 text-[11px]">
                            <div><span className="text-[var(--text-tertiary)]">Medical Aid Claim:</span> <span className="text-[var(--ivory)] ml-1">R{inv.medicalAidClaim.toLocaleString()}</span></div>
                            <div><span className="text-[var(--text-tertiary)]">Patient Portion:</span> <span className="text-[var(--ivory)] ml-1">R{inv.patientPortion.toLocaleString()}</span></div>
                            <div><span className="text-[var(--text-tertiary)]">Claim Status:</span> <span className="text-[var(--ivory)] ml-1">{inv.claimStatus || "—"}</span></div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payments list */}
      {tab === "payments" && (
        <div className="rounded-xl glass-panel overflow-hidden">
          {payments.length === 0 ? (
            <div className="p-8 text-center text-[13px] text-[var(--text-tertiary)]">No payments recorded</div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {payments.map(p => {
                const MethodIcon = methodIcons[p.method] || CreditCard;
                return (
                  <div key={p.id} className="flex items-center gap-4 p-4">
                    <div className="w-9 h-9 rounded-full bg-[var(--teal)]/10 flex items-center justify-center shrink-0">
                      <MethodIcon className="w-4 h-4 text-[var(--teal)]" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[13px] font-semibold text-[var(--ivory)]">{p.patientName}</div>
                      <div className="text-[11px] text-[var(--text-tertiary)]">
                        {p.method.replace("_", " ")} {p.reference && `· ${p.reference}`} · {new Date(p.createdAt).toLocaleDateString("en-ZA")}
                      </div>
                    </div>
                    <div className="text-[14px] font-semibold text-[#10b981]">+R{p.amount.toLocaleString()}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function KPICard({ label, value, icon: Icon, color }: { label: string; value: string; icon: typeof DollarSign; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl glass-panel p-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <div className="text-xl font-bold text-[var(--ivory)]">{value}</div>
      <div className="text-[11px] text-[var(--text-tertiary)]">{label}</div>
    </motion.div>
  );
}
