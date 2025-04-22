const { spawn } = require('child_process');

function startServer(script) {
  const server = spawn('node', [script], { stdio: 'inherit' });

  server.on('close', (code) => {
    console.log(`${script} exited with code ${code}`);
  });

  server.on('error', (err) => {
    console.error(`Failed to start ${script}:`, err);
  });

  return server;
}

console.log('Starting all backend servers...');

const servers = [
  startServer('server.js'),
  startServer('cartserver.js'),
  startServer('productServer.js'),
];

// Optional: handle termination signals to kill child processes
process.on('SIGINT', () => {
  console.log('Stopping all servers...');
  servers.forEach((server) => server.kill('SIGINT'));
  process.exit();
});
