/**
 * @module Common
 * Common routines for both apps
 */

const fetch = require('node-fetch');
const winston = require('winston');

/**
 * API endpoints
 * @type {string}
 */
const getIdUrl = 'http://localhost:3000/api/getIdentifier';
const useIdUrl = 'http://localhost:3000/api/';

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
 * @returns {Promise<string>} - New identifier
 */
async function getId() {
  const idResponse = await fetch(getIdUrl);
  return idResponse.text();
}

/**
 * Use identifier
 * @param id - IDENTIFIER
 * @returns {Promise<string>} - '0', '1', '2' or random string
 */
async function useId(id) {
  const idResponse = await fetch(`${useIdUrl}${id}`);
  return idResponse.text();
}

/**
 * Delay in ms
 * @param ms - milliseconds
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
