const task = process.argv[2] ?? 'Task';
console.error(`${task} is not configured: this repository contains only the workspace scaffold.`);
process.exitCode = 1;
