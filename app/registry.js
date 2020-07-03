/**
 * registry.js
 *
 * Contributed by:
 *  - Lukas Danckwerth
 */

const axios = require('axios')
const endpoint = process.env.REGISTRY_ENDPOINT || "http://localhost:9922/get-response"
const util = require('util')

async function postMessage(requestBody) {

    console.debug("post message:\n" + util.inspect(requestBody, false, null, true) + "\n\n")
    const response = await axios.post(endpoint, requestBody)

    if (response.data) {
        console.debug("registry response:\n" + util.inspect(response.data, false, null, true) + "\n\n")
    } else {
        console.debug("no response.data")
    }

    return response
}

exports.postMessage = postMessage