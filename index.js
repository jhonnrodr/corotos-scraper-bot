const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')

const app = express()
app.listen(3000, () => console.log(' app listening on port 3000!'))

const url = 'https://www.corotos.com.do/l/santo-domingo/sc/inmuebles-en-alquiler/apartamentos?search=evaristo+morales'
let last = '7798699'

checkForUpdate(url)


function checkForUpdate(url){
    axios.get(url).then((response) => {
        const html = response.data
        const $ = cheerio.load(html)
    
        $('.listing__item .item__title').each(function(){
            
            let item = $(this).children('a').attr('href')
            let id = item.substring(item.indexOf('listings/') + 9, item.indexOf('?'))
                
            if(id === last){
                return false;
            }else {
                notify(item)
            }
        })
    }).catch((error) => {
        console.log(error)
    })
}

function notify(item){
    console.log('item nuevo')
    console.log(item)
}
