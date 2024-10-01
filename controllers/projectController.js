const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

// Create Project
exports.createProject = async (req, res) => {
  const { name, description, deadline, members } = req.body;

  try {
    const project = new Project({
      name,
      description,
      deadline,
      owner: req.user._id,
      members: [...members, req.user._id], // Ensure owner is a member
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get All Projects for User
exports.getUserProjects = async (req, res) => {
  try {
    const projects = await Project.find({ members: req.user._id });
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get Single Project
exports.getProjectById = async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await Project.findById(projectId).populate('members', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Optional: Check if user is a member of the project
    if (!project.members.some(member => member._id.equals(req.user._id))) {
      return res.status(403).json({ message: 'Not authorized to view this project' });
    }

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Update Project
exports.updateProject = async (req, res) => {
  const { projectId } = req.params;
  const { name, description, deadline, members } = req.body;

  try {
    let project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Only the owner can update the project
    if (!project.owner.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    if (name) project.name = name;
    if (description) project.description = description;
    if (deadline) project.deadline = deadline;
    if (members) project.members = [...new Set([...members, project.owner.toString()])];

    await project.save();
    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Delete Project
exports.deleteProject = async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Only the owner can delete the project
    if (!project.owner.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    // Optionally, delete all tasks related to the project
    await Task.deleteMany({ project: projectId });

    await project.deleteOne();
    res.json({ message: 'Project removed' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};
