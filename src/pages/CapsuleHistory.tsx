import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';
import {
  format, parseISO, isAfter, isBefore, isEqual, subMonths, addMonths,
} from 'date-fns';
import {
  ChevronLeft, ChevronRight, CalendarDays, Clock, Search,
} from 'lucide-react';

import LoadingSpinner from '../components/LoadingSpinner';
import { Capsule } from '../types';

const CapsuleHistory: React.FC = () => {
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    const fetchCapsules = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get('http://127.0.0.1:5000/api/my-capsule-history', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Capsule History API Response:", response.data);

        if (Array.isArray(response.data)) {
          setCapsules(response.data);
        } else if (Array.isArray(response.data.capsules)) {
          setCapsules(response.data.capsules);
        } else {
          toast.error('Invalid capsule data received.');
          console.error("Unexpected data format:", response.data);
        }
      } catch (error) {
        console.error('Error fetching capsules:', error);
        toast.error('Failed to load your capsule history');
      } finally {
        setLoading(false);
      }
    };

    fetchCapsules();
  }, []);

  const filteredCapsulesByMonth = capsules.filter((capsule) => {
    const capsuleDate = parseISO(capsule.openDate);
    const startOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const endOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);

    return (
      isBefore(startOfMonth, capsuleDate)
      && (isAfter(endOfMonth, capsuleDate) || isEqual(endOfMonth, capsuleDate))
    );
  });

  const filteredCapsules = searchTerm
    ? filteredCapsulesByMonth.filter((capsule) => capsule.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : filteredCapsulesByMonth;

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedMonth((date) => (direction === 'prev' ? subMonths(date, 1) : addMonths(date, 1)));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
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
      className="container mx-auto px-4 py-8 text-white"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Capsule History</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => navigateMonth('prev')} className="p-2 hover:bg-gray-700 rounded-full">
            <ChevronLeft />
          </button>
          <span className="text-lg font-medium">
            {format(selectedMonth, 'MMMM yyyy')}
          </span>
          <button onClick={() => navigateMonth('next')} className="p-2 hover:bg-gray-700 rounded-full">
            <ChevronRight />
          </button>
        </div>
      </div>

      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 pl-10 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none"
        />
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
      </div>

      {filteredCapsules.length === 0 ? (
        <p className="text-center text-gray-400 mt-10">No capsules found for this month.</p>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
        >
          {filteredCapsules.map((capsule) => (
            <motion.div
              key={capsule._id}
              variants={itemVariants}
              className="bg-gray-800 border border-gray-700 rounded-2xl p-4 shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2">{capsule.title}</h3>
              <p className="text-sm text-gray-300 mb-3">{capsule.message}</p>
              <div className="flex items-center text-sm text-gray-400 mb-1">
                <CalendarDays className="mr-2" size={16} />
                Opens on: {format(parseISO(capsule.openDate), 'PPpp')}
              </div>
              <div className="flex justify-end">
                <Link
                  to={`/capsule/${capsule._id}`}
                  className="mt-3 inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-white text-sm"
                >
                  View Capsule
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default CapsuleHistory;
