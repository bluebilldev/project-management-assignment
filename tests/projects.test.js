const supertest = require('supertest')
const createServer = require('../utils/app')
const User = require('../models/User')
const Project = require('../models/Project')
const generateToken = require('../utils/generate_token')

const addProjectPayload = {
    name: 'Sample Project',
    description: 'Add a Sample test project',
    deadline: '31-12-2024',
}

let app,
    user,
    userToken,
    admin,
    adminToken,
    projectId1,
    projectId2,
    projectId3

describe('Project Test Suite', () => {
    beforeAll(async () => {
        app = createServer();

        // Retrieve test admin 
        admin = await User.findOne({ email: 'admin@test.com' })

        // Generate admin auth token
        adminToken = generateToken(admin._id.toString(), admin.role);

        // Retrieve test user 
        user = await User.findOne({ email: 'user1@test.com' })

        // Generate user 1 auth token
        userToken = generateToken(user._id.toString(), user.role);

        // Retrieve a project id
        const project1 = await Project.findOne({ name: 'Test Project 1' });
        const project2 = await Project.findOne({ name: 'Test Project 2' });
        const project3 = await Project.findOne({ name: 'Test Project 3' });

        projectId1 = project1._id.toString();
        projectId2 = project2._id.toString();
        projectId3 = project3._id.toString();
    });

    afterAll(() => {
        process.removeAllListeners();
    });


    describe('Create a new project', () => {
        it('should create a new project by admin', async () => {
            const res = await supertest(app)
                .post('/projects')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(addProjectPayload);
            expect(res.statusCode).toEqual(201);

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', addProjectPayload.name);
            expect(res.body).toHaveProperty('description', addProjectPayload.description);
            expect(res.body).toHaveProperty('deadline');
            expect(res.body).toHaveProperty('members');
            expect(res.body).toHaveProperty('owner');
            expect(res.body).toHaveProperty('createdAt');
            expect(res.body).toHaveProperty('updatedAt');
        });

        it('should not create a duplicate project by admin', async () => {
            const res = await supertest(app)
                .post('/projects')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(addProjectPayload);

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'Project already exists');
        });

        it('should fail validation check for missing project name', async () => {
            let { name, ...payloadWithoutName } = addProjectPayload;

            const res = await supertest(app)
                .post('/projects')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(payloadWithoutName);

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('errors');
            expect(res.body.errors[0]).toHaveProperty('message', 'Please include a project name');
        });

        it('should fail validation check for missing project name', async () => {
            let { description, ...payloadWithoutDesc } = addProjectPayload;

            const res = await supertest(app)
                .post('/projects')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(payloadWithoutDesc);

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('errors');
            expect(res.body.errors[0]).toHaveProperty('message', 'Please include a project description');
        });

        it('should fail validation check for missing project deadline', async () => {
            let { deadline, ...payloadWithoutDeadline } = addProjectPayload;

            const res = await supertest(app)
                .post('/projects')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(payloadWithoutDeadline);

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('errors');
            expect(res.body.errors[0]).toHaveProperty('message', 'Please include a valid project deadline in DD/MM/YYYY, DD-MM-YYYY, DD-MM-YY, or DD/MM/YY format');
        });

        it('should fail validation check for wrong project deadline format', async () => {
            let payloadWrongDateFormat = { ...addProjectPayload, deadline: '2024-12-31T00:00:00.000Z' };

            const res = await supertest(app)
                .post('/projects')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(payloadWrongDateFormat);

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('errors');
            expect(res.body.errors[0]).toHaveProperty('message', 'Invalid deadline format, use DD/MM/YYYY, DD-MM-YYYY, DD-MM-YY, or DD/MM/YY');
        });

        it('should not create a new project by user', async () => {
            const res = await supertest(app)
                .post('/projects')
                .set('Authorization', `Bearer ${userToken}`)
                .send(addProjectPayload);

            expect(res.statusCode).toEqual(403);
            expect(res.body).toHaveProperty('message', 'Access denied. Admins only.');
        });
    })

    describe('Get all projects', () => {
        it('should get all projects for an admin', async () => {
            const res = await supertest(app)
                .get('/projects')
                .set('Authorization', `Bearer ${adminToken}`)

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toEqual(4);
        });

        it('should get all projects for a user', async () => {
            const res = await supertest(app)
                .get('/projects')
                .set('Authorization', `Bearer ${userToken}`)

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toEqual(2);
        });
    });

    describe('Get projects by id', () => {
        it('should get project by id for an admin', async () => {
            const res = await supertest(app)
                .get(`/projects/${projectId1}`)
                .set('Authorization', `Bearer ${adminToken}`)

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name');
            expect(res.body).toHaveProperty('description');
            expect(res.body).toHaveProperty('deadline');
            expect(res.body).toHaveProperty('members');
            expect(res.body).toHaveProperty('owner');
            expect(res.body).toHaveProperty('createdAt');
            expect(res.body).toHaveProperty('updatedAt');
        });

        it('should get project by id for a user with access', async () => {
            const res = await supertest(app)
                .get(`/projects/${projectId1}`)
                .set('Authorization', `Bearer ${userToken}`)

            expect(res.statusCode).toEqual(200);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name');
            expect(res.body).toHaveProperty('description');
            expect(res.body).toHaveProperty('deadline');
            expect(res.body).toHaveProperty('members');
            expect(res.body).toHaveProperty('owner');
            expect(res.body).toHaveProperty('createdAt');
            expect(res.body).toHaveProperty('updatedAt');
        });

        it('should not get project by id for a user without access', async () => {
            const res = await supertest(app)
                .get(`/projects/${projectId3}`)
                .set('Authorization', `Bearer ${userToken}`)

            expect(res.statusCode).toEqual(403);
            expect(res.body).toHaveProperty('message', 'Access denied. Not authorized to view this project');
        });

        it('should throw project id validation error', async () => {
            const res = await supertest(app)
                .get('/projects/randomstring')
                .set('Authorization', `Bearer ${userToken}`)

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('errors');
            expect(res.body.errors[0]).toHaveProperty('message', 'Invalid project id format');
        });
    });

    describe('Get project tasks by project id', () => {
        it('should get all tasks for a project by id for an admin', async () => {
            const res = await supertest(app)
                .get(`/projects/${projectId1}/tasks`)
                .set('Authorization', `Bearer ${adminToken}`)

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
        });

        it('should get all tasks for a project by id for an assigned user', async () => {
            const res = await supertest(app)
                .get(`/projects/${projectId1}/tasks`)
                .set('Authorization', `Bearer ${userToken}`)

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
        });

        it('should not get tasks for a project by id for a user without access', async () => {
            const res = await supertest(app)
                .get(`/projects/${projectId3}/tasks`)
                .set('Authorization', `Bearer ${userToken}`)

            expect(res.statusCode).toEqual(403);
            expect(res.body).toHaveProperty('message', 'Access denied. Not authorized to view this project');
        });

        it('should throw project id validation error', async () => {
            const res = await supertest(app)
                .get('/projects/randomstring/tasks')
                .set('Authorization', `Bearer ${userToken}`)

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('errors');
            expect(res.body.errors[0]).toHaveProperty('message', 'Invalid project id format');
        });
    });
});
