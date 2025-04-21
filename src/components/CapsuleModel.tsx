import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CapsuleModelProps {
  openDate: Date;
  isOpen?: boolean;
  className?: string;
}

const CapsuleModel: React.FC<CapsuleModelProps> = ({ 
  openDate, 
  isOpen = false, 
  className = '' 
}) => {
  const capsuleRef = useRef<HTMLDivElement>(null);
  const isOpenable = openDate <= new Date();

  // Calculate remaining time
  const calculateRemainingTime = () => {
    if (isOpenable) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    
    const now = new Date();
    const timeDiff = openDate.getTime() - now.getTime();
    
    // Convert to days, hours, minutes, seconds
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds };
  };

  const [remainingTime, setRemainingTime] = React.useState(calculateRemainingTime());

  useEffect(() => {
    if (isOpenable) return;
    
    const timer = setInterval(() => {
      setRemainingTime(calculateRemainingTime());
    }, 1000);
    
    return () => clearInterval(timer);
  }, [openDate, isOpenable]);

  return (
    <div className={`relative ${className}`}>
      <motion.div
        ref={capsuleRef}
        initial={{ rotateY: 0 }}
        animate={{ 
          rotateY: isOpen ? 180 : 0,
          scale: isOpen ? 1.05 : 1
        }}
        transition={{ duration: 1, ease: "easeInOut" }}
        className="w-full h-full perspective-1000"
      >
        <div className="relative w-48 h-48 mx-auto">
          {/* Capsule body */}
          <div className={`absolute inset-0 rounded-2xl ${isOpen ? 'bg-accent-500' : 'bg-primary-700'} p-0.5 transform transition-all duration-1000 ${isOpen ? 'scale-110' : ''}`}>
            <div className="bg-gray-900 h-full w-full rounded-2xl flex items-center justify-center overflow-hidden">
              {isOpenable ? (
                <div className="text-center">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="text-accent-500 font-bold text-lg"
                  >
                    READY
                  </motion.div>
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="text-gray-400 text-xs mt-1"
                  >
                    Click to open
                  </motion.div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-primary-500 font-bold mb-2">LOCKED</div>
                  <div className="flex justify-center space-x-2 text-xs">
                    <div className="bg-gray-800 rounded p-1 min-w-[25px]">
                      <div className="text-white">{remainingTime.days}</div>
                      <div className="text-gray-500 text-[10px]">DAYS</div>
                    </div>
                    <div className="bg-gray-800 rounded p-1 min-w-[25px]">
                      <div className="text-white">{remainingTime.hours}</div>
                      <div className="text-gray-500 text-[10px]">HRS</div>
                    </div>
                    <div className="bg-gray-800 rounded p-1 min-w-[25px]">
                      <div className="text-white">{remainingTime.minutes}</div>
                      <div className="text-gray-500 text-[10px]">MIN</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Lock/seal */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: isOpen ? 0 : 1 }}
            transition={{ duration: 0.5 }}
            className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-2 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full"
          ></motion.div>
          
          {/* Glowing effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 opacity-20 blur-xl -z-10"></div>
          
          {/* Particles/sparkles */}
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: 0, 
                    y: 0, 
                    opacity: 1,
                    scale: 0
                  }}
                  animate={{ 
                    x: Math.random() * 200 - 100, 
                    y: Math.random() * 200 - 100,
                    opacity: 0,
                    scale: Math.random() * 2
                  }}
                  transition={{ 
                    duration: 1 + Math.random(), 
                    delay: i * 0.05 
                  }}
                  className="absolute top-1/2 left-1/2 w-1 h-1 bg-accent-400 rounded-full"
                ></motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CapsuleModel;