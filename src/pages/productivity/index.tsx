'use client';

import React from 'react';
import { motion } from 'framer-motion';

const methods = [
  {
    title: 'Pomodoro Technique',
    description: 'Work in 25-minute focused sprints followed by 5-minute breaks. After 4 sprints, take a longer break.',
  },
  {
    title: 'Time Blocking',
    description: 'Allocate specific time slots for tasks and activities in your daily calendar.',
  },
  {
    title: 'Getting Things Done (GTD)',
    description: 'Capture all tasks and ideas, clarify next actions, and organize them into actionable steps.',
  },
  {
    title: 'Eisenhower Matrix',
    description: 'Prioritize tasks based on urgency and importance using a 4-quadrant system.',
  },
  {
    title: 'Eat That Frog',
    description: 'Start your day with the hardest, most important task to overcome procrastination.',
  },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function ProductivityMethods (){
  return (
    <section className="min-h-screen bg-white py-16 px-6 md:px-12">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Productivity Methods</h1>
        <p className="text-gray-600 text-base md:text-lg mb-12">
          Explore popular productivity frameworks to manage your time effectively.
        </p>
      </div>

      <motion.div
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {methods.map((method, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            className="bg-gray-100 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold mb-2">{method.title}</h3>
            <p className="text-gray-700 text-sm">{method.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};


