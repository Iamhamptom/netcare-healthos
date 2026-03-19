"use client";

import IndustryPage from "@/components/IndustryPage";
import { Building2, MessageSquare, CalendarCheck, Users, Shield, Receipt, Phone } from "lucide-react";

export default function HospitalPage() {
  return (
    <IndustryPage
      name="Hospital & Clinic"
      tagline="Every Ward, One System"
      color="#ef4444"
      icon={Building2}
      description="Multi-department scheduling, ward management, emergency triage, and cross-facility patient tracking. Built for the complexity of hospital operations."
      painPoints={[
        "Departments operate in silos with separate systems",
        "Patient handoff between departments loses information",
        "Emergency admissions don't sync with scheduled operations",
        "Billing across departments and medical aids is fragmented",
        "Staff scheduling across shifts is managed on spreadsheets",
      ]}
      solutions={[
        { title: "Multi-Department", icon: CalendarCheck, description: "Separate calendars per department — surgery, radiology, outpatient, emergency. Cross-department visibility." },
        { title: "Patient Flow", icon: Users, description: "Track patients across admission, consultation, procedure, recovery, discharge. Full journey visible." },
        { title: "Emergency Triage", icon: Phone, description: "Emergency line with IVR routing. AI triage assessment. Priority queuing based on urgency." },
        { title: "POPIA Compliance", icon: Shield, description: "Full audit trail, consent management, role-based access. Health data treated as Special Personal Information." },
        { title: "Medical Aid Claims", icon: Receipt, description: "ICD-10 coding, medical aid submission, payment tracking. Multi-scheme support across departments." },
        { title: "WhatsApp Updates", icon: MessageSquare, description: "Patients and families receive status updates via WhatsApp — admission confirmation, procedure updates, discharge instructions." },
      ]}
      workflows={[
        { step: "Admission", description: "Patient registers at reception. ID captured. Medical aid verified. Assigned to department." },
        { step: "Triage / Assessment", description: "AI triage or nurse assessment. Priority assigned. Moved to appropriate department queue." },
        { step: "Consultation / Procedure", description: "Doctor sees patient. Notes captured digitally. Orders (labs, imaging) placed in system." },
        { step: "Ward Management", description: "Inpatients tracked by ward and bed. Vitals, medications, and nursing notes all in one place." },
        { step: "Billing & Claims", description: "All procedures coded. Medical aid claims submitted. Patient balance calculated." },
        { step: "Discharge", description: "Discharge summary generated. Follow-up appointments booked. Medication instructions sent via WhatsApp." },
      ]}
    />
  );
}
