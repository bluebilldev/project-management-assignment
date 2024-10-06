const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { seedDB } = require('../../utils/seeder');
const { usersTestData, projectsTestData, tasksTestData } = require('../../mocks/testData');


let mongoServer;

module.exports = async () => {
  mongoServer = new MongoMemoryServer();
  await mongoServer.start();
  const uri = mongoServer.getUri();

  global.__MONGO_URI__ = uri;
  global.__MONGO_SERVER__ = mongoServer;

  //JWT Config for Testing
  process.env.JWT_SECRET = 'testsecretsauce';
  process.env.JWT_EXPIRE = '1h';
  process.env.NODE_ENV = ' test';
  process.env.USE_REDIS = 'false';

  await mongoose.connect(uri);
  await seedDB(usersTestData, projectsTestData, tasksTestData);
  await mongoose.connection.close();
};
