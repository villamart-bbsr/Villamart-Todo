const Task = require('../models/Task');
const User = require('../models/User');

// Create new task (admin only)
exports.createTask = async (req, res) => {
  try {
    const { title, description, status, assignedTo, priority, dueDate, points } = req.body;
    const task = new Task({
      title,
      description,
      createdBy: req.user._id,
      assignedTo: assignedTo || req.user._id,
      status: status || 'today',
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : null,
      points: points ? points.map(text => ({ text, completedBy: [] })) : []
    });
    await task.save();
    const populatedTask = await Task.findById(task._id)
      .populate('createdBy', 'username')
      .populate('assignedTo', 'username')
      .populate('points.completedBy', 'username')
      .populate('files.uploadedBy', 'username');
    res.json(populatedTask);
  } catch (error) {
    res.status(500).json({ msg: 'Error creating task', error: error.message });
  }
};

// Get all tasks, with user info populated
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('createdBy', 'username')
      .populate('assignedTo', 'username')
      .populate('points.completedBy', 'username')
      .populate('files.uploadedBy', 'username')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ msg: 'Error fetching tasks', error: error.message });
  }
};

// Get tasks by status (for kanban board)
exports.getTasksByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const tasks = await Task.find({ status })
      .populate('createdBy', 'username')
      .populate('assignedTo', 'username')
      .populate('points.completedBy', 'username')
      .populate('files.uploadedBy', 'username')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ msg: 'Error fetching tasks', error: error.message });
  }
};

// Update task status (for drag and drop)
exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status, assignedTo } = req.body;
    
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ msg: 'Task not found' });
    
    task.status = status;
    if (assignedTo) task.assignedTo = assignedTo;
    await task.save();
    
    const updated = await Task.findById(taskId)
      .populate('createdBy', 'username')
      .populate('assignedTo', 'username')
      .populate('points.completedBy', 'username')
      .populate('files.uploadedBy', 'username');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ msg: 'Error updating task', error: error.message });
  }
};

// Update task details
exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, assignedTo, priority, dueDate, points } = req.body;
    
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ msg: 'Task not found' });
    
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo) task.assignedTo = assignedTo;
    if (priority) task.priority = priority;
    if (dueDate) task.dueDate = new Date(dueDate);
    if (points) {
      task.points = points.map(text => ({ text, completedBy: [] }));
    }
    
    await task.save();
    
    const updated = await Task.findById(taskId)
      .populate('createdBy', 'username')
      .populate('assignedTo', 'username')
      .populate('points.completedBy', 'username')
      .populate('files.uploadedBy', 'username');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ msg: 'Error updating task', error: error.message });
  }
};

// Assign task to user (admin only)
exports.assignTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { assignedTo } = req.body;
    
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ msg: 'Task not found' });
    
    task.assignedTo = assignedTo;
    await task.save();
    
    const updated = await Task.findById(taskId)
      .populate('createdBy', 'username')
      .populate('assignedTo', 'username')
      .populate('points.completedBy', 'username')
      .populate('files.uploadedBy', 'username');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ msg: 'Error assigning task', error: error.message });
  }
};

// Get admin dashboard data
exports.getAdminDashboard = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('createdBy', 'username')
      .populate('assignedTo', 'username')
      .populate('points.completedBy', 'username')
      .populate('files.uploadedBy', 'username');
    
    const users = await User.find({}, 'username email');
    
    const stats = {
      totalTasks: tasks.length,
      // Progress-based counts
      completedTasks: tasks.filter(t => t.progress >= 100).length,
      inProgressTasks: tasks.filter(t => t.progress > 0 && t.progress < 100).length,
      todoTasks: tasks.filter(t => t.progress === 0).length,
      // Keep legacy fields if the frontend still references them elsewhere
      doneTasks: tasks.filter(t => t.status === 'done').length,
      canceledTasks: tasks.filter(t => t.status === 'canceled').length,
      totalUsers: users.length
    };
    
    res.json({ tasks, users, stats });
  } catch (error) {
    res.status(500).json({ msg: 'Error fetching dashboard data', error: error.message });
  }
};

// Mark a point as completed by current user
exports.tickPoint = async (req, res) => {
  try {
    const { taskId, pointIdx } = req.params;
    const userId = req.user._id;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ msg: 'Task not found' });
    const point = task.points[pointIdx];
    if (!point) return res.status(404).json({ msg: 'Point not found' });
    if (!point.completedBy.map(id => id.toString()).includes(userId.toString())) {
      point.completedBy.push(userId);
      await task.save();
    }
    const updated = await Task.findById(taskId)
      .populate('createdBy', 'username')
      .populate('assignedTo', 'username')
      .populate('points.completedBy', 'username')
      .populate('files.uploadedBy', 'username');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ msg: 'Error updating point', error: error.message });
  }
};

// Untick a point
exports.untickPoint = async (req, res) => {
  try {
    const { taskId, pointIdx } = req.params;
    const userId = req.user._id;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ msg: 'Task not found' });
    const point = task.points[pointIdx];
    if (!point) return res.status(404).json({ msg: 'Point not found' });
    point.completedBy = point.completedBy.filter(id => id.toString() !== userId.toString());
    await task.save();
    const updated = await Task.findById(taskId)
      .populate('createdBy', 'username')
      .populate('assignedTo', 'username')
      .populate('points.completedBy', 'username')
      .populate('files.uploadedBy', 'username');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ msg: 'Error updating point', error: error.message });
  }
};

// Add file to task
exports.addFileToTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { filename, originalName, path } = req.body;
    
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ msg: 'Task not found' });
    
    task.files.push({
      filename,
      originalName,
      path,
      uploadedBy: req.user._id
    });
    
    await task.save();
    
    const updated = await Task.findById(taskId)
      .populate('createdBy', 'username')
      .populate('assignedTo', 'username')
      .populate('points.completedBy', 'username')
      .populate('files.uploadedBy', 'username');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ msg: 'Error adding file', error: error.message });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ msg: 'Task not found' });
    
    await Task.findByIdAndDelete(taskId);
    res.json({ msg: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ msg: 'Error deleting task', error: error.message });
  }
};
