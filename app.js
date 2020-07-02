/**
 * BeuthBot Gateway
 *
 * Contributed by:
 *  - Christopher Lehmann
 *  - Timo Bruns
 *  - Lukas Danckwerth
 *
 * Version: 2.1 (01/23/2020)
 */

// load node.js modules
const axios = require('axios')
const util = require('util')

const deconcentratorEndpoint = process.env.DECONCENTRATOR_ENDPOINT || "http://localhost:8338/message"
const registryEndpoint = process.env.REGISTRY_ENDPOINT || "http://localhost:9922/get-response"
const databaseEndpoint = process.env.DATABASE_ENDPOINT || "http://localhost:27000"

// use express app for hadling incoming requests
const express = require('express')
const app = express()

// use body parser to for application/json contents foor express
const bodyParser = require('body-parser')
// for parsing application/json
app.use(bodyParser.json())
// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))



app.get('/', function(req, res) {
    res.send('Hello from BeuthBot Gateway')
    res.end()
})


// the route the API will call:
app.post('/message', function(req, res) {

    // top JSON object is our message.  see README.md for definition
    const message = req.body
    console.log('incoming message', message)

    // receive actual text of message
    const text = message.text

    // guard the existence of a valid text content
    if (!text || text.length < 1) {
        res.json({ "content": "Can't find text message!" })
        // return empty response
        return res.end()
    }

    // step one: send to deconcentrator, hope for the best.
    axios
        .post(deconcentratorEndpoint, { "text": message.text })
        .catch(function (error) {
            console.error("ERROR when requesting deconcentrator. is it running?")
        })
        .then(function (deconcentratorResponse) {

            if (!deconcentratorResponse) {
                res.json({ "error": "no data." })
                res.end()
                return
            }

            const deconcentratorAnswer = deconcentratorResponse.data
            console.log('deconcentratorAnswer: ', deconcentratorAnswer)

            const intent = deconcentratorAnswer.intent

            if (!intent) {
                res.json({ "content": "No intent found." })
                res.end()
                return
            }

            const confidence = intent.confidence
            console.log("found intent: " + intent.name + ", confidence: " + confidence + ".")

            axios.post(registryEndpoint, deconcentratorAnswer)
                .catch(function(error) {
                    console.error(error)
                })
                .then(function(registryResponse) {

                    const registryAnswer = registryResponse.data

                    console.debug("registry answer: \n" + util.inspect(registryAnswer, false, null, true) + "\n\n")

                    if (registryAnswer.answer.history) {
                        registryAnswer.answer.history.push('gateway')
                    }

                    res.json(registryAnswer)
                    res.end()
                })
        })
})

// start running the express application listening on port 3000
app.listen(3000, function() {
    console.log('Gateway listening on port 3000!')
})
