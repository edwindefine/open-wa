const got = require('got')
const jimp = require('jimp');
const imageToBase64 = require('image-to-base64');
const config = require('../config.json')


/**  Converter  **/ 
const tts = (bahasa, teks) => new Promise(async (resolve, reject) => {
    const ttsId = require('node-gtts')('id')
    const ttsEn = require('node-gtts')('en')
    const ttsJp = require('node-gtts')('ja')
    const ttsAr = require('node-gtts')('ar')
    if (teks.length > 500) reject('[❗] Teks terlalu panjang!')
    const listBahasa = ['Id', 'En', 'Jp', 'Ar']
    switch(bahasa){
        case 'id':
            await ttsId.save('./assets/tts/resId.mp3', teks, async function () {resolve('./assets/tts/resId.mp3')})
            break
        case 'en':
            await ttsEn.save('./assets/tts/resEn.mp3', teks, async function () {resolve('./assets/tts/resEn.mp3')})
            break
        case 'jp':
            await ttsJp.save('./assets/tts/resJp.mp3', teks, async function () {resolve('./assets/tts/resJp.mp3')})
            break
        case 'ar':
            await ttsAr.save('./assets/tts/resAr.mp3', teks, async function () {resolve('./assets/tts/resAr.mp3')})
            break
        default:
            reject('[❗] Error \nMasukkan data bahasa : [id] untuk indonesia, [en] untuk inggris, [jp] untuk jepang, dan [ar] untuk arab')
    } 
})
const ttp = (teks) => new Promise(async (resolve, reject) => {
    let image = await jimp.read('./assets/ttp/blank.png')
    let font = await jimp.loadFont(jimp.FONT_SANS_128_BLACK)
    const ttpBody = {
        text: teks,
        alignmentX: jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: jimp.VERTICAL_ALIGN_MIDDLE
    }
    image.print(font, 95, 70, ttpBody, 900);
    image.write('./assets/ttp/result.png', async (err) => {
        if(err) reject(err)
        const base64 = await imageToBase64('./assets/ttp/result.png')
        resolve(base64)
    })
})


module.exports = {
    ttp,
    tts,
}