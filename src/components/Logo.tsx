import React from 'react';
import { Timer } from 'lucide-react';

const Logo: React.FC = () => {
  return (
    <div className="relative">
      <div className="bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 p-2 rounded-full animate-spin3d">
        <Timer className="h-6 w-6 text-white" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 blur-md opacity-30 rounded-full animate-pulse"></div>
    </div>
  );
};

export default Logo;