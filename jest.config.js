module.exports = {
    globalSetup: './tests/helpers/globalSetup.js',
    globalTeardown: './tests/helpers/globalTeardown.js',
    testEnvironment: 'node',
    setupFilesAfterEnv: ['./tests/helpers/dbSetup.js'], 
    detectOpenHandles: true,
  };
  