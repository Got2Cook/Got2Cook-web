const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  ingredients: [{
    type: String,
    required: true
  }],
  instructions: [{
    type: String,
    required: true
  }],
  prepTime: {
    type: Number,
    required: true
  },
  calories: {
    type: Number,
    default: null
  },
  mood: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['doce', 'salgado', 'todos'],
    default: 'todos'
  },
  image: {
    type: String,
    default: null
  },
  promptHash: {
    type: String,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

recipeSchema.index({ userId: 1, createdAt: -1 });
recipeSchema.index({ promptHash: 1 });

module.exports = mongoose.models.Recipe || mongoose.model('Recipe', recipeSchema);