import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function HelpResources() {
  return (
    <div className="bg-white py-32 px-6 lg:px-12">
      <div className="container mx-auto">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Help & Resources
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our collection of resources to get the help you need. Whether you’re looking for guides, troubleshooting tips, or need to contact support, we’ve got you covered.
          </p>
        </motion.div>

        {/* Sections */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-16">
          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-white rounded-xl shadow-xl p-10"
          >
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">FAQs</h3>
            <p className="text-gray-600 mb-4">
              Find answers to the most frequently asked questions. 
            </p>
            <Link
              to="/faq"
              className="text-blue-500 hover:text-blue-700 text-lg font-semibold"
            >
              Browse FAQs
            </Link>
          </motion.div>

          {/* Guides Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-white rounded-xl shadow-xl p-10"
          >
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Guides</h3>
            <p className="text-gray-600 mb-4">
              Step-by-step tutorials to help you get started with our platform and explore advanced features.
            </p>
            <Link
              to="/guide"
              className="text-blue-500 hover:text-blue-700 text-lg font-semibold"
            >
              Explore Guides
            </Link>
          </motion.div>

          {/* Documentation Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="bg-white rounded-xl shadow-xl p-10"
          >
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Documentation</h3>
            <p className="text-gray-600 mb-4">
              Detailed documentation for developers and users, providing in-depth insights into all features and functionality.
            </p>
            <Link
              to="/guide"
              className="text-blue-500 hover:text-blue-700 text-lg font-semibold"
            >
              Read Documentation
            </Link>
          </motion.div>
        </div>

        {/* Contact Support Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mt-32 text-center"
        >
          <h3 className="text-3xl font-semibold text-gray-900 mb-6">
            Still Need Help? Contact Support
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            Our support team is available to assist you with any issues you may be facing. Feel free to reach out!
          </p>
          <a
            href="mailto:support@example.com"
            className="inline-block bg-taskplanner text-white text-lg px-8 py-4 rounded-lg hover:bg-taskplanner/90"
          >
            Contact Support
          </a>
        </motion.div>
      </div>
    </div>
  );
}
