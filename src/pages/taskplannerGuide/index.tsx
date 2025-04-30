import { motion } from 'framer-motion';
import { Check, HelpCircle } from 'lucide-react';
import { useState } from 'react';

export default function TaskPlannerGuide() {
  const faqs = [
    {
      question: 'How can I contact customer support?',
      answer:
        'You can reach us 24/7 via live chat, email, or phone support directly from your dashboard or this page.'
    },
    {
      question: 'What is the average response time?',
      answer:
        'Our average response time is under 1 hour during business hours. Weekend queries might take slightly longer.'
    },
    {
      question: 'Do you offer priority support?',
      answer:
        'Yes, premium members enjoy dedicated account managers and priority support services.'
    },
    {
      question: 'Where can I track my support requests?',
      answer:
        "All support tickets and updates are visible in your account's 'Support' section after logging in."
    }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white px-6 py-32 lg:px-12">
      <div className="container mx-auto">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
            Task Planner Guide
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            A comprehensive guide to help you make the most of the Task Planner
            tool. Learn how to create, manage, and track tasks effectively.
          </p>
        </motion.div>

        {/* Steps Section */}
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="overflow-hidden rounded-2xl bg-white shadow-lg transition-shadow duration-300 hover:shadow-xl"
            >
              <div className="flex h-48 items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50">
                <img
                  src="https://images.unsplash.com/photo-1579389083078-4e7018379f7e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                  alt="Creating a task"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-8">
                <div className="mb-4 flex items-center">
                  <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                    1
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Create Tasks
                  </h3>
                </div>
                <p className="mb-4 text-gray-600">
                  Quickly create tasks with titles, detailed descriptions, and
                  due dates to keep everything organized from the start.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <Check className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span>Add clear task titles</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span>Include detailed descriptions</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span>Set realistic deadlines</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="overflow-hidden rounded-2xl bg-white shadow-lg transition-shadow duration-300 hover:shadow-xl"
            >
              <div className="flex h-48 items-center justify-center bg-gradient-to-r from-purple-50 to-pink-50">
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                  alt="Organizing tasks"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-8">
                <div className="mb-4 flex items-center">
                  <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 font-bold text-white">
                    2
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Organize Workflow
                  </h3>
                </div>
                <p className="mb-4 text-gray-600">
                  Categorize and prioritize tasks with our flexible system that
                  adapts to your team's workflow.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <Check className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span>Set priority levels</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span>Create custom categories</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span>Visual status tracking</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="overflow-hidden rounded-2xl bg-white shadow-lg transition-shadow duration-300 hover:shadow-xl"
            >
              <div className="flex h-48 items-center justify-center bg-gradient-to-r from-green-50 to-teal-50">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                  alt="Tracking progress"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-8">
                <div className="mb-4 flex items-center">
                  <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 font-bold text-white">
                    3
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Monitor Progress
                  </h3>
                </div>
                <p className="mb-4 text-gray-600">
                  Real-time progress tracking gives you visibility into team
                  productivity and task completion.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <Check className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span>Completion percentage</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span>Automated reminders</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span>Performance analytics</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="px-6 py-32 lg:px-12">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-20 text-center text-4xl font-bold text-gray-900 md:text-5xl">
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
                    className="flex w-full items-center justify-between text-left"
                  >
                    <div className="flex items-center">
                      <HelpCircle className="mr-5 h-7 w-7 text-blue-600" />
                      <h3 className="text-2xl font-semibold text-gray-800">
                        {faq.question}
                      </h3>
                    </div>
                    <span className="text-4xl leading-none text-blue-600">
                      {openIndex === index ? '-' : '+'}
                    </span>
                  </button>
                  {openIndex === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.4 }}
                      className="mt-6 pl-12 text-lg text-gray-600"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Support Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mt-32 text-center"
        >
          <h3 className="mb-6 text-3xl font-semibold text-gray-900">
            Need More Help? Contact Support
          </h3>
          <p className="mb-8 text-lg text-gray-600">
            If you're having trouble with the Task Planner, feel free to reach
            out to our support team for further assistance.
          </p>
          <a
            href="mailto:support@example.com"
            className="inline-block rounded-lg bg-taskplanner px-8 py-4 text-lg text-white hover:bg-taskplanner/90"
          >
            Contact Support
          </a>
        </motion.div>
      </div>
    </div>
  );
}
