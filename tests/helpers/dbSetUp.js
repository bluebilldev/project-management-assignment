const mongoose = require('mongoose');

beforeAll(async () => {
    if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(global.__MONGO_URI__);
    }
});
