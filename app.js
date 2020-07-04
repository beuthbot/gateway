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

const dontKnow = [
    "Das kann ich nicht.",
    "Das weiß ich nicht.",
    "Kein Plan.",
    "Kein Ahnung.",
    "Hier bin ich überfragt.",
    "Da bin ich überfragt.",
    "Seh ich so aus, als ob ich das wüßte.",
    "Wer soll denn sowas wissen.",
    "Wer weiß den sowas.",
    "..."
]

function randomDontKnowAnswer() {
    let randomNumber = Math.floor(Math.random() * dontKnow.length)
    return dontKnow[randomNumber]
}

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
            "content": "Es tut mir leid. Es ist ein interner Fehler im Gateway aufgetreten. Die Nachricht enthält keinen Text.",
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

    database.getUser(message)
        .then(function (user) {
            // console.debug("user:\n" + util.inspect(user, false, null, true) + "\n\n")
            deconcentratorMessage.user = user
            return deconcentrator.interpretate(deconcentratorMessage)
        })
        .then(function (deconcentratorResponse) {

            if (!deconcentratorResponse || !deconcentratorResponse.data) {
                let errorMessage = message
                errorMessage.answer = {
                    "content": "Es tut mir leid. Es ist ein interner Fehler aufgetreten. Der Deconcentrator ist nicht erreichbar.",
                    "history": ["gateway"]
                }
                res.json(errorMessage)
                res.end()
                return
            }

            const intent = deconcentratorResponse.data.intent

            // the bot didn't understand the message
            if (!intent || !intent.name) {
                let errorMessage = message
                errorMessage.answer = {
                    "content": randomDontKnowAnswer(),
                    "history": ["gateway"]
                }
                res.json(errorMessage)
                res.end()

                return
            }

            const registryMessage = deconcentratorResponse.data
            registryMessage.text = deconcentratorMessage.text
            registryMessage.user = deconcentratorMessage.user

            return registry.postMessage(registryMessage)

        })
        .then(function (registryResponse) {

            if (!registryResponse) {
                console.log("no registryResponse")
                return
            }

            if (!registryResponse.data) {
                console.log("no registryResponse.data")
                let errorMessage = message
                errorMessage.answer = {
                    "content": "Es tut mir leid. Es ist ein interner Fehler aufgetreten. Die Registry ist nicht erreichbar.",
                    "history": ["gateway"]
                }
                res.json(errorMessage)
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
            let errorMessage = message
            errorMessage.error = String(error)
            errorMessage.answer = {
                "content": "Es tut mir leid. Es ist ein interner Fehler im Gateway aufgetreten.",
                "history": ["gateway"]
            }
            res.json(errorMessage)
            res.end();
        })
})

expressApp.listen(3000, function() {
    console.log('Gateway listening on port 3000!')
})