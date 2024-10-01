const supertest = require('supertest')
const createServer = require('../utils/app')

const addProjectPayload = {
    name: 'Test Project',
    description: 'Add a test project',
    deadline: '2024-12-31T00:00:00.000Z',
    members: []
}

const userLoginPayload = {
    email: 'test@user.com',
    password: 'pass123',
}

let app;
let authToken;

describe('Project Test Suite', () => {
    beforeAll(async () => {
        // Set JWT secret and expiration for test environment
        process.env.JWT_SECRET = 'testsecretsauce';
        process.env.JWT_EXPIRE = '1h';

        app = createServer();

        //Login & Get Auth Token
        const res = await supertest(app)
            .post('/auth/login')
            .send(userLoginPayload);
        
        //Auth Token for Subsequent Tests    
        authToken = res.body.token;
    });

    afterAll(() => {
        process.removeAllListeners();
    });


    describe('Create a new project', () => {
        it('should create a new project', async () => {
            const res = await supertest(app)
                .post('/projects')
                .set('Authorization', `Bearer ${authToken}`)
                .send(addProjectPayload);
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', addProjectPayload.name);
            expect(res.body).toHaveProperty('description', addProjectPayload.description);
            expect(res.body).toHaveProperty('deadline', addProjectPayload.deadline);
            expect(res.body).toHaveProperty('members');
            expect(res.body).toHaveProperty('owner');
            expect(res.body).toHaveProperty('createdAt');
            expect(res.body).toHaveProperty('updatedAt');
        });
    })
})
