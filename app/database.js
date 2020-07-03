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
    const userCandidateResponse = await axios.get(endpoint, message)

    if (userCandidateResponse) {
        console.debug("userCandidateResponse:\n" + util.inspect(userCandidateResponse, false, null, true) + "\n\n")
    }

    if (userCandidateResponse.data) {
        console.debug("databases response:\n" + util.inspect(userCandidateResponse.data, false, null, true) + "\n\n")
    } else {
        console.debug("no response.data")
    }

    return userCandidateResponse

}

exports.getUser = getUser