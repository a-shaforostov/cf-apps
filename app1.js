const fetch = require('node-fetch');
const child_process = require('child_process');
const winston = require('winston');

// Delay between iterations
const DELAY = 500;

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [
    new winston.transports.File({ filename: 'app.log' }),
  ],
});

const getIdUrl = 'http://localhost:3000/api/getIdentifier';
const useIdUrl = 'http://localhost:3000/api/';

/**
 * Child process get id for processing via first command line parameter
 * Parameter is omitted for the first instance
 */
let currentId = process.argv[2];

logger.info(`Start new instance, pid ${process.pid}`);

// disconnect from parent process to let it close
if (process.disconnect) {
  process.disconnect();
}

mainLoop();

/* End */

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
 * Main logic. 1-3 steps.
 * @returns {Promise<boolean>} - stop-flag. If true - app will stop
 */
async function main() {

  // Will get new ID for the first time and for 'case 0'
  if (!currentId)
    currentId = await getId();

  const result = await useId(currentId);

  const baseLog = `pid: ${String(process.pid).padStart(5)}. IDENTIFIER: ${currentId}.`;

  await delay(DELAY);

  switch (String(result)) {
    case '0':
      logger.info(`${baseLog} case 0 (update)`);
      currentId = null;
      return false;

    case '1':
      const fork = child_process.fork(
        __filename,
        [currentId],
        {
          silent: true,
          detached: true,
          stdio: 'ignore',
        }
      );
      fork.unref();

      logger.info(`${baseLog} case 1 (fork ${fork.pid})`);
      return true;

    case '2':
      logger.info(`${baseLog} case 2 (exit)`);
      return true;

    default:
      logger.info(`${baseLog} ${result}`);
      return false;
  }
}

/**
 * It does main in loop until stop flag will be caused by some cases
 * @returns {Promise<void>}
 */
async function mainLoop() {
  if (await main()) process.exit();
  setTimeout(mainLoop, 0);
  // while(!await main()) {}
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
