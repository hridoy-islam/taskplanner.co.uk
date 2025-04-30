import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Planner() {
  const navigate = useNavigate()

  const handleRoutes =()=>{
    navigate('/signup')
  }
  return (
    <div className="bg-white">
    <div className="mx-auto container px-4 sm:px-6 lg:px-8">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-16 py-12 text-center"
      >
        <h1 className="mb-6 text-5xl font-bold text-gray-900 md:text-6xl">
          Task Planner
        </h1>
        <p className="mx-auto mb-8 text-xl text-gray-600 md:text-2xl md:leading-relaxed">
          Streamline your workflow, maintain focus, and achieve peak productivity.
          <br className="hidden md:block" />
          The ultimate planning solution for professionals who demand efficiency.
        </p>
        <div className="flex justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-lg bg-taskplanner px-8 py-3 font-semibold text-white shadow-lg hover:bg-taskplanner/90 transition-colors duration-300"
            onClick={handleRoutes}
          >
            Get Started
          </motion.button>
          
        </div>
      </motion.section>
  
      {/* Features Sections */}
      <div className="space-y-24">
        {/* Feature 1 */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col items-center gap-12 md:flex-row"
        >
          <div className="md:w-1/2">
            <div className="mb-4 flex items-center">
              <div className="mr-3 h-8 w-8 rounded-full bg-blue-100 p-1.5 text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Plan Anytime, Anywhere</h2>
            </div>
            <p className="text-lg text-gray-600 leading-relaxed">
              Maintain focus on what truly matters with our cloud-based solution. Task Planner Pro synchronizes seamlessly across all your devices, ensuring your schedule is always at your fingertips whether you're at your desk or on the move.
            </p>
            <ul className="mt-6 space-y-2">
              <li className="flex items-center">
                <svg className="mr-2 h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Real-time synchronization across devices
              </li>
              <li className="flex items-center">
                <svg className="mr-2 h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Offline mode for uninterrupted productivity
              </li>
              <li className="flex items-center">
                <svg className="mr-2 h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Military-grade encryption for your data
              </li>
            </ul>
          </div>
          <div className="w-full overflow-hidden rounded-xl shadow-2xl md:w-1/2">
            <img
              src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
              alt="Task Planner on multiple devices"
              className="h-full w-full object-cover"
            />
          </div>
        </motion.section>
  
        {/* Feature 2 */}
        <motion.section
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col items-center gap-12 md:flex-row-reverse"
        >
          <div className="md:w-1/2">
            <div className="mb-4 flex items-center">
              <div className="mr-3 h-8 w-8 rounded-full bg-blue-100 p-1.5 text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Smart Scheduling</h2>
            </div>
            <p className="text-lg text-gray-600 leading-relaxed">
              Our intelligent scheduling system integrates with your existing calendar tools to optimize your time management. Automatic conflict detection and smart suggestions help you maintain perfect workflow balance.
            </p>
            <div className="mt-6 rounded-lg bg-gray-50 p-4">
              <p className="font-medium text-gray-700">"Task Planner Pro reduced my scheduling conflicts by 80% and helped me reclaim 12 hours per week."</p>
              <p className="mt-2 text-gray-600">— Sarah Johnson, Marketing Director</p>
            </div>
          </div>
          <div className="w-full overflow-hidden rounded-xl shadow-2xl md:w-1/2">
            <img
              src="https://images.unsplash.com/photo-1579389083078-4e7018379f7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
              alt="Calendar integration"
              className="h-full w-full object-cover"
            />
          </div>
        </motion.section>
  
        {/* Feature 3 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="mx-auto max-w-3xl">
            <div className="inline-flex items-center justify-center rounded-full bg-blue-100 p-3">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="mt-4 text-2xl font-bold text-gray-900 md:text-3xl">Stay On Track</h3>
            <p className="mx-auto mt-4 text-lg text-gray-600 leading-relaxed">
              Our progress tracking and analytics help you maintain momentum. Visualize your productivity patterns, identify bottlenecks, and celebrate milestones with our achievement system.
            </p>
          </div>
        </motion.section>
  
        {/* Feature 4 */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col items-center gap-12 md:flex-row"
        >
          <div className="md:w-1/2">
            <div className="mb-4 flex items-center">
              <div className="mr-3 h-8 w-8 rounded-full bg-blue-100 p-1.5 text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Visual Organization</h2>
            </div>
            <p className="text-lg text-gray-600 leading-relaxed">
              Transform your workflow with our intuitive kanban-style interface. Drag-and-drop functionality makes reorganizing priorities effortless, while customizable views adapt to your preferred working style.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-gray-200 p-4">
                <h4 className="font-semibold text-gray-900">Custom Boards</h4>
                <p className="mt-1 text-sm text-gray-600">Tailor workspaces to your projects</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <h4 className="font-semibold text-gray-900">Priority Tags</h4>
                <p className="mt-1 text-sm text-gray-600">Color-code for instant recognition</p>
              </div>
            </div>
          </div>
          <div className="w-full overflow-hidden rounded-xl shadow-2xl md:w-1/2">
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
              alt="Visual organization interface"
              className="h-full w-full object-cover"
            />
          </div>
        </motion.section>
      </div>
  
      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        viewport={{ once: true }}
        className="my-24 rounded-2xl bg-taskplanner px-8 py-12 text-center shadow-xl"
      >
        <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">
          Transform Your Productivity Today
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-xl text-blue-100">
          Join thousands of professionals who have revolutionized their workflow with Task Planner Pro.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-lg bg-white px-8 py-4 font-semibold text-taskplanner shadow-lg hover:bg-gray-50 transition-colors duration-300"
          >
            Start 30-Day Free Trial
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-lg border-2 border-white px-8 py-4 font-semibold text-white hover:bg-white/10 transition-colors duration-300"
          >
            Schedule Demo
          </motion.button>
        </div>
        <p className="mt-4 text-sm text-blue-200">No credit card required • Cancel anytime</p>
      </motion.section>
    </div>
  </div>
  );
}
