import { motion } from 'framer-motion';

export default function PrivacyPolicyPage() {
  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="bg-white px-6 py-20 md:px-20">
      <motion.div
        initial="hidden"
        animate="show"
        variants={fadeIn}
        className="container mx-auto  text-gray-800"
      >
        <h1 className="mb-4 text-3xl font-bold">Privacy Policy</h1>

        <p className="mb-4">
          Your privacy is important to us. This Privacy Policy explains how we
          collect, use, and protect your information when you use our services.
        </p>

        <h2 className="mb-2 mt-6 text-xl font-semibold">
          1. Information We Collect
        </h2>
        <ul className="mb-4 list-inside list-disc">
          <li>Personal Information (name, email, etc.)</li>
          <li>Usage Data (pages visited, time spent, etc.)</li>
          <li>Cookies and tracking technologies</li>
        </ul>

        <h2 className="mb-2 mt-6 text-xl font-semibold">
          2. How We Use Your Information
        </h2>
        <p className="mb-4">
          We use your data to provide and improve our services, respond to
          inquiries, and for security purposes.
        </p>

        <h2 className="mb-2 mt-6 text-xl font-semibold">3. Sharing of Data</h2>
        <p className="mb-4">
          We do not sell your data. We may share data with service providers who
          help us operate our platform, under strict confidentiality agreements.
        </p>

        <h2 className="mb-2 mt-6 text-xl font-semibold">4. Data Security</h2>
        <p className="mb-4">
          We implement appropriate security measures to protect your
          information. However, no method of transmission over the internet is
          100% secure.
        </p>

        <h2 className="mb-2 mt-6 text-xl font-semibold">5. Your Rights</h2>
        <p className="mb-4">
          You can request access, correction, or deletion of your data at any
          time by contacting us.
        </p>

        <h2 className="mb-2 mt-6 text-xl font-semibold">
          6. Changes to This Policy
        </h2>
        <p className="mb-4">
          We may update this Privacy Policy from time to time. We encourage you
          to review it periodically.
        </p>

        <h2 className="mb-2 mt-6 text-xl font-semibold">7. Contact Us</h2>
        <p>
          If you have any questions about this policy, please contact us at{' '}
          <a href="mailto:contact@taskplanner.com" className="text-blue-500">
            contact@taskplanner.com
          </a>
          .
        </p>
      </motion.div>
    </div>
  );
}
