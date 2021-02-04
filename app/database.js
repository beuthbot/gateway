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

    try {
        const userCandidateResponse = await axios.post(endpoint, message)

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

exports.getUser = getUser