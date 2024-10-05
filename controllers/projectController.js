const moment = require('moment');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

// Create Project
exports.createProject = async (req, res) => {
  const { name, description, deadline, members } = req.body;

  if(req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Not authorized to create a project' });
  }

  let parsedDeadline = moment(deadline, "DD/MM/YYYY").toDate();

  //Check if task already exists with same criteria
  const duplicateProject = await Project.findOne({
    name: name,
    description: description,
    deadline: parsedDeadline,
  });

  if (duplicateProject) {
    return res.status(400).json({ message: 'Project already exists' });
  }
  
  let projectMembers;
  if(members && members.length) {
    projectMembers = [...members, req.user._id]
  } else {
    projectMembers = [req.user._id]
  }

  try {
    const project = new Project({
      name,
      description,
      deadline: parsedDeadline,
      owner: req.user._id,
      members: projectMembers,
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    console.log(error);
    res.status(500).send('Server error');
  }
};

// Get All Projects for User
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ members: req.user._id });
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get Project By Id
exports.getProjectById = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Check if user is a member of the project
    if (!project.members.some(member => member._id.equals(req.user._id))) {
      return res.status(403).json({ message: 'Access denied. Not authorized to view this project' });
    }

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get Tasks for a Project by Id
exports.getProjectTasksById = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Check if user is a member of the project
    if (!project.members.some(member => member._id.equals(req.user._id))) {
      return res.status(403).json({ message: 'Access denied. Not authorized to view this project' });
    }

    let tasks
    // Check if user or admin and return tasks accordingly
    if (req.user.role === 'admin') {
      tasks = await Task.find({ project: id });
    }

    if (req.user.role === 'user') {
      tasks = await Task.find({ project: id, assignedUser: req.user._id });
    }

    if (tasks.length === 0) {
      return res.status(404).json({ message: 'No tasks found for this project' });
    }

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Update Project
exports.updateProject = async (req, res) => {
  const { id } = req.params;
  const { name, description, deadline, members } = req.body;

  try {
    let project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Only the project owner can update the project
    if (!project.owner.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied. Not authorized to update this project' });
    }

    if (name) project.name = name;
    if (description) project.description = description;
    if (deadline) project.deadline = deadline;
    if (members) project.members = [...new Set([...members, project.owner.toString()])];

    await project.save();
    res.json({ message: 'Project Details Updated!' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Delete Project
exports.deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Only the owner can delete the project
    if (!project.owner.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    // Optionally, delete all tasks related to the project
    await Task.deleteMany({ project: id });

    await project.deleteOne();
    res.json({ message: 'Project removed' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};
