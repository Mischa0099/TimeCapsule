import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { Calendar, Clock, Upload, X, Image, Film } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import CapsuleModel from '../components/CapsuleModel';
import LoadingSpinner from '../components/LoadingSpinner';

interface UploadedFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
}

const CreateCapsule: React.FC = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [openDate, setOpenDate] = useState('');
  const [openTime, setOpenTime] = useState('');
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const navigate = useNavigate();

  // Set minimum date to today
  const today = new Date();
  const minDate = format(today, 'yyyy-MM-dd');
  const minTime = format(today, 'HH:mm');

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'video/*': ['.mp4', '.webm', '.mov']
    },
    maxSize: 20 * 1024 * 1024, // 20MB max
    onDrop: acceptedFiles => {
      const newFiles = acceptedFiles.map(file => {
        const type = file.type.startsWith('image/') ? 'image' : 'video';
        return {
          file,
          preview: URL.createObjectURL(file),
          type
        };
      });
      setFiles([...files, ...newFiles]);
    },
    onDropRejected: rejectedFiles => {
      rejectedFiles.forEach(rejected => {
        if (rejected.errors[0]?.code === 'file-too-large') {
          toast.error('File is too large. Maximum size is 20MB.');
        } else {
          toast.error('Invalid file type. Only images and videos are allowed.');
        }
      });
    }
  });

  const removeFile = (index: number) => {
    const newFiles = [...files];
    URL.revokeObjectURL(newFiles[index].preview);
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!title || !openDate || !openTime) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Create Date object from date and time inputs
    const openDateTime = new Date(`${openDate}T${openTime}`);
    
    // Validate that the date is in the future
    if (openDateTime <= new Date()) {
      toast.error('Open date must be in the future');
      return;
    }
    
    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You must be logged in');
        navigate('/login');
        return;
      }
      
      // Create form data object
      const formData = new FormData();
      formData.append('title', title);
      formData.append('message', message);
      formData.append('openDate', openDateTime.toISOString());
      
      // Add files to form data
      files.forEach(fileObj => {
        formData.append('files', fileObj.file);
      });
      
      // Send request to backend
      const response = await axios.post(
        'http://localhost:5000/api/capsules',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      toast.success('Time capsule created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating capsule:', error);
      toast.error('Failed to create time capsule. Please try again.');
    } finally {
      setUploading(false);
    }
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

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="container mx-auto px-4 py-8"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl font-bold">Create New Time Capsule</h1>
        <p className="text-gray-400 mt-1">Preserve your memories to be opened in the future</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Form */}
        <motion.div variants={itemVariants} className="lg:w-2/3">
          <form onSubmit={handleSubmit} className="card">
            <div className="mb-6">
              <label htmlFor="title" className="block text-gray-300 mb-2">
                Capsule Title *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input w-full"
                placeholder="Give your capsule a name"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="message" className="block text-gray-300 mb-2">
                Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="input w-full h-32 resize-none"
                placeholder="Write a message to your future self..."
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="openDate" className="block text-gray-300 mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Open Date *
                </label>
                <input
                  id="openDate"
                  type="date"
                  value={openDate}
                  onChange={(e) => setOpenDate(e.target.value)}
                  min={minDate}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label htmlFor="openTime" className="block text-gray-300 mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Open Time *
                </label>
                <input
                  id="openTime"
                  type="time"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  min={openDate === minDate ? minTime : undefined}
                  className="input w-full"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-300 mb-2">
                Add Photos & Videos
              </label>
              <div
                {...getRootProps()}
                className="border-2 border-dashed border-gray-700 rounded-md p-6 hover:border-primary-500 transition-colors cursor-pointer bg-gray-800/50 text-center"
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-300">Drag & drop files here, or click to select</p>
                <p className="text-gray-500 text-sm mt-1">
                  Images & videos (max 20MB each)
                </p>
              </div>
            </div>

            {files.length > 0 && (
              <div className="mb-6">
                <h3 className="text-gray-300 mb-2">Uploaded Files ({files.length})</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {files.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-md overflow-hidden bg-gray-800 border border-gray-700">
                        {file.type === 'image' ? (
                          <img
                            src={file.preview}
                            alt={`Preview ${index}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center relative">
                            <video
                              src={file.preview}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                              <Film className="h-8 w-8 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      {file.type === 'image' && (
                        <div className="absolute bottom-1 left-1 bg-black/60 rounded-md p-1">
                          <Image className="h-3 w-3 text-white" />
                        </div>
                      )}
                      {file.type === 'video' && (
                        <div className="absolute bottom-1 left-1 bg-black/60 rounded-md p-1">
                          <Film className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn btn-ghost mr-2"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary min-w-[120px]"
                disabled={uploading}
              >
                {uploading ? <LoadingSpinner size="sm" /> : 'Create Capsule'}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Preview */}
        <motion.div variants={itemVariants} className="lg:w-1/3">
          <div className="card h-full flex flex-col items-center justify-center py-8">
            <h2 className="text-xl font-semibold mb-6 text-center">Capsule Preview</h2>
            <CapsuleModel 
              openDate={
                openDate && openTime
                  ? new Date(`${openDate}T${openTime}`)
                  : new Date(Date.now() + 24 * 60 * 60 * 1000)
              }
              className="mb-8"
            />
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-1">{title || 'Your Time Capsule'}</h3>
              <p className="text-gray-400 text-sm">
                {openDate && openTime
                  ? `Opens ${format(new Date(`${openDate}T${openTime}`), 'PPPp')}`
                  : 'Select a date and time to unlock'}
              </p>
              {message && (
                <div className="mt-4 p-3 bg-gray-800/80 rounded-md text-sm max-h-40 overflow-y-auto">
                  <p className="text-gray-300 italic">{message}</p>
                </div>
              )}
              <div className="mt-4 flex justify-center gap-2 flex-wrap">
                {files.length > 0 && (
                  <>
                    {files.some(f => f.type === 'image') && (
                      <span className="bg-primary-900/50 px-2 py-1 rounded text-xs flex items-center">
                        <Image className="w-3 h-3 mr-1" />
                        {files.filter(f => f.type === 'image').length} Photos
                      </span>
                    )}
                    {files.some(f => f.type === 'video') && (
                      <span className="bg-secondary-900/50 px-2 py-1 rounded text-xs flex items-center">
                        <Film className="w-3 h-3 mr-1" />
                        {files.filter(f => f.type === 'video').length} Videos
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CreateCapsule;