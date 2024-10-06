const redis = require('redis');
const dotenv = require('dotenv');

dotenv.config();

// Create Redis client
const redisClient = redis.createClient({
    url: `redis://default:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});

redisClient.on('connect', () => {
    console.log(`Redis Client Connected`);
});

// Handle Redis connection errors
redisClient.on('error', (err) => {
    console.log('Redis error:', err);
});

// Reconnect before Get & Set
const connectRedis = async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
    }
};

module.exports = { redisClient, connectRedis };
