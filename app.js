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
const express = require('express')
const bodyParser = require('body-parser')
const util = require('util')

const deconcentrator = require('./app/deconcentrator')
const registry = require('./app/registry')
const database = require('./app/database')

const expressApp = express()
// for parsing application/json
expressApp.use(bodyParser.json())
// for parsing application/x-www-form-urlencoded
expressApp.use(bodyParser.urlencoded({ extended: true }))

expressApp.get('/', function(req, res) {
    res.send('Hello from BeuthBot Gateway')
    res.end()
})

// the route the API will call:
expressApp.post('/message', function(req, res) {

    // top JSON object is our message.  see README.md for definition
    const message = req.body
    console.log('incoming message', message)

    // receive actual text of message
    const text = message.text

    // guard the existence of a valid text content
    if (!text || text.length < 1) {
        message.error = "message has no text property"
        message.answer = {
            "content": "Es tut mir leid. Es ist ein interner Fehler aufgetreten.",
            "history": ["gateway"]
        }
        res.json(message)
        res.end();
        return
    }

    const deconcentratorMessage = {}
    deconcentratorMessage.text = text
    deconcentratorMessage.min_confidence_score = 0.50
    deconcentratorMessage.processors = ["rasa"]
    deconcentratorMessage.history = ["gateway"]

    deconcentrator
        .interpretate(deconcentratorMessage)
        .then(function (deconcentratorResponse) {

            return registry.postMessage(deconcentratorResponse.data)

        })
        .then(function (registryResponse) {

            if (!registryResponse || !registryResponse.data) {
                message.answer = {
                    "content": "Es tut mir leid. Es ist ein interner Fehler aufgetreten.",
                    "history": ["gateway"]
                }
                res.json(message)
                res.end()
                return
            }

            const registryAnswer = registryResponse.data

            console.debug("registryAnswer:\n" + util.inspect(registryAnswer, false, null, true) + "\n\n")

            if (registryAnswer.answer.history) {
                registryAnswer.answer.history.push('gateway')
            }

            res.json(registryAnswer)
            res.end()

        })
        .catch(function (error) {
            console.log(error)
            message.error = String(error)
            message.answer = {
                "content": "Es tut mir leid. Es ist ein interner Fehler im Gateway aufgetreten.",
                "history": ["gateway"]
            }
            res.json(message)
            res.end();
        })
})

expressApp.listen(3000, function() {
    console.log('Gateway listening on port 3000!')
})