"use client";

import { HeartPulse, Shield, Lock, Eye, GraduationCap, FileCheck, Heart } from "lucide-react";

export default function FounderLetterPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 pb-6 border-b border-gray-200">
        <HeartPulse className="w-8 h-8 text-[#8B5CF6] mx-auto" />
        <h1 className="text-3xl font-bold text-gray-900 font-serif">A Letter from the Founder</h1>
        <p className="text-sm text-gray-500 italic">&ldquo;Saving Time Saves Lives&rdquo;</p>
        <p className="text-xs text-gray-400">14 March 2026 — David Mubikay Hampton, Founder of Netcare Technology</p>
      </div>

      {/* Story Image */}
      <div className="rounded-xl overflow-hidden bg-gray-900 h-48 mb-8">
        <img
          src="/images/investor/founder-story.png"
          alt="Hospital corridor"
          className="w-full h-full object-cover opacity-60"
          onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
        />
      </div>

      {/* The Story */}
      <div className="prose prose-gray max-w-none">
        <div className="bg-gray-50 border-l-4 border-[#8B5CF6] p-6 rounded-r-xl mb-8">
          <h2 className="text-lg font-bold text-gray-900 mt-0 flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#8B5CF6]" />
            &ldquo;I Couldn&rsquo;t Find a Bed&rdquo;
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed mb-0">
            I lost my mother because the system failed her. Not because the doctors didn&rsquo;t care.
            Not because the medicine didn&rsquo;t exist. Because there was no bed. Because the information
            didn&rsquo;t move fast enough. Because the coordination between people, facilities, and systems
            broke down at the moment it mattered most.
          </p>
          <p className="text-sm text-gray-700 leading-relaxed mb-0 mt-3">
            That experience changed me. It gave me a purpose I carry into every line of code we write,
            every feature we build, every decision we make at Netcare Health OS. When a system saves a doctor
            five minutes, that&rsquo;s five minutes that could mean a life. When a patient gets seen faster
            because the queue moved smarter, that&rsquo;s not just efficiency — that&rsquo;s survival.
          </p>
          <p className="text-sm text-gray-700 leading-relaxed mb-0 mt-3">
            <strong>Saving time saves lives.</strong> That is not a tagline. That is the wound this company was built from.
          </p>
        </div>

        {/* Vision */}
        <h2 className="text-xl font-bold text-gray-900 font-serif flex items-center gap-2">
          <Eye className="w-5 h-5 text-[#8B5CF6]" />
          Our Vision
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          Netcare Health OS exists to give every medical practice in South Africa — and eventually across
          Africa — the tools to operate at their best. Not to replace doctors. Not to replace human
          judgment. To remove the friction that stands between a patient and the care they need.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">
          We believe that when practices run efficiently, patients are seen sooner. When billing is
          accurate, claims are paid faster. When follow-ups are automated, no one falls through the
          cracks. When a doctor has the right information at the right time, they make better decisions.
          Every second we save in administration is a second returned to patient care.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">
          Our six products — Netcare Health OS, Placeo Health, Visio Health Integrator, Visio Waiting Room,
          Netcare Health OS Payer Connect, and VisioMed AI — form one ecosystem with one goal:
          <strong> to ensure that no patient is failed by a system that could have been better.</strong>
        </p>
      </div>

      {/* Transparency & Privacy */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-900 text-white p-6">
          <h2 className="text-xl font-bold font-serif flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-[#8B5CF6]" />
            Our Commitment to Transparency, Privacy & Security
          </h2>
          <p className="text-sm text-gray-300">
            A promise to our patients, our partner practices, and the government of South Africa.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Privacy */}
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#3DA9D1] flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-[#3DA9D1]" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Patient Data is Sacred</h3>
              <p className="text-sm text-gray-600 mt-1">
                Health information is classified as Special Personal Information under POPIA Section 26 —
                the highest protection level in South African law. We treat it as such. Every patient record
                is encrypted in transit (TLS 1.2+) and at rest. Passwords are hashed with bcrypt. Sessions
                use signed JWT tokens. We do not sell, share, or monetise patient data. Ever.
              </p>
            </div>
          </div>

          {/* Encryption */}
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Encryption & Security Architecture</h3>
              <ul className="text-sm text-gray-600 mt-1 space-y-1 list-disc list-inside">
                <li>All data encrypted in transit using TLS 1.2+ (256-bit SSL)</li>
                <li>Database encryption at rest via hosting provider infrastructure</li>
                <li>Password hashing with bcrypt (10 rounds) — we never store plain text passwords</li>
                <li>Role-based access control — doctors, nurses, receptionists, and admins see only what they need</li>
                <li>Comprehensive audit logging — every access to patient data is recorded with timestamp, user, and IP</li>
                <li>Session management via signed JWT tokens with 7-day expiry and HttpOnly secure cookies</li>
                <li>Rate limiting on all API endpoints to prevent abuse</li>
              </ul>
            </div>
          </div>

          {/* Audit Readiness */}
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
              <FileCheck className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Audit-Ready by Design</h3>
              <p className="text-sm text-gray-600 mt-1">
                Netcare Health OS is built to be cleanly audited at any time by any authority. Our audit trail
                records every patient data access — who viewed it, when, from where, and why. POPIA consent
                records track exactly when each patient gave consent, for what purpose, and through what method.
                We welcome scrutiny because we have nothing to hide. Our compliance framework covers:
              </p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                  "POPIA (Act 4 of 2013)",
                  "HPCSA Ethical Rules (2023 amendments)",
                  "Health Professions Act (Act 56 of 1974)",
                  "Consumer Protection Act (Act 68 of 2008)",
                  "ECTA (Act 25 of 2002)",
                  "Medical Schemes Act (Act 131 of 1998)",
                  "Medicines Act (Act 101 of 1965)",
                  "POPIA Health Info Regulations (March 2026)",
                ].map((law) => (
                  <div key={law} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#3DA9D1] shrink-0" />
                    {law}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Transparency */}
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Radical Transparency</h3>
              <p className="text-sm text-gray-600 mt-1">
                We publish our full Terms & Conditions, Privacy Policy, Data Processing Addendum,
                Acceptable Use Policy, and HPCSA Compliance Statement openly on this platform.
                Every practice that uses Netcare Health OS can see exactly how their data is handled,
                where it is stored, who has access, and what happens if something goes wrong.
                We believe that trust is built through transparency, not through fine print.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Education Commitment */}
      <div className="border border-[#8B5CF6]/20 rounded-xl overflow-hidden">
        <div className="bg-[#8B5CF6]/5 p-6">
          <h2 className="text-xl font-bold text-gray-900 font-serif flex items-center gap-2 mb-2">
            <GraduationCap className="w-5 h-5 text-[#8B5CF6]" />
            Our AI Education Commitment
          </h2>
          <p className="text-sm text-gray-500">
            We don&rsquo;t just deploy AI — we educate on it.
          </p>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-700 leading-relaxed">
            Netcare Health OS uses artificial intelligence to assist with triage, patient intake, follow-ups,
            billing, and scheduling. But we believe deeply that <strong>AI should augment human capability,
            not replace it</strong>. A doctor&rsquo;s judgment, empathy, and clinical experience cannot be
            replicated by a machine. What a machine can do is handle the administrative burden that
            keeps doctors from doing what they trained for — caring for patients.
          </p>

          <p className="text-sm text-gray-700 leading-relaxed">
            That is why every Netcare Health OS client receives <strong>private, hands-on AI education</strong> as
            part of their onboarding:
          </p>

          <div className="grid md:grid-cols-2 gap-3">
            {[
              {
                title: "Understanding AI in Healthcare",
                desc: "What AI can and cannot do. How it makes suggestions. Why it is never the final decision-maker.",
              },
              {
                title: "Hands-On Platform Training",
                desc: "Every feature, every AI agent, every workflow — demonstrated and practiced until your team is confident.",
              },
              {
                title: "Staff-Wide Training",
                desc: "Not just the doctor — receptionists, nurses, practice managers. Everyone who touches the system understands it.",
              },
              {
                title: "Ongoing Education",
                desc: "As we add features and as AI evolves, we bring our clients along. No one is left behind.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-bold text-gray-900">{item.title}</h4>
                <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-700 leading-relaxed">
            Our philosophy is simple: <strong>spread the knowledge, share the understanding, work with AI —
            not depend on it</strong>. When every staff member in a practice understands the technology they
            use, the entire practice becomes stronger. Information doesn&rsquo;t sit in one person&rsquo;s head —
            it flows across the team. That resilience is what saves lives when it matters.
          </p>
        </div>
      </div>

      {/* Closing */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center space-y-4">
        <p className="text-sm text-gray-700 leading-relaxed max-w-2xl mx-auto">
          To every doctor who joins Netcare Health OS — thank you for trusting us with your practice.
          To every patient whose data flows through our system — we guard it with everything we have.
          To the government and regulatory bodies that hold us accountable — we welcome your oversight
          and commit to exceeding your standards.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed max-w-2xl mx-auto">
          We are building this for the mothers who couldn&rsquo;t find a bed. For the patients who waited
          too long. For the doctors who wanted to help but were buried in paperwork. Every second we save
          is a second returned to the work that matters.
        </p>
        <div className="pt-4 border-t border-gray-200">
          <p className="text-base font-bold text-gray-900 font-serif">David Mubikay Hampton</p>
          <p className="text-xs text-gray-500">Founder — Netcare Technology</p>
          <p className="text-xs text-[#8B5CF6] italic mt-1">&ldquo;Saving Time Saves Lives&rdquo;</p>
        </div>
      </div>
    </div>
  );
}
