const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const { redisClient } = require('../config/cache');
const { updateCachedList } = require('../utils/redis')
const { parseDate } = require('../utils/date_parser')

// Create Task
exports.createTask = async (req, res) => {
  const { title, description, status, dueDate, projectId, assignedUser, priority, label } = req.body;

  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Check if user is part of the project
    if (req.user.role !== 'admin' && !project.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Access denied. Not authorized to add tasks to this project' });
    }

    //Check user and user role and task creation permissions 
    let taskAssignee = req.user._id;
    if (req.user.role === 'admin' && assignedUser) {
      const assignedUserExists = await User.findById(assignedUser);

      if (!assignedUserExists) {
        return res.status(400).json({ message: 'Assigned user does not exist' });
      }

      if (!project.members.includes(assignedUser)) {
        project.members.push(assignedUser);
        await project.save();
      }

      //Assign Task to the user
      taskAssignee = assignedUser;
    }


    //Check if task already exists with same criteria
    const duplicateTask = await Task.findOne({
      title: title,
      description: description,
      project: projectId,
    });

    if (duplicateTask) {
      return res.status(400).json({ message: 'Task already exists' });
    }

    const parsedDueDate = parseDate(dueDate);

    const task = new Task({
      title,
      description,
      status,
      priority,
      dueDate: parsedDueDate,
      project: projectId,
      assignedUser: taskAssignee,
      label
    });

    const savedTask = await task.save();

    //Update the cached task list
    if (redisClient !== null && process.env.NODE_ENV !== 'test') {
      const redisKeyPattern = 'tasks:*';
      await updateCachedList(task._id.toString(), savedTask, redisKeyPattern, 'create');
    }

    res.status(201).json(savedTask);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get Tasks - Optional Params (by Project, by User, by Status)
exports.getTasks = async (req, res) => {
  const { page = 1, limit = 10, project, user, status, startDate, endDate, overdue, priority, label } = req.query;

  // Create a unique Redis key based on the query parameters
  const redisKey = `tasks:${JSON.stringify(req.query)}:${page}:${limit}`;

  try {

    // Build the query object based on the optional params
    const query = {};

    if (project) {
      if (ObjectId.isValid(project) && typeof project === 'string') {
        query.project = project;
      } else {
        return res.status(400).json({ message: 'Invalid Project Id' });
      }
    }

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (label) {
      query.label = label
    }

    if (startDate || endDate) {

      const parsedStartDate = parseDate(startDate);
      const parsedEndDate = parseDate(endDate);
      query.createdAt = {};

      if (startDate) query.createdAt.$gte = new Date(parsedStartDate);
      if (endDate) query.createdAt.$lte = new Date(parsedEndDate);
    }

    if (overdue === 'true') {
      query.dueDate = { $lt: new Date() };
      query.status = { $in: ['In Progress', 'To Do'] }
    }

    if (req.user.role === 'user') {
      query.assignedUser = req.user._id;
    } else if (req.user.role === 'admin') {
      if (user) {
        if (ObjectId.isValid(user) && typeof user === 'string') {
          query.assignedUser = new ObjectId(user);
        } else {
          return res.status(400).json({ message: 'Invalid User Id' });
        }
      }
    }

    const tasks = await Task.find(query)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ dueDate: 1 })

    const total = await Task.countDocuments(query);


    // Set-up Cache the result for 1 hour, but skip if NODE_ENV is 'test'
    if (redisClient !== null && process.env.NODE_ENV !== 'test') {
      try {
        await redisClient.setEx(redisKey, 3600, JSON.stringify({ total, page, pages: Math.ceil(total / limit), tasks }));
      } catch (error) {
        if (error.message.includes('MISCONF')) {
          console.warn('Redis write failed due to persistence issue, skipping cache.');
        } else {
          console.error('Error caching response:', error);
        }
      }
    }

    res.json({
      total, page: parseInt(page),
      pages: Math.ceil(total / limit),
      tasks
    });
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
        $project: {
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

    //Filter tasks for non admin users
    if (req.user.role === 'user') {
      pipeline.push({
        $match: { assignedUser: req.user._id }
      });
    }

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
        $project: {
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
  const { id } = req.params;
  const { title, description, status, dueDate, assignedUser, priority, label } = req.body;

  try {
    let task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Check if user is authorized to update the task
    if (task.assignedUser.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Not authorized to edit this task' });
    }

    if (title) task.title = title;
    if (description) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (dueDate) {
      let parsedDueDate = parseDate(dueDate);
      task.dueDate = parsedDueDate
    }
    if (assignedUser) task.assignedUser = assignedUser;
    if (label) task.label = label;

    const updatedTask = await task.save();

    // Update Task in cache list
    if (redisClient !== null && process.env.NODE_ENV !== 'test') {
      const redisKeyPattern = 'tasks:*';
      await updateCachedList(task._id.toString(), updatedTask.toObject(), redisKeyPattern, 'update');
    }

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Delete Task
exports.deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (task.assignedUser.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Not authorized to delete this task' });
    }

    await task.deleteOne();

    if (redisClient !== null && process.env.NODE_ENV !== 'test') {
      const redisKeyPattern = 'tasks:*';
      await updateCachedList(task._id.toString(), null, redisKeyPattern, 'delete');
    }

    res.json({ message: 'Task removed' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};
