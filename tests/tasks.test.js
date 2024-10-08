const supertest = require('supertest')
const createServer = require('../utils/app')
const generateToken = require('../utils/generate_token')
const User = require('../models/User')
const Project = require('../models/Project')
const Task = require('../models/Task')
const { parseDate } = require('../utils/date_parser');
const dayjs = require('dayjs')

const sampleTaskPayload = {
    title: 'Unit Test Task',
    description: 'Add a unit test task to a project',
    dueDate: '09/09/2024',
    status: "To Do",
    priority: "Medium",
    label: 'Green'
}

const updateTaskStatusPayload = {
    status: "In Progress"
}

const updateTaskDueDatePayload = {
    dueDate: "22/09/2024",
}

let app,
    admin,
    adminToken,
    user1,
    userToken1,
    user2,
    userToken2,
    projectId1,
    projectId2,
    projectId3,
    taskId1,
    taskId2

describe('Task Test Suite', () => {
    beforeAll(async () => {
        app = createServer();

        // Retrieve test admin 
        admin = await User.findOne({ email: 'admin@test.com' })
        adminToken = generateToken(admin._id, admin.role);

        // Retrieve test users & generate tokens
        user1 = await User.findOne({ email: 'user1@test.com' })
        userToken1 = generateToken(user1._id, user1.role);

        user2 = await User.findOne({ email: 'user2@test.com' })
        userToken2 = generateToken(user2._id, user2.role);

        // Retrieve project id's
        const project1 = await Project.findOne({ name: 'Test Project 1' });
        const project2 = await Project.findOne({ name: 'Test Project 2' });
        const project3 = await Project.findOne({ name: 'Test Project 3' });
        projectId1 = project1._id.toString();
        projectId2 = project2._id.toString();
        projectId3 = project3._id.toString();

        // Retrieve tasks
        const task1 = await Task.findOne({ title: 'Test Task 2' })
        const task2 = await Task.findOne({ title: 'Test Task 15' })

        taskId1 = task1._id.toString();
        taskId2 = task2._id.toString();
    });

    afterAll(() => {
        process.removeAllListeners();
    });


    describe('Create a new task', () => {
        it('should create a new task by admin', async () => {
            let createTaskPayload = { ...sampleTaskPayload, projectId: projectId1, assignedUser: user1._id.toString() }

            const res = await supertest(app)
                .post('/tasks')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(createTaskPayload);

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('title', sampleTaskPayload.title);
            expect(res.body).toHaveProperty('description', sampleTaskPayload.description);
            expect(res.body).toHaveProperty('assignedUser', user1._id.toString());
            expect(res.body).toHaveProperty('project', projectId1);
            expect(res.body).toHaveProperty('status', sampleTaskPayload.status);
            expect(res.body).toHaveProperty('priority', sampleTaskPayload.priority);
            expect(res.body).toHaveProperty('label', sampleTaskPayload.label);
            expect(res.body).toHaveProperty('createdAt');
            expect(res.body).toHaveProperty('updatedAt');
            let payloadDate = parseDate(sampleTaskPayload.dueDate);
            expect(dayjs.utc(res.body.dueDate).isSame(payloadDate, 'second')).toBe(true);

            sampleTaskId = res.body._id.toString();
        });

        it('should not allow creating a duplicate task', async () => {
            let createTaskPayload = { ...sampleTaskPayload, projectId: projectId1, assignedUser: user1._id.toString() }

            const res = await supertest(app)
                .post('/tasks')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(createTaskPayload);

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'Task already exists');
        });

        it('should not allow creating a task by a user without project access', async () => {
            let createTaskPayload = { ...sampleTaskPayload, projectId: projectId3, assignedUser: user1._id.toString() }

            const res = await supertest(app)
                .post('/tasks')
                .set('Authorization', `Bearer ${userToken1}`)
                .send(createTaskPayload);

            expect(res.statusCode).toEqual(403);
            expect(res.body).toHaveProperty('message', 'Access denied. Not authorized to add tasks to this project');
        });
    })

    describe('Create a new task - Validation Tests', () => {
        it('should return validation error for missing task title', async () => {
            let createTaskPayload = { ...sampleTaskPayload, title: undefined, projectId: projectId1, assignedUser: user1._id.toString() };

            const res = await supertest(app)
                .post('/tasks')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(createTaskPayload);

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('errors');
            expect(res.body.errors[0]).toHaveProperty('message', 'Please include a task title');
        });

        it('should return validation error for missing task description', async () => {
            let createTaskPayload = { ...sampleTaskPayload, description: undefined, projectId: projectId1, assignedUser: user1._id.toString() };

            const res = await supertest(app)
                .post('/tasks')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(createTaskPayload);

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('errors');
            expect(res.body.errors[0]).toHaveProperty('message', 'Please include a task description');
        });

        it('should return validation error for missing task status', async () => {
            let createTaskPayload = { ...sampleTaskPayload, status: undefined, projectId: projectId1, assignedUser: user1._id.toString() };

            const res = await supertest(app)
                .post('/tasks')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(createTaskPayload);

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('errors');
            expect(res.body.errors[0]).toHaveProperty('message', 'Please include a task status');
        });

        it('should return validation error for missing task priority', async () => {
            let createTaskPayload = { ...sampleTaskPayload, priority: undefined, projectId: projectId1, assignedUser: user1._id.toString() };

            const res = await supertest(app)
                .post('/tasks')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(createTaskPayload);

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('errors');
            expect(res.body.errors[0]).toHaveProperty('message', 'Please include a task priority');
        });

        it('should return validation error for missing or invalid due date', async () => {
            let createTaskPayload = { ...sampleTaskPayload, dueDate: 'invalid-date', projectId: projectId1, assignedUser: user1._id.toString() };

            const res = await supertest(app)
                .post('/tasks')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(createTaskPayload);

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('errors');
            expect(res.body.errors[0]).toHaveProperty('message', 'Invalid deadline format, use DD/MM/YYYY, DD-MM-YYYY, DD-MM-YY, or DD/MM/YY');
        });

        it('should return validation error for missing projectId', async () => {
            let createTaskPayload = { ...sampleTaskPayload, projectId: undefined, assignedUser: user1._id.toString() };

            const res = await supertest(app)
                .post('/tasks')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(createTaskPayload);

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('errors');
            expect(res.body.errors[0]).toHaveProperty('message', 'Please include a valid project id');
        });

        it('should return validation error for invalid projectId format', async () => {
            let createTaskPayload = { ...sampleTaskPayload, projectId: 'invalid-id', assignedUser: user1._id.toString() };

            const res = await supertest(app)
                .post('/tasks')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(createTaskPayload);

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('errors');
            expect(res.body.errors[0]).toHaveProperty('message', 'Invalid project id format');
        });

        it('should return validation error for missing assignedUser', async () => {
            let createTaskPayload = { ...sampleTaskPayload, projectId: projectId1, assignedUser: undefined };

            const res = await supertest(app)
                .post('/tasks')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(createTaskPayload);

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('errors');
            expect(res.body.errors[0]).toHaveProperty('message', 'Please include a valid assigned user id');
        });

        it('should return validation error for invalid assignedUser format', async () => {
            let createTaskPayload = { ...sampleTaskPayload, projectId: projectId1, assignedUser: 'invalid-id' };

            const res = await supertest(app)
                .post('/tasks')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(createTaskPayload);

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('errors');
            expect(res.body.errors[0]).toHaveProperty('message', 'Invalid user id format');
        });
    });

    describe('Get tasks with optional filters - Validation Tests', () => {
        it('should return 400 for invalid project ID', async () => {
            const res = await supertest(app)
                .get(`/tasks?project=invalidProjectId`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(400);
            expect(res.body.errors[0].message).toBe('Invalid project id format');
        });

        it('should return 400 for invalid user ID', async () => {
            const res = await supertest(app)
                .get(`/tasks?user=invalidUserId`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(400);
            expect(res.body.errors[0].message).toBe('Invalid user id format');
        });

        it('should return 400 for invalid status', async () => {
            const res = await supertest(app)
                .get(`/tasks?status=InvalidStatus`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(400);
            expect(res.body.errors[0].message).toBe('Invalid task status');
        });

        it('should return 400 for invalid priority', async () => {
            const res = await supertest(app)
                .get(`/tasks?priority=Invalid`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(400);
            expect(res.body.errors[0].message).toBe('Invalid task priority type');
        });

        it('should return 400 for invalid date format', async () => {
            const res = await supertest(app)
                .get(`/tasks?startDate=invalidDate`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(400);
            expect(res.body.errors[0].message).toBe('Invalid dueDate format, use DD/MM/YYYY, DD-MM-YYYY, DD-MM-YY, or DD/MM/YY');
        });

        it('should return 400 for invalid overdue boolean', async () => {
            const res = await supertest(app)
                .get(`/tasks?overdue=invalidBoolean`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(400);
            expect(res.body.errors[0].message).toBe('Overdue must be a boolean value');
        });

        it('should list all tasks without filters & pagination', async () => {
            const res = await supertest(app)
                .get('/tasks')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('total');
            expect(res.body).toHaveProperty('page', 1);
            expect(res.body).toHaveProperty('pages', 2);
            expect(Array.isArray(res.body.tasks)).toBe(true);
            expect(res.body.tasks.length).toBeGreaterThan(0);
        });

        it('should list all tasks with pagination', async () => {
            const res = await supertest(app)
                .get('/tasks?page=2&limit=10')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('total');
            expect(res.body).toHaveProperty('page', 2);
            expect(res.body).toHaveProperty('pages', 2);
            expect(Array.isArray(res.body.tasks)).toBe(true);
            expect(res.body.tasks.length).toBeGreaterThan(0);
        });
    });

    describe('Get tasks with optional filters - Admin', () => {
        it('should list all tasks without filters', async () => {
            const res = await supertest(app)
                .get('/tasks')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('total');
            expect(res.body).toHaveProperty('page');
            expect(res.body).toHaveProperty('pages');
            expect(Array.isArray(res.body.tasks)).toBe(true);
            expect(res.body.tasks.length).toBeGreaterThan(0);
        });

        it('should list tasks filtered by project', async () => {
            const res = await supertest(app)
                .get(`/tasks?project=${projectId1}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('total');
            expect(res.body).toHaveProperty('page');
            expect(res.body).toHaveProperty('pages');
            expect(Array.isArray(res.body.tasks)).toBe(true);
            expect(res.body.tasks.length).toBeGreaterThan(0);
            res.body.tasks.forEach(task => {
                expect(task.project).toEqual(projectId1);
            });
        });

        it('should list tasks filtered by user', async () => {
            const res = await supertest(app)
                .get(`/tasks?user=${user1._id.toString()}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('total');
            expect(res.body).toHaveProperty('page');
            expect(res.body).toHaveProperty('pages');
            expect(Array.isArray(res.body.tasks)).toBe(true);
            expect(res.body.tasks.length).toBeGreaterThan(0);
            res.body.tasks.forEach(task => {
                expect(task.assignedUser).toEqual(user1._id.toString());
            });
        });

        it('should list tasks filtered by status', async () => {
            const res = await supertest(app)
                .get(`/tasks?status=To Do`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('total');
            expect(res.body).toHaveProperty('page');
            expect(res.body).toHaveProperty('pages');
            expect(Array.isArray(res.body.tasks)).toBe(true);
            expect(res.body.tasks.length).toBeGreaterThan(0);
            res.body.tasks.forEach(task => {
                expect(task.status).toEqual('To Do');
            });
        });

        it('should list tasks filtered by project, user, and status', async () => {
            const res = await supertest(app)
                .get(`/tasks?project=${projectId1}&user=${user1._id.toString()}&status=To Do`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('total');
            expect(res.body).toHaveProperty('page');
            expect(res.body).toHaveProperty('pages');
            expect(Array.isArray(res.body.tasks)).toBe(true);
            expect(res.body.tasks.length).toBeGreaterThan(0);
            res.body.tasks.forEach(task => {
                expect(task.project).toEqual(projectId1);
                expect(task.assignedUser).toEqual(user1._id.toString());
                expect(task.status).toEqual('To Do');
            });
        });

        it('should return an empty list if no tasks match the filters', async () => {
            const res = await supertest(app)
                .get(`/tasks?priority=High&project=${projectId1}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('total');
            expect(res.body).toHaveProperty('page');
            expect(res.body).toHaveProperty('pages');
            expect(Array.isArray(res.body.tasks)).toBe(true);
            expect(res.body.tasks.length).toEqual(0);
        });

        it('should list tasks filtered by date range', async () => {
            const res = await supertest(app)
                .get(`/tasks?startDate=01/10/2024&endDate=30/10/2024`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('total');
            expect(res.body).toHaveProperty('page');
            expect(res.body).toHaveProperty('pages');
            expect(Array.isArray(res.body.tasks)).toBe(true);
            expect(res.body.tasks.length).toBeGreaterThan(0);
        });

        it('should list tasks overdue', async () => {
            const res = await supertest(app)
                .get(`/tasks?overdue=true`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('total');
            expect(res.body).toHaveProperty('page');
            expect(res.body).toHaveProperty('pages');
            expect(Array.isArray(res.body.tasks)).toBe(true);
            expect(res.body.tasks.length).toBeGreaterThan(0);
        });
    });

    describe('Get tasks with optional filters - User', () => {
        it('should list all tasks without filters', async () => {
            const res = await supertest(app)
                .get('/tasks')
                .set('Authorization', `Bearer ${userToken1}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('total');
            expect(res.body).toHaveProperty('page');
            expect(res.body).toHaveProperty('pages');
            expect(Array.isArray(res.body.tasks)).toBe(true);
            expect(res.body.tasks.length).toBeGreaterThan(0);
        });

        it('should list tasks filtered by project', async () => {
            const res = await supertest(app)
                .get(`/tasks?project=${projectId1}`)
                .set('Authorization', `Bearer ${userToken1}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('total');
            expect(res.body).toHaveProperty('page');
            expect(res.body).toHaveProperty('pages');
            expect(Array.isArray(res.body.tasks)).toBe(true);
            expect(res.body.tasks.length).toBeGreaterThan(0);
            res.body.tasks.forEach(task => {
                expect(task.project).toEqual(projectId1.toString());
            });
        });

        it('should not list tasks filtered by project without access', async () => {
            const res = await supertest(app)
                .get(`/tasks?project=${projectId3}`)
                .set('Authorization', `Bearer ${userToken1}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('total');
            expect(res.body).toHaveProperty('page');
            expect(res.body).toHaveProperty('pages');
            expect(Array.isArray(res.body.tasks)).toBe(true);
            expect(res.body.tasks.length).toEqual(0);
        });

        it('should list tasks filtered by user', async () => {
            const res = await supertest(app)
                .get(`/tasks?user=${user1._id.toString()}`)
                .set('Authorization', `Bearer ${userToken1}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('total');
            expect(res.body).toHaveProperty('page');
            expect(res.body).toHaveProperty('pages');
            expect(Array.isArray(res.body.tasks)).toBe(true);
            res.body.tasks.forEach(task => {
                expect(task.assignedUser).toEqual(user1._id.toString());
            });
        });

        it('should list tasks filtered by status', async () => {
            const res = await supertest(app)
                .get(`/tasks?status=To Do`)
                .set('Authorization', `Bearer ${userToken1}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('total');
            expect(res.body).toHaveProperty('page');
            expect(res.body).toHaveProperty('pages');
            expect(Array.isArray(res.body.tasks)).toBe(true);
            res.body.tasks.forEach(task => {
                expect(task.status).toEqual('To Do');
            });
        });

        it('should return an empty list if no tasks match the filters', async () => {
            const res = await supertest(app)
                .get(`/tasks?priority=Low`)
                .set('Authorization', `Bearer ${userToken1}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('total');
            expect(res.body).toHaveProperty('page');
            expect(res.body).toHaveProperty('pages');
            expect(Array.isArray(res.body.tasks)).toBe(true);
        });

        it('should list tasks filtered by date range', async () => {
            const res = await supertest(app)
                .get(`/tasks?startDate=01-10-2024&endDate=30-10-2024`)
                .set('Authorization', `Bearer ${userToken1}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('total');
            expect(res.body).toHaveProperty('page');
            expect(res.body).toHaveProperty('pages');
            expect(Array.isArray(res.body.tasks)).toBe(true);
        });

        it('should list tasks overdue', async () => {
            const res = await supertest(app)
                .get(`/tasks?overdue=true`)
                .set('Authorization', `Bearer ${userToken1}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('total');
            expect(res.body).toHaveProperty('page');
            expect(res.body).toHaveProperty('pages');
            expect(Array.isArray(res.body.tasks)).toBe(true);
        });
    });

    describe('Get tasks with groupBy conditions', () => {
        it('should list group tasks by user', async () => {
            const res = await supertest(app)
                .get(`/tasks/groupedByUser`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            res.body.forEach(result => {
                expect(result).toHaveProperty('tasks');
                expect(result).toHaveProperty('count');
                expect(result).toHaveProperty('name');
            });
        });

        it('should not list group tasks by user unless an admin', async () => {
            const res = await supertest(app)
                .get(`/tasks/groupedByUser`)
                .set('Authorization', `Bearer ${userToken1}`);

            expect(res.statusCode).toEqual(403);
            expect(res.body).toHaveProperty('message', 'Access denied. Admins only.');
        });

        it('should list group tasks by priority for an admin', async () => {
            const res = await supertest(app)
                .get(`/tasks/groupedByPriority`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            res.body.forEach(result => {
                expect(result).toHaveProperty('tasks');
                expect(result).toHaveProperty('count');
                expect(result).toHaveProperty('priority');
            });
        });

        it('should list group tasks by priority for a user', async () => {
            const res = await supertest(app)
                .get(`/tasks/groupedByPriority`)
                .set('Authorization', `Bearer ${userToken1}`);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            res.body.forEach(result => {
                expect(result).toHaveProperty('tasks');
                expect(result).toHaveProperty('count');
                expect(result).toHaveProperty('priority');
            });
        });


    });

    describe('Update a task by admin', () => {
        it('should update a task status', async () => {
            const res = await supertest(app)
                .put(`/tasks/${taskId1}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateTaskStatusPayload)

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('status', updateTaskStatusPayload.status);
        });
        it('should update a task due date', async () => {
            const res = await supertest(app)
                .put(`/tasks/${taskId1}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateTaskDueDatePayload)

            expect(res.statusCode).toEqual(200);
            let payloadDate = parseDate(updateTaskDueDatePayload.dueDate);
            expect(dayjs.utc(res.body.dueDate).isSame(payloadDate, 'second')).toBe(true);
        });
    });

    describe('Update a task by user', () => {
        it('should update a task status', async () => {
            const res = await supertest(app)
                .put(`/tasks/${taskId1}`)
                .set('Authorization', `Bearer ${userToken1}`)
                .send(updateTaskStatusPayload)

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('status', updateTaskStatusPayload.status);
        });

        it('should update a task due date', async () => {
            const res = await supertest(app)
                .put(`/tasks/${taskId1}`)
                .set('Authorization', `Bearer ${userToken1}`)
                .send(updateTaskDueDatePayload)

            expect(res.statusCode).toEqual(200);
            let payloadDate = parseDate(updateTaskDueDatePayload.dueDate);
            expect(dayjs.utc(res.body.dueDate).isSame(payloadDate, 'second')).toBe(true);
        });

        it('should not update a task due date by user without being assigned', async () => {
            const res = await supertest(app)
                .put(`/tasks/${taskId2}`)
                .set('Authorization', `Bearer ${userToken1}`)
                .send(updateTaskDueDatePayload)

            expect(res.statusCode).toEqual(403);
            expect(res.body).toHaveProperty('message', 'Access denied. Not authorized to edit this task');
        });

        it('should return validation error for invalid taskId format', async () => {
            const res = await supertest(app)
                .put('/tasks/randomstring')
                .set('Authorization', `Bearer ${adminToken}`)

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('errors');
            expect(res.body.errors[0]).toHaveProperty('message', 'Invalid task id format');

        });
    });

    describe('Delete a task by admin', () => {
        it('should delete a task', async () => {
            const res = await supertest(app)
                .delete(`/tasks/${taskId1}`)
                .set('Authorization', `Bearer ${adminToken}`)

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message', 'Task removed');
        });

        it('should return validation error for invalid taskId format', async () => {
            const res = await supertest(app)
                .delete('/tasks/randomstring')
                .set('Authorization', `Bearer ${adminToken}`)

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('errors');
            expect(res.body.errors[0]).toHaveProperty('message', 'Invalid task id format');

        });
    });

    describe('Delete a task by user', () => {
        it('should return unauthorized error for an unassigned user', async () => {
            const res = await supertest(app)
                .delete(`/tasks/${taskId2}`)
                .set('Authorization', `Bearer ${userToken1}`)

            expect(res.statusCode).toEqual(403);
            expect(res.body).toHaveProperty('message', 'Access denied. Not authorized to delete this task');
        });

        it('should delete a task', async () => {
            const res = await supertest(app)
                .delete(`/tasks/${taskId2}`)
                .set('Authorization', `Bearer ${userToken2}`)

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message', 'Task removed');
        });
    });
});