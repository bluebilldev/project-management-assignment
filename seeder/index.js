const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs')
const path = require('path')
const { seedDB } = require('../utils/seeder')

// Load environment variables
dotenv.config();

//Load Sample Dataset - Load Seed Data from JSON Files
const usersSampleData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../mocks/seedData', 'users.json'), 'utf-8')
);
const projectsSampleData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../mocks/seedData', 'projects.json'), 'utf-8')
);
const tasksSampleData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../mocks/seedData', 'tasks.json'), 'utf-8')
);

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding');
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
};

const runSeeder = async () => {
  try {
    await connectDB();
    await seedDB(usersSampleData, projectsSampleData, tasksSampleData);
    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Error during database seeding:', error.message);
  } finally {
    process.exit();
  }
};

runSeeder();



