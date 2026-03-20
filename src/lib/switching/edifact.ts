// EDIFACT MEDCLM Engine — PHISC Specification v0:912:ZA
// Full parser and generator for SA medical aid claims EDIFACT messages
// Reference: PHISC MEDCLM version 0-912-13.4 (November 2016)

import type {
  EDIFACTMessage,
  EDIFACTParty,
  EDIFACTLineItem,
} from "./types";
import type { ClaimSubmission } from "../healthbridge/types";

const SEG_TERM = "'";
const DATA_SEP = "+";
const COMP_SEP = ":";
const RELEASE = "?";
const MSG_TYPE = "MEDCLM:0:912:ZA";

// ─── EDIFACT Generator ─────────────────────────────────────────────────────

export function generateEDIFACT(claim: ClaimSubmission, options?: {
  batchNumber?: string;
  correctionType?: "ADJ" | "ADD" | "REV" | "RSV";
  messageRef?: number;
}): string {
  const segments: string[] = [];
  const now = new Date();
  const msgRef = String(options?.messageRef ?? 1).padStart(7, "0");
  const batchNum = (options?.batchNumber ?? String(Date.now())).padStart(18, "0");

  segments.push(`UNH${DATA_SEP}${msgRef}${DATA_SEP}${MSG_TYPE}`);

  const dateStr = fmtDate102(now);
  segments.push(
    `BGM${DATA_SEP}${DATA_SEP}${DATA_SEP}` +
    `97${COMP_SEP}${dateStr}${COMP_SEP}102` +
    `${DATA_SEP}${DATA_SEP}` +
    `BAT${COMP_SEP}${batchNum}`
  );

  if (options?.correctionType) {
    segments.push(`DCR${DATA_SEP}${options.correctionType}`);
  }

  segments.push(`DTM${DATA_SEP}194${COMP_SEP}${fmtDate102(new Date(claim.dateOfService))}${COMP_SEP}102`);
  segments.push(`DTM${DATA_SEP}155${COMP_SEP}${fmtDate102(new Date(claim.dateOfService))}${COMP_SEP}102`);

  segments.push(`NAD${DATA_SEP}SUP${DATA_SEP}${esc(claim.bhfNumber)}`);
  segments.push(
    `NAD${DATA_SEP}TDN${DATA_SEP}${esc(claim.providerNumber)}` +
    `${DATA_SEP}${DATA_SEP}${DATA_SEP}${esc(claim.treatingProvider)}`
  );
  segments.push(`NAD${DATA_SEP}REG${DATA_SEP}${esc(claim.providerNumber)}`);

  if (claim.referringProvider && claim.referringBhf) {
    segments.push(
      `NAD${DATA_SEP}RDP${DATA_SEP}${esc(claim.referringBhf)}` +
      `${DATA_SEP}${DATA_SEP}${DATA_SEP}${esc(claim.referringProvider)}`
    );
  }

  segments.push(`NAD${DATA_SEP}SCH${DATA_SEP}${DATA_SEP}${DATA_SEP}${DATA_SEP}${esc(claim.medicalAidScheme)}`);
  segments.push(`NAD${DATA_SEP}MPN${DATA_SEP}${esc(claim.membershipNumber)}`);
  segments.push(
    `NAD${DATA_SEP}MSN${DATA_SEP}${esc(claim.dependentCode)}` +
    `${DATA_SEP}${DATA_SEP}${DATA_SEP}${esc(claim.patientName)}`
  );

  segments.push(`RFF${DATA_SEP}AHI${COMP_SEP}${esc(claim.patientIdNumber)}`);
  segments.push(`DTM${DATA_SEP}329${COMP_SEP}${fmtDate102(new Date(claim.patientDob))}${COMP_SEP}102`);

  for (let i = 0; i < claim.lineItems.length; i++) {
    const item = claim.lineItems[i];
    const lineNum = i + 1;

    segments.push(`LIN${DATA_SEP}${lineNum}${DATA_SEP}${DATA_SEP}${esc(item.cptCode)}${COMP_SEP}SRV`);

    if (item.nappiCode) {
      segments.push(`LIN${DATA_SEP}${lineNum}${DATA_SEP}${DATA_SEP}${esc(item.nappiCode)}${COMP_SEP}NAP`);
    }

    segments.push(`RFF${DATA_SEP}ICD${COMP_SEP}${esc(item.icd10Code)}`);
    segments.push(`QTY${DATA_SEP}47${COMP_SEP}${item.quantity}`);

    const amtStr = fmtAmt(item.amount * item.quantity);
    segments.push(`MOA${DATA_SEP}203${COMP_SEP}${amtStr}`);

    const vatAmt = Math.round(item.amount * item.quantity * 0.15);
    segments.push(`TAX${DATA_SEP}7${DATA_SEP}VAT${DATA_SEP}${DATA_SEP}${DATA_SEP}${DATA_SEP}135${COMP_SEP}${fmtAmt(vatAmt)}`);

    if (item.modifiers?.length) {
      for (const mod of item.modifiers) {
        segments.push(`RFF${DATA_SEP}MOD${COMP_SEP}${esc(mod)}`);
      }
    }

    if (item.description) {
      segments.push(`FTX${DATA_SEP}AAA${DATA_SEP}${DATA_SEP}${DATA_SEP}${esc(item.description.slice(0, 70))}`);
    }
  }

  segments.push(`LOC${DATA_SEP}${esc(claim.placeOfService)}`);

  if (claim.authorizationNumber) {
    segments.push(`RFF${DATA_SEP}AUT${COMP_SEP}${esc(claim.authorizationNumber)}`);
  }

  const segmentCount = segments.length + 1;
  segments.push(`UNT${DATA_SEP}${segmentCount}${DATA_SEP}${msgRef}`);

  return segments.map(s => s + SEG_TERM).join("\n");
}

