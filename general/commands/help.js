const { MessageEmbed } = require('discord.js')
const commandList = new MessageEmbed()
  .setColor('#8c9eff')
  .setTitle('Discord Deception Bot Commands:')
  .setURL('https://github.com/trevorliu13/Discord-Deception')
  .setThumbnail('https://i.imgur.com/IchybTu.png')
  .addFields({
    name: '**Commands:**',
    value:
      '```diff\n' +
      '  ?mafia: masked men mysteriously murder many mates midst meetings & marshal meddling\n' +
      '  ?coup: [under construction]\n' +
      '```',
  })

module.exports = msg => {
  msg.channel.send(commandList)
}
