function twServerInit() {
  // Initialize 'server' edition?
  return new Promise((resolve) => {
    if (!fs.existsSync(twOutput)) {
      commander.execute($tw.wiki, ['--init', 'server']);
      twBoot();
    }
    // Turn logging off
    $tw.syncer.logger.enable=false;
    resolve();
  })
}
