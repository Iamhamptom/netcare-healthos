"use client";

import IndustryPage from "@/components/IndustryPage";
import { Sparkles, MessageSquare, CalendarCheck, Users, Receipt, Star, Heart } from "lucide-react";

export default function WellnessPage() {
  return (
    <IndustryPage
      name="Wellness & Spa"
      tagline="Bookings Flow, Clients Glow"
      color="#E8C84A"
      icon={Sparkles}
      description="Manage treatments, therapist schedules, client preferences, and product sales. WhatsApp booking for massages, facials, and wellness packages — all automated."
      painPoints={[
        "Clients book via DM, WhatsApp, and phone — nothing centralised",
        "Therapist scheduling conflicts and double-bookings",
        "No record of client preferences (pressure, allergies, favourite therapist)",
        "Gift vouchers and packages are tracked on paper",
        "No automated follow-ups or rebooking reminders",
      ]}
      solutions={[
        { title: "WhatsApp Booking", icon: MessageSquare, description: "Clients message to book massages, facials, body treatments. AI shows available slots and confirms instantly." },
        { title: "Therapist Scheduling", icon: CalendarCheck, description: "Each therapist has their own calendar. AI prevents double-bookings and manages break times." },
        { title: "Client Profiles", icon: Users, description: "Track preferences — favourite therapist, pressure level, allergies, skin type. Personalise every visit." },
        { title: "Package Management", icon: Receipt, description: "Sell treatment packages and vouchers. Track usage. Auto-remind clients when sessions are expiring." },
        { title: "Review & Retention", icon: Star, description: "Post-treatment WhatsApp asking for feedback. Birthday messages with special offers." },
        { title: "Wellness Plans", icon: Heart, description: "Create ongoing wellness plans with scheduled treatments. AI reminds clients and books automatically." },
      ]}
      workflows={[
        { step: "Client Books", description: "Via WhatsApp, website, or walk-in. AI checks therapist availability and confirms the appointment." },
        { step: "Pre-Visit Prep", description: "Client receives WhatsApp with what to expect, arrival time, and any prep (no caffeine, loose clothing, etc.)." },
        { step: "Check-In", description: "Client arrives. Receptionist checks them in. Consent form for new treatments. Moved to waiting area." },
        { step: "Treatment", description: "Therapist sees client preferences on their dashboard. Treatment notes captured after session." },
        { step: "Payment & Product", description: "Invoice generated. Upsell recommended products. Payment by card, cash, or voucher." },
        { step: "Follow-Up", description: "24-hour check-in WhatsApp. Rebooking suggestion based on treatment cycle. Review request." },
      ]}
      testimonialQuote="Our rebooking rate went from 40% to 72% — the automated WhatsApp follow-ups make all the difference."
      testimonialAuthor="Zen Wellness Spa, Fourways"
    />
  );
}
