/* eslint-env jest */

const {
  GenericResponse,
} = require('../../../src/Core/Fastify/GenericResponse');

describe(__filename.replace(__dirname, ''), () => {
  it('GenericResponse', async () => {
    const reply = {
      status() {},
      send() {},
    };
    const g = new GenericResponse(404, 'Nothing found here...');
    expect(g.getObject()).toBeTruthy();
    expect(g.getObject('Another message')).toBeTruthy();
    g.reply(reply);
    g.reply(reply, 'Message Next');
  });
});
