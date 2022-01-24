const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')

const botgram = require("botgram")
const bot = botgram("5107559829:AAG3CkXiRNUdZI1mt0b9xV5RogF16LzxyDw")
const DB = require('./model.js');

const app = express()
const route = require('./route.js')(app);
app.listen(3000, () => console.log(' app listening on port 3000!'))

bot.command("start", function (msg, reply, next) {
    subscribe(msg.chat.id)
    reply.text("Welcome to the bot, this bot to notify you about new listings")
});

bot.command("test", function (msg, reply, next) {
    let template = `<b>Titulo: `+'Alquilo Apartamento amueblado en Los Cacicazgos. Cerca del Dominican Fiesta'+`</b>
    <b>Precio: `+'$1,000,000'+`</b>
    <b>URL: `+'https://www.corotos.com.do/listings/alquilo-apartamento-nuevo-en-bella-vista-3-habs-01fgsdcxgg0cq6ddxhxpf98czp?details_page=1&page=1&q%5Bborough_province_slug_eq%5D=santo-domingo&q%5Bcategory_slug_eq%5D=inmuebles-en-alquiler&q%5Bsub_category_slug_eq%5D=apartamentos&render_time=2022-01-23T22%3A29%3A24.196715-04%3A00'+`</b>
    `;
    reply.html(template)
});

bot.command("add", function (msg, reply, next) {
    var code = msg.args();
    addListing(code)
    reply.text("New Listing to notify is added.")
});

app.get('/', function(request, response) {
    response.send('Running Scraper to check for new listings')
    runCheck()
});

async function checkForUpdate(url, uid) {
    let last = null
    last = await getLastListing(uid);
    console.log('Revisando')
    axios.get(url).then((response) => {
        const html = response.data
        const $ = cheerio.load(html)

        let firstListing = $('#items-container .listing__item ').first().children('.item__title').children('a').attr('href')
        firstListing = firstListing.substring(firstListing.indexOf('listings/') + 9, firstListing.indexOf('?'))
        
        $('#items-container .listing__item ').each(function(){
            
            let item = $(this).children('.item__title').children('a').attr('href')
            let title = $(this).children('.item__title').text()
            let price = $(this).children('.item__price').text()
           
            let id = item.substring(item.indexOf('listings/') + 9, item.indexOf('?'))
           
            if(id === last || last === null){
                if(last === null){
                    console.log('No hay registros')
                    last = firstListing
                    saveLastListing(uid, firstListing)
                }
                if(last !== firstListing){
                    console.log('Actualizando ultimo registro')
                    saveLastListing(uid, firstListing)
                }
                console.log('Sin cambios')
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
        notifyError(error)
    })
}

function notifyItem(item){
    DB.getAllTelegramData(function(error, telegram)
    {
        telegram.forEach(function(elem, i){
            let template = `
            <b>Nuevo listing disponible</b>
            <b>Titulo: `+item.title+`</b>
            <b>Precio: `+item.price+`</b>
            <b>URL: `+item.url+`</b>
            `;
            bot.reply(telegram[i].telegram_id).html(template)
        })
    })
}

function notifyError(errors) {
    DB.getAllTelegramData(function(error, telegram)
    {
        telegram.forEach(function(elem, i){
            bot.reply(telegram[i].telegram_id).text('Un error acaba de ocurrir')
            bot.reply(telegram[i].telegram_id).text(errors)
        })
    })
}

function subscribe(chatId){
    DB.insertTelegramId({
        id: chatId
    });
}
function runCheck(){
    DB.getAllCorotos(function(error, data)
    {
        data.forEach(function(elem, i){
            checkForUpdate(data[i].url, data[i].id)
        })
    })
}
function addListing(msg){
    DB.insertRecord({
        url: msg
    })
}

function getLastListing(id){
    return  DB.getLastListing(id)
}
function saveLastListing(id, data){
    DB.saveLastRecord(id, data)
}
