const Task = require('../models/Task');
const Project = require('../models/Project');

// Create Task
exports.createTask = async (req, res) => {
  const { title, description, status, dueDate, projectId, assignedUser, priority } = req.body;

  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Check if user is part of the project
    if (!project.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to add tasks to this project' });
    }

    //Check if task already exists with same criteria
    const duplicateTask = await Task.findOne({
      title: title,
      description: description,
      project: projectId,
      assignedUser: assignedUser,
    });

    if (duplicateTask) {
      return res.status(400).json({ message: 'Task already exists' });
    }

    const task = new Task({
      title,
      description,
      status,
      priority,
      dueDate,
      project: projectId,
      assignedUser,
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get Tasks - Optional Params (by Project, by User, by Status)
exports.getTasks = async (req, res) => {
  const { project, user, status, startDate, endDate } = req.query;

  try {

    // Build the query object based on the optional params
    const query = {};

    if (project) {
      query.project = project;
    }

    if (user) {
      query.assignedUser = user;
    }

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const tasks = await Task.find(query)
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Update Task
exports.updateTask = async (req, res) => {
  const { taskId } = req.params;
  const { title, description, status, dueDate, assignedUser, priority } = req.body;

  try {
    let task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Optional: Check if user is authorized to update the task
    // e.g., task.owner === req.user._id or similar

    if (title) task.title = title;
    if (description) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (dueDate) task.dueDate = dueDate;
    if (assignedUser) task.assignedUser = assignedUser;

    await task.save();
    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Delete Task
exports.deleteTask = async (req, res) => {
  const { taskId } = req.params;

  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};
