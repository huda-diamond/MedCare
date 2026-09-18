const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const doctorProfileSchema = new mongoose.Schema({
  specialization: {
    type: String,
    required: function() { return this.parent().role === 'doctor'; },
    enum: ['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology', 'General Medicine']
  },
  experience: {
    type: Number, // in years
    required: function() { return this.parent().role === 'doctor'; }
  },
  bio: {
    type: String,
    required: function() { return this.parent().role === 'doctor'; }
  },
  fee: {
    type: Number,
    required: function() { return this.parent().role === 'doctor'; }
  },
  rating: {
    type: Number,
    default: 4.8
  },
  reviewsCount: {
    type: Number,
    default: 12
  },
  imageUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=256&h=256&q=80'
  },
  availability: {
    days: {
      type: [String], // e.g. ["Monday", "Wednesday", "Friday"]
      default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    },
    slots: {
      type: [String], // e.g. ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"]
      default: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"]
    }
  }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    default: 'patient'
  },
  phone: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  age: {
    type: Number
  },
  medicalHistory: {
    type: [String],
    default: []
  },
  doctorProfile: {
    type: doctorProfileSchema,
    required: function() { return this.role === 'doctor'; }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
