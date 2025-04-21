import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, Lock, Unlock, Image, Film, FileText } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Capsule } from '../types';

interface CapsuleCardProps {
  capsule: Capsule;
}

const CapsuleCard: React.FC<CapsuleCardProps> = ({ capsule }) => {
  const isOpenable = new Date(capsule.openDate) <= new Date();
  const timeRemaining = !isOpenable 
    ? formatDistanceToNow(new Date(capsule.openDate), { addSuffix: true })
    : 'Available now';

  // Calculate progress percentage
  const calculateProgress = () => {
    if (isOpenable) return 100;
    
    const createdDate = new Date(capsule.createdAt).getTime();
    const openDate = new Date(capsule.openDate).getTime();
    const currentDate = new Date().getTime();
    
    const totalDuration = openDate - createdDate;
    const elapsedDuration = currentDate - createdDate;
    
    return Math.min(Math.floor((elapsedDuration / totalDuration) * 100), 99);
  };

  const progress = calculateProgress();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card group capsule-glow overflow-hidden"
    >
      <div className="mb-4 flex justify-between items-start">
        <h3 className="font-bold text-xl text-white truncate">
          {capsule.title}
        </h3>
        {isOpenable ? (
          <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full flex items-center">
            <Unlock className="w-3 h-3 mr-1" />
            Unlocked
          </span>
        ) : (
          <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full flex items-center">
            <Lock className="w-3 h-3 mr-1" />
            Locked
          </span>
        )}
      </div>

      <div className="flex items-center text-sm text-gray-300 mb-2">
        <Calendar className="w-4 h-4 mr-1" />
        <span>Created: {format(new Date(capsule.createdAt), 'MMM d, yyyy')}</span>
      </div>

      <div className="flex items-center text-sm text-gray-300 mb-4">
        <Clock className="w-4 h-4 mr-1" />
        <span>Opens: {format(new Date(capsule.openDate), 'MMM d, yyyy h:mm a')}</span>
      </div>

      {/* Content indicators */}
      <div className="flex space-x-2 mb-4">
        {capsule.hasImages && (
          <span className="bg-primary-900/50 px-2 py-1 rounded text-xs flex items-center">
            <Image className="w-3 h-3 mr-1" />
            Photos
          </span>
        )}
        {capsule.hasVideos && (
          <span className="bg-secondary-900/50 px-2 py-1 rounded text-xs flex items-center">
            <Film className="w-3 h-3 mr-1" />
            Videos
          </span>
        )}
        {capsule.hasMessage && (
          <span className="bg-accent-900/50 px-2 py-1 rounded text-xs flex items-center">
            <FileText className="w-3 h-3 mr-1" />
            Message
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-primary-500 to-secondary-500 h-full rounded-full transition-all duration-1000"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between text-xs text-gray-400 mb-4">
        <span>Progress</span>
        <span>{timeRemaining}</span>
      </div>

      <Link 
        to={`/capsule/${capsule._id}`}
        className="btn btn-primary w-full text-center"
      >
        {isOpenable ? 'Open Capsule' : 'View Details'}
      </Link>
    </motion.div>
  );
};

export default CapsuleCard;