const redis = require('redis');
const dotenv = require('dotenv');

dotenv.config();

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
        if (!redisClient.isOpen || !redisClient.isReady) {
            await redisClient.connect();
        }
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
    }
};

if (redisClient !== null && process.env.NODE_ENV !== 'test') {
    connectRedis();
}

module.exports = { redisClient, connectRedis };
