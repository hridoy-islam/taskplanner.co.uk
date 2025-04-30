

import { motion } from 'framer-motion';
import a from "@/assets/imges/home/u1.jpg"
import b from "@/assets/imges/home/u2.jpg"
import c from "@/assets/imges/home/u3.jpg"

export default function AutomationPage() {
  return (
    <div className="bg-[#f5f7fa] text-gray-900">
      {/* Hero Section */}
      <section className="flex min-h-screen flex-col items-center justify-center bg-taskplanner bg-cover bg-center px-6 text-center">
        <motion.h1
          className="text-5xl font-extrabold leading-tight text-white md:text-7xl"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Automate Repetitive Tasks to Save Time
        </motion.h1>
        <motion.p
          className="mt-6 max-w-3xl text-lg leading-relaxed text-white md:text-2xl"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Boost your productivity and focus on what truly matters by automating
          routine tasks in your workflow.
        </motion.p>
        <motion.button
          className="mt-10 rounded-2xl bg-white px-10 py-5 text-2xl font-bold text-taskplanner shadow-lg transition hover:bg-gray-100"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Get Started Today
        </motion.button>
      </section>

      {/* Benefits Section */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="mb-8 text-4xl font-bold md:text-5xl">Why Automate?</h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {[
              {
                title: 'Save Time',
                desc: 'Automating repetitive tasks frees up time for high-priority activities, allowing you to focus on what matters.'
              },
              {
                title: 'Reduce Errors',
                desc: 'Minimize human errors by relying on automated processes that perform tasks consistently and accurately.'
              },
              {
                title: 'Increase Productivity',
                desc: 'With time saved and errors reduced, productivity increases, allowing teams to work smarter, not harder.'
              }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                className="rounded-xl bg-white p-8 shadow transition hover:shadow-md"
                whileHover={{ scale: 1.05 }}
              >
                <h3 className="mb-4 text-2xl font-semibold">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-100 px-6 py-24">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="mb-8 text-4xl font-bold md:text-5xl">
            Features of Automation
          </h2>
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                feature: 'Time-Saving',
                desc: 'Automate repetitive tasks to save hours every week. Free up time to focus on what matters most.'
              },
              {
                feature: 'Increased Productivity',
                desc: 'By automating manual tasks, you improve consistency and boost productivity across your team.'
              },
              {
                feature: 'Reduced Errors',
                desc: 'Minimize the chances of human error by setting up automated processes that follow exact steps every time.'
              },
              {
                feature: 'Scalability',
                desc: 'Easily scale your workflows as your business grows, automating more tasks without extra effort.'
              },
              {
                feature: 'Seamless Integrations',
                desc: 'Integrate with your existing tools like Slack, Google Sheets, or your CRM system to automate data syncing.'
              },
              {
                feature: 'Analytics & Reporting',
                desc: 'Gain insights into your automated workflows and make data-driven decisions to improve efficiency.'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="rounded-xl bg-white p-8 shadow-lg transition-shadow hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
              >
                <h3 className="mb-4 text-2xl font-semibold">{item.feature}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-6 py-24">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="mb-12 text-4xl font-bold text-gray-800 md:text-5xl">
            Detailed Use Cases
          </h2>
          <div className="grid gap-16 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                useCase: 'Email Campaigns',
                desc: 'Automate your email marketing campaigns by setting up triggers based on user behavior or actions, allowing you to send targeted emails at scale.',
                steps: [
                  'Set up triggers (e.g., user clicks on a link)',
                  'Create email templates for different segments',
                  'Track user engagement',
                  'Automate follow-up sequences'
                ]
              },
              {
                useCase: 'Task Management',
                desc: 'Automate the task assignment process by integrating your task management system with triggers like task completion or project deadlines.',
                steps: [
                  'Set up triggers based on task completion',
                  'Auto-assign new tasks based on available team members',
                  'Create recurring task reminders',
                  'Generate weekly reports on task progress'
                ]
              }
              // Add more use cases as needed
            ].map((useCase, index) => (
              <motion.div
                key={index}
                className="transform rounded-lg bg-white p-8 shadow-xl transition-all hover:scale-105 hover:shadow-lg"
                whileHover={{ scale: 1.05 }}
              >
                <h3 className="mb-4 text-2xl font-semibold text-gray-800">
                  {useCase.useCase}
                </h3>
                <p className="mb-6 text-gray-600">{useCase.desc}</p>
                <h4 className="mb-3 text-lg font-semibold text-gray-800">
                  Steps to Automate:
                </h4>
                <ul className="list-disc space-y-2 pl-6 text-gray-600 ">
                  {useCase.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="text-sm text-left">
                      {step}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className=" px-6 py-24">
        <div className="container mx-auto text-center">
          <h2 className="mb-8 text-4xl font-bold text-taskplanner md:text-5xl">
            What Our Users Say
          </h2>
          <div className="flex flex-col gap-8 md:flex-row">
            {[
              {
                name: 'John Doe',
                company: 'Tech Innovators',
                feedback:
                  'Automating our task management process has saved us countless hours, and we can now focus on the core aspects of our business.',
                image: a
              },
              {
                name: 'Jane Smith',
                company: 'Marketing Solutions',
                feedback:
                  'The email campaign automation has boosted our engagement by 40%, and we no longer have to worry about manual follow-ups.',
                image: b
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center rounded-xl bg-white p-8 shadow-md transition-shadow hover:shadow-lg md:flex-row"
                whileHover={{ scale: 1.05 }}
              >
                <div className="mb-4 h-32 w-32 md:mb-0 md:mr-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                </div>
                <div className="text-left">
                  <p className="mb-4 text-lg text-gray-600">
                    "{testimonial.feedback}"
                  </p>
                  <h3 className="text-xl font-semibold">{testimonial.name}</h3>
                  <p className="text-gray-500">{testimonial.company}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="px-6 py-24  text-center text-taskplanner">
        <motion.h2
          className="mb-6 text-4xl font-bold md:text-5xl"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          Ready to Automate and Save Time?
        </motion.h2>
        <motion.p
          className="mb-10 text-lg md:text-xl"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Start today and streamline your processes with automation.
        </motion.p>
        <motion.button
          className="rounded-xl bg-white px-10 py-5 text-2xl font-bold text-taskplanner transition hover:bg-taskplanner hover:text-white"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Get Started Now
        </motion.button>
      </section>
    </div>
  );
}
