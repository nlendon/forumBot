const VkBot = require('node-vk-bot-api');
const api = require('node-vk-bot-api/lib/api');
const mysql = require('mysql2');
const Scene = require('node-vk-bot-api/lib/scene')
const Session = require('node-vk-bot-api/lib/session')
const Stage = require('node-vk-bot-api/lib/stage')
const owner = 551919818;
require('dotenv').config();

let connection = mysql.createPool({
    host: process.env.HOST,
    user: 'analysed_forumvk',
    password: process.env.PASS,
    database: process.env.DB
});

const bot = new VkBot(process.env.TOKEN);
const session = new Session();

bot.use(async (ctx, next) => {
    try {
        await next();
    } catch (e) {
        console.error(e);
    }
});

const addstuff = new Scene('addstuff',
    async (ctx) => {
        ctx.session.nickname = ctx.message.text.slice(10);
        if (ctx.session.nickname) {
            ctx.reply('Введите ВК Администратора');
            ctx.scene.next();
        }
        else {
            ctx.reply('Вы не ввели ник администратора');
            ctx.scene.leave();
        }
    },
    async (ctx) => {
        ctx.session.vk = ctx.message.text;
        ctx.reply('Введие Должность Администратора');
        ctx.scene.next();
    },
    async (ctx) => {
        ctx.session.dolj = ctx.message.text;
        let user = await api('users.get', {
            user_id: ctx.session.vk,
            access_token: process.env.TOKEN,
        });
        ctx.scene.leave();
        let sql = `INSERT INTO admins(user, dolj, userid) VALUES ('${ctx.session.nickname}','${ctx.session.dolj}','${user.response[0].id}')`;
        connection.query(sql, async function (err, results) {
            if(err) {
                console.log(err);
            }
            else {
            await ctx.reply(`Администратора ${ctx.session.nickname} успешно был добавлен!`);
            }
        })
    });

const stage = new Stage(addstuff);

bot.use(session.middleware());
bot.use(stage.middleware());

bot.command('/addstuff', async (ctx) => {
    ctx.scene.enter('addstuff')
});

bot.startPolling();
console.log('Scene loaded');