/**
 * trimlink API server
 * Entry point for the link shortening service API
 */

const config = require('./config/environment');
const printConosoleWelcome = require('./utils/consoleWelcome');
const app = require('./app');
const logger = require('./utils/logger');

app.listen(config.PORT, () => {
  printConosoleWelcome(config);
});

//Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception: ', error);
  process.exit(1);
});

//Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
