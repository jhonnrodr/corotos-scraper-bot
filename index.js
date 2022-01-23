const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')

const botgram = require("botgram")
const bot = botgram("5107559829:AAG3CkXiRNUdZI1mt0b9xV5RogF16LzxyDw")
const DB = require('./model.js');

const app = express()
const route = require('./route.js')(app);
app.listen(3000, () => console.log(' app listening on port 3000!'))

const url = 'https://www.corotos.com.do/l/santo-domingo/sc/inmuebles-en-alquiler/apartamentos?search=evaristo+morales'
let last = 'alquilo-apartamento-totalmente-amueblado-en-evaristo-morales-01fj2dw920zw790d7rfb2q52n2'

bot.command("start", function (msg, reply, next) {
    subscribe(msg.chat.id)
    reply.text("Welcome to the bot, this bot to notify you about new listings")
});

function checkForUpdate(url) {
    axios.get(url).then((response) => {
        const html = response.data
        const $ = cheerio.load(html)
        $('#items-container .listing__item ').each(function(){
            
            let item = $(this).children('.item__title').children('a').attr('href')
            let title = $(this).children('.item__title').text()
            let price = $(this).children('.item__price').text()
           
            let id = item.substring(item.indexOf('listings/') + 9, item.indexOf('?'))
                
            if(id === last){
                return false;
            }else {
                let url = new URL(item, 'https://www.corotos.com.do')
                notifyItem({
                    title: title,
                    price: price,
                    url: url,
                })
            }
        })
    }).catch((error) => {
        console.log(error)
    })
}

function notifyItem(item){
    DB.getAllTelegramData(function(error, telegram)
    {
        telegram.forEach(function(elem, i){
            bot.reply(telegram[i].telegram_id).text('Nuevo listing disponible')
            bot.reply(telegram[i].telegram_id).text(item.title)
            bot.reply(telegram[i].telegram_id).text(item.price)
            bot.reply(telegram[i].telegram_id).text(item.url)
        })
    })
}

function notifyError(error) {

}

function subscribe(chatId){
    DB.insertTelegramId({
        id: chatId
    });
}
