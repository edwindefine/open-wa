

/********** MODULES **********/
const { decryptMedia } = require('@open-wa/wa-automate')
const fs = require('fs')
const config = require('../config.json')
const imageToBase64 = require('image-to-base64');
/********** END MODULES **********/


/********** UTILS **********/
const replyMsg = require('./text/lang/ind')
const {downloader, fetch, misc} = require('../lib')
const {converter} = require('../function')

/********** END UTILS **********/

// fungsi taruh sementara
const moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta').locale('id')
const processTime = (timestamp, now) => {
    return moment.duration(now - moment(timestamp * 1000)).asSeconds()
}


/********** MESSAGE HANDLER **********/
module.exports = msgHandler = async (client, message) => {

    const { type, id, from, t, sender, isGroupMsg, chat, isMedia, duration, mimetype, quotedMsg, mentionedJidList} = message
    let { body, caption } = message
    let { pushname, verifiedName, formattedName } = sender
    pushname = pushname || verifiedName || formattedName
    const groupId = isGroupMsg ? chat.groupMetadata.id : ''
    const botNumber = await client.getHostNumber() + '@c.us' //bot number
    const groupAdmins = isGroupMsg ? await client.getGroupAdmins(groupId) : '' //list of admin group number
    const groupMembers = isGroupMsg ? await client.getGroupMembersId(groupId) : '' //list of member group number
    
    const userMsg = caption || body || '';
    const command = userMsg.toLowerCase().split(" ")[0];
    const args = userMsg.split(" ");
    const prefix = /^[π×£€¥!#$^./\\©^]/.test(command) ? command.match(/^[π×£€¥!#$^./\\©^]/gi) : '-' 
    const uaOverride = config.uaOverride

    const contentBody = userMsg.slice(args[0].length+1)
    const emptyContent = !contentBody
    const stickerPackName = contentBody ? contentBody : config.sticker.packname;

    /********** VALIDATOR **********/
    const isGroupAdmins = isGroupMsg ? groupAdmins.includes(sender.id) : false //is sender admin?
    const isBotGroupAdmins = isGroupMsg ? groupAdmins.includes(botNumber) : false // is bot admin?
    const isQuotedImage = quotedMsg && quotedMsg.type === 'image'
    const isQuotedVideo = quotedMsg && quotedMsg.type === 'video'
    const isQuotedSticker = quotedMsg && quotedMsg.type === 'sticker'
    const isQuotedGif = quotedMsg && quotedMsg.mimetype === 'image/gif'
    const isQuotedAudio = quotedMsg && quotedMsg.type === 'audio'
    const isQuotedVoice = quotedMsg && quotedMsg.type === 'ptt'
    const isImage = type === 'image'
    const isVideo = type === 'video'
    const isAudio = type === 'audio'
    const isVoice = type === 'ptt'
    const isGif = mimetype === 'image/gif'
    let isYtUrl = args[1] ? args[1].match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/) : false

    /********** END VALIDATOR **********/

    


    switch(command){

    /*##  Main  ##*/
    case prefix+'menu':
    case prefix+'help':
        await client.reply(from, replyMsg.menu(body[0], pushname),id)
        break

    
    /**  Downloader  **/
        // case prefix+'ytmp3':
        //     if(emptyContent) return client.reply(from, replyMsg.validMsg.ytmp3, id)
        //     if(!isLinkYt) return client.reply(from, replyMsg.err.invalidLink, id)
        //     await client.reply(from, replyMsg.wait, id)
        //     downloader.ytdl(contentBody)
        //         .then(async (res) => {
        //             if (res.status === 'error') {
        //                 await client.reply(from, res.pesan, id)
        //             } else if (res.size && Number(res.size.split(' MB')[0]) >=30) {
        //                 await client.reply(from, replyMsg.err.videoLimit, id)
        //             } else {
        //                 await client.sendFileFromUrl(from, res.thumbnail, `${res.title}.jpg`, replyMsg.msgContent.ytFound(res), id)
        //                 await client.sendFileFromUrl(from, res.url_audio, `${res.title}.mp3`, '', id)
        //                 console.log('Success sending YouTube mp3!')
        //             }
        //         }).catch(async (err) => {
        //             console.log(err)
        //             await client.reply(from, replyMsg.err.msg, id)
        //         })
        //     break 
        // case prefix+'ytmp4':
        //     if(emptyContent) return client.reply(from, replyMsg.validMsg.ytmp4, id)
        //     if(!isLinkYt) return client.reply(from, replyMsg.err.invalidLink, id)
        //     await client.reply(from, replyMsg.wait, id) 
        //     downloader.ytdl(contentBody)
        //         .then(async (res) => {
        //             if (res.status === 'error') {
        //                 await client.reply(from, res.pesan, id)
        //             } else if (res.size && Number(res.size.split(' MB')[0]) >= 30) {
        //                 await client.reply(from, replyMsg.err.videoLimit, id)
        //             } else {
        //                 await client.sendFileFromUrl(from, res.thumbnail, `${res.title}.jpg`, replyMsg.msgContent.ytFound(res), id)
        //                 await client.sendFileFromUrl(from, res.url_video, `${res.title}.mp4`, '', id)
        //                 console.log('Success sending YouTube mp4!')
        //             }
        //         }).catch(async (err) => {
        //             console.log(err)
        //             client.reply(from, replyMsg.err.msg, id)
        //         })
        //     break
        
 
        /**  Group Features  **/
        case prefix+'add':

            if(!isGroupMsg) return client.reply(from, replyMsg.groupFt.groupOnly, id)
            else if(!isGroupAdmins) return client.reply(from, replyMsg.groupFt.adminOnly, id)
            else if(!isBotGroupAdmins) return client.reply(from, replyMsg.groupFt.botNotAdmin, id)
            else if (emptyContent) return client.reply(from, '[✘] Silakan masukan nomor!', id)
            try{
                let userId = await converter.numberValidation(contentBody);
                let isUser = await client.getContact(userId)
                if(!isUser) return client.reply(from, '[✘] Mohon masukan nomor yang valid!', id)
                if(userId === botNumber || groupMembers.includes(userId)) return client.reply(from, '[✘] User sudah berada dalam group!', id)
                await client.addParticipant(groupId, userId)
                await client.sendTextWithMentions(from, `[✔️] Perintah diterima! menambahkan @${userId} ke grup.`)
            }catch (err) {
                // console.log(err)
                // await client.reply(from, replyMsg.err.msg, id)
                await client.sendTextWithMentions(from, `[❗] @${userId} menolak untuk ditambahkan ke grup`, id)
            }
            break
        case prefix+'kick':
            if(!isGroupMsg) return client.reply(from, replyMsg.groupFt.groupOnly, id)
            else if(!isGroupAdmins) return client.reply(from, replyMsg.groupFt.adminOnly, id)
            else if(!isBotGroupAdmins) return client.reply(from, replyMsg.groupFt.botNotAdmin, id)
            try{
                if (mentionedJidList.length !== 1) client.reply(from, '[✘] Maaf, silakan pilih/tandai 1 anggota', id)
                else if (groupAdmins.includes(mentionedJidList[0])) client.reply(from, '[✘] Maaf, tidak bisa menendang admin dari grup', id)
                else if (args[1] === botNumber) client.reply(from, '[✘] Maaf, tidak bisa kick bot', id)
                else{
                    await client.removeParticipant(groupId, mentionedJidList[0])
                    await client.sendTextWithMentions(from, `[✔️] Perintah diterima! menendang @${mentionedJidList[0].replace('@c.us', '')} dari grup.`)
                }
            }catch (err) {
                console.log(err)
                await client.reply(from, replyMsg.err.msg, id)
            }
            break
        case prefix+'promote':
            if(!isGroupMsg) return client.reply(from, replyMsg.groupFt.groupOnly, id)
            else if(!isGroupAdmins) return client.reply(from, replyMsg.groupFt.adminOnly, id)
            else if(!isBotGroupAdmins) return client.reply(from, replyMsg.groupFt.botNotAdmin, id)
            if (mentionedJidList.length !== 1) return client.reply(from, '[✘] Maaf, silakan pilih/tandai 1 anggota', id)
            await client.promoteParticipant(groupId, mentionedJidList[0])
            await client.sendTextWithMentions(from, `[✔️] Perintah diterima! menambahkan @${mentionedJidList[0].replace('@c.us', '')} sebagai admin.`)
            break
        case prefix+'demote':
            if(!isGroupMsg) return client.reply(from, replyMsg.groupFt.groupOnly, id)
            else if(!isGroupAdmins) return client.reply(from, replyMsg.groupFt.adminOnly, id)
            else if(!isBotGroupAdmins) return client.reply(from, replyMsg.groupFt.botNotAdmin, id)
            if (mentionedJidList.length !== 1) return client.reply(from, '[✘] Maaf, silakan pilih/tandai 1 admin', id)
            await client.demoteParticipant(groupId, mentionedJidList[0])
            await client.sendTextWithMentions(from, `[✔️] Perintah diterima! menarik gelar @${mentionedJidList[0].replace('@c.us', '')} sebagai admin.`)
            break
        case prefix+'linkgc':
        case prefix+'linkgroup':
        case prefix+'grouplink':
            if(!isGroupMsg) return client.reply(from, replyMsg.groupFt.groupOnly, id)
            else if(!isGroupAdmins) return client.reply(from, replyMsg.groupFt.adminOnly, id)
            else if(!isBotGroupAdmins) return client.reply(from, replyMsg.groupFt.botNotAdmin, id)
            await client.getGroupInviteLink(groupId)
                .then(async (res) => {await client.reply(from, res+'\n\nLink invite grup *'+chat.contact.name+'*', id)})
                .catch((err) => {
                    console.log(err)
                })            
            break
        case prefix+'pesanwelcome':
        case prefix+'welcomemsg':
        case prefix+'setwelcome':
            if(!isGroupMsg) return client.reply(from, replyMsg.groupFt.groupOnly, id)
            else if(!isGroupAdmins) return client.reply(from, replyMsg.groupFt.adminOnly, id)
            else if (emptyContent) return client.reply(from, replyMsg.validMsg.welcomeMsg, id)
            const welcomeGroup = JSON.parse(fs.readFileSync('./database/welcome.json'))
            if (contentBody.toLowerCase() === 'enable' || contentBody.toLowerCase() === 'aktif') {
                for(let i = 0; i < welcomeGroup.length; i++){
                    if(welcomeGroup[i] == chat.id){
                        await client.reply(from, replyMsg.groupFt.welcomeMsgIsOn, id)
                        return
                    }
                }
                welcomeGroup.push(chat.id)
                fs.writeFileSync('./database/welcome.json', JSON.stringify(welcomeGroup))
                await client.reply(from, replyMsg.groupFt.welcomeMsgOn, id)   
            } else if (contentBody.toLowerCase() === 'disable' || contentBody.toLowerCase() === 'nonaktif') {
                for(let i = 0; i < welcomeGroup.length; i++){
                    if(welcomeGroup[i] == chat.id){
                        welcomeGroup.splice(i, 1)
                        fs.writeFileSync('./database/welcome.json', JSON.stringify(welcomeGroup))
                        await client.reply(from, replyMsg.groupFt.welcomeMsgOff, id)
                        return
                    }
                }
                await client.reply(from, replyMsg.groupFt.welcomeMsgIsOff, id)
            } else {
                client.reply(from, 'Pilih *aktif* atau *nonaktif* saja Bambank!', id)
            }
            break


        /**  Converter Menu  **/
        case prefix+'stiker':
        case prefix+'sticker':
            if (isMedia && isImage || isQuotedImage) {
                await client.reply(from, replyMsg.wait, id)
                const encryptMedia = isQuotedImage ? quotedMsg : message
                const mediaData = await decryptMedia(encryptMedia, uaOverride)
                const _mimetype = isQuotedImage ? quotedMsg.mimetype : mimetype
                const imageBase64 = `data:${_mimetype};base64,${mediaData.toString('base64')}`
                const stickerMetadata = {
                    author: config.sticker.author,
                    pack: stickerPackName,
                    keepScale: true,
                }
                await client.sendImageAsSticker(from, imageBase64, stickerMetadata)
                console.log(`Sticker processed for ${processTime(t, moment())} seconds`)
            } else {
                await client.reply(from, replyMsg.err.wrongFormat, id)
            }
            break
        case prefix+'sgif':
        case prefix+'stikergif':
        case prefix+'stickergif':
            if (isMedia && isVideo || isGif || isQuotedVideo || isQuotedGif) {
                if(duration > 5) return client.reply(from, replyMsg.err.videoLimit, id)
                await client.reply(from, replyMsg.wait, id)
                try {
                    const encryptMedia = isQuotedGif || isQuotedVideo ? quotedMsg : message
                    const mediaData = await decryptMedia(encryptMedia, uaOverride)
                    const videoBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
                    const sgifMetadata = {
                        author: config.sticker.author,
                        pack: stickerPackName, 
                        fps: 30, 
                        startTime: '00:00:00.0', 
                        endTime : '00:00:05.0', 
                        crop: false, 
                        keepScale: true,
                        loop: 0 
                    }
                    await client.sendMp4AsSticker(from, videoBase64, null, sgifMetadata)
                        .then(() => {console.log(`Sgif processed for ${processTime(t, moment())} seconds`)})
                } catch (err) {
                    console.error(err)
                    await client.reply(from, replyMsg.err.msg, id)
                }
            } else {
                await client.reply(from, replyMsg.err.wrongFormat, id)
            }
            break
        case prefix+'toimg':
        case prefix+'stickertoimg':
        case prefix+'stikertoimg':
            if (isQuotedSticker) {
                await client.reply(from, replyMsg.wait, id)
                try {
                    const mediaData = await decryptMedia(quotedMsg, uaOverride)
                    const imageBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`
                    await client.sendFile(from, imageBase64, 'stickerToImg.jpg', '[✔️] Image berhasil diconvert...', id)
                } catch (err) {
                    console.error(err)
                    await client.reply(from, replyMsg.err.msg, id)
                }
            } else {
                await client.reply(from, replyMsg.err.toImg, id)
            }
            break
        case prefix+'tts':
            if(args.length <= 2 || args[2] === undefined) return client.reply(from, replyMsg.validMsg.tts, id)
            await client.reply(from, replyMsg.wait, id)
            misc.tts(args[1].toLowerCase(), userMsg.toLowerCase().slice(8))
                .then(async (res) => {
                    await client.sendPtt(from, res, id)
                }).catch(async (err) => {
                    client.reply(from, err, id)
                })
            break
        case prefix+'ttp':
            if(emptyContent) return client.reply(from, replyMsg.validMsg.ttp, id)
            await client.reply(from, replyMsg.wait, id)
            misc.ttp(contentBody)
                .then(async (res) => {
                    const imageBase64 = res
                    const stickerMetadata = {
                        author: config.sticker.author,
                        pack: 'NOPE',
                        keepScale: true,
                    }
                    await client.sendImageAsSticker(from, imageBase64, stickerMetadata)
                    console.log(`ttp processed for ${processTime(t, moment())} seconds`)
                }) .catch((err) => {
                    console.log(err)
                    client.reply(from, replyMsg.err.msg, id)
                })
            break


        /**  Anime **/
        case prefix+'wallanime':
            await client.reply(from, replyMsg.wait, id)
            fetch.wallanime()
                .then(async (res) => {
                    await client.sendFileFromUrl(from, res.url, 'wallanime.jpg', "[✔️] WallAnimenya tuan...")
                }).catch((err) => {
                    client.reply(from, replyMsg.err.msg, id)
                })
            break
        // case prefix+'neko':
        //     await client.reply(from, replyMsg.wait, id)
        //     fetch.neko()
        //         .then(async (res) => {
        //             await client.sendFileFromUrl(from, res.url, 'neko.jpg', "[✔️] WallAnime Imagenya tuan...")
        //         }).catch((err) => {
        //             client.reply(from, replyMsg.err.msg, id)
        //         })
        //     break
        // case prefix+'hentai':
        //     await client.reply(from, replyMsg.wait, id)
        //     fetch.hentai()
        //         .then(async (res) => {
        //             await client.sendFileFromUrl(from, res.url, 'hentai.jpg', "[✔️] WallAnime Imagenya tuan...")
        //         }).catch((err) => {
        //             client.reply(from, replyMsg.err.msg, id)
        //         })
        //     break

        /**  Image Fetcher **/
        case prefix+'unplas':
            await client.reply(from, replyMsg.wait, id)
            fetch.unplas()
                .then( async (res) => {
                    await client.sendFileFromUrl(from, res.urls.regular, 'unplasImg.jpg', "[✔️] Unplas Imagenya tuan...")
                }).catch((err) => {
                    client.reply(from, replyMsg.err.msg, id)
                })
            break
        case prefix+'alphacoders':
        case prefix+'alphacoder':
            if(emptyContent) return client.reply(from, replyMsg.validMsg.alphacoders, id)
            await client.reply(from, replyMsg.wait, id)
            fetch.alphacoders(contentBody)
                .then(async (res) => {
                    if(!res.result.wallpaper) return client.reply(from, '[✘] tidak bisa menemukan hasil *404 NOT FOUND*', id)
                    let getRandom = Math.floor(Math.random() * res.result.wallpaper.length)
                    let random = getRandom == 0 ? 0 : getRandom -= 1
                    let alphacodersImage = res.result.wallpaper[random].url_image;
                    if(alphacodersImage.endsWith('.png')){
                        await client.sendFileFromUrl(from, alphacodersImage, 'alphacoders.png', "[✔️] alphacoders imagenya tuan..", id)
                    } 
                    else{
                        await client.sendFileFromUrl(from, alphacodersImage, 'alphacoders.jpg', "[✔️] alphacoders imagenya tuan..", id)
                    }
                }) .catch((err) => {
                    client.reply(from, replyMsg.err.err404, id)
                })
            break
        case prefix+'wiki':
            if(emptyContent) return client.reply(from, replyMsg.validMsg.wiki, id)
            await client.reply(from, replyMsg.wait, id)
            fetch.wiki(contentBody)
                .then(async (wiki) => {
                    let textBody = `[✔️] jawaban ditemukan.\n\n*Pertanyaan*:${contentBody}\n*Hasil*:\n${wiki.result.wiki}`
                    await client.reply(from, textBody, id)
                }) .catch((err) => {
                    // client.sendFileFromUrl(from, 'https://i.top4top.io/p_1752fl1jm1.jpg', 'notFound.jpg', replyMsg.err.err404, id)
                    client.reply(from, replyMsg.err.err404, id)
                })
            break
        case prefix+'brainly':
            if (emptyContent) return client.reply(from, 'Soalnya?', id)
            await client.reply(from, replyMsg.wait, id)
            fetch.brainly(contentBody)
                .then(async (brainly) => {
                    await client.reply(from, brainly, id)
                }) .catch((err) => {
                    client.reply(from, replyMsg.err.err404, id)
                })
            break
        case prefix+'lirik':
            if(emptyContent) return client.reply(from, replyMsg.validMsg.wiki, id)
            await client.reply(from, replyMsg.wait, id)
            fetch.wiki(contentBody)
                .then(async (wiki) => {
                    let textBody = `[✔️] jawaban ditemukan.\n\n*Judul*:${contentBody}\n*Hasil*:\n${wiki.result.wiki}`
                    await client.reply(from, textBody, id)
                }) .catch((err) => {
                    client.reply(from, replyMsg.err.err404, id)
                })
            break
        case prefix+'covid':
            if(emptyContent) return client.reply(from, replyMsg.validMsg.covid, id)
            await client.reply(from, replyMsg.wait, id)
            fetch.covid(contentBody)
                .then(async (res) => {
                    res = res.result.covid
                    let bodyText = `➸ Daerah: *${res.key}* \n\n┠❥ Jumlah Kasus: ${res.jumlah_kasus}\n┠❥ Jumlah Sembuh: ${res.jumlah_sembuh}\n┠❥ Jumlah Meninggal: ${res.jumlah_meninggal}\n┠❥ Jumlah Dirawat: ${res.jumlah_dirawat}\n┠❥ Penambahan: \n    ➸ positif: ${res.penambahan.positif}\n    ➸ sembuh: ${res.penambahan.sembuh}\n    ➸ positif: ${res.penambahan.meninggal}`
                    await client.reply(from, bodyText, id)
                }).catch((err) => {
                    client.reply(from, replyMsg.err.err404, id);
                })
            break
        
        case prefix+'cuaca':

            break

     
        /**  Misc  **/
        
        case prefix+'koin':
            try{
                let random = Math.floor(Math.random() * 10)
                let imageBase64 = await imageToBase64('./assets/image/koinDepan.png')
                if(random < 5) imageBase64 = await imageToBase64('./assets/image/koinBelakang.png')
                await client.sendImageAsSticker(from, imageBase64, {author: 'Anbug476 Bot', pack: 'Koin'})
            }
            catch{
                client.reply(from, replyMsg.err.msg, id);
            }
            break


        /**  Kerang Menu  **/
        case prefix+'kapan':
        case prefix+'kapankah':
            try{
                client.sendTextWithMentions(from,`*Pertanyaan:* kapankah ${contentBody}\n*Jawaban:* ${Math.floor(Math.random()*10)} ${config.kerangMenu.kapankah[Math.floor(Math.random()*config.kerangMenu.kapankah.length)]} lagi ...`, id)
            }
            catch{
                client.reply(from, replyMsg.err.msg, id);
            }
            break
        case prefix+'apakah':
            try{
                client.sendTextWithMentions(from,`*Pertanyaan:* apakah ${contentBody}\n*Jawaban:* ${config.kerangMenu.apakah[Math.floor(Math.random()*config.kerangMenu.apakah.length)]}`, id)
            }
            catch{
                client.reply(from, replyMsg.err.msg, id);
            }
            break
        
        
    }
}