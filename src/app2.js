/**
 * @module app2
 */

const childProcess = require('child_process');
const {
  logger, getId, useId, delay,
} = require('./common');

// Delay between iterations
const DELAY = require('./config').app2Delay;

// Only one child process can be spawned
let hasChild = false;

/**
 * Child process get id for processing via first command line parameter
 * Parameter is omitted for the first instance
 */
let currentId = process.argv[2];

/**
 * Child process get parent`s pid via second command line parameter
 * Parameter is omitted for the first instance
 */
let oldProcess = process.argv[3];

logger.info(`Start new process with arguments: IDENTIFIER-${currentId} PARENT-${oldProcess}`);

mainLoop();

/* End */

/**
 * Main logic. 1-3 steps.
 * @returns {Promise<boolean>} Stop-flag. If true - app will stop
 */
async function main() {
  if (oldProcess) {
    // Kill old process if exist
    logger.info(`kill ${oldProcess} process from ${process.pid}`);
    try {
      process.kill(oldProcess);
    } catch (e) {
      logger.error(`process ${oldProcess} not found. Can't kill it.`);
    }
    oldProcess = null;
  }

  // Will get new ID for the first time and for 'case 0'
  if (!currentId) {
    currentId = await getId();
  }

  await delay(DELAY);

  const result = await useId(currentId);

  const baseLog = `pid: ${String(process.pid).padStart(5)}. IDENTIFIER: ${currentId}.`;

  switch (String(result)) {
    case '0':
      logger.info(`${baseLog} case 0 (update)`);
      currentId = null;
      return false;

    case '1':
      if (!hasChild) {
        const childPid = spawnProcess();
        logger.info(`${baseLog} case 1 (fork ${childPid})`);
        hasChild = true;
      } else {
        logger.info(`${baseLog} case 1 (we have a child process already)`);
      }
      return false;

    case '2':
      logger.info(`case 2 (exit)`);
      return true;

    case 'identifier does not exist':
      logger.info(`${baseLog} case (expired ID) get new one`);
      currentId = null;
      return false;

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
  let stop;
  while (!stop) {
    stop = await main();
  }
  process.exitCode = 0;
}

/**
 * Spawn new process in detached mode
 * @returns {Number} process pid
 */
function spawnProcess() {
  const child = childProcess.spawn(
    'node',
    ['./src/app2.js', currentId || '', process.pid],
    {
      detached: true,
      stdio: 'ignore',
    },
  );
  child.unref();
  return child.pid;
}
