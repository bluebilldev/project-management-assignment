const bcrypt = require('bcryptjs');
const User = require('../models/User')
const Project = require('../models/Project')
const Task = require('../models/Task')


// Seed Database
const seedDB = async (usersData, projectsData, tasksData) => {
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

        // Assign Projects to Admin :: first user is Admin from users.json
        const adminId = userMap[0];

        const projectData = projectsData.map((project, pIndex) => {

            //Mapping Members to Projects based on Array Index
            let members = [];

            if (pIndex === 0) {
                members = [userMap[0], userMap[1], userMap[2]];
            } else if (pIndex === 1) {
                members = [userMap[0], userMap[1]];
            } else if (pIndex === 2) {
                members = [userMap[0], userMap[2]];
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

    } catch (error) {
        console.error(error);
    }
};

module.exports = { seedDB }