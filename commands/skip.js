const findC = require('../find_con');

module.exports = {
  name: 'skip',
  description: 'Skips a song',
  execute(message, args, client) {
    const controller = findC(message, client);
    if (controller === undefined) return;
    if (controller.dispatcher && controller.playing) {
      controller.dispatcher.end();
      message.react('👍🏼').catch(err => console.log(err));
    }
  },
};
