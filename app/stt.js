                                          /**
 * stt.js
 *
 * Contributed by:
 *  - Robert Halwaß
 */

var FormData = require('form-data');
const Duplex = require('stream').Duplex;
const axios = require('axios')
const endpoint = process.env.STT_ENDPOINT || "http://stt:7002/stt"

function bufferToStream(buffer) {
    let stream = new Duplex();
    stream.push(buffer);
    stream.push(null);
    return stream;
}

async function getText(file) {
    try {
        var data = new FormData();

        data.append('audio', bufferToStream(file));

        var config = {
        method: 'post',
        url: endpoint,
        headers: { 
            ...data.getHeaders()
        },
            data : data
        };
        const res = await axios(config)
        return res.data;
    }
    catch (e) {
        console.log(e)
    }
}

exports.getText = getText