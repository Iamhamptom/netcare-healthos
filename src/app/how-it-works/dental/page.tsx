"use client";

import IndustryPage from "@/components/IndustryPage";
import { Stethoscope, MessageSquare, CalendarCheck, Users, RotateCcw, Receipt, Star } from "lucide-react";

export default function DentalPage() {
  return (
    <IndustryPage
      name="Dental Practice"
      tagline="Your Front Desk, Automated"
      color="#2DD4BF"
      icon={Stethoscope}
      description="From appointment reminders to recall automation, Netcare Health OS Ops handles everything your receptionist does — 24/7 on WhatsApp. Your team focuses on patient care while AI handles the admin."
      painPoints={[
        "Patients no-show because they forgot their appointment",
        "Receptionist spends hours on phone calls and WhatsApp messages",
        "Recall lists are managed in spreadsheets or forgotten entirely",
        "Medical aid claims take days to process manually",
        "No visibility into daily revenue or practice performance",
      ]}
      solutions={[
        { title: "WhatsApp Booking Agent", icon: MessageSquare, description: "Patients message your WhatsApp number and AI books them instantly. Cleanings, check-ups, emergencies — all handled." },
        { title: "Smart Scheduling", icon: CalendarCheck, description: "Visual calendar with drag-and-drop. Slot management. Conflict detection. Multi-practitioner support." },
        { title: "Patient Records", icon: Users, description: "Full dental history, allergies, medications, x-ray notes. Everything in one place per patient." },
        { title: "Recall Automation", icon: RotateCcw, description: "6-month cleanings, annual check-ups — AI sends WhatsApp reminders automatically when patients are due." },
        { title: "Billing & Claims", icon: Receipt, description: "ICD-10 dental codes, medical aid submissions, split billing. Track payments by cash, card, EFT, or medical aid." },
        { title: "Review Collection", icon: Star, description: "After each visit, patients get a WhatsApp message asking for a Google review. Build your online reputation automatically." },
      ]}
      workflows={[
        { step: "Morning Briefing", description: "Open your dashboard — see today's appointments, yesterday's revenue, outstanding tasks, and who's arriving first." },
        { step: "Patient Check-In", description: "Patient arrives, receptionist taps 'Check In'. Digital consent form. Moved to waiting queue." },
        { step: "Consultation", description: "Doctor sees patient from queue. Notes, diagnosis, treatment plan — all captured digitally." },
        { step: "Billing", description: "Generate invoice with ICD-10 codes. Submit to medical aid or collect payment on the spot." },
        { step: "Follow-Up", description: "AI sends post-procedure care instructions via WhatsApp 24 hours later. Review request after 72 hours." },
        { step: "End of Day", description: "Check daily revenue, complete end-of-day tasks, review tomorrow's schedule. Close the books." },
      ]}
      testimonialQuote="We went from 8 no-shows per week to 1. The WhatsApp reminders alone paid for the system in the first month."
      testimonialAuthor="Dr. Sarah Mitchell, Smile Dental Sandton"
    />
  );
}
