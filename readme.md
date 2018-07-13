In cf-exercise
* Run `yarn or npm install`
* Run `yarn start or npm run start`

In cf-apps
* `npm install`
* `npm run app1`
* `npm run app2`

You can specify delay to get process switch more smoothly. (Change DELAY 0 by 500 ms)

I have made three actions not listed in task in app2.
1) I was need to consider a case when parent process has exited already before I kill it. I record in log this action.
2) I was should not to spawn new child if I have spawned another one before. Otherwise we can get uncontrolled growth of processes.
3) If new process starts after parent has exited - ID is expired. We need to get new one for new process. Otherwise "identifier does not exist" will forbid process exit.

I attached example logs with comments - app1-fast.log and app2-fast.log
