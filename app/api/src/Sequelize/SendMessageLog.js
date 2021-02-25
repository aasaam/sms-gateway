const { DataTypes } = require('sequelize');

class SendMessageLog {
  constructor({
    /** @type {import('sequelize').Sequelize} */
    sequelize,
    SendMessage,
  }) {
    this.model = sequelize.define(
      'SendMessageLog',
      {
        sendMessage: {
          type: DataTypes.INTEGER,
          references: {
            model: SendMessage.getModel(),
            key: 'id',
          },
        },
        createdAt: {
          type: 'TIMESTAMP',
          defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
          allowNull: false,
        },
        responseStatus: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        response: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        timestamps: false,
      },
    );
  }

  async sync() {
    this.model.sync();
  }

  getModel() {
    return this.model;
  }
}

module.exports = SendMessageLog;
