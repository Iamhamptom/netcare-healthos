"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Verticals from "@/components/Verticals";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import ChatbotWidget from "@/components/chatbot/ChatbotWidget";
import Mission from "@/components/Mission";
import Intro from "@/components/Intro";
import PeopleFirst from "@/components/PeopleFirst";
import Integrations from "@/components/Integrations";
import GetInTouch from "@/components/GetInTouch";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import VoiceAgentSection from "@/components/voice-agent/VoiceAgentSection";
import NextLevel from "@/components/NextLevel";

const JessPresenter = dynamic(() => import("@/components/voice-agent/JessPresenter"), { ssr: false });

const jessSections = [
  {
    id: "home-hero",
    label: "Welcome",
    color: "#3DA9D1",
    narration: "Welcome to Netcare Health OS! I'm here to walk you through South Africa's most advanced AI-powered healthcare operations platform. Built specifically for Netcare Primary Healthcare, this platform unifies claims intelligence, financial dashboards, and operational analytics across all 88 clinics in the network. From Medicross to Netcare GP practices, everything flows through one command center.",
  },
  {
    id: "home-mission",
    label: "Our Mission",
    color: "#3DA9D1",
    narration: "Netcare Primary Healthcare serves millions of South Africans across 88 clinics. Managing claims, billing, patient flow, and compliance across that network is incredibly complex. Our mission is simple: give the financial leadership team real-time visibility and AI-powered intelligence to optimize every clinic's operations. Fewer rejected claims. Faster processing. Better patient outcomes.",
  },
  {
    id: "home-features",
    label: "Features",
    color: "#E3964C",
    narration: "Let me walk you through the features. Network-wide claims intelligence uses AI to identify patterns in claim rejections and suggest corrections before submission. Multi-site financial dashboards give you real-time revenue tracking across all 88 clinics. Smart booking optimization ensures every slot is filled and no-shows are minimized. Built-in POPIA compliance tracking, ICD-10 validation, and automated recall round out the platform.",
  },
  {
    id: "home-people",
    label: "How We Help",
    color: "#3DA9D1",
    narration: "Here's how Netcare Health OS transforms your operations. First, claims intelligence — AI validates every claim before submission, catching errors that cause rejections. Second, financial visibility — real-time dashboards show revenue, outstanding claims, and clinic performance across the entire network. Third, operational automation — daily tasks, patient check-in, recall management, and compliance auditing all happen automatically.",
  },
  {
    id: "home-integrations",
    label: "Integrations",
    color: "#EBB682",
    narration: "Netcare Health OS integrates seamlessly with your existing systems. Medical aid claim submissions, ICD-10 code validation, patient management systems, payment gateways, and WhatsApp for patient communication. Everything connects through one intelligent platform.",
  },
  {
    id: "home-verticals",
    label: "Clinic Types",
    color: "#3DA9D1",
    narration: "The platform supports every type of clinic in the Netcare Primary Healthcare network. Medicross multi-disciplinary clinics, GP practices, dental clinics, optometry centers, and specialist referral practices. Each gets tailored dashboards and workflows for their specific needs.",
  },
  {
    id: "home-howitworks",
    label: "How It Works",
    color: "#E3964C",
    narration: "Getting started is simple. Step one — we onboard your clinic data and connect to existing systems. Step two — AI agents begin analyzing claims patterns and identifying optimization opportunities. Step three — your team gets real-time dashboards showing network-wide performance. The platform learns and improves continuously.",
  },
  {
    id: "home-nextlevel",
    label: "The Network",
    color: "#EBB682",
    narration: "But this is just the beginning. Netcare Health OS is designed to scale across the entire Netcare network — primary healthcare today, hospital groups tomorrow. Every clinic added multiplies the intelligence of the system. Network effects mean better claims processing, better analytics, and better patient outcomes for everyone.",
  },
  {
    id: "home-pricing",
    label: "Plans",
    color: "#3DA9D1",
    narration: "Netcare Health OS is available in three tiers — Clinic for individual practices, Network for multi-site management, and Enterprise for the full Netcare Primary Healthcare organization. Each tier includes AI claims intelligence, financial dashboards, and POPIA compliance.",
  },
  {
    id: "home-cta",
    label: "Get Started",
    color: "#E3964C",
    narration: "Thank you for exploring Netcare Health OS. Whether you're ready to schedule a demo, pilot at a single clinic, or roll out across the network — we're here to help. Welcome to the future of healthcare operations. Welcome to Netcare Health OS.",
  },
];

export default function Home() {
  const [entered, setEntered] = useState(false);

  return (
    <main className="bg-[#1D3443] text-white min-h-screen selection:bg-[#3DA9D1]/15 selection:text-white">
      {/* Welcome portal — click to enter */}
      <AnimatePresence mode="wait">
        {!entered && <Intro onEnter={() => setEntered(true)} />}
      </AnimatePresence>

      {/* Main site — revealed after entering */}
      <AnimatePresence>
        {entered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Navbar />
            <div data-jess="home-hero"><Hero /></div>
            <div data-jess="home-mission"><Mission /></div>
            <div data-jess="home-features"><Features /></div>
            <div data-jess="home-people"><PeopleFirst /></div>
            <div data-jess="home-integrations"><Integrations /></div>
            <div data-jess="home-verticals"><Verticals /></div>
            <div data-jess="home-howitworks"><HowItWorks /></div>
            <VoiceAgentSection />
            <div data-jess="home-nextlevel"><NextLevel /></div>
            <Testimonials />
            <div data-jess="home-pricing"><Pricing /></div>
            <GetInTouch />
            <div data-jess="home-cta"><CTA /></div>
            <JessPresenter sections={jessSections} />
            <Footer />
            <ChatbotWidget />
            <WhatsAppFloat />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
