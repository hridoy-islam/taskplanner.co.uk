import { motion } from "framer-motion";
import { 
  Users, Zap, BarChart2, CheckCircle, Heart, 
  Clock, Calendar, MessageSquare, FileText, 
  Shield, Globe, Settings, Bell, Star, 
  Award, Target, Handshake, PieChart, 
  GitBranch, GitPullRequest, GitCommit, GitMerge
} from 'lucide-react';

export default function TeamCollaborationPage ()  {
  const features = [
    {
      title: "Instant Team Setup",
      description: "Get your team up and running in seconds with our intuitive setup process.",
      icon: <Zap className="w-8 h-8 text-blue-500" />,
      points: [
        "Create a new team with just a few clicks",
        "Invite members instantly via email or link",
        "Pre-configured templates for quick start"
      ]
    },
    {
      title: "Performance Analytics",
      description: "Measure and improve your team's performance with actionable insights.",
      icon: <BarChart2 className="w-8 h-8 text-green-500" />,
      points: [
        "Track productivity metrics in real-time",
        "Identify bottlenecks in workflows",
        "Compare performance across teams"
      ]
    },
    {
      title: "Continuous Improvement",
      description: "Successive experience built into every interaction.",
      icon: <CheckCircle className="w-8 h-8 text-purple-500" />,
      points: [
        "Iterative feedback loops",
        "Progressive enhancement of features",
        "Adaptive interface based on usage"
      ]
    },
    {
      title: "People-First Approach",
      description: "Designed with human psychology and team dynamics in mind.",
      icon: <Heart className="w-8 h-8 text-red-500" />,
      points: [
        "Emotional intelligence indicators",
        "Conflict resolution suggestions",
        "Personalized encouragement"
      ]
    }
  ];

  const stats = [
    { value: "95%", label: "Team Satisfaction", icon: <Star className="w-6 h-6" /> },
    { value: "3.2x", label: "Productivity Boost", icon: <Award className="w-6 h-6" /> },
    { value: "40%", label: "Faster Delivery", icon: <Clock className="w-6 h-6" /> },
    { value: "24/7", label: "Global Support", icon: <Globe className="w-6 h-6" /> }
  ];

  const workflowSteps = [
    {
      title: "Plan",
      description: "Define your team goals and roadmap",
      icon: <Target className="w-6 h-6" />
    },
    {
      title: "Collaborate",
      description: "Work together in real-time",
      icon: <Users className="w-6 h-6" />
    },
    {
      title: "Track",
      description: "Monitor progress and metrics",
      icon: <PieChart className="w-6 h-6" />
    },
    {
      title: "Review",
      description: "Analyze results and improve",
      icon: <MessageSquare className="w-6 h-6" />
    },
    {
      title: "Celebrate",
      description: "Recognize team achievements",
      icon: <Handshake className="w-6 h-6" />
    }
  ];

  const testimonials = [
    {
      quote: "This platform transformed how our remote team collaborates. We're more productive than ever!",
      author: "Sarah Johnson, Tech Lead",
      company: "InnovateSoft"
    },
    {
      quote: "The analytics helped us identify workflow bottlenecks we didn't even know existed.",
      author: "Michael Chen, Product Manager",
      company: "DataFlow Inc."
    },
    {
      quote: "Our team morale improved dramatically with the built-in recognition features.",
      author: "Emma Rodriguez, HR Director",
      company: "GreenFuture"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-100">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
              Team productivity, Simplified
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto">
              The all-in-one platform that helps teams work smarter, collaborate better, and achieve more together.
            </p>
            <div className="mt-10">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-taskplanner hover:bg-tasplanner/90 text-white font-bold py-4 px-10 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Your Free Trial
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-gradient-to-b from-[#00214C] to-[#0A3A7C] rounded-2xl p-8 mb-16 text-white"
          >
            <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6">
              <Users className="w-12 h-12" />
              <h2 className="text-2xl md:text-3xl font-bold text-center">
                Our Mission: Empower teams to do their best work while fostering meaningful collaboration and personal growth.
              </h2>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Trusted by teams worldwide</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.4, duration: 0.5 }}
                className="text-center p-6 bg-gray-50 rounded-xl"
              >
                <div className="flex justify-center mb-4 text-blue-600">
                  {stat.icon}
                </div>
                <p className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</p>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">Powerful Features for Team Success</h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.4, duration: 0.5 }}
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
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
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

      {/* Workflow Section */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">Streamlined Team Workflow</h2>
          
          <div className="relative">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-blue-200 -translate-y-1/2"></div>
            <div className="grid md:grid-cols-5 gap-8 relative">
              {workflowSteps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                  className="bg-white p-6 rounded-xl shadow-md text-center"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">What Teams Are Saying</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                className="bg-white p-8 rounded-xl shadow-lg"
              >
                <div className="mb-6 text-blue-500">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <p className="text-lg text-gray-700 mb-6">"{testimonial.quote}"</p>
                <div className="font-medium">
                  <p className="text-gray-900">{testimonial.author}</p>
                  <p className="text-blue-600">{testimonial.company}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-20 bg-gradient-to-b from-[#00214C] to-[#0A3A7C] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Seamless Integrations</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Connect with the tools your team already uses every day
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { name: "GitHub", icon: <GitBranch className="w-10 h-10" /> },
              { name: "Slack", icon: <MessageSquare className="w-10 h-10" /> },
              { name: "Google Drive", icon: <FileText className="w-10 h-10" /> },
              { name: "Jira", icon: <GitPullRequest className="w-10 h-10" /> },
              { name: "Trello", icon: <GitCommit className="w-10 h-10" /> },
              { name: "Microsoft Teams", icon: <GitMerge className="w-10 h-10" /> }
            ].map((tool, index) => (
              <motion.div
                key={tool.name}
                whileHover={{ y: -5 }}
                className="bg-gray-800 p-6 rounded-xl text-center"
              >
                <div className="text-blue-400 mb-3 flex justify-center">
                  {tool.icon}
                </div>
                <p className="font-medium">{tool.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-b from-[#00214C] to-[#0A3A7C] rounded-2xl p-10 text-white"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to transform your team collaboration?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of teams who are already working smarter and achieving more together.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-taskplanner font-bold py-4 px-8 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Free Trial
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-transparent border-2 border-white text-white font-bold py-4 px-8 rounded-full text-lg hover:bg-white hover:bg-opacity-10 transition-all duration-300"
              >
                Schedule Demo
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

