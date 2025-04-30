import React from 'react';
import { motion } from 'framer-motion';

import tp from "@/assets/imges/home/tp.png"
import reg from "@/assets/imges/home/reg.png"

// Define variants for animations
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

export default function ReminderPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <div className="w-full md:w-1/2 mb-8 md:mb-0">
            <motion.h1 variants={fadeIn} initial="initial" animate="animate" className="text-5xl font-bold mb-4">
              Smart Reminder System
            </motion.h1>
            <motion.p variants={fadeIn} initial="initial" animate="animate" className="text-2xl mb-6">
              Never miss important deadlines with our smart reminder system.
            </motion.p>
            <motion.p variants={fadeIn} initial="initial" animate="animate" className="mb-6">
              Stay organized and productive with reminders that adapt to your schedule.
            </motion.p>
            <motion.button variants={fadeIn} initial="initial" animate="animate" className="bg-transparent hover:bg-taskplanner text-taskplanner font-semibold hover:text-white py-2 px-4 border border-taskplanner hover:border-transparent rounded">
              Get started
            </motion.button>
          </div>
          <div className="w-full md:w-1/2">
            <img src={tp} alt="Smart Reminder System" className="w-full" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <motion.h2 variants={fadeIn} initial="initial" animate="animate" className="text-3xl font-bold mb-6 text-center">
            Key Features
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {/* Feature 1 */}
            <motion.div variants={stagger} initial="initial" animate="animate" className="bg-white shadow-md p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-2">Customizable Reminders</h3>
              <p className="text-gray-600">
                Set reminders for tasks, meetings, and deadlines with customizable notifications.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={stagger} initial="initial" animate="animate" className="bg-white shadow-md p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-2">Calendar Integration</h3>
              <p className="text-gray-600">
                Sync with your calendar to ensure all events are automatically reminded.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={stagger} initial="initial" animate="animate" className="bg-white shadow-md p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-2">Priority Alerts</h3>
              <p className="text-gray-600">
                Receive priority alerts for critical tasks to keep you on track.
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div variants={stagger} initial="initial" animate="animate" className="bg-white shadow-md p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-2">Mobile & Web Access</h3>
              <p className="text-gray-600">
                Access your reminders anytime, anywhere, from both mobile and web platforms.
              </p>
            </motion.div>

            {/* Feature 5 */}
            <motion.div variants={stagger} initial="initial" animate="animate" className="bg-white shadow-md p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-2">Silent Mode</h3>
              <p className="text-gray-600">
                Enable silent mode to avoid distractions during focused work sessions.
              </p>
            </motion.div>

            {/* Feature 6 */}
            <motion.div variants={stagger} initial="initial" animate="animate" className="bg-white shadow-md p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-2">Analytics & Insights</h3>
              <p className="text-gray-600">
                Track your productivity with detailed analytics and insights.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.h2 variants={fadeIn} initial="initial" animate="animate" className="text-3xl font-bold mb-6 text-center">
            How It Works
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          
            <motion.div variants={stagger} initial="initial" animate="animate" className="bg-white shadow-md p-6 rounded-lg text-center">
              <img src= {reg} alt="Step 1" className="mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Set Up Your Account</h3>
              <p className="text-gray-600">
                Create an account and connect your calendar.
              </p>
            </motion.div>

       
            <motion.div variants={stagger} initial="initial" animate="animate" className="bg-white shadow-md p-6 rounded-lg text-center">
              <img src="https://img.freepik.com/free-photo/alarm-clock-colorful-paper-reminders-blue-background-top-view_169016-34037.jpg?t=st=1745929246~exp=1745932846~hmac=916c9c70e04f32a38af4ffe36f254903d6123d7b21fdd511b27d56770b1e896d&w=996" alt="Step 2" className="mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Add Tasks & Deadlines</h3>
              <p className="text-gray-600">
                Input your tasks and set reminders for each one.
              </p>
            </motion.div>

       
            <motion.div variants={stagger} initial="initial" animate="animate" className="bg-white shadow-md p-6 rounded-lg text-center">
              <img src="https://img.freepik.com/free-vector/appointment-booking-concept-with-smartphone_23-2148557912.jpg?t=st=1745929310~exp=1745932910~hmac=33700fb2f8b598e6c1644018135e2791fb77c8620f4fa8272adb31ceae6e9971&w=996" alt="Step 3" className="mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Receive Notifications</h3>
              <p className="text-gray-600">
                Get timely reminders via email, SMS, or app notifications.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {/* <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <motion.h2 variants={fadeIn} initial="initial" animate="animate" className="text-3xl font-bold mb-6 text-center">
            What Our Users Say
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
         
            <motion.div variants={stagger} initial="initial" animate="animate" className="bg-white shadow-md p-6 text-center">
              <img src="https://img.freepik.com/premium-photo/smiling-businessman-png-sticker-transparent-background_53876-961196.jpg?w=826" alt="User 1" className="mx-auto mb-4 rounded-full" />
              <p className="text-gray-600">
                "This reminder system has completely transformed my productivity. I never miss a deadline now!"
              </p>
              <h3 className="text-xl font-bold mt-2">John Doe, CEO at XYZ Inc.</h3>
            </motion.div>

            <motion.div variants={stagger} initial="initial" animate="animate" className="bg-white shadow-md p-6  text-center">
              <img src="https://img.freepik.com/premium-photo/casual-young-man-shirt_146377-2992.jpg?w=826" alt="User 2" className="mx-auto mb-4 rounded-full" />
              <p className="text-gray-600">
                "The smart reminders are so intuitive and easy to use. Highly recommend!"
              </p>
              <h3 className="text-xl font-bold mt-2">Jane Smith, Freelance Designer</h3>
            </motion.div>

            <motion.div variants={stagger} initial="initial" animate="animate" className="bg-white shadow-md p-6  text-center">
              <img src="https://img.freepik.com/premium-photo/portrait-brunette-young-beautiful-successful-businesswoman-positive-smiling-camera_843459-200.jpg?w=996" alt="User 3" className="mx-auto mb-4 rounded-full" />
              <p className="text-gray-600">
                "No more last-minute scrambles. The system keeps me on track every day."
              </p>
              <h3 className="text-xl font-bold mt-2">Mark Johnson, Project Manager</h3>
            </motion.div>
          </div>
        </div>
      </section> */}

      {/* Call to Action Section */}
      <section className="py-20 bg-gray-100 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.h2 variants={fadeIn} initial="initial" animate="animate" className="text-3xl font-bold mb-6 text-taskplanner">
            Join the Smart Reminder Revolution!
          </motion.h2>
          <motion.p variants={fadeIn} initial="initial" animate="animate" className="text-lg mb-6 text-taskplanner">
            We're excited to introduce our smart reminder system, and we want your feedback to make it even better! Try it out, share your thoughts, and help us shape the future of planning.
          </motion.p>
          <motion.button variants={fadeIn} initial="initial" animate="animate" className="bg-transparent hover:bg-taskplanner text-taskplanner font-semibold hover:text-white py-2 px-4 border border-taskplanner hover:border-transparent rounded">
            Get started
          </motion.button>
        </div>
      </section>
    </div>
  );
}

