const { Sequelize } = require('sequelize');

class InitSequelize {
  constructor({ Config }) {
    this.sequelize = new Sequelize(
      Config.ASM_MYSQL_DATABASE,
      Config.ASM_MYSQL_USER,
      Config.ASM_MYSQL_PASSWORD,
      {
        host: Config.ASM_MYSQL_HOST,
        dialect: 'mariadb',
        logging: false,
        // eslint-disable-next-line no-console
        // Config.ASM_PUBLIC_APP_TEST === 'true' ? console.log : false,
      },
    );
  }

  async connect() {
    await new Promise((r) => setTimeout(r, 100));
    await this.sequelize.authenticate();
    return this.sequelize;
  }

  async disconnect() {
    await new Promise((r) => setTimeout(r, 100));
    await this.sequelize.close();
  }
}

module.exports = InitSequelize;
