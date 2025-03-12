/**
 * Express app setup and configuration
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan'); //TODO: HTTP Logging, making custom logger

const config = require('./config/environment');
const logger = require('./utils/logger');
const routes = require('./routes/index');

const app = express();

//Sets secure HTTP headers to protect against scary things
app.use(helmet());

//Allows CORS only from non-sus origins defined in our .env or * if none
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

//Allows nested objects in form data
app.use(express.urlencoded({ extended: true }));

//Increases performance by reducing response size aka less bandwidth used
app.use(compression());

//Setting up request logging
if (config.NODE_ENV != 'test') {
  app.use(
    morgan('combined', {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    })
  );
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

//Registering all routes
app.use('/', routes);

module.exports = app;
