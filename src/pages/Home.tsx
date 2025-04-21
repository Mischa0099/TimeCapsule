import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Clock, Timer, Box, PlusCircle } from 'lucide-react';
import CapsuleModel from '../components/CapsuleModel';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const features = [
    {
      icon: <Clock className="h-6 w-6 text-primary-400" />,
      title: "Schedule for Future",
      description: "Set a specific date and time when your digital time capsule will become accessible."
    },
    {
      icon: <Box className="h-6 w-6 text-secondary-400" />,
      title: "Store Precious Memories",
      description: "Preserve photos, videos, and heartfelt messages for your future self or loved ones."
    },
    {
      icon: <Timer className="h-6 w-6 text-accent-400" />,
      title: "Countdown Excitement",
      description: "Watch the countdown timer build anticipation until your capsule can be opened."
    }
  ];

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="container mx-auto px-4 py-12"
    >
      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-20">
        <motion.div variants={itemVariants} className="lg:w-1/2">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Preserve Today's Memories for 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400"> Tomorrow's Discovery</span>
          </h1>
          <p className="mt-6 text-gray-300 text-lg md:text-xl">
            Create digital time capsules filled with photos, videos, and messages that can only be opened at a future date you choose.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button 
              onClick={handleGetStarted}
              className="btn btn-primary text-lg px-8 py-3 flex items-center justify-center"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              {user ? 'Go to Dashboard' : 'Create Your First Capsule'}
            </button>
            <button 
              onClick={() => navigate(user ? '/history' : '/login')}
              className="btn btn-ghost text-lg px-8 py-3"
            >
              {user ? 'View Your Capsules' : 'Sign In'}
            </button>
          </div>
        </motion.div>
        <motion.div 
          variants={itemVariants}
          className="lg:w-1/2 flex justify-center"
        >
          <div className="relative">
            <CapsuleModel 
              openDate={new Date(Date.now() + 24 * 60 * 60 * 1000)} 
              className="scale-150"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 opacity-10 blur-3xl -z-10 rounded-full"></div>
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <motion.section variants={itemVariants} className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="card h-full flex flex-col"
            >
              <div className="bg-gray-800/80 p-3 rounded-full w-fit mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-400 flex-grow">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div className="aspect-video rounded-lg overflow-hidden">
    <img
      src="https://images.pexels.com/photos/4835429/pexels-photo-4835429.jpeg"
      alt="Graduation"
      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
    />
  </div>
  <div className="aspect-video rounded-lg overflow-hidden">
    <img
      src="/Assets/1_photo.jpg" 
      alt="Friends"
      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
    />
  </div>
  <div className="aspect-video rounded-lg overflow-hidden">
    <img
      src="/Assets/2_photos.jpg" 
      alt="Family vacation"
      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
    />
  </div>
</div>

<p className="text-center mt-8 text-gray-300">
  From graduations to weddings, birthdays to anniversaries — preserve your special moments and revisit them exactly when you want to.
</p>


      {/* CTA Section */}
      <motion.section variants={itemVariants} className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Time Travel Journey?</h2>
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Create your first time capsule today and set your memories on a journey to the future.
        </p>
        <button 
          onClick={handleGetStarted}
          className="btn btn-primary text-lg px-10 py-3"
        >
          {user ? 'Go to Dashboard' : 'Get Started For Free'}
        </button>
      </motion.section>
    </motion.div>
  );
};

export default Home;