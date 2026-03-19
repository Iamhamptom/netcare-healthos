"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { blurPlaceholders } from "@/lib/blur-placeholders";

const testimonials = [
  {
    name: "Dr. Sarah M.",
    role: "Dental Practice Owner, Sandton",
    text: "Netcare Health OS cut our no-show rate by 40% in the first month. The WhatsApp bot handles 80% of enquiries before my team even sees them.",
    stat: "40%",
    statLabel: "fewer no-shows",
    stars: 5,
    image: "/images/portrait-sarah.png",
  },
  {
    name: "Dr. Thabo K.",
    role: "Radiologist, Centurion",
    text: "The referral intake router alone saved us 3 hours a day. We process referrals in minutes instead of chasing emails.",
    stat: "3hrs",
    statLabel: "saved daily",
    stars: 5,
    image: "/images/portrait-thabo.png",
  },
  {
    name: "Lisa V.",
    role: "Wellness Spa Manager, Rosebank",
    text: "Rebooking reminders brought back clients we hadn't seen in months. Our revenue is up 25% without spending more on ads.",
    stat: "25%",
    statLabel: "revenue increase",
    stars: 5,
    image: "/images/portrait-lisa.png",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

const quoteVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg
          key={i}
          className="w-4 h-4 text-[#3DA9D1]"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="relative w-full bg-gray-50/50 py-32 md:py-40 px-6 md:px-12 lg:px-24 overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-[#E0F2FE] rounded-full blur-[350px] opacity-30 pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20 md:mb-24"
        >
          <span className="text-xs tracking-[0.3em] uppercase text-[#1D8AB5] font-mono mb-5 block">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-light tracking-[-0.03em] text-gray-900 max-w-lg">
            What our clients say.
          </h2>
        </motion.div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-16" />

        {/* Testimonial cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              variants={cardVariants}
              className="group relative bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-lg hover:shadow-[#E0F2FE]/40 hover:-translate-y-0.5 transition-all duration-500"
            >
              {/* Decorative quote mark */}
              <motion.span
                variants={quoteVariants}
                className="absolute top-6 right-8 text-[#E0F2FE] text-8xl font-serif leading-none pointer-events-none select-none"
              >
                &ldquo;
              </motion.span>

              {/* Portrait */}
              <div className="relative w-16 h-16 rounded-full overflow-hidden mb-6 ring-2 ring-[#E0F2FE] ring-offset-2">
                <Image
                  src={t.image}
                  alt={t.name}
                  fill
                  className="object-cover"
                  placeholder="blur"
                  blurDataURL={blurPlaceholders[t.image.replace("/images/", "").replace(".png", "")]}
                />
              </div>

              {/* Star rating */}
              <div className="mb-4">
                <StarRating count={t.stars} />
              </div>

              {/* Quote */}
              <p className="relative z-10 text-gray-600 text-base font-light leading-relaxed italic mb-10">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Attribution */}
              <div className="relative z-10 pt-6 border-t border-gray-100">
                <div className="text-gray-900 font-medium text-sm">{t.name}</div>
                <div className="text-gray-400 text-xs font-mono tracking-wide mt-1">
                  {t.role}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
