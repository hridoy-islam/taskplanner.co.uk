import React from 'react';
import { motion } from 'framer-motion';
import a from "@/assets/imges/home/u1.jpg"
import b from "@/assets/imges/home/u2.jpg"
import taskplanner from "@/assets/imges/home/task1.png"

export default function GroupProjectPage () {
  return (
    <div className="bg-gray-50  p-4">
      {/* Hero Section */}
      <section className="container mx-auto py-16 text-center">
        <h1 className="text-5xl font-bold mb-4">Team productivity, made simple</h1>
        <p className="text-xl mb-8">
          Keep track of your shared tasks, projects, and deadlines. Trusted by teams who have better things to do than overcomplicate it.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
          className="bg-taskplanner hover:bg-taskplanner text-white px-6 py-3 rounded-lg"
        >
          Start for free
        </motion.button>
        <p className="text-sm mt-2">Then US$6 per member/month billed yearly</p>
      </section>

      {/* Logos Section */}
      {/* <section className="max-w-6xl mx-auto py-16 grid grid-cols-5 gap-4">
        <img src="https://via.placeholder.com/150" alt="Logo 1" />
        <img src="https://via.placeholder.com/150" alt="Logo 2" />
        <img src="https://via.placeholder.com/150" alt="Logo 3" />
        <img src="https://via.placeholder.com/150" alt="Logo 4" />
        <img src="https://via.placeholder.com/150" alt="Logo 5" />
      </section> */}

      {/* Start Collaborating Section */}
      <section className="max-w-6xl mx-auto py-16 grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-3xl font-bold mb-4">Start collaborating in seconds</h2>
          <p className="mb-8">
            Simple enough for everyone on your team to quickly pick up, yet powerful enough to execute your team’s most ambitious plans.
          </p>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-green-100 p-4 rounded-lg">
              <span className="text-red-500">#</span> View, join and create projects in your team workspace to make sharing work easy. (You can make team projects private, too.)
            </div>
            <div className="bg-white p-4 rounded-lg">
              <span className="text-green-500">_ASSIGN_</span> Assign responsibility
            </div>
            <div className="bg-white p-4 rounded-lg">
              <span className="text-blue-500">_COMMENT_</span> Comment & share files
            </div>
          </div>
        </div>
        <div>
          <img src={taskplanner} alt="Collaboration UI" className="rounded-lg" />
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="max-w-6xl mx-auto py-16">
        <p className="text-xl mb-4">
          "By using simple elements - like sections, sub-tasks, and flexible views - we can easily track progress and adapt our projects on the fly."
        </p>
        <div className="flex items-center">
          <img src={a} alt="Profile Picture" className="w-10 h-10 rounded-full mr-4" />
          <div>
            <p className="font-bold">Michael K.</p>
            <p>IT Ghostwriter</p>
          </div>
        </div>
      </section>

      {/* Intuitively Organize Section */}
      <section className="max-w-6xl mx-auto py-16">
        <h2 className="text-3xl font-bold mb-4">Intuitively organize your team’s work</h2>
        <p className="mb-8">
          Give your team a shared place to collaborate and progress important projects – alongside but separate from their personal to-dos.
        </p>
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-green-100 p-4 rounded-lg">
            <span className="text-red-500">_CALENDAR_</span> Shared calendar layout (+ flexible views) let you work together, choosing between board, calendar or list to keep projects on track.
          </div>
          <div className="bg-white p-4 rounded-lg">
            <span className="text-green-500">_FOLDER_</span> Project folders
          </div>
          <div className="bg-white p-4 rounded-lg">
            <span className="text-blue-500">_TEMPLATE_</span> Custom and shared templates
          </div>
        </div>
      </section>

      {/* Another Testimonial Section */}
      <section className="max-w-6xl mx-auto py-16">
        <p className="text-xl mb-4">
          "Todoist gives us just what we need: a streamlined space to align on goals and next steps, without getting bogged down in complicated project management features."
        </p>
        <div className="flex items-center">
          <img src={b} alt="Profile Picture" className="w-10 h-10 rounded-full mr-4" />
          <div>
            <p className="font-bold">Michael M.</p>
            <p>Cyber Security startup</p>
          </div>
        </div>
      </section>

      {/* Discover Todoist Section */}
      <section className="max-w-6xl mx-auto py-16">
        <h2 className="text-3xl font-bold mb-4">Discover the power of Todoist for teams with our guided walkthrough</h2>
      </section>

      {/* Empowered People Section */}
      <section className="max-w-6xl mx-auto py-16 grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-3xl font-bold mb-4">Empowered people make an unstoppable team</h2>
          <p className="mb-8">
            Everything you and your team members need to handle all that work (and life) throws your way.
          </p>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-yellow-100 p-4 rounded-lg">
              <span className="text-red-500">_STAR_</span> Personal productivity features like task reminders and durations are included for both individual and team work when you upgrade to Business.
            </div>
            <div className="bg-white p-4 rounded-lg">
              <span className="text-green-500">_VIEW_</span> Holistic daily views
            </div>
            <div className="bg-white p-4 rounded-lg">
              <span className="text-blue-500">_GROUP_</span> Group or filter your tasks
            </div>
          </div>
        </div>
        <div>
          <img src={taskplanner} alt="Productivity UI" className="rounded-lg" />
        </div>
      </section>
    </div>
  );
};

