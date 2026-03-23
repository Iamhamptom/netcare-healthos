'use client';

import { useState, useRef, useEffect, useCallback, DragEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  Send,
  Paperclip,
  Download,
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  MessageSquare,
  Bot,
  User,
  RotateCcw,
  History,
  Trash2,
  Plus,
  ChevronLeft,
} from 'lucide-react';
import Link from 'next/link';

/* ──────────────────────────────────────────────
   Types
   ────────────────────────────────────────────── */

interface FileInfo {
  file: File;
  name: string;
  size: string;
  type: string;
}

interface StatCard {
  label: string;
  value: number | string;
  color: string;
  icon: React.ReactNode;
}

interface BatchInsight {
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'error';
}

interface IssueItem {
  issue: string;
  count: number;
  severity: 'error' | 'warning' | 'info';
}

interface AnalysisData {
  summary: string;
  totalClaims: number;
  validClaims: number;
  rejectedClaims: number;
  warningClaims: number;
  columns: number;
  estimatedSavings: string;
  selfDiagnosis?: { detected: boolean; problem: string; action: string; remapped?: boolean };
  batchInsights?: BatchInsight[];
  topIssues: IssueItem[];
  rawResponse?: any;
}

interface FixData {
  fixedCount: number;
  originalRejections: number;
  newRejections: number;
  fixedCSV?: string | null;
  suggestedFileName?: string;
  changes: { field: string; before: string; after: string; count: number }[];
  beforeRate?: number;
  afterRate?: number;
  claimsFixed?: number;
}

interface FilteredData {
  claims: any[];
  filterType: string;
  count: number;
}

type MessageType = 'text' | 'file' | 'analysis' | 'fix' | 'filtered' | 'typing' | 'welcome' | 'error';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  type: MessageType;
  data?: AnalysisData | FixData | FilteredData | FileInfo | any;
  timestamp: Date;
}

/* ──────────────────────────────────────────────
   Constants
   ────────────────────────────────────────────── */

const ACCEPTED_TYPES = [
  'text/csv',
  'text/tab-separated-values',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
];
const ACCEPTED_EXTENSIONS = ['.csv', '.tsv', '.txt', '.xlsx', '.xls'];

const NAV_TABS = [
  { label: 'Chat', href: '/dashboard/claims-chat', active: true },
  { label: 'Batch Analyze', href: '/dashboard/claims' },
  { label: 'Quick Check', href: '/dashboard/claims?tab=quick' },
  { label: 'Code & Submit', href: '/dashboard/claims?tab=code' },
  { label: 'Code Lookup', href: '/dashboard/claims?tab=lookup' },
  { label: 'History', href: '/dashboard/claims?tab=history' },
];

const ACTION_PILLS = [
  { id: 'fix', label: 'Fix Rejections', icon: 'zap', color: 'bg-emerald-500 hover:bg-emerald-600' },
  { id: 'rejected', label: 'Show Rejected', icon: 'xcircle', color: 'bg-red-500 hover:bg-red-600' },
  { id: 'csv', label: 'Download CSV', icon: 'download', color: 'bg-emerald-600 hover:bg-emerald-700' },
  { id: 'report', label: 'Download PDF', icon: 'download', color: 'bg-[#3DA9D1] hover:bg-[#2E8AB0]' },
  { id: 'details', label: 'Full Table', icon: 'arrow', color: 'bg-gray-600 hover:bg-gray-700' },
  { id: 'raw', label: 'Raw JSON', icon: 'arrow', color: 'bg-gray-500 hover:bg-gray-600' },
];

/* ──────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────── */

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function getSmartResponse(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('hi') || t.includes('hello') || t.includes('hey'))
    return "Hello! I'm the Claims AI assistant. Upload a CSV file with your medical claims and I'll analyze them for rejection risks, fix formatting issues, and help you get cleaner submissions. Just drop your file here or click the attachment icon.";
  if (t.includes('how') && (t.includes('work') || t.includes('use')))
    return "**How it works:**\n\n1. Upload your claims CSV (any format — comma, semicolon, tab-separated)\n2. I'll instantly analyze every claim against SA ICD-10 rules, scheme rules, and common rejection patterns\n3. Click **Fix My File** to auto-correct what I can (format errors, missing codes, specificity)\n4. Download the fixed CSV and re-upload to verify\n\nI support Healthbridge format, standard CSV, and auto-detect column names.";
  if (t.includes('format') || t.includes('column') || t.includes('csv'))
    return "**Supported CSV columns:**\n\n- `icd10_code` — ICD-10 diagnosis code (**required**)\n- `patient_name`, `patient_gender`, `patient_age`\n- `tariff_code`, `nappi_code`, `amount`\n- `date_of_service`, `scheme`, `dependent_code`\n\nOnly `icd10_code` is required. I auto-detect column names — your headers don't need to match exactly. I also support semicolon-delimited (SA Excel) and Healthbridge export format.";
  if (t.includes('reject') || t.includes('error') || t.includes('why'))
    return "Common rejection reasons in SA:\n\n1. **Invalid ICD-10 format** — codes must be Letter + 2 digits + optional dot + subcategory (e.g., J06.9)\n2. **Non-specific codes** — 3-character codes without 4th digit (J06 should be J06.9)\n3. **Missing External Cause Code** — injury codes (S/T) need a V/W/X/Y secondary code\n4. **Gender mismatch** — male-only codes on female patients or vice versa\n5. **Duplicate claims** — same patient + code + date\n\nUpload your file and I'll check for all of these.";
  if (t.includes('scheme') || t.includes('discovery') || t.includes('gems') || t.includes('bonitas'))
    return "I support scheme-specific rules for **Discovery Health**, **GEMS**, **Bonitas**, **Medshield**, **Momentum Health**, **Bestmed**, and more. When you upload, select your scheme from the dropdown for targeted validation.";
  if (t.includes('help'))
    return "I can help you with:\n\n- **Analyze** — Upload a CSV and I'll check every claim\n- **Fix** — Auto-correct format errors, missing codes, specificity issues\n- **Explain** — Tell you why claims are being rejected\n- **Download** — Give you a cleaned CSV ready for submission\n\nJust drop your claims file here to get started.";
  return "I'm ready to analyze your claims. Upload a CSV, TSV, or XLSX file with medical claims data and I'll check every line for rejection risks, fix what I can, and explain any issues. Just drop the file here or click the attachment icon below.";
}

