import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coming Soon",
  description: "See what's next for Netcare Health OS — AI Voice Receptionist, Smart Recall, Patient Portal, and more on our roadmap.",
};

export default function ComingSoonLayout({ children }: { children: React.ReactNode }) {
  return children;
}
