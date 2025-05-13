import { motion } from "framer-motion";

 export default function TaskManagementPage () {
  return (
    <div className="bg-white">

  
    <div className="container mx-auto  py-8">

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-16 flex flex-col md:flex-row items-center gap-12"
      >
        <div className="md:w-1/2">
          <h1 className="text-5xl font-bold text-gray-800 mb-6 leading-tight">
          Effective Team Management for Modern Workspaces
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Capture all those tasks in Todoist and feel an instant sense of clarity and control.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-taskplanner hover:bg-taskplanner  text-white font-medium py-3 px-8 rounded-lg"
            >
              Start for free
            </motion.button>
            
          </div>
        </div>
        <div className="md:w-1/2  h-80 bg-gray-100  rounded-xl object-cover"><img src="https://img.freepik.com/free-vector/timing-project-scheduling_74855-4584.jpg?t=st=1745929588~exp=1745933188~hmac=fd1788e9e7d6764846ff5258794caf8d5a5626a2b5bdbeca1d90fbb41a34f05b&w=1060" className="object-cover" /></div>
      </motion.section>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
      >
        <div className="border-l-4 border-taskplanner pl-4">
          <p className="text-lg italic mb-2">"Simple, straightforward, and super powerful"</p>
          <p className="font-medium">THE VERGE</p>
        </div>
        <div className="border-l-4 border-taskplanner pl-4">
          <p className="text-lg italic mb-2">"Nothing short of stellar"</p>
          <p className="font-medium">MAG</p>
        </div>
        <div className="border-l-4 border-taskplanner pl-4">
          <p className="text-lg italic mb-2">"The best to-do list app on the market"</p>
          <p className="font-medium">TECH RADAR</p>
        </div>
      </motion.div>

      {/* Features Sections */}
      <div className="space-y-24 mb-16">
        {/* Feature 1 */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row gap-12 items-center"
        >
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Quick thoughts instantly become organized tasks</h2>
            <p className="text-gray-600 mb-6">
              Input tasks in plain English and watch Todoist automatically categorize, label, and schedule them.
            </p>
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <p className="font-medium">Call Alex Wednesday at 10am</p>
            </div>
            <p className="text-gray-600">
              <span className="font-medium">Quick Add</span> will quickly become your superpower. Capture and organize tasks the moment they come to you with easy-flowing, natural language.
            </p>
          </div>
          <div className="md:w-1/2  h-80 bg-gray-100  rounded-xl object-cover"><img src="https://img.freepik.com/free-vector/flat-time-management-concept-illustration_52683-55532.jpg?t=st=1745929692~exp=1745933292~hmac=f41faa13aaf106eb221e72f46413ca1c51bdcc72c78597b961e1d5a2739693f0&w=996" className="object-cover" /></div>
          </motion.section>

        {/* Feature 2 */}
        <motion.section
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row-reverse gap-12 items-center"
        >
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Schedule it once, remember it forever</h2>
            <p className="text-gray-600 mb-6">
              From monthly work reports to weekly grocery runs, Todoist will remind you at exactly the right time.
            </p>
            <p className="text-gray-600 mb-8">
              Recurring due dates like no other. Todoist's unrivaled date recognition helps you build habits and keep tabs on even the trickiest of deadlines.
            </p>
            <div className="flex flex-wrap gap-4">
              <span className="bg-gray-100 px-4 py-2 rounded-full text-sm">Reminders</span>
              <span className="bg-gray-100 px-4 py-2 rounded-full text-sm">Location reminders</span>
              <span className="bg-gray-100 px-4 py-2 rounded-full text-sm">Daily digest</span>
            </div>
          </div>
          <div className="md:w-1/2  h-80 bg-gray-100  rounded-xl object-cover"><img src="https://img.freepik.com/free-vector/flat-time-management-concept-illustration_52683-55532.jpg?t=st=1745929692~exp=1745933292~hmac=f41faa13aaf106eb221e72f46413ca1c51bdcc72c78597b961e1d5a2739693f0&w=996" className="object-cover" /></div>
        </motion.section>



        {/* Feature 3 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Capture tasks wherever you are</h2>
          <p className="text-gray-600 max-w-3xl mx-auto mb-8">
            Review tasks on your phone, add them from your laptop, complete them from your watch. Then see it all sync in real-time.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {['Desktop', 'Android', 'iOS', 'Wearables', 'Browser extensions', 'Email add-ons'].map((platform) => (
              <motion.div
                key={platform}
                whileHover={{ y: -5 }}
                className="bg-gray-100 px-6 py-4 rounded-lg"
              >
                {platform}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Feature 4 */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row gap-12 items-center"
        >
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Focus on the right tasks at the right time</h2>
            <p className="text-gray-600 mb-6">
              Switch views with a single tap and see today's priorities, project deadlines, upcoming work, or custom filtered views.
            </p>
            <p className="text-gray-600 mb-8">
              Group or filter your tasks by personal and/or team projects to separate work and life, or get an overview of both. You decide.
            </p>
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Today</span>
                <div className="flex gap-2">
                  <span className="text-sm bg-gray-200 px-2 py-1 rounded">Default</span>
                  <span className="text-sm bg-gray-200 px-2 py-1 rounded">All</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>Create sales deck</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>All-hands meeting</span>
                </div>
              </div>
            </div>
          </div>
          <div className="md:w-1/2  h-80 bg-gray-100  rounded-xl object-cover"><img src="https://img.freepik.com/free-vector/hand-drawn-business-planning-concept_23-2149167950.jpg?t=st=1745929858~exp=1745933458~hmac=fb4687b6a52b789bc2a1d1f9dfeaef1c5ed7b4c0171233b6d968cc77d6992095&w=996" className="object-cover" /></div>
        </motion.section>
      </div>

      {/* Final CTA */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="text-center py-16"
      >
        <h2 className="text-4xl font-bold text-gray-800 mb-6">Your trusted task manager</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Discover how to transform chaos into clarity with Todoist
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-taskplanner hover:bg-taskplanner text-white font-medium py-3 px-8 rounded-lg"
        >
          Start for free
        </motion.button>
      </motion.section>
    </div>
    </div>
  );
};

