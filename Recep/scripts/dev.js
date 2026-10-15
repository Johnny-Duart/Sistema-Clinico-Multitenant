import { spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';

const backendDir = path.resolve(process.cwd(), '../backend');
const timeoutMs = 20000;

function waitForPort(host, port, timeout = timeoutMs) {
  return new Promise((resolve) => {
    const start = Date.now();

    const tryConnect = () => {
      const socket = net.createConnection({ host, port });

      socket.once('connect', () => {
        socket.destroy();
        resolve(true);
      });

      socket.once('error', () => {
        if (Date.now() - start >= timeout) {
          socket.destroy();
          resolve(false);
          return;
        }

        setTimeout(tryConnect, 700);
      });
    };

    tryConnect();
  });
}

function run(command, args, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      ...options,
      stdio: 'inherit',
      shell: true,
    });

    child.on('exit', (code) => resolve(code));
  });
}

async function main() {
  console.log('[dev] iniciando docker do banco...');
  const dockerCode = await run('docker', ['compose', 'up', '-d', 'db'], { cwd: backendDir });

  if (dockerCode !== 0) {
    console.log('[dev] docker não respondeu; continuando, mas o banco precisará estar disponível manualmente.');
  }

  console.log('[dev] aguardando PostgreSQL em localhost:5433...');
  const dbReady = await waitForPort('127.0.0.1', 5433, timeoutMs);

  if (!dbReady) {
    console.log('[dev] banco não respondeu no tempo limite; backend continuará com erro de conexão se o serviço não estiver pronto.');
  } else {
    console.log('[dev] PostgreSQL disponível.');
  }

  const pythonBinary =
    path.join(backendDir, ".venv", "Scripts", "python.exe");

  console.log('[dev] aplicando migrations do Django...');
  const migrateCode = await run(pythonBinary, ['manage.py', 'migrate'], {
    cwd: backendDir,
    env: { ...process.env, PYTHONPATH: backendDir },
  });

  if (migrateCode !== 0) {
    console.log('[dev] as migrations falharam; o backend pode não iniciar sem o banco.');
  }

  console.log('[dev] iniciando backend Django...');
  const backend = spawn('npm', ['run', 'backend'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true,
  });

  console.log('[dev] iniciando frontend Vite...');
  const frontend = spawn('npm', ['run', 'frontend'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true,
  });

  backend.on('exit', (code) => {
    console.log(`[dev] backend saiu com código ${code}`);
    if (frontend.exitCode === null) {
      frontend.kill('SIGTERM');
    }
    process.exit(code ?? 0);
  });

  frontend.on('exit', (code) => {
    console.log(`[dev] frontend saiu com código ${code}`);
    if (backend.exitCode === null) {
      backend.kill('SIGTERM');
    }
    process.exit(code ?? 0);
  });
}

main().catch((error) => {
  console.error('[dev] falha no orchestrator:', error);
  process.exit(1);
});
