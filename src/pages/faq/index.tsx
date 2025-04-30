import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { useState } from "react";


export default function FaqPage ()  {
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
    <div className="min-h-screen bg-white px-4 py-16">
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
};


