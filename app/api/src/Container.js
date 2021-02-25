const { resolve } = require('path');

const { createContainer, asValue, asClass, Lifetime } = require('awilix');

const { Config: ConfigClass } = require('./Config');
const { ConfigSchema } = require('./ConfigSchema');
const InitSequelize = require('./InitSequelize');

/**
 * @return {Promise<import('awilix').AwilixContainer>}
 */
const initContainer = async () => {
  const container = createContainer();

  const configInstance = new ConfigClass(ConfigSchema, process.env);

  container.register({
    Config: asValue(configInstance.getAll()),
  });

  // Sequelize
  container.register({
    Sequelize: asClass(InitSequelize, {
      lifetime: Lifetime.SINGLETON,
      async dispose(i) {
        await i.disconnect();
      },
    }),
  });
  const sequelize = await container.resolve('Sequelize').connect();

  container.register({
    // sequelize
    sequelize: asValue(sequelize),
  });

  // Sequelize Models
  container.loadModules([resolve(__dirname, 'Sequelize/*.js')], {
    formatName(name) {
      return `${name}Model`;
    },
    resolverOptions: {
      lifetime: Lifetime.SINGLETON,
    },
  });

  const promises = [];
  Object.keys(container.registrations).forEach((name) => {
    if (name.match(/Model$/)) {
      promises.push(container.resolve(name).sync());
    }
  });

  await Promise.all(promises);

  container.loadModules([resolve(__dirname, 'Adapters/*.js')], {
    formatName(name) {
      return `${name}Adapter`;
    },
    resolverOptions: {
      lifetime: Lifetime.SINGLETON,
    },
  });

  container.loadModules([resolve(__dirname, 'Core/*.js')], {
    resolverOptions: {
      lifetime: Lifetime.SINGLETON,
    },
  });

  return container;
};

module.exports = { initContainer };
