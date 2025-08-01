const mongoose = require('mongoose');
const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { 
    type: String, 
    enum: ['today', 'this-week', 'this-month', 'later', 'done', 'canceled'], 
    default: 'today' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium' 
  },
  dueDate: { type: Date },
  points: [
    {
      text: String,
      completedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }
  ],
  files: [
    {
      filename: String,
      originalName: String,
      path: String,
      uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      uploadedAt: { type: Date, default: Date.now }
    }
  ],
  progress: { type: Number, default: 0 }, // 0-100 percentage
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update progress when points are modified
taskSchema.pre('save', function(next) {
  if (this.points.length > 0) {
    const completedPoints = this.points.filter(point => point.completedBy.length > 0).length;
    this.progress = Math.round((completedPoints / this.points.length) * 100);
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Task', taskSchema);