function isAcceptedFile(file: File): boolean {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  return ACCEPTED_TYPES.includes(file.type) || ACCEPTED_EXTENSIONS.includes(ext);
}

function buildAnalysisSummary(data: any): AnalysisData {
  // API returns: totalClaims, validClaims, invalidClaims, warningClaims, headers[], summary.estimatedSavings, summary.topIssues[{rule,count,severity}], lineResults[], batchInsights[], selfDiagnosis
  const total = data.totalClaims ?? 0;
  const valid = data.validClaims ?? 0;
  const rejected = data.invalidClaims ?? 0;
  const warnings = data.warningClaims ?? 0;
  const columns = data.headers?.length ?? 0;
  const savings = data.summary?.estimatedSavings ?? 0;
  const rejRate = data.summary?.estimatedRejectionRate ?? 0;

  // Top issues from summary.topIssues — field is "rule" not "issue"
  const topIssues: IssueItem[] = (data.summary?.topIssues ?? [])
    .filter((i: any) => i.severity === 'error' || i.severity === 'warning')
    .map((i: any) => ({
      issue: i.rule ?? '',
      count: i.count ?? 1,
      severity: i.severity ?? 'error',
    }));

  // Also add top error-level issues from the actual issues list if topIssues is sparse
  if (topIssues.length === 0 && data.issues) {
    const byRule: Record<string, { count: number; severity: string; message: string }> = {};
    for (const i of data.issues) {
      if (i.severity === 'error' || i.severity === 'warning') {
        if (!byRule[i.rule]) byRule[i.rule] = { count: 0, severity: i.severity, message: i.message };
        byRule[i.rule].count++;
      }
    }
    for (const [rule, info] of Object.entries(byRule)) {
      topIssues.push({ issue: rule, count: info.count, severity: info.severity as 'error' | 'warning' | 'info' });
    }
    topIssues.sort((a, b) => b.count - a.count);
  }

  // Batch insights from batchInsights[]
  const batchInsights: BatchInsight[] = (data.batchInsights ?? []).map((b: any) => ({
    title: b.rule ?? 'Issue',
    description: b.explanation ?? '',
    severity: b.severity ?? 'error',
  }));

  // Self-diagnosis
  const selfDiagnosis = data.selfDiagnosis?.detected ? data.selfDiagnosis : undefined;

  // Build natural language summary
  let summary = `I analyzed **${total} claims** across **${columns} columns**. `;
  if (rejected === 0 && warnings === 0) {
    summary += `All claims look clean — **${valid} valid**, no rejections.`;
  } else if (rejRate >= 80) {
    summary += `**${rejected} claims will be rejected** (${rejRate}% rejection rate). There's likely a systematic issue — see the details below.`;
  } else {
    summary += `**${valid} valid**, **${rejected} will be rejected**, **${warnings} warnings**. Estimated savings if fixed: **R${savings.toLocaleString()}**.`;
  }

  if (selfDiagnosis?.remapped) {
    summary += `\n\n⚡ **Auto-corrected**: ${selfDiagnosis.problem}`;
  }

  return {
    summary,
    totalClaims: total,
    validClaims: valid,
    rejectedClaims: rejected,
    warningClaims: warnings,
    columns,
    estimatedSavings: `R${savings.toLocaleString()}`,
    selfDiagnosis,
    batchInsights: batchInsights.length > 0 ? batchInsights : undefined,
    topIssues: topIssues.slice(0, 8),
    rawResponse: data,
  };
}

function buildFixSummary(data: any): FixData {
  // API returns: stats.before/after, stats.totalCorrections, corrections[{line,field,from,to,rule}], fixedCSV
  const stats = data.stats ?? {};
  return {
    fixedCount: stats.totalCorrections ?? 0,
    originalRejections: stats.before?.errors ?? 0,
    newRejections: stats.after?.errors ?? 0,
    fixedCSV: data.fixedCSV ?? null,
    suggestedFileName: data.suggestedFileName ?? 'claims_FIXED.csv',
    changes: (data.corrections ?? []).map((c: any) => ({
      field: `Line ${c.line}: ${c.rule}`,
      before: c.from || '(empty)',
      after: c.to || '',
      count: 1,
    })),
    beforeRate: stats.before?.rejectionRate ?? 0,
    afterRate: stats.after?.rejectionRate ?? 0,
    claimsFixed: stats.improvement?.claimsFixed ?? 0,
  };
}

/* ──────────────────────────────────────────────
   Sub-components
   ────────────────────────────────────────────── */

function PillIcon({ name }: { name: string }) {
  switch (name) {
    case 'zap': return <Zap className="w-4 h-4" />;
    case 'xcircle': return <XCircle className="w-4 h-4" />;
    case 'download': return <Download className="w-4 h-4" />;
    case 'arrow': return <ArrowRight className="w-4 h-4" />;
    default: return null;
  }
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-start gap-3 px-4 py-2"
    >
      <div className="w-8 h-8 rounded-full bg-[#3DA9D1] flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
        <span className="text-sm text-gray-500 mr-2">Analyzing your file</span>
        <motion.span
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
          className="w-2 h-2 rounded-full bg-[#3DA9D1] inline-block"
        />
        <motion.span
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
          className="w-2 h-2 rounded-full bg-[#3DA9D1] inline-block"
        />
        <motion.span
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
          className="w-2 h-2 rounded-full bg-[#3DA9D1] inline-block"
        />
      </div>
    </motion.div>
  );
}

