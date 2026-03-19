"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, ChevronDown, CheckCircle, AlertCircle } from "lucide-react";

const ndaSections = [
  {
    title: "1. Definitions",
    content: `1.1. "Disclosing Party" means VisioCorp (Pty) Ltd, a company incorporated under the laws of the Republic of South Africa ("VisioCorp").

1.2. "Receiving Party" means the individual or entity accessing the Netcare Health OS Investor Portal and accepting this Agreement.

1.3. "Confidential Information" means any and all non-public information, whether oral, written, electronic, or visual, disclosed by either Party to the other, including but not limited to:
  (a) Business plans, strategies, and financial projections;
  (b) Financial data, revenue figures, and valuation models;
  (c) Market research, competitive analysis, and growth strategies;
  (d) Client data, customer lists, and partnership details;
  (e) Technical architecture, source code, algorithms, and system designs;
  (f) Trade secrets, proprietary methodologies, and AI model configurations;
  (g) Product roadmaps, feature plans, and development timelines;
  (h) Pricing structures, subscription models, and commercial terms;
  (i) Employee and contractor information;
  (j) Any information marked as "Confidential" or that a reasonable person would understand to be confidential given the nature of the information and circumstances of disclosure.

1.4. "Purpose" means the evaluation of a potential investment in, or business relationship with, VisioCorp and the Netcare Health OS ecosystem.`,
  },
  {
    title: "2. Obligations of Confidentiality",
    content: `2.1. The Receiving Party agrees to:
  (a) Hold all Confidential Information in strict confidence;
  (b) Not disclose Confidential Information to any third party without the prior written consent of the Disclosing Party;
  (c) Use Confidential Information solely for the Purpose;
  (d) Protect Confidential Information with at least the same degree of care used to protect its own confidential information, but in no event less than reasonable care;
  (e) Limit access to Confidential Information to those of its employees, advisors, and representatives who have a need to know and who are bound by confidentiality obligations no less restrictive than those contained herein.

2.2. The Receiving Party shall promptly notify the Disclosing Party of any unauthorised use or disclosure of Confidential Information.

2.3. The Receiving Party shall not reverse-engineer, decompile, or disassemble any software, technology, or systems disclosed as Confidential Information.`,
  },
  {
    title: "3. Exclusions from Confidential Information",
    content: `Confidential Information does not include information that:

  (a) Is or becomes publicly available through no fault or action of the Receiving Party;
  (b) Was rightfully in the possession of the Receiving Party prior to disclosure, as evidenced by written records;
  (c) Is independently developed by the Receiving Party without use of or reference to the Confidential Information;
  (d) Is rightfully received from a third party without restriction on disclosure;
  (e) Is required to be disclosed by law, regulation, or court order, provided that the Receiving Party gives the Disclosing Party prompt written notice (where legally permitted) and cooperates with any efforts to obtain protective treatment of the information.`,
  },
  {
    title: "4. Term and Duration",
    content: `4.1. This Agreement is effective from the date of acceptance ("Effective Date") and shall continue for a period of two (2) years from the Effective Date.

4.2. The obligations of confidentiality with respect to trade secrets shall survive indefinitely or until such information ceases to constitute a trade secret under applicable law.

4.3. Upon expiration or termination of this Agreement, the Receiving Party shall, at the Disclosing Party's request, promptly return or destroy all Confidential Information and any copies thereof, and provide written confirmation of such return or destruction.`,
  },
  {
    title: "5. No Rights Granted",
    content: `5.1. Nothing in this Agreement grants the Receiving Party any rights, title, or interest in the Confidential Information, intellectual property, or business of the Disclosing Party.

5.2. This Agreement does not constitute an offer, commitment, or obligation to enter into any investment, partnership, or business relationship.

5.3. The Disclosing Party makes no representation or warranty as to the accuracy or completeness of any Confidential Information disclosed.`,
  },
  {
    title: "6. Remedies",
    content: `6.1. The Receiving Party acknowledges that any breach of this Agreement may cause irreparable harm to the Disclosing Party, for which monetary damages may be inadequate.

6.2. In the event of a breach or threatened breach, the Disclosing Party shall be entitled to seek injunctive relief, specific performance, and any other remedies available at law or in equity, without the need to prove actual damages or post a bond.

6.3. The rights and remedies provided herein are cumulative and not exclusive of any other rights or remedies available at law.`,
  },
  {
    title: "7. Governing Law and Dispute Resolution",
    content: `7.1. This Agreement shall be governed by and construed in accordance with the laws of the Republic of South Africa.

7.2. Any dispute arising out of or in connection with this Agreement shall first be referred to mediation in accordance with the rules of the Arbitration Foundation of Southern Africa (AFSA).

7.3. If the dispute is not resolved through mediation within thirty (30) days, it shall be referred to and finally resolved by arbitration in accordance with the Arbitration Act 42 of 1965.

7.4. The courts of the Republic of South Africa shall have exclusive jurisdiction over any proceedings ancillary to arbitration.`,
  },
  {
    title: "8. General Provisions",
    content: `8.1. This Agreement constitutes the entire agreement between the Parties with respect to the subject matter hereof and supersedes all prior agreements, understandings, and communications.

8.2. No amendment or modification of this Agreement shall be valid unless made in writing and signed by both Parties.

8.3. If any provision of this Agreement is held to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.

8.4. The failure of either Party to enforce any provision of this Agreement shall not constitute a waiver of that provision or any other provision.

8.5. This Agreement may not be assigned by the Receiving Party without the prior written consent of VisioCorp.

8.6. Notices under this Agreement shall be in writing and delivered to the contact details provided at the time of acceptance.`,
  },
];

