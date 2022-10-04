const VkBot = require('node-vk-bot-api');
const api = require('node-vk-bot-api/lib/api');
const mysql = require('mysql2');
require('dotenv').config();
require('./Scene');
const owner = 551919818;


let connection = mysql.createPool({
    host: process.env.HOST,
    user: 'analysed_forumvk',
    password: process.env.PASS,
    database: process.env.DB
});

const bot = new VkBot(process.env.TOKEN);

bot.use(async (ctx, next) => {
    try {
        await next();
    } catch (e) {
        console.error(e);
    }
});

bot.command('/fs', (ctx) => {
    ctx.reply(`Бот Живой. Версия Бота 1.0.0`);
});

bot.command('/fhelp', (ctx) => {
    ctx.reply(`Доступные команды бота:\n/report {Сообщение} - Отправить репорт или сообщение в беседу форумников\n/gtask {Задание} - Отправить задание в беседу Форумников\n/done {ID} - Выполнить задачу\n/tasks - Узнать текущие задачи.\n/logs - Получить все задачи, которые были отправлены в течении недели\n/asay {Сообщение} - Отправить Анонимное сообщение в Рабочую Беседу\n/message {Сообщение} - Отправить сообщение в Рабочу Беседу
    `);
})

bot.command('/gtask', async (ctx) => {
    let task = ctx.message.text.slice(7);
    if (task) {
        let user = await api('users.get', {
            user_id: ctx.message.from_id,
            access_token: process.env.TOKEN,
        });
        let sql = `INSERT INTO tasks(task, sender) VALUES ('${task}','${user.response[0].first_name + ' ' + user.response[0].last_name}')`;
        connection.query(sql, async function (err, results) {
            if (err) {
                console.log(err);
            }
            else {
                let random = Math.floor(Math.random() * 100)
                let log = await api('messages.send', {
                    chat_id: 1,
                    random_id: random,
                    access_token: process.env.TOKEN,
                    message: `${user.response[0].first_name + ' ' + user.response[0].last_name} добавил текущее задание:\n${task}`
                });
            }
        });
        let logSQL = `INSERT INTO logs(task, sender, performer) VALUES ('${task}', '${user.response[0].first_name + ' ' + user.response[0].last_name}', 'null')`
        connection.query(logSQL, async function (err, results) {
            if (err) {
                console.log(err);
            }
        });
        await ctx.reply(`Задание успешно отправлено. Узнать список и Номера задач можно так: /tasks`);
    }
    else {
        ctx.reply('Вы не указали сообщение');
    }
});
bot.command(`/tasks`, (ctx) => {
    let sql = `SELECT * FROM tasks`
    connection.query(sql, async function (err, results) {
        if (results[0]) {
            for (let i = 0; i < results.length; i++) {
                await ctx.reply(`
                        ИФ Отправителя: ${results[i].sender}
                        Задача: ${results[i].task}
                        ID Задачи: ${results[i].id}
                        `);
            }
        }
        else {
            ctx.reply('Задач пока нет!');
        }
    });
});
bot.command('/report', async (ctx) => {
    let report = ctx.message.text.slice(8);
    if (report) {
        let random = Math.floor(Math.random() * 100)
        let user = await api('users.get', {
            user_id: ctx.message.from_id,
            access_token: process.env.TOKEN,
        });
        let log = await api('messages.send', {
            chat_id: 1,
            random_id: random,
            access_token: process.env.TOKEN,
            message: `${user.response[0].first_name + ' ' + user.response[0].last_name} Сообщил об этом\n${report}`
        });
        ctx.reply('Сообщение отправлено в беседу Форумной Администрации');
    }
    else {
        ctx.reply('Вы не указали Сообщение');
    }
});
bot.command('/done', async (ctx) => {
    let id = ctx.message.text.slice(6);
    let user = await api('users.get', {
        user_id: ctx.message.from_id,
        access_token: process.env.TOKEN,
    });
    if (id) {
        let sql = `DELETE FROM tasks WHERE id = '${id}'`;
        connection.query(sql, async function (err, results) {
            if (err) {
                console.log(err);
            }
            else {
                let random = Math.floor(Math.random() * 100)
                let log = await api('messages.send', {
                    chat_id: 3,
                    random_id: random,
                    access_token: process.env.TOKEN,
                    message: `Задание под ID ${id} успешно выполнено`
                });
                await ctx.reply(`Задание под Номером ${id} успешно выполнено`);
            }
        });
        // let logSQL = `UPDATE logs SET performer='${user.response[0].first_name + ' ' + user.response[0].last_name}' WHERE id = '${id}'`
        // connection.query(logSQL, async function (err, results) {
        //     if(err) {
        //         console.log(err);
        //     }
        // });
    }
    else {
        ctx.reply('Вы не указали ID задания');
    }

});
bot.command('/logs', async (ctx) => {
    let sql = `SELECT * FROM logs`
    connection.query(sql, async function (err, results) {
        for (let i = 0; i < results.length; i++) {
            await ctx.reply(`
        id: ${results[i].id}
        task: ${results[i].task}
        sender: ${results[i].sender}
        performer: ${results[i].performer}
        `)
        }
    });
});

bot.command('/asay', async (ctx) => {
    let message = ctx.message.text.slice(6);
    if (message) {
        let random = Math.floor(Math.random() * 100)
        let log = await api('messages.send', {
            chat_id: 3,
            random_id: random,
            access_token: process.env.TOKEN,
            message: `Anonym - ${message}`
        });
        await ctx.reply('Сообщение успешно отправлено (Анонимно)')
    }
    else {
        ctx.reply('Вы не указали сообщение!');
    }
});

bot.command('/message', async (ctx) => {
    let message = ctx.message.text.slice(3);
    if (message) {
        let random = Math.floor(Math.random() * 100)
        let user = await api('users.get', {
            user_id: ctx.message.from_id,
            access_token: process.env.TOKEN,
        });
        let log = await api('messages.send', {
            chat_id: 3,
            random_id: random,
            access_token: process.env.TOKEN,
            message: `${user.response[0].first_name + ' ' + user.response[0].last_name} - ${message}`
        });
        await ctx.reply('Сообщение успешно отправлено')
    }
    else {
        ctx.reply('Вы не указали сообщение!');
    }
});

bot.command('/addstuff', (ctx)=>{

})




bot.startPolling();
console.log('Бот работает!');