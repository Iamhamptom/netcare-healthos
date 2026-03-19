import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ENT Practice Management Software — Netcare Health OS OS | South Africa",
  description: "AI-powered practice management for ENT specialists and otolaryngologists in South Africa. GP referral management, tonsillectomy scheduling, hearing assessments, ICD-10 ENT billing, medical aid pre-authorisation, WhatsApp post-op reminders. POPIA compliant.",
  keywords: ["ENT practice management software", "ENT specialist software South Africa", "otolaryngology practice management", "ENT billing ICD-10", "ENT surgery scheduling", "hearing assessment software", "paediatric ENT", "medical aid pre-authorisation ENT"],
  openGraph: {
    title: "ENT Practice Management Software — Netcare Health OS OS",
    description: "Purpose-built AI practice management for ENT specialists in South Africa. Referral management, surgery scheduling, ICD-10 billing, and WhatsApp reminders.",
    type: "website",
    locale: "en_ZA",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Netcare Health OS OS — ENT Practice Management" }],
  },
};

export default function ENTLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
