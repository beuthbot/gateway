/**
 * database.js
 *
 * Contributed by:
 *  - Robert Halwaß
 */

const axios = require('axios')
const endpoint = process.env.STT_ENDPOINT || "http://localhost:7002/stt"


async function getText(file) {
    try {
        var data = new FormData();
        data.append('audio', file);
        var config = {
            method: 'post',
            url: endpoint,
            headers: { 
              ...data.getHeaders()
            },
            data : data
        };
        return await axios(config)
    }
    catch (e) {
        /* ignored exception, probably 404 */
    }
    console.debug("STT Error")
    return null
}

exports.getText = getText