export function generateEDIFACTInterchange(
  messages: string[],
  sender: string,
  recipient: string,
): string {
  const now = new Date();
  const ref = String(Date.now()).slice(-14);
  const dateStr = fmtDate102(now).slice(2);
  const timeStr = now.toTimeString().slice(0, 5).replace(":", "");

  const unb = `UNB${DATA_SEP}UNOC${COMP_SEP}3${DATA_SEP}${esc(sender)}${COMP_SEP}ZZ${DATA_SEP}${esc(recipient)}${COMP_SEP}ZZ${DATA_SEP}${dateStr}${COMP_SEP}${timeStr}${DATA_SEP}${ref}${SEG_TERM}`;
  const unz = `UNZ${DATA_SEP}${messages.length}${DATA_SEP}${ref}${SEG_TERM}`;

  return unb + "\n" + messages.join("\n") + "\n" + unz;
}

// ─── EDIFACT Parser ─────────────────────────────────────────────────────────

export function parseEDIFACT(raw: string): EDIFACTMessage {
  const segments = splitSegments(raw);
  const message: EDIFACTMessage = {
    messageRef: "",
    messageType: MSG_TYPE,
    batchNumber: "",
    transactionDate: "",
    dates: [],
    parties: [],
    lineItems: [],
    raw,
  };

  let curItem: Partial<EDIFACTLineItem> | null = null;
  let lineNum = 0;

  for (const segment of segments) {
    const tag = segment.slice(0, 3);
    const data = segment.slice(4);

    switch (tag) {
      case "UNH": {
        message.messageRef = splitData(data)[0] || "";
        break;
      }
      case "BGM": {
        for (const part of splitData(data)) {
          if (part.startsWith("97" + COMP_SEP)) {
            message.transactionDate = splitComp(part)[1] || "";
          }
          if (part.startsWith("BAT" + COMP_SEP)) {
            message.batchNumber = splitComp(part)[1] || "";
          }
        }
        break;
      }
      case "DCR": {
        const type = splitData(data)[0];
        if (type === "ADJ" || type === "ADD" || type === "REV" || type === "RSV") {
          message.correctionType = type;
        }
        break;
      }
      case "DTM": {
        const parts = splitComp(splitData(data)[0] || "");
        if (parts.length >= 2) {
          message.dates.push({
            qualifier: parts[0],
            date: parts[1],
            format: (parts[2] || "102") as "102" | "203",
          });
        }
        break;
      }
      case "NAD": {
        const parts = splitData(data);
        const party: EDIFACTParty = { qualifier: parts[0] || "", identifier: parts[1] || "" };
        if (parts[4]) party.name = unesc(parts[4]);
        if (parts[3]) party.address = unesc(parts[3]);
        message.parties.push(party);
        break;
      }
      case "LIN": {
        const parts = splitData(data);
        const num = parseInt(parts[0] || "0", 10);
        const cc = splitComp(parts[2] || "");
        const code = cc[0] || "";
        const codeType = cc[1] || "SRV";

        if (num !== lineNum || !curItem) {
          if (curItem) message.lineItems.push(curItem as EDIFACTLineItem);
          lineNum = num;
          curItem = { lineNumber: num, tariffCode: "", icd10Codes: [], amount: 0, quantity: 1 };
        }
        if (codeType === "NAP") curItem.nappiCode = code;
        else curItem.tariffCode = code;
        break;
      }
      case "RFF": {
        const parts = splitComp(splitData(data)[0] || "");
        if (parts[0] === "ICD" && curItem) {
          curItem.icd10Codes = curItem.icd10Codes || [];
          curItem.icd10Codes.push(unesc(parts[1] || ""));
        }
        if (parts[0] === "MOD" && curItem) {
          curItem.modifiers = curItem.modifiers || [];
          curItem.modifiers.push(unesc(parts[1] || ""));
        }
        break;
      }
      case "QTY": {
        if (curItem) curItem.quantity = parseInt(splitComp(splitData(data)[0] || "")[1] || "1", 10);
        break;
      }
      case "MOA": {
        if (curItem) curItem.amount = parseAmt(splitComp(splitData(data)[0] || "")[1] || "0");
        break;
      }
      case "TAX": {
        if (curItem) {
          const parts = splitData(data);
          const comp = splitComp(parts[parts.length - 1] || "");
          if (comp[1]) curItem.vatAmount = parseAmt(comp[1]);
        }
        break;
      }
      case "FTX": {
        if (curItem) curItem.description = unesc(splitData(data)[3] || "");
        break;
      }
      case "UNT": {
        if (curItem) { message.lineItems.push(curItem as EDIFACTLineItem); curItem = null; }
        break;
      }
    }
  }

  if (curItem) message.lineItems.push(curItem as EDIFACTLineItem);
  return message;
}

