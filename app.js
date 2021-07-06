const whatsapp = require('@open-wa/wa-automate')
const fse = require('fs-extra')

const msgHandler = require('./message/index')

whatsapp.create({})
 .then((client) => start(client))

const start = (client) => {
    client.onMessage(async (message) => {
        msgHandler(client, message)
    })

    client.onGlobalParticipantsChanged((async (event) => {
        const welcomeGroup = JSON.parse(fse.readFileSync('./database/welcome.json'))
        const iswelcome = welcomeGroup.includes(event.chat)
        try {
            if(event.action == 'add' && iswelcome) {
                const gChat = await client.getChatById(event.chat)
                const pChat = await client.getContact(event.who)
                const { contact, groupMetadata, name } = gChat
                const profilePic = await client.getProfilePicFromServer(event.who)
                const capt = `Halo member baru👋, Selamat datang dan selamat bergabung di grup *${name}* semoga betah di grup ini.`
                if (profilePic == '' || profilePic == undefined) {
                    await client.sendFileFromUrl(event.chat, 'https://h.top4top.io/p_1756rgy1n1.png', 'profile.jpg', capt)
                } else {
                    await client.sendFileFromUrl(event.chat, profilePic, 'profile.jpg', capt)
                } 

            }
        } catch (err) {
            console.log(err)
        }
    }))
    client.onRemovedFromGroup(async (chat) => {
        const welcomeGroup = JSON.parse(fse.readFileSync('./database/welcome.json'))
        for(let i = 0; i < welcomeGroup.length; i++){
            if(welcomeGroup[i] == chat.id){
                welcomeGroup.splice(i, 1)
                fse.writeFileSync('./database/welcome.json', JSON.stringify(welcomeGroup))
                break
            }
        }
        console.log(`Bot was removed from group where id = ${chat.id}`)
    })

}