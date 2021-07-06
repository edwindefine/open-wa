const got = require('got')
const fs = require('fs')
const download = require('download')

const config = require('../config.json')

const ytdl = (url) => new Promise((resolve, reject) => {
    console.log(`Get YouTube media from ${url}`)
    got.get(`https://api.i-tech.id/dl/yt?key=${config.itech}&link=${url}`)
        .then(async (res) => {
            resolve(res)
        }).catch((err) => reject(err))
})

module.exports = {
    ytdl
}