export function parseEDIFACTResponse(raw: string): {
  transactionRef: string;
  status: "accepted" | "rejected" | "partial" | "pending";
  approvedAmount?: number;
  rejectionCode?: string;
  rejectionReason?: string;
  lineResponses: { lineNumber: number; status: "accepted" | "rejected"; approvedAmount?: number; rejectionCode?: string; rejectionReason?: string; }[];
} {
  const segments = splitSegments(raw);
  const result = {
    transactionRef: "",
    status: "pending" as "accepted" | "rejected" | "partial" | "pending",
    approvedAmount: undefined as number | undefined,
    rejectionCode: undefined as string | undefined,
    rejectionReason: undefined as string | undefined,
    lineResponses: [] as { lineNumber: number; status: "accepted" | "rejected"; approvedAmount?: number; rejectionCode?: string; rejectionReason?: string; }[],
  };

  let curLine = 0;
  let accCt = 0;
  let rejCt = 0;

  for (const segment of segments) {
    const tag = segment.slice(0, 3);
    const data = segment.slice(4);

    switch (tag) {
      case "RFF": {
        const p = splitComp(splitData(data)[0] || "");
        if (p[0] === "TRN") result.transactionRef = p[1] || "";
        break;
      }
      case "STS": {
        const parts = splitData(data);
        const sc = parts[0]?.toUpperCase();
        if (sc === "ACC" || sc === "ACCEPTED") {
          if (curLine > 0) { result.lineResponses.push({ lineNumber: curLine, status: "accepted" }); accCt++; }
        } else if (sc === "REJ" || sc === "REJECTED") {
          const rej = splitComp(parts[1] || "");
          if (curLine > 0) {
            result.lineResponses.push({ lineNumber: curLine, status: "rejected", rejectionCode: rej[0], rejectionReason: rej[1] });
            rejCt++;
          } else {
            result.rejectionCode = rej[0];
            result.rejectionReason = rej[1];
          }
        }
        break;
      }
      case "LIN": { curLine = parseInt(splitData(data)[0] || "0", 10); break; }
      case "MOA": {
        const p = splitComp(splitData(data)[0] || "");
        if (p[0] === "9" || p[0] === "203") {
          const amt = parseAmt(p[1] || "0");
          if (curLine > 0) {
            const last = result.lineResponses[result.lineResponses.length - 1];
            if (last?.lineNumber === curLine) last.approvedAmount = amt;
          } else result.approvedAmount = amt;
        }
        break;
      }
    }
  }

  if (rejCt === 0 && accCt > 0) result.status = "accepted";
  else if (accCt === 0 && rejCt > 0) result.status = "rejected";
  else if (accCt > 0 && rejCt > 0) result.status = "partial";

  return result;
}

