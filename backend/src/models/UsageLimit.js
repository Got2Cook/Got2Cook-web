const mongoose = require('mongoose');

const usageLimitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: String,
    required: true,
    index: true
  },
  count: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400
  }
}, {
  timestamps: true
});

usageLimitSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.models.UsageLimit || mongoose.model('UsageLimit', usageLimitSchema);