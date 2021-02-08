                                          /**
 * database.js
 *
 * Contributed by:
 *  - Robert Halwaß
 */

var FormData = require('form-data');
const Duplex = require('stream').Duplex;
const fs = require('fs');
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
        //fs.writeFileSync('tmp.ogg', file);
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
        axios(config)
        .then(function (response) {
            return JSON.stringify(response.data);
        })
        .catch(function (error) {
                console.log(error);
        });
    }
    catch (e) {
        /* ignored exception, probably 404 */
        console.log(e)
    }
    console.debug("STT Error")
    return null
}

exports.getText = getText