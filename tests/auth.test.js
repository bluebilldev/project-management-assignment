const supertest = require('supertest')
const createServer = require('../utils/app')
const { usersTestData } = require('../mocks/testData/index')
const User = require('../models/User')
const Project = require('../models/Project')

let app,
  user;

describe('Authentication Test Suite', () => {
  beforeAll(async () => {
    app = createServer();

    user = usersTestData.find(user => user.email === 'user1@test.com')
  });

  afterAll(() => {
    process.removeAllListeners();
  });

  describe('Database Setup', () => {
    it('should connect to the database and seed the data', async () => {
      const users = await User.find();
      expect(users.length).toBeGreaterThan(0); // Ensure users are seeded
      const projects = await Project.find();
      expect(projects.length).toBeGreaterThan(0); // Ensure projects are seeded
    });
  });

  describe('Test User Login', () => {
    it('should login an existing user', async () => {
      const res = await supertest(app)
        .post('/auth/login')
        .send({
          email: user.email,
          password: user.password
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should not login an unregistered user', async () => {
      const res = await supertest(app)
        .post('/auth/login')
        .send({
          email: 'test123@user.com',
          password: 'pass123',
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid Email');
    });

    it('should not login with a wrong password ', async () => {
      const res = await supertest(app)
        .post('/auth/login')
        .send({
          email: 'user1@test.com',
          password: 'pass456',
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid Password');
    });
  })
})
