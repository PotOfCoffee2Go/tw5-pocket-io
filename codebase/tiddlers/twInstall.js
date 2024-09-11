const { spawnSync } = require('node:child_process');

// Install tiddlywiki locally in current directory
function twInstall(version) {
  version = version || '5.3.5';
  wrt(`Installing tiddlywiki v${version} in directory: ${process.cwd()}`);
  syncProcess = spawnSync('npm',
    ['--prefix', '.',  'install', `tiddlywiki@v${version}`],
    { stdio: 'inherit' });
}
