const { log } = console;

class InitSequelize {
  constructor({ UserEntity, Config }) {
    /** @type {import('sequelize').ModelCtor<import('sequelize').Model>} */
    this.UserEntity = UserEntity;
    this.Config = Config;
  }

  async init() {
    const adminUserName = this.Config.ASM_ADMIN_USERNAME;
    const defaultUserName = this.Config.ASM_DEFAULT_USERNAME;

    const adminRawPassword = this.UserEntity.randomAPIKey().substr(0, 24);

    const adminPassword = await this.UserEntity.hashPassword(adminRawPassword);

    const defaultRawPassword = this.UserEntity.randomAPIKey().substr(0, 24);

    const defaultPassword = await this.UserEntity.hashPassword(
      defaultRawPassword,
    );

    const adminUser = await this.UserEntity.findOne({
      where: {
        name: adminUserName,
      },
    });
    const defaultUser = await this.UserEntity.findOne({
      where: {
        name: defaultUserName,
      },
    });

    const result = {};

    if (!adminUser) {
      const u = await this.UserEntity.create({
        name: adminUserName,
        admin: true,
        password: adminPassword,
      });
      log('='.repeat(80));
      log(`id: ${u.id}`);
      log(`Admin login data`);
      log(`user: ${adminUserName}`);
      log(`pass: ${adminRawPassword}`);
      log('='.repeat(80));

      result.admin = {
        id: u.id,
        user: adminUserName,
        pass: adminRawPassword,
      };
    }

    if (!defaultUser) {
      const apiKey =
        this.Config.ASM_PUBLIC_APP_TEST !== true
          ? await this.UserEntity.randomAPIKey()
          : '0'.repeat(64);

      const u = await this.UserEntity.create({
        name: defaultUserName,
        admin: false,
        password: defaultPassword,
        apiKey,
      });
      log('='.repeat(80));
      log(`Default user login data`);

      log(`id: ${u.id}`);
      log(`user: ${defaultUserName}`);
      log(`pass: ${defaultRawPassword}`);
      log(`API key: ${apiKey}`);
      log('='.repeat(80));

      result.default = {
        id: u.id,
        user: defaultUserName,
        pass: defaultRawPassword,
        apiKey,
      };
    }

    return result;
  }
}

module.exports = InitSequelize;
