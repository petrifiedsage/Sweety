const app = require('./app');
const env = require('./config/env');

const server = app.listen(env.port, () => {
  console.log(`Sweety API server running on http://localhost:${env.port} (${env.nodeEnv})`);
});

module.exports = server;
