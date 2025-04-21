import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Clock } from 'lucide-react';

const NotFound: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
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

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-[70vh] flex items-center justify-center px-4"
    >
      <div className="text-center">
        <motion.div 
          variants={itemVariants}
          className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500"
        >
          404
        </motion.div>
        
        <motion.h1 
          variants={itemVariants}
          className="text-3xl md:text-4xl font-bold mt-4 mb-2"
        >
          Time Capsule Not Found
        </motion.h1>
        
        <motion.p 
          variants={itemVariants}
          className="text-gray-400 mb-8 max-w-md mx-auto"
        >
          The time capsule you're looking for seems to be lost in time. It might have been opened, deleted, or never existed.
        </motion.p>
        
        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link 
            to="/"
            className="btn btn-ghost flex items-center"
          >
            <Home className="mr-2 h-5 w-5" />
            Return Home
          </Link>
          
          <Link 
            to="/dashboard"
            className="btn btn-primary flex items-center"
          >
            <Clock className="mr-2 h-5 w-5" />
            View Your Capsules
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default NotFound;