/**
 * database.js
 *
 * Contributed by:
 *  - Lukas Danckwerth
 */

const axios = require('axios')
const endpoint = process.env.DATABASE_ENDPOINT || "http://localhost:27000/users/find"
const util = require('util')

async function getUser(message) {

    console.debug("getUser message:\n" + util.inspect(message, false, null, true) + "\n\n")

    let filteredMessage = filterMessage(message)

    console.debug("filtered message:\n" + util.inspect(filteredMessage, false, null, true) + "\n\n")


    try {
        const userCandidateResponse = await axios.post(endpoint, filteredMessage)

        if (userCandidateResponse && userCandidateResponse.data) {
            console.debug("databases response:\n" + util.inspect(userCandidateResponse.data, false, null, true) + "\n\n")
            return userCandidateResponse.data
        }
    }
    catch (e) {
        /* ignored exception, probably 404 */
    }

    console.debug("no userCandidateResponse found")
    return null
}

/**
 * Filter to add required attributes for the user-database service to the message.
 * Currently supported:
 *  - Telegram
 *  - Discord
 *  - TODO Website
 * @param message - incoming message
 * @returns message with added messenger and id attributes, nothing will happen if unknown messenger is used
 */
function filterMessage(message){
    // filter for telegram
    if(message.telegramId){
        message.messenger = "telegram"
        message.id = message.telegramId
    }
    // filter for discord
    if(message.serviceUserId){ // defined in the discord_bot service
        message.messenger = "discord"
        message.id = serviceUserId
    }
    // TODO filter for website
    /*if(message.){
        message.messenger = "website"
        message.id =
    }*/

    return message
}

exports.getUser = getUser