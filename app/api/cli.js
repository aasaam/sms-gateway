#!/usr/bin/env node
/* eslint-disable node/shebang */
const commander = require('commander');

const { initContainer } = require('./src/Container');

const { log } = console;

(async function start() {
  const container = await initContainer();

  const program = new commander.Command();

  program.option('-au, --admin-user').action(async () => {
    const UserModel = container.resolve('UserModel').getModel();
    const rawPassword = UserModel.randomAPIKey().substr(0, 16);
    const adminUserName = process.env.ASM_ADMIN_USERNAME
      ? process.env.ASM_ADMIN_USERNAME
      : 'root';
    const admin = await UserModel.findOne({
      where: {
        name: adminUserName,
      },
    });
    const password = await UserModel.hashPassword(rawPassword);
    if (admin) {
      admin.password = password;
      await admin.save();
    } else {
      await UserModel.create({ name: adminUserName, admin: true, password });
    }
    log(`Admin login data`);
    log(`user: ${adminUserName}`);
    log(`pass: ${rawPassword}`);
    await container.dispose();
  });

  await program.parseAsync(process.argv);
})();
