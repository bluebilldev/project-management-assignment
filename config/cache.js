const redis = require('redis');

// Create Redis client
const redisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    port: 6379
  });

redisClient.on('connect', () => {
  console.log('Connected to Redis...');
});

// Handle Redis connection errors
redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

module.exports = redisClient;
