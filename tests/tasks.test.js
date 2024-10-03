const supertest = require('supertest')
const createServer = require('../utils/app')
const generateToken = require('../utils/generate_token')
const User = require('../models/User');
const Project = require('../models/Project')


const sampleTaskPayload = {
    title: 'Test Task 1',
    description: 'Add a test task to a project',
    dueDate: '2024-09-20T00:00:00.000Z',
    status: "To Do",
    priority: "Medium",
    projectId: "",
    assignedUser: ""
}

const updateTaskStatusPayload = {
    status: "In Progress"
}

const updateTaskDueDatePayload = {
    dueDate: "2024-10-22T00:00:00.000Z",
}

let app;
let authToken;

describe('Task Test Suite', () => {
    beforeAll(async () => {
        // Set JWT secret and expiration for test environment
        process.env.JWT_SECRET = 'testsecretsauce';
        process.env.JWT_EXPIRE = '1h';

        app = createServer();

        //Create a user to test task
        const user = new User({
            name: 'Task Test User',
            email: 'task@user.com',
            password: 'task123',
            role: 'user'
        });
        const savedUser = await user.save();
        sampleTaskPayload.assignedUser = savedUser._id.toString();

        //Create a project to test new task addition
        const project = new Project({
            name: 'Task Test Project',
            description: 'A project to test task creation',
            owner: sampleTaskPayload.assignedUser,
            members: [sampleTaskPayload.assignedUser],
            deadline: '2024-12-31T00:00:00.000Z'
        });
        const savedProject = await project.save();
        sampleTaskPayload.projectId = savedProject._id.toString();

        //Auth Token for Subsequent Tests    
        authToken = generateToken(savedUser._id, savedUser.role);
    });

    afterAll(() => {
        process.removeAllListeners();
    });


    describe('Create a new task', () => {
        it('should create a new task', async () => {
            const res = await supertest(app)
                .post('/tasks')
                .set('Authorization', `Bearer ${authToken}`)
                .send(sampleTaskPayload);

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('title', sampleTaskPayload.title);
            expect(res.body).toHaveProperty('description', sampleTaskPayload.description);
            expect(res.body).toHaveProperty('dueDate', sampleTaskPayload.dueDate);
            expect(res.body).toHaveProperty('assignedUser', sampleTaskPayload.assignedUser);
            expect(res.body).toHaveProperty('project', sampleTaskPayload.projectId);
            expect(res.body).toHaveProperty('status', sampleTaskPayload.status);
            expect(res.body).toHaveProperty('priority', sampleTaskPayload.priority);
            expect(res.body).toHaveProperty('createdAt');
            expect(res.body).toHaveProperty('updatedAt');

            sampleTaskPayload._id = res.body._id.toString();
        });

        it('should not allow creating a duplicate task', async () => {
            const res = await supertest(app)
                .post('/tasks')
                .set('Authorization', `Bearer ${authToken}`)
                .send(sampleTaskPayload);

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'Task already exists');
        });
    })

    describe('Get tasks with optional filters', () => {
        it('should list all tasks without filters', async () => {
            const res = await supertest(app)
                .get('/tasks')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
        });

        it('should list tasks filtered by project', async () => {
            const res = await supertest(app)
                .get(`/tasks?project=${sampleTaskPayload.projectId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            res.body.forEach(task => {
                expect(task.project).toEqual(sampleTaskPayload.projectId);
            });
        });

        it('should list tasks filtered by user', async () => {
            const res = await supertest(app)
                .get(`/tasks?user=${sampleTaskPayload.assignedUser}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            res.body.forEach(task => {
                expect(task.assignedUser).toEqual(sampleTaskPayload.assignedUser);
            });
        });

        it('should list tasks filtered by status', async () => {
            const res = await supertest(app)
                .get(`/tasks?status=To Do`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            res.body.forEach(task => {
                expect(task.status).toEqual('To Do');
            });
        });

        it('should list tasks filtered by project, user, and status', async () => {
            const res = await supertest(app)
                .get(`/tasks?project=${sampleTaskPayload.projectId}&user=${sampleTaskPayload.assignedUser}&status=To Do`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            res.body.forEach(task => {
                expect(task.project).toEqual(sampleTaskPayload.projectId);
                expect(task.assignedUser).toEqual(sampleTaskPayload.assignedUser);
                expect(task.status).toEqual('To Do');
            });
        });

        it('should return an empty list if no tasks match the filters', async () => {
            const res = await supertest(app)
                .get(`/tasks?status=Completed`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toEqual(0);
        });

        it('should list tasks filtered by date range', async () => {
            const res = await supertest(app)
                .get(`/tasks?startDate=2024-10-01&endDate=2024-10-30`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
        });

        it('should list tasks overdue', async () => {
            const res = await supertest(app)
                .get(`/tasks?overdue=true`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
        });

        it('should list group tasks by user', async () => {
            const res = await supertest(app)
                .get(`/tasks?groupBy=user`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            res.body.forEach(result => {
                expect(result).toHaveProperty('tasks');
                expect(result).toHaveProperty('count');
                expect(result).toHaveProperty('name');
            });
        });

        it('should list group tasks by priority', async () => {
            const res = await supertest(app)
                .get(`/tasks?groupBy=priority`)
                .set('Authorization', `Bearer ${authToken}`);

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

    describe('Update a task', () => {
        it('should update a task status', async () => {
            const res = await supertest(app)
                .put(`/tasks/${sampleTaskPayload._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateTaskStatusPayload)

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('status', updateTaskStatusPayload.status);
        });
        it('should update a task due date', async () => {
            const res = await supertest(app)
                .put(`/tasks/${sampleTaskPayload._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateTaskDueDatePayload)

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('dueDate', updateTaskDueDatePayload.dueDate);
        });
    })

    describe('Delete a task', () => {
        it('should delete a task', async () => {
            const res = await supertest(app)
                .delete(`/tasks/${sampleTaskPayload._id}`)
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message', 'Task removed');
        });
    })
})


//TO DO
//Write More User Acess Validation tests