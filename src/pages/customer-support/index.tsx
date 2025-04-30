import { motion } from "framer-motion";
import { MessageCircleQuestion, Headphones, ShieldCheck, HelpCircle } from "lucide-react";
import { useState } from "react";

export default function CustomerSupportPage() {
  const faqs = [
    {
      question: "How can I contact customer support?",
      answer: "You can reach us 24/7 via live chat, email, or phone support directly from your dashboard or this page."
    },
    {
      question: "What is the average response time?",
      answer: "Our average response time is under 1 hour during business hours. Weekend queries might take slightly longer."
    },
    {
      question: "Do you offer priority support?",
      answer: "Yes, premium members enjoy dedicated account managers and priority support services."
    },
    {
      question: "Where can I track my support requests?",
      answer: "All support tickets and updates are visible in your account's 'Support' section after logging in."
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Hero Section */}
      <section className="py-32 px-6 lg:px-12">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight text-gray-900 mb-8">
              We're Here to Support You
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10">
              Expert help, whenever you need it. Reach out to us 24/7 for fast and reliable assistance.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-6 bg-taskplanner hover:bg-taskplanner/90 text-white text-xl font-semibold py-4 px-12 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              Contact Support
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-28 px-6 lg:px-12 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-20">
            How We Help
          </h2>

          <div className="grid md:grid-cols-3 gap-16">
            {[
              {
                title: "Instant Chat Support",
                description: "Connect with our experts instantly through live chat for real-time help.",
                icon: <MessageCircleQuestion className="w-12 h-12 text-blue-500" />
              },
              {
                title: "24/7 Availability",
                description: "No matter the time zone or hour, we're ready to assist you.",
                icon: <Headphones className="w-12 h-12 text-green-500" />
              },
              {
                title: "Top-notch Security",
                description: "Your conversations are private and protected with top-grade security protocols.",
                icon: <ShieldCheck className="w-12 h-12 text-purple-500" />
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-3xl shadow-2xl p-10 text-center hover:shadow-3xl transition-all"
              >
                <div className="flex justify-center mb-8">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-lg text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-20">
            Frequently Asked Questions
          </h2>

          <div className="space-y-10">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="border-b border-gray-200 pb-8"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between items-center text-left"
                >
                  <div className="flex items-center">
                    <HelpCircle className="w-7 h-7 text-blue-600 mr-5" />
                    <h3 className="text-2xl font-semibold text-gray-800">{faq.question}</h3>
                  </div>
                  <span className="text-blue-600 text-4xl leading-none">
                    {openIndex === index ? "-" : "+"}
                  </span>
                </button>
                {openIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.4 }}
                    className="mt-6 text-gray-600 text-lg pl-12"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
