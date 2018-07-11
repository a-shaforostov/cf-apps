const fetch = require('node-fetch');
const child_process = require('child_process');

const getIdUrl = 'http://localhost:3000/api/getIdentifier';
const useIdUrl = 'http://localhost:3000/api/';

/**
 * Child process get id for processing via first command line parameter
 * Parameter is omitted for the first instance
 */
let currentId = process.argv[2];

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

  switch (String(result)) {
    case '0':
      console.log(`${baseLog} case 0 (update)`);
      currentId = null;
      return false;

    case '1':
      console.log(`${baseLog} case 1 (fork)`);
      child_process.fork(__filename, [currentId], {});
      return true;

    case '2':
      console.log(`${baseLog} case 2 (exit)`);
      return true;

    default:
      console.log(`${baseLog} ${result}`);
      return false;
  }
}

/**
 * It does main in loop until stop flag will be caused by some cases
 * @returns {Promise<void>}
 */
async function mainLoop() {
  while(!await main()){}
}
