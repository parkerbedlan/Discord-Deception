require("dotenv").config();
const Discord = require('discord.js'); 
const client = new Discord.Client();  

client.on('ready', () => {   
    console.log(`Logged in as ${client.user.tag}!`); 
});

client.on('message', async msg => {  
    if(msg.content.startsWith('?')) {
       switch(msg.content.substring(1)) {
        case "ping":
            msg.reply("Pong!")
            break;
        default:
            break;
       }
    }
});

client.login(process.env.BOT_TOKEN);