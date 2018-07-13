/**
 * @module Common
 */

const fetch = require('node-fetch');
const winston = require('winston');
const { getIdUrl, useIdUrl } = require('./config');

// Create winston logger with one file transport
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [
    new winston.transports.File({ filename: 'app.log' }),
  ],
});

/**
 * Get new IDENTIFIER
 * @returns {Promise<string>} New identifier
 */
async function getId() {
  try {
    const idResponse = await fetch(getIdUrl);
    return idResponse.text();
  } catch (e) {
    logger.error('API is not working');
    console.error('Error: API is not working\n'); // eslint-disable-line no-console
    return process.exit(1);
  }
}

/**
 * Use identifier
 * @param {String} id - IDENTIFIER
 * @returns {Promise<string>} '0', '1', '2' or random string
 */
async function useId(id) {
  try {
    const idResponse = await fetch(`${useIdUrl}${id}`);
    return idResponse.text();
  } catch (e) {
    logger.error('API is not working');
    console.error('Error: API is not working\n'); // eslint-disable-line no-console
    return process.exit(1);
  }
}

/**
 * Delay in ms
 * @param {Number} ms - milliseconds
 * @returns {Promise<any>}
 */
async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  logger,
  getId,
  useId,
  delay,
};
