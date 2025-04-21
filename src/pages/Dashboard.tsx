import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { PlusCircle } from 'lucide-react';
import axios from 'axios';
import jwtDecode from 'jwt-decode';

import CapsuleCard from '../components/CapsuleCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Capsule } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCapsules = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token || token.trim() === '') {
          toast.error('You must be logged in to view your time capsules.');
          navigate('/login');
          return;
        }

        try {
          const decodedToken = jwtDecode<{ exp: number }>(token);
          if (decodedToken.exp * 1000 < Date.now()) {
            localStorage.removeItem('token');
            toast.error('Session expired, please log in again');
            navigate('/login');
            return;
          }
        } catch (error) {
          localStorage.removeItem('token');
          toast.error('Invalid token. Please log in again.');
          navigate('/login');
          return;
        }

        const response = await axios.get('http://127.0.0.1:5000/api/capsules', {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('Capsule data:', response.data);
        setCapsules(response.data);
      } catch (error) {
        console.error('Error fetching capsules:', error);
        toast.error('Failed to load your time capsules');
      } finally {
        setLoading(false);
      }
    };

    fetchCapsules();
  }, [navigate]);

  // Compare timestamps to avoid timezone issues
  const now = new Date().getTime();

  // Debug log
  capsules.forEach((capsule) => {
    console.log(
      `Capsule: ${capsule.title}, openDate: ${new Date(capsule.openDate).toISOString()}, now: ${new Date().toISOString()}`
    );
  });

  const lockedCapsules = capsules.filter(
    (capsule) => new Date(capsule.openDate).getTime() > now
  );
  const openableCapsules = capsules.filter(
    (capsule) => new Date(capsule.openDate).getTime() <= now
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { when: 'beforeChildren', staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="container mx-auto px-4 py-8"
    >
      <motion.div
        variants={itemVariants}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">Your Time Capsules</h1>
          <p className="text-gray-400 mt-1">Manage and view your preserved memories</p>
        </div>
        <button onClick={() => navigate('/create')} className="btn btn-primary flex items-center">
          <PlusCircle className="mr-2 h-5 w-5" />
          Create New Capsule
        </button>
      </motion.div>

      {capsules.length === 0 ? (
        <motion.div variants={itemVariants} className="card text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">No Time Capsules Yet</h2>
          <p className="text-gray-400 mb-6">
            Create your first time capsule to start preserving memories for the future.
          </p>
          <button
            onClick={() => navigate('/create')}
            className="btn btn-primary inline-flex items-center mx-auto"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Create Your First Capsule
          </button>
        </motion.div>
      ) : (
        <>
          {/* Openable Capsules Section */}
          {openableCapsules.length > 0 && (
            <motion.section variants={itemVariants} className="mb-12">
              <div className="flex items-center mb-4">
                <h2 className="text-2xl font-semibold">Ready to Open</h2>
                <div className="ml-3 bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">
                  {openableCapsules.length} capsule
                  {openableCapsules.length !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {openableCapsules.map((capsule) => (
                  <CapsuleCard key={capsule._id} capsule={capsule} />
                ))}
              </div>
            </motion.section>
          )}

          {/* Locked Capsules Section */}
          {lockedCapsules.length > 0 && (
            <motion.section variants={itemVariants}>
              <div className="flex items-center mb-4">
                <h2 className="text-2xl font-semibold">Locked Capsules</h2>
                <div className="ml-3 bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full">
                  {lockedCapsules.length} capsule
                  {lockedCapsules.length !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lockedCapsules.map((capsule) => (
                  <CapsuleCard key={capsule._id} capsule={capsule} />
                ))}
              </div>
            </motion.section>
          )}
        </>
      )}
    </motion.div>
  );
};

export default Dashboard;