// ─── Validation ─────────────────────────────────────────────────────────────

export function validateEDIFACTMessage(message: EDIFACTMessage): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!message.messageRef) errors.push("UNH: Message reference number is required");
  if (!message.batchNumber) errors.push("BGM: Batch number is required");
  else if (message.batchNumber.length !== 18) warnings.push(`BGM: Batch number should be 18 digits (got ${message.batchNumber.length})`);
  if (!message.transactionDate) errors.push("BGM: Transaction creation date is required");

  if (!message.parties.some(p => p.qualifier === "SUP")) errors.push("NAD+SUP: Supplier (practice) is required");
  if (!message.parties.some(p => p.qualifier === "MSN" || p.qualifier === "MPN")) errors.push("NAD+MSN/MPN: Member details are required");
  if (!message.parties.some(p => p.qualifier === "SCH")) errors.push("NAD+SCH: Scheme name is required");
  if (!message.parties.some(p => p.qualifier === "TDN")) errors.push("NAD+TDN: Treating doctor is required");

  if (message.lineItems.length === 0) errors.push("LIN: At least one line item is required");
  for (const item of message.lineItems) {
    if (!item.tariffCode && !item.nappiCode) errors.push(`LIN ${item.lineNumber}: Tariff or NAPPI code required`);
    if (item.icd10Codes.length === 0) errors.push(`LIN ${item.lineNumber}: ICD-10 code required (RFF+ICD)`);
    if (item.amount <= 0) warnings.push(`LIN ${item.lineNumber}: Amount is zero or negative`);
  }

  return { valid: errors.length === 0, errors, warnings };
}

// ─── Conversion ─────────────────────────────────────────────────────────────

