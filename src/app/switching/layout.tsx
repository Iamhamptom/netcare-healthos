import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Medical Aid Claims Switching Engine | Netcare Health OS",
  description:
    "AI-powered claims switching for South African healthcare. Multi-switch routing across Healthbridge, MediKredit, and SwitchOn with EDIFACT MEDCLM support.",
  openGraph: {
    title: "Claims Switching Engine",
    description:
      "First AI-powered multi-switch claims router in South Africa",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
