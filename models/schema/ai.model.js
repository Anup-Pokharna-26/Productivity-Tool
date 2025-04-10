const mongoose = require('mongoose');

const aiSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: String,
    required: true
  },
  createdBy: {
    type: String,
    required: true
  },
  updatedBy: {
    type: String,
    required: true
  },
  skillLevel: {
    type: Number,
    required: true,
    default: 0 // Default skill level can be set to 0 or any other value as per requirement
  },
  monthsAllocated: {
    type: Number,
    required: true
  },
  hoursPerDay: {
    type: Number,
    required: true
  },
  aiResponse: {
    type: mongoose.Schema.Types.Mixed, // for storing any JSON object
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update `updatedAt` before save
aiSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Update `updatedAt` before findOneAndUpdate
aiSchema.pre('findOneAndUpdate', function (next) {
  this._update.updatedAt = new Date();
  next();
});

const Ai = mongoose.model('Ai', aiSchema);

module.exports = Ai;