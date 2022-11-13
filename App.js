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

bot.command('/fv', (ctx) => {
    ctx.reply(`Бот Живой. Версия Бота 1.0.0`);
});

bot.command('/fhelp', (ctx) => {
    ctx.reply(`Доступные команды бота:\n\n/fs - Получить Команду Следящих\n/report {Сообщение} - Отправить репорт или сообщение в беседу форумников\n/gtask {Задание} - Отправить задание в беседу Форумников\n/done {ID} - Выполнить задачу\n/tasks - Узнать текущие задачи.\n/logs - Получить все задачи, которые были отправлены в течении недели (Минимальный Уровень Доступа 2)\n/asay {Сообщение} - Отправить Анонимное сообщение в Рабочую Беседу (Минимальный Уровень Доступа 2)\n/message {Сообщение} - Отправить сообщение в Рабочу Беседу (Минимальный Уровень Доступа 1)\n/fv - Узнать Подробности Бота\n/deletelog - Очистить Логи (Минимальный Уровень Доступа 3)\n/addstuff - Добавить члена Форумной администрации (Минимальный Уровень Доступа 4)\n/fwarn - Выдать Предупреждение Форумному Администратору (Минимальный Уровень Доступа 3)\n/unwarn - Снять Предупреждение Форумному Администратору (Минимальный Уровень Доступа 3)`);
})

bot.command('/gtask', async (ctx) => {
    let task = ctx.message.text.slice(7);
    let points = Math.floor(Math.random() * 20)
    if (task) {
        let user = await api('users.get', {
            user_id: ctx.message.from_id,
            access_token: process.env.TOKEN,
        });
        let sql = `INSERT INTO tasks(task, sender, points) VALUES ('${task}','${user.response[0].first_name + ' ' + user.response[0].last_name}', "${points}")`;
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
                    message: `${user.response[0].first_name + ' ' + user.response[0].last_name} добавил текущее задание:\n${task}\nБаллы за выполнение: ${points}`
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
        let sql = `SELECT * FROM tasks WHERE id = '${id}'`;
        connection.query(sql, async function (err, results) {
            let points = results[0].points;
            let task = results[0].task;
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
                        message: `Задание ${task} успешно выполнен`
                    });
                    await ctx.reply(`Задание ${task} успешно выполнен`);
                    let sql = `UPDATE logs SET performer='${user.response[0].first_name + ' ' + user.response[0].last_name}' WHERE task = '${task}'`;
                    connection.query(sql, function (err, results) {
                        if (err) {
                            console.log(err);
                        }
                    })
                    let checkSql = `SELECT * FROM admins WHERE userid= "${ctx.message.from_id}"`;
                    connection.query(checkSql, async function(err, results) {
                        let pointsSql = `UPDATE admins SET points = "${results[0].points + points}" WHERE userid = "${ctx.message.from_id}"`;
                            connection.query(pointsSql, async function(err, result) {
                               if(err) {
                                   console.log(err)
                               }
                            });
                    })

                }
            });
        });
    }
    else {
        ctx.reply('Вы не указали ID задания');
    }

});
bot.command('/logs', async (ctx) => {
    let sql = `SELECT * FROM admins WHERE userid = "${ctx.message.from_id}"`
    connection.query(sql, async function (err, results) {
        if (results[0].role === '4' || results[0].role === '3' || results[0].role === '2') {
            let sql = `SELECT * FROM logs`
            let message = 'Список Логов за неделю:\n\n'
            connection.query(sql, async function (err, results) {
                if (results[0]) {
                    for (let i = 0; i < results.length; i++) {
                        message += 'ID: ' + results[i].id + '\n';
                        message += 'Задание: ' + results[i].task + '\n';
                        message += 'Отправитель: ' + results[i].sender + '\n';
                        message += 'Исполнитель: ' + results[i].performer + '\n\n';
                    }
                    ctx.reply(message);
                }
                else {
                    ctx.reply('Логов не найдено');
                }
            });
        }
        else {
            ctx.reply('Отказано в доступе! Минимальный уровень доступа 2');
        }
    });

});

bot.command('/asay', async (ctx) => {
    let sql = `SELECT * FROM admins WHERE userid = "${ctx.message.from_id}"`
    connection.query(sql, async function (err, results) {
        if (results[0].role === '4' || results[0].role === '3' || results[0].role === '2') {
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
        }
        else {
            ctx.reply('Отказано в доступе! Минимальный уровень доступа 2');
        }
    });
});

bot.command('/message', async (ctx) => {
    let sql = `SELECT * FROM admins WHERE userid = "${ctx.message.from_id}"`
    connection.query(sql, async function (err, results) {
        if (results[0].role === '4' || results[0].role === '3' || results[0].role === '2' || results[0].role === '1') {
            let message = ctx.message.text.slice(9);
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
        }
        else {
            ctx.reply('Отказано в доступе. Минимальный уровень доступа 1');
        }
    });
});

