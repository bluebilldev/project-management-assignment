const supertest = require('supertest')
const createServer = require('../utils/app')
const User = require('../models/User')

const userRegPayload = {
  name: 'Login Test',
  email: 'login@user.com',
  password: 'pass123',
  role: 'user'
};

const userLoginPayload = {
  email: 'login@user.com',
  password: 'pass123',
}

let app;

describe('Authentication Test Suite', () => {
  beforeAll(async () => {
    // Set JWT secret and expiration for test environment
    process.env.JWT_SECRET = 'testsecretsauce';
    process.env.JWT_EXPIRE = '1h';

    app = createServer();

    //Add a user to test login
    const user = new User(userRegPayload);
    await user.save();
  });

  afterAll(() => {
    process.removeAllListeners();
  });

  describe('Test User Login', () => {
    it('should login an existing user', async () => {
      const res = await supertest(app)
        .post('/auth/login')
        .send(userLoginPayload);
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
          email: 'login@user.com',
          password: 'pass456',
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid Password');
    });
  })
})
