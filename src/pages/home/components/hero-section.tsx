import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import hero from '@/assets/imges/home/hero.png';

export function HeroSection() {
  const navigate = useNavigate()
  const handleRoute=()=>{
    navigate('/signup')
  }
  return (
    <section className="relative z-0 overflow-hidden bg-gradient-to-b from-[#00214C] to-[#0A3A7C] pb-20 pt-32 md:pb-32 md:pt-40">
      <div className="bg-grid-white/[0.05] absolute inset-0 bg-[size:16px]" />

      <div className="container relative z-10 flex flex-col items-center justify-center gap-12 text-center">
        {/* TEXT CONTENT */}
        <div className=" flex flex-col items-center justify-center space-y-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-2xl font-bold text-white sm:text-2xl md:text-3xl lg:text-6xl"
          >
            Capture, organize, and tackle your to-dos from anywhere.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="max-w-[700px] text-lg text-gray-300 md:text-xl"
          >
            Escape the clutter and chaos—unleash your productivity with
            TaskPlanner.
          </motion.p>

          {/* Centering the button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex w-full items-center justify-center"
          >
            <Button
              size="lg"
              className="h-12 bg-[#1173FF] text-white shadow-lg hover:bg-[#1173FF]/80"
              onClick={handleRoute}
            >
              Sign up - it&apos;s free!
            </Button>
          </motion.div>
        </div>

        {/* IMAGE BELOW TEXT */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative max-w-4xl"
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
          <div className="absolute -right-10 -top-10 h-40 w-40 -rotate-12 rounded-lg bg-taskplanner opacity-70 blur-sm" />
        </motion.div>
      </div>
    </section>
  );
}
