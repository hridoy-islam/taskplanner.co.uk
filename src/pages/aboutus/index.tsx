
import { motion } from 'framer-motion';

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.3,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function AboutUs () {
  return (
    <section className="min-h-screen bg-white px-6 md:px-20 py-20 text-gray-800">
      <motion.div
        initial="hidden"
        animate="show"
        variants={container}
        className="container mx-auto"
      >
        <motion.h1
          variants={fadeUp}
          className="text-4xl md:text-5xl font-bold mb-6 text-center text-gray-900"
        >
          About TaskPlanner
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="text-lg md:text-xl text-gray-600 text-center max-w-3xl mx-auto mb-16"
        >
          At TaskPlanner, we believe productivity is not about working harder—but working smarter.
          We design tools that empower teams and individuals to plan, track, and execute work seamlessly.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="grid md:grid-cols-2 gap-10 text-lg md:text-xl leading-relaxed"
        >
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Our Mission</h2>
            <p>
              Our mission is to revolutionize the way people organize their work.
              By offering intuitive features and elegant design, TaskPlanner helps teams streamline workflows,
              reduce distractions, and stay aligned on goals—no matter the size of the project.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Our Vision</h2>
            <p>
              We envision a world where everyone has access to tools that unlock their full potential.
              Through constant innovation and user feedback, we strive to make TaskPlanner the go-to platform
              for productive minds across industries.
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="mt-20 flex flex-col md:flex-row items-center justify-between gap-10"
        >
          <div className="md:w-1/2">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Our Story</h2>
            <p className="text-lg md:text-xl leading-relaxed">
              TaskPlanner started with a simple idea: managing tasks should not be a task itself.
              Founded by a group of productivity enthusiasts and engineers, our journey began with solving
              our own project chaos. Today, TaskPlanner supports thousands of users across teams, startups,
              and enterprises who rely on our platform to keep work organized and efficient.
            </p>
          </div>
          <motion.img
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.4 }}
            className="md:w-1/2 w-full rounded-lg shadow-lg"
            src="https://img.freepik.com/premium-photo/visual-representation-time-management-matrix-with-tasks-categorized-by-urgency-importance-emphasizing-strategic-planning-prioritization-time-management_128711-33455.jpg?w=996"
            alt="Team working together"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};


