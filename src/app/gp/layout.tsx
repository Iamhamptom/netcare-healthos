import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GP Referral Portal — Refer Patients to Specialists Digitally | Netcare Health OS",
  description:
    "Submit digital referrals to specialist practices across South Africa. Track referral status, receive specialist feedback, and access the specialist directory. Free for GPs. POPIA compliant.",
  keywords: [
    "GP referral portal",
    "refer patients to specialists South Africa",
    "digital referral system for doctors",
    "find ENT specialist Johannesburg",
    "GP referral tracking",
    "specialist directory South Africa",
    "POPIA compliant referral",
    "doctor referral network",
    "medical referral platform",
    "GP practice management South Africa",
  ],
  openGraph: {
    title: "GP Referral Portal — Refer Patients to Specialists Digitally | Netcare Health OS",
    description:
      "Submit digital referrals to specialist practices across South Africa. Track status, receive feedback. Free for GPs.",
    type: "website",
    locale: "en_ZA",
    siteName: "Netcare Health OS OS",
  },
  twitter: {
    card: "summary_large_image",
    title: "GP Referral Portal | Netcare Health OS",
    description:
      "Digital referral system for South African GPs. Submit referrals, track outcomes, receive specialist feedback. Free.",
  },
};

export default function GPLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
