const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

module.exports = async () => {
  mongoServer = new MongoMemoryServer();
  await mongoServer.start();
  const uri = mongoServer.getUri();

  global.__MONGO_URI__ = uri;
  global.__MONGO_SERVER__ = mongoServer;

};
