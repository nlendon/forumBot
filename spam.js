const VkBot = require('node-vk-bot-api');
const api = require('node-vk-bot-api/lib/api');
const mysql = require('mysql2');
require('dotenv').config();
const owner = 551919818;

// let connection = mysql.createPool({
//     host: process.env.HOST,
//     user: 'analysed_forumvk',
//     password: process.env.PASS,
//     database: process.env.DB
// });

const bot = new VkBot(process.env.TOKEN2);

bot.use(async (ctx, next) => {
    try {
        await next();
    } catch (e) {
        console.error(e);
    }
});


bot.command('/whitelist', (ctx) => {
    ctx.reply(`Users From White List:\n
    1. Vardan Hakobyan
    type: user
    Phone Number: +37477451269\n\n
    2. Karen Karapetyan
    type: user
    Phone Number: +37493537485\n\n
    3. Lusine Asatryan
    type: user
    Phone Number: +37433541968\n\n
    4. Vahe Narimanyan
    type: developer
    Phone Number: +37433150077\n\n
    5. Alexandra Petrosyan
    type: user
    Phone Number: 37499854412\n\n
    6. Narek Karapetyan
    type: user
    Phone Number: +37493340996\n\n
    7. Anna Galstyan
    type: user
    Phone Number: +37477225064
    `);
});

bot.command('/spams', (ctx) => {
    ctx.reply(`Users who reported spam (DataBase Info)\n
    1. Hakob Batoyan
    Duration: 1w
    Phone Number: +37477451269\n\n
    2. Armen Zaqaryan
    Duration: 6d
    Phone Number: +37494551485\n\n
    3. Suren Bayunc
    Duration: 2w
    Phone Number: +37443341953\n\n
    4. Gurgen Grigoryan
    Duration: 1d
    Phone Number: +37443531410\n\n
    6. Anna Galstyan
    Duration: 3w
    Phone Number: +37477225064\n\n
    To add a number or user to white list, enter command: /addwl {userNumber} {duration}.\n
    To update information from spam list, enter command: /updatespam {data}.
    `);
});

bot.command('/addwl', async (ctx)=>{
    if(owner === ctx.message.from_id) {
        let user = ctx.message.text.slice(7);
        await ctx.reply(`Number ${user} added to whitelist success\n\nAll data is added automatically from the database of all sms bombers. Do not change something yourself, ask to developer to change/update data of Numbers`);
     
    }
    else {
        ctx.reply('You are not the Administrator. If something is wrong, please contact with developer of this programm')
    }
   
});

bot.command('/log', async (ctx)=>{
    ctx.reply(`Spam logs:\n\n
    Spam started: Hakob Batoyan,\n
    Spam started: Armen Zaqaryan,\n
    Spam started: Suren Bayunc,\n
    Spam started: Gurgen Grigoryan,\n
    Spam started: Anna Galstyan,\n
    `);
})

bot.startPolling();