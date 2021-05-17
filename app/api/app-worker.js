const { sortBy } = require('lodash');
const fetch = require('node-fetch').default;
const forever = require('async/forever');
const tryEach = require('async/tryEach');
const { Op } = require('sequelize');

const { initContainer } = require('./src/Container');
const { Config: ConfigClass } = require('./src/Config');
const { ConfigSchema } = require('./src/ConfigSchema');

const { log: consoleLog } = console;

(async function start() {
  await new Promise((r) => setTimeout(r, 10000));
  const c = new ConfigClass(ConfigSchema, {});
  const container = await initContainer(c);

  const Config = container.resolve('Config');

  /** @type {import('sequelize').ModelCtor<import('sequelize').Model>} */
  const SendMessageEntity = container.resolve('SendMessageEntity');
  /** @type {import('sequelize').ModelCtor<import('sequelize').Model>} */
  const SendMessageLogEntity = container.resolve('SendMessageLogEntity');

  let adapters = [];
  Object.keys(container.registrations).forEach((name) => {
    if (name.match(/Adapter$/)) {
      const adapter = container.resolve(name);
      if (adapter.active) {
        adapters.push({
          name,
          adapter,
          priority: adapter.priority,
        });
      }
    }
  });

  adapters = sortBy(adapters, ['priority']).reverse();

  forever(
    // eslint-disable-next-line sonarjs/cognitive-complexity
    async () => {
      // interval wait for next message
      await new Promise((r) =>
        setTimeout(r, Config.ASM_PUBLIC_SENDING_INTERVAL_MICROSECONDS),
      );

      // find message that [not delivered, not isSending and no much try]
      const sendMessage = await SendMessageEntity.findOne({
        where: {
          deliveredAt: {
            [Op.lt]: new Date(0),
          },
          isSending: false,
          try: {
            [Op.lte]: Config.ASM_PUBLIC_MAX_TRY,
          },
        },
        order: [['try', 'ASC']],
      });

      if (sendMessage) {
        // is sending now
        // @ts-ignore
        sendMessage.isSending = true;
        await sendMessage.save();

        const tryEachFunctions = [];
        adapters.forEach((adapter) => {
          tryEachFunctions.push(async () => {
            let tryNext = true;
            const setup = adapter.adapter.setUp({
              country: sendMessage.country,
              mobile: sendMessage.mobile,
              message: sendMessage.message,
            });
            if (setup) {
              const response = await fetch(setup.url, setup.fetch);
              const text = await response.text();
              const result = await adapter.adapter.success({
                status: response.status,
                headers: response.headers.raw(),
                text,
              });

              await SendMessageLogEntity.create({
                response: JSON.stringify(result.response),
                SendMessageId: sendMessage.id,
              });

              if (result.result === true) {
                tryNext = false;
              }
            }
            sendMessage.try += 1;
            if (tryNext === false) {
              sendMessage.deliveredAt = new Date();
              sendMessage.isSending = false;
              await sendMessage.save();
              return true;
            }
            sendMessage.isSending = false;
            await sendMessage.save();
            return new Error('Try next adapter');
          });
        });
        await new Promise((resolve) => {
          tryEach(tryEachFunctions, (e) => {
            if (e) {
              consoleLog(e);
            }
            resolve();
          });
        });
      }
    },
    (e) => {
      consoleLog(e);
    },
  );
})();
