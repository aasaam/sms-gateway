const crypto = require('crypto');

const argon2 = require('argon2');
const { Sequelize, DataTypes } = require('sequelize');

class Models {
  /**
   * @param {Object} container
   * @param {Object.<string, any>} container.Config
   */
  constructor({ Config }) {
    this.sequelize = new Sequelize(
      Config.ASM_MARIADB_DATABASE,
      Config.ASM_MARIADB_USER,
      Config.ASM_MARIADB_PASSWORD,
      {
        host: Config.ASM_MARIADB_HOST,
        dialect: 'mariadb',
        logging: false,
        // eslint-disable-next-line no-console
        // logging: console.log,
      },
    );

    this.setUser();
    this.setLocal();
    this.setSendMessage();
    this.setSendMessageLog();
  }

  async sync() {
    await this.User.sync();
    await this.Local.sync();
    await this.SendMessage.sync();
    await this.SendMessageLog.sync();
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

  /**
   * @private
   */
  setSendMessageLog() {
    this.SendMessageLog = this.sequelize.define(
      'SendMessageLog',
      {
        createdAt: {
          type: 'TIMESTAMP',
          defaultValue: this.sequelize.literal('CURRENT_TIMESTAMP'),
          allowNull: false,
        },
        response: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
      },
      {
        timestamps: false,
      },
    );

    this.SendMessageLog.belongsTo(this.SendMessage);
  }

  /**
   * @private
   */
  setSendMessage() {
    this.SendMessage = this.sequelize.define(
      'SendMessage',
      {
        mobile: {
          type: DataTypes.STRING(24),
        },
        message: {
          type: DataTypes.TEXT,
        },
        country: {
          type: DataTypes.STRING(2),
        },
        createdAt: {
          type: 'TIMESTAMP',
          defaultValue: this.sequelize.literal('CURRENT_TIMESTAMP'),
          allowNull: false,
        },
        deliveredAt: {
          type: 'TIMESTAMP',
          allowNull: true,
        },
        try: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
      },
      {
        indexes: [
          { type: 'FULLTEXT', name: 'message', fields: ['message'] },
          { name: 'deliveredAt', fields: ['deliveredAt'] },
          { name: 'try', fields: ['try'] },
        ],
        timestamps: false,
      },
    );

    this.SendMessage.belongsTo(this.User);
  }

  /**
   * @private
   */
  setLocal() {
    this.Local = this.sequelize.define(
      'Local',
      {
        mobile: {
          type: DataTypes.STRING(24),
        },
        message: {
          type: DataTypes.TEXT,
        },
        createdAt: {
          type: 'TIMESTAMP',
          defaultValue: this.sequelize.literal('CURRENT_TIMESTAMP'),
          allowNull: false,
        },
      },
      {
        indexes: [{ type: 'FULLTEXT', name: 'message', fields: ['message'] }],
        timestamps: false,
      },
    );
  }

  /**
   * @private
   */
  setUser() {
    this.User = this.sequelize.define(
      'User',
      {
        name: {
          type: DataTypes.STRING,
          unique: true,
          validate: {
            is: /^[a-z][a-z0-9]{2,30}[a-z]$/,
          },
        },
        admin: {
          type: DataTypes.BOOLEAN,
        },
        active: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        password: {
          type: DataTypes.STRING,
        },
        apiKey: {
          type: DataTypes.STRING,
        },
        createdAt: {
          type: 'TIMESTAMP',
          defaultValue: this.sequelize.literal('CURRENT_TIMESTAMP'),
          allowNull: false,
        },
      },
      {
        indexes: [{ name: 'apiKey', fields: ['apiKey'] }],
        timestamps: false,
        getterMethods: {
          safeJSON() {
            return {
              id: this.id,
              admin: this.admin,
              active: this.active,
              apiKey: this.apiKey,
              createdAt: this.createdAt,
            };
          },
        },
      },
    );

    this.User.hashPassword = async (rawPassword) =>
      new Promise((resolve) => {
        argon2.hash(rawPassword).then((hash) => {
          resolve(hash);
        });
      });
    this.User.validPassword = async (hashed, rawPassword) =>
      new Promise((resolve) => {
        argon2
          .verify(hashed, rawPassword)
          .then((valid) => {
            resolve(valid);
          })
          .catch(() => {
            resolve(false);
          });
      });
    this.User.randomAPIKey = () =>
      crypto
        .createHash('sha512')
        .update([Date.now().toString(36), Math.random().toString()].join(':'))
        .digest('base64')
        .replace(/[^a-z0-9]/gi)
        .substr(0, 64);
  }

  getEntities() {
    return {
      UserEntity: this.User,
      LocalEntity: this.Local,
      SendMessageEntity: this.SendMessage,
      SendMessageLogEntity: this.SendMessageLog,
    };
  }
}

module.exports = Models;
