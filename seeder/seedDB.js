const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User')
const Project = require('../models/Project')
const Task = require('../models/Task')
const fs = require('fs')
const path = require('path')

// Load environment variables
dotenv.config();

//Load Sample Dataset
// Load Seed Data from JSON Files
const usersData = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'data', 'users.json'), 'utf-8')
  );
  const projectsData = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'data', 'projects.json'), 'utf-8')
  );
  const tasksData = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'data', 'tasks.json'), 'utf-8')
  );

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected for Seeding');
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
};

// Seed Database
const seedDB = async () => {
  try {
    // Clear Existing Data
    await User.deleteMany({})
    await Project.deleteMany({})
    await Task.deleteMany({})
    console.log('Existing data cleared.');

    // Hash Passwords and Insert Users
    const hashedUsers = await Promise.all(
        usersData.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt)
        return { ...user, password: hashedPassword }
      })
    );

    const createdUsers = await User.insertMany(hashedUsers);
    console.log('Users Seeded');

    // Map users to an array of ObjectIds
    const userMap = createdUsers.map((user) => user._id.toString());
    console.log('User Map:', userMap);

    // Assign Projects to Admin :: first user is Admin from users.json
    const adminId = userMap[0];
    console.log('Admin ID:', adminId);


    const projectData = projectsData.map((project, pIndex) => {

        //Mapping Members to Projects based on Array Index
        let members = [];
    
        if (pIndex === 0) {
          members = [userMap[0], userMap[1]];
        } else if (pIndex === 1) {
          members = [userMap[0]];
        } else if (pIndex === 2) {
          members = [userMap[1]];
        }
      
        return {
          name: project.name,
          description: project.description,
          deadline: project.deadline,
          owner: adminId, // Admin is the owner of all projects
          members,
        };
      });


    const createdProjects = await Project.insertMany(projectData);
    console.log('Projects Seeded')

    //Map Projects from identifier
    const projectMap = createdProjects.map((projects) => projects._id.toString())

    // Assign Tasks to Users and Projects

    const taskAssigments = tasksData.map(async (task) => {
        return {
            title: task.title, 
            description: task.description, 
            status: task.status, 
            dueDate: task.dueDate, 
            project: projectMap[task.projectIndex], 
            assignedUser: userMap[task.assignedToIndex]
        }
    })

    const taskAssigmentsFinal = await Promise.all(taskAssigments);

    await Task.insertMany(taskAssigmentsFinal);
    console.log('Tasks Seeded');

    console.log('Database Seeding Complete');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

// Execute Seeding
connectDB().then(seedDB);
