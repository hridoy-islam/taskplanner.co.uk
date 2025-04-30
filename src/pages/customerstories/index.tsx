import { motion } from "framer-motion";
import a from "@/assets/imges/home/u1.jpg"
import b from "@/assets/imges/home/u2.jpg"
import c from "@/assets/imges/home/u3.jpg"

export default function CustomerStories() {
  return (
    <div className="bg-white py-32 px-6 lg:px-12">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-24"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
            Hear From Our Customers
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover how our tools have helped businesses, students, and educators succeed in their fields. Here are some stories from those who have made the most of our services.
          </p>
        </motion.div>

        {/* Customer Stories Grid */}
        <div className="grid md:grid-cols-3 gap-16">
          {[
            {
              name: "Michael James",
              role: "Entrepreneur",
              story:
                "Using these tools, I was able to organize my business tasks and streamline communication with my team, all in one place. It's a game-changer!",
              image: a,
              rating: 5
            },
            {
              name: "Sarah Lee",
              role: "Educator",
              story:
                "As an educator, I’ve found these tools invaluable. The lesson planning features and easy-to-use interface have made my teaching much more effective and enjoyable.",
              image: b,
              rating: 4
            },
            {
              name: "David Kim",
              role: "Student",
              story:
                "The resource library has helped me ace my exams! The study materials are incredibly organized, making learning so much easier and more efficient.",
              image: c,
              rating: 5
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className="bg-white rounded-xl shadow-xl p-10 flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 rounded-full overflow-hidden mb-6">
                <img
                  src={item.image}
                  alt={`${item.name}'s photo`}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">{item.name}</h3>
              <p className="text-lg text-gray-500 mb-4">{item.role}</p>
              <p className="text-gray-600 mb-6">{item.story}</p>
              <div className="flex items-center">
                {[...Array(item.rating)].map((_, idx) => (
                  <svg
                    key={idx}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    className="w-6 h-6 text-yellow-500"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 17.62l-5.4 3.24 1.03-6.02L2.3 9.73l6.07-.88L12 2l2.63 6.85 6.07.88-4.33 4.1 1.03 6.02z"
                    />
                  </svg>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
