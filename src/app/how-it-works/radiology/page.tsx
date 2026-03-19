"use client";

import IndustryPage from "@/components/IndustryPage";
import { ScanLine, MessageSquare, ClipboardList, Users, FileText, CalendarCheck, Shield } from "lucide-react";

export default function RadiologyPage() {
  return (
    <IndustryPage
      name="Radiology Centre"
      tagline="Referrals In, Reports Out"
      color="#8B5CF6"
      icon={ScanLine}
      description="Manage the entire radiology workflow — from GP referral intake to patient prep instructions to report delivery. Multi-modality scheduling across X-ray, MRI, CT, and ultrasound."
      painPoints={[
        "Referrals arrive by fax, email, WhatsApp — no single system",
        "Patients arrive unprepared (fasting, contrast, clothing)",
        "Reports get lost or delayed between radiologist and referring doctor",
        "Scheduling across multiple modalities is complex",
        "Medical aid pre-authorisation delays appointments",
      ]}
      solutions={[
        { title: "Referral Intake", icon: MessageSquare, description: "Referring doctors send referrals via WhatsApp or email. AI extracts patient info, modality, and clinical indication automatically." },
        { title: "Patient Prep Automation", icon: ClipboardList, description: "Based on the modality, AI sends prep instructions via WhatsApp — fasting requirements, what to wear, when to arrive." },
        { title: "Multi-Modality Scheduling", icon: CalendarCheck, description: "Separate calendars for X-ray, MRI, CT, ultrasound. Slot management with equipment-specific timing." },
        { title: "Patient Management", icon: Users, description: "Full patient history across all imaging visits. Previous scans, allergies (contrast), referring doctor details." },
        { title: "Report Delivery", icon: FileText, description: "Radiologist uploads report, patient and referring doctor get notified via WhatsApp and email automatically." },
        { title: "Pre-Auth Tracking", icon: Shield, description: "Track medical aid pre-authorisation status. Auto-remind patients of outstanding approvals." },
      ]}
      workflows={[
        { step: "Referral Received", description: "GP sends referral via WhatsApp. AI extracts details, creates appointment request, checks insurance." },
        { step: "Schedule & Prep", description: "Staff confirms slot. Patient receives WhatsApp with date, time, and prep instructions for their specific scan." },
        { step: "Day of Scan", description: "Patient checks in. Consent form signed digitally. Moved to imaging queue." },
        { step: "Imaging & Report", description: "Scan completed. Radiologist reviews and reports. Report uploaded to system." },
        { step: "Report Delivery", description: "Patient and referring doctor both receive the report via their preferred channel — WhatsApp, email, or portal." },
        { step: "Follow-Up", description: "If follow-up scan is needed, AI schedules it automatically and sends reminders when due." },
      ]}
      testimonialQuote="Referral intake used to take 15 minutes per patient. Now it's automatic — the AI reads the referral and books the slot."
      testimonialAuthor="Dr. Molefe, Molefe Radiology Rosebank"
    />
  );
}
