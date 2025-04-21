import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    capsuleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Capsule',
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    originalFilename: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
      enum: ['image', 'video'],
    },
    path: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }
  },
  { timestamps: true }
);

const Media = mongoose.model('Media', mediaSchema);

export default Media;