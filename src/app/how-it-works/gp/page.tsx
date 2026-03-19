"use client";

import IndustryPage from "@/components/IndustryPage";
import { Heart, MessageSquare, CalendarCheck, Users, Receipt, RotateCcw, Shield } from "lucide-react";

export default function GPPage() {
  return (
    <IndustryPage
      name="General Practice"
      tagline="Your Practice, Simplified"
      color="#10b981"
      icon={Heart}
      description="Patient management, chronic care follow-ups, medical aid claims, and POPIA compliance. Built for the GP who sees 30+ patients a day and needs everything running smoothly."
      painPoints={[
        "Chronic patients miss follow-ups because nobody tracks them",
        "Medical aid claims are submitted late or incorrectly",
        "Patient files are still paper-based or in outdated systems",
        "No time for admin — every minute matters when you see 30+ patients",
        "After-hours calls go to voicemail and get lost",
      ]}
      solutions={[
        { title: "WhatsApp Front Desk", icon: MessageSquare, description: "Patients message to book, reschedule, or ask questions. AI handles it all — you just approve bookings." },
        { title: "Chronic Care Tracking", icon: RotateCcw, description: "Set recall schedules for chronic patients — diabetes checks, blood pressure, repeat scripts. AI reminds them automatically." },
        { title: "Smart Scheduling", icon: CalendarCheck, description: "15-minute slots for quick consultations. 30-minute slots for new patients. AI manages the gaps." },
        { title: "Patient Records", icon: Users, description: "Full medical history, allergies, medications, chronic conditions. Accessible from any device." },
        { title: "Billing & Claims", icon: Receipt, description: "ICD-10 codes, medical aid submissions, cash payments. Track what's paid and what's outstanding." },
        { title: "POPIA Compliant", icon: Shield, description: "Audit logs, consent tracking, role-based access. Your practice is legally protected." },
      ]}
      workflows={[
        { step: "Morning Check", description: "See today's patient list. Review chronic patients due for follow-up. Check outstanding results." },
        { step: "Consultations", description: "Patients arrive and check in. You see them in order. Notes, prescriptions, referrals — all digital." },
        { step: "Prescriptions", description: "Generate scripts digitally. Chronic patients get repeat scripts queued automatically." },
        { step: "Billing", description: "Bill as you go. Medical aid claims submitted same day. Cash patients pay at reception." },
        { step: "After Hours", description: "Emergency line routes calls. AI handles basic WhatsApp queries. You rest." },
        { step: "End of Day", description: "Review revenue, complete tasks, check tomorrow's schedule. Day done." },
      ]}
      testimonialQuote="I used to spend 2 hours after work doing admin. Now I walk out the door at 5pm and the AI handles the rest."
      testimonialAuthor="Dr. Nkosi, General Practice Soweto"
    />
  );
}
