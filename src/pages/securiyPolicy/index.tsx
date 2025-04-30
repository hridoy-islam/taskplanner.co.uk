// components/pages/SecurityPolicyPage.tsx

import { motion } from 'framer-motion';

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function SecurityPolicyPage() {
  return (
    <div className="bg-white px-6 py-20 md:px-20">
      <motion.div
        initial="hidden"
        animate="show"
        variants={fadeIn}
        className="container mx-auto  text-gray-800"
      >
        <h1 className="mb-4 text-3xl font-bold">Security Policy</h1>

        <p className="mb-6">
          Protecting your data is of the utmost importance to us. This page
          outlines the security measures we take to keep your information safe.
        </p>

        <h2 className="mb-2 mt-6 text-xl font-semibold">1. Data Encryption</h2>
        <p className="mb-4">
          We use strong encryption protocols to secure your personal data both
          at rest and in transit. Our data encryption standards comply with the
          latest industry standards.
        </p>

        <h2 className="mb-2 mt-6 text-xl font-semibold">
          2. Secure Authentication
        </h2>
        <p className="mb-4">
          We utilize multi-factor authentication (MFA) to ensure that only
          authorized individuals can access sensitive data and accounts.
        </p>

        <h2 className="mb-2 mt-6 text-xl font-semibold">
          3. Regular Security Audits
        </h2>
        <p className="mb-4">
          We conduct regular security audits and penetration tests to ensure
          that our systems are free from vulnerabilities.
        </p>

        <h2 className="mb-2 mt-6 text-xl font-semibold">
          4. Data Backup & Recovery
        </h2>
        <p className="mb-4">
          We maintain regular backups of your data to prevent data loss and to
          ensure quick recovery in case of any unforeseen incidents.
        </p>

        <h2 className="mb-2 mt-6 text-xl font-semibold">5. Access Control</h2>
        <p className="mb-4">
          Access to your data is restricted to authorized personnel only. We
          implement role-based access control (RBAC) to ensure that only the
          necessary individuals have access to sensitive information.
        </p>

        <h2 className="mb-2 mt-6 text-xl font-semibold">
          6. Incident Response Plan
        </h2>
        <p className="mb-6">
          In the event of a security breach, we have a well-defined incident
          response plan in place to quickly assess and mitigate the situation.
        </p>

        <h2 className="mb-2 mt-6 text-xl font-semibold">
          7. Security Awareness Training
        </h2>
        <p className="mb-4">
          We provide ongoing security awareness training to all employees to
          ensure they understand the latest security risks and best practices.
        </p>

        <h2 className="mb-2 mt-6 text-xl font-semibold">8. Contact Us</h2>
        <p>
          If you have any questions about our security practices or need further
          information, feel free to contact us at{' '}
          <a href="mailto:support@yourdomain.com" className="text-blue-500">
            support@yourdomain.com
          </a>
          .
        </p>
      </motion.div>
    </div>
  );
}
