import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, Clock, LockKeyhole, Share2, Trash2, Image as ImageIcon, Film, FileText } from 'lucide-react';

import LoadingSpinner from '../components/LoadingSpinner';
import CapsuleModel from '../components/CapsuleModel';
import { Capsule, MediaFile } from '../types';

const ViewCapsule: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [capsule, setCapsule] = useState<Capsule | null>(null);
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [openingCapsule, setOpeningCapsule] = useState(false);
  const [isCapsuleOpen, setIsCapsuleOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchCapsule = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get(`http://localhost:5000/api/capsules/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCapsule(response.data);
        
        // Check if capsule is openable
        const openDate = new Date(response.data.openDate);
        const isOpenable = openDate <= new Date();
        
        if (isOpenable) {
          // Fetch media files only if capsule is openable
          const mediaResponse = await axios.get(`http://localhost:5000/api/capsules/${id}/media`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          setMedia(mediaResponse.data);
        }
      } catch (error) {
        console.error('Error fetching capsule:', error);
        toast.error('Failed to load the time capsule');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchCapsule();
  }, [id, navigate]);

  const handleOpenCapsule = () => {
    if (!capsule) return;
    
    const openDate = new Date(capsule.openDate);
    const isOpenable = openDate <= new Date();
    
    if (!isOpenable) {
      toast.warning("This capsule isn't ready to be opened yet!");
      return;
    }
    
    setOpeningCapsule(true);
    
    // Simulate opening animation
    setTimeout(() => {
      setIsCapsuleOpen(true);
      setOpeningCapsule(false);
    }, 2000);
  };

  const handleDeleteCapsule = async () => {
    if (!capsule) return;
    
    try {
      setDeleting(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      
      await axios.delete(`http://localhost:5000/api/capsules/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      toast.success('Time capsule deleted successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting capsule:', error);
      toast.error('Failed to delete the time capsule');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleShare = () => {
    if (!capsule) return;
    
    // In a real app, you would implement social sharing or generate a shareable link
    toast.info('Sharing functionality would be implemented here!');
  };

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!capsule) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Capsule Not Found</h1>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-primary"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const isOpenable = new Date(capsule.openDate) <= new Date();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="container mx-auto px-4 py-8"
    >
      {/* Header with navigation */}
      <motion.div variants={itemVariants} className="mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-400 hover:text-white mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </button>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold">{capsule.title}</h1>
          <div className="flex space-x-2">
            <button
              onClick={handleShare}
              className="btn btn-ghost flex items-center"
            >
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn btn-ghost text-red-400 hover:text-red-300 flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </button>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Capsule Info */}
        <motion.div variants={itemVariants} className="lg:w-1/3 order-2 lg:order-1">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Capsule Information</h2>
            
            <div className="flex items-center text-gray-300 mb-3">
              <Calendar className="w-4 h-4 mr-2" />
              <div>
                <p className="text-sm text-gray-400">Created On</p>
                <p>{format(new Date(capsule.createdAt), 'MMMM d, yyyy')}</p>
              </div>
            </div>
            
            <div className="flex items-center text-gray-300 mb-6">
              <Clock className="w-4 h-4 mr-2" />
              <div>
                <p className="text-sm text-gray-400">Opens On</p>
                <p>
                  {format(new Date(capsule.openDate), 'MMMM d, yyyy')} at{' '}
                  {format(new Date(capsule.openDate), 'h:mm a')}
                </p>
              </div>
            </div>
            
            <div className="border-t border-gray-700 my-6"></div>
            
            <h3 className="font-semibold mb-2">Capsule Contents</h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {capsule.hasMessage && (
                <div className="bg-accent-900/50 px-3 py-1 rounded-full text-sm flex items-center">
                  <FileText className="w-4 h-4 mr-1" />
                  Message
                </div>
              )}
              {capsule.hasImages && (
                <div className="bg-primary-900/50 px-3 py-1 rounded-full text-sm flex items-center">
                  <ImageIcon className="w-4 h-4 mr-1" />
                  Photos
                </div>
              )}
              {capsule.hasVideos && (
                <div className="bg-secondary-900/50 px-3 py-1 rounded-full text-sm flex items-center">
                  <Film className="w-4 h-4 mr-1" />
                  Videos
                </div>
              )}
            </div>
            
            {!isOpenable && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-4 mb-4">
                <div className="flex items-center text-yellow-400 mb-2">
                  <LockKeyhole className="w-5 h-5 mr-2" />
                  <h3 className="font-semibold">Capsule Locked</h3>
                </div>
                <p className="text-sm text-gray-300">
                  This capsule will be available to open on{' '}
                  {format(new Date(capsule.openDate), 'MMMM d, yyyy')} at{' '}
                  {format(new Date(capsule.openDate), 'h:mm a')}.
                </p>
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Capsule Display */}
        <motion.div variants={itemVariants} className="lg:w-2/3 order-1 lg:order-2">
          <div className="card">
            {!isCapsuleOpen ? (
              <div className="text-center py-8">
                <CapsuleModel 
                  openDate={new Date(capsule.openDate)}
                  isOpen={openingCapsule}
                  className="mb-6"
                />
                
                <h2 className="text-2xl font-bold mb-2">{capsule.title}</h2>
                
                {isOpenable ? (
                  <>
                    <p className="text-gray-300 mb-6">
                      This capsule is ready to be opened!
                    </p>
                    <button
                      onClick={handleOpenCapsule}
                      className="btn btn-primary px-8"
                      disabled={openingCapsule}
                    >
                      {openingCapsule ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span className="ml-2">Opening...</span>
                        </>
                      ) : (
                        'Open Capsule'
                      )}
                    </button>
                  </>
                ) : (
                  <p className="text-gray-300">
                    This capsule is locked until{' '}
                    {format(new Date(capsule.openDate), 'MMMM d, yyyy')} at{' '}
                    {format(new Date(capsule.openDate), 'h:mm a')}.
                  </p>
                )}
              </div>
            ) : (
              <div className="py-4">
                <h2 className="text-2xl font-bold mb-6 text-center">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400">
                    Capsule Opened!
                  </span>
                </h2>
                
                {/* Message */}
                {capsule.message && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                  >
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Your Message
                    </h3>
                    <div className="bg-gray-800/60 p-4 rounded-md border border-gray-700">
                      <p className="text-gray-300 whitespace-pre-line">{capsule.message}</p>
                    </div>
                  </motion.div>
                )}
                
                {/* Media Gallery */}
                {media.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <h3 className="text-lg font-semibold mb-2">
                      {media.some(m => m.fileType === 'image') && media.some(m => m.fileType === 'video')
                        ? 'Photos & Videos'
                        : media.some(m => m.fileType === 'image')
                        ? 'Photos'
                        : 'Videos'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {media.map((item, index) => (
                        <motion.div
                          key={item._id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.1 * index }}
                          className="relative rounded-md overflow-hidden group"
                        >
                          {item.fileType === 'image' ? (
                            <div className="aspect-square">
                              <img
                                src={`http://localhost:5000/${item.path}`}
                                alt={item.filename}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="aspect-video bg-gray-900">
                              <video
                                src={`http://localhost:5000/${item.path}`}
                                controls
                                className="w-full h-full"
                              />
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                            <div className="flex items-center">
                              {item.fileType === 'image' ? (
                                <ImageIcon className="w-3 h-3 mr-1 text-primary-400" />
                              ) : (
                                <Film className="w-3 h-3 mr-1 text-secondary-400" />
                              )}
                              <span className="text-xs truncate">
                                {item.filename}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-lg max-w-md w-full p-6"
            >
              <h3 className="text-xl font-bold mb-4">Delete Time Capsule?</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete this time capsule? This action cannot be undone and all contents will be permanently lost.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn btn-ghost"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCapsule}
                  className="btn bg-red-500 hover:bg-red-600 text-white"
                  disabled={deleting}
                >
                  {deleting ? <LoadingSpinner size="sm" /> : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ViewCapsule;