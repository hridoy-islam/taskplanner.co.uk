
import { motion } from 'framer-motion';
import { PricingSection } from '../home/components/pricing-section';

export default function MarketingAndSalesPage() {
  return (
    <div className="bg-white text-gray-900">
      
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-gradient-to-b from-[#00214C] to-[#0A3A7C]  text-white">
        <motion.h1
          className="text-5xl md:text-7xl font-extrabold leading-tight"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Empower Your Growth
        </motion.h1>
        <motion.p
          className="mt-6 text-lg md:text-2xl max-w-3xl leading-relaxed"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Modern tools to boost your marketing, streamline sales, and scale your business smarter and faster.
        </motion.p>
        <motion.button
          className="mt-10 px-10 py-5 bg-white text-taskplanner font-bold rounded-2xl hover:bg-gray-100 transition text-2xl shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Get Started Today
        </motion.button>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">Features Built for Results</h2>
          <div className="grid gap-10 md:grid-cols-3 mt-12">
            {[
              {
                title: "Automated Campaigns",
                desc: "Reach your customers effortlessly with smart, personalized campaigns.",
              },
              {
                title: "Lead Management",
                desc: "Capture, nurture, and convert leads into loyal customers easily.",
              },
              {
                title: "Analytics & Insights",
                desc: "Understand what works with powerful analytics and actionable insights.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white p-8 rounded-xl shadow hover:shadow-md transition"
                whileHover={{ scale: 1.05 }}
              >
                <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-16">Trusted by Businesses Worldwide</h2>
          <div className="grid gap-12 md:grid-cols-2">
            {[
              {
                name: "Sarah L.",
                feedback: "This platform tripled our leads in just three months. The automation is a game changer!",
              },
              {
                name: "David K.",
                feedback: "We closed deals faster and understood our customers better than ever before. Highly recommend!",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-gray-100 p-8 rounded-xl shadow-md"
                whileHover={{ scale: 1.02 }}
              >
                <p className="text-gray-700 text-lg mb-4">"{testimonial.feedback}"</p>
                <h4 className="text-xl font-bold">{testimonial.name}</h4>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-6 ">
       <PricingSection />
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-6 bg-gray-100 text-gray-800 text-center">
        <motion.h2
          className="text-4xl md:text-5xl font-bold mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          Ready to Boost Your Business?
        </motion.h2>
        <motion.p
          className="text-lg md:text-xl mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Start today and unlock your growth potential.
        </motion.p>
        <motion.button
          className="px-10 py-5 bg-white text-taskplanner font-bold rounded-xl hover:bg-taskplanner hover:text-white transition text-2xl"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Get Started Now
        </motion.button>
      </section>

    </div>
  );
}
