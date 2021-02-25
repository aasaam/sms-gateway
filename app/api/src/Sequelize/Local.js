const { DataTypes } = require('sequelize');

class Local {
  constructor({
    /** @type {import('sequelize').Sequelize} */
    sequelize,
  }) {
    this.model = sequelize.define(
      'Local',
      {
        to: {
          type: DataTypes.STRING(16),
        },
        message: {
          type: DataTypes.TEXT,
        },
        createdAt: {
          type: 'TIMESTAMP',
          defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
          allowNull: false,
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

module.exports = Local;
