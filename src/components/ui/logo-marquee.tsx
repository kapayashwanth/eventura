"use client";

import { motion } from "framer-motion";

const logos = [
  { src: "/logo.svg", alt: "Amrita Vishwa Vidyapeetham", scale: 1 },
  { src: "/logo2.png", alt: "Eventura", scale: 4 },
  { src: "/logo3.png", alt: "Partner", scale: 1 },
];

// Duplicate for seamless infinite scroll
const allLogos = [...logos, ...logos, ...logos, ...logos];

export function LogoMarquee() {
  return (
    <section className="relative w-full py-3 overflow-hidden bg-transparent">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-40 z-10 bg-gradient-to-r from-[#030303] to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-40 z-10 bg-gradient-to-l from-[#030303] to-transparent pointer-events-none" />

      <div className="text-center mb-2">
        <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-medium">
          In Collaboration With
        </p>
      </div>

      <motion.div
        className="flex items-center gap-8 sm:gap-10 md:gap-14 w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 20,
            ease: "linear",
          },
        }}
      >
        {allLogos.map((logo, i) => (
          <div
            key={i}
            className="flex-shrink-0 flex items-center justify-center opacity-60 hover:opacity-90 transition-all duration-500"
            style={{
              height: "42px",
              width: "180px",
              transform: logo.scale === 4 ? "scale(5)" : "scale(1)",
            }}
          >
            <img
              src={logo.src}
              alt={logo.alt}
              className="max-h-full max-w-full object-contain"
              draggable={false}
            />
          </div>
        ))}
      </motion.div>
    </section>
  );
}
