const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
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
  const { project, user, status, startDate, endDate, overdue } = req.query;

  try {

    // Build the query object based on the optional params
    const query = {};

    if (project) {
      if (ObjectId.isValid(project) && typeof project === 'string') {
        query.project = new ObjectId(project);
      } else {
        return res.status(400).json({ message: 'Invalid Project Id' });
      }
    }

    if (user) {
      if (ObjectId.isValid(user) && typeof user === 'string') {
        query.assignedUser = new ObjectId(user);
      } else {
        return res.status(400).json({ message: 'Invalid User Id' });
      }
    }

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (overdue === 'true') {
      query.dueDate = { $lt: new Date() };
      query.status = { $in: ['In Progress', 'To Do'] }
    }

    const tasks = await Task.find(query)
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get Tasks - Grouped By User
exports.getTasksGroupedByUser = async (req, res) => {

  try {
    let pipeline = [];

    //Group Users
      pipeline.push({
        $group: {
          _id: '$assignedUser',
          tasks: { $push: '$$ROOT' },
          count: { $sum: 1 }
        },
      })

    //Lookup & Add User Details
      pipeline.push({
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      }, 
      {
        $unwind: '$userDetails'
      }, 
      {
        $project : {
          _id: 0, 
          name: '$userDetails.name', 
          count: 1,
          tasks: 1
        }
      })

    const groupedTasks = await Task.aggregate(pipeline)
    res.json(groupedTasks);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

//Get Tasks - Grouped By Priority
exports.getTasksGroupedByPriority = async (req, res) => {

  try {
    let pipeline = [];

    //Group Users
      pipeline.push({
        $group: {
          _id: '$priority',
          tasks: { $push: '$$ROOT' },
          count: { $sum: 1 }
        },
      })

    //Add Priority Type
      pipeline.push(
      {
        $project : {
          _id: 0, 
          priority: '$_id', 
          count: 1,
          tasks: 1
        }
      })

    const groupedTasks = await Task.aggregate(pipeline)
    res.json(groupedTasks);
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
