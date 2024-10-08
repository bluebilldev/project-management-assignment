const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  status: {
    type: String,
    enum: ['To Do', 'In Progress', 'Completed'],
    default: 'To Do',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  dueDate: {
    type: Date,
    required: true
  },
  assignedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  label: {
    type: String
  }
}, { timestamps: true });

// Index for faster queries: Status, Assigned User, Due Date
TaskSchema.index({ status: 1 });
TaskSchema.index({ assignedUser: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ label: 1 });

module.exports = mongoose.model('Task', TaskSchema);
