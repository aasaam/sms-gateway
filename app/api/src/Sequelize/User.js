const crypto = require('crypto');

const argon2 = require('argon2');
const { DataTypes } = require('sequelize');

class User {
  constructor({
    /** @type {import('sequelize').Sequelize} */
    sequelize,
  }) {
    this.model = sequelize.define(
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
        password: {
          type: DataTypes.STRING,
        },
        apiKey: {
          type: DataTypes.STRING,
        },
        createdAt: {
          type: 'TIMESTAMP',
          defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
          allowNull: false,
        },
      },
      {
        timestamps: false,
      },
    );

    this.model.hashPassword = async (rawPassword) =>
      new Promise((resolve) => {
        argon2.hash(rawPassword).then((hash) => {
          resolve(hash);
        });
      });
    this.model.validPassword = async (hashed, rawPassword) =>
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
    this.model.randomAPIKey = () =>
      crypto
        .createHash('sha1')
        .update([Date.now().toString(36), Math.random().toString()].join(':'))
        .digest('base64')
        .replace(/[^a-z0-9]/gi)
        .substr(0, 32);
  }

  async sync() {
    this.model.sync();
  }

  getModel() {
    return this.model;
  }
}

module.exports = User;
