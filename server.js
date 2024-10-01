const dotenv = require('dotenv');
const connectDB = require('./config/db');
const createServer = require('./utils/app')


// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = createServer();


// Start Server
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));