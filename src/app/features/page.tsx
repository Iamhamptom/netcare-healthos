import Navbar from "@/components/Navbar";
import Features from "@/components/Features";
import Verticals from "@/components/Verticals";
import HowItWorks from "@/components/HowItWorks";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function FeaturesPage() {
  return (
    <div className="bg-[#030F07]">
      <Navbar />
      <div className="pt-24">
        <Features />
        <Verticals />
        <HowItWorks />
      </div>
      <CTA />
      <Footer />
    </div>
  );
}