function StatCards({ data }: { data: AnalysisData }) {
  const cards: StatCard[] = [
    { label: 'Total Claims', value: data.totalClaims, color: 'text-[#3DA9D1]', icon: <FileText className="w-4 h-4" /> },
    { label: 'Valid', value: data.validClaims, color: 'text-emerald-500', icon: <CheckCircle2 className="w-4 h-4" /> },
    { label: 'Rejected', value: data.rejectedClaims, color: 'text-red-500', icon: <XCircle className="w-4 h-4" /> },
    { label: 'Warnings', value: data.warningClaims, color: 'text-amber-500', icon: <AlertTriangle className="w-4 h-4" /> },
    { label: 'Est. Savings', value: data.estimatedSavings, color: 'text-emerald-600', icon: <Zap className="w-4 h-4" /> },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 my-3">
      {cards.map((card) => (
        <div key={card.label} className="bg-white border border-gray-200 rounded-xl p-3 text-center shadow-sm">
          <div className={`flex items-center justify-center gap-1 ${card.color} mb-1`}>
            {card.icon}
            <span className="text-lg font-bold">{card.value}</span>
          </div>
          <span className="text-xs text-gray-500">{card.label}</span>
        </div>
      ))}
    </div>
  );
}

function DiagnosisBanner({ diagnosis }: { diagnosis: { detected: boolean; problem: string; action: string; remapped?: boolean } }) {
  return (
    <div className={`rounded-xl p-3 my-3 flex items-start gap-2 border ${diagnosis.remapped ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'}`}>
      <Sparkles className={`w-5 h-5 flex-shrink-0 mt-0.5 ${diagnosis.remapped ? 'text-blue-500' : 'text-amber-500'}`} />
      <div>
        <p className={`text-sm font-semibold mb-0.5 ${diagnosis.remapped ? 'text-blue-700' : 'text-amber-700'}`}>
          {diagnosis.remapped ? 'Auto-Corrected' : 'Issue Detected'}
        </p>
        <p className="text-sm text-gray-700">{diagnosis.problem}</p>
        <p className={`text-xs mt-1 font-medium ${diagnosis.remapped ? 'text-blue-600' : 'text-amber-600'}`}>{diagnosis.action}</p>
      </div>
    </div>
  );
}

function BatchInsightsBlock({ insights }: { insights: BatchInsight[] }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? insights : insights.slice(0, 2);
  const severityColor = { info: 'bg-blue-50 border-blue-200', warning: 'bg-amber-50 border-amber-200', error: 'bg-red-50 border-red-200' };
  const severityText = { info: 'text-blue-700', warning: 'text-amber-700', error: 'text-red-700' };

  return (
    <div className="my-3 space-y-2">
      <p className="text-sm font-semibold text-gray-700">Batch Insights</p>
      {shown.map((ins, i) => (
        <div key={i} className={`border rounded-lg p-3 ${severityColor[ins.severity]}`}>
          <p className={`text-sm font-medium ${severityText[ins.severity]}`}>{ins.title}</p>
          <p className="text-sm text-gray-600 mt-0.5">{ins.description}</p>
        </div>
      ))}
      {insights.length > 2 && (
        <button onClick={() => setExpanded(!expanded)} className="text-sm text-[#3DA9D1] hover:underline">
          {expanded ? 'Show less' : `Show ${insights.length - 2} more insights`}
        </button>
      )}
    </div>
  );
}

