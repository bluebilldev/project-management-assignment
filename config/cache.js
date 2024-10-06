const redis = require('redis');
const dotenv = require('dotenv');

dotenv.config();

let redisClient = null;

if (process.env.NODE_ENV !== 'test' && process.env.USE_REDIS === 'true') {
    redisClient = redis.createClient({
        url: `redis://default:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
    });

    redisClient.on('connect', () => {
        console.log(`Redis Client Connected`);
    });

    // Handle Redis connection errors
    redisClient.on('error', (err) => {
        console.log('Redis error:', err);
    });
} else {
    console.log('Redis is not initialized for test environment.');
}

// Reconnect before Get & Set
const connectRedis = async () => {
    try {
        if (redisClient && (!redisClient.isOpen || !redisClient.isReady)) {
            await redisClient.connect();
        }
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
    }
};

if (redisClient) {
    connectRedis();
}

module.exports = { redisClient, connectRedis };
