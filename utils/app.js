const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

function createServer() {
    const app = express();

    // Middleware
    app.use(express.json());
    app.use(cors());

    //Secure HTTP Headers
    app.use(helmet());

    //Log Requests in Dev
    if (process.env.NODE_ENV === 'dev') {
        app.use(morgan('dev'));
    }

    // Rate Limit HTTP Requests
    const limiter = rateLimit({
        windowMs: 60 * 1000, // 1 minute
        max: 100, // Limit each IP to 100 requests per windowMs
    });

    app.use(limiter);

    // Routes
    app.use('/auth', require('../routes/authRoutes'));
    app.use('/users', require('../routes/userRoutes'));
    app.use('/projects', require('../routes/projectRoutes'));
    app.use('/tasks', require('../routes/taskRoutes'));

    //Health Check Route for Cloud Deployments
    app.use('/health', (req, res) => res.status(200).send('OK'));


    // Error Handling Middleware
    app.use((req, res, next) => {
        res.status(404).json({
            message: 'The endpoint you are trying to access does not exist'
        });
    });

    return app
}

module.exports = createServer