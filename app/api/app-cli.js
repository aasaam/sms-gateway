#!/usr/bin/env node
/* eslint-disable node/shebang */
const commander = require('commander');

const { initContainer } = require('./src/Container');
const { Config: ConfigClass } = require('./src/Config');
const { ConfigSchema } = require('./src/ConfigSchema');

const { log } = console;

(async function start() {
  const c = new ConfigClass(ConfigSchema, {});
  const container = await initContainer(c);

  /** @type {import('sequelize').ModelCtor<import('sequelize').Model>} */
  const UserEntity = container.resolve('UserEntity');

  /** @type {import('./addon').Config} */
  const Config = container.resolve('Config');

  const adminUserName = Config.ASM_ADMIN_USERNAME;

  const program = new commander.Command();

  program.command('admin-reset').action(async () => {
    const adminRawPassword = UserEntity.randomAPIKey().substr(0, 16);
    const adminPassword = await UserEntity.hashPassword(adminRawPassword);

    // current admin user
    const adminUser = await UserEntity.findOne({
      where: {
        name: adminUserName,
      },
    });

    // no admin user anymore
    await UserEntity.update(
      {
        admin: false,
      },
      {
        where: [],
      },
    );

    if (adminUser) {
      adminUser.password = adminPassword;
      adminUser.admin = true;
      adminUser.active = true;
      await adminUser.save();
    } else {
      await UserEntity.create({
        name: adminUserName,
        admin: true,
        password: adminPassword,
      });
    }
    log('='.repeat(80));
    log(`Admin login data`);
    log(`user: ${adminUserName}`);
    log(`pass: ${adminRawPassword}`);
    log('='.repeat(80));
    await container.dispose();
  });

  program.command('init').action(async () => {
    const InitData = container.resolve('InitData');
    await InitData.init();
    await container.dispose();
  });

  program.command('env-markdown').action(async () => {
    log(`| Name | Type | Description | Default |`);
    log(`| ---- | ---- | ----------- | ------- |`);
    Object.keys(ConfigSchema.properties).forEach((env) => {
      // eslint-disable-next-line security/detect-object-injection
      const props = ConfigSchema.properties[env];
      const names = [`\`${env}\``];
      if (props.separator) {
        names.push(`<sup>[2]</sup>`);
      }
      if (ConfigSchema.required.includes(env)) {
        names.push(`<sup>[1]</sup>`);
      }
      log(
        `| ${names.join(' ')} | ${props.type} | ${props.description} | \`${
          props.default
        }\` |`,
      );
    });
    log('');
    log('### Notes');
    log('');
    log(`1. Required to be set during deployment`);
    log(`2. Comma separated field like \`foo,bar\``);
    await container.dispose();
  });

  program.command('open-api-dump').action(async () => {
    /** @type {import('fastify').FastifyInstance} */
    const fastify = container.resolve('fastify');

    const resp = await fastify.inject({
      url: fastify.openAPIBaseURL('/docs/json'),
      method: 'GET',
    });

    log(resp.body);
    await container.dispose();
  });

  program.option('-au, --admin-user');

  await program.parseAsync(process.argv);
})();
