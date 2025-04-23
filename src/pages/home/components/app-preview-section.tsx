"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import task1 from '@/assets/imges/home/task1.png'
import appleLogo from '../../../assets/imges/home/apple_logo.png';
import playstoreLogo from '../../../assets/imges/home/playstore_logo.png';


export function AppPreviewSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1])
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1])

  return (
    <section ref={sectionRef} className="py-24 bg-[#F9F9FB] overflow-hidden">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between lg:gap-16">
          <motion.div style={{ scale, opacity }} className="flex justify-center md:w-1/2">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#1876FB] to-[#9C4DF4] opacity-20 blur-xl rounded-full" />
              <img
                src={task1}
                alt="Taskplanner"
                width={700}
                height={380}
                className="relative z-10 shadow-xl"
              />

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                viewport={{ once: true }}
                className="absolute -left-16 top-1/4 bg-white p-4 rounded-lg shadow-lg z-20"
              >
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-sm font-medium">Task completed</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                viewport={{ once: true }}
                className="absolute -right-16 top-2/3 bg-white p-4 rounded-lg shadow-lg z-20"
              >
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <span className="text-sm font-medium">New comment</span>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="mt-16 md:mt-0 md:w-1/2 space-y-8"
          >
            <h2 className="text-taskplanner text-3xl font-bold leading-tight md:text-4xl">
              Organize your work easily with TaskPlanner
            </h2>
            <p className="text-gray-600 text-lg">
            Task Planner is built for anyone who wants to stay organized:
            
            </p>

            <div className="space-y-6">
              {[
                "Assign, delegate, and track team-wide tasks from one dashboard",
                "Manage multiple clients or projects",
                "Track assignments and deadlines with ease",
                "Plan chores, groceries, or weekly routines",
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3"
                >
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#1876FB] flex items-center justify-center">
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-gray-700">{feature}</p>
                </motion.div>
              ))}
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-medium text-[#00214C]">Get the app</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="h-16 bg-taskplanner hover:bg-taskplanner/90 text-white">
                  <img
                    src={appleLogo}
                    alt="App Store"
                    width={20}
                    height={24}
                    className="mr-2"
                  />
                  <div className="border-r-1 mx-4 h-10 border border-[#0e3261]"></div>
                  <div className="flex flex-col items-start">
                    <p className="font-normal">Download on the</p>
                    <p className="font-bold">App Store</p>
                  </div>
                </Button>
                <Button className="h-16 bg-taskplanner hover:bg-taskplanner/90 text-white">
                  <img
                    src={playstoreLogo}
                    alt="Google Play"
                    width={20}
                    height={24}
                    className="mr-2"
                  />
                  <div className="border-r-1 mx-4 h-10 border border-[#0e3261]"></div>
                  <div className="flex flex-col items-start">
                    <p className="font-normal">Get it on</p>
                    <p className="font-bold">Google Play</p>
                  </div>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
