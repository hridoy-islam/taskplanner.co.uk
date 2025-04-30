'use client';

import { motion } from 'framer-motion';

export default function PersonalPage() {
  return (
    <div className="bg-gray-50 text-gray-900">
      {/* Hero Section */}
      <section className=" flex py-20 flex-col items-center justify-center px-6 text-center">
        <motion.h1
          className="text-5xl md:text-7xl font-extrabold  container"
          initial={{ opacity: 0, y: -60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Tools to organize your personal life  and daily routines
        </motion.h1>

        <motion.p
          className="mt-8 text-lg md:text-2xl container text-gray-600 leading-relaxed"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Stay ahead of your goals, manage habits efficiently, and bring structure to your daily life with ease.
        </motion.p>

        <motion.button
          className="mt-12 px-10 py-5 bg-taskplanner text-white rounded-2xl hover:bg-taskplanner/90 transition font-bold text-2xl shadow-lg"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
        >
          Get Started
        </motion.button>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">Why Choose Our Tools?</h2>
          <div className="grid gap-10 md:grid-cols-3 mt-10">
            {[
              {
                title: "Task Management",
                desc: "Easily organize and prioritize your daily tasks to stay productive.",
              },
              {
                title: "Habit Tracking",
                desc: "Build good habits and eliminate bad ones with visual progress tracking.",
              },
              {
                title: "Goal Setting",
                desc: "Set personal goals, track milestones, and celebrate your achievements.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-gray-100 p-8 rounded-xl shadow hover:shadow-md transition"
                whileHover={{ scale: 1.03 }}
              >
                <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 px-6 bg-taskplanner/5 ">
        <div className="max-w-5xl mx-auto text-center text-taskplanner">
          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-8"
            initial={{ opacity: 0, y: -40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Simplify Your Life
          </motion.h2>
          <motion.p
            className="text-lg md:text-xl text-taskplanner leading-relaxed "
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Our tools are designed for real people living real lives. Whether you're juggling work, school, family, or self-care, our system helps you stay on top of your personal goals and daily routines without overwhelm.
          </motion.p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6  text-gray-800 text-center">
        <motion.h2
          className="text-4xl md:text-5xl font-bold mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          Ready to take control?
        </motion.h2>
        <motion.p
          className="text-lg md:text-xl mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Join thousands who are already organizing their lives better.
        </motion.p>
        <motion.button
          className="px-8 py-4 bg-taskplanner text-white font-bold rounded-xl hover:bg-taskplanner/90 transition text-xl"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Start Now
        </motion.button>
      </section>
    </div>
  );
}
