const fetch = require('node-fetch');
const child_process = require('child_process');
const terminate = require('terminate');
const ps = require('ps-node');

const getIdUrl = 'http://localhost:3000/api/getIdentifier';
const useIdUrl = 'http://localhost:3000/api/';

/**
 * Child process get id for processing via first command line parameter
 * Parameter is omitted for the first instance
 */
let currentId = process.argv[2];
let oldProcess = process.argv[3];
console.log(currentId, oldProcess);

// Exit on signal from child process
process.on('SIGTERM', () => {
  console.log('Got SIGTERM signal.');
  process.exit();
});

process.on('message', msg => {
  console.log('msg', msg);
  process.exit();
});

mainLoop();

// console.log('asdasd2111133333333333333333333333333333');

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
  // Kill old process if exist
  if (oldProcess) {
    const killIt = oldProcess;
    oldProcess = null;
    // setTimeout(() => {
      console.log(`kill ${killIt} process`);

      process.kill(killIt, 0);
    // process.send('message "kill"');
    // process.disconnect();
    // }, 0);
  }

  // Will get new ID for the first time and for 'case 0'
  if (!currentId)
    currentId = await getId();

  await delay(500);

  const result = await useId(currentId);

  const baseLog = `pid: ${String(process.pid).padStart(5)}. IDENTIFIER: ${currentId}.`;

  switch (String(result)) {
    case '0':
      console.log(`${baseLog} case 0 (update)`);
      currentId = null;
      return false;

    case '1':
      const fork = child_process.spawn(
        'node',
        [__filename, String(currentId), String(process.pid)],
        {detached: true, stdio: 'inherit'}
      );
      // fork.unref();
      console.log(`${baseLog} case 1 (fork ${fork.pid})`);
      await delay(2000);
      // fork.on('message', (msg) => {
      //   console.log('msg2', msg, process.pid);
      //   process.exit();
      // });

      // const fork = child_process.fork(__filename, [currentId, process.pid], {});
      // console.log(`${baseLog} case 1 (fork ${fork.pid})`);
      // fork.on('message', (msg) => {
      //   console.log('msg2', msg, process.pid);
      //   process.exit();
      // });
      return false;

    case '2':
      console.log(`${baseLog} case 2 (exit)`);
      currentId = null; //TODO: remove this line
      return false;

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
  // while(1) {
  //   if (await main()) break;
  // }
  if (await main()) process.exit();
  setTimeout(mainLoop, 0);
  // process.stdin.resume();
  // f();
}

function f() {
  console.log(process.pid, 'tick');
  setTimeout(f, 1000);
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
