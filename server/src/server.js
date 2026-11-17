const app = require('./app');
const env = require('./config/env');
const { getRedisClient } = require('./config/redis');
const { initializeBackgroundJobs } = require('./jobs/jobQueue');

// Initialize Redis & BullMQ workers if Redis is available
const redis = getRedisClient();
if (redis) {
  redis.once('ready', () => {
    initializeBackgroundJobs().catch((err) => {
      console.error('Failed to initialize BullMQ jobs:', err.message);
    });
  });
}

const server = app.listen(env.port, () => {
  console.log(`Sweety API server running on http://localhost:${env.port} (${env.nodeEnv})`);
});

module.exports = server;
