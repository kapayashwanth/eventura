"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Target, Rocket, Users, BookOpen, Lightbulb, Award, Star } from "lucide-react";
import { useRef } from "react";
import { ButtonColorful } from "./button-colorful";

const missions = [
  {
    icon: Target,
    title: "Centralized Information",
    description: "Provide a single platform where students can discover all campus events, eliminating the confusion of scattered announcements.",
  },
  {
    icon: Rocket,
    title: "Foster Innovation",
    description: "Encourage participation in hackathons and technical events that push the boundaries of creativity and problem-solving.",
  },
  {
    icon: Users,
    title: "Build Community",
    description: "Create a vibrant community of learners and innovators who support and inspire each other.",
  },
  {
    icon: BookOpen,
    title: "Continuous Learning",
    description: "Promote workshops and educational events that help students acquire new skills and stay updated with the latest technologies.",
  },
];

const values = [
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "Embracing new ideas and creative solutions",
  },
  {
    icon: Award,
    title: "Excellence",
    description: "Striving for quality in everything we do",
  },
  {
    icon: Star,
    title: "Inclusivity",
    description: "Creating opportunities accessible to all",
  },
];

function FloatingOrb({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay }}
      className={`absolute ${className}`}
    >
      <motion.div
        animate={{
          y: [0, -20, 0],
          x: [0, 10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="w-32 h-32 md:w-64 md:h-64 rounded-full bg-gradient-to-r from-indigo-500/10 to-rose-500/10 blur-3xl"
      />
    </motion.div>
  );
}

export function AboutUs() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full bg-[#030303] py-12 md:py-20 lg:py-32 overflow-hidden"
      id="about"
    >
      {/* Floating Orbs Background */}
      <FloatingOrb className="top-20 left-10" delay={0.2} />
      <FloatingOrb className="bottom-40 right-20" delay={0.4} />
      <FloatingOrb className="top-1/2 left-1/3" delay={0.6} />

      <motion.div style={{ opacity }} className="relative z-10 container mx-auto px-4 md:px-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 md:mb-24"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, type: "spring" }}
            className="inline-block mb-6"
          >
            <span className="px-4 py-2 rounded-full bg-white/[0.05] backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium shadow-[0_4px_16px_0_rgba(255,255,255,0.1)]">
              About Us
            </span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
              Empowering innovation
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300">
              and learning
            </span>
          </h2>

          <p className="text-base md:text-lg lg:text-xl text-white/50 max-w-3xl mx-auto px-4">
            at Amrita Vishwa Vidyapeetham, Nagercoil Campus
          </p>
        </motion.div>

        {/* Who We Are */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto mb-20 md:mb-32"
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-3xl blur-xl group-hover:from-white/15 group-hover:via-white/10 transition-all duration-500" />
            <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/20 group-hover:border-white/30 rounded-3xl p-6 md:p-8 lg:p-12 shadow-[0_8px_32px_0_rgba(255,255,255,0.05)] group-hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] transition-all duration-500">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-rose-300">
                Who We Are
              </h3>
              <p className="text-white/70 text-base md:text-lg leading-relaxed mb-4">
                We are a dedicated team of students from Amrita Vishwa Vidyapeetham, Nagercoil Campus, passionate about creating opportunities for innovation, learning, and collaboration.
              </p>
              <p className="text-white/70 text-base md:text-lg leading-relaxed">
                This platform was developed by students, for students, to ensure that no one misses out on the incredible hackathons, workshops, tech talks, and events happening on our campus. We believe that every event is an opportunity to learn, grow, and connect with like-minded individuals.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Our Mission */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20 md:mb-32"
        >
          <div className="text-center mb-12 md:mb-16">
            <h3 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
              Our Mission
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8 max-w-6xl mx-auto">
            {missions.map((mission, index) => (
              <motion.div
                key={mission.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-2xl blur-xl group-hover:from-white/15 group-hover:via-white/10 transition-all duration-500" />
                <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/20 group-hover:border-white/30 rounded-2xl p-5 md:p-6 lg:p-8 shadow-[0_8px_32px_0_rgba(255,255,255,0.05)] group-hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] transition-all duration-500">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm flex items-center justify-center mb-3 md:mb-4 shadow-[inset_0_2px_8px_rgba(255,255,255,0.1)]"
                  >
                    <mission.icon className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-white/90" />
                  </motion.div>
                  <h4 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 md:mb-3 text-white">
                    {mission.title}
                  </h4>
                  <p className="text-white/60 text-sm md:text-base leading-relaxed">
                    {mission.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Our Values */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20 md:mb-32"
        >
          <div className="text-center mb-12 md:mb-16">
            <h3 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
              Our Values
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                whileHover={{ scale: 1.05 }}
                className="group relative h-full"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-2xl blur-xl group-hover:from-white/15 group-hover:via-white/10 transition-all duration-500" />
                <div className="relative h-full bg-white/[0.03] backdrop-blur-md border border-white/20 group-hover:border-white/30 rounded-2xl p-6 md:p-8 text-center transition-all duration-500 shadow-[0_8px_32px_0_rgba(255,255,255,0.05)] group-hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]">
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 15 }}
                    transition={{ duration: 0.3 }}
                    className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-[inset_0_2px_8px_rgba(255,255,255,0.1)]"
                  >
                    <value.icon className="w-7 h-7 md:w-8 md:h-8 text-white/90" />
                  </motion.div>
                  <h4 className="text-xl md:text-2xl font-bold mb-2 text-white">
                    {value.title}
                  </h4>
                  <p className="text-white/60 text-sm md:text-base">
                    {value.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="relative group max-w-3xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-3xl blur-2xl group-hover:from-white/15 group-hover:via-white/10 transition-all duration-500" />
            <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/20 group-hover:border-white/30 rounded-3xl p-8 md:p-12 lg:p-16 shadow-[0_8px_32px_0_rgba(255,255,255,0.05)] group-hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] transition-all duration-500">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white to-rose-300">
                Join Our Innovation Community
              </h3>
              <p className="text-white/70 text-base md:text-lg mb-6 md:mb-8">
                Have questions or want to collaborate? We'd love to hear from you!
              </p>
              <ButtonColorful
                label="Get In Touch"
                className="px-6 md:px-8"
              />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030303] via-transparent to-[#030303] pointer-events-none" />
    </section>
  );
}
