import { motion } from "framer-motion";

export  default function ProjectManagement ()  {
  return (
    <div className="bg-gray-100 min-h-screen">

  
    <div className="container  mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold mb-4"
        >
          Simple project management.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-xl text-gray-600 mb-8"
        >
          Turn scattered tasks into organized projects and hit deadlines without breaking a sweat.
        </motion.p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-taskplanner hover:bg-taskplanner text-white font-medium py-3 px-8 rounded-lg text-lg"
        >
          Get started free
        </motion.button>
      </section>

      {/* Features Section */}
      <section className="mb-20">
        <div className="flex flex-col md:flex-row items-center mb-16">
          <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
            <h2 className="text-3xl font-bold mb-4">Create projects with flexible building blocks</h2>
            <p className="text-gray-600 mb-6">
              Your projects (yes, even those tricky ones) will be up and running in a matter of minutes.
            </p>
            <p className="text-gray-600">
              Projects give you a space to plan out your goals and keep track of all areas of your work and life.
            </p>
          </div>
          <div className="md:w-1/2 bg-white p-6 rounded-lg shadow-md">
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 rounded-full border border-gray-300 mr-2"></div>
                <span>Do 30 minutes of yoga</span>
              </div>
              <div className="flex items-center mb-2 ml-8">
                <div className="w-6 h-6 rounded-full border border-gray-300 mr-2"></div>
                <span>Renew gym membership</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-gray-400 mr-2">+</span>
                <span className="font-medium">Fitness</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-400 mr-2">+</span>
                <span className="font-medium">Product Roadmap</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-400 mr-2">+</span>
                <span className="font-medium">Appointments</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <div className="text-2xl mb-4">✓</div>
            <h3 className="font-bold mb-2">Add tasks and sub-tasks</h3>
            <p className="text-gray-600">Break down your projects into manageable pieces.</p>
          </motion.div>
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <div className="text-2xl mb-4">✓</div>
            <h3 className="font-bold mb-2">Task descriptions</h3>
            <p className="text-gray-600">Add details and context to each task.</p>
          </motion.div>
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <div className="text-2xl mb-4">✓</div>
            <h3 className="font-bold mb-2">Project templates</h3>
            <p className="text-gray-600">Save time with ready-made templates.</p>
          </motion.div>
        </div>
      </section>

      {/* Views Section */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-12">Views that flow with your day</h2>
        <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
          "By using simple elements - like sections, sub-tasks, and flexible views - we can easily track progress and adapt our projects on the fly."
        </p>
        <p className="text-center font-medium mb-12">Michael K. - IT Ghostwriter</p>

        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <div className="flex space-x-4 mb-6">
            <button className="px-4 py-2 bg-gray-100 rounded-lg">List</button>
            <button className="px-4 py-2 rounded-lg">Calendar</button>
            <button className="px-4 py-2 rounded-lg">Board</button>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Product Roadmap</h3>
              <div className="flex space-x-2">
                <button className="text-gray-500">Share</button>
                <button className="text-gray-500">View</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-3">
                <h4 className="font-medium mb-2">Backlog</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-4 h-4 border border-gray-300 rounded mr-2"></div>
                    <span>Revamp productivity insights</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 border border-gray-300 rounded mr-2"></div>
                    <span>Conduct customer research</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 border border-gray-300 rounded mr-2"></div>
                    <span>Create initial spec</span>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-3">
                <h4 className="font-medium mb-2">In progress</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-4 h-4 border border-gray-300 rounded mr-2"></div>
                    <span>Team workspaces</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 border border-gray-300 rounded mr-2"></div>
                    <span>Task duration</span>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-3">
                <h4 className="font-medium mb-2">Done</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-4 h-4 border border-gray-300 rounded mr-2"></div>
                    <span>New branding</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Teamwork Section */}
      <section className="mb-20">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
            <h2 className="text-3xl font-bold mb-4">Assign clear owners, deadlines and instructions for each task</h2>
            <p className="text-gray-600 mb-6">
              Most projects aren't a one-person show. Gather everyone in one place and bask in the bliss of being on the same page.
            </p>
            <p className="text-gray-600">
              A shared workspace lets your team organize work together - alongside but separate from everyone's personal tasks and projects.
            </p>
          </div>
          <div className="md:w-1/2 bg-white p-6 rounded-lg shadow-md">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Team</h3>
                <button className="text-blue-500">+ New Team</button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <span>New Brand</span>
                  <span className="text-gray-500">3 members</span>
                </div>
                <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <span>Website Update</span>
                  <span className="text-gray-500">5 members</span>
                </div>
                <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <span>Product Roadmap</span>
                  <span className="text-gray-500">8 members</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-12">Take out the guesswork with grab-and-go templates</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <h3 className="font-bold text-xl mb-3">Project Tracker</h3>
            <p className="text-gray-600 mb-4">
              A central, organized place to keep track of every step in your project, from organizing your ideas to measuring results.
            </p>
            <button className="text-blue-500 font-medium">List</button>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <h3 className="font-bold text-xl mb-3">Event Planning</h3>
            <p className="text-gray-600 mb-4">
              Don't let any crucial event planning details slip through the cracks.
            </p>
            <button className="text-blue-500 font-medium">List</button>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <h3 className="font-bold text-xl mb-3">Product Launch</h3>
            <p className="text-gray-600 mb-4">
              Track everything you need to organize before officially launching.
            </p>
            <button className="text-blue-500 font-medium">List</button>
          </motion.div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="text-center">
        <h2 className="text-3xl font-bold mb-6">Loop it all together with integrations</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
          Todoist has 50+ integrations that'll make project management feel less like a hurricane and more like a breeze.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-bold mb-3">Simplify your work</h3>
            <p className="text-gray-600">Stay on top of all your work by...</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-bold mb-3">Tame your teamwork</h3>
            <p className="text-gray-600">Rein in the chaos by connecting...</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-bold mb-3">Most popular</h3>
            <p className="text-gray-600">The integrations our fellow...</p>
          </div>
        </div>
      </section>
    </div>
    </div>
  );
};

