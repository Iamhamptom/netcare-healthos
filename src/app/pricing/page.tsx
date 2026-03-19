import Navbar from "@/components/Navbar";
import Pricing from "@/components/Pricing";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function PricingPage() {
  return (
    <div className="bg-[#030F07]">
      <Navbar />
      <div className="pt-24">
        <Pricing />
      </div>
      <CTA />
      <Footer />
    </div>
  );
}
