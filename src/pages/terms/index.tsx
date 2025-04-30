
import { motion } from 'framer-motion';

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function TermsAndConditions () {
  return (
    <section className="min-h-screen bg-white px-6 md:px-20 py-20 text-gray-800">
      <motion.div
        initial="hidden"
        animate="show"
        variants={fadeIn}
        className="container mx-auto"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
          Terms & Conditions
        </h1>
        <p className="text-lg text-gray-600 mb-10">
          Last updated: April 29, 2025
        </p>

        <div className="space-y-10 text-gray-700 text-base leading-relaxed">
          <div>
            <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing and using TaskPlanner, you accept and agree to be bound by the terms and
              provision of this agreement. If you do not agree to abide by the above, please do not use
              this service.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or
              software) on TaskPlanner's website for personal, non-commercial transitory viewing only.
              This is the grant of a license, not a transfer of title.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">3. Disclaimer</h2>
            <p>
              The materials on TaskPlanner's website are provided on an ‘as is’ basis. TaskPlanner makes
              no warranties, expressed or implied, and hereby disclaims and negates all other warranties.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">4. Limitations</h2>
            <p>
              In no event shall TaskPlanner or its suppliers be liable for any damages (including, without
              limitation, damages for loss of data or profit, or due to business interruption).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">5. Modifications</h2>
            <p>
              TaskPlanner may revise these terms of service at any time without notice. By using this
              website you are agreeing to be bound by the then current version of these Terms and
              Conditions.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">6. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of
              [Your Country/State] and you irrevocably submit to the exclusive jurisdiction of the courts
              in that location.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
};


