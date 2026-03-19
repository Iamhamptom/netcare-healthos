"use client";

import IndustryPage from "@/components/IndustryPage";
import { Scissors, MessageSquare, CalendarCheck, Users, Receipt, Star, Palette } from "lucide-react";

export default function SalonPage() {
  return (
    <IndustryPage
      name="Salon & Beauty"
      tagline="Book, Style, Repeat"
      color="#D4AF37"
      icon={Scissors}
      description="Client booking, stylist scheduling, product tracking, and automated reminders. Perfect for hair salons, nail bars, barbers, and beauty studios."
      painPoints={[
        "Clients book via Instagram DM, WhatsApp, walk-in — chaos",
        "Double-bookings happen weekly, clients leave angry",
        "No client history — who did their last colour? What formula?",
        "No-shows cost you money and you can't fill the slot fast enough",
        "No way to track product usage and inventory",
      ]}
      solutions={[
        { title: "WhatsApp Booking", icon: MessageSquare, description: "Clients message to book cuts, colours, nails, lashes. AI shows available slots per stylist and confirms." },
        { title: "Stylist Calendars", icon: CalendarCheck, description: "Each stylist has their own calendar. Service duration auto-blocks time. No more double-bookings." },
        { title: "Client History", icon: Users, description: "Track colour formulas, preferred stylist, hair type, allergies. Every visit is logged." },
        { title: "Smart Reminders", icon: Star, description: "48-hour WhatsApp reminder. 4-week rebook suggestion. Birthday messages with discounts." },
        { title: "POS & Invoicing", icon: Receipt, description: "Ring up services and products. Split payments. Track daily revenue by stylist." },
        { title: "Brand & Marketing", icon: Palette, description: "White-label your booking page with your salon branding. Clients see YOUR brand, not ours." },
      ]}
      workflows={[
        { step: "Client Books", description: "WhatsApp, Instagram link, or walk-in. AI checks their preferred stylist's availability." },
        { step: "Reminder Sent", description: "48 hours before: WhatsApp reminder with salon address and what to expect." },
        { step: "Client Arrives", description: "Check them in. Pull up their history — last colour formula, any notes from previous visit." },
        { step: "Service", description: "Stylist works their magic. Notes captured — products used, formula, duration." },
        { step: "Payment", description: "Service + products. Card, cash, or Yoco tap. Tip split available." },
        { step: "Rebook", description: "AI suggests next appointment based on service (4 weeks for cut, 6 weeks for colour). Books it there and then." },
      ]}
      testimonialQuote="We used to lose 5 clients a week to no-shows. Now the WhatsApp reminders cut that to almost zero, and clients love how easy it is to rebook."
      testimonialAuthor="Bright Smile Beauty, Pretoria"
    />
  );
}
