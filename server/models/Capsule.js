import mongoose from 'mongoose';

const capsuleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
    },
    openDate: {
      type: Date,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hasImages: {
      type: Boolean,
      default: false,
    },
    hasVideos: {
      type: Boolean,
      default: false,
    },
    hasMessage: {
      type: Boolean,
      default: false,
    },
    createdAt: { type: Date,
       default: Date.now },
       
    notificationSent: {
      type: Boolean,
      default: false,
    }
    },
  { timestamps: true }
);

// Virtual property to check if capsule is openable
capsuleSchema.virtual('isOpenable').get(function() {
  return new Date(this.openDate) <= new Date();
});

const Capsule = mongoose.model('Capsule', capsuleSchema);

export default Capsule;