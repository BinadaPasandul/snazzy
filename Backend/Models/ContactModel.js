const mongoose = require('mongoose');

const contactSubmissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    maxlength: [100, 'Email cannot exceed 100 characters']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Register',
    default: null
  },
  isRegisteredUser: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['new', 'in_progress', 'resolved', 'closed'],
    default: 'new'
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Admin notes cannot exceed 1000 characters']
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
contactSubmissionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create indexes for better performance
contactSubmissionSchema.index({ email: 1 });
contactSubmissionSchema.index({ submittedAt: -1 });
contactSubmissionSchema.index({ status: 1 });
contactSubmissionSchema.index({ userId: 1 });

module.exports = mongoose.model('ContactSubmission', contactSubmissionSchema);
