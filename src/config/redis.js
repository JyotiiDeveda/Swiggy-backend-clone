const redis = require('redis');

const redisClient = redis.createClient();
redisClient.on('error', err => {
	console.error('Redis error:', err);
});

redisClient.connect();

redisClient.on('connect', () => {
	console.log('Connected to redis successfully');
});

module.exports = { redisClient };
