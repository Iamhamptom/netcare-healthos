import { Metadata } from "next";

export const metadata: Metadata = {
  title: "VRL-002: Switching Research | Netcare Health OS",
  description:
    "Research paper on AI-powered medical aid claims switching for the South African healthcare ecosystem. Multi-vendor routing, EDIFACT compliance, and intelligent claim adjudication.",
  openGraph: {
    title: "VRL-002: Switching Research",
    description:
      "AI switching research for South African medical claims infrastructure",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
