const net = require('net');

const host = '127.0.0.1';
const port = 5433;
const timeoutMs = 10000;

const startTime = Date.now();

function tryConnect() {
  const socket = net.createConnection({ host, port });

  socket.once('connect', () => {
    socket.destroy();
    process.exit(0);
  });

  socket.once('error', () => {
    if (Date.now() - startTime >= timeoutMs) {
      console.log('[wait-db] timeout aguardando PostgreSQL em localhost:5433; continuando mesmo assim.');
      process.exit(0);
    }

    setTimeout(tryConnect, 1000);
  });
}

tryConnect();
