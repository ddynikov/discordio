'use strict';

const findC = require('../find_con');
const yts = require('yt-search');
const Discord = require('discord.js');

const createEmbed = (title, url, thumb, info, authorName, authorAvatar) =>
  new Discord.MessageEmbed()
    .setColor('#9deb70')
    .setTitle(title)
    .setURL(url)
    .setAuthor(authorName, authorAvatar)
    .setThumbnail(thumb);

module.exports = {
  name: 'playlist',
  description: 'Add playlist to the queue',
  execute(message, args, client) {
    const controller = findC(message, client);
    if (controller === undefined) return;

    let term;
    if (args[0].startsWith('https://')) {
      const index = args[0].indexOf('list=') + 5;
      let endIndex = args[0].indexOf('&', index);
      if (endIndex === -1) endIndex = args[0].length;
      term = {
        listId: args[0].slice(index, endIndex),
      };
    } else {
      term = args.join(' ');
    }
    yts(term, (err, results) => {
      if (err) {
        message.reply('There was an error!');
        return console.log(err);
      }
      if (results.playlists) {
        if (results.playlists.length === 0)
          return message.reply('Couldn\'t find anything!');
        return this.execute(message, [results.playlists[0].url], client);
      }

      if (results.items.length + controller.queue.length > 200)
        return message.reply('The queue is too long!');

      let songsCounter = 0;
      results.items.forEach(video => {
        const embed = createEmbed(video.title, video.url,
          video.thumbnail, video.description,
          message.author.username, message.author.avatarURL());
        const link = video.url;
        const song = { link, embed, message };
        controller.queue.push(song);
        songsCounter++;
      });
      message.channel.send(`**Queued ${songsCounter} songs**`);
      setImmediate(() => {
        if (!controller.playing) controller.emit('finish');
      });
    });
  },
};

