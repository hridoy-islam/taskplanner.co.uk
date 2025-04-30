'use client';

import React from 'react';
import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const jobListings = [
  {
    title: 'Frontend Developer',
    location: 'Remote',
    type: 'Full-time',
    description: 'Build beautiful UIs with React and Tailwind CSS.',
  },
  {
    title: 'Backend Engineer',
    location: 'Remote',
    type: 'Full-time',
    description: 'Design scalable APIs and work with modern stacks like Node.js.',
  },
  {
    title: 'Product Designer',
    location: 'Remote',
    type: 'Contract',
    description: 'Create intuitive experiences and contribute to our design system.',
  },
];

export default function Careers() {
  return (
    <section className="min-h-screen px-6 md:px-20 py-20 bg-white text-gray-800">
      <motion.div
        initial="hidden"
        animate="show"
        variants={staggerContainer}
        className="container mx-auto"
      >
        <motion.h1
          variants={fadeInUp}
          className="text-4xl md:text-5xl font-bold text-center mb-6 text-gray-900"
        >
          Join Our Team
        </motion.h1>
        <motion.p
          variants={fadeInUp}
          className="text-lg md:text-xl text-center max-w-2xl mx-auto mb-16 text-gray-600"
        >
          At TaskPlanner, we’re on a mission to build a better way to work. Join us and help shape the
          future of productivity.
        </motion.p>

        <motion.div
          variants={fadeInUp}
          className="grid gap-10 md:grid-cols-2 lg:grid-cols-3"
        >
          {jobListings.map((job, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="p-6 bg-gray-50 rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition duration-300"
            >
              <h2 className="text-xl font-semibold mb-2 text-gray-800">{job.title}</h2>
              <p className="text-sm text-gray-500 mb-1">{job.location} • {job.type}</p>
              <p className="text-gray-600 mb-4">{job.description}</p>
              <button className="bg-taskplanner hover:bg-taskplanner/90 text-white px-4 py-2 rounded-md text-sm transition">
                Apply Now
              </button>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className="mt-20 text-center max-w-3xl mx-auto"
        >
          <h3 className="text-2xl font-semibold mb-4">Life at TaskPlanner</h3>
          <p className="text-lg text-gray-600">
            We’re a remote-first company built on trust, collaboration, and flexibility.
            Whether you’re a night owl or an early riser, we support your unique working style
            and value the impact you make.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
};


