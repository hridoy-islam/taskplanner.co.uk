import { motion } from "framer-motion";
import { BookA, BookOpen, Laptop } from "lucide-react";

export default function EducationPage() {
  return (
    <div className="bg-gradient-to-b from-white via-gray-50 to-white min-h-screen py-32 px-6 lg:px-12">
      <div className="container mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-24"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-8">
            Specialized Tools for Students and Educators
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10">
            Empowering education with the latest tools, resources, and features for an enhanced learning experience.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-taskplanner text-white text-xl font-semibold py-4 px-12 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300"
          >
            Explore Our Tools
          </motion.button>
        </motion.div>

        {/* Features Section */}
        <section className="mb-32">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-20">
            Powerful Features for Learning
          </h2>
          <div className="grid md:grid-cols-3 gap-16">
            {[
              {
                title: "Interactive Learning",
                description:
                  "Engage students with real-time interactive lessons, quizzes, and assignments.",
                icon: <BookA className="w-12 h-12 text-blue-500" />
              },
              {
                title: "Resource Library",
                description:
                  "Access thousands of curated resources, articles, and study materials to enhance learning.",
                icon: <BookOpen className="w-12 h-12 text-green-500" />
              },
              {
                title: "Remote Learning Tools",
                description:
                  "Facilitate online classes with virtual classrooms, video conferencing, and collaborative tools.",
                icon: <Laptop className="w-12 h-12 text-purple-500" />
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
                <div className="flex justify-center mb-8">{item.icon}</div>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-lg text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="bg-gray-50 py-32">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-16">
            What Educators Are Saying
          </h2>
          <div className="grid md:grid-cols-2 gap-16">
            {[
              {
                testimonial:
                  "These tools have transformed how we teach and interact with our students. The ability to collaborate and give real-time feedback is invaluable.",
                name: "John Doe",
                role: "High School Teacher"
              },
              {
                testimonial:
                  "As a student, having access to an extensive library of resources has made my learning more engaging and effective. It's a game-changer.",
                name: "Jane Smith",
                role: "University Student"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="bg-white rounded-xl p-8 shadow-xl"
              >
                <p className="text-lg text-gray-600 italic mb-6">"{item.testimonial}"</p>
                <p className="text-xl font-semibold text-gray-900">{item.name}</p>
                <p className="text-md text-gray-500">{item.role}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-24">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Ready to Empower Your Learning?
            </h2>
            <p className="text-xl text-gray-600 mb-12">
              Start using our specialized tools today and take your learning experience to the next level.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-taskplanner text-white text-xl font-semibold py-4 px-12 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              Get Started Now
            </motion.button>
          </div>
        </section>
      </div>
    </div>
  );
}