function IssueList({ issues }: { issues: IssueItem[] }) {
  if (issues.length === 0) return null;
  const iconMap = {
    error: <XCircle className="w-4 h-4 text-red-500" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500" />,
    info: <CheckCircle2 className="w-4 h-4 text-blue-500" />,
  };

  return (
    <div className="my-3">
      <p className="text-sm font-semibold text-gray-700 mb-2">Top Issues</p>
      <div className="space-y-1.5">
        {issues.slice(0, 8).map((issue, i) => (
          <div key={i} className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-3 py-2">
            {iconMap[issue.severity]}
            <span className="text-sm text-gray-700 flex-1">{issue.issue}</span>
            <span className="text-xs font-medium text-gray-400 bg-gray-50 rounded-full px-2 py-0.5">{issue.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionPillsRow({ onAction }: { onAction: (id: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {ACTION_PILLS.map((pill) => (
        <button
          key={pill.id}
          onClick={() => onAction(pill.id)}
          className={`${pill.color} text-white text-sm font-medium px-4 py-2 rounded-full flex items-center gap-2 transition-colors shadow-sm`}
        >
          <PillIcon name={pill.icon} />
          {pill.label}
        </button>
      ))}
    </div>
  );
}

function FileAttachmentBubble({ info }: { info: FileInfo }) {
  return (
    <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/30">
      <div className="w-10 h-10 rounded-lg bg-white/30 flex items-center justify-center">
        <FileText className="w-5 h-5 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white truncate">{info.name}</p>
        <p className="text-xs text-white/70">{info.size}</p>
      </div>
    </div>
  );
}

function FixResultCard({ data }: { data: FixData }) {
  const reductionPct =
    data.originalRejections > 0
      ? Math.round(((data.originalRejections - data.newRejections) / data.originalRejections) * 100)
      : 0;

  return (
    <div className="my-3 space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-emerald-500">{data.fixedCount}</p>
          <p className="text-xs text-gray-500">Claims Fixed</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-red-400 line-through">{data.originalRejections}</p>
          <p className="text-xs text-gray-500">Was Rejected</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-emerald-500">{data.newRejections}</p>
          <p className="text-xs text-gray-500">Now Rejected</p>
        </div>
      </div>

      {reductionPct > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
          <p className="text-emerald-700 font-semibold text-sm">
            Rejection rate dropped by {reductionPct}%
          </p>
        </div>
      )}

      {data.changes.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-gray-700">Changes Made</p>
          {data.changes.slice(0, 5).map((c, i) => (
            <div key={i} className="flex items-center gap-2 text-sm bg-white border border-gray-100 rounded-lg px-3 py-2">
              <RefreshCw className="w-3.5 h-3.5 text-[#3DA9D1]" />
              <span className="text-gray-500">{c.field}:</span>
              <span className="text-red-400 line-through">{c.before}</span>
              <ArrowRight className="w-3 h-3 text-gray-400" />
              <span className="text-emerald-600">{c.after}</span>
              <span className="text-xs text-gray-400 ml-auto">x{c.count}</span>
            </div>
          ))}
        </div>
      )}

      {data.fixedCSV && (
        <button
          onClick={() => {
            const blob = new Blob([data.fixedCSV!], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = data.suggestedFileName ?? 'claims_FIXED.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}
          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm px-6 py-3 rounded-xl transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          Download Fixed File ({data.suggestedFileName})
        </button>
      )}

      <p className="text-xs text-gray-400">Download the fixed file and re-upload to verify the improvements.</p>
    </div>
  );
}

function FilteredClaimsCard({ data }: { data: FilteredData }) {
  const claims = data.claims ?? [];
  return (
    <div className="my-3">
      <p className="text-sm font-semibold text-gray-700 mb-2">
        {data.filterType === 'rejected' ? 'Rejected Claims' : 'Filtered Claims'} ({data.count})
      </p>
      <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
        {claims.map((claim: any, i: number) => (
          <div key={i} className="bg-white border border-red-100 rounded-lg px-3 py-2 text-sm">
            <div className="flex items-center gap-2">
              <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
              <span className="text-gray-700 font-medium">Row {claim.row ?? i + 1}</span>
              {claim.reason && <span className="text-gray-400">- {claim.reason}</span>}
            </div>
            {claim.details && <p className="text-xs text-gray-400 mt-1 ml-6">{claim.details}</p>}
          </div>
        ))}
        <p className="text-xs text-gray-400 text-center py-2">
          {claims.length} rejected claim{claims.length !== 1 ? 's' : ''} shown
        </p>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Markdown renderer
   ────────────────────────────────────────────── */

function renderMarkdown(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="bg-gray-200 px-1.5 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
    }
    return <span key={i}>{part}</span>;
  });
}

/* ──────────────────────────────────────────────
   Main Page Component
   ────────────────────────────────────────────── */

// ─── Session types ───
interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  messageCount: number;
  lastMessage?: string;
}

const SESSIONS_KEY = 'claims-chat-sessions';
const ACTIVE_SESSION_KEY = 'claims-chat-active-session';

function loadSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveSessions(sessions: ChatSession[]) {
  try { localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions)); } catch {}
}

function getSessionStorageKey(sessionId: string) {
  return `claims-chat-msgs-${sessionId}`;
}

export default function ClaimsChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<AnalysisData | null>(null);
  const [lastFileRef, setLastFileRef] = useState<File | null>(null);
  const [showSessions, setShowSessions] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const didLoadRef = useRef(false);

  // Load sessions and active session on mount
  useEffect(() => {
    if (didLoadRef.current) return;
    didLoadRef.current = true;
    const allSessions = loadSessions();
    setSessions(allSessions);

    // Load active session or create new one
    let activeId = '';
    try { activeId = localStorage.getItem(ACTIVE_SESSION_KEY) || ''; } catch {}

    if (activeId && allSessions.find(s => s.id === activeId)) {
      // Load existing session
      setActiveSessionId(activeId);
      try {
        const saved = localStorage.getItem(getSessionStorageKey(activeId));
        if (saved) {
          const parsed: ChatMessage[] = JSON.parse(saved).map((m: any) => ({
            ...m, timestamp: new Date(m.timestamp),
          }));
          if (parsed.length > 0) setMessages(parsed);
        }
      } catch {}
    } else {
      // Create first session
      const newId = uid();
      setActiveSessionId(newId);
      try { localStorage.setItem(ACTIVE_SESSION_KEY, newId); } catch {}
    }
  }, []);

  // Save messages to current session on every change
  useEffect(() => {
    if (!didLoadRef.current || !activeSessionId) return;
    try {
      const serializable = messages
        .filter((m) => m.type !== 'typing')
        .map((m) => {
          const cleaned = { ...m };
          if (m.type === 'file' && m.data && (m.data as FileInfo).file) {
            cleaned.data = { name: (m.data as FileInfo).name, size: (m.data as FileInfo).size, type: (m.data as FileInfo).type };
          }
          return cleaned;
        });
      localStorage.setItem(getSessionStorageKey(activeSessionId), JSON.stringify(serializable));

      // Update session metadata
      if (messages.length > 0) {
        const allSessions = loadSessions();
        const existing = allSessions.find(s => s.id === activeSessionId);
        const firstUserMsg = messages.find(m => m.role === 'user');
        const lastMsg = [...messages].reverse().find(m => m.type !== 'typing');
        const title = firstUserMsg?.type === 'file'
          ? `📄 ${(firstUserMsg.data as FileInfo)?.name || 'File upload'}`
          : firstUserMsg?.content?.slice(0, 40) || 'New chat';

        if (existing) {
          existing.title = title;
          existing.messageCount = messages.length;
          existing.lastMessage = lastMsg?.content?.slice(0, 60) || '';
        } else {
          allSessions.unshift({
            id: activeSessionId,
            title,
            createdAt: new Date().toISOString(),
            messageCount: messages.length,
            lastMessage: lastMsg?.content?.slice(0, 60) || '',
          });
        }
        saveSessions(allSessions);
        setSessions(allSessions);
      }
    } catch {}
  }, [messages, activeSessionId]);

  // Switch to a different session
  const switchSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
    try { localStorage.setItem(ACTIVE_SESSION_KEY, sessionId); } catch {}
    setLastAnalysis(null);
    setLastFileRef(null);
    setAttachedFile(null);
    setInput('');
    try {
      const saved = localStorage.getItem(getSessionStorageKey(sessionId));
      if (saved) {
        setMessages(JSON.parse(saved).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      } else {
        setMessages([]);
      }
    } catch { setMessages([]); }
    setShowSessions(false);
  }, []);

  // Delete a session
  const deleteSession = useCallback((sessionId: string) => {
    const updated = loadSessions().filter(s => s.id !== sessionId);
    saveSessions(updated);
    setSessions(updated);
    try { localStorage.removeItem(getSessionStorageKey(sessionId)); } catch {}
    if (sessionId === activeSessionId) {
      // Switch to most recent or create new
      if (updated.length > 0) {
        switchSession(updated[0].id);
      } else {
        const newId = uid();
        setActiveSessionId(newId);
        setMessages([]);
        try { localStorage.setItem(ACTIVE_SESSION_KEY, newId); } catch {}
      }
    }
  }, [activeSessionId, switchSession]);

  // Create new chat session
  const handleNewChat = useCallback(() => {
    const newId = uid();
    setActiveSessionId(newId);
    setMessages([]);
    setLastAnalysis(null);
    setLastFileRef(null);
    setAttachedFile(null);
    setInput('');
    try { localStorage.setItem(ACTIVE_SESSION_KEY, newId); } catch {}
    setShowSessions(false);
  }, []);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  /* ── Message management ── */

  const addMessage = useCallback((role: 'user' | 'ai', content: string, type: MessageType = 'text', data?: any): string => {
    const id = uid();
    const msg: ChatMessage = { id, role, content, type, data, timestamp: new Date() };
    setMessages((prev) => [...prev, msg]);
    return id;
  }, []);

  const removeMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  /* ── Core actions ── */

  const processFile = useCallback(async (file: File) => {
    if (!isAcceptedFile(file)) {
      addMessage('ai', 'I can only analyze CSV, TSV, TXT, or XLSX files. Please upload a supported claims file.', 'error');
      return;
    }

    setLastFileRef(file);
    const info: FileInfo = { file, name: file.name, size: formatBytes(file.size), type: file.type };
    addMessage('user', `Uploaded ${file.name}`, 'file', info);

    setIsLoading(true);
    const typingId = addMessage('ai', '', 'typing');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/claims/validate', { method: 'POST', body: formData });
      const json = await res.json();

      removeMessage(typingId);

      if (!res.ok) {
        addMessage('ai', json?.error ?? 'Something went wrong analyzing the file. Please try again.', 'error');
        setIsLoading(false);
        return;
      }

      const analysis = buildAnalysisSummary(json);
      setLastAnalysis(analysis);
      addMessage('ai', analysis.summary, 'analysis', analysis);

      // Fire-and-forget: save to server history
      fetch('/api/claims/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ practiceId: 'default', fileName: file.name, result: json, schemeCode: '' }),
      }).catch(() => {});
    } catch (err: any) {
      removeMessage(typingId);
      addMessage('ai', `Failed to analyze file: ${err?.message ?? 'Network error'}. Please check your connection and try again.`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addMessage, removeMessage]);

  const handleFixFile = useCallback(async () => {
    if (!lastFileRef) {
      addMessage('ai', 'No file to fix. Please upload a claims file first.', 'error');
      return;
    }

    addMessage('user', 'Fix the rejections');
    setIsLoading(true);
    const typingId = addMessage('ai', '', 'typing');

    try {
      // Step 1: Fix the file
      const formData = new FormData();
      formData.append('file', lastFileRef);
      formData.append('applyMedium', 'true');

      const fixRes = await fetch('/api/claims/fix', { method: 'POST', body: formData });
      const fixJson = await fixRes.json();

      if (!fixRes.ok) {
        removeMessage(typingId);
        addMessage('ai', fixJson?.error ?? 'Could not fix the file.', 'error');
        setIsLoading(false);
        return;
      }

      // Step 2: Re-analyze the fixed CSV to get fresh results
      let reanalysis = null;
      if (fixJson.fixedCSV) {
        const fixedBlob = new Blob([fixJson.fixedCSV], { type: 'text/csv' });
        const fixedFile = new File([fixedBlob], fixJson.suggestedFileName || 'claims_FIXED.csv', { type: 'text/csv' });
        const reForm = new FormData();
        reForm.append('file', fixedFile);
        const reRes = await fetch('/api/claims/validate', { method: 'POST', body: reForm });
        if (reRes.ok) {
          reanalysis = await reRes.json();
          // Update the analysis state so subsequent actions use the fixed data
          const newAnalysis = buildAnalysisSummary(reanalysis);
          setLastAnalysis(newAnalysis);
          // Store fixed file as the new reference
          setLastFileRef(fixedFile);
        }
      }

      removeMessage(typingId);

      const fix = buildFixSummary(fixJson);
      const stats = fixJson.stats || {};
      const beforeRate = stats.before?.rejectionRate ?? 0;
      const afterRate = stats.after?.rejectionRate ?? 0;

      let summary = '';
      if (fix.fixedCount > 0) {
        summary = `I fixed **${fix.fixedCount} issues** and re-analyzed your file:\n\n`;
        summary += `**Before:** ${stats.before?.errors ?? '?'} rejected (${beforeRate}% rejection rate)\n`;
        summary += `**After:** ${stats.after?.errors ?? '?'} rejected (${afterRate}% rejection rate)\n\n`;
        if (reanalysis) {
          summary += `The fixed file has **${reanalysis.validClaims} valid claims** out of ${reanalysis.totalClaims}.`;
          if (reanalysis.invalidClaims > 0) {
            summary += ` ${reanalysis.invalidClaims} claims still need manual review (duplicates, gender mismatches, etc.).`;
          }
        }
      } else {
        summary = 'I reviewed your file but found no auto-fixable issues. The remaining errors (duplicates, gender mismatches, missing codes) require manual correction.';
      }

      addMessage('ai', summary, 'fix', fix);

      // Fire-and-forget: log learning event for ML reinforcement
      fetch('/api/ml/reinforce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'claims_fix', data: { corrections: fix.fixedCount, beforeRate, afterRate } }),
      }).catch(() => {});
    } catch (err: any) {
      removeMessage(typingId);
      addMessage('ai', `Fix failed: ${err?.message ?? 'Network error'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [lastFileRef, addMessage, removeMessage, buildAnalysisSummary]);

  const handleShowRejected = useCallback(() => {
    if (!lastAnalysis?.rawResponse) {
      addMessage('ai', 'No analysis data available. Please upload and analyze a file first.', 'error');
      return;
    }

    addMessage('user', 'Show rejected claims');

    const raw = lastAnalysis.rawResponse;
    // lineResults[].status === 'error' are the rejected ones
    const rejectedLines = (raw?.lineResults ?? []).filter((lr: any) => lr.status === 'error');
    const claims = rejectedLines.map((lr: any) => ({
      row: lr.lineNumber,
      reason: (lr.issues ?? []).filter((i: any) => i.severity === 'error').map((i: any) => i.rule).join(', '),
      details: (lr.issues ?? []).filter((i: any) => i.severity === 'error').map((i: any) => i.message).join(' | '),
      code: lr.claimData?.primaryICD10 || '(empty)',
      patient: lr.claimData?.patientName || '?',
    }));

    const filtered: FilteredData = {
      claims,
      filterType: 'rejected',
      count: claims.length,
    };

    addMessage(
      'ai',
      `Found **${claims.length} rejected claims** out of ${lastAnalysis.totalClaims} total:`,
      'filtered',
      filtered
    );
  }, [lastAnalysis, addMessage]);

  const handleDownloadReport = useCallback(async () => {
    if (!lastAnalysis?.rawResponse) {
      addMessage('ai', 'No analysis results available. Please upload and analyze a file first.', 'error');
      return;
    }

    addMessage('user', 'Download PDF report');
    setIsLoading(true);
    const typingId = addMessage('ai', '', 'typing');

    try {
      const res = await fetch('/api/claims/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result: lastAnalysis.rawResponse }),
      });

      removeMessage(typingId);

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        addMessage('ai', json?.error ?? 'Could not generate the report. Please try again.', 'error');
        setIsLoading(false);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `claims-report-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addMessage('ai', 'Your PDF report has been downloaded. Check your downloads folder.', 'text');
    } catch (err: any) {
      removeMessage(typingId);
      addMessage('ai', `Report generation failed: ${err?.message ?? 'Network error'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [lastAnalysis, addMessage, removeMessage]);

  const handleViewDetails = useCallback(() => {
    if (!lastAnalysis?.rawResponse) {
      addMessage('ai', 'No analysis data to show. Please upload a file first.', 'error');
      return;
    }
    addMessage('user', 'View all details');
    const raw = lastAnalysis.rawResponse;
    const lines = raw.lineResults ?? [];

    let detail = `**Full Analysis — ${lastAnalysis.totalClaims} Claims**\n\n`;
    detail += `| # | Status | ICD-10 | Patient | Issues |\n`;
    detail += `|---|--------|--------|---------|--------|\n`;
    for (const lr of lines) {
      const status = lr.status === 'valid' ? '✅' : lr.status === 'error' ? '❌' : '⚠️';
      const code = lr.claimData?.primaryICD10 || '—';
      const name = (lr.claimData?.patientName || '?').slice(0, 18);
      const issues = (lr.issues ?? [])
        .filter((i: any) => i.severity === 'error' || i.severity === 'warning')
        .map((i: any) => i.rule)
        .join(', ') || 'Clean';
      detail += `| ${lr.lineNumber} | ${status} | ${code} | ${name} | ${issues} |\n`;
    }

    detail += `\n**Summary:** ${lastAnalysis.validClaims} valid, ${lastAnalysis.rejectedClaims} rejected, ${lastAnalysis.warningClaims} warnings`;
    detail += `\n**Estimated savings if fixed:** ${lastAnalysis.estimatedSavings}`;

    addMessage('ai', detail, 'text');
  }, [lastAnalysis, addMessage]);

  const handleDownloadCSV = useCallback(async () => {
    if (!lastFileRef) {
      addMessage('ai', 'No file available. Upload a claims file first.', 'error');
      return;
    }
    addMessage('user', 'Download fixed CSV');
    setIsLoading(true);
    const typingId = addMessage('ai', '', 'typing');
    try {
      const formData = new FormData();
      formData.append('file', lastFileRef);
      formData.append('applyMedium', 'true');
      const res = await fetch('/api/claims/fix', { method: 'POST', body: formData });
      const json = await res.json();
      removeMessage(typingId);
      if (!res.ok || !json.fixedCSV) {
        addMessage('ai', 'Could not generate CSV. Try "Fix Rejections" first.', 'error');
        return;
      }
      // Trigger download
      const blob = new Blob([json.fixedCSV], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = json.suggestedFileName || 'claims_FIXED.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addMessage('ai', `Downloaded **${json.suggestedFileName}** with ${json.stats?.totalCorrections ?? 0} corrections applied. Re-upload to verify.`, 'text');
    } catch (err: any) {
      removeMessage(typingId);
      addMessage('ai', `CSV download failed: ${err?.message ?? 'Network error'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [lastFileRef, addMessage, removeMessage]);

  const handleViewRawJSON = useCallback(() => {
    if (!lastAnalysis?.rawResponse) {
      addMessage('ai', 'No analysis data. Upload a file first.', 'error');
      return;
    }
    addMessage('user', 'Show raw JSON');
    // Full JSON — no truncation
    const full = JSON.stringify(lastAnalysis.rawResponse, null, 2);
    addMessage('ai', '```json\n' + full + '\n```', 'text');
  }, [lastAnalysis, addMessage]);

  const handleAction = useCallback((actionId: string) => {
    switch (actionId) {
      case 'fix': handleFixFile(); break;
      case 'rejected': handleShowRejected(); break;
      case 'csv': handleDownloadCSV(); break;
      case 'report': handleDownloadReport(); break;
      case 'details': handleViewDetails(); break;
      case 'raw': handleViewRawJSON(); break;
    }
  }, [handleFixFile, handleShowRejected, handleDownloadCSV, handleDownloadReport, handleViewDetails, handleViewRawJSON]);

  /* ── File handling ── */

  const handleFileSelected = useCallback((file: File) => {
    if (!isAcceptedFile(file)) {
      addMessage('ai', 'I can only analyze CSV, TSV, TXT, or XLSX files. Please upload a supported claims file.', 'error');
      return;
    }
    // Auto-process immediately — don't make user press Send
    processFile(file);
  }, [addMessage, processFile]);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        if (messages.length === 0) {
          processFile(file);
        } else {
          handleFileSelected(file);
        }
      }
    },
    [messages.length, handleFileSelected, processFile]
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (messages.length === 0) {
          processFile(file);
        } else {
          handleFileSelected(file);
        }
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [messages.length, handleFileSelected, processFile]
  );

  /* ── Submit handler ── */

  const handleTextSubmit = useCallback(async () => {
    const text = input.trim();

    if (attachedFile) {
      processFile(attachedFile);
      setAttachedFile(null);
      setInput('');
      return;
    }

    if (!text) return;
    setInput('');

    const lower = text.toLowerCase();
    // Fix commands
    if (lower.includes('fix') && (lower.includes('file') || lower.includes('claim') || lower.includes('reject') || lower.includes('issue') || lower.includes('error'))) {
      handleFixFile();
      return;
    }
    // Show rejected
    if (lower.includes('reject') && (lower.includes('show') || lower.includes('list') || lower.includes('which'))) {
      handleShowRejected();
      return;
    }
    // CSV download
    if ((lower.includes('csv') || lower.includes('fixed file') || lower.includes('clean file')) && (lower.includes('download') || lower.includes('give') || lower.includes('send') || lower.includes('get'))) {
      handleDownloadCSV();
      return;
    }
    // PDF download
    if (lower.includes('pdf') || (lower.includes('report') && lower.includes('download'))) {
      handleDownloadReport();
      return;
    }
    // JSON
    if (lower.includes('json') || lower.includes('raw')) {
      handleViewRawJSON();
      return;
    }
    // Table / details
    if (lower.includes('table') || lower.includes('detail') || lower.includes('all claim')) {
      handleViewDetails();
      return;
    }

    addMessage('user', text);

    // Build context from last analysis for the AI
    const analysisContext = lastAnalysis ? {
      totalClaims: lastAnalysis.totalClaims,
      validClaims: lastAnalysis.validClaims,
      rejectedClaims: lastAnalysis.rejectedClaims,
      warningClaims: lastAnalysis.warningClaims,
      rejectionRate: lastAnalysis.rawResponse?.summary?.estimatedRejectionRate,
      topIssues: lastAnalysis.topIssues,
      rejectedLines: (lastAnalysis.rawResponse?.lineResults ?? [])
        .filter((lr: any) => lr.status === 'error')
        .slice(0, 10)
        .map((lr: any) => ({
          line: lr.lineNumber,
          code: lr.claimData?.primaryICD10 || '(empty)',
          patient: lr.claimData?.patientName || '?',
          reasons: lr.issues?.filter((i: any) => i.severity === 'error').map((i: any) => i.rule).join(', '),
        })),
    } : undefined;

    setIsLoading(true);
    const typingId = addMessage('ai', '', 'typing');

    try {
      const res = await fetch('/api/claims/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, analysisContext }),
      });
      const json = await res.json();

      removeMessage(typingId);

      const answer = json?.response ?? json?.error ?? "I couldn't process that. Try asking about specific claims or rejection reasons.";
      addMessage('ai', answer, 'text');
    } catch (_err) {
      removeMessage(typingId);
      addMessage(
        'ai',
        'I had trouble processing that question. You can try:\n- "Show rejected claims"\n- "Fix my file"\n- "Download PDF report"',
        'text'
      );
    } finally {
      setIsLoading(false);
    }
  }, [input, attachedFile, lastFileRef, processFile, handleFixFile, handleShowRejected, handleDownloadReport, handleViewDetails, addMessage, removeMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    }
  }, [handleTextSubmit]);

  /* ── Render message ── */

  function renderMessage(msg: ChatMessage) {
    if (msg.type === 'typing') return <TypingIndicator key={msg.id} />;

    const isUser = msg.role === 'user';

    return (
      <motion.div
        key={msg.id}
        initial={{ opacity: 0, y: 15, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`flex items-start gap-3 px-4 py-2 ${isUser ? 'flex-row-reverse' : ''}`}
      >
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isUser ? 'bg-[#3DA9D1]' : msg.type === 'error' ? 'bg-red-500' : 'bg-[#3DA9D1]'
          }`}
        >
          {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
        </div>

        {/* Bubble */}
        <div
          className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-[#3DA9D1] text-white rounded-tr-sm'
              : msg.type === 'error'
              ? 'bg-red-50 border border-red-200 text-red-700 rounded-tl-sm'
              : 'bg-gray-100 text-gray-700 rounded-tl-sm'
          }`}
        >
          {/* File attachment for user messages */}
          {msg.type === 'file' && msg.data && <FileAttachmentBubble info={msg.data as FileInfo} />}

          {/* Text content */}
          {msg.content && (
            <div className={`text-sm leading-relaxed ${msg.type === 'file' ? 'mt-2' : ''}`}>
              {msg.content.includes('```') ? (
                <pre className="whitespace-pre-wrap text-xs bg-gray-800 text-green-300 rounded-lg p-3 overflow-x-auto my-2">
                  {msg.content.replace(/```json\n?/g, '').replace(/```/g, '')}
                </pre>
              ) : (
                msg.content.split('\n').map((line, i) => (
                  <p key={i} className={i > 0 ? 'mt-1' : ''}>
                    {renderMarkdown(line)}
                  </p>
                ))
              )}
            </div>
          )}

          {/* Analysis data */}
          {msg.type === 'analysis' && msg.data && (
            <>
              <StatCards data={msg.data as AnalysisData} />
              {(msg.data as AnalysisData).selfDiagnosis && (
                <DiagnosisBanner diagnosis={(msg.data as AnalysisData).selfDiagnosis!} />
              )}
              {(msg.data as AnalysisData).batchInsights && (
                <BatchInsightsBlock insights={(msg.data as AnalysisData).batchInsights!} />
              )}
              <IssueList issues={(msg.data as AnalysisData).topIssues} />
              <ActionPillsRow onAction={handleAction} />
            </>
          )}

          {/* Fix result */}
          {msg.type === 'fix' && msg.data && <FixResultCard data={msg.data as FixData} />}

          {/* Filtered claims */}
          {msg.type === 'filtered' && msg.data && <FilteredClaimsCard data={msg.data as FilteredData} />}

          {/* Timestamp */}
          <p className={`text-[10px] mt-2 ${isUser ? 'text-white/50' : 'text-gray-400'}`}>
            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </motion.div>
    );
  }

  /* ── Render ── */

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1D3443] text-white px-6 py-4 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <MessageSquare className="w-6 h-6 text-[#3DA9D1]" />
          <h1 className="text-xl font-bold">Claims AI</h1>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setShowSessions(!showSessions)}
              className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              <History className="w-3.5 h-3.5" />
              Sessions {sessions.length > 0 && <span className="text-[10px] bg-[#3DA9D1]/30 text-[#3DA9D1] px-1.5 rounded-full">{sessions.length}</span>}
            </button>
            <button
              onClick={handleNewChat}
              className="flex items-center gap-1.5 text-sm text-white bg-[#3DA9D1] hover:bg-[#2E8AB0] px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Chat
            </button>
          </div>
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1 -mb-1">
          {NAV_TABS.map((tab) => (
            <Link
              key={tab.label}
              href={tab.href}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors ${
                tab.active
                  ? 'bg-gray-50 text-[#1D3443]'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Sessions panel */}
      <AnimatePresence>
        {showSessions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-gray-200 bg-gray-50"
          >
            <div className="p-4 max-h-64 overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-700">Recent Sessions</p>
                <button onClick={() => setShowSessions(false)} className="text-gray-400 hover:text-gray-600">
                  <ChevronLeft className="w-4 h-4 rotate-90" />
                </button>
              </div>
              {sessions.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No previous sessions</p>
              ) : (
                <div className="space-y-1">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors group ${
                        session.id === activeSessionId
                          ? 'bg-[#3DA9D1]/10 border border-[#3DA9D1]/20'
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => switchSession(session.id)}
                    >
                      <MessageSquare className={`w-4 h-4 shrink-0 ${session.id === activeSessionId ? 'text-[#3DA9D1]' : 'text-gray-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${session.id === activeSessionId ? 'text-[#3DA9D1]' : 'text-gray-700'}`}>
                          {session.title}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate">
                          {session.messageCount} messages · {new Date(session.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                        title="Delete session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto relative"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Drag overlay */}
        <AnimatePresence>
          {isDragOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-[#3DA9D1]/10 border-2 border-dashed border-[#3DA9D1] rounded-xl m-4 flex items-center justify-center backdrop-blur-sm"
            >
              <div className="text-center">
                <Upload className="w-12 h-12 text-[#3DA9D1] mx-auto mb-3" />
                <p className="text-lg font-semibold text-[#3DA9D1]">Drop your claims file here</p>
                <p className="text-sm text-gray-500 mt-1">CSV, TSV, TXT, or XLSX</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {isEmpty && !isDragOver && (
          <div className="flex items-center justify-center h-full min-h-[400px] px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-md"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#3DA9D1] to-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">AI Claims Analyzer</h2>
              <p className="text-gray-500 mb-6">
                Drop your claims file here or click to upload. I will analyze it instantly and help you fix any issues.
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#3DA9D1] hover:bg-[#2E8AB0] text-white font-medium px-8 py-3 rounded-xl transition-colors shadow-md inline-flex items-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Upload Claims File
              </button>
              <p className="text-xs text-gray-400 mt-4">Supports CSV, TSV, TXT, XLSX</p>
            </motion.div>
          </div>
        )}

        {/* Messages */}
        {!isEmpty && (
          <div className="py-4 space-y-1">
            <AnimatePresence mode="popLayout">
              {messages.map(renderMessage)}
            </AnimatePresence>
          </div>
        )}

        {/* Scroll anchor */}
        <div className="h-4" />
      </div>

      {/* Input bar — pr-24 to avoid Jess On widget overlap, mb-12 for Intercom bubble */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white px-4 py-3 pr-24 mb-0">
        {/* Attached file preview */}
        <AnimatePresence>
          {attachedFile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-2"
            >
              <div className="inline-flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 text-sm">
                <FileText className="w-4 h-4 text-[#3DA9D1]" />
                <span className="text-gray-700 truncate max-w-[200px]">{attachedFile.name}</span>
                <span className="text-gray-400 text-xs">{formatBytes(attachedFile.size)}</span>
                <button onClick={() => setAttachedFile(null)} className="text-gray-400 hover:text-red-500 ml-1">
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2">
          {/* File input (hidden) */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.tsv,.txt,.xlsx,.xls"
            className="hidden"
            onChange={handleFileInputChange}
          />

          {/* Attach button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl text-gray-400 hover:text-[#3DA9D1] hover:bg-gray-100 transition-colors"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Text input */}
          <input
            ref={textInputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isEmpty ? 'Upload a file to get started...' : 'Ask about your claims or type a command...'}
            disabled={isLoading}
            className="flex-1 bg-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#3DA9D1]/30 transition-all disabled:opacity-50"
          />

          {/* Send button */}
          <button
            onClick={handleTextSubmit}
            disabled={isLoading && !attachedFile && !input.trim()}
            className="p-2.5 rounded-xl bg-[#3DA9D1] hover:bg-[#2E8AB0] text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        <p className="text-[10px] text-gray-400 text-center mt-2">
          Claims Analyzer uses AI validation to check your medical claims. Always verify results before submission.
        </p>
      </div>
    </div>
  );
}
