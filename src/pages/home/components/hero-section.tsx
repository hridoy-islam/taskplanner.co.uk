'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import hero from '@/assets/imges/home/hero.png';

export function HeroSection() {
  return (
    <section className="relative z-0 overflow-hidden bg-gradient-to-b from-[#00214C] to-[#0A3A7C] pb-20 pt-32 md:pb-32 md:pt-40">
  <div className="bg-grid-white/[0.05] absolute inset-0 bg-[size:16px]" />

  <div className="container relative z-10 flex flex-col-reverse items-center gap-12 md:flex-row md:items-start">
    {/* TEXT CONTENT */}
    <div className="max-w-2xl space-y-8 flex-1 text-left">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-2xl font-bold text-white sm:text-2xl md:text-3xl lg:text-5xl"
      >
        Capture, organize, and tackle your to-dos from anywhere.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="max-w-[700px] text-lg text-gray-300 md:text-xl"
      >
        Escape the clutter and chaos—unleash your productivity with TaskPlanner.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="flex max-w-md flex-col items-start gap-4 sm:flex-row"
      >
        <Input
          placeholder="Email"
          type="email"
          className="h-12 w-full border-white/20 bg-white/10 text-white placeholder:text-gray-400"
        />
        <Button
          size="lg"
          className="bg-taskplanner hover:bg-taskplanner h-12 text-white"
        >
          Sign up - it&apos;s free!
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.6 }}
      >
        <Link
          to="#watch-video"
          className="inline-flex items-center text-white transition-colors hover:text-gray-300"
        >
          <Play size={16} className="mr-2" />
          Watch video
        </Link>
      </motion.div>
    </div>

    {/* IMAGE ON THE RIGHT */}
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1, delay: 0.3 }}
      className="relative flex-1 max-w-xl"
    >
      <div className="relative z-10 overflow-hidden rounded-xl shadow-2xl">
        <img
          src={hero}
          alt="TaskPlanner Dashboard"
          width={1200}
          height={600}
          className="w-full"
        />
      </div>

      {/* Decorative elements */}
      <div className="absolute -bottom-10 -left-10 h-40 w-40 rotate-12 rounded-lg bg-[#FF9F1C] opacity-70 blur-sm" />
      <div className="bg-taskplanner absolute -right-10 -top-10 h-40 w-40 -rotate-12 rounded-lg opacity-70 blur-sm" />
    </motion.div>
  </div>
</section>

  );
}
