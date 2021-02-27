const { resolve } = require('path');

const { createContainer, asValue, asClass, Lifetime } = require('awilix');

const InitSequelize = require('./InitSequelize');
const InitData = require('./InitData');

/**
 * @param {import('./Config').Config} Config
 * @return {Promise<import('awilix').AwilixContainer>}
 */
const initContainer = async (Config) => {
  const container = createContainer();

  container.register({
    Config: asValue(Config.getAll()),
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
  const Sequelize = container.resolve('Sequelize');

  await Sequelize.sync();
  const sequelize = await Sequelize.connect();

  const entities = Sequelize.getEntities();

  container.register({
    // sequelize
    sequelize: asValue(sequelize),
  });

  Object.keys(entities).forEach((name) => {
    container.register({
      [name]: asValue(entities[`${name}`]),
    });
  });

  // InitData
  container.register({
    InitData: asClass(InitData, {
      lifetime: Lifetime.SINGLETON,
    }),
  });

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

  container.register({
    // fastify
    fastify: asValue(container.resolve('Fastify').getFastify()),
  });

  container.loadModules([resolve(__dirname, 'OpenAPI/*.js')], {
    formatName(name) {
      return `${name}OpenAPI`;
    },
    resolverOptions: {
      lifetime: Lifetime.SINGLETON,
    },
  });

  return container;
};

module.exports = { initContainer };
