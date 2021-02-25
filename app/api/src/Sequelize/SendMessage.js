const { DataTypes } = require('sequelize');

class SendMessage {
  constructor({
    /** @type {import('sequelize').Sequelize} */
    sequelize,
    UserModel,
  }) {
    this.model = sequelize.define(
      'SendMessage',
      {
        to: {
          type: DataTypes.STRING(16),
        },
        country: {
          type: DataTypes.STRING(2),
        },
        message: {
          type: DataTypes.TEXT,
        },
        user: {
          type: DataTypes.INTEGER,
          references: {
            model: UserModel.getModel(),
            key: 'id',
          },
        },
        try: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        createdAt: {
          type: 'TIMESTAMP',
          defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
          allowNull: false,
        },
        tryAt: {
          type: 'TIMESTAMP',
          allowNull: true,
        },
      },
      {
        indexes: [{ type: 'FULLTEXT', name: 'message', fields: ['message'] }],
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

module.exports = SendMessage;
