"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap, Clock, Users, CheckCircle2, Calendar,
  Brain, Shield, Stethoscope, Monitor, Send,
} from "lucide-react";

const courses = [
  {
    id: "ai-healthcare-fundamentals",
    title: "AI in Healthcare — Fundamentals",
    description: "Understand what AI can and cannot do in a medical practice. How models work, how suggestions are generated, and why the doctor always has the final say.",
    duration: "2 hours",
    audience: "Doctors, Practice Managers",
    icon: Brain,
    color: "#8B5CF6",
    modules: [
      "What is AI? (No jargon, real explanations)",
      "How Netcare Health OS AI agents think",
      "AI as decision support — not decision maker",
      "When to trust AI, when to override",
      "Patient safety and AI boundaries",
    ],
  },
  {
    id: "visiohealth-platform-mastery",
    title: "Netcare Health OS — Platform Mastery",
    description: "Hands-on training for every feature in Netcare Health OS. From patient management to billing, AI agents to compliance tools.",
    duration: "4 hours (2 sessions)",
    audience: "All Staff",
    icon: Monitor,
    color: "#10b981",
    modules: [
      "Dashboard & daily workflow",
      "Patient management & records",
      "Booking engine & public page",
      "Billing with ICD-10 codes",
      "WhatsApp/SMS notifications",
      "AI agents: triage, intake, follow-up",
      "POPIA consent & audit tools",
    ],
  },
  {
    id: "staff-ai-literacy",
    title: "Staff AI Literacy Programme",
    description: "Training for receptionists, nurses, and admin staff. Everyone who touches the system should understand it — knowledge shared across the team means no single point of failure.",
    duration: "1.5 hours",
    audience: "Receptionists, Nurses, Admin",
    icon: Users,
    color: "#0ea5e9",
    modules: [
      "How AI helps your daily work",
      "Understanding AI suggestions in conversations",
      "Approving vs rejecting AI-generated messages",
      "Patient check-in & queue management",
      "When to escalate to the doctor",
    ],
  },
  {
    id: "compliance-data-protection",
    title: "POPIA & Data Protection for Practices",
    description: "Practical training on South African data protection law as it applies to medical practices. Not legal theory — real workflows.",
    duration: "1.5 hours",
    audience: "All Staff",
    icon: Shield,
    color: "#f59e0b",
    modules: [
      "POPIA basics — what it means for your practice",
      "Consent: treatment vs data vs marketing",
      "Patient rights (access, correction, deletion)",
      "What to do in a data breach",
      "Audit logs — why everything is recorded",
    ],
  },
  {
    id: "clinical-ai-advanced",
    title: "Clinical AI — Advanced (Coming Soon)",
    description: "For doctors ready to go deeper. Precision medicine, AI-assisted diagnostics, clinical decision support, and the future of healthcare AI.",
    duration: "3 hours",
    audience: "Doctors, Specialists",
    icon: Stethoscope,
    color: "#ec4899",
    modules: [
      "AI-assisted differential diagnosis",
      "Drug interaction checking with AI",
      "ICD-10 code suggestion from clinical notes",
      "Voice-to-notes and clinical documentation",
      "Research: where healthcare AI is heading",
    ],
  },
];

export default function InvestorCoursesPage() {
  const [rsvpCourse, setRsvpCourse] = useState<string | null>(null);
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpEmail, setRsvpEmail] = useState("");
  const [rsvpSent, setRsvpSent] = useState<Set<string>>(new Set());

  async function handleRsvp(courseId: string) {
    if (!rsvpName.trim() || !rsvpEmail.trim()) return;
    try {
      await fetch("/api/investor/course-rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, name: rsvpName, email: rsvpEmail }),
      });
    } catch { /* optimistic update */ }
    setRsvpSent((prev) => new Set(prev).add(courseId));
    setRsvpCourse(null);
    setRsvpName("");
    setRsvpEmail("");
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-serif">AI Education & Training Courses</h1>
        <p className="text-sm text-gray-500 mt-1">
          We don&rsquo;t just deploy AI — we educate on it. Every Netcare Health OS client and their staff
          receives private, hands-on training. Knowledge spread across the team means resilience.
        </p>
      </div>

      {/* Philosophy Banner */}
      <div className="bg-[#8B5CF6]/5 border border-[#8B5CF6]/20 rounded-xl p-5">
        <p className="text-sm text-gray-700 leading-relaxed">
          <strong className="text-[#8B5CF6]">Our philosophy:</strong> Don&rsquo;t depend on AI — work with it to speed up
          what you already do. When every staff member understands the technology, information flows freely.
          No single point of failure. No black boxes. Just tools that make your team faster, smarter, and
          more connected — so that many more lives can be saved.
        </p>
      </div>

      {/* Coming Soon Badge */}
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
        <Calendar className="w-4 h-4 text-amber-600" />
        <p className="text-sm text-amber-800">
          <strong>Courses launching Q2 2026.</strong> RSVP below to secure your spot and be notified when dates are confirmed.
        </p>
      </div>

      {/* Course Cards */}
      <div className="space-y-4">
        {courses.map((course) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-gray-200 rounded-xl overflow-hidden bg-white"
          >
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div
                    className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${course.color}15` }}
                  >
                    <course.icon className="w-5 h-5" style={{ color: course.color }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{course.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {course.duration}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Users className="w-3 h-3" />
                        {course.audience}
                      </div>
                    </div>
                  </div>
                </div>

                {rsvpSent.has(course.id) ? (
                  <div className="flex items-center gap-1.5 text-[#3DA9D1] text-xs font-medium shrink-0 bg-[#3DA9D1] px-3 py-1.5 rounded-lg">
                    <CheckCircle2 className="w-4 h-4" />
                    RSVP&rsquo;d
                  </div>
                ) : (
                  <button
                    onClick={() => setRsvpCourse(rsvpCourse === course.id ? null : course.id)}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[#8B5CF6] text-white hover:bg-[#7C3AED] transition-colors shrink-0"
                  >
                    RSVP
                  </button>
                )}
              </div>

              {/* Modules */}
              <div className="mt-4 grid md:grid-cols-2 gap-1.5">
                {course.modules.map((mod, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: course.color }} />
                    {mod}
                  </div>
                ))}
              </div>

              {/* RSVP Form */}
              {rsvpCourse === course.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <p className="text-xs text-gray-500 mb-3">Reserve your spot — we&rsquo;ll notify you when dates are confirmed.</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Full name"
                      value={rsvpName}
                      onChange={(e) => setRsvpName(e.target.value)}
                      className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
                    />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={rsvpEmail}
                      onChange={(e) => setRsvpEmail(e.target.value)}
                      className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
                    />
                    <button
                      onClick={() => handleRsvp(course.id)}
                      disabled={!rsvpName.trim() || !rsvpEmail.trim()}
                      className="px-4 py-2 bg-[#8B5CF6] text-white text-sm rounded-lg hover:bg-[#7C3AED] disabled:opacity-40 flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Confirm
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
