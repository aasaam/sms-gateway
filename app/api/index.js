const { initContainer } = require('./src/Container');

(async function start() {
  const container = await initContainer();

  container.resolve('UserModel');

  await container.dispose();
})();
