const supertest = require('supertest')
const createServer = require('../utils/app')
const User = require('../models/User')
const jwt = require('jsonwebtoken');

const userRegPayload = {
    name: 'Test user',
    email: 'test@user.com',
    password: 'pass123',
    role: 'user'
};

const userLoginPayload = {
    email: 'test@user.com',
    password: 'pass123',
}

const updateUserPayload = {
    name: 'Updated test user'
}

let app;
let authToken;
let userId;

describe('User Profile Test Suite', () => {
    beforeAll(async () => {
        app = createServer();

    });

    afterAll(() => {
        process.removeAllListeners();
    });


    describe('Test User Registration', () => {
        it('should register a new user', async () => {
            const res = await supertest(app)
                .post('/users')
                .send(userRegPayload);
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('message', 'Registration Successful!');
        });

        it('should not register user with existing email', async () => {
            const res = await supertest(app)
                .post('/users')
                .send(userRegPayload);
            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'User already exists');
        });

        it('should log in with the newly registered user', async () => {
            const res = await supertest(app)
                .post('/auth/login')
                .send(userLoginPayload);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('token');

            // Store the token & id for the next test
            authToken = res.body.token;
            const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
            userId = decoded.id
        });
    })

    describe('Update User Profile Name', () => {
        it('should update the logged in user profile name', async () => {
            const res = await supertest(app)
                .put(`/users/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateUserPayload);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message', 'Profile updated successfully');
        });
    })
})