bot.command('/fs', (ctx) => {
    let sql = `SELECT * FROM admins`;
    let message = 'Состав Форумной Администрации: \n\n'
    connection.query(sql, async function (err, results) {
        for (let i = 0; i < results.length; i++) {
            message += (i + 1) + '. Никнейм: ' + results[i].user + '\n';
            message += 'Должность ' + results[i].dolj + '\n\n';
        }
        ctx.reply(message);
    });
});

bot.command('/deletelog', (ctx) => {
    let sql = `SELECT * FROM admins WHERE userid = "${ctx.message.from_id}"`
    connection.query(sql, async function (err, results) {
        if (results[0].role === '4' || results[0].role === '3') {
            let sql = `DELETE FROM logs`;
            connection.query(sql, async function (err, results) {
                await ctx.reply('Все логи были очищены администратором');
            });
        }
        else {
            ctx.reply('Отказано в доступе! Минимальный уровень доступа 3');
        }
    });
});

bot.command('/fwarn', (ctx) => {
    let sql = `SELECT * FROM admins WHERE userid = "${ctx.message.from_id}"`
    connection.query(sql, async function (err, results) {
        if (results[0].role === '4' || results[0].role === '3') {
            let user = ctx.message.text.slice(7);
            if (user) {
                let sql = `SELECT * FROM admins WHERE user = '${user}'`;
                connection.query(sql, async function (err, results) {
                    if (results[0]) {
                        let sql = `UPDATE admins SET warns='${results[0].warns + 1}' WHERE user = '${user}'`;
                        connection.query(sql, async function (err, results) {
                            if (err) {
                                console.log(err);
                            }
                            else {
                                await ctx.reply(`Администратор ${user} получил Предупреждение`);
                            }
                        });
                    }
                    else {
                        ctx.reply('Администратор не найден!');
                    }
                });
            }
            else {
                ctx.reply('Вы не указали Никнейм Администратора');
            }
        }
        else {
            ctx.reply('Отказано в доступе. Минимальный Уровень Доступа 3!');
        }
    });
});

bot.command('/unwarn', (ctx) => {
    let sql = `SELECT * FROM admins WHERE userid = "${ctx.message.from_id}"`
    connection.query(sql, async function (err, results) {
        if (results[0].role === '4' || results[0].role === '3') {
            let user = ctx.message.text.slice(8);
            if (user) {
                let sql = `SELECT * FROM admins WHERE user = '${user}'`;
                connection.query(sql, async function (err, results) {
                    if (results[0]) {
                        if(results[0].warns > 0) {
                            let sql = `UPDATE admins SET warns='${results[0].warns - 1}' WHERE user = '${user}'`;
                            connection.query(sql, async function (err, results) {
                                if (err) {
                                    console.log(err);
                                }
                                else {
                                    await ctx.reply(`Вы сняли администратору ${user} 1 Предупреждение`);
                                }
                            });
                        }
                        else {
                            await ctx.reply('Администратор не имеет Предупреждений');
                        }

                    }
                    else {
                        ctx.reply('Администратор не найден!');
                    }
                });
            }
            else {
                ctx.reply('Вы не указали Никнейм Администратора');
            }
        }
        else {
            ctx.reply('Отказано в доступе. Минимальный Уровень Доступа 3!');
        }
    });
});

bot.command('/cancel', async(ctx)=>{
    let user = await api('users.get', {
        user_id: ctx.message.from_id,
        access_token: process.env.TOKEN,
    });
    let id = ctx.message.text.slice(8);
    if (id) {
        let sql = `SELECT * FROM tasks WHERE id = '${id}'`;
        connection.query(sql, async function (err, results) {
            let task = results[0].task;
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
                        message: `Задание "${task}" был отменён администратором ${user.response[0].first_name + ' ' + user.response[0].last_name}`
                    });
                    await ctx.reply(`Задание ${task} успешно отменён`);
                    let sql = `DELETE FROM logs WHERE task = '${task}'`;
                    connection.query(sql, function (err, results) {
                        if (err) {
                            console.log(err);
                        }
                    })
                }
            });
        });
    }
    else {
        ctx.reply('Вы не указали ID задания');
    }
});

bot.command('/points', (ctx) => {
    let sql = `SELECT * FROM admins WHERE userid= "${ctx.message.from_id}"`;
    connection.query(sql, async function (err, results) {
            await ctx.reply(`Количество ваших баллов - ${results[0].points}`);
    });
});

bot.command('/cp', (ctx)=>{
    let sql = `UPDATE admins SET points = "0"`;
    connection.query(sql, async function(err, results) {
        await ctx.reply('Количество баллов у всех пользователей был обнулён');
    });
})



bot.startPolling();
console.log('Бот работает!');

