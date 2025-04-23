"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function HowItWorkSection({ id }: { id: string }) {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

  return (
    <section ref={sectionRef} id={id} className="py-24 bg-white overflow-hidden">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-[#00214C] text-3xl font-bold md:text-4xl">How TaskPlanner works</h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Simple, intuitive, and designed for the way you work. See how TaskPlanner helps teams move work forward.
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-gray-400 to-transparent" />
          </div>

          <div className="grid gap-16 md:grid-cols-2 md:gap-8 relative z-10">
            <motion.div style={{ y: y1, opacity }} className="flex flex-col justify-center space-y-6">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#1876FB] text-white font-bold">
                1
              </div>
              <h3 className="text-2xl font-bold text-[#00214C]">Create boards for any project</h3>
              <p className="text-gray-600">
                Start with a board, lists, and cards. Customize and expand with more features as your teamwork grows.
              </p>
              <Button className="w-fit group bg-[#00214C] hover:bg-[#0A3A7C]">
                Learn more
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>

            <motion.div style={{ y: y2 }} className="rounded-xl overflow-hidden shadow-lg">
              <img
                src="/placeholder.svg?height=500&width=561"
                alt="TaskPlanner Board"
                width={561}
                height={500}
                className="w-full h-auto"
              />
            </motion.div>
          </div>

          <div className="mt-24 grid gap-16 md:grid-cols-2 md:gap-8 relative z-10">
            <motion.div style={{ y: y2 }} className="rounded-xl overflow-hidden shadow-lg md:order-1 order-2">
              <img
                src="/placeholder.svg?height=575&width=475"
                alt="TaskPlanner Lists"
                width={475}
                height={575}
                className="w-full h-auto"
              />
            </motion.div>

            <motion.div
              style={{ y: y1, opacity }}
              className="flex flex-col justify-center space-y-6 md:order-2 order-1"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#1876FB] text-white font-bold">
                2
              </div>
              <h3 className="text-2xl font-bold text-[#00214C]">Organize tasks your way</h3>
              <p className="text-gray-600">
                Add details to cards, move them between lists as work progresses, and track every step of your project.
              </p>
              <Button className="w-fit group bg-[#00214C] hover:bg-[#0A3A7C]">
                Learn more
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
