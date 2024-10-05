exports.usersTestData = [
    {
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'admin123',
        role: 'admin',
    },
    {
        name: 'Test User 1',
        email: 'user1@test.com',
        password: 'user123',
        role: 'user',
    },
    {
        name: 'Test User 2',
        email: 'user2@test.com',
        password: 'user123',
        role: 'user',
    },
];

exports.projectsTestData = [
    {
        name: 'Test Project 1',
        description: 'Add a test project 1',
        deadline: '2024-01-10',
    },
    {
        name: 'Test Project 2',
        description: 'Add a test project 2',
        deadline: '2024-01-11',
    }, 
    {
        name: 'Test Project 3',
        description: 'Add a test project 3',
        deadline: '2024-01-12',
    }
]

exports.tasksTestData = [
    {
        title: 'Test Task 1',
        description: 'Add a test task to project 1',
        dueDate: '2024-09-01',
        status: "Completed",
        priority: "Low",
        projectIndex: 0,
        assignedToIndex: 1
    },
    {
        title: 'Test Task 2',
        description: 'Add a test task to project 1',
        dueDate: '2024-09-15',
        status: "To Do",
        priority: "High",
        projectIndex: 0,
        assignedToIndex: 1
    },
    {
        title: 'Test Task 3',
        description: 'Add a test task to project 2',
        dueDate: '2024-10-01',
        status: "In Progress",
        priority: "Medium",
        projectIndex: 1,
        assignedToIndex: 2
    },
    {
        title: 'Test Task 4',
        description: 'Add a test task to project 2',
        dueDate: '2024-10-15',
        status: "To Do",
        priority: "Low",
        projectIndex: 1,
        assignedToIndex: 2
    }, 
    {
        title: 'Test Task 5',
        description: 'Add a test task to project 3',
        dueDate: '2024-12-01',
        status: "In Progress",
        priority: "Medium",
        projectIndex: 2,
        assignedToIndex: 2
    },
    {
        title: 'Test Task 6',
        description: 'Add a test task to project 3',
        dueDate: '2024-12-15',
        status: "To Do",
        priority: "Low",
        projectIndex: 2,
        assignedToIndex: 2
    }
]