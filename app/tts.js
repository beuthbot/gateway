/* tts.js
*
* Contributed by:
*  - Robert Halwaß
*/
const fs = require('fs');
const request = require('request')
const endpoint = process.env.TTS_ENDPOINT || "http://tts:7003/tts"

async function sendAudio(user, text, messengerService){
    const timeStamp = Date.now()
    request.post({
            uri: endpoint,
            method: 'POST',
            body: {message: {text}},
            json: true
    })
    .on('error', function (err) {
        // error handling
    })
    .on('finish', function (err) {
        // request is finished
    })
    .pipe(fs.createWriteStream('/usr/src/app/tmp/' + timeStamp + '.ogg')).on('finish', function (err) {
        messengerService.sendFile(user, '/usr/src/app/tmp/' + timeStamp + '.ogg')
        fs.unlinkSync('/usr/src/app/tmp/' + timeStamp + '.ogg')
    });
}

module.exports = sendAudio

