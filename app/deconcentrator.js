/**
 * deconcentrator.js
 *
 * Contributed by:
 *  - Lukas Danckwerth
 */

const axios = require('axios')
const endpoint = process.env.DECONCENTRATOR_ENDPOINT || "http://localhost:8338/message"
const util = require('util')

async function interpretate(requestBody) {

    // print function call for debugging purposes
    console.debug("post message in deconcentrator:\n" + util.inspect(requestBody, false, null, true) + "\n\n")

    // await response from gateway
    const response = await axios.post(endpoint, requestBody)

    if (response && response.data) {
        console.debug("deconcentrator response:\n" + util.inspect(response.data, false, null, true) + "\n\n")
    } else {
        console.debug("no response.data")
    }

    return response
}

exports.interpretate = interpretate