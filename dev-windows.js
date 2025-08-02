const { spawn } = require('child_process');
const path = require('path');

// Windows-specific development script
console.log('Starting Next.js development server for Windows...');

const nextProcess = spawn('npx', ['next', 'dev'], {
  stdio: 'inherit',
  shell: true,
  windowsHide: true,
  env: {
    ...process.env,
    // Disable some features that can cause issues on Windows
    NEXT_TELEMETRY_DISABLED: '1',
    NODE_OPTIONS: '--max-old-space-size=4096',
  }
});

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('\nShutting down development server...');
  nextProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down development server...');
  nextProcess.kill('SIGTERM');
  process.exit(0);
});

nextProcess.on('close', (code) => {
  console.log(`Development server exited with code ${code}`);
  process.exit(code);
});

nextProcess.on('error', (err) => {
  console.error('Failed to start development server:', err);
  process.exit(1);
}); 