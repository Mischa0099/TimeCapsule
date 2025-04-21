import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Mail, Heart } from 'lucide-react';
import Logo from './Logo';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 border-t border-white/10 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2">
              <Logo />
              <span className="text-xl font-bold text-white">TimeCapsule</span>
            </div>
            <p className="mt-2 text-gray-400 text-sm">
              Preserve your memories today, rediscover them tomorrow.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-3">Navigation</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white transition">Home</Link></li>
              <li><Link to="/dashboard" className="text-gray-400 hover:text-white transition">Dashboard</Link></li>
              <li><Link to="/create" className="text-gray-400 hover:text-white transition">Create Capsule</Link></li>
              <li><Link to="/history" className="text-gray-400 hover:text-white transition">History</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-3">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="#" className="text-gray-400 hover:text-white transition">Privacy Policy</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-white transition">Terms of Service</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-white transition">Cookie Policy</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-3">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} TimeCapsule.
          </p>
          <p className="text-gray-400 text-sm mt-2 md:mt-0 flex items-center">
            Made with <Heart className="h-4 w-4 text-red-500 mx-1" /> by Mischa And Shyamani
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;