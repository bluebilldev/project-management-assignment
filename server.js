const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/cache')
const createServer = require('./utils/app')

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = createServer();

//Health Check Route for Cloud Deployments
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});


// Start Server
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));