export function claimToEDIFACT(claim: ClaimSubmission): EDIFACTMessage {
  return {
    messageRef: String(Date.now()).slice(-7),
    messageType: MSG_TYPE,
    batchNumber: String(Date.now()).padStart(18, "0"),
    transactionDate: new Date().toISOString().slice(0, 10).replace(/-/g, ""),
    dates: [{ qualifier: "194", date: claim.dateOfService.replace(/-/g, ""), format: "102" }],
    parties: [
      { qualifier: "SUP", identifier: claim.bhfNumber },
      { qualifier: "TDN", identifier: claim.providerNumber, name: claim.treatingProvider },
      { qualifier: "SCH", identifier: "", name: claim.medicalAidScheme },
      { qualifier: "MPN", identifier: claim.membershipNumber },
      { qualifier: "MSN", identifier: claim.dependentCode, name: claim.patientName },
    ],
    lineItems: claim.lineItems.map((item, i) => ({
      lineNumber: i + 1,
      tariffCode: item.cptCode,
      nappiCode: item.nappiCode,
      icd10Codes: [item.icd10Code],
      amount: item.amount * item.quantity,
      quantity: item.quantity,
      modifiers: item.modifiers,
      description: item.description,
    })),
  };
}

export function edifactToClaim(msg: EDIFACTMessage, practiceId: string): ClaimSubmission {
  const sup = msg.parties.find(p => p.qualifier === "SUP");
  const doc = msg.parties.find(p => p.qualifier === "TDN");
  const sch = msg.parties.find(p => p.qualifier === "SCH");
  const mem = msg.parties.find(p => p.qualifier === "MPN");
  const pat = msg.parties.find(p => p.qualifier === "MSN");
  const dos = msg.dates.find(d => d.qualifier === "194");

  return {
    bhfNumber: sup?.identifier || "",
    providerNumber: doc?.identifier || "",
    treatingProvider: doc?.name || "",
    patientName: pat?.name || "",
    patientDob: "",
    patientIdNumber: "",
    medicalAidScheme: sch?.name || sch?.identifier || "",
    membershipNumber: mem?.identifier || "",
    dependentCode: pat?.identifier || "00",
    dateOfService: dos ? ccyymmddToISO(dos.date) : "",
    placeOfService: "11",
    lineItems: msg.lineItems.map(item => ({
      icd10Code: item.icd10Codes[0] || "",
      cptCode: item.tariffCode,
      nappiCode: item.nappiCode,
      description: item.description || "",
      quantity: item.quantity,
      amount: item.quantity > 0 ? Math.round(item.amount / item.quantity) : item.amount,
      modifiers: item.modifiers,
    })),
    practiceId,
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmtDate102(d: Date): string {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

function ccyymmddToISO(s: string): string {
  return s.length < 8 ? "" : `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
}

function fmtAmt(cents: number): string {
  return cents < 0 ? `-${Math.abs(cents)}` : String(cents);
}

function parseAmt(str: string): number {
  return parseInt(str.replace(/\s/g, ""), 10) || 0;
}

function esc(str: string): string {
  return str.replace(/\?/g, "??").replace(/'/g, "?'").replace(/\+/g, "?+").replace(/:/g, "?:");
}

function unesc(str: string): string {
  return str.replace(/\?\?/g, "?").replace(/\?'/g, "'").replace(/\?\+/g, "+").replace(/\?:/g, ":");
}

function splitSegments(raw: string): string[] {
  const segs: string[] = [];
  let cur = "";
  let escaped = false;
  for (const ch of raw) {
    if (escaped) { cur += ch; escaped = false; continue; }
    if (ch === RELEASE) { escaped = true; cur += ch; continue; }
    if (ch === SEG_TERM) { if (cur.trim()) segs.push(cur.trim()); cur = ""; continue; }
    cur += ch;
  }
  if (cur.trim()) segs.push(cur.trim());
  return segs;
}

function splitData(d: string): string[] { return splitBy(d, DATA_SEP); }
function splitComp(d: string): string[] { return splitBy(d, COMP_SEP); }

function splitBy(str: string, sep: string): string[] {
  const parts: string[] = [];
  let cur = "";
  let escaped = false;
  for (const ch of str) {
    if (escaped) { cur += ch; escaped = false; continue; }
    if (ch === RELEASE) { escaped = true; continue; }
    if (ch === sep) { parts.push(cur); cur = ""; continue; }
    cur += ch;
  }
  parts.push(cur);
  return parts;
}
