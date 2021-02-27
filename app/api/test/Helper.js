const JWT = require('../src/Core/JWT');

module.exports = {
  token: async (Config, payload) => {
    const jwt = new JWT({ Config });
    return jwt.sign(payload, 600);
  },
};