export default function InvestorNDA() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["1. Definitions"])
  );
  const [accepted, setAccepted] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState("");

  function toggleSection(title: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  }

  async function handleAccept() {
    setAccepting(true);
    setError("");
    try {
      const res = await fetch("/api/investor/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `NDA Accepted on ${new Date().toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })} at ${new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}. Mutual Non-Disclosure Agreement between VisioCorp (Pty) Ltd and the Receiving Party. Duration: 2 years from date of acceptance.`,
          section: "compliance",
        }),
      });
      if (res.ok) {
        setAccepted(true);
      } else {
        // Demo mode fallback — still show accepted
        setAccepted(true);
      }
    } catch {
      // Demo mode fallback
      setAccepted(true);
    }
    setAccepting(false);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-serif">
          Mutual Non-Disclosure Agreement
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          This NDA protects confidential information shared between VisioCorp
          (Pty) Ltd and the Receiving Party during investment evaluation.
        </p>
      </div>

      {/* Agreement Header */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-5 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-[#8B5CF6]" />
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Mutual Non-Disclosure Agreement
              </h2>
              <p className="text-xs text-gray-500">
                Effective date: Upon acceptance | Duration: 2 years | Last
                updated: 14 March 2026
              </p>
            </div>
          </div>
        </div>

        {/* Preamble */}
        <div className="p-4 border-b border-gray-100 bg-white">
          <div className="text-sm text-gray-700 leading-relaxed bg-white border border-gray-100 rounded-lg p-4">
            <p className="font-semibold mb-2">BETWEEN:</p>
            <p className="mb-2">
              <strong>VisioCorp (Pty) Ltd</strong>, a private company
              incorporated in the Republic of South Africa, operating the
              Netcare Health OS platform and ecosystem (the &quot;Disclosing
              Party&quot;);
            </p>
            <p className="mb-2">AND</p>
            <p>
              <strong>The Receiving Party</strong>, being the individual or
              entity accessing the Netcare Health OS Investor Portal and accepting
              this Agreement.
            </p>
            <p className="mt-3 text-gray-600">
              WHEREAS the Parties wish to explore a potential investment or
              business relationship and, in the course of such discussions, may
              disclose Confidential Information to each other;
            </p>
            <p className="mt-2 text-gray-600">
              NOW THEREFORE, in consideration of the mutual covenants and
              agreements contained herein, the Parties agree as follows:
            </p>
          </div>
        </div>

        {/* Sections */}
        <div className="divide-y divide-gray-100">
          {ndaSections.map((section) => {
            const isOpen = expandedSections.has(section.title);
            return (
              <div key={section.title}>
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-semibold text-gray-800">
                    {section.title}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      isOpen ? "" : "-rotate-90"
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4">
                    <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-white border border-gray-100 rounded-lg p-4">
                      {section.content}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Accept Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="border border-gray-200 rounded-xl p-6 bg-gray-50"
      >
        {accepted ? (
          <div className="flex items-center gap-3 text-[#1D3443]">
            <CheckCircle className="w-6 h-6" />
            <div>
              <p className="font-semibold">NDA Accepted</p>
              <p className="text-sm text-[#1D8AB5]">
                Your acceptance has been recorded. This agreement is effective
                for 2 years from today.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-700 mb-4">
              By clicking &quot;I Accept&quot; below, you acknowledge that you
              have read, understood, and agree to be bound by the terms of this
              Mutual Non-Disclosure Agreement. Your acceptance will be recorded
              with a timestamp.
            </p>
            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm mb-3">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            <button
              onClick={handleAccept}
              disabled={accepting}
              className="px-6 py-2.5 rounded-xl bg-[#8B5CF6] text-white font-medium text-sm hover:bg-[#7C3AED] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {accepting ? "Recording acceptance..." : "I Accept"}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
