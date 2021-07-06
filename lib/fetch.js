const got = require('got')
const brainlyScraper = require('brainly-scraper-v2')
const config = require('../config.json')

/**  Random Image  **/
const unplas = () => new Promise((resolve, reject) => {
    console.log(`Getting Unplas image`)
    got.get(`https://api.unsplash.com/photos/random?client_id=pAPaZMB_iK7x8ZhAhIn0qBaNHIEYUYj1GiJHkY7xUEI`)
        .then(async (res) => {
            resolve(JSON.parse(res.body))
        }).catch((err) => reject(err))
})
const alphacoders = (query) => new Promise((resolve, reject) => {
    console.log(`Getting Alphacoders where query is ${query}`)
    got.get(`${config.api.main}/alphacoders?q=${query}`)
        .then(async (res) => {
            resolve(JSON.parse(res.body))
        }).catch((err) => reject(err))
})


/**  Anime  **/ 
const wallanime = () => new Promise((resolve, reject) => {
    console.log(`Getting WallAnime`)
    got.get(`https://nekos.life/api/v2/img/wallpaper`)
        .then(async (res) => {
            resolve(JSON.parse(res.body))
        }).catch((err) => reject(err))
})
// const neko = () => new Promise((resolve, reject) => {
//     console.log(`Getting Neko`)
//     got.get(`https://api.computerfreaker.cf/v1/neko`)
//         .then(async (res) => {
//             resolve(JSON.parse(res.body))
//         }).catch((err) => reject(err))
// })
// const hentai = () => new Promise((resolve, reject) => {
//     console.log(`Getting Hentai`)
//     got.get(`https://api.computerfreaker.cf/v1/hentai`)
//         .then(async (res) => {
//             resolve(JSON.parse(res.body))
//         }).catch((err) => reject(err))
// })


/**  Fetcher  **/
const wiki = (query) => new Promise((resolve, reject) => {
    console.log(`Getting wikipedia where query is ${query}`)
    got.get(`${config.api.main}/wikipedia/id?q=`+query)
        .then(async (res) => {
            resolve(JSON.parse(res.body))
        }).catch((err) => reject(err))
})
const brainly = (query) => new Promise((resolve, reject) => {
    console.log(`Getting brainly where query is ${query}`)
    brainlyScraper(query)
        .then(async (res) => {
            resolve(JSON.parse(res.data.map((v, i) => `_*PERTANYAAN KE ${i + 1}*_\n${v.pertanyaan}\n${v.jawaban.map((v,i) => `*JAWABAN KE ${i + 1}*\n${v.text}`).join('\n')}`).join('\n\n•------------•\n\n')            ))
        }).catch((err) => reject(err))
})

const lirik = (query) => new Promise((resolve, reject) => {
    console.log(`Getting lirik lagu where judul is ${query}`)
    got.get('https://api.vhtear.com/liriklagu?query='+query)
        .then(async (res) => {
            resolve(JSON.parse(res.body))
        }).catch((err) => reject(err))
})


/**  BMKG  **/ 
const covid = (provinsi) => new Promise((resolve, reject) => {
    console.log(`Getting covid data from ${provinsi}`)
    got.get(`${config.api.main}/covid/${provinsi}`)
        .then(async (res) => {
            resolve(JSON.parse(res.body))
        }).catch((err) => reject(err))
})




module.exports = {
    unplas,
    alphacoders,
    wallanime,
    // neko,
    // hentai,
    wiki,
    brainly,
    lirik,
    covid,
}