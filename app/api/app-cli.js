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
  const Config = container.resolve('Config');
  const UserEntity = container.resolve('UserEntity');

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
      const types = [`\`${props.type}\``];
      if (props.separator) {
        types.push(`__,__`);
      }
      if (ConfigSchema.required.includes(env)) {
        types.push(`*****`);
      }
      log(
        `| \`${env}\` | ${types.join(' ')} | ${props.description} | \`${
          props.default
        }\` |`,
      );
    });
  });

  program.option('-au, --admin-user');

  await program.parseAsync(process.argv);
})();
