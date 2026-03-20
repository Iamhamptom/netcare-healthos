import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Claims Intelligence Research | Netcare Health OS",
  description:
    "AI-driven claims intelligence for South African medical practices. Pattern detection, fraud analysis, and reimbursement optimisation powered by machine learning.",
  openGraph: {
    title: "Claims Intelligence Research",
    description:
      "AI claims intelligence and pattern analysis for SA healthcare",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
