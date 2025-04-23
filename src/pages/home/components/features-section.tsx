import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useState } from 'react';
import hero from '@/assets/imges/home/hero.png';
import task from '@/assets/imges/home/task.png';
import notification from '@/assets/imges/home/notification.png';

export function FeaturesSection({ id }: { id: string }) {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      title: 'Task Boards & Lists',
      description:
        'Organize work your way with customizable task boards. Create projects, break them into tasks, and track progress visually.',
      image: hero
    },
    {
      title: 'Task Assignment & Deadlines',
      description:
        'Easily assign tasks to teammates or yourself. Set due dates, priorities, and never miss a deadline again.',
      image: task
    },

    {
      title: 'Smart Reminders & Notifications',
      description:
        'Stay on track with intelligent notifications that remind you of what matters most.',
      image: notification
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section id={id} className="bg-[#F9F9FB] py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="mb-16 text-left"
        >
          <h2 className="text-3xl font-bold text-taskplanner md:text-4xl">
            Your productivity powerhouse
          </h2>
          <p className=" mt-4 max-w-3xl font-semibold text-gray-600">
            Task Planner simplifies your daily workflow with a clean, intuitive
            interface and powerful productivity tools. It’s everything you need
            to manage tasks without feeling overwhelmed.
          </p>
        </motion.div>

        <div className="flex flex-col gap-8 md:flex-row">
          {/* Feature Cards */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="max-h-[600px] space-y-6 overflow-y-auto p-1 scrollbar-hide md:w-1/3"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={item}
                className={`cursor-pointer rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md ${activeFeature === index ? 'border-[#1876FB] ring-2 ring-[#1876FB]' : ''}`}
                onClick={() => setActiveFeature(index)}
              >
                <div className="flex items-start gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-taskplanner">
                      {feature.title}
                    </h3>
                    <p className="mt-1 text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Active Feature Content */}
          <div className="max-h-[480px] overflow-hidden rounded-xl border border-gray-200 bg-white p-8 shadow-sm md:w-2/3">
            <div className="space-y-4">
              {features[activeFeature].image && (
                <motion.div
                  key={activeFeature} // ensures remount for animation
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                  className="h-[410px] w-full"
                >
                  <img
                    src={features[activeFeature].image}
                    alt={`${features[activeFeature].title} preview`}
                    className="h-full w-full rounded-lg object-contain shadow-md"
                  />
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
