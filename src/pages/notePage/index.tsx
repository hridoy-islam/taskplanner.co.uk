import { motion } from "framer-motion";
import { 
  StickyNote, Notebook, Archive, Search, Star, Share2, ShieldCheck
} from "lucide-react";

export default function NotePage() {
  const features = [
    {
      title: "Smart Organization",
      description: "Categorize and sort your notes effortlessly for quick access.",
      icon: <Notebook className="w-8 h-8 text-taskplanner" />,
      points: [
        "Tag and categorize notes",
        "Pin important notes to the top",
        "Customizable folders"
      ]
    },
    {
      title: "Powerful Search",
      description: "Find any note instantly with intelligent search and filters.",
      icon: <Search className="w-8 h-8 text-blue-500" />,
      points: [
        "Keyword and tag-based search",
        "Recent search history",
        "Advanced filters for fast results"
      ]
    },
    {
      title: "Secure and Private",
      description: "Your notes are encrypted and protected at all times.",
      icon: <ShieldCheck className="w-8 h-8 text-green-500" />,
      points: [
        "End-to-end encryption",
        "Biometric access options",
        "Private folders"
      ]
    },
    {
      title: "Easy Sharing",
      description: "Collaborate and share notes seamlessly with anyone.",
      icon: <Share2 className="w-8 h-8 text-purple-500" />,
      points: [
        "Share via email or link",
        "Permission-based access",
        "Real-time collaboration"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-100">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
              Keep Notes <span className="text-taskplanner">Organized</span> & Accessible
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto">
              Keep all your important notes organized and accessible.
            </p>
            <div className="mt-10">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-taskplanner hover:bg-taskplanner text-white font-bold py-4 px-10 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Create Your First Note
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">Why Choose Our Note App?</h2>

          <div className="grid md:grid-cols-2 gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="mr-5">
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{feature.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-6">{feature.description}</p>
                  <ul className="space-y-3">
                    {feature.points.map((point, i) => (
                      <motion.li 
                        key={i}
                        whileHover={{ x: 5 }}
                        className="flex items-start text-gray-700"
                      >
                        <Star className="w-5 h-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-lg">{point}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
