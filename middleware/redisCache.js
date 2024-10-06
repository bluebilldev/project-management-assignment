const { redisClient, connectRedis } = require('../config/cache');

const redisCache = async (req, res, next) => {
    const { page = 1, limit = 10, ...queryParams } = req.query;

    // Create a unique Redis key based on the query parameters
    const redisKey = `tasks:${JSON.stringify(queryParams)}:${page}:${limit}`;

    try {

        //Check Redis Connection
        if (!redisClient.isReady) {
            console.log('Redis Connected again!');
            await connectRedis();
        }

        // Check for cached data
        const data = await redisClient.get(redisKey);

        if (data) {
            console.log('Hit Cache')
            return res.json(JSON.parse(data));
        } else {
            console.log('No cache hit');
            next();
        }
    } catch (error) {
        console.log('Redis connection error:', error.message);
        next();
    }
};



module.exports = redisCache;
